'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import MemberAvatar from '@/components/members/MemberAvatar';
import { apiFetch, sessionHeaders } from '@/lib/api/client';
import { clearSession } from '@/lib/auth/session';

interface MemberProfile {
  memberId: string;
  churchName: string;
  campusName: string;
  fullName: string;
  initials: string;
  photoUrl: string | null;
  photoVisible: boolean;
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
  const [photoBusy, setPhotoBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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

  const pickPhoto = () => fileRef.current?.click();

  const handlePhotoSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !profile) return;
    setPhotoBusy(true);
    setError('');
    try {
      const body = new FormData();
      body.append('photo', file);
      const res = await fetch('/api/me/photo', {
        method: 'POST',
        headers: sessionHeaders(),
        body,
      });
      const json = (await res.json().catch(() => ({}))) as { photoUrl?: string; error?: string };
      if (!res.ok) throw new Error(json.error || `Upload failed (${res.status})`);
      setProfile({ ...profile, photoUrl: json.photoUrl ?? null });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload photo');
    } finally {
      setPhotoBusy(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!profile) return;
    setPhotoBusy(true);
    setError('');
    try {
      await apiFetch<{ photoUrl: null }>('/api/me/photo', { method: 'DELETE' });
      setProfile({ ...profile, photoUrl: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove photo');
    } finally {
      setPhotoBusy(false);
    }
  };

  const handlePhotoVisible = async (photoVisible: boolean) => {
    if (!profile) return;
    const previous = profile.photoVisible;
    setProfile({ ...profile, photoVisible });
    try {
      await apiFetch<{ photoVisible: boolean }>('/api/me/photo', {
        method: 'PATCH',
        body: JSON.stringify({ photoVisible }),
      });
    } catch (err) {
      setProfile({ ...profile, photoVisible: previous });
      setError(err instanceof Error ? err.message : 'Could not update photo visibility');
    }
  };

  return (
    <AppShell access="member">
      <div className="px-5 pb-10 pt-5">
        {loading ? <p className="text-sm text-ckc-muted">Loading…</p> : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        {profile ? (
          <div className="space-y-6">
            <section className="flex items-center gap-4">
              <MemberAvatar
                memberId={profile.memberId}
                name={profile.fullName}
                photoUrl={profile.photoUrl}
                sizePx={64}
              />
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
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoSelected}
              />
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={pickPhoto}
                  disabled={photoBusy}
                  className="text-sm text-ckc-gold-dim"
                >
                  {profile.photoUrl ? 'Change photo' : 'Add photo'}
                </button>
                {profile.photoUrl ? (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={photoBusy}
                    className="text-sm text-ckc-gold-dim"
                  >
                    Remove photo
                  </button>
                ) : null}
              </div>
              <label className="mt-3 flex items-center gap-2 text-sm text-ckc-black">
                <input
                  type="checkbox"
                  checked={profile.photoVisible}
                  onChange={(e) => handlePhotoVisible(e.target.checked)}
                />
                Show my photo in the member directory
              </label>
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
                <Link href="/member/prayers" className="text-ckc-gold-dim">
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
