'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import GetInvolvedFooter from '@/components/church-life/GetInvolvedFooter';
import LifeHero from '@/components/church-life/LifeHero';
import LifeNowPlaying from '@/components/church-life/LifeNowPlaying';
import { lifeHomeTiles } from '@/lib/church-life/nav';
import { getMemberEventsFeed } from '@/lib/events/service';
import { getMemberMediaFeed } from '@/lib/sermons/service';
import { resolveMemberCampus } from '@/lib/member/campus';
import { getThumbnailUrl } from '@/lib/sermons/utils';
import type { MediaItem } from '@/lib/sermons/types';

export default function MemberHomePage() {
  const [latestSermon, setLatestSermon] = useState<MediaItem | null>(null);
  const [heroImage, setHeroImage] = useState<string | undefined>();

  useEffect(() => {
    (async () => {
      const campus = await resolveMemberCampus();
      const sermons = await getMemberMediaFeed({ memberCampus: campus });
      const first = sermons[0] ?? null;
      setLatestSermon(first);
      setHeroImage(first ? getThumbnailUrl(first) ?? undefined : undefined);

      const events = await getMemberEventsFeed({ memberCampus: campus });
      if (!first?.youtubeId && events[0]?.imageUrl) {
        setHeroImage(events[0].imageUrl);
      }
    })();
  }, []);

  return (
    <AppShell>
      <div className="life-home">
        <div className="life-home-hero">
          <LifeHero
            imageUrl={heroImage}
            titleLead="Latest"
            titleRest="Messages"
            href="/member/sermons"
          />
        </div>

        <div className="life-home-grid">
          {lifeHomeTiles.map((tile) => (
            <Link key={tile.href} href={tile.href} className="life-grid-tile">
              <Icon name={tile.icon} size={18} variant="outline" className="text-ckc-gold" />
              <p className="text-[13px] leading-tight">
                {tile.accentGold && tile.label ? (
                  <>
                    <span className="text-ckc-gold">{tile.label}</span>
                    {tile.accent ? <span className="text-white"> {tile.accent}</span> : null}
                  </>
                ) : tile.accentGold ? (
                  <span className="text-ckc-gold">{tile.label}</span>
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

        {latestSermon ? (
          <div className="life-home-now-playing">
            <LifeNowPlaying
              title={latestSermon.title}
              preacher={latestSermon.preacher}
              href="/member/sermons"
            />
          </div>
        ) : null}

        <GetInvolvedFooter fill />
      </div>
    </AppShell>
  );
}
