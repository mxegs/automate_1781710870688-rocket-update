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
  campaign_defaults?: {
    from_name?: string;
    from_email?: string;
    subject?: string;
    language?: string;
  };
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

function formatMailchimpError(data: unknown): string {
  const body = data as {
    detail?: string;
    title?: string;
    errors?: { field?: string; message?: string }[];
  };

  const parts: string[] = [];
  if (body.detail) parts.push(body.detail);
  if (body.errors?.length) {
    for (const e of body.errors) {
      parts.push(`${e.field ?? 'field'}: ${e.message ?? 'invalid'}`);
    }
  }
  if (parts.length > 0) return parts.join(' — ');
  return body.title ?? 'Mailchimp request failed';
}

async function mailchimpFetch<T>(
  config: MailchimpConfig,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`https://${config.server}.api.mailchimp.com/3.0${path}`, {
    ...init,
    headers: {
      Authorization: `apikey ${config.apiKey}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(formatMailchimpError(data));
  }
  return data as T;
}

async function getListInfo(config: MailchimpConfig): Promise<MailchimpListInfo> {
  return mailchimpFetch<MailchimpListInfo>(config, `/lists/${config.audienceId}`);
}

/** Add/update recipients on the Mailchimp audience before sending */
async function syncRecipientsToAudience(
  config: MailchimpConfig,
  recipients: { email: string; name: string }[],
): Promise<void> {
  const members = recipients.map((r) => {
    const [firstName, ...rest] = r.name.split(' ');
    return {
      email_address: r.email,
      status: 'subscribed' as const,
      merge_fields: {
        FNAME: firstName || r.name,
        LNAME: rest.join(' ') || '',
      },
    };
  });

  await mailchimpFetch(config, `/lists/${config.audienceId}`, {
    method: 'POST',
    body: JSON.stringify({
      members,
      update_existing: true,
    }),
  });
}

export function isMailchimpConfigured(): boolean {
  return getConfig() !== null;
}

export async function testMailchimpConnection(): Promise<{
  ok: boolean;
  listName?: string;
  fromEmail?: string;
  error?: string;
}> {
  const config = getConfig();
  if (!config) return { ok: false, error: 'Mailchimp not configured in .env' };

  try {
    const list = await getListInfo(config);
    const fromEmail = config.fromEmail || list.campaign_defaults?.from_email;
    if (!fromEmail) {
      return {
        ok: false,
        error:
          'Mailchimp audience has no default From email. Add MAILCHIMP_FROM_EMAIL=your-verified-email@gmail.com to .env',
      };
    }
    return { ok: true, listName: list.name, fromEmail };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Connection failed' };
  }
}

export async function sendMailchimpBroadcast(input: {
  subject: string;
  html: string;
  plainText?: string;
  recipients: { email: string; name: string }[];
}): Promise<MailchimpSendResult> {
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
    const fromEmail = config.fromEmail || list.campaign_defaults?.from_email;
    const replyTo = config.replyTo || fromEmail;

    if (!fromEmail) {
      return {
        success: false,
        error:
          'Missing From email. In Mailchimp go to Audience → Settings → set Default from email, OR add MAILCHIMP_FROM_EMAIL=aiwealthlogic@gmail.com to .env (must be verified in Mailchimp).',
      };
    }

    await syncRecipientsToAudience(config, emails);

    const segmentName = `CKC Broadcast ${Date.now()}`;
    const segment = await mailchimpFetch<{ id: number }>(config, `/lists/${config.audienceId}/segments`, {
      method: 'POST',
      body: JSON.stringify({
        name: segmentName,
        static_segment: emails.map((r) => r.email),
      }),
    });

    const campaign = await mailchimpFetch<{ id: string }>(config, '/campaigns', {
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
          from_name: config.fromName || list.campaign_defaults?.from_name || 'CKC',
          from_email: fromEmail,
          reply_to: replyTo,
        },
      }),
    });

    await mailchimpFetch(config, `/campaigns/${campaign.id}/content`, {
      method: 'PUT',
      body: JSON.stringify({
        html: input.html,
        plain_text: input.plainText ?? input.subject,
      }),
    });

    await mailchimpFetch(config, `/campaigns/${campaign.id}/actions/send`, { method: 'POST' });

    return { success: true, campaignId: campaign.id, sent: emails.length };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Mailchimp send failed' };
  }
}
