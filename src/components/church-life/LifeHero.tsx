'use client';

import React from 'react';
import Link from 'next/link';
import LifePhoto from '@/components/church-life/LifePhoto';
import { LIFE_PHOTOS } from '@/lib/church-life/imagery';

interface LifeHeroProps {
  imageUrl?: string;
  titleLead: string;
  titleRest?: string;
  href?: string;
  onClick?: () => void;
  badge?: string;
  cta?: string;
}

export default function LifeHero({
  imageUrl,
  titleLead,
  titleRest,
  href,
  onClick,
  badge = 'Featured',
  cta,
}: LifeHeroProps) {
  const inner = (
    <div className="relative h-[280px] w-full overflow-hidden rounded-[28px] bg-ckc-black">
      <LifePhoto src={imageUrl || LIFE_PHOTOS.worship} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        {badge ? (
          <span className="mb-2 inline-flex rounded-full bg-ckc-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ckc-gold-text">
            {badge}
          </span>
        ) : null}
        <h2 className="font-serif text-[26px] font-semibold leading-tight text-white">{titleLead}</h2>
        {titleRest ? <p className="mt-1 text-sm text-white/80">{titleRest}</p> : null}
        {cta ? (
          <span className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold text-ckc-black">
            {cta}
          </span>
        ) : null}
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

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="block w-full text-left">
        {inner}
      </button>
    );
  }

  return inner;
}
