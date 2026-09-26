export type RoomBand = {
  minAge: number;
  maxAge: number;
  room: string;
};

export type RoomMap = RoomBand[];

/** Default kids rooms. getRoomMap() is the only place this is sourced. */
export const DEFAULT_ROOM_MAP: RoomMap = [
  { minAge: 0, maxAge: 2, room: 'Nursery' },
  { minAge: 3, maxAge: 5, room: 'Preschool' },
  { minAge: 6, maxAge: 8, room: 'Kids' },
  { minAge: 9, maxAge: 12, room: 'Tweens' },
];

/** Later: load a per-church map. Today: always the default. */
export function getRoomMap(_churchId?: string): RoomMap {
  return DEFAULT_ROOM_MAP;
}

export function roomForChildAge(age: number, roomMap: RoomMap = DEFAULT_ROOM_MAP): string | null {
  if (!Number.isFinite(age) || age < 0) return null;
  const band = roomMap.find((entry) => age >= entry.minAge && age <= entry.maxAge);
  return band?.room ?? null;
}
