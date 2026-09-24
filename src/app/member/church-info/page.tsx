'use client';

import React from 'react';
import AppShell from '@/components/AppShell';
import LifeHero from '@/components/church-life/LifeHero';
import { LifeSocialIcon } from '@/components/church-life/LifeSocialIcons';
import { BRAND } from '@/lib/assets';
import { LIFE_PHOTOS } from '@/lib/church-life/imagery';
import { lifeSocialLinks } from '@/lib/church-life/nav';

const WELCOME = {
  headline: 'Welcome home',
  lead: 'We are glad you are here. Take a moment to learn who we are as a church family.',
  aboutTitle: 'About our church',
  about: [
    'Christ Kingdom Citizens (CKC) is a Spirit-filled community committed to knowing God, growing together, and serving our city.',
    'We are a multigenerational church that values the Word of God, the presence of the Holy Spirit, and authentic community — whether you are new to faith or have walked with God for years.',
    'Church is more than a Sunday gathering. It is family, belonging, and a place to become who God called you to be.',
  ],
  visionTitle: 'Our vision',
  vision:
    'To be a church that transforms lives, strengthens families, and impacts our city with the love and power of Jesus Christ — one person at a time.',
  valuesTitle: 'Our values',
  values: [
    {
      title: 'Word-centred',
      description: 'Scripture is our foundation for faith, teaching, and everyday life.',
    },
    {
      title: 'Spirit-led',
      description: 'We depend on the Holy Spirit for guidance, power, and transformation.',
    },
    {
      title: 'Community',
      description: 'We prioritise authentic relationships, belonging, and walking together.',
    },
    {
      title: 'Discipleship',
      description: 'We help every person grow in faith and become more like Christ.',
    },
    {
      title: 'Generosity',
      description: 'We give of our time, gifts, and resources because God first gave to us.',
    },
    {
      title: 'Outreach',
      description: 'We serve our city and beyond, sharing the love of Christ in action.',
    },
  ],
  email: 'ckcmidrand@gmail.com',
  websiteLabel: 'ckcmidrand.org',
  websiteUrl: 'https://ckcmidrand.org',
} as const;

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function ChurchInfoPage() {
  return (
    <AppShell access="shared">
      <div className="visitor-welcome pb-10">
        <div className="px-5 pt-5">
          <LifeHero
            imageUrl={LIFE_PHOTOS.sanctuary}
            titleLead={BRAND.name}
            titleRest={WELCOME.headline}
            badge={BRAND.abbreviation}
          />
        </div>

        <section className="life-section">
          <p className="text-[15px] leading-relaxed text-ckc-muted">{WELCOME.lead}</p>
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={() => scrollToId('vision')} className="rounded-full bg-ckc-black px-4 py-2 text-xs font-semibold text-white">
              Our vision
            </button>
            <button type="button" onClick={() => scrollToId('values')} className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-ckc-black shadow-sm">
              Our values
            </button>
          </div>
        </section>

        <section className="life-section" aria-labelledby="about-heading">
          <h2 id="about-heading" className="font-serif text-[24px] font-semibold text-ckc-black">
            {WELCOME.aboutTitle}
          </h2>
          <div className="mt-3 space-y-3">
            {WELCOME.about.map((para) => (
              <p key={para} className="text-[15px] leading-relaxed text-[#3F392F]">
                {para}
              </p>
            ))}
          </div>
        </section>

        <section id="vision" className="mx-5 overflow-hidden rounded-[24px]" aria-labelledby="vision-heading">
          <div className="relative min-h-[220px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LIFE_PHOTOS.lights} alt="" className="absolute inset-0 h-full w-full bg-ckc-black object-cover" />
            <div className="absolute inset-0 bg-black/55" />
            <div className="relative p-6">
              <h2 id="vision-heading" className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ckc-gold">
                {WELCOME.visionTitle}
              </h2>
              <p className="mt-3 font-serif text-[22px] font-semibold leading-snug text-white">{WELCOME.vision}</p>
            </div>
          </div>
        </section>

        <section id="values" className="life-section" aria-labelledby="values-heading">
          <h2 id="values-heading" className="font-serif text-[24px] font-semibold text-ckc-black">
            {WELCOME.valuesTitle}
          </h2>
          <ul className="mt-4 space-y-3">
            {WELCOME.values.map((value) => (
              <li key={value.title} className="rounded-[20px] bg-white p-4 shadow-[0_8px_24px_rgba(26,22,18,0.06)]">
                <p className="text-[15px] font-semibold text-ckc-black">{value.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ckc-muted">{value.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="life-section text-center" aria-labelledby="connect-heading">
          <h2 id="connect-heading" className="font-serif text-[24px] font-semibold text-ckc-black">
            Stay connected
          </h2>
          <div className="mt-3 space-y-1">
            <a href={`mailto:${WELCOME.email}`} className="block text-[15px] font-medium text-ckc-black">
              {WELCOME.email}
            </a>
            <a
              href={WELCOME.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-[15px] font-medium text-ckc-gold-dim"
            >
              {WELCOME.websiteLabel}
            </a>
          </div>
          <div className="mt-5 flex items-center justify-center gap-5 text-ckc-black">
            {lifeSocialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ckc-gold"
                aria-label={link.label}
              >
                <LifeSocialIcon brand={link.brand} />
              </a>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
