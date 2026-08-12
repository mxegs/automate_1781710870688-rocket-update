'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface LifeNowPlayingProps {
  title: string;
  preacher: string;
  href?: string;
}

export default function LifeNowPlaying({ title, preacher, href }: LifeNowPlayingProps) {
  const inner = (
    <div className="life-now-playing-card">
      <Icon name="PlayCircleIcon" size={16} variant="outline" className="shrink-0 text-ckc-gold" />
      <div className="min-w-0">
        <p className="text-[9px] lowercase text-ckc-muted">now playing</p>
        <p className="truncate text-xs text-ckc-black">
          {title} — {preacher}
        </p>
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
