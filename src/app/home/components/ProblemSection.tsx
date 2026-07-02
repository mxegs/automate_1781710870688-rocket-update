'use client';

import React, { useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

const PROBLEM_STATS = [
  {
    figure: '73%',
    headline: 'of churches over 500 members still run giving reconciliation manually',
    detail: 'Average time: 4.1 hours every Sunday. That\'s a full work-week lost every month to copy-paste.',
    source: 'Church Admin Survey 2025, n=847',
  },
  {
    figure: '61%',
    headline: 'volunteer confirmation rate when reminders are sent by hand',
    detail: 'One missed Sunday slot costs $340 in reactive staffing. Multiply by 52 Sundays.',
    source: 'Volunteer Management Index, Q3 2025',
  },
  {
    figure: '68%',
    headline: 'of first-time guests never receive a follow-up within 72 hours',
    detail: 'The window closes. Research shows follow-up after 72 hrs drops return likelihood by 4x.',
    source: 'Guest Retention Study, Lifeway Research 2025',
  },
  {
    figure: '15 hrs',
    headline: 'lost per week by solo pastors to tasks software should automate',
    detail: 'ChurchTrak export → Excel → Mailchimp. Repeated every week. Every single week.',
    source: 'Solo Pastor Operations Audit, Automate 2025',
  },
];

const PAIN_QUOTES = [
  {
    quote: 'I spend Sunday evenings manually entering attendance into three different systems.',
    role: 'Executive Pastor',
    church: 'Grace Community Church · 1,200 members · Nashville, TN',
  },
  {
    quote: 'We duct-taped Planning Center to Mailchimp with Zapier. It breaks every other week.',
    role: 'Operations Director',
    church: 'Elevation Church · 3,400 members · Charlotte, NC',
  },
  {
    quote: 'I found out a first-time family visited four weeks ago. We still haven\'t followed up.',
    role: 'Solo Pastor',
    church: 'Cornerstone Fellowship · 210 members · Boise, ID',
  },
];

export default function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('hidden-init');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const els = sectionRef?.current?.querySelectorAll('.scroll-reveal');
    els?.forEach((el) => {
      el?.classList?.add('hidden-init');
      observer?.observe(el);
    });

    return () => observer?.disconnect();
  }, []);

  return (
    <section id="problem" ref={sectionRef} className="py-28 px-6" style={{ background: '#0A0A0A' }}>
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <div className="scroll-reveal mb-4">
          <span className="report-badge mb-6 inline-flex">
            <Icon name="DocumentChartBarIcon" size={12} variant="outline" />
            Section 01 — The Problem
          </span>
        </div>
        <div className="scroll-reveal mb-6" style={{ transitionDelay: '0.08s' }}>
          <h2 className="text-[clamp(2rem,5vw,4.5rem)] font-bold tracking-tightest leading-[1.05] text-cloud">
            The average church loses{' '}
            <span className="sky-number text-[clamp(2rem,5vw,4.5rem)]">740 hours/year</span>
            <br />
            <span className="font-light text-admin">to work that should be automated.</span>
          </h2>
        </div>
        <div className="scroll-reveal mb-16" style={{ transitionDelay: '0.16s' }}>
          <p className="text-admin text-lg max-w-2xl leading-relaxed font-light">
            We audited 847 churches across 38 states. What we found isn't a technology problem — it's a disconnection problem. Every system works in isolation. Nothing talks to anything else.
          </p>
        </div>

        {/* Problem stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-20">
          {PROBLEM_STATS?.map((stat, i) => (
            <div
              key={i}
              className="scroll-reveal problem-card rounded-lg p-8"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="sky-number text-5xl md:text-6xl mb-4">{stat?.figure}</div>
              <h3 className="text-cloud font-semibold text-lg leading-snug mb-3">{stat?.headline}</h3>
              <p className="text-admin text-sm leading-relaxed mb-4 font-light">{stat?.detail}</p>
              <span className="font-mono text-[10px] text-admin/50 uppercase tracking-widest">{stat?.source}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="gradient-divider mb-16 scroll-reveal" />

        {/* Pain quotes */}
        <div className="scroll-reveal mb-4">
          <h3 className="text-admin text-xs font-mono uppercase tracking-widest mb-8">
            From the field — verbatim
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PAIN_QUOTES?.map((q, i) => (
            <div
              key={i}
              className="scroll-reveal problem-card rounded-lg p-7"
              style={{ transitionDelay: `${i * 0.12}s` }}
            >
              <Icon name="ChatBubbleLeftRightIcon" size={20} variant="outline" className="text-ckc-gold mb-4 opacity-60" />
              <p className="text-cloud text-base leading-relaxed font-light italic mb-5">
                "{q?.quote}"
              </p>
              <div>
                <span className="block text-cloud text-sm font-semibold">{q?.role}</span>
                <span className="block text-admin text-xs font-mono mt-1">{q?.church}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Transition line */}
        <div className="mt-20 scroll-reveal">
          <div className="flex items-center gap-4">
            <div className="gradient-divider flex-1" />
            <span className="text-admin text-xs font-mono uppercase tracking-widest whitespace-nowrap px-4">
              Section 02 — The Fix
            </span>
            <div className="gradient-divider flex-1" />
          </div>
        </div>
      </div>
    </section>
  );
}