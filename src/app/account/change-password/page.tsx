'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthShell from '@/components/auth/AuthShell';
import { CkcButton, CkcCard, CkcField, CkcInput } from '@/components/ui/CkcForm';
import { changePassword } from '@/lib/auth/password';
import { getPostLoginRoute, getSession, getViewMode } from '@/lib/auth/session';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [backHref, setBackHref] = useState('/dashboard');

  useEffect(() => {
    const session = getSession();
    if (!session?.email) {
      router.replace('/login');
      return;
    }
    setEmail(session.email);
    setBackHref(getPostLoginRoute(session.role, getViewMode(session)));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirm) {
      setError('New passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await changePassword({ email, currentPassword, newPassword });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell subtitle="Account security">
      <CkcCard>
        {success ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
              <span className="text-xl text-emerald-400">✓</span>
            </div>
            <h2 className="text-base font-semibold text-ckc-white">Password updated</h2>
            <p className="text-xs text-ckc-muted">Use your new password next time you sign in.</p>
            <Link href={backHref} className="text-sm text-ckc-gold hover:underline">
              Back to app
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-base font-semibold text-ckc-white">Change password</h2>
            <p className="text-xs text-ckc-muted">
              Available for staff and members who sign in with a password.
            </p>

            <CkcField label="Email">
              <CkcInput type="email" value={email} readOnly className="opacity-70" />
            </CkcField>

            <CkcField label="Current password" required>
              <CkcInput
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
            </CkcField>

            <CkcField label="New password" required>
              <CkcInput
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="At least 8 characters"
              />
            </CkcField>

            <CkcField label="Confirm new password" required>
              <CkcInput
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </CkcField>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <div className="flex flex-col gap-2">
              <CkcButton type="submit" disabled={loading || !email}>
                {loading ? 'Saving…' : 'Update password'}
              </CkcButton>
              <Link href={backHref} className="text-center text-xs text-ckc-muted hover:text-ckc-gold">
                Cancel
              </Link>
            </div>
          </form>
        )}
      </CkcCard>
    </AuthShell>
  );
}
