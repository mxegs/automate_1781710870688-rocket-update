'use client';

import React, { useState } from 'react';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import LifeHero from '@/components/church-life/LifeHero';
import { LIFE_PHOTOS, lifeImageFor } from '@/lib/church-life/imagery';

interface BibleStudyLesson {
  id: number;
  title: string;
  series: string;
  week: number;
  scripture: string;
  completed: boolean;
}

const lessons: BibleStudyLesson[] = [
  { id: 1, title: 'The living Word', series: 'Foundations of faith', week: 1, scripture: 'John 1:1-5', completed: true },
  { id: 2, title: 'The authority of Scripture', series: 'Foundations of faith', week: 2, scripture: '2 Timothy 3:16-17', completed: false },
  { id: 3, title: 'Grace and truth', series: 'Foundations of faith', week: 3, scripture: 'John 1:14-17', completed: false },
  { id: 4, title: 'The Holy Spirit — Our Helper', series: 'Foundations of faith', week: 4, scripture: 'John 14:16-17', completed: false },
  { id: 5, title: 'Prayer — Communicating with God', series: 'Foundations of faith', week: 5, scripture: 'Matthew 6:9-13', completed: false },
];

const CURRENT_WEEK = 3;

export default function BibleStudyPage() {
  const [activeWeek, setActiveWeek] = useState(CURRENT_WEEK);
  const seriesTitle = lessons[0]?.series ?? 'Foundations of faith';
  const currentLesson = lessons.find((l) => l.week === CURRENT_WEEK);
  const activeLesson = lessons.find((l) => l.week === activeWeek) ?? currentLesson;

  return (
    <AppShell access="shared">
      <div className="px-5 pb-8 pt-5">
        <LifeHero
          imageUrl={LIFE_PHOTOS.bible}
          titleLead={seriesTitle}
          titleRest={currentLesson ? `Week ${currentLesson.week} · ${currentLesson.title}` : 'Daily Word'}
          badge="Bible study"
        />

        {activeLesson ? (
          <div className="mt-5 rounded-[22px] bg-white p-5 shadow-[0_10px_28px_rgba(26,22,18,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ckc-gold-dim">This week</p>
            <p className="mt-1 text-lg font-semibold text-ckc-black">
              Week {activeLesson.week} — {activeLesson.title}
            </p>
            <p className="mt-1 text-sm text-ckc-muted">{activeLesson.scripture}</p>
          </div>
        ) : null}

        <div className="mt-5 space-y-3">
          {lessons.map((lesson) => {
            const isActive = lesson.week === activeWeek;
            return (
              <button
                key={lesson.id}
                type="button"
                onClick={() => setActiveWeek(lesson.week)}
                className={`flex w-full items-center gap-3 overflow-hidden rounded-[20px] bg-white p-2 pr-4 text-left shadow-[0_8px_24px_rgba(26,22,18,0.06)] ${
                  isActive ? 'ring-2 ring-ckc-gold' : ''
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={lifeImageFor(`bible-${lesson.week}`)}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-[14px] object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold text-ckc-black">
                    Week {lesson.week} — {lesson.title}
                  </p>
                  <p className="mt-0.5 text-xs text-ckc-muted">{lesson.scripture}</p>
                </div>
                {lesson.completed ? (
                  <Icon name="CheckIcon" size={16} variant="outline" className="shrink-0 text-[#639922]" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
