'use client';

import React from 'react';
import Link from 'next/link';

interface LifeHeroProps {
  imageUrl?: string;
  titleLead: string;
  titleRest: string;
  href?: string;
}

export default function LifeHero({ imageUrl, titleLead, titleRest, href }: LifeHeroProps) {
  const inner = (
    <div className="life-hero w-full">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover grayscale" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-600 to-neutral-900" />
      )}
      <div className="life-hero-overlay" />
      <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
        <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
          <span className="text-ckc-gold">{titleLead}</span>
          {titleRest ? <span className="text-white"> {titleRest}</span> : null}
        </h2>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  }

  return inner;
}
