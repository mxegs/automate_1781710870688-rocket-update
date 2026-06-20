'use client';

import React, { useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import ApplicationReviewContent from '@/components/membership/ApplicationReviewContent';
import { getCampusLabel } from '@/lib/church/constants';
import { formatPhoneDisplay } from '@/lib/auth/session';
import { getMemberDetail, updateMemberAction, type MemberDetail } from '@/lib/members/service';
import type { MembershipApplication } from '@/lib/membership/types';

export interface MemberRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  dbStatus: 'active' | 'suspended' | 'inactive' | 'pending';
  campus: 'midrand' | 'verulam';
  gender: 'Male' | 'Female' | 'Unknown';
}

interface MemberManageMenuProps {
  member: MemberRow;
  onUpdated: () => void;
}

export default function MemberManageMenu({ member, onUpdated }: MemberManageMenuProps) {
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'suspend' | 'reactivate' | 'terminate' | null>(null);
  const [detail, setDetail] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const loadDetail = async () => {
    setLoading(true);
    setError('');
    try {
      setDetail(await getMemberDetail(member.id));
      setViewOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load member details.');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const runAction = async (action: 'suspend' | 'reactivate' | 'terminate') => {
    setLoading(true);
    setError('');
    try {
      await updateMemberAction(member.id, action);
      setConfirmAction(null);
      setOpen(false);
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setLoading(false);
    }
  };

  const isSuspended = member.dbStatus === 'suspended' || member.dbStatus === 'inactive';

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-1.5 text-cloud/30 transition-colors hover:bg-white/5 hover:text-ckc-gold"
          aria-label="Member options"
        >
          <Icon name="EllipsisHorizontalIcon" size={18} variant="outline" />
        </button>

        {open && (
          <div className="absolute right-0 top-full z-50 mt-1 min-w-[11rem] rounded-xl border border-white/10 bg-[#1E293B] py-1 shadow-xl">
            <button
              type="button"
              disabled={loading}
              onClick={() => void loadDetail()}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-cloud hover:bg-white/5"
            >
              <Icon name="EyeIcon" size={14} variant="outline" />
              View
            </button>
            {isSuspended ? (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setConfirmAction('reactivate');
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-emerald-400 hover:bg-white/5"
              >
                <Icon name="ArrowPathIcon" size={14} variant="outline" />
                Reactivate
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setConfirmAction('suspend');
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-amber-400 hover:bg-white/5"
              >
                <Icon name="PauseCircleIcon" size={14} variant="outline" />
                Suspend
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setConfirmAction('terminate');
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-rose-400 hover:bg-white/5"
            >
              <Icon name="TrashIcon" size={14} variant="outline" />
              Terminate
            </button>
          </div>
        )}
      </div>

      {viewOpen && detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-white/10 bg-[#1E293B]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-cloud">{member.name}</h2>
                <p className="text-xs text-cloud/40">
                  {formatPhoneDisplay(detail.phone)} · {getCampusLabel(detail.campusId)}
                </p>
              </div>
              <button type="button" onClick={() => setViewOpen(false)} className="text-cloud/40 hover:text-cloud">
                <Icon name="XMarkIcon" size={20} variant="outline" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {detail.applicationData ? (
                <ApplicationReviewContent
                  application={detail.applicationData as MembershipApplication}
                  phone={detail.phone}
                  campus={detail.campusId}
                  submittedAt={detail.submittedAt}
                />
              ) : (
                <div className="space-y-2 text-sm text-cloud/60">
                  <p>No full membership form on file.</p>
                  <p>Email: {detail.email ?? '—'}</p>
                  <p>Gender: {detail.gender ?? '—'}</p>
                  <p>Age: {detail.age ?? '—'}</p>
                  <p>Member since: {detail.memberSince}</p>
                </div>
              )}
            </div>
            <div className="border-t border-white/10 px-5 py-4">
              <button
                type="button"
                onClick={() => setViewOpen(false)}
                className="w-full rounded-xl border border-white/10 py-2.5 text-sm text-cloud/70 hover:text-cloud"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1E293B] p-6">
            <h3 className="text-lg font-bold text-cloud">
              {confirmAction === 'suspend' && 'Suspend member?'}
              {confirmAction === 'reactivate' && 'Reactivate member?'}
              {confirmAction === 'terminate' && 'Terminate membership?'}
            </h3>
            <p className="mt-2 text-sm text-cloud/60">
              {confirmAction === 'suspend' &&
                `${member.name} will be excluded from broadcasts and group filters, and cannot sign in until reactivated.`}
              {confirmAction === 'reactivate' &&
                `${member.name} can sign in again and will appear in member lists and broadcasts.`}
              {confirmAction === 'terminate' &&
                `${member.name} will be removed completely. They can request membership again and start from scratch.`}
            </p>
            {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setConfirmAction(null);
                  setError('');
                }}
                className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm text-cloud/60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => void runAction(confirmAction)}
                className={`flex-1 rounded-lg py-2.5 text-sm font-bold ${
                  confirmAction === 'terminate'
                    ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                    : confirmAction === 'reactivate'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                {loading ? 'Working…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
