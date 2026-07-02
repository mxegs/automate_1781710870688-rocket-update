'use client';

import React, { useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Integration {
  name: string;
  category: string;
  icon: string;
  color: string;
  description: string;
}

const INTEGRATIONS: Integration[] = [
  { name: 'Planning Center', category: 'ChMS', icon: '🗓', color: '#4F46E5', description: 'Scheduling, people, check-ins' },
  { name: 'Tithe.ly', category: 'Giving', icon: '💳', color: '#10B981', description: 'Online giving platform' },
  { name: 'Breeze', category: 'ChMS', icon: '🌬', color: '#C5A073', description: 'Member management & giving' },
  { name: 'Mailchimp', category: 'Email', icon: '📧', color: '#FFE01B', description: 'Email sequences & campaigns' },
  { name: 'Slack', category: 'Alerts', icon: '💬', color: '#4A154B', description: 'Staff notifications & alerts' },
  { name: 'Rock RMS', category: 'ChMS', icon: '🪨', color: '#EF4444', description: 'Full church management suite' },
  { name: 'Pushpay', category: 'Giving', icon: '📱', color: '#1DB954', description: 'Mobile giving & engagement' },
  { name: 'Church Community Builder', category: 'ChMS', icon: '🏛', color: '#F59E0B', description: 'CCB community platform' },
];

const FLOW_STEPS = [
  { label: 'Data Collected', detail: 'Check-in, giving, registration — all sources', icon: 'CircleStackIcon' as const },
  { label: 'Automate Processes', detail: 'Rules engine evaluates every event in real-time', icon: 'BoltIcon' as const },
  { label: 'Actions Fire', detail: 'Emails, Slack alerts, reports — triggered instantly', icon: 'ArrowPathIcon' as const },
  { label: 'Reports Delivered', detail: 'Monday 6 AM — dashboard already updated', icon: 'ChartBarIcon' as const },
];

export default function IntegrationStack() {
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
      { threshold: 0.08 }
    );
    const els = sectionRef.current?.querySelectorAll('.scroll-reveal');
    els?.forEach((el) => {
      el.classList.add('hidden-init');
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <section id="integrations" ref={sectionRef} className="py-28 px-6" style={{ background: '#0A0A0A' }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="scroll-reveal mb-4">
          <span className="report-badge inline-flex">
            <Icon name="PuzzlePieceIcon" size={12} variant="outline" />
            Section 03 — The Connected Stack
          </span>
        </div>
        <div className="scroll-reveal mb-6" style={{ transitionDelay: '0.08s' }}>
          <h2 className="text-[clamp(2rem,5vw,4rem)] font-bold tracking-tightest leading-[1.05] text-cloud">
            Every tool your church uses.
            <br />
            <span className="text-admin font-light">Finally talking to each other.</span>
          </h2>
        </div>
        <div className="scroll-reveal mb-16" style={{ transitionDelay: '0.16s' }}>
          <p className="text-admin text-lg max-w-2xl leading-relaxed font-light">
            Automate sits between your existing tools — no rip-and-replace, no retraining staff. 
            Connect your stack in under 20 minutes and watch the first automation fire on Sunday.
          </p>
        </div>

        {/* Integration grid */}
        <div className="scroll-reveal grid grid-cols-2 md:grid-cols-4 gap-3 mb-16">
          {INTEGRATIONS.map((integration, i) => (
            <div
              key={i}
              className="integration-node rounded-lg p-5 hover-lift"
              style={{ transitionDelay: `${i * 0.06}s` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: `${integration.color}22`, border: `1px solid ${integration.color}44` }}
                >
                  {integration.icon}
                </div>
                <div>
                  <div className="text-cloud font-semibold text-sm leading-tight">{integration.name}</div>
                  <div className="text-admin text-[10px] font-mono uppercase tracking-widest">{integration.category}</div>
                </div>
              </div>
              <p className="text-admin text-xs leading-relaxed font-light">{integration.description}</p>
              <div className="flex items-center gap-1.5 mt-3">
                <div className="w-1.5 h-1.5 rounded-full bg-ckc-gold node-pulse" />
                <span className="text-ckc-gold text-[10px] font-mono uppercase tracking-widest">Connected</span>
              </div>
            </div>
          ))}
        </div>

        {/* Flow diagram */}
        <div className="scroll-reveal">
          <div className="border border-[rgba(100,116,139,0.25)] rounded-xl overflow-hidden">
            {/* Header */}
            <div className="border-b border-[rgba(100,116,139,0.2)] px-6 py-4 flex items-center justify-between"
              style={{ background: 'rgba(30,41,59,0.6)' }}>
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-ckc-gold/60" />
                  <div className="w-3 h-3 rounded-full bg-ckc-gold-light/60" />
                </div>
                <span className="font-mono text-xs text-admin uppercase tracking-widest">
                  automate.pipeline — live
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-ckc-gold animate-pulse" />
                <span className="font-mono text-[10px] text-ckc-gold uppercase tracking-widest">847 pipelines active</span>
              </div>
            </div>

            {/* Pipeline flow */}
            <div className="p-6 md:p-10" style={{ background: 'rgba(15,23,42,0.8)' }}>
              {/* Visual pipeline */}
              <div className="flex flex-col md:flex-row items-stretch gap-0 mb-10">
                {FLOW_STEPS.map((step, i) => (
                  <React.Fragment key={i}>
                    <div className="flex-1 rounded-lg p-5 border border-[rgba(100,116,139,0.2)] relative"
                      style={{ background: 'rgba(30,41,59,0.5)' }}>
                      <Icon name={step.icon} size={20} variant="outline" className="text-ckc-gold mb-3" />
                      <div className="text-cloud font-semibold text-sm mb-1">{step.label}</div>
                      <div className="text-admin text-xs font-light leading-relaxed">{step.detail}</div>
                      <div className="absolute top-3 right-3">
                        <span className="font-mono text-[10px] text-admin/40 uppercase">{String(i + 1).padStart(2, '0')}</span>
                      </div>
                    </div>
                    {i < FLOW_STEPS.length - 1 && (
                      <div className="flex items-center justify-center px-1 md:px-2 py-2 md:py-0">
                        <div className="hidden md:flex items-center">
                          <div className="w-4 h-[1px] bg-ckc-gold/40" />
                          <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-sky/60" />
                        </div>
                        <div className="md:hidden flex flex-col items-center">
                          <div className="h-3 w-[1px] bg-ckc-gold/40" />
                          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-sky/60" />
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Sample trigger log */}
              <div className="border border-[rgba(100,116,139,0.2)] rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-[rgba(100,116,139,0.15)] flex items-center justify-between"
                  style={{ background: 'rgba(30,41,59,0.4)' }}>
                  <span className="font-mono text-[11px] text-admin uppercase tracking-widest">Recent Pipeline Triggers</span>
                  <span className="font-mono text-[10px] text-ckc-gold">Live feed</span>
                </div>
                <div className="divide-y divide-[rgba(100,116,139,0.1)]">
                  {[
                    { time: '06:02:14', event: 'Weekly report generated', detail: 'Sent to 4 campus pastors · 847 attendance records', status: 'success' },
                    { time: '05:58:03', event: 'Donor lapse detected', detail: 'Marcus W. · 23-day gap · Follow-up email queued', status: 'alert' },
                    { time: '05:41:22', event: 'Volunteer confirmed', detail: 'Sunday worship team · 11/12 slots filled · 1 auto-filled', status: 'success' },
                    { time: '04:17:09', event: 'First-time guest follow-up', detail: 'The Hendersons · Visited Sun 2/23 · Email + pastor alert sent', status: 'success' },
                    { time: '03:55:44', event: 'Giving sync complete', detail: 'Tithe.ly + Pushpay · $24,840 reconciled · Zero manual entry', status: 'success' },
                  ].map((log, i) => (
                    <div key={i} className="px-4 py-3 flex items-start gap-4 hover:bg-[rgba(100,116,139,0.04)] transition-colors">
                      <span className="font-mono text-[10px] text-admin/50 whitespace-nowrap mt-0.5">{log.time}</span>
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${log.status === 'success' ? 'bg-ckc-gold' : 'bg-ckc-gold-dim'}`} />
                      <div className="flex-1 min-w-0">
                        <span className="text-cloud text-xs font-semibold block">{log.event}</span>
                        <span className="text-admin text-[11px] font-light">{log.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* More integrations note */}
        <div className="scroll-reveal mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-admin text-sm font-light">
            Also connects with:{' '}
            <span className="text-cloud">Elvanto, ServiceU, Church Online Platform, Subsplash, Kindrid, Realm</span>
            {' '}and 30+ more.
          </p>
          <a href="#demo" className="inline-flex items-center gap-2 text-ckc-gold text-sm font-semibold uppercase tracking-widest border-b border-ckc-gold/40 pb-1 hover:border-ckc-gold transition-all">
            See all integrations
            <Icon name="ArrowRightIcon" size={14} variant="outline" />
          </a>
        </div>
      </div>
    </section>
  );
}