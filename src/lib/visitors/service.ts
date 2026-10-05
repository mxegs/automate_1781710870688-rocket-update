import { apiFetch, useBackend } from '@/lib/api/client';
import { withChurchId } from '@/lib/church/tenant';

export interface VisitorRow {
  id: string;
  name: string;
  surname: string | null;
  email: string | null;
  phone: string | null;
  campus_id: string | null;
  church_id: string;
  source: string | null;
  notes: string | null;
  first_visit_at: string;
  created_at: string;
  gender: string | null;
  marital_status: string | null;
  accepted_jesus: boolean | null;
  wants_to_join_church: boolean | null;
  event_news_consent: boolean | null;
}

export async function getVisitors(churchId?: string): Promise<VisitorRow[]> {
  if (!useBackend()) return [];
  const params = withChurchId(new URLSearchParams(), churchId);
  return apiFetch<VisitorRow[]>(`/api/visitors?${params}`);
}

export async function createVisitor(
  input: {
    name: string;
    phone?: string;
    email?: string;
    source?: string;
    notes?: string;
    firstVisitAt?: string;
    campusId?: string;
  },
  churchId?: string,
): Promise<VisitorRow> {
  const params = withChurchId(new URLSearchParams(), churchId);
  return apiFetch<VisitorRow>(`/api/visitors?${params}`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function visitorSourceLabel(source: string | null | undefined): string {
  const raw = (source ?? '').trim();
  if (!raw) return 'Unknown';
  return raw.replace(/_/g, ' ');
}

export function visitorNotesText(notes: string | null | undefined): string {
  if (!notes?.trim()) return '';
  try {
    const parsed = JSON.parse(notes) as Record<string, unknown>;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const bits: string[] = [];
      if (typeof parsed.acceptedJesus === 'boolean') {
        bits.push(parsed.acceptedJesus ? 'Accepted Jesus' : 'Has not accepted Jesus');
      }
      if (typeof parsed.wantsToJoinChurch === 'boolean') {
        bits.push(parsed.wantsToJoinChurch ? 'Wants to join' : 'Not joining yet');
      }
      return bits.join(' · ');
    }
  } catch {
    /* plain notes */
  }
  return notes;
}

export function formatVisitDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}
