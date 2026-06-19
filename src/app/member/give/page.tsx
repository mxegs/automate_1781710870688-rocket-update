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

  const givingTypes = [
    { value: 'Tithe', label: 'Tithe', description: 'Your faithful 10% offering to the Lord', icon: '🙏' },
    { value: 'Offering', label: 'Offering', description: 'A freewill offering from your heart', icon: '💛' },
    { value: 'Special Offering', label: 'Special Offering', description: 'For specific church needs or campaigns', icon: '✨' },
    { value: 'Building Fund', label: 'Building Fund', description: 'Supporting our church building projects', icon: '🏛️' },
    { value: 'Missions', label: 'Missions', description: 'Supporting local and global missions', icon: '🌍' },
    { value: 'Youth Conference', label: 'Youth Conference', description: 'Supporting the annual youth conference', icon: '🔥' },
  ];

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-cloud">Give Online</h1>
          <p className="text-cloud/40 text-sm mt-0.5">Tithes, offerings, and special contributions</p>
        </div>

        {/* Scripture */}
        <div className="bg-gradient-to-r from-amber-500/10 via-white/5 to-transparent border border-amber-400/20 rounded-2xl p-5">
          <blockquote className="text-cloud/70 text-sm italic leading-relaxed">
            &ldquo;Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.&rdquo;
          </blockquote>
          <p className="text-amber-400 text-xs font-semibold mt-2">— 2 Corinthians 9:7</p>
        </div>

        {givingSubmitted ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-4">
              <Icon name="CheckCircleIcon" size={32} variant="outline" className="text-emerald-400" />
            </div>
            <h3 className="text-cloud font-bold text-lg mb-2">Thank you for your generosity!</h3>
            <p className="text-cloud/50 text-sm mb-1">
              Giving type: <span className="text-amber-400 font-medium">{givingForm.type}</span>
            </p>
            <p className="text-cloud/50 text-sm mb-1">
              Amount: <span className="text-amber-400 font-medium">R {givingForm.amount}</span>
            </p>
            <p className="text-cloud/50 text-sm mb-4">
              Reference: <span className="text-amber-400 font-mono text-xs">{givingForm.reference || 'CC-' + Date.now().toString().slice(-6)}</span>
            </p>
            <div className="bg-amber-500/10 border border-amber-400/20 rounded-xl p-4 text-left max-w-sm mx-auto mb-5">
              <p className="text-amber-400 text-xs font-semibold mb-1">⚡ PayFast Integration Coming Soon</p>
              <p className="text-cloud/50 text-xs">Secure payment processing via PayFast will be enabled in the next release. Your giving details have been recorded.</p>
            </div>
            <button
              onClick={() => { setGivingSubmitted(false); setGivingForm((f) => ({ ...f, amount: '', reference: '' })); }}
              className="text-xs text-sky hover:text-sky/80 transition-colors"
            >
              Give again
            </button>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <form onSubmit={handleGivingSubmit} className="space-y-5">
              {/* Giving Type Selector */}
              <div>
                <label className="block text-xs font-medium text-cloud/60 mb-2">Giving Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {givingTypes.map((gt) => (
                    <button
                      key={gt.value}
                      type="button"
                      onClick={() => setGivingForm((f) => ({ ...f, type: gt.value }))}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                        givingForm.type === gt.value
                          ? 'bg-amber-500/10 border-amber-400/30 text-amber-400' :'bg-white/5 border-white/10 text-cloud/50 hover:border-white/20 hover:text-cloud/70'
                      }`}
                    >
                      <span className="text-base flex-shrink-0">{gt.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold leading-tight">{gt.label}</p>
                        <p className="text-[10px] opacity-60 leading-tight mt-0.5 line-clamp-2">{gt.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-cloud/60 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={givingForm.name}
                  onChange={(e) => setGivingForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:outline-none focus:border-sky/50 transition-colors"
                  placeholder="Your name"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-medium text-cloud/60 mb-1.5">Amount (ZAR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cloud/40 text-sm font-medium">R</span>
                  <input
                    type="number"
                    value={givingForm.amount}
                    onChange={(e) => setGivingForm((f) => ({ ...f, amount: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-7 pr-3 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:outline-none focus:border-sky/50 transition-colors"
                    placeholder="0.00"
                    min="1"
                    required
                  />
                </div>
                {/* Quick amounts */}
                <div className="flex gap-2 mt-2">
                  {['50', '100', '200', '500', '1000'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setGivingForm((f) => ({ ...f, amount: amt }))}
                      className={`flex-1 text-xs py-1.5 rounded-lg border transition-all ${
                        givingForm.amount === amt
                          ? 'bg-sky/10 text-sky border-sky/20' :'bg-white/5 text-cloud/40 border-white/10 hover:border-white/20 hover:text-cloud/60'
                      }`}
                    >
                      R{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reference */}
              <div>
                <label className="block text-xs font-medium text-cloud/60 mb-1.5">Reference (optional)</label>
                <input
                  type="text"
                  value={givingForm.reference}
                  onChange={(e) => setGivingForm((f) => ({ ...f, reference: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:outline-none focus:border-sky/50 transition-colors"
                  placeholder="e.g. Tithe June 2025"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-400 font-semibold text-sm py-3 rounded-xl transition-all hover:scale-[1.01]"
              >
                <Icon name="CreditCardIcon" size={16} variant="outline" />
                Proceed to PayFast →
              </button>
              <p className="text-center text-cloud/30 text-xs">🔒 Secure payment via PayFast · No banking details stored</p>
            </form>
          </div>
        )}
      </div>
    </AppShell>
  );
}
