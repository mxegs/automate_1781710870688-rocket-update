import type { SupabaseClient } from '@supabase/supabase-js';
import { lookupSpouseFamilyByIdNumber } from '@/lib/membership/family';
import type {
  Dependant as ApplicationDependant,
  MembershipApplication,
} from '@/lib/membership/types';

/** Normalized child for check-in. Form JSON uses `age: number | ''` in types.ts. */
export type Dependant = {
  name: string;
  surname: string;
  age: number | null;
  familySerial?: string;
};

function parseAge(age: ApplicationDependant['age'] | string | null | undefined): number | null {
  if (typeof age === 'number' && Number.isFinite(age)) return age;
  if (typeof age === 'string' && age.trim() !== '') {
    const parsed = Number(age);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function fromList(deps: ApplicationDependant[] | undefined): Dependant[] {
  const result: Dependant[] = [];
  for (const dep of deps ?? []) {
    const name = dep.name?.trim() ?? '';
    if (!name) continue;
    const age = parseAge(dep.age);
    if (age === null) continue;
    result.push({
      name,
      surname: dep.surname?.trim() ?? '',
      age,
      familySerial: dep.familySerial,
    });
  }
  return result;
}

export async function dependantsForMember(
  db: SupabaseClient,
  memberId: string,
  churchId: string,
): Promise<Dependant[]> {
  const { data: member } = await db
    .from('members')
    .select('id, application_id')
    .eq('id', memberId)
    .eq('church_id', churchId)
    .maybeSingle();

  if (!member) return [];
  if (!member.application_id) return [];

  const { data: appRow } = await db
    .from('membership_applications')
    .select('application_data')
    .eq('id', member.application_id)
    .eq('church_id', churchId)
    .maybeSingle();

  const app = appRow?.application_data as MembershipApplication | undefined;
  const own = fromList(app?.guardian?.dependants);
  if (own.length) return own;

  const spouseId =
    app?.guardian?.identityNumber?.trim() || app?.personal?.identityNumber?.trim() || '';
  if (!spouseId) return [];

  const spouse = await lookupSpouseFamilyByIdNumber(spouseId, churchId);
  if (!spouse.found) return [];
  return fromList(spouse.dependants);
}
