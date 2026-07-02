'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import { lifeSocialLinks } from '@/lib/church-life/nav';

export default function GetInvolvedFooter() {
  return (
    <footer className="mt-10 pb-4">
      <div className="mb-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-ckc-gold/40" />
        <span className="text-sm font-semibold text-ckc-black">Get Involved</span>
        <div className="h-px flex-1 bg-ckc-gold/40" />
      </div>
      <div className="flex items-center justify-center gap-4">
        {lifeSocialLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ckc-black/20 text-ckc-black hover:border-ckc-gold hover:text-ckc-gold transition-colors"
            aria-label={link.label}
          >
            <Icon name={link.icon} size={18} variant="outline" />
          </a>
        ))}
      </div>
    </footer>
  );
}
