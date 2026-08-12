'use client';

import React from 'react';

const brandPaths: Record<string, React.ReactNode> = {
  facebook: (
    <path
      fill="currentColor"
      d="M9.5 3H12.5V6H10.5C9.95 6 9.5 6.45 9.5 7V9H12.5L12 12H9.5V21H6.5V12H4.5V9H6.5V6.5C6.5 4.57 8.07 3 10 3H12.5"
    />
  ),
  instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
    </>
  ),
  youtube: (
    <path
      fill="currentColor"
      d="M10 8.5v7l6-3.5-6-3.5Zm11.5 2.2s-.2-1.45-.8-2.1c-.75-.8-1.6-.8-2-.85C15.9 7.5 12 7.5 12 7.5h0s-3.9 0-6.7.25c-.4.05-1.25.05-2 .85-.6.65-.8 2.1-.8 2.1S2.5 11.65 2.5 13.5v1c0 1.85.2 3.8.2 3.8s.2 1.45.8 2.1c.75.8 1.75.75 2.2.85 1.6.15 6.8.2 6.8.2s3.9-.05 6.7-.25c.4-.05 1.25-.05 2-.85.6-.65.8-2.1.8-2.1s.2-1.95.2-3.8v-1c0-1.85-.2-3.8-.2-3.8Z"
    />
  ),
  tiktok: (
    <path
      fill="currentColor"
      d="M14.5 5.5c.8 1.1 1.9 1.9 3.2 2.1v2.6c-1.2-.04-2.3-.45-3.2-1.1v5.4c0 2.65-2.15 4.8-4.8 4.8S5.1 17.15 5.1 14.5s2.15-4.8 4.8-4.8c.25 0 .5.02.75.07v2.75a2.05 2.05 0 1 0 1.45 1.97V5.5h2.4Z"
    />
  ),
};

export function LifeSocialIcon({ brand, className = '' }: { brand: string; className?: string }) {
  const paths = brandPaths[brand];
  if (!paths) return null;

  return (
    <svg
      viewBox="0 0 24 24"
      width={18}
      height={18}
      className={className}
      aria-hidden
    >
      {paths}
    </svg>
  );
}
