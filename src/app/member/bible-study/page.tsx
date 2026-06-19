'use client';

import React, { useState } from 'react';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';

interface BibleStudyLesson {
  id: number;
  title: string;
  series: string;
  week: number;
  scripture: string;
  summary: string;
  keyPoints: string[];
  date: string;
  leader: string;
  youtubeId?: string;
  completed: boolean;
}

const lessons: BibleStudyLesson[] = [
  {
    id: 1,
    title: 'Who Is God? — The Nature of the Father',
    series: 'Foundations of Faith',
    week: 1,
    scripture: 'John 4:24; Exodus 3:14; Isaiah 40:28',
    summary: 'An introduction to the nature and character of God — His omnipotence, omniscience, and eternal love for humanity.',
    keyPoints: ['God is Spirit — He is not limited by physical form', 'God is eternal — He has no beginning or end', 'God is love — His nature is defined by love (1 John 4:8)', 'We can know God personally through Jesus Christ'],
    date: '2 Jul 2025',
    leader: 'Pastor James Mokoena',
    completed: false,
  },
  {
    id: 2,
    title: 'The Authority of Scripture',
    series: 'Foundations of Faith',
    week: 2,
    scripture: '2 Timothy 3:16-17; Psalm 119:105; Hebrews 4:12',
    summary: 'Understanding why the Bible is the inspired Word of God and how it serves as our ultimate guide for life and faith.',
    keyPoints: ['All Scripture is God-breathed (2 Tim 3:16)', 'The Bible is our lamp and light (Psalm 119:105)', 'The Word is living and active — it transforms us', 'How to read and study the Bible effectively'],
    date: '9 Jul 2025',
    leader: 'Elder Ruth Khumalo',
    completed: false,
  },
  {
    id: 3,
    title: 'Salvation — The Gift of Grace',
    series: 'Foundations of Faith',
    week: 3,
    scripture: 'Ephesians 2:8-9; Romans 10:9-10; John 3:16',
    summary: 'Exploring the doctrine of salvation — what it means to be saved, how we receive it, and what changes in our lives.',
    keyPoints: ['Salvation is by grace through faith — not works', 'Confession and belief lead to salvation (Romans 10:9)', 'We are new creations in Christ (2 Cor 5:17)', 'Assurance of salvation — how to know you are saved'],
    date: '16 Jul 2025',
    leader: 'Pastor James Mokoena',
    completed: false,
  },
  {
    id: 4,
    title: 'The Holy Spirit — Our Helper',
    series: 'Foundations of Faith',
    week: 4,
    scripture: 'John 14:16-17; Acts 1:8; Galatians 5:22-23',
    summary: 'Who is the Holy Spirit, what does He do, and how do we live a Spirit-filled life?',
    keyPoints: ['The Holy Spirit is the third person of the Trinity', 'He is our Comforter, Guide, and Teacher', 'The fruit of the Spirit (Galatians 5:22-23)', 'Being filled with the Spirit daily'],
    date: '23 Jul 2025',
    leader: 'Elder Ruth Khumalo',
    completed: false,
  },
  {
    id: 5,
    title: 'Prayer — Communicating with God',
    series: 'Foundations of Faith',
    week: 5,
    scripture: 'Matthew 6:9-13; Philippians 4:6-7; James 5:16',
    summary: 'Understanding prayer as a two-way conversation with God — how to pray, what to pray, and why prayer matters.',
    keyPoints: ['The Lord\'s Prayer as a model (Matthew 6:9-13)', 'Pray with thanksgiving and supplication (Phil 4:6)', 'The prayer of a righteous person is powerful (James 5:16)', 'Developing a daily prayer habit'],
    date: '30 Jul 2025',
    leader: 'Pastor James Mokoena',
    completed: false,
  },
];

const devotionals = [
  { day: 'Monday', title: 'Start with Gratitude', verse: 'Give thanks in all circumstances. — 1 Thessalonians 5:18', reflection: 'Begin each week by counting your blessings. Gratitude shifts our perspective from what we lack to what God has provided.' },
  { day: 'Tuesday', title: 'Walk in the Spirit', verse: 'Walk by the Spirit, and you will not gratify the desires of the flesh. — Galatians 5:16', reflection: 'Living Spirit-led means making daily choices that align with God\'s Word and the promptings of the Holy Spirit.' },
  { day: 'Wednesday', title: 'Seek His Face', verse: 'Seek the Lord and his strength; seek his presence continually. — Psalm 105:4', reflection: 'Midweek is a good time to pause and reconnect with God. Take a moment today to simply be in His presence.' },
  { day: 'Thursday', title: 'Love One Another', verse: 'A new command I give you: Love one another. — John 13:34', reflection: 'Love is not just a feeling — it\'s a choice and an action. Who can you show love to today in a practical way?' },
  { day: 'Friday', title: 'Rest in His Peace', verse: 'Peace I leave with you; my peace I give you. — John 14:27', reflection: 'As the week ends, release your worries to God. His peace surpasses all understanding and guards your heart.' },
];

