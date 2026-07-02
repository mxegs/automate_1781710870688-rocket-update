/** Split event title — first word gold, remainder white (mockup list style). */
export function splitEventTitle(title: string): { lead: string; rest: string } {
  const trimmed = title.trim();
  const space = trimmed.indexOf(' ');
  if (space === -1) return { lead: trimmed, rest: '' };
  return { lead: trimmed.slice(0, space), rest: trimmed.slice(space + 1) };
}
