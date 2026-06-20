-- Allow suspending members (no login, broadcasts, or group filters until reactivated).

alter type public.member_status add value if not exists 'suspended';
