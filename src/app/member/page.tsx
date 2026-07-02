'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import GetInvolvedFooter from '@/components/church-life/GetInvolvedFooter';
import LifeHero from '@/components/church-life/LifeHero';
import { lifeHomeTiles, type LifeHomeTile } from '@/lib/church-life/nav';
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
      <div className="space-y-5">
        <LifeHero
          imageUrl={heroImage}
          titleLead="Latest"
          titleRest="Messages"
          href="/member/sermons"
        />

        <div className="grid grid-cols-2 gap-3">
          {lifeHomeTiles.map((tile) => (
            <Link key={tile.href} href={tile.href} className="life-grid-tile">
              <Icon name={tile.icon} size={28} variant="outline" className="text-white" />
              <p className="text-center text-sm font-semibold leading-tight">
                {tile.accentGold && tile.label ? (
                  <>
                    <span className="text-ckc-gold">{tile.label}</span>
                    {tile.accent ? <span className="text-white"> {tile.accent}</span> : null}
                  </>
                ) : (
                  <span className="text-white">{tile.label}{tile.accent ? ` ${tile.accent}` : ''}</span>
                )}
              </p>
            </Link>
          ))}
        </div>

        {latestSermon && (
          <div className="rounded-xl border border-[#E5E5E5] bg-neutral-50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ckc-gold">Now playing</p>
            <p className="mt-1 font-bold text-ckc-black">{latestSermon.title}</p>
            <p className="text-xs text-ckc-muted">{latestSermon.preacher} · {latestSermon.date}</p>
          </div>
        )}

        <GetInvolvedFooter />
      </div>
    </AppShell>
  );
}
