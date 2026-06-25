import { z } from 'zod';

const saIdRegex = /^\d{13}$/;
const phoneRegex = /^[\d\s+\-()]{9,15}$/;

export const MAX_DEPENDANTS = 6;

export const personalStepSchema = z
  .object({
    todayDate: z.string().min(1, 'Date is required'),
    surname: z.string().min(1, 'Surname is required'),
    fullName: z.string().min(1, 'Full name is required'),
    campus: z.enum(['midrand', 'verulam'], { message: 'Campus is required' }),
    username: z
      .string()
      .min(2, 'Username must be at least 2 characters')
      .max(30, 'Username too long')
      .regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers and underscores only'),
    identityType: z.enum(['sa_id', 'passport'], { message: 'Select ID or passport' }),
    identityNumber: z.string().min(1, 'Identity number is required'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    age: z.union([z.number().min(0).max(120), z.literal('')]).optional(),
    permanentAddress: z.string().min(1, 'Address is required'),
    email: z.string().email('Valid email required'),
    cellNo: z.string().regex(phoneRegex, 'Valid cell number required'),
    telNo: z.string().optional(),
    gender: z.enum(['Male', 'Female'], { message: 'Gender is required' }),
    citizenship: z.enum(['RSA', 'Other'], { message: 'Citizenship is required' }),
    countryOfOrigin: z.string().optional(),
    maritalStatus: z.enum(
      ['Never Married', 'Married', 'Divorced', 'Engaged', 'Widow or Widower'],
      { message: 'Marital status is required' },
    ),
    occupation: z.array(z.string()).min(1, 'Select at least one occupation'),
    occupationOther: z.string().optional(),
    employer: z.string().optional(),
    contactName: z.string().optional(),
    contactTel: z.string().optional(),
    idPhotoDataUrl: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.citizenship === 'Other' && !data.countryOfOrigin?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Country of origin is required',
        path: ['countryOfOrigin'],
      });
    }
    if (data.identityType === 'sa_id' && !saIdRegex.test(data.identityNumber)) {
      ctx.addIssue({
        code: 'custom',
        message: 'SA ID must be 13 digits',
        path: ['identityNumber'],
      });
    }
    if (data.identityType === 'passport' && data.identityNumber.trim().length < 5) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a valid passport number',
        path: ['identityNumber'],
      });
    }
  });

export const guardianStepSchema = z
  .object({
    title: z.string().optional(),
    fullName: z.string().optional(),
    surname: z.string().optional(),
    identityNumber: z.string().optional(),
    familyGroupId: z.string().optional(),
    relationship: z.string().optional(),
    telHome: z.string().optional(),
    telWork: z.string().optional(),
    streetAddress: z.string().optional(),
    occupation: z.string().optional(),
    organisation: z.string().optional(),
    spouseJoining: z.enum(['Yes', 'No', '']).optional(),
    numberOfDependants: z.union([z.number().min(0).max(MAX_DEPENDANTS), z.literal('')]).optional(),
    dependants: z.array(
      z.object({
        name: z.string(),
        surname: z.string(),
        age: z.union([z.number().min(0).max(120), z.literal('')]),
        familySerial: z.string().optional(),
      }),
    ),
    _maritalStatus: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const showSpouse = showSpouseSection(data._maritalStatus ?? '');
    if (showSpouse) {
      if (!data.fullName?.trim()) {
        ctx.addIssue({ code: 'custom', message: 'Spouse full name is required', path: ['fullName'] });
      }
      if (!data.surname?.trim()) {
        ctx.addIssue({ code: 'custom', message: 'Spouse surname is required', path: ['surname'] });
      }
      if (!data.identityNumber?.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: "Spouse ID / passport number is required to link your family",
          path: ['identityNumber'],
        });
      }
    }

    const depCount = typeof data.numberOfDependants === 'number' ? data.numberOfDependants : 0;
    for (let i = 0; i < depCount; i++) {
      const dep = data.dependants[i];
      if (!dep?.name?.trim()) {
        ctx.addIssue({ code: 'custom', message: 'Dependant name is required', path: ['dependants', i, 'name'] });
      }
      if (!dep?.surname?.trim()) {
        ctx.addIssue({ code: 'custom', message: 'Dependant surname is required', path: ['dependants', i, 'surname'] });
      }
      if (dep?.age === '' || dep?.age === undefined) {
        ctx.addIssue({ code: 'custom', message: 'Dependant age is required', path: ['dependants', i, 'age'] });
      }
    }
  });

export const emergencyStepSchema = z.object({
  name: z.string().optional(),
  relationship: z.string().optional(),
  phoneNumber: z.string().optional(),
});

export const spiritualStepSchema = z
  .object({
    acceptedChrist: z.enum(['Yes', 'No'], { message: 'Required' }),
    baptized: z.enum(['Yes', 'No'], { message: 'Required' }),
    baptismDate: z.string().optional(),
    baptismLocation: z.string().optional(),
    previousChurchMember: z.enum(['Yes', 'No'], { message: 'Required' }),
    previousChurchName: z.string().optional(),
    previousChurchDate: z.string().optional(),
    previousChurchLocation: z.string().optional(),
    reasonForLeaving: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.previousChurchMember === 'Yes' && !data.previousChurchName?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Previous church name is required',
        path: ['previousChurchName'],
      });
    }
  });

export const ministryStepSchema = z.object({
  areasOfInterest: z.array(z.string()).optional(),
  spiritualGifts: z.string().optional(),
  ministryPassions: z.string().optional(),
});

export const covenantStepSchema = z.object({
  agreedToCovenant: z.literal(true, { message: 'You must agree to the covenant' }),
  fullName: z.string().min(1, 'Full name is required'),
  dateSigned: z.string().min(1, 'Date is required'),
  signatureDataUrl: z.string().min(1, 'Signature is required'),
});

export function calcAgeFromDob(dob: string): number | '' {
  if (!dob) return '';
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : '';
}

export function showSpouseSection(maritalStatus: string): boolean {
  return maritalStatus === 'Married' || maritalStatus === 'Engaged';
}
