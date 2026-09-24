'use client';

import React, { useEffect, useRef, useState } from 'react';
import AppShell from '@/components/AppShell';

/** Scan ticket codes on event day. Enter submits, which is what a barcode scanner sends. */
export default function TicketScanPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState('');
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(0);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const ticket = code.trim();
    if (!ticket) return;
    setLoading(true);
    try {
      const res = await fetch('/api/events/tickets/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: ticket }),
      });
      const data = await res.json();
      if (data.valid) {
        setResult({ ok: true, text: data.name ? `${data.name} checked in` : 'Checked in' });
        setScanned((count) => count + 1);
      } else {
        setResult({ ok: false, text: data.reason ?? 'Invalid ticket' });
      }
    } catch {
      setResult({ ok: false, text: 'Scan failed' });
    } finally {
      setLoading(false);
      setCode('');
      inputRef.current?.focus();
    }
  };

  return (
    <AppShell access="staff">
      <div className="mx-auto max-w-md">
        <h1 className="mb-2 text-2xl font-bold text-cloud">Ticket Scanner</h1>
        <p className="mb-6 text-sm text-cloud/40">Scan a code. It submits when you press Enter.</p>

        <form onSubmit={handleScan}>
          <input
            ref={inputRef}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="XXXXXX-XXXXXX"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-lg tracking-wider text-ckc-gold"
            autoFocus
          />
          <button type="submit" disabled={loading} className="mt-3 w-full rounded-xl bg-ckc-gold py-3 text-sm font-bold text-ckc-black">
            {loading ? 'Checking…' : 'Check in'}
          </button>
        </form>

        {result ? (
          <div
            className={`mt-8 rounded-2xl border px-6 py-10 text-center text-3xl font-bold ${
              result.ok ? 'border-ckc-gold/30 bg-ckc-gold/10 text-ckc-gold' : 'border-rose-400/30 bg-rose-500/10 text-rose-400'
            }`}
          >
            {result.text}
          </div>
        ) : null}

        <p className="mt-8 text-center text-sm text-cloud/50">{scanned} scanned this session</p>
      </div>
    </AppShell>
  );
}
