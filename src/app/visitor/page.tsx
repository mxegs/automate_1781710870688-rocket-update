'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Legacy visitor home — guests now land on public Church Info (no sign-in). */
export default function VisitorHomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/member/church-info');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-life-page text-ckc-muted">
      <p className="text-sm">Loading…</p>
    </div>
  );
}
