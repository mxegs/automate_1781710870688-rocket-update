'use client';

import React, { useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { getDisplayName, getSession } from '@/lib/auth/session';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Show time-based greeting + user name (member-portal style) */
  personalized?: boolean;
  actions?: React.ReactNode;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function PageHeader({
  title,
  subtitle,
  personalized = false,
  actions,
}: PageHeaderProps) {
  const [greeting, setGreeting] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (personalized) {
      setGreeting(getGreeting());
      setUserName(getDisplayName(getSession()));
    }
  }, [personalized]);

  if (personalized) {
    return (
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-cloud/50 text-sm">{greeting}</p>
          <h1 className="text-2xl font-bold text-cloud">{userName || title}</h1>
          {subtitle && <p className="text-cloud/40 text-sm mt-1">{subtitle}</p>}
        </div>
        {actions}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-cloud tracking-tight">{title}</h1>
        {subtitle && <p className="text-cloud/40 text-sm mt-0.5">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

export function ContentCard({
  children,
  className = '',
  title,
  icon,
  action,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 p-5 ${className}`}>
      {title && (
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-cloud">
            {icon && <Icon name={icon} size={15} variant="outline" className="text-ckc-gold" />}
            {title}
          </h2>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  change,
  icon,
  positive = true,
}: {
  label: string;
  value: string;
  change?: string;
  icon: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-ckc-gold/30">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ckc-gold/10 text-ckc-gold">
          <Icon name={icon} size={18} variant="outline" />
        </div>
      </div>
      <p className="font-mono text-2xl font-bold text-cloud">{value}</p>
      <p className="mt-0.5 text-xs text-cloud/50">{label}</p>
      {change && (
        <p className={`mt-1.5 text-xs font-medium ${positive ? 'text-ckc-gold' : 'text-rose-400'}`}>
          {change}
        </p>
      )}
    </div>
  );
}
