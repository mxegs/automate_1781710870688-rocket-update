'use client';

import React from 'react';
import { getCampusLabel } from '@/lib/church/constants';
import { formatPhoneDisplay } from '@/lib/auth/session';
import type { MembershipApplication } from '@/lib/membership/types';

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex gap-2 text-xs leading-relaxed">
      <span className="min-w-[7.5rem] shrink-0 text-cloud/40">{label}</span>
      <span className="text-cloud">{value || '—'}</span>
    </p>
  );
}

function ReviewBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ckc-gold">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

interface ApplicationReviewContentProps {
  application: MembershipApplication;
  phone?: string;
  campus?: 'midrand' | 'verulam';
  submittedAt?: string | null;
}

export default function ApplicationReviewContent({
  application,
  phone,
  campus,
  submittedAt,
}: ApplicationReviewContentProps) {
  const { personal, guardian, emergencyContact, spiritual, ministry, covenant } = application;
  const depCount =
    typeof guardian.numberOfDependants === 'number' ? guardian.numberOfDependants : 0;

  return (
    <div className="space-y-3">
      {(phone || campus || submittedAt) && (
        <ReviewBlock title="Submission">
          {submittedAt && (
            <ReviewRow label="Submitted" value={new Date(submittedAt).toLocaleString('en-ZA')} />
          )}
          {phone && <ReviewRow label="Cell (record)" value={formatPhoneDisplay(phone)} />}
          {campus && <ReviewRow label="Campus" value={getCampusLabel(campus)} />}
        </ReviewBlock>
      )}

      <ReviewBlock title="Personal">
        <ReviewRow label="Name" value={`${personal.fullName} ${personal.surname}`.trim()} />
        <ReviewRow label="Username" value={personal.username} />
        <ReviewRow
          label="Campus"
          value={personal.campus ? getCampusLabel(personal.campus) : ''}
        />
        <ReviewRow label="Cell" value={personal.cellNo} />
        <ReviewRow label="Tel" value={personal.telNo} />
        <ReviewRow label="Email" value={personal.email} />
        <ReviewRow label="Address" value={personal.permanentAddress} />
        <ReviewRow
          label="Identity"
          value={
            personal.identityType === 'sa_id'
              ? `SA ID · ${personal.identityNumber}`
              : personal.identityType === 'passport'
                ? `Passport · ${personal.identityNumber}`
                : personal.identityNumber
          }
        />
        <ReviewRow
          label="Citizenship"
          value={
            personal.citizenship === 'Other'
              ? `Other · ${personal.countryOfOrigin}`
              : personal.citizenship
          }
        />
        <ReviewRow
          label="Date of birth"
          value={
            personal.dateOfBirth
              ? `${personal.dateOfBirth}${personal.age !== '' ? ` (${personal.age} yrs)` : ''}`
              : ''
          }
        />
        <ReviewRow label="Gender" value={personal.gender} />
        <ReviewRow label="Marital status" value={personal.maritalStatus} />
        <ReviewRow
          label="Occupation"
          value={
            personal.occupation.length > 0
              ? personal.occupation.join(', ') +
                (personal.occupationOther ? ` · ${personal.occupationOther}` : '')
              : personal.occupationOther
          }
        />
        <ReviewRow label="Employer" value={personal.employer} />
        <ReviewRow label="Contact name" value={personal.contactName} />
        <ReviewRow label="Contact tel" value={personal.contactTel} />
        {personal.idPhotoDataUrl && (
          <div className="pt-1">
            <p className="mb-1 text-[10px] text-cloud/40">ID photo</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={personal.idPhotoDataUrl}
              alt="Applicant ID"
              className="max-h-32 rounded-lg border border-white/10 object-cover"
            />
          </div>
        )}
      </ReviewBlock>

      {(guardian.title ||
        guardian.surname ||
        guardian.relationship ||
        depCount > 0) && (
        <ReviewBlock title="Guardian / spouse">
          <ReviewRow
            label="Guardian"
            value={[guardian.title, guardian.initial, guardian.surname].filter(Boolean).join(' ')}
          />
          <ReviewRow label="Relationship" value={guardian.relationship} />
          <ReviewRow label="Tel home" value={guardian.telHome} />
          <ReviewRow label="Tel work" value={guardian.telWork} />
          <ReviewRow label="Address" value={guardian.streetAddress} />
          <ReviewRow label="Occupation" value={guardian.occupation} />
          <ReviewRow label="Organisation" value={guardian.organisation} />
          <ReviewRow label="Spouse joining" value={guardian.spouseJoining} />
        </ReviewBlock>
      )}

      <ReviewBlock title="Dependants">
        <ReviewRow label="Count" value={depCount > 0 ? String(depCount) : 'None'} />
        {depCount > 0 &&
          guardian.dependants.slice(0, depCount).map((d, i) => (
            <ReviewRow
              key={i}
              label={`Dependant ${i + 1}`}
              value={`${d.name}${d.age !== '' ? `, age ${d.age}` : ''}`}
            />
          ))}
      </ReviewBlock>

      <ReviewBlock title="Emergency contact (next of kin)">
        <ReviewRow label="Name" value={emergencyContact.name} />
        <ReviewRow label="Relationship" value={emergencyContact.relationship} />
        <ReviewRow label="Phone" value={emergencyContact.phoneNumber} />
      </ReviewBlock>

      <ReviewBlock title="Spiritual background">
        <ReviewRow label="Accepted Christ" value={spiritual.acceptedChrist} />
        <ReviewRow label="Baptized" value={spiritual.baptized} />
        {spiritual.baptized === 'Yes' && (
          <ReviewRow
            label="Baptism"
            value={[spiritual.baptismDate, spiritual.baptismLocation].filter(Boolean).join(' · ')}
          />
        )}
        <ReviewRow label="Previous church" value={spiritual.previousChurchMember} />
        {spiritual.previousChurchMember === 'Yes' && (
          <>
            <ReviewRow label="Church name" value={spiritual.previousChurchName} />
            <ReviewRow
              label="Attended"
              value={[spiritual.previousChurchDate, spiritual.previousChurchLocation]
                .filter(Boolean)
                .join(' · ')}
            />
            <ReviewRow label="Reason for leaving" value={spiritual.reasonForLeaving} />
          </>
        )}
      </ReviewBlock>

      <ReviewBlock title="Ministry interests">
        <ReviewRow label="Areas" value={ministry.areasOfInterest.join(', ')} />
        <ReviewRow label="Gifts" value={ministry.spiritualGifts} />
        <ReviewRow label="Passions" value={ministry.ministryPassions} />
      </ReviewBlock>

      <ReviewBlock title="Covenant">
        <ReviewRow label="Agreed" value={covenant.agreedToCovenant ? 'Yes' : 'No'} />
        <ReviewRow label="Signed as" value={covenant.fullName} />
        <ReviewRow label="Date signed" value={covenant.dateSigned} />
        {covenant.signatureDataUrl && (
          <div className="pt-1">
            <p className="mb-1 text-[10px] text-cloud/40">Signature</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={covenant.signatureDataUrl}
              alt="Signature"
              className="max-h-20 rounded border border-white/10 bg-white"
            />
          </div>
        )}
      </ReviewBlock>
    </div>
  );
}
