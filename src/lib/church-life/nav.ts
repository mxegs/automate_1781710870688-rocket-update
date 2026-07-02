export interface ChurchLifeNavItem {
  label: string;
  href: string;
  icon: string;
}

export const memberLifeNav: ChurchLifeNavItem[] = [
  { label: 'Home', href: '/member', icon: 'HomeIcon' },
  { label: 'Sermons & Messages', href: '/member/sermons', icon: 'PlayCircleIcon' },
  { label: 'Events', href: '/member/events', icon: 'CalendarDaysIcon' },
  { label: 'Daily Word', href: '/member/bible-study', icon: 'BookOpenIcon' },
  { label: 'Give', href: '/member/give', icon: 'HeartIcon' },
  { label: 'Prayer', href: '/member/prayer', icon: 'HandRaisedIcon' },
  { label: 'Announcements', href: '/member/announcements', icon: 'MegaphoneIcon' },
  { label: 'Church Info', href: '/member/church-info', icon: 'BuildingLibraryIcon' },
];

export const visitorLifeNav: ChurchLifeNavItem[] = [
  { label: 'Home', href: '/visitor', icon: 'HomeIcon' },
  { label: 'Sermons', href: '/member/sermons', icon: 'PlayCircleIcon' },
  { label: 'Events', href: '/member/events', icon: 'CalendarDaysIcon' },
  { label: 'Daily Word', href: '/member/bible-study', icon: 'BookOpenIcon' },
  { label: 'Church Info', href: '/member/church-info', icon: 'BuildingLibraryIcon' },
];

export interface LifeHomeTile {
  label: string;
  accent?: string;
  href: string;
  icon: string;
  accentGold: boolean;
}

export const lifeHomeTiles: LifeHomeTile[] = [
  { label: 'Daily', accent: 'Word', href: '/member/bible-study', icon: 'BookOpenIcon', accentGold: true },
  { label: 'Events', href: '/member/events', icon: 'CalendarDaysIcon', accentGold: false },
  { label: 'Give', href: '/member/give', icon: 'HeartIcon', accentGold: true },
  { label: 'Prayer', href: '/member/prayer', icon: 'PlayCircleIcon', accentGold: false },
];

export const lifeSocialLinks = [
  { label: 'Facebook', href: 'https://facebook.com', icon: 'GlobeAltIcon' },
  { label: 'Instagram', href: 'https://instagram.com', icon: 'CameraIcon' },
  { label: 'YouTube', href: 'https://youtube.com', icon: 'PlayCircleIcon' },
  { label: 'TikTok', href: 'https://tiktok.com', icon: 'MusicalNoteIcon' },
] as const;
