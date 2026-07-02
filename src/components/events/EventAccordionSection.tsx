'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface EventAccordionSectionProps {
  title: string;
  icon?: string;
  iconClassName?: string;
  defaultOpen?: boolean;
  theme?: 'light' | 'dark';
  children: React.ReactNode;
}

export default function EventAccordionSection({
  title,
  icon,
  iconClassName = 'text-white/50',
  defaultOpen = false,
  theme = 'light',
  children,
}: EventAccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const isLight = theme === 'light';

  if (isLight) {
    return (
      <div className="life-event-block">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between text-left"
        >
          <span className="text-sm font-semibold capitalize">{title}</span>
          <Icon
            name="ChevronUpIcon"
            size={16}
            variant="outline"
            className={`text-white/50 transition-transform ${open ? '' : 'rotate-180'}`}
          />
        </button>
        {open && <div className="mt-3 text-sm leading-relaxed text-white/80">{children}</div>}
      </div>
    );
  }

  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 bg-white/[0.03] px-4 py-3.5 text-left hover:bg-white/[0.05] transition-colors"
      >
        {icon ? (
          <Icon name={icon} size={18} variant="outline" className={iconClassName} />
        ) : null}
        <span className="flex-1 text-sm font-semibold text-cloud">{title}</span>
        <Icon
          name="ChevronUpIcon"
          size={16}
          variant="outline"
          className={`text-cloud/40 transition-transform ${open ? '' : 'rotate-180'}`}
        />
      </button>
      {open && <div className="px-4 pb-4 pt-1 text-sm text-cloud/70 leading-relaxed">{children}</div>}
    </div>
  );
}
