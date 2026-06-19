'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { formatPhoneDisplay, normalizePhone } from '@/lib/auth/session';
import { createInvite, getInviteUrl } from '@/lib/invites/service';
import { buildInviteSmsMessage, sendSms } from '@/lib/sms/service';

import { updateInviteRequestStatus } from '@/lib/invites/request-service';

interface SendInvitePrefill {
  officialName?: string;
  phone?: string;
  username?: string;
  requestId?: string;
  campusId?: string;
}

interface SendInvitePanelProps {
  onClose: () => void;
  prefill?: SendInvitePrefill;
}

export type { SendInvitePrefill };

export default function SendInvitePanel({ onClose, prefill }: SendInvitePanelProps) {
  const [officialName, setOfficialName] = useState(prefill?.officialName ?? '');
  const [phone, setPhone] = useState(prefill?.phone ?? '');
  const [username, setUsername] = useState(prefill?.username ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState<{ inviteUrl: string; smsDemo: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizePhone(phone);
    if (!officialName.trim()) {
      setError('Enter the person\'s full name.');
      return;
    }
    if (normalized.length < 9) {
      setError('Enter a valid cell number.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const invite = await createInvite({
        phone: normalized,
        officialName: officialName.trim(),
        username: username.trim() || undefined,
        campusId: prefill?.campusId,
        inviteRequestId: prefill?.requestId,
      });
      const inviteUrl = getInviteUrl(invite.token);
      const message = buildInviteSmsMessage(officialName.trim(), inviteUrl);
      const smsResult = await sendSms(normalized, message);

      if (prefill?.requestId) {
        await updateInviteRequestStatus(prefill.requestId, 'approved');
      }
      setSent({ inviteUrl, smsDemo: smsResult.demo ?? true });
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
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#1E293B] p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-cloud">Send Invite</h2>
            <p className="mt-0.5 text-xs text-cloud/40">
              {prefill?.requestId
                ? 'Review details, then send the membership link'
                : 'Send directly — they don\'t need to request first'}
            </p>
          </div>
          <button onClick={onClose} className="text-cloud/40 hover:text-cloud" aria-label="Close">
            <Icon name="XMarkIcon" size={20} variant="outline" />
          </button>
        </div>

        {sent ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4">
              <p className="text-sm font-semibold text-emerald-400">Invite sent to {formatPhoneDisplay(phone)}</p>
              {sent.smsDemo && (
                <p className="mt-1 text-xs text-cloud/50">
                  Demo mode — SMS logged to console. Wire Supabase + SMS provider for production.
                </p>
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
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-cloud/50">Full name</label>
              <input
                value={officialName}
                onChange={(e) => setOfficialName(e.target.value)}
                placeholder="Lerato Mthembu"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:border-ckc-gold/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-cloud/50">Cell number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="082 111 4444"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:border-ckc-gold/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-cloud/50">
                Username <span className="font-normal text-cloud/30">(optional)</span>
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="lerato"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:border-ckc-gold/50 focus:outline-none"
              />
            </div>

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
                {loading ? 'Sending…' : 'Send SMS Invite'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
