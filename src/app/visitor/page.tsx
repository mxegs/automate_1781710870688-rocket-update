'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import GetInvolvedFooter from '@/components/church-life/GetInvolvedFooter';
import LifeHero from '@/components/church-life/LifeHero';
import { type LifeHomeTile } from '@/lib/church-life/nav';
import { getMemberMediaFeed } from '@/lib/sermons/service';
import { getThumbnailUrl } from '@/lib/sermons/utils';

const visitorTiles: LifeHomeTile[] = [
  { label: 'Daily', accent: 'Word', href: '/member/bible-study', icon: 'BookOpenIcon', accentGold: true },
  { label: 'Events', href: '/member/events', icon: 'CalendarDaysIcon', accentGold: false },
  { label: 'Sermons', href: '/member/sermons', icon: 'PlayCircleIcon', accentGold: false },
  { label: 'Church', accent: 'Info', href: '/member/church-info', icon: 'BuildingLibraryIcon', accentGold: true },
];

export default function VisitorHomePage() {
  const [heroImage, setHeroImage] = useState<string | undefined>();

  useEffect(() => {
    getMemberMediaFeed({ isVisitor: true }).then((sermons) => {
      setHeroImage(getThumbnailUrl(sermons[0]) ?? undefined);
    });
  }, []);

  return (
    <AppShell access="visitor">
      <div className="space-y-5">
        <span className="inline-block rounded px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-ckc-gold border border-ckc-gold/30 bg-ckc-gold/5">
          Visitor Access
        </span>

        <LifeHero
          imageUrl={heroImage}
          titleLead="Latest"
          titleRest="Messages"
          href="/member/sermons"
        />

        <div className="grid grid-cols-2 gap-3">
          {visitorTiles.map((tile) => (
            <Link key={tile.href} href={tile.href} className="life-grid-tile">
              <Icon name={tile.icon} size={28} variant="outline" className="text-white" />
              <p className="text-center text-sm font-semibold leading-tight">
                {tile.accentGold && tile.label ? (
                  <>
                    <span className="text-ckc-gold">{tile.label}</span>
                    {tile.accent ? <span className="text-white"> {tile.accent}</span> : null}
                  </>
                ) : (
                  <span className="text-white">
                    {tile.label}
                    {tile.accent ? ` ${tile.accent}` : ''}
                  </span>
                )}
              </p>
            </Link>
          ))}
        </div>

        <GetInvolvedFooter />
      </div>
    </AppShell>
  );
}
