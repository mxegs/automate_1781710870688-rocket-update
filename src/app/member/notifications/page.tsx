'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { apiFetch } from '@/lib/api/client';

interface NotificationRow {
  id: string;
  type: string;
  title: string;
  body: string | null;
  actionUrl: string | null;
  readAt: string | null;
  createdAt: string;
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

export default function MemberNotificationsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    apiFetch<{ notifications: NotificationRow[] }>('/api/me/notifications')
      .then((data) => setItems(data.notifications ?? []))
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [pathname]);

  const markRead = async (row: NotificationRow) => {
    await apiFetch(`/api/me/notifications/${row.id}/read`, { method: 'POST' }).catch(() => null);
    if (row.actionUrl) router.push(row.actionUrl);
    else load();
  };

  const markAll = async () => {
    await apiFetch('/api/me/notifications/read-all', { method: 'POST' });
    load();
  };

  return (
    <AppShell access="member">
      <div className="px-5 pb-10 pt-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="font-serif text-2xl font-semibold text-ckc-black">Notifications</h1>
          <button type="button" onClick={markAll} className="text-sm text-ckc-gold-dim">
            Mark all as read
          </button>
        </div>

        {loading ? <p className="text-sm text-ckc-muted">Loading…</p> : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        {!loading && !items.length ? (
          <p className="text-sm text-ckc-muted">No notifications yet</p>
        ) : (
          <ul className="space-y-2">
            {items.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => markRead(row)}
                  className="w-full rounded-lg border border-ckc-black/10 bg-white px-3 py-3 text-left"
                >
                  <div className="flex items-start gap-2">
                    {!row.readAt ? (
                      <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-ckc-gold" />
                    ) : (
                      <span className="mt-1.5 h-2 w-2 flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ckc-black">{row.title}</p>
                      {row.body ? (
                        <p className="mt-0.5 truncate text-sm text-ckc-muted">{row.body}</p>
                      ) : null}
                      <p className="mt-1 text-xs text-ckc-muted">{relativeTime(row.createdAt)}</p>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-6 text-sm">
          <Link href="/member" className="text-ckc-gold-dim">
            Back to home
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
