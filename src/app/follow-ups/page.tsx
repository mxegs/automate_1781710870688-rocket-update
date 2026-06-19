'use client';

import React, { useState } from 'react';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import PageHeader, { ContentCard } from '@/components/portal/PageHeader';
import { CAMPUSES, FOLLOWUP_STAGES, getCampusLabel, type CampusId, type FollowUpStageId } from '@/lib/church/constants';

interface FollowUpContact {
  id: number;
  name: string;
  phone: string;
  campus: CampusId;
  stage: FollowUpStageId;
  source: string;
  lastContact: string;
  assignedTo: string;
}

const mockFollowUps: FollowUpContact[] = [
  { id: 1, name: 'Sibusiso Naidoo', phone: '082 333 1100', campus: 'verulam', stage: 'engaging', source: 'Street outreach', lastContact: '14 Jun', assignedTo: 'Pastor Sarah' },
  { id: 2, name: 'Amanda Pillay', phone: '073 222 9900', campus: 'midrand', stage: 'cold', source: 'Friend referral', lastContact: '10 Jun', assignedTo: 'David K' },
  { id: 3, name: 'Tshepo Mabena', phone: '061 888 7766', campus: 'midrand', stage: 'committed', source: 'Home visit', lastContact: '16 Jun', assignedTo: 'Pastor James' },
];

const stageColors: Record<FollowUpStageId, string> = {
  cold: 'bg-white/5 text-cloud/50 border-white/10',
  engaging: 'bg-amber-500/10 text-amber-400 border-amber-400/20',
  committed: 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20',
};

export default function FollowUpsPage() {
  const [stageFilter, setStageFilter] = useState<string>('All');
  const [campusFilter, setCampusFilter] = useState<string>('All');

  const filtered = mockFollowUps.filter((f) => {
    const matchStage = stageFilter === 'All' || f.stage === stageFilter;
    const matchCampus = campusFilter === 'All' || f.campus === campusFilter;
    return matchStage && matchCampus;
  });

  return (
    <AppShell access="staff">
      <PageHeader
        title="Follow-Ups"
        subtitle="Evangelism contacts — not members or event visitors"
        actions={
          <div className="flex flex-wrap gap-2">
            <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-cloud/70 hover:border-ckc-gold/30">
              <Icon name="ArrowUpTrayIcon" size={16} variant="outline" />
              Import CSV
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-ckc-gold px-4 py-2.5 text-sm font-bold text-ckc-black hover:bg-ckc-gold-light">
              <Icon name="PlusIcon" size={16} variant="outline" />
              Add Contact
            </button>
          </div>
        }
      />

      <ContentCard>
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="text-xs text-cloud/40 self-center mr-1">Stage:</span>
          {['All', ...FOLLOWUP_STAGES.map((s) => s.id)].map((s) => (
            <button
              key={s}
              onClick={() => setStageFilter(s)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                stageFilter === s ? 'border-ckc-gold/30 bg-ckc-gold/10 text-ckc-gold' : 'border-white/10 text-cloud/50'
              }`}
            >
              {s === 'All' ? 'All' : FOLLOWUP_STAGES.find((x) => x.id === s)?.label}
            </button>
          ))}
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="text-xs text-cloud/40 self-center mr-1">Campus:</span>
          {['All', ...CAMPUSES.map((c) => c.id)].map((c) => (
            <button
              key={c}
              onClick={() => setCampusFilter(c)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                campusFilter === c ? 'border-ckc-gold/30 bg-ckc-gold/10 text-ckc-gold' : 'border-white/10 text-cloud/50'
              }`}
            >
              {c === 'All' ? 'All' : getCampusLabel(c)}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((f) => (
            <div key={f.id} className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-cloud">{f.name}</p>
                <p className="text-xs text-cloud/40">
                  {f.phone} · {getCampusLabel(f.campus)} · {f.source}
                </p>
                <p className="text-xs text-cloud/30 mt-0.5">Assigned: {f.assignedTo} · Last contact: {f.lastContact}</p>
              </div>
              <span className={`self-start rounded-full border px-2.5 py-0.5 text-xs font-medium ${stageColors[f.stage]}`}>
                {FOLLOWUP_STAGES.find((s) => s.id === f.stage)?.label}
              </span>
            </div>
          ))}
        </div>
      </ContentCard>

      <p className="text-xs text-cloud/30 text-center">
        CSV import coming with Supabase — columns: name, phone, campus, stage, source, assigned_to
      </p>
    </AppShell>
  );
}
