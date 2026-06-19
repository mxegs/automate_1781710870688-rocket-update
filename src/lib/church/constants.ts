/** Shared church-wide constants — will move to Supabase lookup tables when backend is wired */

export const CAMPUSES = [
  { id: 'midrand', label: 'Midrand Campus' },
  { id: 'verulam', label: 'Verulam Campus' },
] as const;

export type CampusId = (typeof CAMPUSES)[number]['id'];

export function getCampusLabel(id: CampusId | string): string {
  return CAMPUSES.find((c) => c.id === id)?.label ?? id;
}

/** Filter members for messaging, rostering, group assignment */
export const AGE_CATEGORIES = [
  { id: 'child', label: 'Child' },
  { id: 'youth', label: 'Youth' },
  { id: 'adult', label: 'Adult' },
] as const;

export type AgeCategoryId = (typeof AGE_CATEGORIES)[number]['id'];

/** Follow-up pipeline stages (evangelism contacts — not members or event visitors) */
export const FOLLOWUP_STAGES = [
  { id: 'cold', label: 'Not Yet Responsive' },
  { id: 'engaging', label: 'Engaging' },
  { id: 'committed', label: 'Ready to Visit' },
] as const;

export type FollowUpStageId = (typeof FOLLOWUP_STAGES)[number]['id'];

/** Serving teams — rostering, event assignments */
export const MINISTRY_TYPES = [
  'Worship',
  'Ushers',
  "Children's Church",
  'Media',
  'Hospitality',
  'Security',
  'Protocol',
] as const;

/** Communication & community groups — messaging, announcements */
export const GROUP_TYPES = [
  'Women',
  'Men',
  'Youth',
  'Young Adults',
  'Couples',
  'Home Group',
  'Other',
] as const;
