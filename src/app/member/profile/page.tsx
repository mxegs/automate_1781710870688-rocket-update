'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { apiFetch } from '@/lib/api/client';
import { clearSession } from '@/lib/auth/session';

interface MemberProfile {
  memberId: string;
  churchName: string;
  campusName: string;
  fullName: string;
  initials: string;
  photoUrl: string | null;
  memberSince: string | null;
  phone: string;
  email: string | null;
  dateOfBirth: string | null;
  status: string | null;
  marriageDate: string | null;
  groups: { id: string; name: string }[];
  upcomingEvents: { id: string; title: string; startsAt: string }[];
  prayerRequests: { id: string; title: string; status: string; createdAt: string }[];
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatAnniversaryDate(value: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  const d = m
    ? new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])))
    : new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default function MemberProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiFetch<MemberProfile>('/api/me/profile')
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load profile');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSignOut = () => {
    clearSession();
    router.push('/login');
  };

  return (
    <AppShell access="member">
      <div className="px-5 pb-10 pt-5">
        {loading ? <p className="text-sm text-ckc-muted">Loading…</p> : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        {profile ? (
          <div className="space-y-6">
            <section className="flex items-center gap-4">
              {profile.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.photoUrl}
                  alt=""
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ckc-black text-sm font-semibold text-cloud">
                  {profile.initials}
                </div>
              )}
              <div>
                <h1 className="font-serif text-2xl font-semibold text-ckc-black">{profile.fullName}</h1>
                <p className="text-sm text-ckc-muted">
                  {profile.churchName}
                  {profile.campusName ? ` · ${profile.campusName}` : ''}
                </p>
                <p className="text-sm text-ckc-muted">Member since {formatDate(profile.memberSince)}</p>
              </div>
            </section>

            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ckc-muted">Contact</h2>
              <p className="text-sm text-ckc-black">Phone: {profile.phone || '—'}</p>
              <p className="text-sm text-ckc-black">Email: {profile.email || '—'}</p>
              <p className="text-sm text-ckc-black">Date of birth: {formatDate(profile.dateOfBirth)}</p>
            </section>

            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ckc-muted">My Church Life</h2>
              <p className="text-sm text-ckc-black">Campus: {profile.campusName || '—'}</p>
              <p className="text-sm text-ckc-black">Status: {profile.status || '—'}</p>
              <p className="text-sm text-ckc-black">
                Groups:{' '}
                {profile.groups.length ? profile.groups.map((g) => g.name).join(', ') : 'None'}
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ckc-muted">
                My Upcoming Events
              </h2>
              {profile.upcomingEvents.length ? (
                <ul className="space-y-1">
                  {profile.upcomingEvents.map((ev) => (
                    <li key={ev.id} className="text-sm text-ckc-black">
                      {ev.title} — {formatDate(ev.startsAt)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ckc-muted">No upcoming RSVPs</p>
              )}
            </section>

            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ckc-muted">
                My Recent Prayer Requests
              </h2>
              {profile.prayerRequests.length ? (
                <ul className="space-y-1">
                  {profile.prayerRequests.map((p) => (
                    <li key={p.id} className="text-sm text-ckc-black">
                      {p.title} ({p.status}) — {formatDate(p.createdAt)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ckc-muted">No prayer requests yet</p>
              )}
              <div className="mt-2 flex gap-4 text-sm">
                <Link href="/member/prayer" className="text-ckc-gold-dim">
                  Submit a new one
                </Link>
                <Link href="/member/prayer" className="text-ckc-gold-dim">
                  See all
                </Link>
              </div>
            </section>

            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ckc-muted">
                Birthdays & Celebrations
              </h2>
              <p className="text-sm text-ckc-black">Birthday: {formatDate(profile.dateOfBirth)}</p>
              <p className="text-sm text-ckc-black">
                {profile.marriageDate
                  ? `Marriage anniversary: ${formatAnniversaryDate(profile.marriageDate)}`
                  : 'Marriage anniversary: not set'}
              </p>
            </section>

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full rounded-lg border border-ckc-black/20 px-4 py-3 text-sm text-ckc-black"
            >
              Sign out
            </button>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
