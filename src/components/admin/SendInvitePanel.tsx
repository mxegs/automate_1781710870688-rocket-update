'use client';

import React, { useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { createInvite, getInviteUrl } from '@/lib/invites/service';

import { updateInviteRequestStatus } from '@/lib/invites/request-service';

interface SendInvitePrefill {
  givenName?: string;
  surname?: string;
  email?: string;
  requestId?: string;
  campusId?: string;
}

interface SendInvitePanelProps {
  onClose: () => void;
  prefill?: SendInvitePrefill;
}

export type { SendInvitePrefill };

export default function SendInvitePanel({ onClose, prefill }: SendInvitePanelProps) {
  const [givenName, setGivenName] = useState(prefill?.givenName ?? '');
  const [surname, setSurname] = useState(prefill?.surname ?? '');
  const [email, setEmail] = useState(prefill?.email ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState<{
    inviteUrl: string;
    emailDemo: boolean;
    emailError?: string;
  } | null>(null);

  useEffect(() => {
    if (prefill) {
      setGivenName(prefill.givenName ?? '');
      setSurname(prefill.surname ?? '');
      setEmail(prefill.email ?? '');
    }
  }, [prefill]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!givenName.trim()) {
      setError('Enter the person\'s first name.');
      return;
    }
    if (!surname.trim()) {
      setError('Enter the person\'s surname.');
      return;
    }
    if (!normalizedEmail.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const invite = await createInvite({
        email: normalizedEmail,
        givenName: givenName.trim(),
        surname: surname.trim(),
        campusId: prefill?.campusId,
        inviteRequestId: prefill?.requestId,
      });

      if (prefill?.requestId) {
        await updateInviteRequestStatus(prefill.requestId, 'approved');
      }

      const inviteUrl = invite.inviteUrl ?? getInviteUrl(invite.token);

      setSent({
        inviteUrl,
        emailDemo: invite.emailDelivery?.demo ?? false,
        emailError: invite.emailDelivery?.success === false ? invite.emailDelivery.error : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send invite.');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (sent?.inviteUrl) navigator.clipboard.writeText(sent.inviteUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-ckc-card p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-cloud">Send Invite</h2>
            <p className="mt-0.5 text-xs text-cloud/40">
              {prefill?.requestId
                ? 'Review details, then email the membership link'
                : 'Send directly — they don\'t need to request first'}
            </p>
          </div>
          <button onClick={onClose} className="text-cloud/40 hover:text-cloud" aria-label="Close">
            <Icon name="XMarkIcon" size={20} variant="outline" />
          </button>
        </div>

        {sent ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-ckc-gold/20 bg-ckc-gold/10 p-4 space-y-2">
              <p className="text-sm font-semibold text-ckc-gold">
                {sent.emailError ? 'Invite created — copy link below' : 'Invite email sent'}
              </p>
              <p className="text-xs text-cloud/60">
                Email → {email.trim().toLowerCase()}
                {sent.emailDemo ? ' (demo)' : ''}
              </p>
              {sent.emailError && (
                <div className="rounded-lg border border-ckc-gold/30 bg-ckc-gold/10 p-3 text-xs text-ckc-gold/90 space-y-1">
                  <p className="font-semibold text-ckc-gold">Email not delivered (Resend test mode)</p>
                  <p>{sent.emailError}</p>
                  <p>
                    Until you verify your church domain at{' '}
                    <a href="https://resend.com/domains" className="underline" target="_blank" rel="noreferrer">
                      resend.com/domains
                    </a>
                    , only <strong>aiwealthlogic@gmail.com</strong> receives emails automatically.
                    <strong> Copy the invite link below</strong> and send it via WhatsApp or forward from your inbox.
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-cloud/50">Invite link</label>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={sent.inviteUrl}
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-cloud"
                />
                <button
                  type="button"
                  onClick={copyLink}
                  className="rounded-lg border border-ckc-gold/30 bg-ckc-gold/10 px-3 py-2 text-xs font-semibold text-ckc-gold hover:bg-ckc-gold/20"
                >
                  Copy
                </button>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-ckc-gold py-2.5 text-sm font-bold text-ckc-black hover:bg-ckc-gold-light"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-cloud/50">First name(s)</label>
                <input
                  value={givenName}
                  onChange={(e) => setGivenName(e.target.value)}
                  placeholder="First name"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:border-ckc-gold/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-cloud/50">Surname</label>
                <input
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="Surname"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:border-ckc-gold/50 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-cloud/50">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="member@example.com"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:border-ckc-gold/50 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-cloud/30">
              They will choose their own username when completing the membership form.
            </p>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-cloud/70 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-ckc-gold py-2.5 text-sm font-bold text-ckc-black hover:bg-ckc-gold-light disabled:opacity-60"
              >
                {loading ? 'Sending…' : 'Send invite by email'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
