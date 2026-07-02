'use client';

import React, { useState } from 'react';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';

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

  return (
    <AppShell access="shared">
      <div className="life-section space-y-3">
        <div>
          <p className="text-[10px] text-ckc-gold">Series</p>
          <h1 className="text-base font-medium capitalize text-ckc-black">{seriesTitle}</h1>
        </div>

        {currentLesson && (
          <div className="rounded-xl bg-ckc-card p-3">
            <p className="text-[9px] text-ckc-gold">Current week</p>
            <p className="text-xs font-medium text-white">
              Week {currentLesson.week} — {currentLesson.title}
            </p>
            <p className="text-[10px] text-[#999]">{currentLesson.scripture}</p>
          </div>
        )}

        <div className="space-y-1.5">
          {lessons.map((lesson) => {
            const isActive = lesson.week === activeWeek;
            const label = `Week ${lesson.week} — ${lesson.title}`;

            return (
              <button
                key={lesson.id}
                type="button"
                onClick={() => setActiveWeek(lesson.week)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[11px] transition-colors ${
                  isActive
                    ? 'border border-ckc-gold text-ckc-black'
                    : 'border border-[#E5E5E5] text-ckc-black'
                }`}
              >
                <span>{label}</span>
                {lesson.completed && (
                  <Icon name="CheckIcon" size={13} variant="outline" className="text-[#639922]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
