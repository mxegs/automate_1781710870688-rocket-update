/** Mailchimp Marketing API — newsletters & email broadcasts */

export interface MailchimpSendResult {
  success: boolean;
  campaignId?: string;
  sent?: number;
  error?: string;
  demo?: boolean;
}

interface MailchimpConfig {
  apiKey: string;
  server: string;
  audienceId: string;
  fromName: string;
  fromEmail: string;
  replyTo: string;
}

interface MailchimpListInfo {
  name: string;
  double_optin?: boolean;
  campaign_defaults?: {
    from_name?: string;
    from_email?: string;
    subject?: string;
    language?: string;
  };
}

interface MailchimpBatchResult {
  new_members?: unknown[];
  updated_members?: unknown[];
  errors?: { email_address?: string; error?: string }[];
  error_count?: number;
  total_created?: number;
  total_updated?: number;
}

interface MailchimpMergeField {
  tag: string;
  name: string;
  type: string;
  required: boolean;
}

function getConfig(): MailchimpConfig | null {
  const apiKey = process.env.MAILCHIMP_API_KEY?.trim();
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID?.trim();
  if (!apiKey || !audienceId) return null;

  const parts = apiKey.split('-');
  const server = process.env.MAILCHIMP_SERVER_PREFIX?.trim() || parts[parts.length - 1];
  if (!server) return null;

  const replyTo =
    process.env.MAILCHIMP_REPLY_TO?.trim() ||
    process.env.SUPER_ADMIN_EMAIL?.trim() ||
    '';

  return {
    apiKey,
    server,
    audienceId,
    fromName: process.env.MAILCHIMP_FROM_NAME?.trim() || 'Christ Kingdom Citizens',
    fromEmail: process.env.MAILCHIMP_FROM_EMAIL?.trim() || replyTo,
    replyTo,
  };
}

