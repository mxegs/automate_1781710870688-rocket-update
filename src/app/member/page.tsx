'use client';

import React, { useState, useEffect, useRef } from 'react';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';
import { getDisplayName, getSession } from '@/lib/auth/session';
import { getMemberEventsFeed } from '@/lib/events/service';
import { getMemberMediaFeed } from '@/lib/sermons/service';
import { resolveMemberCampus } from '@/lib/member/campus';
import SocialFeed from '@/components/member/SocialFeed';
import { getThumbnailUrl } from '@/lib/sermons/utils';
import type { ChurchEvent } from '@/lib/events/types';
import type { MediaItem } from '@/lib/sermons/types';

const dailyVerses = [
  { verse: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.', ref: 'Jeremiah 29:11' },
  { verse: 'I can do all this through him who gives me strength.', ref: 'Philippians 4:13' },
  { verse: 'The Lord is my shepherd, I lack nothing.', ref: 'Psalm 23:1' },
  { verse: 'Trust in the Lord with all your heart and lean not on your own understanding.', ref: 'Proverbs 3:5' },
  { verse: 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.', ref: 'Joshua 1:9' },
  { verse: 'And we know that in all things God works for the good of those who love him.', ref: 'Romans 8:28' },
  { verse: 'Cast all your anxiety on him because he cares for you.', ref: '1 Peter 5:7' },
];

const notifications = [
  { id: 1, type: 'birthday', message: 'Today is your birthday! 🎂 The church family celebrates you!', time: 'Today', read: false },
  { id: 2, type: 'event', message: 'Youth Night is tomorrow at 18:30 in the Youth Hall', time: '1 day ago', read: false },
  { id: 3, type: 'announcement', message: 'New Bible Study Series Starting July — register now', time: '2 days ago', read: true },
  { id: 4, type: 'prayer', message: 'Your prayer request has been assigned to the prayer team', time: '3 days ago', read: true },
];

const typeColors: Record<string, string> = {
  'Sunday Service': 'bg-sky/10 text-sky border-sky/20',
  'Youth Event': 'bg-purple-500/10 text-purple-400 border-purple-400/20',
  'Prayer Meeting': 'bg-rose-500/10 text-rose-400 border-rose-400/20',
  "Men's Ministry": 'bg-blue-500/10 text-blue-400 border-blue-400/20',
  "Women's Ministry": 'bg-pink-500/10 text-pink-400 border-pink-400/20',
  'Conference': 'bg-amber-500/10 text-amber-400 border-amber-400/20',
};

interface GivingForm {
  name: string;
  amount: string;
  reference: string;
  type: string;
}

export default function MemberHomePage() {
  const [verse, setVerse] = useState(dailyVerses[0]);
  const [userName, setUserName] = useState('Member');
  const [greeting, setGreeting] = useState('Good morning');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifList, setNotifList] = useState(notifications.filter((n) => n.type !== 'birthday'));
  const [myBirthday, setMyBirthday] = useState(false);
  const [birthdayName, setBirthdayName] = useState<string | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<ChurchEvent[]>([]);
  const [latestSermon, setLatestSermon] = useState<MediaItem | null>(null);
  const [givingForm, setGivingForm] = useState<GivingForm>({ name: '', amount: '', reference: '', type: 'Tithe' });
  const [givingSubmitted, setGivingSubmitted] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifList.filter((n) => !n.read).length;

  useEffect(() => {
    const dayIndex = new Date().getDay();
    setVerse(dailyVerses[dayIndex % dailyVerses.length]);
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening');
    const session = getSession();
    const displayName = getDisplayName(session);
    setUserName(displayName);
    setGivingForm((f) => ({ ...f, name: displayName }));

    (async () => {
      const campus = await resolveMemberCampus();
      const isVisitor = session?.role === 'visitor';
      const events = await getMemberEventsFeed({ memberCampus: campus, isVisitor });
      setUpcomingEvents(events.slice(0, 4));
      const sermons = await getMemberMediaFeed({ memberCampus: campus, isVisitor });
      setLatestSermon(sermons[0] ?? null);

      const phoneDigits = session?.phone?.replace(/\D/g, '') ?? '';
      try {
        const res = await fetch(`/api/members/birthdays?phone=${encodeURIComponent(phoneDigits)}`);
        const data = (await res.json()) as {
          myBirthday?: boolean;
          myFirstName?: string | null;
          celebrants?: { name: string; phone: string }[];
        };
        setMyBirthday(Boolean(data.myBirthday));
        setBirthdayName(data.myFirstName ?? displayName.split(' ')[0] ?? 'Friend');

        const birthdayNotifs = (data.celebrants ?? [])
          .filter((c) => c.phone.replace(/\D/g, '') !== phoneDigits)
          .map((c, i) => ({
            id: 1000 + i,
            type: 'birthday' as const,
            message: `Wish ${c.name} a happy birthday today! 🎂`,
            time: 'Today',
            read: false,
          }));

        if (birthdayNotifs.length > 0) {
          setNotifList((prev) => [...birthdayNotifs, ...prev]);
        }
      } catch {
        // Non-fatal
      }
    })();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGivingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGivingSubmitted(true);
  };

  const markAllRead = () => {
    setNotifList((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const notifIcon: Record<string, string> = {
    birthday: '🎂',
    event: '📅',
    announcement: '📢',
    prayer: '🙏',
  };

  return (
    <AppShell>
      <div className="space-y-6">

        {/* Top bar: Welcome + Notification Bell */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-cloud/50 text-sm">{greeting}</p>
            <h1 className="text-2xl font-bold text-cloud">{userName} 👋</h1>
          </div>
          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:border-sky/30 hover:bg-sky/5 transition-all"
              aria-label="Notifications"
            >
              <Icon name="BellIcon" size={18} variant="outline" className="text-cloud/70" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                  <span className="text-sm font-semibold text-cloud">Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-sky hover:text-sky/80 transition-colors">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifList.map((notif) => (
                    <div
                      key={notif.id}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-white/5 last:border-0 transition-colors ${!notif.read ? 'bg-sky/5' : ''}`}
                    >
                      <span className="text-lg flex-shrink-0 mt-0.5">{notifIcon[notif.type]}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-relaxed ${!notif.read ? 'text-cloud' : 'text-cloud/50'}`}>{notif.message}</p>
                        <p className="text-cloud/30 text-xs mt-1">{notif.time}</p>
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 rounded-full bg-sky flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {myBirthday && (
          <div className="birthday-banner relative overflow-hidden rounded-2xl border border-rose-400/30 p-5 text-center">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-around opacity-30 text-2xl">
              <span className="birthday-emoji">🎂</span>
              <span className="birthday-emoji">🎉</span>
              <span className="birthday-emoji">✨</span>
              <span className="birthday-emoji">🎈</span>
            </div>
            <p className="relative text-lg font-bold text-cloud">
              Happy Birthday, {birthdayName}! 🎂
            </p>
            <p className="relative mt-1 text-sm text-cloud/70">
              The CKC family celebrates you today — may God bless your new year!
            </p>
          </div>
        )}

        {/* Quick Nav Links */}
        <div className="flex gap-2 flex-wrap">
          {[
            { label: 'Sermons', href: '/member/sermons', icon: 'PlayCircleIcon', color: 'sky' },
            { label: 'Events', href: '/member/events', icon: 'CalendarDaysIcon', color: 'amber' },
            { label: 'Prayer', href: '/member/prayer', icon: 'HeartIcon', color: 'rose' },
            { label: 'Bible Study', href: '/member/bible-study', icon: 'BookOpenIcon', color: 'emerald' },
            { label: 'Give', href: '/member/give', icon: 'GiftIcon', color: 'amber' },
            { label: 'Church Info', href: '/member/church-info', icon: 'BuildingLibraryIcon', color: 'purple' },
          ].map((ql) => (
            <Link
              key={ql.label}
              href={ql.href}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:scale-105 ${
                ql.color === 'sky' ? 'bg-sky/10 text-sky border-sky/20 hover:bg-sky/20' :
                ql.color === 'rose' ? 'bg-rose-500/10 text-rose-400 border-rose-400/20 hover:bg-rose-500/20' :
                ql.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20 hover:bg-emerald-500/20' :
                ql.color === 'purple'? 'bg-purple-500/10 text-purple-400 border-purple-400/20 hover:bg-purple-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-400/20 hover:bg-amber-500/20'
              }`}
            >
              <Icon name={ql.icon} size={13} variant="outline" />
              {ql.label}
            </Link>
          ))}
        </div>

        {/* Main Grid: Latest Sermon + Daily Verse */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Latest Sermon */}
          {latestSermon ? (
          <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-sky/20 transition-all group">
            <div className="relative aspect-video bg-black/40">
              {latestSermon.youtubeId ? (
                <img
                  src={getThumbnailUrl(latestSermon) ?? ''}
                  alt={`Sermon thumbnail for "${latestSermon.title}"`}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon name="PlayCircleIcon" size={48} variant="outline" className="text-cloud/20" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              {latestSermon.youtubeId && (
              <div className="absolute inset-0 flex items-center justify-center">
                <a
                  href={`https://www.youtube.com/watch?v=${latestSermon.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110"
                  aria-label={`Play sermon: ${latestSermon.title}`}
                >
                  <Icon name="PlayIcon" size={22} variant="solid" className="text-white ml-1" />
                </a>
              </div>
              )}
              <div className="absolute top-3 left-3">
                <span className="bg-sky/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full">Latest Sermon</span>
              </div>
              {latestSermon.duration && (
              <div className="absolute bottom-3 right-3">
                <span className="bg-black/60 text-white/80 text-xs px-2 py-0.5 rounded-full">{latestSermon.duration}</span>
              </div>
              )}
            </div>
            <div className="p-4">
              {latestSermon.series && <p className="text-xs text-sky font-medium mb-1">{latestSermon.series}</p>}
              <h3 className="text-cloud font-bold text-base leading-snug">{latestSermon.title}</h3>
              <p className="text-cloud/50 text-xs mt-1">{latestSermon.preacher} · {latestSermon.date}</p>
              {latestSermon.description && <p className="text-cloud/40 text-xs mt-2 leading-relaxed line-clamp-2">{latestSermon.description}</p>}
              <Link href="/member/sermons" className="inline-flex items-center gap-1 text-xs text-sky hover:text-sky/80 mt-3 transition-colors">
                View all sermons <Icon name="ArrowRightIcon" size={11} variant="outline" />
              </Link>
            </div>
          </div>
          ) : (
          <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-8 flex items-center justify-center">
            <p className="text-cloud/40 text-sm text-center">No sermons yet — your campus will add messages soon.</p>
          </div>
          )}

          {/* Daily Verse */}
          <div className="bg-gradient-to-br from-amber-500/10 via-white/5 to-transparent border border-amber-400/20 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Icon name="BookOpenIcon" size={14} variant="outline" className="text-amber-400" />
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Daily Verse</span>
              </div>
              <blockquote className="text-cloud/80 text-sm leading-relaxed italic">
                &ldquo;{verse.verse}&rdquo;
              </blockquote>
            </div>
            <div className="mt-4">
              <p className="text-amber-400 text-sm font-bold">{verse.ref}</p>
              <p className="text-cloud/30 text-xs mt-1">Verse of the day</p>
            </div>
          </div>
        </div>

        {/* Upcoming Events with Thumbnails */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-cloud flex items-center gap-2">
              <Icon name="CalendarDaysIcon" size={15} variant="outline" className="text-amber-400" />
              Upcoming Events
            </h2>
            <Link href="/member/events" className="text-xs text-sky hover:text-sky/80 transition-colors">View all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {upcomingEvents.map((ev) => {
              const typeColor = typeColors[ev.category] || 'bg-white/5 text-cloud/40 border-white/10';
              return (
                <Link key={ev.id} href={`/member/events/${ev.id}`} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-sky/20 transition-all group">
                  {ev.imageUrl ? (
                    <div className="relative aspect-video bg-black/40">
                      <img src={ev.imageUrl} alt={ev.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-2 left-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${typeColor}`}>{ev.category}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video bg-white/5 flex items-center justify-center">
                      <Icon name="CalendarDaysIcon" size={24} variant="outline" className="text-cloud/20" />
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-cloud text-xs font-semibold leading-snug line-clamp-2">{ev.title}</p>
                    <p className="text-cloud/40 text-[10px] mt-1">{ev.date} · {ev.time}</p>
                    <p className="mt-2 text-[10px] text-ckc-gold font-semibold">RSVP →</p>
                  </div>
                </Link>
              );
            })}
            {upcomingEvents.length === 0 && (
              <p className="text-cloud/40 text-xs col-span-full py-4 text-center">No upcoming events — check back soon.</p>
            )}
          </div>
        </div>

        {/* Social Media Feed Placeholder + Give CTA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SocialFeed />

          {/* Give CTA */}
          <div className="bg-gradient-to-br from-amber-500/10 via-white/5 to-transparent border border-amber-400/20 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Icon name="GiftIcon" size={15} variant="outline" className="text-amber-400" />
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Give Online</span>
              </div>
              <h3 className="text-cloud font-bold text-lg leading-snug mb-2">Support the Work of the Church</h3>
              <p className="text-cloud/50 text-sm leading-relaxed">Your tithes, offerings, and special contributions help us serve our community and advance the Kingdom.</p>
              <div className="mt-4 space-y-2">
                {['Tithe', 'Offering', 'Building Fund', 'Missions'].map((type) => (
                  <div key={type} className="flex items-center gap-2 text-xs text-cloud/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />
                    {type}
                  </div>
                ))}
              </div>
            </div>
            <Link
              href="/member/give"
              className="mt-5 flex items-center justify-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-400 font-semibold text-sm py-3 rounded-xl transition-all hover:scale-[1.01]"
            >
              <Icon name="CreditCardIcon" size={15} variant="outline" />
              Give Now →
            </Link>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
