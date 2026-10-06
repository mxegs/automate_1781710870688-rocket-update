'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { apiFetch } from '@/lib/api/client';
import { PRAYER_STATUS_LABELS, type PrayerStatus } from '@/lib/prayer/types';

interface MemberPrayer {
  id: string;
  title: string;
  body: string;
  fullBody: string;
  isConfidential: boolean;
  status: string;
  createdAt: string;
  answeredAt: string | null;
}

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.max(0, Math.round(ms / 60000));
  if (min < 1) return 'just now';
  if (min < 60) return `${min} minute${min === 1 ? '' : 's'} ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`;
  const day = Math.round(hr / 24);
  return `${day} day${day === 1 ? '' : 's'} ago`;
}

function statusLabel(status: string): string {
  return PRAYER_STATUS_LABELS[status as PrayerStatus] ?? status;
}

export default function MemberPrayersPage() {
  const [items, setItems] = useState<MemberPrayer[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch<{ prayers: MemberPrayer[] }>('/api/me/prayers')
      .then((data) => {
        if (!cancelled) setItems(data.prayers ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load prayers');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell access="member">
      <div className="px-5 pb-10 pt-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="font-serif text-2xl font-semibold text-ckc-black">My Prayer Requests</h1>
          <Link href="/member/prayer" className="text-sm text-ckc-gold-dim">
            New Prayer
          </Link>
        </div>

        {loading ? <p className="text-sm text-ckc-muted">Loading…</p> : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        {!loading && !items.length ? (
          <div className="space-y-3">
            <p className="text-sm text-ckc-muted">You haven&apos;t submitted any prayer requests yet</p>
            <Link href="/member/prayer" className="inline-block text-sm text-ckc-gold-dim">
              Submit your first prayer
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((row) => {
              const open = openId === row.id;
              return (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : row.id)}
                    className="w-full rounded-lg border border-ckc-black/10 bg-white px-4 py-3 text-left"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-ckc-black">{row.title}</p>
                      <span className="rounded-full border border-ckc-black/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-ckc-muted">
                        {statusLabel(row.status)}
                      </span>
                      {row.isConfidential ? (
                        <span className="rounded-full border border-ckc-gold/30 px-2 py-0.5 text-[10px] uppercase tracking-wide text-ckc-gold-dim">
                          Confidential
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-ckc-muted">{open ? row.fullBody : row.body}</p>
                    <p className="mt-1 text-xs text-ckc-muted">{relativeTime(row.createdAt)}</p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
