'use client';

import React, { useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface WorkflowRow {
  workflow: string;
  category: string;
  manual: { status: 'none' | 'partial' | 'full'; note: string };
  zapier: { status: 'none' | 'partial' | 'full'; note: string };
  automate: { status: 'none' | 'partial' | 'full'; note: string };
  timeSaved: string;
  integrations: number;
}

const ROWS: WorkflowRow[] = [
  {
    workflow: 'Giving Sync',
    category: 'Finance',
    manual: { status: 'none', note: 'ChurchTrak export → Excel → 4.1 hrs/week' },
    zapier: { status: 'partial', note: 'Tithe.ly only, no reconciliation logic' },
    automate: { status: 'full', note: 'All platforms, real-time, auto-reconciled' },
    timeSaved: '4.1 hrs/wk',
    integrations: 7,
  },
  {
    workflow: 'Attendance Tracking',
    category: 'Ops',
    manual: { status: 'none', note: 'Paper sheets → manual entry → 2.2 hrs/wk' },
    zapier: { status: 'partial', note: 'Check-in only, no cross-campus rollup' },
    automate: { status: 'full', note: 'All campuses unified, trend alerts auto-sent' },
    timeSaved: '2.2 hrs/wk',
    integrations: 5,
  },
  {
    workflow: 'Volunteer Scheduling',
    category: 'People',
    manual: { status: 'none', note: 'Text/email threads, 61% confirmation rate' },
    zapier: { status: 'partial', note: 'Planning Center reminders only, no fallback' },
    automate: { status: 'full', note: 'Smart reminders + auto-fill gaps, 97% rate' },
    timeSaved: '3.3 hrs/wk',
    integrations: 4,
  },
  {
    workflow: 'First-Time Guest Follow-Up',
    category: 'Outreach',
    manual: { status: 'none', note: '68% never receive contact within 72 hrs' },
    zapier: { status: 'none', note: 'No church-aware guest logic available' },
    automate: { status: 'full', note: '24-hr trigger: email + text + pastor alert' },
    timeSaved: '1.8 hrs/wk',
    integrations: 6,
  },
  {
    workflow: 'Event Registration',
    category: 'Ops',
    manual: { status: 'none', note: 'Google Forms → spreadsheet → manual follow-up' },
    zapier: { status: 'partial', note: 'Confirmation email only, no waitlist logic' },
    automate: { status: 'full', note: 'Registration → reminder → waitlist → report' },
    timeSaved: '2.1 hrs/wk',
    integrations: 5,
  },
  {
    workflow: 'Weekly Reporting',
    category: 'Admin',
    manual: { status: 'none', note: 'Assembled by hand, sent Monday morning' },
    zapier: { status: 'none', note: 'No multi-source aggregation possible' },
    automate: { status: 'full', note: 'Auto-generated 6 AM Sunday, sent to leadership' },
    timeSaved: '2.9 hrs/wk',
    integrations: 8,
  },
  {
    workflow: 'Donor Lapse Alerts',
    category: 'Finance',
    manual: { status: 'none', note: 'Never happens — too time-intensive to track' },
    zapier: { status: 'none', note: 'Requires custom Zap per donor threshold' },
    automate: { status: 'full', note: 'Auto-detects 3-week lapse, triggers pastoral note' },
    timeSaved: '1.4 hrs/wk',
    integrations: 4,
  },
  {
    workflow: 'Small Group Matching',
    category: 'People',
    manual: { status: 'none', note: 'Pastor manually reviews interest forms weekly' },
    zapier: { status: 'none', note: 'No matching logic, only data transfer' },
    automate: { status: 'full', note: 'Interest → match → intro email in 48 hrs' },
    timeSaved: '0.8 hrs/wk',
    integrations: 3,
  },
];

type StatusType = 'none' | 'partial' | 'full';

function StatusCell({ status, note }: { status: StatusType; note: string }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const icon =
    status === 'full' ? (
      <Icon name="CheckCircleIcon" size={18} variant="solid" className="check-sky flex-shrink-0" />
    ) : status === 'partial' ? (
      <Icon name="MinusCircleIcon" size={18} variant="solid" className="partial-yellow flex-shrink-0" />
    ) : (
      <Icon name="XCircleIcon" size={18} variant="solid" className="cross-dim flex-shrink-0" />
    );

  return (
    <div
      className="relative flex items-start gap-2 cursor-default group"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="mt-0.5">{icon}</div>
      <span className="text-admin text-xs leading-snug font-light hidden md:block">{note}</span>

      {/* Mobile tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-0 mb-2 z-30 bg-ckc-black border border-[rgba(100,116,139,0.4)] rounded p-3 text-xs text-cloud w-48 shadow-xl md:hidden">
          {note}
        </div>
      )}
    </div>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  Finance: 'text-ckc-gold',
  Ops: 'text-ckc-gold',
  People: 'text-violet-400',
  Outreach: 'text-ckc-gold',
  Admin: 'text-ckc-gold',
};

export default function ComparisonTable() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeRow, setActiveRow] = useState<number | null>(null);

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

  const totalTimeSaved = ROWS.reduce((acc, r) => {
    const num = parseFloat(r.timeSaved);
    return acc + num;
  }, 0).toFixed(1);

  return (
    <section id="comparison" ref={sectionRef} className="py-28 px-6" style={{ background: 'var(--slate)' }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="scroll-reveal mb-4">
          <span className="report-badge inline-flex">
            <Icon name="TableCellsIcon" size={12} variant="outline" />
            Section 02 — Head-to-Head Comparison
          </span>
        </div>
        <div className="scroll-reveal mb-6" style={{ transitionDelay: '0.08s' }}>
          <h2 className="text-[clamp(2rem,5vw,4rem)] font-bold tracking-tightest leading-[1.05] text-cloud">
            Every workflow.{' '}
            <span className="text-admin font-light">Every platform.</span>
            <br />
            One honest table.
          </h2>
        </div>
        <div className="scroll-reveal mb-12" style={{ transitionDelay: '0.16s' }}>
          <p className="text-admin text-lg max-w-2xl leading-relaxed font-light">
            We compared what churches actually use — manual processes, Zapier patchwork, 
            and Automate — across every workflow that eats staff time. The math is in the last column.
          </p>
        </div>

        {/* Summary bar */}
        <div className="scroll-reveal mb-8 grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: 'Total time saved/week', value: `${totalTimeSaved} hrs`, icon: 'ClockIcon' as const },
            { label: 'Workflows fully automated', value: '8 / 8', icon: 'BoltIcon' as const },
            { label: 'Integrations connected', value: '42+', icon: 'LinkIcon' as const },
          ].map((item, i) => (
            <div key={i} className="stat-card rounded-lg px-6 py-4 flex items-center gap-4">
              <Icon name={item.icon} size={20} variant="outline" className="text-ckc-gold flex-shrink-0" />
              <div>
                <div className="sky-number text-2xl">{item.value}</div>
                <div className="text-admin text-xs mt-0.5">{item.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="scroll-reveal rounded-xl overflow-hidden border border-[rgba(100,116,139,0.25)]">

          {/* Sticky column headers */}
          <div className="table-sticky-header">
            <div className="grid grid-cols-[1.8fr_1.5fr_1.5fr_1.5fr_auto_auto] gap-0 text-[11px] font-mono uppercase tracking-widest text-admin">
              <div className="px-5 py-4 border-r border-[rgba(100,116,139,0.15)]">Workflow</div>
              <div className="px-5 py-4 border-r border-[rgba(100,116,139,0.15)]">
                <span className="text-admin/70">Manual Process</span>
              </div>
              <div className="px-5 py-4 border-r border-[rgba(100,116,139,0.15)]">
                <span className="text-ckc-gold/80">Zapier Patchwork</span>
              </div>
              <div className="px-5 py-4 border-r border-[rgba(100,116,139,0.15)]">
                <span className="text-ckc-gold">Automate</span>
              </div>
              <div className="px-5 py-4 border-r border-[rgba(100,116,139,0.15)] whitespace-nowrap">Time Saved</div>
              <div className="px-5 py-4 whitespace-nowrap">Integrations</div>
            </div>
          </div>

          {/* Rows */}
          {ROWS.map((row, i) => (
            <div
              key={i}
              className={`grid grid-cols-[1.8fr_1.5fr_1.5fr_1.5fr_auto_auto] gap-0 border-t border-[rgba(100,116,139,0.15)] transition-all duration-200 cursor-default ${
                activeRow === i ? 'table-row-active' : 'hover:bg-[rgba(100,116,139,0.04)]'
              }`}
              onMouseEnter={() => setActiveRow(i)}
              onMouseLeave={() => setActiveRow(null)}
            >
              {/* Workflow name */}
              <div className="px-5 py-5 border-r border-[rgba(100,116,139,0.15)]">
                <div className="flex flex-col gap-1">
                  <span className="text-cloud font-semibold text-sm">{row.workflow}</span>
                  <span className={`text-[10px] font-mono uppercase tracking-widest ${CATEGORY_COLORS[row.category] || 'text-admin'}`}>
                    {row.category}
                  </span>
                </div>
              </div>

              {/* Manual */}
              <div className="px-5 py-5 border-r border-[rgba(100,116,139,0.15)]">
                <StatusCell status={row.manual.status} note={row.manual.note} />
              </div>

              {/* Zapier */}
              <div className="px-5 py-5 border-r border-[rgba(100,116,139,0.15)]">
                <StatusCell status={row.zapier.status} note={row.zapier.note} />
              </div>

              {/* Automate */}
              <div className="px-5 py-5 border-r border-[rgba(100,116,139,0.15)]">
                <StatusCell status={row.automate.status} note={row.automate.note} />
              </div>

              {/* Time saved */}
              <div className="px-5 py-5 border-r border-[rgba(100,116,139,0.15)] flex items-center">
                <span className="sky-number text-sm whitespace-nowrap">{row.timeSaved}</span>
              </div>

              {/* Integrations */}
              <div className="px-5 py-5 flex items-center">
                <div className="flex items-center gap-1.5">
                  <Icon name="LinkIcon" size={13} variant="outline" className="text-ckc-gold" />
                  <span className="text-ckc-gold font-mono text-sm font-semibold">{row.integrations}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Total row */}
          <div
            className="grid grid-cols-[1.8fr_1.5fr_1.5fr_1.5fr_auto_auto] gap-0 border-t-2 border-ckc-gold/30"
            style={{ background: 'rgba(14,165,233,0.06)' }}
          >
            <div className="px-5 py-5 border-r border-[rgba(100,116,139,0.15)]">
              <span className="text-ckc-gold font-bold text-sm uppercase tracking-widest font-mono">Total / week</span>
            </div>
            <div className="px-5 py-5 border-r border-[rgba(100,116,139,0.15)]">
              <span className="text-admin/50 text-xs">~16 hrs lost</span>
            </div>
            <div className="px-5 py-5 border-r border-[rgba(100,116,139,0.15)]">
              <span className="text-ckc-gold/70 text-xs">~6 hrs saved</span>
            </div>
            <div className="px-5 py-5 border-r border-[rgba(100,116,139,0.15)]">
              <span className="text-ckc-gold font-semibold text-sm">All 8 automated</span>
            </div>
            <div className="px-5 py-5 border-r border-[rgba(100,116,139,0.15)]">
              <span className="sky-number text-lg">{totalTimeSaved} hrs</span>
            </div>
            <div className="px-5 py-5">
              <span className="sky-number text-lg">42</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="scroll-reveal mt-6 flex flex-wrap items-center gap-6 text-xs text-admin font-mono">
          <div className="flex items-center gap-2">
            <Icon name="CheckCircleIcon" size={14} variant="solid" className="check-sky" />
            <span>Fully automated</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="MinusCircleIcon" size={14} variant="solid" className="partial-yellow" />
            <span>Partial / workaround</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="XCircleIcon" size={14} variant="solid" className="cross-dim" />
            <span>Not supported</span>
          </div>
          <span className="ml-auto text-admin/50">Hover rows for detail notes</span>
        </div>
      </div>
    </section>
  );
}