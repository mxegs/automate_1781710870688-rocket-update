import type { Dependant, MembershipApplication } from './types';

/** Suggest a default username from first name + surname. */
export function suggestUsername(fullName: string, surname: string): string {
  const first = fullName.trim().split(/\s+/)[0] ?? '';
  const last = surname.trim().replace(/\s+/g, '');
  if (!first) return '';
  const base = `${first}_${last}`.toLowerCase().replace(/[^a-z0-9_]/g, '');
  return base.slice(0, 30);
}

/** Format dependant family serial e.g. CKC-0001 */
export function formatDependantSerial(n: number): string {
  return `CKC-${String(n).padStart(4, '0')}`;
}

/** Migrate older draft JSON to current field names. */
export function migrateApplication(data: MembershipApplication): MembershipApplication {
  const personal = data.personal as MembershipApplication['personal'] & { churchMembership?: string };
  if (!personal.identityType) {
    personal.identityType =
      personal.identityNumber && /^\d{13}$/.test(personal.identityNumber) ? 'sa_id' : '';
  }
  if (!personal.countryOfOrigin) personal.countryOfOrigin = '';

  const guardian = data.guardian as MembershipApplication['guardian'] & { initial?: string };
  if (!guardian.fullName && guardian.initial) {
    guardian.fullName = guardian.initial;
  }
  if (!guardian.identityNumber) guardian.identityNumber = '';
  if (!guardian.familyGroupId) guardian.familyGroupId = '';

  if (guardian.dependants) {
    guardian.dependants = guardian.dependants.map((dep) => ({
      name: dep.name ?? '',
      surname: (dep as Dependant).surname ?? '',
      age: dep.age ?? '',
      familySerial: (dep as Dependant).familySerial ?? '',
    }));
  }

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
