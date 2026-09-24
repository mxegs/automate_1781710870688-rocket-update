'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { extractChurchSlug } from '@/lib/church/resolve-from-url';

export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    const slug = extractChurchSlug(window.location.pathname);
    router.replace(slug ? `/${slug}/signup/complete` : '/signup/complete');
  }, [router]);

  return <div className="min-h-screen bg-white" />;
}
