/**
 * Screen backgrounds — the only place to swap a photo.
 *
 * 1. Save the new image in public/assets/backgrounds/
 * 2. Change that screen's line below to the new filename.
 *
 *   login: '/assets/backgrounds/login.jpg',
 *
 * Leave a screen as '' until it has a photo.
 * If you overwrite a file and keep the same name, hard-refresh the browser.
 */
export const SCREEN_BACKGROUNDS = {
  login: '',
  'login-verify': '',
  'forgot-password': '',
  'reset-password': '',
  'request-invite': '',
  invite: '',
  'signup-set-password': '',
  'signup-complete': '',
  'signup-success': '',
  'account-set-password': '',
  'account-change-password': '',

  'member-home': '',
  'member-sermons': '',
  'member-events': '',
  'member-event': '',
  'member-bible-study': '',
  'member-give': '',
  'member-prayer': '',
  'member-announcements': '',
  'member-church-info': '',

  dashboard: '',
  members: '',
  team: '',
  visitors: '',
  'follow-ups': '',
  events: '',
  event: '',
  'event-scan': '',
  sermons: '',
  'prayer-requests': '',
  ministries: '',
  groups: '',
  broadcast: '',
  'pastoral-care': '',
  announcements: '',
  reports: '',

  'my-groups': '',
  'my-group': '',
  rsvp: '',
} as const;

export type ScreenBackgroundId = keyof typeof SCREEN_BACKGROUNDS;

export function screenBackground(screen: ScreenBackgroundId): string | null {
  const src = SCREEN_BACKGROUNDS[screen];
  return src || null;
}