function formatMailchimpError(data: unknown, status?: number, step?: string): string {
  const body = data as {
    detail?: string;
    title?: string;
    errors?: { field?: string; message?: string }[];
  };

  const parts: string[] = [];
  if (step) parts.push(step);
  if (status) parts.push(`HTTP ${status}`);
  if (body.detail) parts.push(body.detail);
  if (body.errors?.length) {
    for (const e of body.errors) {
      parts.push(`${e.field ?? 'field'}: ${e.message ?? 'invalid'}`);
    }
  }
  if (parts.length > 0) return parts.join(' — ');
  return body.title ?? 'Mailchimp request failed';
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Compact HTML — large or multi-line templates can trigger Mailchimp 504 timeouts. */
export function buildBroadcastEmailHtml(subject: string, body: string): string {
  const safeSubject = escapeHtml(subject);
  const paragraphs = body
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join('');

  return `<!DOCTYPE html><html><body style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1a1a;"><h1 style="color:#c9a227;">${safeSubject}</h1>${paragraphs}<p style="font-size:12px;color:#888;">Christ Kingdom Citizens</p></body></html>`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const RETRYABLE_STATUS = new Set([429, 502, 503, 504]);

async function mailchimpFetch<T>(
  config: MailchimpConfig,
  path: string,
  init?: RequestInit,
  step?: string,
): Promise<T> {
  const maxAttempts = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(`https://${config.server}.api.mailchimp.com/3.0${path}`, {
      ...init,
      headers: {
        Authorization: `apikey ${config.apiKey}`,
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      return data as T;
    }

    lastError = new Error(formatMailchimpError(data, res.status, step));
    if (!RETRYABLE_STATUS.has(res.status) || attempt === maxAttempts) {
      throw lastError;
    }

    await sleep(attempt * 1500);
  }

  throw lastError ?? new Error(step ?? 'Mailchimp request failed');
}

function resolveFromSettings(
  config: MailchimpConfig,
  list: MailchimpListInfo,
): { fromEmail: string; fromName: string; replyTo: string } {
  // Prefer Mailchimp audience defaults — they are verified in your account
  const fromEmail = list.campaign_defaults?.from_email || config.fromEmail;
  const fromName = list.campaign_defaults?.from_name || config.fromName || 'CKC';
  const replyTo = config.replyTo || fromEmail;
  return { fromEmail, fromName, replyTo };
}

async function getListInfo(config: MailchimpConfig): Promise<MailchimpListInfo> {
  return mailchimpFetch<MailchimpListInfo>(config, `/lists/${config.audienceId}`);
}

async function getAudienceMergeFields(config: MailchimpConfig): Promise<MailchimpMergeField[]> {
  const data = await mailchimpFetch<{ merge_fields?: MailchimpMergeField[] }>(
    config,
    `/lists/${config.audienceId}/merge-fields?count=100`,
  );
  return data.merge_fields ?? [];
}

/** Only send merge tags that exist on this audience — avoids "merge fields were invalid" errors. */
function buildMergeFields(
  fullName: string,
  mergeFields: MailchimpMergeField[],
): Record<string, string> {
  const tags = new Set(mergeFields.map((f) => f.tag));
  const result: Record<string, string> = {};
  const [firstName, ...rest] = fullName.trim().split(/\s+/);
  const lastName = rest.join(' ');

  if (tags.has('FNAME')) {
    result.FNAME = firstName || fullName || 'Member';
  }
  if (tags.has('LNAME')) {
    // Mailchimp rejects empty text merge fields
    result.LNAME = lastName || ' ';
  }

  for (const field of mergeFields) {
    if (field.required && field.type === 'text' && result[field.tag] == null) {
      result[field.tag] = ' ';
    }
  }

  return result;
}

/** Add/update recipients on the Mailchimp audience before sending */
async function syncRecipientsToAudience(
  config: MailchimpConfig,
  recipients: { email: string; name: string }[],
  doubleOptIn: boolean,
): Promise<{ synced: number; warnings: string[] }> {
  const audienceMergeFields = await getAudienceMergeFields(config);

  const members = recipients.map((r) => {
    const merge_fields = buildMergeFields(r.name, audienceMergeFields);
    return {
      email_address: r.email,
      status: 'subscribed' as const,
      ...(Object.keys(merge_fields).length > 0 ? { merge_fields } : {}),
    };
  });

  const batch = await mailchimpFetch<MailchimpBatchResult>(
    config,
    `/lists/${config.audienceId}?skip_merge_validation=true`,
    {
      method: 'POST',
      body: JSON.stringify({
        members,
        update_existing: true,
      }),
    },
    'Adding contacts to audience',
  );

  const warnings: string[] = [];
  const errorCount = batch.error_count ?? batch.errors?.length ?? 0;
  if (errorCount > 0) {
    const details = (batch.errors ?? [])
      .slice(0, 5)
      .map((e) => `${e.email_address ?? 'email'}: ${e.error ?? 'failed'}`)
      .join('; ');
    throw new Error(`Could not add contacts to Mailchimp audience — ${details}`);
  }

  const synced = (batch.total_created ?? 0) + (batch.total_updated ?? 0);
  if (synced === 0 && recipients.length > 0) {
    warnings.push('Mailchimp did not report new or updated contacts (they may already exist).');
  }

  if (doubleOptIn) {
    warnings.push(
      'This Mailchimp audience uses double opt-in. New contacts stay "pending" until they confirm — they will NOT receive campaigns until confirmed. Turn off double opt-in under Audience → Settings → Form settings, or confirm each contact in Mailchimp.',
    );
  }

  return { synced, warnings };
}

async function setCampaignContent(
  config: MailchimpConfig,
  campaignId: string,
  html: string,
  plainText: string,
): Promise<void> {
  const payloads = [
    { html, plain_text: plainText },
    { html },
    { plain_text: plainText },
  ];

  let lastError: Error | null = null;
  for (const [index, payload] of payloads.entries()) {
    try {
      await mailchimpFetch(
        config,
        `/campaigns/${campaignId}/content`,
        {
          method: 'PUT',
          body: JSON.stringify(payload),
        },
        index === 0 ? 'Setting campaign content' : 'Setting campaign content (retry)',
      );
      return;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Setting campaign content failed');
      const retryable = lastError.message.includes('HTTP 504') || lastError.message.includes('HTTP 502');
      if (!retryable || index === payloads.length - 1) {
        throw lastError;
      }
    }
  }

  throw lastError ?? new Error('Setting campaign content failed');
}

export function isMailchimpConfigured(): boolean {
  return getConfig() !== null;
}

export async function testMailchimpConnection(): Promise<{
  ok: boolean;
  listName?: string;
  fromEmail?: string;
  doubleOptIn?: boolean;
  warning?: string;
  error?: string;
}> {
  const config = getConfig();
  if (!config) return { ok: false, error: 'Mailchimp not configured in .env' };

  try {
    const list = await getListInfo(config);
    const { fromEmail, fromName, replyTo } = resolveFromSettings(config, list);
    if (!fromEmail) {
      return {
        ok: false,
        error:
          'Mailchimp audience has no default From email. Set it under Audience → Settings → Email settings.',
      };
    }

    let warning: string | undefined;
    if (list.double_optin) {
      warning =
        'Double opt-in is ON for this audience — new contacts must confirm before they receive email broadcasts.';
    }
    if (config.fromEmail && list.campaign_defaults?.from_email && config.fromEmail !== list.campaign_defaults.from_email) {
      warning = [
        warning,
        `Using Mailchimp default from ${list.campaign_defaults.from_email} (not ${config.fromEmail} from .env).`,
      ]
        .filter(Boolean)
        .join(' ');
    }

    return { ok: true, listName: list.name, fromEmail, doubleOptIn: list.double_optin, warning };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Connection failed' };
  }
}

export async function sendMailchimpBroadcast(input: {
  subject: string;
  html: string;
  plainText?: string;
  recipients: { email: string; name: string }[];
}): Promise<MailchimpSendResult & { warnings?: string[] }> {
  const config = getConfig();
  if (!config) {
    return { success: false, error: 'MAILCHIMP_API_KEY and MAILCHIMP_AUDIENCE_ID required in .env' };
  }

  const emails = input.recipients
    .map((r) => ({ email: r.email.trim().toLowerCase(), name: r.name.trim() }))
    .filter((r) => r.email.includes('@'));

  if (emails.length === 0) {
    return {
      success: false,
      error:
        'No recipients with email addresses in the app. Add members with emails in Supabase (members table) first.',
    };
  }

  if (process.env.EMAIL_PROVIDER === 'demo') {
    console.info('[CKC Mailchimp demo]', input.subject, `→ ${emails.length} recipients`);
    return { success: true, sent: emails.length, demo: true };
  }

  try {
    const list = await getListInfo(config);
    const { fromEmail, fromName, replyTo } = resolveFromSettings(config, list);

    if (!fromEmail) {
      return {
        success: false,
        error:
          'Missing From email. In Mailchimp go to Audience → Settings → Email settings → Default from email.',
      };
    }

    const sync = await syncRecipientsToAudience(config, emails, !!list.double_optin);

    const segmentName = `CKC Broadcast ${Date.now()}`;
    const segment = await mailchimpFetch<{ id: number }>(
      config,
      `/lists/${config.audienceId}/segments`,
      {
        method: 'POST',
        body: JSON.stringify({
          name: segmentName,
          static_segment: emails.map((r) => r.email),
        }),
      },
      'Creating recipient segment',
    );

    const campaign = await mailchimpFetch<{ id: string }>(
      config,
      '/campaigns',
      {
        method: 'POST',
        body: JSON.stringify({
          type: 'regular',
          recipients: {
            list_id: config.audienceId,
            segment_opts: {
              saved_segment_id: segment.id,
              match: 'all',
            },
          },
          settings: {
            subject_line: input.subject,
            title: segmentName,
            from_name: fromName,
            from_email: fromEmail,
            reply_to: replyTo,
          },
        }),
      },
      'Creating campaign',
    );

    await setCampaignContent(config, campaign.id, input.html, input.plainText ?? input.subject);

    await mailchimpFetch(
      config,
      `/campaigns/${campaign.id}/actions/send`,
      { method: 'POST' },
      'Sending campaign',
    );

    return {
      success: true,
      campaignId: campaign.id,
      sent: emails.length,
      warnings: sync.warnings.length > 0 ? sync.warnings : undefined,
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Mailchimp send failed' };
  }
}
