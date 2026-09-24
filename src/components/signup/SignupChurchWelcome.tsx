'use client';

import { useEffect, useState } from 'react';
import { resolveCurrentChurch } from '@/lib/church/resolve-from-url';

export default function SignupChurchWelcome() {
  const [name, setName] = useState('');

  useEffect(() => {
    let cancelled = false;
    resolveCurrentChurch().then((church) => {
      if (cancelled || !church) return;
      setName(church.name);
      document.documentElement.style.setProperty('--ckc-primary', church.primaryColor || '#6B7280');
      document.documentElement.style.setProperty('--ckc-secondary', church.secondaryColor || '#F7F3EE');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!name) return null;
  return <p className="px-5 pt-6 text-center font-serif text-2xl font-semibold text-ckc-black">Welcome to {name}</p>;
}
