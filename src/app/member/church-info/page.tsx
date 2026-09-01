'use client';

import React from 'react';
import AppShell from '@/components/AppShell';
import { LifeSocialIcon } from '@/components/church-life/LifeSocialIcons';
import { BRAND } from '@/lib/assets';
import { lifeSocialLinks } from '@/lib/church-life/nav';

const WELCOME = {
  headline: 'Welcome',
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
      <div className="visitor-welcome">
        {/* Welcome */}
        <section className="life-section visitor-welcome-hero">
          <p className="visitor-welcome-kicker">{BRAND.abbreviation}</p>
          <h1 className="visitor-welcome-brand font-serif">{BRAND.name}</h1>
          <p className="visitor-welcome-title">{WELCOME.headline}</p>
          <p className="visitor-welcome-lead">{WELCOME.lead}</p>
          <div className="visitor-welcome-links">
            <button type="button" onClick={() => scrollToId('vision')} className="visitor-welcome-link">
              Our vision
            </button>
            <span className="visitor-welcome-dot" aria-hidden>
              ·
            </span>
            <button type="button" onClick={() => scrollToId('values')} className="visitor-welcome-link">
              Our values
            </button>
          </div>
        </section>

        {/* About */}
        <section className="life-section visitor-welcome-block" aria-labelledby="about-heading">
          <h2 id="about-heading" className="visitor-welcome-heading">
            {WELCOME.aboutTitle}
          </h2>
          <div className="space-y-3">
            {WELCOME.about.map((para) => (
              <p key={para} className="visitor-welcome-copy">
                {para}
              </p>
            ))}
          </div>
        </section>

        {/* Vision */}
        <section
          id="vision"
          className="life-section visitor-welcome-block visitor-welcome-vision"
          aria-labelledby="vision-heading"
        >
          <h2 id="vision-heading" className="visitor-welcome-heading">
            {WELCOME.visionTitle}
          </h2>
          <p className="visitor-welcome-vision-text font-serif">{WELCOME.vision}</p>
        </section>

        {/* Values */}
        <section
          id="values"
          className="life-section visitor-welcome-block"
          aria-labelledby="values-heading"
        >
          <h2 id="values-heading" className="visitor-welcome-heading">
            {WELCOME.valuesTitle}
          </h2>
          <ul className="visitor-welcome-values">
            {WELCOME.values.map((value) => (
              <li key={value.title} className="visitor-welcome-value">
                <p className="visitor-welcome-value-title">{value.title}</p>
                <p className="visitor-welcome-copy">{value.description}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Connect — email, website, socials only */}
        <section className="life-section visitor-welcome-connect" aria-labelledby="connect-heading">
          <h2 id="connect-heading" className="visitor-welcome-heading">
            Stay connected
          </h2>
          <div className="visitor-welcome-contact">
            <a href={`mailto:${WELCOME.email}`} className="visitor-welcome-contact-link">
              {WELCOME.email}
            </a>
            <a
              href={WELCOME.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="visitor-welcome-contact-link"
            >
              {WELCOME.websiteLabel}
            </a>
          </div>
          <div className="visitor-welcome-socials">
            {lifeSocialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="visitor-welcome-social"
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
