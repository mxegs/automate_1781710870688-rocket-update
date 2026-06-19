'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import PageHeader, { ContentCard } from '@/components/portal/PageHeader';
import {
  createBroadcast,
  formatSongChart,
  getBroadcasts,
  getGroupById,
  getGroupsLedBy,
  getSongs,
  saveSong,
  sendSongToBand,
} from '@/lib/groups/service';
import { getSession } from '@/lib/auth/session';
import { MUSICAL_KEYS, type GroupBroadcast, type GroupSong } from '@/lib/groups/types';
import type { ChurchGroup } from '@/lib/groups/types';

type Tab = 'broadcasts' | 'songs';

export default function GroupLeaderPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [group, setGroup] = useState<ChurchGroup | null>(null);
  const [tab, setTab] = useState<Tab>('broadcasts');
  const [broadcasts, setBroadcasts] = useState<GroupBroadcast[]>([]);
  const [songs, setSongs] = useState<GroupSong[]>([]);
  const [showBroadcastForm, setShowBroadcastForm] = useState(false);
  const [showSongForm, setShowSongForm] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastWhen, setBroadcastWhen] = useState('');
  const [songNotice, setSongNotice] = useState('');
  const [songForm, setSongForm] = useState({
    title: '',
    key: 'G',
    verse1: '',
    verse2: '',
    chorus: '',
    bridge: '',
    notes: '',
  });

  const refresh = async () => {
    const g = await getGroupById(groupId);
    setGroup(g);
    setBroadcasts(await getBroadcasts(groupId));
    setSongs(await getSongs(groupId));
  };

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace('/login');
      return;
    }
    (async () => {
      const g = await getGroupById(groupId);
      if (!g) {
        router.replace('/my-groups');
        return;
      }
      const led = await getGroupsLedBy(session.phone);
      const isAdmin = session.role === 'admin' || session.role === 'pastor';
      const isLeader = led.some((x) => x.id === groupId);
      if (!isLeader && !isAdmin) {
        router.replace('/my-groups');
        return;
      }
      refresh();
    })();
  }, [groupId, router]);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    const session = getSession();
    if (!broadcastMsg.trim() || !broadcastWhen || !session) return;
    await createBroadcast({
      groupId,
      message: broadcastMsg.trim(),
      scheduledAt: new Date(broadcastWhen).toISOString(),
      createdByPhone: session.phone,
    });
    setBroadcastMsg('');
    setBroadcastWhen('');
    setShowBroadcastForm(false);
    refresh();
  };

  const resetSongForm = () => {
    setSongForm({ title: '', key: 'G', verse1: '', verse2: '', chorus: '', bridge: '', notes: '' });
    setShowSongForm(false);
  };

  const handleSaveSong = async (andSend: boolean) => {
    if (!songForm.title.trim() || !songForm.verse1.trim() || !songForm.chorus.trim() || !group) return;

    const song = await saveSong({
      groupId,
      title: songForm.title.trim(),
      key: songForm.key,
      verse1: songForm.verse1.trim(),
      verse2: songForm.verse2.trim(),
      chorus: songForm.chorus.trim(),
      bridge: songForm.bridge.trim() || undefined,
      notes: songForm.notes.trim() || undefined,
    });

    if (andSend) {
      const result = await sendSongToBand(song, group);
      setSongNotice(
        result.sent > 0
          ? `Saved & sent to ${result.sent} band member${result.sent === 1 ? '' : 's'} (demo SMS logged to console).`
          : 'Saved — add band members to the group to send.',
      );
    } else {
      setSongNotice('Song saved to your library.');
    }

    resetSongForm();
    refresh();
  };

  const handleSendExistingSong = async (song: GroupSong) => {
    if (!group) return;
    const result = await sendSongToBand(song, group);
    setSongNotice(
      result.sent > 0
        ? `"${song.title}" sent to ${result.sent} band member${result.sent === 1 ? '' : 's'}.`
        : 'No band members assigned to this group yet.',
    );
    refresh();
  };

  if (!group) return null;

  return (
    <AppShell access="group-leader">
      <Link href="/my-groups" className="mb-4 inline-flex items-center gap-1 text-xs text-ckc-gold hover:underline">
        <Icon name="ArrowLeftIcon" size={14} variant="outline" /> Back to My Groups
      </Link>

      <PageHeader title={group.name} subtitle="One-way messages to your group — members cannot reply" />

      <div className="flex gap-2 border-b border-white/10 pb-1">
        <button
          onClick={() => setTab('broadcasts')}
          className={`px-4 py-2 text-sm font-semibold ${tab === 'broadcasts' ? 'border-b-2 border-ckc-gold text-ckc-gold' : 'text-cloud/40'}`}
        >
          Broadcasts
        </button>
        {group.enableSongLibrary && (
          <button
            onClick={() => setTab('songs')}
            className={`px-4 py-2 text-sm font-semibold ${tab === 'songs' ? 'border-b-2 border-ckc-gold text-ckc-gold' : 'text-cloud/40'}`}
          >
            Song Library
          </button>
        )}
      </div>

      {tab === 'broadcasts' && (
        <>
          <div className="flex justify-end">
            <button
              onClick={() => setShowBroadcastForm(true)}
              className="flex items-center gap-2 rounded-xl bg-ckc-gold px-4 py-2 text-sm font-bold text-ckc-black"
            >
              <Icon name="MegaphoneIcon" size={16} variant="outline" />
              Schedule Message
            </button>
          </div>

          {showBroadcastForm && (
            <ContentCard title="Schedule broadcast" icon="ClockIcon">
              <form onSubmit={handleSendBroadcast} className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-cloud/50">Message</label>
                  <textarea
                    value={broadcastMsg}
                    onChange={(e) => setBroadcastMsg(e.target.value)}
                    rows={4}
                    placeholder="Practice Saturday 10am. Bring your instruments."
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-cloud/50">Send at</label>
                  <input
                    type="datetime-local"
                    value={broadcastWhen}
                    onChange={(e) => setBroadcastWhen(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-cloud"
                    required
                  />
                </div>
                <p className="text-[10px] text-cloud/30">Demo mode — SMS delivery when backend is connected.</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowBroadcastForm(false)} className="flex-1 rounded-lg border border-white/10 py-2 text-sm text-cloud/60">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 rounded-lg bg-ckc-gold py-2 text-sm font-bold text-ckc-black">
                    Schedule
                  </button>
                </div>
              </form>
            </ContentCard>
          )}

          <div className="space-y-3">
            {broadcasts.length === 0 ? (
              <p className="text-center text-sm text-cloud/30 py-8">No broadcasts scheduled yet</p>
            ) : (
              broadcasts.map((b) => (
                <ContentCard key={b.id}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-cloud leading-relaxed">{b.message}</p>
                    <span className="shrink-0 rounded-full border border-amber-400/20 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-400">
                      {b.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-cloud/30">
                    Scheduled: {new Date(b.scheduledAt).toLocaleString('en-ZA')}
                  </p>
                </ContentCard>
              ))
            )}
          </div>
        </>
      )}

      {tab === 'songs' && group.enableSongLibrary && (
        <>
          {songNotice && (
            <p className="rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
              {songNotice}
            </p>
          )}
          <div className="flex justify-end">
            <button
              onClick={() => {
                setSongNotice('');
                setShowSongForm(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-ckc-gold px-4 py-2 text-sm font-bold text-ckc-black"
            >
              <Icon name="MusicalNoteIcon" size={16} variant="outline" />
              Add Song
            </button>
          </div>

          {showSongForm && (
            <ContentCard title="New song chart" icon="MusicalNoteIcon">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-cloud/50">Song title</label>
                    <input
                      value={songForm.title}
                      onChange={(e) => setSongForm({ ...songForm, title: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-cloud/50">Key</label>
                    <select
                      value={songForm.key}
                      onChange={(e) => setSongForm({ ...songForm, key: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-cloud"
                    >
                      {MUSICAL_KEYS.map((k) => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {(['verse1', 'verse2', 'chorus', 'bridge'] as const).map((section) => (
                  <div key={section}>
                    <label className="mb-1 block text-xs font-semibold capitalize text-ckc-gold">
                      {section === 'verse1' ? 'Verse 1' : section === 'verse2' ? 'Verse 2' : section}
                      {(section === 'verse1' || section === 'chorus') && ' *'}
                    </label>
                    <textarea
                      value={songForm[section]}
                      onChange={(e) => setSongForm({ ...songForm, [section]: e.target.value })}
                      rows={section === 'chorus' ? 4 : 3}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud font-mono leading-relaxed"
                      required={section === 'verse1' || section === 'chorus'}
                    />
                  </div>
                ))}
                <div>
                  <label className="mb-1 block text-xs text-cloud/50">Notes for band (optional)</label>
                  <input
                    value={songForm.notes}
                    onChange={(e) => setSongForm({ ...songForm, notes: e.target.value })}
                    placeholder="Capo 2, start with keys only…"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cloud"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSongForm(false);
                      setSongNotice('');
                    }}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-cloud/60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveSong(false)}
                    className="flex-1 rounded-lg border border-ckc-gold/30 bg-ckc-gold/10 py-2 text-sm font-semibold text-ckc-gold hover:bg-ckc-gold/20"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveSong(true)}
                    className="flex-1 rounded-lg bg-ckc-gold py-2 text-sm font-bold text-ckc-black hover:bg-ckc-gold-light"
                  >
                    Save & Send
                  </button>
                </div>
              </div>
            </ContentCard>
          )}

          <div className="space-y-4">
            {songs.length === 0 ? (
              <p className="text-center text-sm text-cloud/30 py-8">No songs saved yet</p>
            ) : (
              songs.map((s) => (
                <ContentCard key={s.id}>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h3 className="font-bold text-cloud">{s.title}</h3>
                    <span className="rounded-lg border border-ckc-gold/30 bg-ckc-gold/10 px-2.5 py-1 text-sm font-bold text-ckc-gold">
                      Key: {s.key}
                    </span>
                  </div>
                  {[
                    { label: 'Verse 1', text: s.verse1 },
                    { label: 'Verse 2', text: s.verse2 },
                    { label: 'Chorus', text: s.chorus },
                    s.bridge ? { label: 'Bridge', text: s.bridge } : null,
                  ]
                    .filter(Boolean)
                    .map((block) => (
                      <div key={block!.label} className="mb-3 last:mb-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-ckc-gold mb-1">{block!.label}</p>
                        <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-cloud/70">{block!.text}</pre>
                      </div>
                    ))}
                  {s.notes && <p className="mt-2 text-xs text-cloud/40 italic">Note: {s.notes}</p>}
                  {s.sentAt && (
                    <p className="mt-2 text-[10px] text-cloud/30">
                      Last sent: {new Date(s.sentAt).toLocaleString('en-ZA')}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleSendExistingSong(s)}
                      className="text-xs font-semibold text-ckc-gold hover:underline"
                    >
                      Send to Band
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard.writeText(formatSongChart(s));
                        setSongNotice(`"${s.title}" copied to clipboard.`);
                      }}
                      className="text-xs text-cloud/50 hover:text-cloud/70"
                    >
                      Copy chart
                    </button>
                  </div>
                </ContentCard>
              ))
            )}
          </div>
        </>
      )}
    </AppShell>
  );
}
