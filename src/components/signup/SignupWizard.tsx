'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type SignatureCanvasLib from 'react-signature-canvas';
import { useRouter } from 'next/navigation';
import AuthShell from '@/components/auth/AuthShell';
import StepIndicator from '@/components/auth/StepIndicator';
import {
  CkcButton,
  CkcCard,
  CkcCheckboxGroup,
  CkcField,
  CkcInput,
  CkcRadioGroup,
  CkcTextarea,
} from '@/components/ui/CkcForm';
import {
  calcAgeFromDob,
  covenantStepSchema,
  emergencyStepSchema,
  guardianStepSchema,
  MAX_DEPENDANTS,
  ministryStepSchema,
  personalStepSchema,
  showSpouseSection,
  spiritualStepSchema,
} from '@/lib/membership/schema';
import { CAMPUSES, getCampusLabel } from '@/lib/church/constants';
import {
  COVENANT_TEXT,
  createEmptyApplication,
  DRAFT_STORAGE_KEY,
  MINISTRY_OPTIONS,
  OCCUPATION_OPTIONS,
  type MembershipApplication,
} from '@/lib/membership/types';
import { getInviteSession, clearInviteSession } from '@/lib/auth/session';

const SignaturePad = dynamic(() => import('@/components/signup/SignaturePad'), { ssr: false });

