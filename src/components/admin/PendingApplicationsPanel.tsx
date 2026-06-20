'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import ApplicationReviewContent from '@/components/membership/ApplicationReviewContent';
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
  const [selected, setSelected] = useState<SubmittedApplication | null>(null);
  const [reviewing, setReviewing] = useState(false);

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
    setReviewing(true);
    try {
      await reviewApplication(id, status);
      setSelected(null);
      refresh();
    } finally {
      setReviewing(false);
    }
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
    <>
      <div className="space-y-3">
        {apps.map((app) => {
          const personal = app.applicationData?.personal;
          const name = personal?.fullName
            ? `${personal.fullName} ${personal.surname ?? ''}`.trim()
            : 'Applicant';
          const emergency = app.applicationData?.emergencyContact;
          return (
            <div
              key={app.id}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-cloud">{name}</p>
                  <p className="text-xs text-cloud/40">
                    {formatPhoneDisplay(app.phone)} · {getCampusLabel(app.campus as 'midrand' | 'verulam')}
                  </p>
                  {personal?.email && (
                    <p className="text-xs text-cloud/40">{personal.email}</p>
                  )}
                  {emergency?.name && (
                    <p className="mt-1 text-[11px] text-cloud/30">
                      Next of kin: {emergency.name}
                      {emergency.relationship ? ` (${emergency.relationship})` : ''}
                    </p>
                  )}
                  {app.submittedAt && (
                    <p className="text-[10px] text-cloud/30 mt-0.5">
                      Submitted {new Date(app.submittedAt).toLocaleDateString('en-ZA')}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 sm:shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelected(app)}
                    className="rounded-lg border border-ckc-gold/30 bg-ckc-gold/10 px-3 py-2 text-xs font-bold text-ckc-gold hover:bg-ckc-gold/20"
                  >
                    View full application
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-white/10 bg-[#1E293B]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-cloud">Membership application</h2>
                <p className="text-xs text-cloud/40">
                  Scroll to verify all details before approving
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-cloud/40 hover:text-cloud"
                aria-label="Close"
              >
                <Icon name="XMarkIcon" size={20} variant="outline" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ApplicationReviewContent
                application={selected.applicationData}
                phone={selected.phone}
                campus={selected.campus as 'midrand' | 'verulam'}
                submittedAt={selected.submittedAt}
              />
            </div>

            <div className="flex flex-wrap gap-2 border-t border-white/10 px-5 py-4">
              <button
                type="button"
                disabled={reviewing}
                onClick={() => handleReview(selected.id, 'approved')}
                className="flex-1 rounded-xl bg-emerald-500/20 py-2.5 text-sm font-bold text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-50"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={reviewing}
                onClick={() => handleReview(selected.id, 'rejected')}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-cloud/50 hover:text-rose-400 disabled:opacity-50"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-cloud/50 hover:text-cloud"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