export default function BibleStudyPage() {
  const [activeTab, setActiveTab] = useState<'series' | 'devotional' | 'give'>('series');
  const [expandedLesson, setExpandedLesson] = useState<number | null>(1);

  const today = new Date().getDay(); // 0=Sun, 1=Mon...
  const todayDevotional = devotionals[Math.max(0, today - 1) % devotionals.length];

  return (
    <AppShell access="shared">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-cloud">Bible Study</h1>
          <p className="text-cloud/40 text-sm mt-0.5">Weekly series, devotionals, scripture study, and giving</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
          {([
            { id: 'series', label: 'Study Series', icon: 'BookOpenIcon' },
            { id: 'devotional', label: 'Daily Devotional', icon: 'SunIcon' },
            { id: 'give', label: 'Give', icon: 'GiftIcon' },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-sky/10 text-sky border border-sky/20' : 'text-cloud/50 hover:text-cloud'
              }`}
            >
              <Icon name={tab.icon} size={13} variant="outline" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'series' && (
          <div className="space-y-4">
            {/* Series header */}
            <div className="bg-gradient-to-r from-emerald-500/10 via-white/5 to-transparent border border-emerald-400/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="BookOpenIcon" size={16} variant="outline" className="text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Current Series</span>
              </div>
              <h2 className="text-cloud font-bold text-lg">Foundations of Faith</h2>
              <p className="text-cloud/50 text-sm mt-1">An 8-week journey through the core foundations of the Christian faith. Every Wednesday at 18:30 in the Fellowship Hall.</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-cloud/40">
                <span className="flex items-center gap-1"><Icon name="CalendarDaysIcon" size={11} variant="outline" />Starting 2 Jul 2025</span>
                <span className="flex items-center gap-1"><Icon name="ClockIcon" size={11} variant="outline" />8 weeks</span>
                <span className="flex items-center gap-1"><Icon name="MapPinIcon" size={11} variant="outline" />Fellowship Hall</span>
              </div>
            </div>

            {/* Lessons */}
            <div className="space-y-3">
              {lessons.map((lesson) => (
                <div key={lesson.id} className={`bg-white/5 border rounded-2xl overflow-hidden transition-all ${expandedLesson === lesson.id ? 'border-emerald-400/20' : 'border-white/10 hover:border-emerald-400/10'}`}>
                  <button
                    onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}
                    className="w-full text-left p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${lesson.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-cloud/50'}`}>
                          {lesson.completed ? <Icon name="CheckIcon" size={14} variant="outline" /> : lesson.week}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-cloud font-semibold text-sm">{lesson.title}</p>
                          <p className="text-cloud/40 text-xs mt-0.5">{lesson.date} · {lesson.leader}</p>
                          <p className="text-emerald-400/70 text-xs mt-0.5 font-mono">{lesson.scripture}</p>
                        </div>
                      </div>
                      <Icon name={expandedLesson === lesson.id ? 'ChevronUpIcon' : 'ChevronDownIcon'} size={15} variant="outline" className="text-cloud/30 flex-shrink-0" />
                    </div>
                  </button>
                  {expandedLesson === lesson.id && (
                    <div className="px-5 pb-5">
                      <div className="h-px bg-white/5 mb-4" />
                      <p className="text-cloud/60 text-sm leading-relaxed mb-4">{lesson.summary}</p>
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-cloud/50 uppercase tracking-wider mb-2">Key Points</p>
                        <ul className="space-y-2">
                          {lesson.keyPoints.map((point, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-cloud/70">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {lesson.youtubeId && (
                        <a
                          href={`https://www.youtube.com/watch?v=${lesson.youtubeId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Icon name="PlayCircleIcon" size={14} variant="outline" />
                          Watch recording on YouTube
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'devotional' && (
          <div className="space-y-4">
            {/* Today's devotional */}
            <div className="bg-gradient-to-br from-amber-500/10 via-white/5 to-transparent border border-amber-400/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="SunIcon" size={15} variant="outline" className="text-amber-400" />
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Today — {todayDevotional.day}</span>
              </div>
              <h2 className="text-cloud font-bold text-lg mb-3">{todayDevotional.title}</h2>
              <blockquote className="border-l-2 border-amber-400/40 pl-4 mb-4">
                <p className="text-cloud/80 text-sm italic leading-relaxed">&ldquo;{todayDevotional.verse}&rdquo;</p>
              </blockquote>
              <p className="text-cloud/60 text-sm leading-relaxed">{todayDevotional.reflection}</p>
            </div>

            {/* All devotionals */}
            <div className="space-y-3">
              {devotionals.map((dev, i) => (
                <div key={i} className={`bg-white/5 border border-white/10 rounded-xl p-4 ${dev.day === todayDevotional.day ? 'border-amber-400/20' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${dev.day === todayDevotional.day ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-cloud/40'}`}>
                      {dev.day.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-cloud text-sm font-semibold">{dev.title}</p>
                      <p className="text-cloud/40 text-xs mt-0.5 italic">{dev.verse}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'give' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-amber-500/10 via-white/5 to-transparent border border-amber-400/20 rounded-2xl p-5">
              <blockquote className="text-cloud/70 text-sm italic leading-relaxed">
                &ldquo;Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.&rdquo;
              </blockquote>
              <p className="text-amber-400 text-xs font-semibold mt-2">— 2 Corinthians 9:7</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-400/20 flex items-center justify-center mx-auto mb-4">
                <Icon name="GiftIcon" size={24} variant="outline" className="text-amber-400" />
              </div>
              <h3 className="text-cloud font-bold text-base mb-2">Give Online</h3>
              <p className="text-cloud/50 text-sm mb-5">Support the work of the church with your tithes, offerings, and special contributions.</p>
              <Link
                href="/member/give"
                className="inline-flex items-center justify-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-400 font-semibold text-sm py-3 px-8 rounded-xl transition-all hover:scale-[1.01]"
              >
                <Icon name="CreditCardIcon" size={15} variant="outline" />
                Go to Give Page →
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
