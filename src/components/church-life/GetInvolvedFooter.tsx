'use client';

import React from 'react';
import { LifeSocialIcon } from '@/components/church-life/LifeSocialIcons';
import { lifeSocialLinks } from '@/lib/church-life/nav';

interface GetInvolvedFooterProps {
  fill?: boolean;
}

export default function GetInvolvedFooter({ fill = false }: GetInvolvedFooterProps) {
  const className = fill
    ? 'life-home-footer'
    : 'life-section border-t border-[0.5px] border-[#E5E5E5] py-5 text-center';

  return (
    <footer className={className}>
      <div className="mb-3 flex items-center justify-center gap-2">
        <div className="h-px w-[30px] bg-ckc-gold" />
        <span className="text-[11px] font-serif font-semibold tracking-normal text-ckc-gold">
          Get Involved
        </span>
        <div className="h-px w-[30px] bg-ckc-gold" />
      </div>
      <div className="flex items-center justify-center gap-[18px] text-ckc-black">
        {lifeSocialLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ckc-black hover:text-ckc-gold transition-colors"
            aria-label={link.label}
          >
            <LifeSocialIcon brand={link.brand} />
          </a>
        ))}
      </div>
    </footer>
  );
}
