'use client';

import React, { useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { createCheckin, type EventCheckIn } from '@/lib/events/service';
import type { ChurchEvent } from '@/lib/events/types';

export type CheckInChild = {
  name: string;
  surname: string;
  age: number | null;
};

export type CheckInPanelResult = {
  primary: EventCheckIn;
  dependants: EventCheckIn[];
};

type Phase = 'idle' | 'confirming' | 'submitting' | 'done' | 'error';

export default function CheckInPanel({
  event,
  profileId,
  memberId,
  dependants,
  memberName,
  onCheckedIn,
}: {
  event: ChurchEvent;
  profileId: string;
  memberId: string;
  dependants: CheckInChild[];
  memberName: string;
  onCheckedIn?: (result: CheckInPanelResult) => void;
}) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [selected, setSelected] = useState<number[]>(() => dependants.map((_, index) => index));
  const [result, setResult] = useState<CheckInPanelResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setSelected(dependants.map((_, index) => index));
  }, [dependants]);

  const submit = async (children: CheckInChild[], useHousehold: boolean) => {
    setPhase('submitting');
    setError('');
    try {
      const saved = await createCheckin({
        eventId: event.id,
        profileId,
        memberId,
        method: 'self',
        useHousehold,
        dependants: children.map((child) => ({
          name: child.name,
          surname: child.surname,
          age: child.age,
        })) as { name: string; room?: string }[],
      });
      const next = { primary: saved.primary, dependants: saved.dependants };
      setResult(next);
      setPhase('done');
      onCheckedIn?.(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Check-in failed');
      setPhase('error');
    }
  };

  const startFlow = () => {
    if (dependants.length === 0) {
      void submit([], true);
      return;
    }
    setPhase('confirming');
  };

  const householdUnchanged =
    selected.length === dependants.length && dependants.every((_, index) => selected.includes(index));

  if (phase === 'done' && result) {
    return (
      <div className="mb-6 rounded-2xl border border-ckc-gold/30 bg-ckc-black p-6 text-center">
        <Icon name="CheckCircleIcon" size={44} variant="solid" className="mx-auto mb-3 text-ckc-gold" />
        <h3 className="font-serif text-lg font-semibold text-cloud">{memberName}</h3>
        <p className="mt-1 text-sm text-cloud/60">{event.title}</p>
        {result.primary.seat ? <p className="mt-3 text-sm text-cloud">Seat {result.primary.seat}</p> : null}
        {result.dependants.map((child) => (
          <p key={child.id} className="text-sm text-cloud">
            {child.dependantName}
            {child.room ? ` · ${child.room}` : ''}
          </p>
        ))}
        {result.primary.securityCode ? (
          <p className="mt-3 font-mono text-3xl font-bold tracking-[0.2em] text-ckc-gold">
            {result.primary.securityCode}
          </p>
        ) : null}
        <p className="mt-3 text-xs text-cloud/50">Show this code at the kids&apos; room for pickup.</p>
      </div>
    );
  }

  if (phase === 'confirming') {
    return (
      <div className="mb-6 space-y-4 rounded-2xl border border-white/10 bg-ckc-black p-6">
        <h3 className="font-serif text-lg font-semibold text-cloud">Who is here?</h3>
        <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cloud/70">
          <input type="checkbox" checked disabled />
          <span>{memberName}</span>
        </label>
        {dependants.map((child, index) => (
          <label key={`${child.name}-${child.surname}-${index}`} className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-sm text-cloud">
            <input
              type="checkbox"
              checked={selected.includes(index)}
              onChange={() =>
                setSelected((current) =>
                  current.includes(index) ? current.filter((item) => item !== index) : [...current, index],
                )
              }
            />
            <span>
              {child.name} {child.surname}
              {child.age != null ? <span className="text-cloud/40"> · {child.age}</span> : null}
            </span>
          </label>
        ))}
        <button
          type="button"
          onClick={() =>
            submit(
              dependants.filter((_, index) => selected.includes(index)),
              householdUnchanged,
            )
          }
          className="w-full rounded-xl bg-ckc-gold py-3 text-sm font-bold text-ckc-black"
        >
          Confirm check-in
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6 space-y-4 rounded-2xl border border-white/10 bg-ckc-black p-6">
      <h3 className="font-serif text-lg font-semibold text-cloud">Check in for {event.title}</h3>
      <p className="text-sm text-cloud/60">
        {dependants.length > 0
          ? `${dependants.length} ${dependants.length === 1 ? 'child is' : 'children are'} on your family record.`
          : 'Let the welcome team know you are here.'}
      </p>
      {phase === 'error' && error ? <p className="text-sm text-rose-400">{error}</p> : null}
      <button
        type="button"
        disabled={phase === 'submitting'}
        onClick={startFlow}
        className="w-full rounded-xl bg-ckc-gold py-3 text-sm font-bold text-ckc-black disabled:opacity-50"
      >
        {phase === 'submitting' ? 'Checking in…' : phase === 'error' ? 'Try again' : 'Check in now'}
      </button>
    </div>
  );
}
