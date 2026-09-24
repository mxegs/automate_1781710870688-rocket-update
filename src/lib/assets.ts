export const BRAND = {
  name: 'Christ Kingdom Citizens',
  abbreviation: 'CKC',
  supportPhone: '073 550 2014',
  /** Circular CKC mark — white disc, black letters. Use on light screens. */
  logo: '/assets/brand/logo-mark-on-dark.png',
  logoMark: '/assets/brand/logo-mark-on-dark.png',
  /** Circular mark for dark screens. */
  logoMarkOnDark: '/assets/brand/logo-mark-on-dark.png',
  logoMarkDark: '/assets/brand/logo-mark-dark.png',
  /** Full lockup on transparent — black mark + CHRIST KINGDOM CITIZENS + Midrand. Use on white. */
  logoFullOnLight: '/assets/brand/logo-full-on-light.png',
  /** Full lockup with black background — use on dark screens only. */
  logoFullOnDark: '/assets/brand/logo-full-on-dark.png',
  logoFullDark: '/assets/brand/logo-full-dark.png',
} as const;

export const PLACEHOLDERS = {
  image: '/assets/images/no_image.png',
  avatar: '/assets/images/no_image.png',
} as const;

export const STEP_LABELS = [
  'Personal Information',
  'Guardian / Spouse / Family',
  'Emergency Contact',
  'Spiritual Information',
  'Ministry & Gifts',
  'Review & Covenant',
] as const;
