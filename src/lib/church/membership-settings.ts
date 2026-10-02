export interface MembershipSettings {
  churchId: string;
  membershipDurationDays: number;
  renewalReminderDays: number;
  renewalFinalDays: number;
  autoApproveRenewals: boolean;
  gracePeriodDays: number;
  streamUrl: string | null;
}

export function isNoExpiry(durationDays: number): boolean {
  return durationDays === 0;
}
