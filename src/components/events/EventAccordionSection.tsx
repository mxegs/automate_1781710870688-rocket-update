'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface EventAccordionSectionProps {
  title: string;
  icon: string;
  iconClassName?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export default function EventAccordionSection({
  title,
  icon,
  iconClassName = 'text-cloud/50',
  defaultOpen = false,
  children,
}: EventAccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 bg-white/[0.03] px-4 py-3.5 text-left hover:bg-white/[0.05] transition-colors"
      >
        <Icon name={icon} size={18} variant="outline" className={iconClassName} />
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