function migrateApplication(data: MembershipApplication): MembershipApplication {
  const personal = data.personal as MembershipApplication['personal'] & { churchMembership?: string };
  if (!personal.identityType) {
    personal.identityType =
      personal.identityNumber && /^\d{13}$/.test(personal.identityNumber) ? 'sa_id' : '';
  }
  if (!personal.countryOfOrigin) personal.countryOfOrigin = '';

  const spiritual = data.spiritual as MembershipApplication['spiritual'] & {
    baptismDateLocation?: string;
    previousChurchDateLocation?: string;
  };
  if (spiritual.baptismDateLocation && !spiritual.baptismLocation) {
    spiritual.baptismLocation = spiritual.baptismDateLocation;
  }
  if (spiritual.previousChurchDateLocation && !spiritual.previousChurchLocation) {
    spiritual.previousChurchLocation = spiritual.previousChurchDateLocation;
  }
  if (!spiritual.previousChurchName) spiritual.previousChurchName = '';

  return data;
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex gap-2 text-xs leading-relaxed">
      <span className="min-w-[7rem] shrink-0 text-ckc-dim">{label}</span>
      <span className="text-ckc-white">{value || '—'}</span>
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

export default function SignupWizard() {
  const router = useRouter();
  const sigRef = useRef<SignatureCanvasLib | null>(null);
  const covenantRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<MembershipApplication>(() => createEmptyApplication());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [covenantScrolled, setCovenantScrolled] = useState(false);
  const [showReview, setShowReview] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const invite = getInviteSession();
    if (!invite) {
      router.replace('/login');
      return;
    }
    const draft = localStorage.getItem(DRAFT_STORAGE_KEY);
    const base = createEmptyApplication(invite.phone);
    if (invite.officialName) {
      base.personal.fullName = invite.officialName;
    }
    if (invite.username) {
      base.personal.username = invite.username;
    }
    if (draft) {
      try {
        const parsed = migrateApplication(JSON.parse(draft) as MembershipApplication);
        setForm({
          ...parsed,
          personal: {
            ...parsed.personal,
            cellNo: invite.phone,
            fullName: parsed.personal.fullName || base.personal.fullName,
            username: parsed.personal.username || base.personal.username,
          },
        });
      } catch {
        setForm(base);
      }
    } else {
      setForm(base);
    }
  }, [router]);

  useEffect(() => {
    if (form.personal.dateOfBirth) {
      const age = calcAgeFromDob(form.personal.dateOfBirth);
      if (age !== form.personal.age) {
        setForm((f) => ({ ...f, personal: { ...f.personal, age } }));
      }
    }
  }, [form.personal.dateOfBirth, form.personal.age]);

  const saveDraft = (data: MembershipApplication) => {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
  };

  const updatePersonal = (patch: Partial<MembershipApplication['personal']>) => {
    setForm((f) => {
      const next = { ...f, personal: { ...f.personal, ...patch } };
      saveDraft(next);
      return next;
    });
  };

  const updateGuardian = (patch: Partial<MembershipApplication['guardian']>) => {
    setForm((f) => {
      const next = { ...f, guardian: { ...f.guardian, ...patch } };
      saveDraft(next);
      return next;
    });
  };

  const updateEmergency = (patch: Partial<MembershipApplication['emergencyContact']>) => {
    setForm((f) => {
      const next = { ...f, emergencyContact: { ...f.emergencyContact, ...patch } };
      saveDraft(next);
      return next;
    });
  };

  const updateSpiritual = (patch: Partial<MembershipApplication['spiritual']>) => {
    setForm((f) => {
      const next = { ...f, spiritual: { ...f.spiritual, ...patch } };
      saveDraft(next);
      return next;
    });
  };

  const updateMinistry = (patch: Partial<MembershipApplication['ministry']>) => {
    setForm((f) => {
      const next = { ...f, ministry: { ...f.ministry, ...patch } };
      saveDraft(next);
      return next;
    });
  };

  const updateCovenant = (patch: Partial<MembershipApplication['covenant']>) => {
    setForm((f) => {
      const next = { ...f, covenant: { ...f.covenant, ...patch } };
      saveDraft(next);
      return next;
    });
  };

  const syncDependants = (count: number) => {
    const current = [...form.guardian.dependants];
    while (current.length < count) current.push({ name: '', age: '' });
    while (current.length > count) current.pop();
    updateGuardian({ numberOfDependants: count, dependants: current.slice(0, MAX_DEPENDANTS) });
  };

  const validateStep = (): boolean => {
    setErrors({});
    let result;

    switch (step) {
      case 1:
        result = personalStepSchema.safeParse(form.personal);
        break;
      case 2:
        result = guardianStepSchema.safeParse(form.guardian);
        break;
      case 3:
        result = emergencyStepSchema.safeParse(form.emergencyContact);
        break;
      case 4:
        result = spiritualStepSchema.safeParse(form.spiritual);
        break;
      case 5:
        result = ministryStepSchema.safeParse(form.ministry);
        break;
      case 6: {
        const sig = sigRef.current?.toDataURL() || form.covenant.signatureDataUrl;
        const payload = { ...form.covenant, signatureDataUrl: sig };
        result = covenantStepSchema.safeParse(payload);
        if (!covenantScrolled) {
          setErrors({ covenant: 'Please scroll through the entire covenant before signing.' });
          return false;
        }
        break;
      }
      default:
        return true;
    }

    if (result && !result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path.join('.');
        fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step === 6) {
      handleSubmit();
      return;
    }
    if (step === 5) setShowReview(true);
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = () => {
    setSubmitting(true);
    const sig = sigRef.current?.toDataURL() || form.covenant.signatureDataUrl;
    const payload = {
      ...form,
      submittedAt: new Date().toISOString(),
      covenant: { ...form.covenant, signatureDataUrl: sig },
    };
    localStorage.setItem('ckc_submitted_applications', JSON.stringify([
      ...JSON.parse(localStorage.getItem('ckc_submitted_applications') || '[]'),
      payload,
    ]));
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    clearInviteSession();
    setTimeout(() => router.push('/signup/success'), 800);
  };

  const handleIdPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updatePersonal({ idPhotoDataUrl: reader.result as string });
    reader.readAsDataURL(file);
  };

  const spouseVisible = showSpouseSection(form.personal.maritalStatus);
  const depCount = typeof form.guardian.numberOfDependants === 'number' ? form.guardian.numberOfDependants : 0;

  return (
    <AuthShell subtitle="Membership registration" showLogo={step === 1}>
      <div className="w-full max-w-lg">
        <StepIndicator currentStep={step} />

        <CkcCard className="space-y-4">
          {/* Step 1 — Personal */}
          {step === 1 && (
            <>
              <CkcField label="Today's date" required error={errors.todayDate}>
                <CkcInput type="date" value={form.personal.todayDate} onChange={(e) => updatePersonal({ todayDate: e.target.value })} />
              </CkcField>
              <div className="grid grid-cols-2 gap-3">
                <CkcField label="Surname" required error={errors.surname}>
                  <CkcInput value={form.personal.surname} onChange={(e) => updatePersonal({ surname: e.target.value })} />
                </CkcField>
                <CkcField label="Full name (official)" required error={errors.fullName}>
                  <CkcInput value={form.personal.fullName} onChange={(e) => updatePersonal({ fullName: e.target.value })} placeholder="As on your ID" />
                </CkcField>
              </div>
              <CkcField label="Username" required error={errors.username}>
                <CkcInput
                  value={form.personal.username}
                  onChange={(e) => updatePersonal({ username: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                  placeholder="How we greet you e.g. thabo"
                />
              </CkcField>
              <p className="-mt-2 text-[11px] text-ckc-dim">Used in the app for greetings — not your phone number.</p>
              <CkcField label="Campus" required error={errors.campus}>
                <select
                  value={form.personal.campus}
                  onChange={(e) => updatePersonal({ campus: e.target.value as 'midrand' | 'verulam' })}
                  className="w-full rounded-lg border border-white/10 bg-ckc-elevated px-3 py-2.5 text-sm text-ckc-white focus:border-ckc-gold/50 focus:outline-none"
                >
                  <option value="">Select campus</option>
                  {CAMPUSES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </CkcField>

              <div className="space-y-3 rounded-lg border border-white/5 bg-ckc-elevated/40 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ckc-gold">Citizenship & identity</p>
                <CkcField label="Citizenship" required error={errors.citizenship}>
                  <CkcRadioGroup
                    options={['RSA', 'Other']}
                    value={form.personal.citizenship}
                    onChange={(v) =>
                      updatePersonal({
                        citizenship: v,
                        countryOfOrigin: v === 'RSA' ? '' : form.personal.countryOfOrigin,
                      })
                    }
                    name="citizenship"
                  />
                </CkcField>
                {form.personal.citizenship === 'Other' && (
                  <CkcField label="Country of origin" required error={errors.countryOfOrigin}>
                    <CkcInput
                      value={form.personal.countryOfOrigin}
                      onChange={(e) => updatePersonal({ countryOfOrigin: e.target.value })}
                      placeholder="e.g. Zimbabwe, Nigeria"
                    />
                  </CkcField>
                )}
                <CkcField label="Identity document" required error={errors.identityType}>
                  <CkcRadioGroup
                    options={['SA ID', 'Passport']}
                    value={
                      form.personal.identityType === 'sa_id'
                        ? 'SA ID'
                        : form.personal.identityType === 'passport'
                          ? 'Passport'
                          : ''
                    }
                    onChange={(v) =>
                      updatePersonal({
                        identityType: v === 'SA ID' ? 'sa_id' : 'passport',
                        identityNumber: '',
                      })
                    }
                    name="identityType"
                  />
                </CkcField>
                {form.personal.identityType && (
                  <CkcField
                    label={form.personal.identityType === 'sa_id' ? 'SA ID number' : 'Passport number'}
                    required
                    error={errors.identityNumber}
                  >
                    <CkcInput
                      value={form.personal.identityNumber}
                      onChange={(e) => {
                        const raw = e.target.value;
                        updatePersonal({
                          identityNumber:
                            form.personal.identityType === 'sa_id'
                              ? raw.replace(/\D/g, '').slice(0, 13)
                              : raw.toUpperCase(),
                        });
                      }}
                      placeholder={form.personal.identityType === 'sa_id' ? '13 digits' : 'Passport number'}
                    />
                  </CkcField>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <CkcField label="Date of birth" required error={errors.dateOfBirth}>
                  <CkcInput type="date" value={form.personal.dateOfBirth} onChange={(e) => updatePersonal({ dateOfBirth: e.target.value })} />
                </CkcField>
                <div>
                  <span className="mb-1.5 block text-xs font-medium text-ckc-muted">Age</span>
                  <div className="rounded-lg border border-white/10 bg-ckc-elevated px-3 py-2.5 text-sm text-ckc-white">
                    {form.personal.dateOfBirth && form.personal.age !== ''
                      ? `${form.personal.age} years`
                      : '—'}
                  </div>
                  <p className="mt-1 text-[10px] text-ckc-dim">Calculated from date of birth</p>
                </div>
              </div>

              <CkcField label="Permanent physical address" required error={errors.permanentAddress}>
                <CkcTextarea rows={3} value={form.personal.permanentAddress} onChange={(e) => updatePersonal({ permanentAddress: e.target.value })} />
              </CkcField>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <CkcField label="Cell number" required error={errors.cellNo}>
                  <CkcInput type="tel" value={form.personal.cellNo} readOnly className="opacity-60" />
                </CkcField>
                <CkcField label="Tel number" optional>
                  <CkcInput type="tel" value={form.personal.telNo} onChange={(e) => updatePersonal({ telNo: e.target.value })} />
                </CkcField>
              </div>
              <CkcField label="Email address" optional error={errors.email}>
                <CkcInput type="email" value={form.personal.email} onChange={(e) => updatePersonal({ email: e.target.value })} />
              </CkcField>

              <div className="grid grid-cols-2 gap-3">
                <CkcField label="Gender" required error={errors.gender}>
                  <CkcRadioGroup options={['Male', 'Female']} value={form.personal.gender} onChange={(v) => updatePersonal({ gender: v })} name="gender" />
                </CkcField>
                <CkcField label="Marital status" required error={errors.maritalStatus}>
                  <select
                    value={form.personal.maritalStatus}
                    onChange={(e) => updatePersonal({ maritalStatus: e.target.value as MembershipApplication['personal']['maritalStatus'] })}
                    className="w-full rounded-lg border border-white/10 bg-ckc-elevated px-3 py-2.5 text-sm text-ckc-white focus:border-ckc-gold/50 focus:outline-none"
                  >
                    <option value="">Select</option>
                    {['Never Married', 'Married', 'Divorced', 'Engaged', 'Widow or Widower'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </CkcField>
              </div>

              <CkcField label="Present occupation" required error={errors.occupation}>
                <CkcCheckboxGroup options={OCCUPATION_OPTIONS} values={form.personal.occupation} onChange={(v) => updatePersonal({ occupation: v })} />
              </CkcField>
              {form.personal.occupation.includes('Other') && (
                <CkcField label="Other occupation" required>
                  <CkcInput value={form.personal.occupationOther} onChange={(e) => updatePersonal({ occupationOther: e.target.value })} />
                </CkcField>
              )}
              <CkcField label="Employer" optional>
                <CkcInput value={form.personal.employer} onChange={(e) => updatePersonal({ employer: e.target.value })} />
              </CkcField>
              <CkcField label="ID photo" optional>
                <input type="file" accept="image/*" capture="environment" onChange={handleIdPhoto} className="text-xs text-ckc-muted" />
                {form.personal.idPhotoDataUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.personal.idPhotoDataUrl} alt="ID preview" className="mt-2 h-24 rounded-lg object-cover" />
                )}
              </CkcField>
            </>
          )}

          {/* Step 2 — Guardian / Spouse / Family */}
          {step === 2 && (
            <>
              {spouseVisible ? (
                <>
                  <p className="text-xs text-ckc-gold">Spouse / partner information</p>
                  <div className="grid grid-cols-3 gap-2">
                    <CkcField label="Title" optional><CkcInput value={form.guardian.title} onChange={(e) => updateGuardian({ title: e.target.value })} /></CkcField>
                    <CkcField label="Initial" optional><CkcInput value={form.guardian.initial} onChange={(e) => updateGuardian({ initial: e.target.value })} /></CkcField>
                    <CkcField label="Surname" optional><CkcInput value={form.guardian.surname} onChange={(e) => updateGuardian({ surname: e.target.value })} /></CkcField>
                  </div>
                  <CkcField label="Relationship" optional>
                    <CkcInput value={form.guardian.relationship} onChange={(e) => updateGuardian({ relationship: e.target.value })} placeholder="e.g. Wife, Husband" />
                  </CkcField>
                  <div className="grid grid-cols-2 gap-3">
                    <CkcField label="Tel (Home)" optional><CkcInput type="tel" value={form.guardian.telHome} onChange={(e) => updateGuardian({ telHome: e.target.value })} /></CkcField>
                    <CkcField label="Tel (Work)" optional><CkcInput type="tel" value={form.guardian.telWork} onChange={(e) => updateGuardian({ telWork: e.target.value })} /></CkcField>
                  </div>
                  <CkcField label="Street address" optional>
                    <CkcTextarea rows={2} value={form.guardian.streetAddress} onChange={(e) => updateGuardian({ streetAddress: e.target.value })} />
                  </CkcField>
                  <div className="grid grid-cols-2 gap-3">
                    <CkcField label="Occupation" optional><CkcInput value={form.guardian.occupation} onChange={(e) => updateGuardian({ occupation: e.target.value })} /></CkcField>
                    <CkcField label="Organisation" optional><CkcInput value={form.guardian.organisation} onChange={(e) => updateGuardian({ organisation: e.target.value })} /></CkcField>
                  </div>
                  <CkcField label="Does spouse/dependants intend to join CKC?" optional>
                    <CkcRadioGroup options={['Yes', 'No']} value={form.guardian.spouseJoining} onChange={(v) => updateGuardian({ spouseJoining: v })} name="spouseJoining" />
                  </CkcField>
                </>
              ) : (
                <p className="text-xs text-ckc-muted">Spouse section is shown when marital status is Married or Engaged.</p>
              )}

              <CkcField label={`Number of dependants (max ${MAX_DEPENDANTS})`} optional>
                <CkcInput
                  type="number"
                  min={0}
                  max={MAX_DEPENDANTS}
                  value={form.guardian.numberOfDependants.toString()}
                  onChange={(e) => syncDependants(Math.min(MAX_DEPENDANTS, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                />
              </CkcField>

              {depCount > 0 && (
                <div className="space-y-3">
                  <p className="text-xs text-ckc-gold">Dependants (linked to your account)</p>
                  {form.guardian.dependants.slice(0, depCount).map((dep, i) => (
                    <div key={i} className="rounded-lg border border-white/5 bg-ckc-elevated p-3">
                      <p className="mb-2 text-xs text-ckc-muted">Dependant {i + 1}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <CkcInput placeholder="Name" value={dep.name} onChange={(e) => {
                          const deps = [...form.guardian.dependants];
                          deps[i] = { ...deps[i], name: e.target.value };
                          updateGuardian({ dependants: deps });
                        }} />
                        <CkcInput type="number" placeholder="Age" value={dep.age.toString()} onChange={(e) => {
                          const deps = [...form.guardian.dependants];
                          deps[i] = { ...deps[i], age: parseInt(e.target.value, 10) || '' };
                          updateGuardian({ dependants: deps });
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Step 3 — Emergency */}
          {step === 3 && (
            <>
              <CkcField label="Name" optional><CkcInput value={form.emergencyContact.name} onChange={(e) => updateEmergency({ name: e.target.value })} /></CkcField>
              <CkcField label="Relationship" optional><CkcInput value={form.emergencyContact.relationship} onChange={(e) => updateEmergency({ relationship: e.target.value })} /></CkcField>
              <CkcField label="Phone number" optional><CkcInput type="tel" value={form.emergencyContact.phoneNumber} onChange={(e) => updateEmergency({ phoneNumber: e.target.value })} /></CkcField>
            </>
          )}

          {/* Step 4 — Spiritual */}
          {step === 4 && (
            <>
              <CkcField label="Have you accepted Jesus Christ as your Lord and Saviour?" required error={errors.acceptedChrist}>
                <CkcRadioGroup options={['Yes', 'No']} value={form.spiritual.acceptedChrist} onChange={(v) => updateSpiritual({ acceptedChrist: v })} name="acceptedChrist" />
              </CkcField>
              <CkcField label="Have you been baptized?" required error={errors.baptized}>
                <CkcRadioGroup options={['Yes', 'No']} value={form.spiritual.baptized} onChange={(v) => updateSpiritual({ baptized: v })} name="baptized" />
              </CkcField>
              {form.spiritual.baptized === 'Yes' && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <CkcField label="Baptism date" optional>
                    <CkcInput type="date" value={form.spiritual.baptismDate} onChange={(e) => updateSpiritual({ baptismDate: e.target.value })} />
                  </CkcField>
                  <CkcField label="Baptism location" optional>
                    <CkcInput value={form.spiritual.baptismLocation} onChange={(e) => updateSpiritual({ baptismLocation: e.target.value })} placeholder="Church or city" />
                  </CkcField>
                </div>
              )}
              <CkcField label="Previously a member of another church?" required error={errors.previousChurchMember}>
                <CkcRadioGroup options={['Yes', 'No']} value={form.spiritual.previousChurchMember} onChange={(v) => updateSpiritual({ previousChurchMember: v })} name="previousChurchMember" />
              </CkcField>
              {form.spiritual.previousChurchMember === 'Yes' && (
                <div className="space-y-3 rounded-lg border border-white/5 bg-ckc-elevated/40 p-3">
                  <CkcField label="Previous church name" required error={errors.previousChurchName}>
                    <CkcInput value={form.spiritual.previousChurchName} onChange={(e) => updateSpiritual({ previousChurchName: e.target.value })} />
                  </CkcField>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <CkcField label="Date attended" optional>
                      <CkcInput type="date" value={form.spiritual.previousChurchDate} onChange={(e) => updateSpiritual({ previousChurchDate: e.target.value })} />
                    </CkcField>
                    <CkcField label="Location" optional>
                      <CkcInput value={form.spiritual.previousChurchLocation} onChange={(e) => updateSpiritual({ previousChurchLocation: e.target.value })} placeholder="City or branch" />
                    </CkcField>
                  </div>
                  <CkcField label="Reason for leaving" optional>
                    <CkcTextarea rows={3} value={form.spiritual.reasonForLeaving} onChange={(e) => updateSpiritual({ reasonForLeaving: e.target.value })} />
                  </CkcField>
                </div>
              )}
            </>
          )}

          {/* Step 5 — Ministry */}
          {step === 5 && (
            <>
              <CkcField label="Areas where you'd like to serve" optional>
                <CkcCheckboxGroup options={MINISTRY_OPTIONS} values={form.ministry.areasOfInterest} onChange={(v) => updateMinistry({ areasOfInterest: v })} />
              </CkcField>
              <CkcField label="Spiritual gifts or talents" optional>
                <CkcTextarea rows={3} value={form.ministry.spiritualGifts} onChange={(e) => updateMinistry({ spiritualGifts: e.target.value })} placeholder="What spiritual gifts or talents do you believe God has given you?" />
              </CkcField>
              <CkcField label="Passions in ministry" optional>
                <CkcTextarea rows={3} value={form.ministry.ministryPassions} onChange={(e) => updateMinistry({ ministryPassions: e.target.value })} placeholder="What are your passions in ministry or serving?" />
              </CkcField>
            </>
          )}

          {/* Step 6 — Review & Covenant */}
          {step === 6 && (
            <>
              {showReview && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-ckc-white">Review your details</p>
                  <p className="text-xs text-ckc-muted">Check everything below. Use Back to edit any step.</p>
                  <div className="max-h-72 space-y-3 overflow-y-auto rounded-lg border border-white/5 bg-ckc-elevated p-3">
                    <ReviewBlock title="Personal">
                      <ReviewRow label="Name" value={`${form.personal.fullName} ${form.personal.surname}`} />
                      <ReviewRow label="Username" value={form.personal.username} />
                      <ReviewRow label="Campus" value={form.personal.campus ? getCampusLabel(form.personal.campus) : ''} />
                      <ReviewRow label="Cell" value={form.personal.cellNo} />
                      <ReviewRow label="Email" value={form.personal.email} />
                      <ReviewRow
                        label="Identity"
                        value={
                          form.personal.identityType === 'sa_id'
                            ? `SA ID · ${form.personal.identityNumber}`
                            : form.personal.identityType === 'passport'
                              ? `Passport · ${form.personal.identityNumber}`
                              : ''
                        }
                      />
                      <ReviewRow
                        label="Citizenship"
                        value={
                          form.personal.citizenship === 'Other'
                            ? `Other · ${form.personal.countryOfOrigin}`
                            : form.personal.citizenship
                        }
                      />
                      <ReviewRow
                        label="Date of birth"
                        value={
                          form.personal.dateOfBirth
                            ? `${form.personal.dateOfBirth}${form.personal.age !== '' ? ` (${form.personal.age} yrs)` : ''}`
                            : ''
                        }
                      />
                      <ReviewRow label="Gender" value={form.personal.gender} />
                      <ReviewRow label="Marital status" value={form.personal.maritalStatus} />
                      <ReviewRow label="Occupation" value={form.personal.occupation.join(', ')} />
                    </ReviewBlock>
                    <ReviewBlock title="Family">
                      <ReviewRow label="Dependants" value={depCount > 0 ? String(depCount) : 'None'} />
                      {depCount > 0 &&
                        form.guardian.dependants.slice(0, depCount).map((d, i) => (
                          <ReviewRow key={i} label={`Dependant ${i + 1}`} value={`${d.name}${d.age !== '' ? `, age ${d.age}` : ''}`} />
                        ))}
                    </ReviewBlock>
                    <ReviewBlock title="Emergency contact">
                      <ReviewRow label="Name" value={form.emergencyContact.name} />
                      <ReviewRow label="Relationship" value={form.emergencyContact.relationship} />
                      <ReviewRow label="Phone" value={form.emergencyContact.phoneNumber} />
                    </ReviewBlock>
                    <ReviewBlock title="Spiritual">
                      <ReviewRow label="Accepted Christ" value={form.spiritual.acceptedChrist} />
                      <ReviewRow label="Baptized" value={form.spiritual.baptized} />
                      {form.spiritual.baptized === 'Yes' && (
                        <ReviewRow
                          label="Baptism"
                          value={[form.spiritual.baptismDate, form.spiritual.baptismLocation].filter(Boolean).join(' · ')}
                        />
                      )}
                      <ReviewRow label="Previous church" value={form.spiritual.previousChurchMember} />
                      {form.spiritual.previousChurchMember === 'Yes' && (
                        <>
                          <ReviewRow label="Church name" value={form.spiritual.previousChurchName} />
                          <ReviewRow
                            label="Attended"
                            value={[form.spiritual.previousChurchDate, form.spiritual.previousChurchLocation].filter(Boolean).join(' · ')}
                          />
                        </>
                      )}
                    </ReviewBlock>
                    <ReviewBlock title="Ministry interests">
                      <ReviewRow label="Areas" value={form.ministry.areasOfInterest.join(', ')} />
                      <ReviewRow label="Gifts" value={form.ministry.spiritualGifts} />
                      <ReviewRow label="Passions" value={form.ministry.ministryPassions} />
                    </ReviewBlock>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowReview(false)}
                    className="w-full rounded-lg border border-ckc-gold/30 bg-ckc-gold/10 py-2.5 text-sm font-semibold text-ckc-gold hover:bg-ckc-gold/20"
                  >
                    Looks good — continue to covenant
                  </button>
                </div>
              )}

              {!showReview && (
                <>
                  <div
                    ref={covenantRef}
                    onScroll={(e) => {
                      const el = e.currentTarget;
                      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) setCovenantScrolled(true);
                    }}
                    className="max-h-52 overflow-y-auto rounded-lg border border-white/5 bg-ckc-elevated p-4 text-xs leading-relaxed text-ckc-muted space-y-4"
                  >
                    <p className="font-semibold text-ckc-white">Membership Covenant</p>
                    <div>
                      <p className="mb-2 font-medium text-ckc-gold">I will seek to be conformed to the image of Christ:</p>
                      {COVENANT_TEXT.conformity.map((item, i) => (
                        <p key={i} className="mb-2">• {item.text} <em className="text-ckc-dim">({item.ref})</em></p>
                      ))}
                    </div>
                    <div>
                      <p className="mb-2 font-medium text-ckc-gold">I will support the ministry:</p>
                      {COVENANT_TEXT.support.map((item, i) => (
                        <p key={i} className="mb-2">• {item.text} <em className="text-ckc-dim">({item.ref})</em></p>
                      ))}
                    </div>
                    <div>
                      <p className="mb-2 font-medium text-ckc-gold">I will maintain unity:</p>
                      {COVENANT_TEXT.unity.map((item, i) => (
                        <p key={i} className="mb-2">• {item.text} <em className="text-ckc-dim">({item.ref})</em></p>
                      ))}
                    </div>
                  </div>

                  {!covenantScrolled && (
                    <p className="text-xs text-amber-400">Scroll through the entire covenant to continue.</p>
                  )}

                  <label className="flex items-start gap-2 text-xs text-ckc-muted">
                    <input
                      type="checkbox"
                      checked={form.covenant.agreedToCovenant}
                      disabled={!covenantScrolled}
                      onChange={(e) => updateCovenant({ agreedToCovenant: e.target.checked })}
                      className="mt-0.5 accent-ckc-gold"
                    />
                    I have read and agree to the membership covenant
                  </label>
                  {errors.agreedToCovenant && <p className="text-xs text-red-400">{errors.agreedToCovenant}</p>}
                  {errors.covenant && <p className="text-xs text-red-400">{errors.covenant}</p>}

                  <CkcField label="Full name (digital signature)" required error={errors.fullName}>
                    <CkcInput value={form.covenant.fullName} onChange={(e) => updateCovenant({ fullName: e.target.value })} disabled={!form.covenant.agreedToCovenant} />
                  </CkcField>
                  <CkcField label="Date signed" required>
                    <CkcInput type="date" value={form.covenant.dateSigned} onChange={(e) => updateCovenant({ dateSigned: e.target.value })} />
                  </CkcField>
                  <CkcField label="Signature" required error={errors.signatureDataUrl}>
                    <div className={`rounded-lg border bg-white ${form.covenant.agreedToCovenant ? 'border-ckc-gold/30' : 'border-white/10 opacity-50 pointer-events-none'}`}>
                      <SignaturePad
                        ref={sigRef}
                        canvasProps={{ className: 'w-full h-32 rounded-lg' }}
                        onEnd={() => updateCovenant({ signatureDataUrl: sigRef.current?.toDataURL() || '' })}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => { sigRef.current?.clear(); updateCovenant({ signatureDataUrl: '' }); }}
                      className="mt-1 text-xs text-ckc-muted hover:text-ckc-gold"
                    >
                      Clear signature
                    </button>
                  </CkcField>
                </>
              )}
            </>
          )}

          {errors._form && <p className="text-xs text-red-400">{errors._form}</p>}

          <div className="flex gap-3 pt-2">
            {step > 1 && (
              <CkcButton type="button" variant="ghost" onClick={() => setStep((s) => s - 1)} className="flex-1">
                Back
              </CkcButton>
            )}
            <CkcButton
              type="button"
              onClick={handleNext}
              disabled={submitting || (step === 6 && showReview)}
              className="flex-1"
            >
              {submitting ? 'Submitting…' : step === 6 ? (showReview ? 'Review above first' : 'Submit Application') : 'Next'}
            </CkcButton>
          </div>
        </CkcCard>
      </div>
    </AuthShell>
  );
}
