export interface Dependant {
  name: string;
  surname: string;
  age: number | '';
  /** System-wide child serial, e.g. CKC-0001 */
  familySerial?: string;
}

export interface MembershipApplication {
  submittedAt?: string;
  personal: {
    todayDate: string;
    surname: string;
    fullName: string;
    username: string;
    campus: 'midrand' | 'verulam' | '';
    identityType: 'sa_id' | 'passport' | '';
    identityNumber: string;
    dateOfBirth: string;
    age: number | '';
    permanentAddress: string;
    email: string;
    cellNo: string;
    telNo: string;
    gender: 'Male' | 'Female' | '';
    citizenship: 'RSA' | 'Other' | '';
    countryOfOrigin: string;
    maritalStatus: '' | 'Never Married' | 'Married' | 'Divorced' | 'Engaged' | 'Widow or Widower';
    occupation: string[];
    occupationOther: string;
    employer: string;
    contactName: string;
    contactTel: string;
    idPhotoDataUrl: string;
  };
  guardian: {
    title: string;
    fullName: string;
    surname: string;
    identityNumber: string;
    familyGroupId: string;
    relationship: string;
    telHome: string;
    telWork: string;
    streetAddress: string;
    occupation: string;
    organisation: string;
    spouseJoining: '' | 'Yes' | 'No';
    numberOfDependants: number | '';
    dependants: Dependant[];
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  spiritual: {
    acceptedChrist: '' | 'Yes' | 'No';
    baptized: '' | 'Yes' | 'No';
    baptismDate: string;
    baptismLocation: string;
    previousChurchMember: '' | 'Yes' | 'No';
    previousChurchName: string;
    previousChurchDate: string;
    previousChurchLocation: string;
    reasonForLeaving: string;
  };
  ministry: {
    areasOfInterest: string[];
    spiritualGifts: string;
    ministryPassions: string;
  };
  covenant: {
    agreedToCovenant: boolean;
    fullName: string;
    dateSigned: string;
    signatureDataUrl: string;
  };
}

export const OCCUPATION_OPTIONS = [
  'Scholar',
  'Government Sector',
  'University Student',
  'Business',
  'Technikon Student',
  'Private Sector',
  'Other',
] as const;

export const MINISTRY_OPTIONS = [
  "Worship Team",
  "Children's Ministry",
  'Youth Ministry',
  'Hospitality',
  'Outreach / Evangelism',
  'Media / Technology',
  'Prayer Team',
  'Other',
] as const;

export const COVENANT_TEXT = {
  conformity: [
    { text: 'Attending weekly worship faithfully', ref: 'Hebrews 10:23-25' },
    {
      text: 'Committing to grow in a lifestyle that manifests itself in a passionate commitment to Christ, biblical alignment, personal holiness, generous living, racial reconciliation, and social responsibility',
      ref: 'II Peter 3:17-18; Ephesians 4:14-16',
    },
    {
      text: 'Engaging in spiritual relationships that bring mutual support and accountability',
      ref: 'Romans 14:19; Ephesians 5:21',
    },
    {
      text: 'Taking the time to serve others with my spiritual gifts',
      ref: 'Romans 12:4-21; Galatians 5:13-14',
    },
  ],
  support: [
    {
      text: 'Participating cheerfully and regularly in the financial support of the ministry and obligations of the church',
      ref: 'II Corinthians 9:6-7',
    },
    { text: 'Supporting others fervently in Christian love', ref: 'I Peter 4:8' },
    { text: "Upholding others in prayer and bearing one another's burdens", ref: 'Galatians 6:2' },
    { text: 'Developing relationships with and inviting the unchurched to attend', ref: 'Colossians 4:5-6' },
  ],
  unity: [
    { text: 'Acting in love toward other members', ref: 'I Peter 1:22' },
    { text: 'Seeking open and honest communication when I have concerns', ref: 'Ephesians 4:15' },
    { text: 'Dealing biblically with conflict and refusing to gossip', ref: 'Matthew 18:15-20' },
    {
      text: 'Following the leadership of the church and submitting to the principles of church restoration',
      ref: 'Hebrews 13:17; Matthew 18:15-20',
    },
  ],
};

export function createEmptyApplication(cellNo = ''): MembershipApplication {
  const today = new Date().toISOString().split('T')[0];
  return {
    personal: {
      todayDate: today,
      surname: '',
      fullName: '',
      username: '',
      campus: '',
      identityType: '',
      identityNumber: '',
      dateOfBirth: '',
      age: '',
      permanentAddress: '',
      email: '',
      cellNo,
      telNo: '',
      gender: '',
      citizenship: '',
      countryOfOrigin: '',
      maritalStatus: '',
      occupation: [],
      occupationOther: '',
      employer: '',
      contactName: '',
      contactTel: '',
      idPhotoDataUrl: '',
    },
    guardian: {
      title: '',
      fullName: '',
      surname: '',
      identityNumber: '',
      familyGroupId: '',
      relationship: '',
      telHome: '',
      telWork: '',
      streetAddress: '',
      occupation: '',
      organisation: '',
      spouseJoining: '',
      numberOfDependants: '',
      dependants: [],
    },
    emergencyContact: { name: '', relationship: '', phoneNumber: '' },
    spiritual: {
      acceptedChrist: '',
      baptized: '',
      baptismDate: '',
      baptismLocation: '',
      previousChurchMember: '',
      previousChurchName: '',
      previousChurchDate: '',
      previousChurchLocation: '',
      reasonForLeaving: '',
    },
    ministry: { areasOfInterest: [], spiritualGifts: '', ministryPassions: '' },
    covenant: { agreedToCovenant: false, fullName: '', dateSigned: today, signatureDataUrl: '' },
  };
}

export const DRAFT_STORAGE_KEY = 'ckc_membership_draft';
