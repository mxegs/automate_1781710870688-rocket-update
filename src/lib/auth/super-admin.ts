/** Super admin email sign-in — server and client safe (email is not secret) */

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
