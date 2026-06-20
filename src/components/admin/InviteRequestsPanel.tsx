'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { getCampusLabel } from '@/lib/church/constants';
import {
  getInviteRequests,
  updateInviteRequestStatus,
  type InviteRequest,
} from '@/lib/invites/request-service';

interface InviteRequestsPanelProps {
  onSendInvite: (request: InviteRequest) => void;
}

export default function InviteRequestsPanel({ onSendInvite }: InviteRequestsPanelProps) {
  const [requests, setRequests] = useState<InviteRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setRequests(await getInviteRequests('pending'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleDecline = async (id: string) => {
    await updateInviteRequestStatus(id, 'declined');
    refresh();
  };

  if (loading) {
    return <p className="text-sm text-cloud/40">Loading requests…</p>;
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/3 p-6 text-center">
        <Icon name="InboxIcon" size={28} variant="outline" className="mx-auto mb-2 text-cloud/20" />
        <p className="text-sm text-cloud/50">No pending invite requests</p>
        <p className="mt-1 text-xs text-cloud/30">
          People who submit at <span className="text-ckc-gold">/request-invite</span> appear here for your campus to review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((req) => (
        <div
          key={req.id}
          className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-semibold text-cloud">
              {req.fullName} {req.surname}
            </p>
            <p className="text-xs text-cloud/40">
              {req.email} · {getCampusLabel(req.campus)}
            </p>
            <p className="text-[10px] text-cloud/30 mt-0.5">
              Requested {new Date(req.requestedAt).toLocaleDateString('en-ZA')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onSendInvite(req)}
              className="rounded-lg bg-ckc-gold px-3 py-2 text-xs font-bold text-ckc-black hover:bg-ckc-gold-light"
            >
              Approve & Send Invite
            </button>
            <button
              onClick={() => handleDecline(req.id)}
              className="rounded-lg border border-white/10 px-3 py-2 text-xs text-cloud/50 hover:text-rose-400"
            >
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
