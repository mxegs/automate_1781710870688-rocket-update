'use client';

import React, { useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { getCampusSocial } from '@/lib/church/constants';
import { resolveMemberCampus } from '@/lib/member/campus';
import type { CampusId } from '@/lib/church/constants';

/**
 * Campus social links — not a live Instagram API feed yet.
 */
export default function SocialFeed() {
  const [campus, setCampus] = useState<CampusId>('midrand');

  useEffect(() => {
    resolveMemberCampus().then((c) => {
      if (c) setCampus(c);
    });
  }, []);

  const social = getCampusSocial(campus);

  return (
    <div className="rounded-2xl border border-[#E5E5E5] bg-neutral-50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ckc-black">
          <Icon name="PhotoIcon" size={15} variant="outline" className="text-ckc-gold" />
          Social Feed
        </h2>
        <span className="text-[10px] text-ckc-muted">{social.instagramLabel}</span>
      </div>

      <div className="mb-3 rounded-xl border border-ckc-gold/20 bg-ckc-gold/5 p-6 text-center">
        <Icon name="CameraIcon" size={32} variant="outline" className="mx-auto mb-3 text-ckc-gold" />
        <p className="text-sm leading-relaxed text-ckc-black/70">
          Follow us on Instagram for photos, reels &amp; updates from your campus.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <a
          href={social.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-ckc-gold/20 bg-ckc-gold/10 py-2.5 text-xs text-ckc-gold transition-all hover:bg-ckc-gold/20"
        >
          <Icon name="CameraIcon" size={12} variant="outline" />
          Instagram
        </a>
        <a
          href={social.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-ckc-gold/20 bg-ckc-gold/10 py-2.5 text-xs text-ckc-gold transition-all hover:bg-ckc-gold/20"
        >
          <Icon name="GlobeAltIcon" size={12} variant="outline" />
          Facebook
        </a>
      </div>
    </div>
  );
}
