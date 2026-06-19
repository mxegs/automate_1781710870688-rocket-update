import React from 'react';

const ITEMS = [
  'Planning Center Sync',
  'Tithe.ly Giving',
  'Breeze ChMS',
  'Mailchimp Sequences',
  'Slack Alerts',
  'Rock RMS',
  'Pushpay',
  'Church Community Builder',
  'Elvanto',
  'ServiceU Events',
  'Guest Follow-Up',
  'Volunteer Scheduling',
];

export default function MarqueeBar() {
  const doubled = [...ITEMS, ...ITEMS];

  return (
    <div className="border-y border-[rgba(100,116,139,0.2)] bg-slate-dark overflow-hidden py-4 relative z-20">
      <div className="inline-flex animate-marquee whitespace-nowrap">
        {doubled?.map((item, i) => (
          <React.Fragment key={i}>
            <span className="font-mono text-[11px] uppercase tracking-widest text-admin px-6">{item}</span>
            <span className="text-sky/40 text-xs">·</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}