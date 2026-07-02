'use client';

import React, { useState } from 'react';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import { verifyTicket } from '@/lib/events/service';

/** Scan ticket codes on event day */
export default function TicketScanPage() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/events/tickets/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (data.valid) {
        setResult(`✓ ${data.name} — checked in`);
      } else {
        setResult(data.reason ?? 'Invalid ticket');
      }
    } catch {
      setResult('Scan failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = async () => {
    setLoading(true);
    const res = await verifyTicket(code.trim());
    if (res.valid && res.rsvp) {
      setResult(`Valid: ${res.rsvp.name} (${res.rsvp.guestsCount} guest(s))`);
    } else {
      setResult('Invalid or unpaid ticket');
    }
    setLoading(false);
  };

  return (
    <AppShell access="staff">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-cloud mb-2">Ticket Scanner</h1>
        <p className="text-sm text-cloud/40 mb-6">Enter or scan ticket code on event day</p>

        <form onSubmit={handleScan} className="space-y-4">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="CKC-XXXXXX-XXXXXX"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg font-mono text-ckc-gold tracking-wider"
            autoFocus
          />
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="flex-1 rounded-xl bg-ckc-gold py-3 text-sm font-bold text-ckc-black">
              Check in
            </button>
            <button type="button" onClick={handleLookup} disabled={loading} className="rounded-xl border border-white/10 px-4 py-3 text-sm text-cloud/60">
              Lookup
            </button>
          </div>
        </form>

        {result && (
          <div className={`mt-6 rounded-xl border p-4 text-center text-sm ${
            result.startsWith('✓') ? 'border-ckc-gold/30 bg-ckc-gold/10 text-ckc-gold' : 'border-rose-400/30 bg-rose-500/10 text-rose-400'
          }`}>
            {result}
          </div>
        )}
      </div>
    </AppShell>
  );
}
