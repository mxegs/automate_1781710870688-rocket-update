'use client';

import React, { useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

const CHURCH_SIZES = [
  { label: 'Under 200', detail: 'Solo pastor setup · 15 min onboarding' },
  { label: '200 – 1,000', detail: 'Multi-team · Planning Center native' },
  { label: '1,000 – 5,000', detail: 'Multi-campus · Full pipeline suite' },
  { label: '5,000+', detail: 'Enterprise · Custom workflow builder' },
];

export default function DemoCtaSection() {
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
    <section id="demo" ref={sectionRef} className="py-28 px-6 relative overflow-hidden noise-overlay"
      style={{ background: 'linear-gradient(160deg, #0A0A0A 0%, #1A1A1A 60%, #0A0A0A 100%)' }}>
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(14,165,233,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14,165,233,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      {/* Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(14,165,233,0.07) 0%, transparent 70%)' }} />
      </div>
      <div className="max-w-5xl mx-auto relative z-10 text-center">

        {/* Badge */}
        <div className="scroll-reveal mb-8 flex justify-center">
          <span className="report-badge">
            <Icon name="PlayCircleIcon" size={12} variant="outline" />
            Interactive Demo Environment
          </span>
        </div>

        {/* Headline */}
        <div className="scroll-reveal mb-6" style={{ transitionDelay: '0.08s' }}>
          <h2 className="text-[clamp(2.4rem,6vw,5rem)] font-bold tracking-tightest leading-[1.0] text-cloud">
            See your church automated.
          </h2>
        </div>

        {/* Sub */}
        <div className="scroll-reveal mb-12" style={{ transitionDelay: '0.16s' }}>
          <p className="text-admin text-xl max-w-2xl mx-auto leading-relaxed font-light">
            Select your church size. We'll show you a pre-built pipeline that matches your operations — 
            giving sync, volunteer scheduling, guest follow-up — all firing automatically.
          </p>
        </div>

        {/* Church size selector */}
        <div className="scroll-reveal mb-10" style={{ transitionDelay: '0.24s' }}>
          <p className="text-admin text-xs font-mono uppercase tracking-widest mb-4">Select your church size to see your demo:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {CHURCH_SIZES?.map((size, i) => (
              <a
                key={i}
                href="#"
                className="border border-[rgba(100,116,139,0.3)] rounded-lg p-4 text-left hover-lift transition-all duration-200 hover:border-ckc-gold/50 hover:bg-[rgba(14,165,233,0.05)] group"
              >
                <div className="text-cloud font-bold text-sm mb-1 group-hover:text-ckc-gold transition-colors">{size?.label}</div>
                <div className="text-admin text-[11px] font-light leading-snug">{size?.detail}</div>
              </a>
            ))}
          </div>
        </div>

        {/* Primary CTA */}
        <div className="scroll-reveal mb-6" style={{ transitionDelay: '0.32s' }}>
          <a
            href="#"
            className="btn-sky inline-flex items-center gap-3 px-10 py-5 rounded-sm text-sm font-bold uppercase tracking-widest sky-pulse"
          >
            <Icon name="PlayIcon" size={18} variant="solid" />
            See Your Church Automated
          </a>
        </div>

        {/* Trust signals */}
        <div className="scroll-reveal" style={{ transitionDelay: '0.4s' }}>
          <div className="flex flex-wrap items-center justify-center gap-6 text-admin text-xs">
            <div className="flex items-center gap-2">
              <Icon name="ShieldCheckIcon" size={14} variant="outline" className="text-ckc-gold" />
              <span>No credit card required</span>
            </div>
            <span className="text-admin/30">·</span>
            <div className="flex items-center gap-2">
              <Icon name="ClockIcon" size={14} variant="outline" className="text-ckc-gold" />
              <span>Live demo in 60 seconds</span>
            </div>
            <span className="text-admin/30">·</span>
            <div className="flex items-center gap-2">
              <Icon name="UserGroupIcon" size={14} variant="outline" className="text-ckc-gold" />
              <span>847 churches already automated</span>
            </div>
          </div>
        </div>

        {/* Divider with quote */}
        <div className="scroll-reveal mt-20 border border-[rgba(100,116,139,0.2)] rounded-xl p-8"
          style={{ background: 'rgba(15,23,42,0.6)' }}>
          <Icon name="ChatBubbleLeftRightIcon" size={20} variant="outline" className="text-ckc-gold mx-auto mb-4 opacity-60" />
          <p className="text-cloud text-lg font-light italic leading-relaxed mb-4">
            "I walked in Monday morning and the report was already in my inbox. 
            The follow-up emails had already gone. The giving was already reconciled. 
            I just had my coffee."
          </p>
          <div>
            <span className="text-cloud text-sm font-semibold block">Pastor David Kim</span>
            <span className="text-admin text-xs font-mono">Executive Pastor · Harvest Church · 2,800 members · Sacramento, CA</span>
          </div>
        </div>
      </div>
    </section>
  );
}