import { screenBackground, type ScreenBackgroundId } from '@/lib/screen-backgrounds';

/**
 * Full-bleed photo for a screen. The parent must be `relative`.
 * Swap the file in src/lib/screen-backgrounds.ts — do not hard-code paths here.
 */
export default function ScreenBackground({
  screen,
  className = '',
  dim = 0,
}: {
  screen: ScreenBackgroundId;
  className?: string;
  /** 0–1 dark layer so text stays readable on busy photos. */
  dim?: number;
}) {
  const src = screenBackground(screen);
  if (!src) return null;

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-full w-full object-cover" />
      {dim > 0 ? <div className="absolute inset-0 bg-black" style={{ opacity: dim }} /> : null}
    </div>
  );
}
