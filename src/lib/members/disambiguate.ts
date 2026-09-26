import { getCampusLabel } from '@/lib/church/constants';

export function phoneLast4(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '';
  return `····${digits.slice(-4)}`;
}

/** Staff lists: campus, age, last 4 of phone (at least two when available). */
export function staffDisambiguators(input: {
  campusId?: string | null;
  age?: number | null;
  phone?: string | null;
}): string {
  const parts: string[] = [];
  if (input.campusId) parts.push(getCampusLabel(input.campusId));
  if (typeof input.age === 'number' && Number.isFinite(input.age)) parts.push(String(input.age));
  const last4 = input.phone ? phoneLast4(input.phone) : '';
  if (last4) parts.push(last4);
  return parts.join(' · ');
}
