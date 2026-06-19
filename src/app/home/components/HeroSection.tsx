'use client';

import React, { useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface StatConfig {
  value: number;
  decimals: number;
  suffix: string;
  prefix?: string;
  label: string;
  sublabel: string;
}

const STATS: StatConfig[] = [
  {
    value: 12.4,
    decimals: 1,
    suffix: ' hrs/week',
    label: 'saved per staff member',
    sublabel: 'Across giving, scheduling, and follow-up workflows',
  },
  {
    value: 97,
    decimals: 0,
    suffix: '%',
    label: 'volunteer confirmation rate',
    sublabel: 'vs. 61% industry average with manual reminders',
  },
  {
    value: 3.2,
    decimals: 1,
    suffix: 'x',
    label: 'increase in first-time guest follow-through',
    sublabel: 'Triggered within 24 hrs — no pastor action required',
  },
];

function useCountUp(target: number, decimals: number, duration = 1800, started: boolean) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!started) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(parseFloat((eased * target).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, decimals, duration, started]);

  return current;
}

function StatCounter({ stat, started, delay }: { stat: StatConfig; started: boolean; delay: number }) {
  const [localStarted, setLocalStarted] = useState(false);
  const count = useCountUp(stat.value, stat.decimals, 1800, localStarted);

  useEffect(() => {
    if (started) {
      const t = setTimeout(() => setLocalStarted(true), delay);
      return () => clearTimeout(t);
    }
  }, [started, delay]);

  return (
    <div className="stat-card rounded-lg p-8 flex flex-col gap-3 hover-lift relative overflow-hidden">
      {/* Sky accent line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-sky to-transparent opacity-60" />
      
      <div className="sky-number text-[clamp(2.8rem,5vw,4.5rem)] tracking-tighter leading-none counter-animate">
        {stat.prefix}{count.toFixed(stat.decimals)}{stat.suffix}
      </div>
      <div className="text-cloud font-semibold text-base leading-tight">{stat.label}</div>
      <div className="text-admin text-sm leading-relaxed font-light">{stat.sublabel}</div>
    </div>
  );
}

export default function HeroSection() {
  const [started, setStarted] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), 400);
    return () => clearTimeout(timer);
  }, []);

  // Line reveal
  useEffect(() => {
    const timer = setTimeout(() => {
      document.querySelectorAll('.line-reveal').forEach((el) => el.classList.add('revealed'));
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex flex-col justify-center pt-28 pb-20 px-6 noise-overlay overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)' }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(14,165,233,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14,165,233,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Glow orb */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Report badge */}
        <div className="mb-8">
          <span className="report-badge">
            <span className="w-1.5 h-1.5 rounded-full bg-sky inline-block animate-pulse" />
            2026 State of Church Operations Report
          </span>
        </div>

        {/* Headline */}
        <div className="mb-6">
          <h1 className="text-[clamp(2.8rem,7vw,7rem)] font-bold tracking-tightest leading-[1.0] text-cloud">
            <span className="line-reveal"><span>Your church runs</span></span>
            <span className="line-reveal" style={{ transitionDelay: '0.12s' }}>
              <span>
                itself.{' '}
                <span
                  className="font-light italic"
                  style={{ color: 'var(--sky)', fontFamily: 'DM Sans, sans-serif' }}
                >
                  Finally.
                </span>
              </span>
            </span>
          </h1>
        </div>

        {/* Subline */}
        <p
          className="text-cloud/80 text-xl md:text-2xl font-light max-w-2xl mb-4 leading-relaxed"
          style={{ opacity: 0, animation: 'countUp 0.8s 0.7s forwards' }}
        >
          What happens when your church runs itself.
        </p>

        {/* Secondary CTA */}
        <div
          className="flex flex-wrap items-center gap-4 mb-20"
          style={{ opacity: 0, animation: 'countUp 0.8s 0.9s forwards' }}
        >
          <a
            href="#problem"
            className="inline-flex items-center gap-2 text-sky text-sm font-semibold uppercase tracking-widest border-b border-sky/40 pb-1 hover:border-sky transition-all"
          >
            Read the Full Report
            <Icon name="ArrowDownIcon" size={14} variant="outline" />
          </a>
          <span className="text-admin/40 hidden md:block">·</span>
          <span className="text-admin text-sm">Based on 847 churches surveyed, Q4 2025</span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STATS.map((stat, i) => (
            <StatCounter key={i} stat={stat} started={started} delay={i * 180} />
          ))}
        </div>

        {/* Divider */}
        <div className="gradient-divider mt-16" />
        <div className="flex items-center justify-between mt-6 text-admin text-xs font-mono uppercase tracking-widest">
          <span>Automate v3.2 · Live</span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sky inline-block sky-pulse" />
            847 pipelines running now
          </span>
        </div>
      </div>
    </section>
  );
}