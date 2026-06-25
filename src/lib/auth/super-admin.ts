/** Super admin email sign-in only — not used for church broadcasts (see broadcast/audience.ts). */

export const SUPER_ADMIN_PLACEHOLDER_PHONE = 'admin000001';

export function getSuperAdminEmail(): string {
  return (
    process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase() ||
    process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL?.trim().toLowerCase() ||
    'aiwealthlogic@gmail.com'
  );
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isSuperAdminEmail(email: string): boolean {
  return normalizeEmail(email) === getSuperAdminEmail();
}

/** Internal DB phones — never send live SMS to these */
export function isInternalPlaceholderPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return true;
  if (/^(admin|staff)0+/.test(phone)) return true;
  if (digits.startsWith('000')) return true;
  return false;
}

/** Hide platform owner from member directories, broadcasts, and birthday lists. */
export function shouldHideFromMemberDirectory(opts: {
  email?: string | null;
  phone?: string | null;
}): boolean {
  if (opts.email && isSuperAdminEmail(opts.email)) return true;
  const digits = (opts.phone ?? '').replace(/\D/g, '');
  if (digits && digits === SUPER_ADMIN_PLACEHOLDER_PHONE.replace(/\D/g, '')) return true;
  if ((opts.phone ?? '').trim() === SUPER_ADMIN_PLACEHOLDER_PHONE) return true;
  return false;
}
