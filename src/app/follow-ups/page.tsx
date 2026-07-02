'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import PageHeader, { ContentCard } from '@/components/portal/PageHeader';
import { CAMPUSES, FOLLOWUP_STAGES, getCampusLabel, type CampusId, type FollowUpStageId } from '@/lib/church/constants';
import { getFollowUps, sendFollowUpMessage, updateFollowUpStage } from '@/lib/followups/service';
import type { FollowUpContact } from '@/lib/followups/service';
import { useBackend } from '@/lib/api/client';

const stageColors: Record<FollowUpStageId, string> = {
  cold: 'bg-white/5 text-cloud/50 border-white/10',
  engaging: 'bg-ckc-gold/10 text-ckc-gold border-ckc-gold/20',
  committed: 'bg-ckc-gold/10 text-ckc-gold border-ckc-gold/20',
};

export default function FollowUpsPage() {
  const [contacts, setContacts] = useState<FollowUpContact[]>([]);
  const [stageFilter, setStageFilter] = useState<string>('All');
  const [campusFilter, setCampusFilter] = useState<string>('All');
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState<'sms' | 'whatsapp' | 'newsletter'>('sms');
  const [sending, setSending] = useState(false);
  const [sentResult, setSentResult] = useState('');
  const backend = useBackend();

  const load = async () => {
    const list = await getFollowUps({
      campusId: campusFilter !== 'All' ? (campusFilter as CampusId) : undefined,
      stage: stageFilter !== 'All' ? (stageFilter as FollowUpStageId) : undefined,
    });
    setContacts(list);
  };

  useEffect(() => {
    load();
  }, [stageFilter, campusFilter]);

  const filtered = contacts;

  const handleSend = async () => {
    if (!message.trim() || filtered.length === 0) return;
    setSending(true);
    try {
      const result = await sendFollowUpMessage({
        contactIds: filtered.map((c) => c.id),
        channel,
        message: message.trim(),
      });
      setSentResult(`Sent to ${result.sent} contact(s) via ${channel}`);
      setShowMessage(false);
      setMessage('');
      load();
    } finally {
      setSending(false);
    }
  };

  const handleStageChange = async (id: string, stage: FollowUpStageId) => {
    await updateFollowUpStage(id, stage);
    load();
  };

  return (
    <AppShell access="staff">
      <PageHeader
        title="Follow-Ups"
        subtitle="Filter by stage tags — send SMS, WhatsApp, or newsletter"
        actions={
          <button
            onClick={() => setShowMessage(true)}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 rounded-xl bg-ckc-gold px-4 py-2.5 text-sm font-bold text-ckc-black disabled:opacity-40"
          >
            <Icon name="ChatBubbleLeftRightIcon" size={16} variant="outline" />
            Message filtered ({filtered.length})
          </button>
        }
      />

      {!backend && (
        <p className="text-sm text-ckc-gold mb-4">Connect Supabase — demo follow-up contacts are seeded in migration.</p>
      )}

      {sentResult && (
        <p className="mb-4 text-sm text-ckc-gold">{sentResult}</p>
      )}

      <ContentCard>
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="text-xs text-cloud/40 self-center mr-1">Stage:</span>
          {['All', ...FOLLOWUP_STAGES.map((s) => s.id)].map((s) => (
            <button
              key={s}
              onClick={() => setStageFilter(s)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                stageFilter === s ? 'border-ckc-gold/30 bg-ckc-gold/10 text-ckc-gold' : 'border-white/10 text-cloud/50'
              }`}
            >
              {s === 'All' ? 'All' : FOLLOWUP_STAGES.find((x) => x.id === s)?.label}
            </button>
          ))}
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="text-xs text-cloud/40 self-center mr-1">Campus:</span>
          {['All', ...CAMPUSES.map((c) => c.id)].map((c) => (
            <button
              key={c}
              onClick={() => setCampusFilter(c)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                campusFilter === c ? 'border-ckc-gold/30 bg-ckc-gold/10 text-ckc-gold' : 'border-white/10 text-cloud/50'
              }`}
            >
              {c === 'All' ? 'All' : getCampusLabel(c)}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((f) => (
            <div key={f.id} className="flex w-full items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-cloud">{f.name}</p>
                <p className="text-xs text-cloud/40">
                  {f.phone} · {getCampusLabel(f.campus)} · {f.source}
                </p>
                <p className="text-xs text-cloud/30 mt-0.5">Last contact: {f.lastContact}</p>
              </div>
              <div className="flex-shrink-0">
                <select
                  value={f.stage}
                  onChange={(e) => handleStageChange(f.id, e.target.value as FollowUpStageId)}
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${stageColors[f.stage]}`}
                >
                  {FOLLOWUP_STAGES.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-cloud/40 py-8">No contacts match these filters.</p>
          )}
        </div>
      </ContentCard>

      {showMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-ckc-card p-6">
            <h2 className="text-lg font-bold text-cloud mb-4">
              Message {filtered.length} contact(s)
            </h2>
            <div className="flex gap-2 mb-4">
              {(['sms', 'whatsapp', 'newsletter'] as const).map((ch) => (
                <button
                  key={ch}
                  onClick={() => setChannel(ch)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold capitalize ${
                    channel === ch ? 'border-ckc-gold/30 bg-ckc-gold/10 text-ckc-gold' : 'border-white/10 text-cloud/50'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Your message…"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud"
            />
            <div className="mt-4 flex gap-3">
              <button onClick={() => setShowMessage(false)} className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm text-cloud/60">Cancel</button>
              <button onClick={handleSend} disabled={sending} className="flex-1 rounded-lg bg-ckc-gold py-2.5 text-sm font-bold text-ckc-black">
                {sending ? 'Sending…' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
