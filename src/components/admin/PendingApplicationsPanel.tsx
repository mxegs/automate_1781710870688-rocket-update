'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { getCampusLabel } from '@/lib/church/constants';
import { formatPhoneDisplay } from '@/lib/auth/session';
import {
  getSubmittedApplications,
  reviewApplication,
  type SubmittedApplication,
} from '@/lib/membership/service';

export default function PendingApplicationsPanel() {
  const [apps, setApps] = useState<SubmittedApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setApps(await getSubmittedApplications());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    await reviewApplication(id, status);
    refresh();
  };

  if (loading) return <p className="text-sm text-cloud/40">Loading applications…</p>;

  if (apps.length === 0) {
    return (
      <p className="text-sm text-cloud/50 text-center py-6">
        No pending membership applications. Completed signup forms appear here for approval.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {apps.map((app) => {
        const personal = app.applicationData?.personal;
        const name = personal?.fullName
          ? `${personal.fullName} ${personal.surname ?? ''}`.trim()
          : 'Applicant';
        return (
          <div
            key={app.id}
            className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold text-cloud">{name}</p>
              <p className="text-xs text-cloud/40">
                {formatPhoneDisplay(app.phone)} · {getCampusLabel(app.campus as 'midrand' | 'verulam')}
              </p>
              {app.submittedAt && (
                <p className="text-[10px] text-cloud/30 mt-0.5">
                  Submitted {new Date(app.submittedAt).toLocaleDateString('en-ZA')}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleReview(app.id, 'approved')}
                className="rounded-lg bg-emerald-500/20 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/30"
              >
                Approve
              </button>
              <button
                onClick={() => handleReview(app.id, 'rejected')}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs text-cloud/50 hover:text-rose-400"
              >
                Reject
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
