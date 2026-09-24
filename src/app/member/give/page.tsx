'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import LifeHero from '@/components/church-life/LifeHero';
import { LIFE_PHOTOS } from '@/lib/church-life/imagery';

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
      <div className="px-5 pb-8 pt-5">
        <LifeHero
          imageUrl={LIFE_PHOTOS.give}
          titleLead="Give with a glad heart"
          titleRest="Tithes and offerings that keep ministry moving"
          badge="Generosity"
        />

        <div className="mt-6">
          {givingSubmitted ? (
            <div className="rounded-[24px] bg-white p-8 text-center shadow-[0_10px_28px_rgba(26,22,18,0.08)]">
              <Icon name="CheckCircleIcon" size={40} variant="outline" className="mx-auto mb-3 text-ckc-gold" />
              <h3 className="font-serif text-[24px] font-semibold text-ckc-black">Thank you</h3>
              <p className="mt-2 text-sm text-ckc-muted">
                {givingForm.type} · R {givingForm.amount}
              </p>
              <button
                type="button"
                onClick={() => {
                  setGivingSubmitted(false);
                  setGivingForm((f) => ({ ...f, amount: '', reference: '' }));
                }}
                className="mt-5 text-sm font-medium text-ckc-gold-dim"
              >
                Give again
              </button>
            </div>
          ) : (
            <form onSubmit={handleGivingSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {PRIMARY_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setGivingForm((f) => ({ ...f, type }))}
                    className={`rounded-full py-2.5 text-sm font-semibold transition-colors ${
                      givingForm.type === type
                        ? 'bg-ckc-gold text-ckc-gold-text'
                        : 'bg-white text-ckc-black shadow-sm'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-ckc-black">Amount</label>
                <input
                  type="text"
                  value={givingForm.amount}
                  onChange={(e) => setGivingForm((f) => ({ ...f, amount: e.target.value }))}
                  className="life-input"
                  placeholder="R 0.00"
                  required
                />
              </div>

              <div className="rounded-[22px] bg-ckc-black p-5 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ckc-gold">Bank details</p>
                <p className="mt-2 text-sm leading-relaxed text-white/85">
                  Account: Church account
                  <br />
                  Bank: Standard Bank
                  <br />
                  Acc: 021 234 5678
                </p>
              </div>

              <button type="submit" className="btn-life-primary w-full py-3.5">
                Submit
              </button>
            </form>
          )}
        </div>
      </div>
    </AppShell>
  );
}
