'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import GetInvolvedFooter from '@/components/church-life/GetInvolvedFooter';
import CheckInHero from '@/components/church-life/CheckInHero';
import LifeHero from '@/components/church-life/LifeHero';
import LifePhoto from '@/components/church-life/LifePhoto';
import { LIFE_PHOTOS, eventCover, sermonCover } from '@/lib/church-life/imagery';
import { getMemberEventsFeed, getMyCheckinForToday, type MyCheckIn } from '@/lib/events/service';
import { getMemberMediaFeed } from '@/lib/sermons/service';
import { resolveMemberCampus, resolveMemberChurch } from '@/lib/member/campus';
import { resolveMemberIdsFromSession } from '@/lib/member/identity';
import { getCampusLabel } from '@/lib/church/constants';
import type { MediaItem } from '@/lib/sermons/types';
import type { ChurchEvent } from '@/lib/events/types';
import { getDisplayName, getSession } from '@/lib/auth/session';
import { getChurchBranding } from '@/lib/church/service';

const QUICK_LINKS = [
  { label: 'Daily Word', href: '/member/bible-study', image: LIFE_PHOTOS.bible },
  { label: 'Events', href: '/member/events', image: LIFE_PHOTOS.gathering },
  { label: 'Give', href: '/member/give', image: LIFE_PHOTOS.give },
  { label: 'Prayer', href: '/member/prayer', image: LIFE_PHOTOS.prayer },
] as const;

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function MemberChurchLine() {
  const [churchName, setChurchName] = useState('');
  const campusLabel = getCampusLabel(getSession()?.campusId ?? 'midrand');

  useEffect(() => {
    let cancelled = false;
    getChurchBranding(resolveMemberChurch()).then((church) => {
      if (!cancelled) setChurchName(church.name);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!churchName) return null;
  return <p className="mt-1 text-sm text-ckc-muted">{churchName} · {campusLabel}</p>;
}

type HeroMode = 'daily' | 'checkin-ready' | 'checked-in' | 'ended';

function eventWindowEnd(event: ChurchEvent): number {
  if (event.endsAt) return new Date(event.endsAt).getTime();
  return new Date(event.startsAt).getTime() + 2 * 60 * 60 * 1000;
}

export default function MemberHomePage() {
  const [latestSermon, setLatestSermon] = useState<MediaItem | null>(null);
  const [nextEvent, setNextEvent] = useState<ChurchEvent | null>(null);
  const [heroMode, setHeroMode] = useState<HeroMode>('daily');
  const [serviceEvent, setServiceEvent] = useState<ChurchEvent | null>(null);
  const [serviceCheckin, setServiceCheckin] = useState<MyCheckIn | null>(null);
  const [kidsRoom, setKidsRoom] = useState('');
  const [name, setName] = useState('Friend');

  useEffect(() => {
    const session = getSession();
    setName(getDisplayName(session).split(' ')[0] || 'Friend');
    (async () => {
      const campus = await resolveMemberCampus();
      const churchId = resolveMemberChurch();
      const sermons = await getMemberMediaFeed({ churchId, memberCampus: campus });
      setLatestSermon(sermons[0] ?? null);
      const events = await getMemberEventsFeed({ churchId, memberCampus: campus });
      setNextEvent(events[0] ?? null);

      const ids = await resolveMemberIdsFromSession();
      const today = await getMyCheckinForToday(campus, ids?.profileId, churchId).catch(() => null);
      if (!today?.event) {
        setHeroMode('daily');
        return;
      }

      const now = Date.now();
      const start = new Date(today.event.startsAt).getTime();
      const end = eventWindowEnd(today.event);
      if (now > end) {
        setServiceEvent(today.event);
        setHeroMode('ended');
        return;
      }
      if (now >= start && now <= end) {
        setServiceEvent(today.event);
        if (today.checkin) {
          setServiceCheckin(today.checkin);
          setKidsRoom(today.dependants[0]?.room ?? '');
          setHeroMode('checked-in');
        } else {
          setHeroMode('checkin-ready');
        }
        return;
      }
      setHeroMode('daily');
    })();
  }, []);

  return (
    <AppShell>
      <div className="flex flex-1 flex-col">
        <div className="px-5 pt-5">
          <p className="text-sm text-ckc-muted">{greeting()}</p>
          <h1 className="font-serif text-[32px] font-semibold leading-tight text-ckc-black">{name}</h1>
          <MemberChurchLine />
        </div>

        <div className="px-5 pt-5">
          {heroMode === 'daily' || !serviceEvent ? (
            <LifeHero
              imageUrl={latestSermon ? sermonCover(latestSermon) : LIFE_PHOTOS.worship}
              titleLead={latestSermon?.title ?? 'This Sunday'}
              titleRest={latestSermon ? `${latestSermon.preacher} · ${latestSermon.date}` : 'Join us for worship'}
              href="/member/sermons"
              badge="Latest sermon"
              cta="Watch now"
            />
          ) : (
            <CheckInHero
              eventTitle={serviceEvent.title}
              campusLabel={getCampusLabel(serviceEvent.campus)}
              timeLabel={`${serviceEvent.date} · ${serviceEvent.time}`}
              href={heroMode === 'ended' ? '/member/sermons' : `/member/events/${serviceEvent.id}`}
              state={heroMode === 'checked-in' ? 'checked-in' : heroMode === 'ended' ? 'ended' : 'ready'}
              seat={serviceCheckin?.seat}
              kidsRoom={kidsRoom}
              securityCode={serviceCheckin?.securityCode}
            />
          )}
        </div>

        {nextEvent ? (
          <div className="px-5 pt-6">
            <div className="mb-3 flex items-end justify-between">
              <h2 className="text-lg font-semibold text-ckc-black">Coming up</h2>
              <Link href="/member/events" className="text-sm font-medium text-ckc-gold-dim">
                See all
              </Link>
            </div>
            <Link
              href={`/member/events/${nextEvent.id}`}
              className="flex overflow-hidden rounded-[22px] bg-white shadow-[0_10px_30px_rgba(26,22,18,0.08)]"
            >
              <LifePhoto src={eventCover(nextEvent)} className="h-[108px] w-[108px] shrink-0" />
              <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ckc-gold-dim">
                  {nextEvent.date} · {nextEvent.time}
                </p>
                <p className="mt-1 line-clamp-2 text-[15px] font-semibold text-ckc-black">{nextEvent.title}</p>
                <p className="mt-1 text-xs text-ckc-muted">{nextEvent.location || nextEvent.category}</p>
              </div>
              <div className="flex items-center pr-4 text-ckc-gold-dim">
                <Icon name="ChevronRightIcon" size={18} variant="outline" />
              </div>
            </Link>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3 px-5 pt-6">
          {QUICK_LINKS.map((tile) => (
            <Link key={tile.href} href={tile.href} className="group relative h-[118px] overflow-hidden rounded-[22px]">
              <LifePhoto src={tile.image} className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <p className="absolute bottom-3 left-3 text-[15px] font-semibold text-white">{tile.label}</p>
            </Link>
          ))}
        </div>

        <GetInvolvedFooter fill />
      </div>
    </AppShell>
  );
}
