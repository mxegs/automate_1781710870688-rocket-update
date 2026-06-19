'use client';

import React, { useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { AGE_CATEGORIES, CAMPUSES } from '@/lib/church/constants';
import { previewBulkSms, sendBulkSmsMessage } from '@/lib/sms/bulk';
import type { CampusId } from '@/lib/church/constants';

interface BulkSmsPanelProps {
  onClose: () => void;
}

export default function BulkSmsPanel({ onClose }: BulkSmsPanelProps) {
  const [campusId, setCampusId] = useState<CampusId | 'all'>('all');
  const [gender, setGender] = useState<'Male' | 'Female' | 'all'>('all');
  const [ageCategory, setAgeCategory] = useState<'child' | 'youth' | 'adult' | 'all'>('all');
  const [message, setMessage] = useState('');
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const refreshCount = async () => {
    try {
      const preview = await previewBulkSms({ campusId, gender, ageCategory });
      setCount(preview.count);
    } catch {
      setCount(0);
    }
  };

  useEffect(() => {
    refreshCount();
  }, [campusId, gender, ageCategory]);

  const handleSend = async () => {
    if (!message.trim()) return;
    if (!confirm(`Send SMS to ${count} member(s)?`)) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await sendBulkSmsMessage({ campusId, gender, ageCategory, message: message.trim() });
      const demoNote = res.demo ? ' (demo — logged to server console)' : '';
      setResult(`Sent to ${res.sent} of ${res.total}${res.failed ? `, ${res.failed} failed` : ''}${demoNote}`);
      if (res.sent > 0) setMessage('');
    } catch (err) {
      setResult(err instanceof Error ? err.message : 'Send failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#1E293B] p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-cloud">Bulk SMS</h2>
            <p className="text-xs text-cloud/40 mt-0.5">Filter members, then send one message to all matches</p>
          </div>
          <button onClick={onClose} className="text-cloud/40 hover:text-cloud">✕</button>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <label className="text-[10px] font-semibold text-cloud/40 uppercase">Campus</label>
            <select
              value={campusId}
              onChange={(e) => setCampusId(e.target.value as CampusId | 'all')}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud"
            >
              <option value="all">All campuses</option>
              {CAMPUSES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-cloud/40 uppercase">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as typeof gender)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud"
              >
                <option value="all">All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-cloud/40 uppercase">Age group</label>
              <select
                value={ageCategory}
                onChange={(e) => setAgeCategory(e.target.value as typeof ageCategory)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud"
              >
                <option value="all">All ages</option>
                {AGE_CATEGORIES.map((a) => (
                  <option key={a.id} value={a.id}>{a.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <p className="mb-3 rounded-lg border border-ckc-gold/20 bg-ckc-gold/10 px-3 py-2 text-xs text-ckc-gold">
          <Icon name="UsersIcon" size={14} variant="outline" className="inline mr-1" />
          {count} member{count === 1 ? '' : 's'} will receive this SMS
        </p>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Your message to members…"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud mb-2"
          maxLength={160}
        />
        <p className="text-[10px] text-cloud/30 mb-4">{message.length}/160 characters</p>

        {result && (
          <p className={`mb-3 text-xs ${result.includes('failed') && !result.includes('demo') ? 'text-rose-400' : 'text-emerald-400'}`}>
            {result}
          </p>
        )}

        <p className="text-[10px] text-cloud/30 mb-4">
          Demo mode logs to console. For real SMS via BulkSMS.com, add to <code className="text-ckc-gold">.env</code>:{' '}
          <code className="text-cloud/50">SMS_PROVIDER=bulksms</code>,{' '}
          <code className="text-cloud/50">BULKSMS_TOKEN_ID</code>,{' '}
          <code className="text-cloud/50">BULKSMS_TOKEN_SECRET</code>
          {' '}(quote the secret if it contains #). Restart dev server after saving.
        </p>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm text-cloud/60">
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={loading || !message.trim() || count === 0}
            className="flex-1 rounded-lg bg-ckc-gold py-2.5 text-sm font-bold text-ckc-black disabled:opacity-40"
          >
            {loading ? 'Sending…' : `Send to ${count}`}
          </button>
        </div>
      </div>
    </div>
  );
}
