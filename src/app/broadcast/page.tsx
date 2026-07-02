'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import PageHeader, { ContentCard } from '@/components/portal/PageHeader';
import { AGE_CATEGORIES, CAMPUSES, getCampusLabel } from '@/lib/church/constants';
import type { CampusId } from '@/lib/church/constants';
import { previewBroadcast, sendBroadcast, testMailchimp } from '@/lib/broadcast/service';
import { getAllGroups, getGroupsLedBy } from '@/lib/groups/service';
import type { ChurchGroup } from '@/lib/groups/types';
import { getSession } from '@/lib/auth/session';
import { hasAllCampusAccess, isChurchWideAppRole } from '@/lib/auth/church-wide-staff';

type AudienceType = 'members' | 'group';
type Channel = 'sms' | 'email';

export default function BroadcastPage() {
  const session = getSession();
  const isLeader = session?.role === 'leader';
  const churchWide = isChurchWideAppRole(session?.role ?? null);
  const allCampuses = hasAllCampusAccess({
    isSuperAdmin: session?.isSuperAdmin,
    role: session?.role,
  });
  const campusScope = session?.campusId as CampusId | undefined;

  const [audienceType, setAudienceType] = useState<AudienceType>(isLeader ? 'group' : 'members');
  const [channel, setChannel] = useState<Channel>('sms');
  const [campusId, setCampusId] = useState<CampusId | 'all'>(allCampuses ? 'all' : campusScope ?? 'midrand');
  const [gender, setGender] = useState<'Male' | 'Female' | 'all'>('all');
  const [ageCategory, setAgeCategory] = useState<'child' | 'youth' | 'adult' | 'all'>('all');
  const [groupId, setGroupId] = useState('');
  const [groups, setGroups] = useState<ChurchGroup[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [count, setCount] = useState(0);
  const [smsCount, setSmsCount] = useState(0);
  const [emailCount, setEmailCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [mailchimpStatus, setMailchimpStatus] = useState<string | null>(null);

  const campusLocked = Boolean(campusScope) && !isLeader && !churchWide;

  useEffect(() => {
    if (campusScope && !allCampuses) setCampusId(campusScope);
  }, [campusScope, allCampuses]);

  useEffect(() => {
    const loadGroups = async () => {
      if (isLeader && session?.phone) {
        const led = await getGroupsLedBy(session.phone);
        setGroups(led);
        if (led[0]) setGroupId((prev) => prev || led[0].id);
        return;
      }
      const list = await getAllGroups();
      const scoped = allCampuses ? list : campusScope ? list.filter((g) => g.campus === campusScope) : list;
      setGroups(scoped);
      if (scoped[0]) setGroupId((prev) => prev || scoped[0].id);
    };
    loadGroups();
  }, [isLeader, session?.phone, campusScope, allCampuses]);

  useEffect(() => {
    testMailchimp().then((res) => {
      if (res.ok) {
        const from = res.fromEmail ? ` · from ${res.fromEmail}` : '';
        const optIn = res.doubleOptIn ? ' · double opt-in ON' : '';
        setMailchimpStatus(`Mailchimp connected — audience: ${res.listName}${from}${optIn}`);
        if (res.warning) setMailchimpStatus((prev) => `${prev} — ${res.warning}`);
      } else {
        setMailchimpStatus(res.error ?? 'Mailchimp not configured');
      }
    });
  }, []);

  const filters = useMemo(
    () => ({
      audienceType,
      campusId: audienceType === 'members' ? campusId : undefined,
      gender: audienceType === 'members' ? gender : undefined,
      ageCategory: audienceType === 'members' ? ageCategory : undefined,
      groupId: audienceType === 'group' ? groupId : undefined,
    }),
    [audienceType, campusId, gender, ageCategory, groupId],
  );

  const refreshCount = async () => {
    try {
      const preview = await previewBroadcast(filters);
      setCount(preview.count);
      setSmsCount(preview.smsCount);
      setEmailCount(preview.emailCount);
    } catch {
      setCount(0);
      setSmsCount(0);
      setEmailCount(0);
    }
  };

  useEffect(() => {
    refreshCount();
  }, [filters]);

  const recipientCount = channel === 'sms' ? smsCount : emailCount;

  const scopeHint = isLeader
    ? 'Message groups you lead, or members on your campus if assigned.'
    : churchWide
      ? 'Church-wide access — broadcast to any campus or all members.'
      : campusLocked
        ? `Messages go to ${getCampusLabel(campusScope!)} members only.`
        : 'Filter members or choose a group.';

  const handleSend = async () => {
    if (!message.trim()) return;
    if (channel === 'email' && !subject.trim()) {
      setResult('Enter an email subject line.');
      return;
    }
    if (!confirm(`Send ${channel.toUpperCase()} to ${recipientCount} recipient(s)?`)) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await sendBroadcast({
        ...filters,
        channel,
        message: message.trim(),
        subject: subject.trim() || 'Message from CKC',
      });
      const demoNote = res.demo ? ' (demo mode)' : '';
      const warnNote = 'warnings' in res && res.warnings?.length ? ` Note: ${res.warnings.join(' ')}` : '';
      setResult(
        channel === 'sms'
          ? `SMS sent to ${res.sent} of ${res.total}${res.failed ? `, ${res.failed} failed` : ''}${demoNote}`
          : `Email sent to ${res.sent} of ${res.total} via Mailchimp${demoNote}${warnNote}`,
      );
      if (res.sent > 0) setMessage('');
    } catch (err) {
      setResult(err instanceof Error ? err.message : 'Send failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell access="staff">
      <PageHeader
        title="Broadcast"
        subtitle={scopeHint}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <ContentCard title="1. Audience" icon="UsersIcon" className="lg:col-span-1">
          <div className="space-y-4">
            <div className="flex rounded-lg border border-white/10 bg-white/5 p-1">
              {(['members', 'group'] as AudienceType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAudienceType(type)}
                  className={`flex-1 rounded-md py-2 text-xs font-semibold capitalize ${
                    audienceType === type ? 'bg-ckc-gold/20 text-ckc-gold' : 'text-cloud/50'
                  }`}
                >
                  {type === 'members' ? 'All members' : 'A group'}
                </button>
              ))}
            </div>

            {audienceType === 'members' ? (
              <>
                <Field label="Campus">
                  {campusLocked ? (
                    <p className="input opacity-80">{getCampusLabel(campusScope!)}</p>
                  ) : (
                    <select
                      value={campusId}
                      onChange={(e) => setCampusId(e.target.value as CampusId | 'all')}
                      className="input"
                    >
                      {allCampuses && <option value="all">All campuses</option>}
                      {(allCampuses ? CAMPUSES : CAMPUSES.filter((c) => c.id === campusScope)).map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  )}
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Gender">
                    <select value={gender} onChange={(e) => setGender(e.target.value as typeof gender)} className="input">
                      <option value="all">All</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </Field>
                  <Field label="Age group">
                    <select
                      value={ageCategory}
                      onChange={(e) => setAgeCategory(e.target.value as typeof ageCategory)}
                      className="input"
                    >
                      <option value="all">All</option>
                      {AGE_CATEGORIES.map((a) => (
                        <option key={a.id} value={a.id}>{a.label}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              </>
            ) : (
              <Field label="Group">
                <select value={groupId} onChange={(e) => setGroupId(e.target.value)} className="input">
                  {groups.length === 0 && <option value="">No groups yet — create one under Groups</option>}
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name} ({g.campus})</option>
                  ))}
                </select>
              </Field>
            )}

            <div className="rounded-lg border border-ckc-gold/20 bg-ckc-gold/10 px-3 py-2 text-xs text-ckc-gold">
              <p>{count} people in audience</p>
              <p className="mt-1 text-ckc-gold/80">{smsCount} with phone · {emailCount} with email</p>
            </div>
          </div>
        </ContentCard>

        <ContentCard title="2. Channel & message" icon="MegaphoneIcon" className="lg:col-span-2">
          <div className="space-y-4">
            <div className="flex rounded-lg border border-white/10 bg-white/5 p-1 max-w-md">
              {(['sms', 'email'] as Channel[]).map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setChannel(ch)}
                  className={`flex-1 rounded-md py-2 text-xs font-semibold uppercase ${
                    channel === ch ? 'bg-ckc-gold/20 text-ckc-gold' : 'text-cloud/50'
                  }`}
                >
                  {ch === 'sms' ? 'SMS (BulkSMS)' : 'Email (Mailchimp)'}
                </button>
              ))}
            </div>

            {channel === 'email' && (
              <Field label="Email subject">
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Sunday service reminder"
                  className="input"
                />
              </Field>
            )}

            <Field label={channel === 'sms' ? 'SMS message' : 'Email body'}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={channel === 'sms' ? 4 : 8}
                placeholder={channel === 'sms' ? 'Short message (160 chars recommended)…' : 'Write your newsletter…'}
                className="input min-h-[100px]"
                maxLength={channel === 'sms' ? 160 : undefined}
              />
              {channel === 'sms' && (
                <p className="mt-1 text-[10px] text-cloud/30">{message.length}/160 characters</p>
              )}
            </Field>

            {mailchimpStatus && channel === 'email' && (
              <p className={`text-xs ${mailchimpStatus.includes('connected') ? 'text-ckc-gold' : 'text-cloud/40'}`}>
                {mailchimpStatus}
              </p>
            )}

            {result && (
              <p className={`text-sm ${result.includes('failed') ? 'text-rose-400' : 'text-ckc-gold'}`}>
                {result}
              </p>
            )}

            <button
              type="button"
              onClick={handleSend}
              disabled={loading || !message.trim() || recipientCount === 0}
              className="flex items-center gap-2 rounded-xl bg-ckc-gold px-6 py-3 text-sm font-bold text-ckc-black disabled:opacity-40"
            >
              <Icon name="PaperAirplaneIcon" size={16} variant="outline" />
              {loading ? 'Sending…' : `Send ${channel.toUpperCase()} to ${recipientCount}`}
            </button>
          </div>
        </ContentCard>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: #e2e8f0;
        }
      `}</style>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-cloud/40">
        {label}
      </label>
      {children}
    </div>
  );
}
