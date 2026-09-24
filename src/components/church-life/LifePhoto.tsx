'use client';

import React from 'react';

export default function LifePhoto({
  src,
  alt = '',
  className = '',
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={`bg-ckc-black object-cover ${className}`} />
  );
}
