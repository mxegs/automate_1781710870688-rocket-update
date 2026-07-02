'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';

interface GivingForm {
  name: string;
  amount: string;
  reference: string;
  type: string;
}

const PRIMARY_TYPES = ['Tithe', 'Offering'] as const;

export default function GivePage() {
  const [givingForm, setGivingForm] = useState<GivingForm>({ name: '', amount: '', reference: '', type: 'Tithe' });
  const [givingSubmitted, setGivingSubmitted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = sessionStorage.getItem('church_user') || '';
      const name = email.split('@')[0] || 'Member';
      const displayName = name.charAt(0).toUpperCase() + name.slice(1);
      setGivingForm((f) => ({ ...f, name: displayName }));
    }
  }, []);

  const handleGivingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGivingSubmitted(true);
  };

  return (
    <AppShell>
      <div className="life-section space-y-3">
        <div className="flex items-center gap-1.5">
          <Icon name="HeartIcon" size={15} variant="outline" className="text-ckc-gold" />
          <h1 className="text-base font-medium text-ckc-black">Give online</h1>
        </div>

        {givingSubmitted ? (
          <div className="rounded-lg border border-[#E5E5E5] bg-life-content p-6 text-center">
            <Icon name="CheckCircleIcon" size={32} variant="outline" className="mx-auto mb-3 text-ckc-gold" />
            <h3 className="mb-2 text-base font-medium text-ckc-black">Thank you for your generosity!</h3>
            <p className="text-xs text-ckc-muted">
              {givingForm.type} · R {givingForm.amount}
            </p>
            <button
              type="button"
              onClick={() => {
                setGivingSubmitted(false);
                setGivingForm((f) => ({ ...f, amount: '', reference: '' }));
              }}
              className="mt-4 text-xs text-ckc-gold hover:underline"
            >
              Give again
            </button>
          </div>
        ) : (
          <form onSubmit={handleGivingSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-1.5">
              {PRIMARY_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setGivingForm((f) => ({ ...f, type }))}
                  className={`rounded-md py-2 text-[11px] transition-colors ${
                    givingForm.type === type
                      ? 'border border-ckc-gold text-ckc-gold'
                      : 'border border-[#E5E5E5] text-ckc-black'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div>
              <label className="mb-1 block text-[11px] text-ckc-black">Amount</label>
              <input
                type="text"
                value={givingForm.amount}
                onChange={(e) => setGivingForm((f) => ({ ...f, amount: e.target.value }))}
                className="life-input"
                placeholder="R 0.00"
                required
              />
            </div>

            <div className="rounded-xl bg-ckc-card p-3">
              <p className="mb-1.5 text-[9px] text-ckc-gold">Bank details</p>
              <p className="text-[10px] leading-relaxed text-[#ccc]">
                Account: CKC Church
                <br />
                Bank: Standard Bank
                <br />
                Acc: 021 234 5678
              </p>
            </div>

            <button type="submit" className="btn-life-primary w-full py-3 text-[13px]">
              Submit
            </button>
          </form>
        )}
      </div>
    </AppShell>
  );
}
