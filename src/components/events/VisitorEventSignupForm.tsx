'use client';

import React, { useState } from 'react';
import { CkcButton, CkcField, CkcInput, CkcRadioGroup } from '@/components/ui/CkcForm';
import { registerEventVisitor } from '@/lib/events/service';
import type { VisitorEventProfile } from '@/lib/events/visitor-profile';
import { setVisitorEventProfile } from '@/lib/events/visitor-profile';
import type { CampusId } from '@/lib/church/constants';

const MARITAL_OPTIONS = ['Never Married', 'Married', 'Divorced', 'Engaged', 'Widow or Widower'];

interface VisitorEventSignupFormProps {
  campusId?: CampusId;
  onComplete: (profile: VisitorEventProfile) => void;
}

export default function VisitorEventSignupForm({ campusId = 'midrand', onComplete }: VisitorEventSignupFormProps) {
  const [givenName, setGivenName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | ''>('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [acceptedJesus, setAcceptedJesus] = useState<boolean | null>(null);
  const [wantsToJoinChurch, setWantsToJoinChurch] = useState<boolean | null>(null);
  const [eventNewsConsent, setEventNewsConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!givenName.trim() || !surname.trim()) {
      setError('Name and surname are required.');
      return;
    }
    if (!email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    if (phone.replace(/\D/g, '').length < 9) {
      setError('Enter a valid phone number.');
      return;
    }
    if (!gender) {
      setError('Please select gender.');
      return;
    }
    if (!maritalStatus) {
      setError('Please select marital status.');
      return;
    }
    if (acceptedJesus === null || wantsToJoinChurch === null) {
      setError('Please answer the faith questions.');
      return;
    }

    setLoading(true);
    try {
      const result = await registerEventVisitor({
        givenName: givenName.trim(),
        surname: surname.trim(),
        email: email.trim().toLowerCase(),
        phone,
        gender,
        maritalStatus,
        acceptedJesus,
        wantsToJoinChurch,
        eventNewsConsent,
        campusId,
      });

      const profile: VisitorEventProfile = {
        givenName: givenName.trim(),
        surname: surname.trim(),
        email: email.trim().toLowerCase(),
        phone,
        gender,
        maritalStatus,
        acceptedJesus,
        wantsToJoinChurch,
        eventNewsConsent,
        visitorId: result.visitor.id,
      };
      setVisitorEventProfile(profile);
      onComplete(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-cloud/50 leading-relaxed">
        Please tell us a little about yourself before registering for this event.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <CkcField label="Name" required>
          <CkcInput value={givenName} onChange={(e) => setGivenName(e.target.value)} placeholder="First name" />
        </CkcField>
        <CkcField label="Surname" required>
          <CkcInput value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="Surname" />
        </CkcField>
      </div>

      <CkcField label="Email address" required>
        <CkcInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
      </CkcField>

      <CkcField label="Phone number" required>
        <CkcInput type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="082 123 4567" />
      </CkcField>

      <CkcField label="Gender" required>
        <CkcRadioGroup options={['Male', 'Female']} value={gender} onChange={setGender} name="visitor-gender" />
      </CkcField>

      <CkcField label="Marital status" required>
        <select
          value={maritalStatus}
          onChange={(e) => setMaritalStatus(e.target.value)}
          className="ckc-input w-full rounded-lg px-3 py-2.5 text-sm"
        >
          <option value="">Select</option>
          {MARITAL_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </CkcField>

      <CkcField label="Have you accepted Jesus as your Lord and Saviour?" required>
        <CkcRadioGroup
          options={['Yes', 'No']}
          value={acceptedJesus === true ? 'Yes' : acceptedJesus === false ? 'No' : ''}
          onChange={(v) => setAcceptedJesus(v === 'Yes')}
          name="visitor-salvation"
        />
      </CkcField>

      <CkcField label="Would you like to join our church family?" required>
        <CkcRadioGroup
          options={['Yes', 'No']}
          value={wantsToJoinChurch === true ? 'Yes' : wantsToJoinChurch === false ? 'No' : ''}
          onChange={(v) => setWantsToJoinChurch(v === 'Yes')}
          name="visitor-join"
        />
      </CkcField>

      <label className="flex items-start gap-2 text-xs text-cloud/60">
        <input
          type="checkbox"
          checked={eventNewsConsent}
          onChange={(e) => setEventNewsConsent(e.target.checked)}
          className="mt-0.5"
        />
        <span>I would like to receive news about upcoming church events.</span>
      </label>

      {error && <p className="text-sm text-rose-400">{error}</p>}

      <CkcButton type="submit" disabled={loading}>
        {loading ? 'Saving…' : 'Continue to event registration'}
      </CkcButton>
    </form>
  );
}
