'use client';

import React from 'react';

interface CkcFieldProps {
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}

export function CkcField({ label, required, optional, error, children }: CkcFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] text-white/70">
        {label}
        {required && <span className="text-ckc-gold"> *</span>}
        {optional && <span className="text-ckc-dim"> (optional)</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function CkcInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`ckc-input w-full rounded-lg px-3 py-2.5 text-sm ${props.className || ''}`}
    />
  );
}

export function CkcTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`ckc-input w-full resize-none rounded-lg px-3 py-2.5 text-sm ${props.className || ''}`}
    />
  );
}

export function CkcButton({
  children,
  variant = 'gold',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'gold' | 'ghost' }) {
  const base = 'w-full rounded-full py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2';
  const styles =
    variant === 'gold'
      ? 'btn-ckc-gold'
      : 'border border-[#c7c5d3]/70 bg-transparent text-ckc-muted hover:border-ckc-gold/30 hover:text-ckc-gold';

  return (
    <button {...props} className={`${base} ${styles} ${props.className || ''}`}>
      {children}
    </button>
  );
}

export function CkcRadioGroup<T extends string>({
  options,
  value,
  onChange,
  name,
}: {
  options: T[];
  value: T | '';
  onChange: (v: T) => void;
  name: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
            value === opt
              ? 'border-ckc-gold/40 bg-ckc-gold/10 text-ckc-gold'
              : 'border-[#c7c5d3]/60 bg-ckc-surface text-ckc-muted hover:border-ckc-gold/30'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function CkcCheckboxGroup({
  options,
  values,
  onChange,
}: {
  options: readonly string[];
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const toggle = (opt: string) => {
    if (values.includes(opt)) {
      onChange(values.filter((v) => v !== opt));
    } else {
      onChange([...values, opt]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
            values.includes(opt)
              ? 'border-ckc-gold/40 bg-ckc-gold/10 text-ckc-gold'
              : 'border-[#c7c5d3]/60 bg-ckc-surface text-ckc-muted hover:border-ckc-gold/30'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function CkcCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`ckc-card rounded-2xl p-6 ${className}`}>{children}</div>;
}
