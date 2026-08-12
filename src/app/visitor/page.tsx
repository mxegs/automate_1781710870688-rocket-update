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
      <div className="life-home">
        <div className="life-section shrink-0 pb-1 pt-2.5">
          <span className="visitor-badge">Visitor access</span>
        </div>

        <div className="life-home-hero">
          <LifeHero
            imageUrl={heroImage}
            titleLead="Latest"
            titleRest="Messages"
            href="/member/sermons"
          />
        </div>

        <div className="life-home-grid">
          {visitorTiles.map((tile) => (
            <Link key={tile.href} href={tile.href} className="life-grid-tile">
              <Icon name={tile.icon} size={18} variant="outline" className="text-ckc-gold" />
              <p className="text-[13px] leading-tight text-white">
                {tile.accentGold && tile.label ? (
                  <>
                    <span className="text-ckc-gold">{tile.label}</span>
                    {tile.accent ? ` ${tile.accent}` : ''}
                  </>
                ) : (
                  <>
                    {tile.label}
                    {tile.accent ? ` ${tile.accent}` : ''}
                  </>
                )}
              </p>
            </Link>
          ))}
        </div>

        <GetInvolvedFooter fill />
      </div>
    </AppShell>
  );
}
