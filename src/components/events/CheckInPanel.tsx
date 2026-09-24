'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { createCheckin, type MyCheckIn } from '@/lib/events/service';
import type { ChurchEvent } from '@/lib/events/types';
import type { Dependant } from '@/lib/membership/types';

type Phase = 'idle' | 'confirming-kids' | 'submitting' | 'checked-in' | 'error';

export default function CheckInPanel({
  event,
  profileId,
  memberId,
  rsvpId,
  dependants = [],
  memberName,
}: {
  event: ChurchEvent;
  profileId?: string;
  memberId?: string;
  rsvpId?: string;
  dependants?: Dependant[];
  memberName: string;
}) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [selected, setSelected] = useState<number[]>(dependants.map((_, index) => index));
  const [result, setResult] = useState<MyCheckIn | null>(null);
  const [kidsRoom, setKidsRoom] = useState('');
  const [error, setError] = useState('');

  const submit = async (children: Dependant[]) => {
    setPhase('submitting');
    setError('');
    try {
      const saved = await createCheckin({
        eventId: event.id,
        profileId,
        memberId,
        rsvpId,
        method: 'self',
        dependants: children.map((child) => ({
          name: `${child.name} ${child.surname}`.trim(),
          // TODO: replace with age-based room routing from src/lib/events/rooms.ts
          room: 'Room 2B',
        })),
      });
      setResult({
        id: saved.primary.id,
        eventId: saved.primary.eventId,
        room: saved.primary.room,
        seat: saved.primary.seat,
        securityCode: saved.primary.securityCode,
        checkedInAt: saved.primary.checkedInAt,
      });
      setKidsRoom(saved.dependants[0]?.room ?? '');
      setPhase('checked-in');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Check-in failed');
      setPhase('error');
    }
  };

  if (phase === 'checked-in' && result) {
    return (
      <div className="mb-6 rounded-2xl border border-ckc-gold/30 bg-ckc-black p-6 text-center">
        <Icon name="CheckCircleIcon" size={44} variant="solid" className="mx-auto mb-3 text-ckc-gold" />
        <h3 className="text-lg font-bold text-cloud">{memberName}</h3>
        <p className="mt-1 text-sm text-cloud/60">{event.title}</p>
        {result.seat ? <p className="mt-3 text-sm text-cloud">Seat {result.seat}</p> : null}
        {kidsRoom ? <p className="text-sm text-cloud">Kids room {kidsRoom}</p> : null}
        {result.securityCode ? (
          <p className="mt-3 font-mono text-3xl font-bold tracking-[0.2em] text-ckc-gold">{result.securityCode}</p>
        ) : null}
        <p className="mt-3 text-xs text-cloud/50">Show this code at the kids&apos; room for pickup.</p>
      </div>
    );
  }

  if (phase === 'confirming-kids') {
    return (
      <div className="mb-6 space-y-4 rounded-2xl border border-white/10 bg-ckc-black p-6">
        <h3 className="text-lg font-bold text-cloud">Who is here?</h3>
        <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cloud/70">
          <input type="checkbox" checked disabled />
          <span>{memberName}</span>
        </label>
        {dependants.map((child, index) => (
          <label key={`${child.name}-${index}`} className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-sm text-cloud">
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
              {child.age !== '' ? <span className="text-cloud/40"> · {child.age}</span> : null}
            </span>
          </label>
        ))}
        <button
          type="button"
          onClick={() => submit(dependants.filter((_, index) => selected.includes(index)))}
          className="w-full rounded-xl bg-ckc-gold py-3 text-sm font-bold text-ckc-black"
        >
          Confirm check-in
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6 space-y-4 rounded-2xl border border-white/10 bg-ckc-black p-6">
      <h3 className="text-lg font-bold text-cloud">Check in</h3>
      <p className="text-sm text-cloud/60">
        {dependants.length > 0
          ? `${dependants.length} ${dependants.length === 1 ? 'child is' : 'children are'} on your family record.`
          : 'Let the welcome team know you are here.'}
      </p>
      {phase === 'error' && error ? <p className="text-sm text-rose-400">{error}</p> : null}
      <button
        type="button"
        disabled={phase === 'submitting'}
        onClick={() => (dependants.length > 0 ? setPhase('confirming-kids') : submit([]))}
        className="w-full rounded-xl bg-ckc-gold py-3 text-sm font-bold text-ckc-black disabled:opacity-50"
      >
        {phase === 'submitting' ? 'Checking in…' : phase === 'error' ? 'Try again' : 'Check in now'}
      </button>
    </div>
  );
}
