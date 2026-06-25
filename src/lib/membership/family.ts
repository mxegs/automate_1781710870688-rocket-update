import type { MembershipApplication } from '@/lib/membership/types';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

function normalizeId(value: string): string {
  return value.replace(/\s+/g, '').toLowerCase();
}

export async function findMaxDependantSerial(): Promise<number> {
  const db = getSupabaseAdmin();
  if (!db) return 0;

  const { data } = await db.from('membership_applications').select('application_data');
  let max = 0;

  for (const row of data ?? []) {
    const app = row.application_data as MembershipApplication;
    const deps = app?.guardian?.dependants ?? [];
    for (const dep of deps) {
      const serial = dep.familySerial ?? '';
      const match = serial.match(/(\d+)/);
      if (match) {
        const n = parseInt(match[1], 10);
        if (n > max) max = n;
      }
    }
  }

  return max;
}

export async function assignDependantSerials(
  applicationData: MembershipApplication,
): Promise<MembershipApplication> {
  const deps = applicationData.guardian.dependants ?? [];
  const needsSerial = deps.filter((d) => !d.familySerial);
  if (needsSerial.length === 0) return applicationData;

  let next = await findMaxDependantSerial();
  const updated = deps.map((dep) => {
    if (dep.familySerial) return dep;
    next += 1;
    return { ...dep, familySerial: `CKC-${String(next).padStart(4, '0')}` };
  });

  return {
    ...applicationData,
    guardian: { ...applicationData.guardian, dependants: updated },
  };
}

export async function lookupSpouseFamilyByIdNumber(idNumber: string): Promise<{
  found: boolean;
  spouseName?: string;
  dependants?: MembershipApplication['guardian']['dependants'];
  familyGroupId?: string;
}> {
  const db = getSupabaseAdmin();
  if (!db || !idNumber.trim()) return { found: false };

  const needle = normalizeId(idNumber);
  const { data } = await db
    .from('membership_applications')
    .select('application_data, status')
    .in('status', ['submitted', 'approved']);

  for (const row of data ?? []) {
    const app = row.application_data as MembershipApplication;
    const personalId = normalizeId(app?.personal?.identityNumber ?? '');
    if (personalId && personalId === needle) {
      return {
        found: true,
        spouseName: `${app.personal.fullName} ${app.personal.surname}`.trim(),
        dependants: app.guardian?.dependants ?? [],
        familyGroupId: app.guardian?.familyGroupId || personalId,
      };
    }
  }

  return { found: false };
}
