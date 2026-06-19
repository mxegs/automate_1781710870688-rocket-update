'use client';

import React, { useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { getCampusSocial } from '@/lib/church/constants';
import { resolveMemberCampus } from '@/lib/member/campus';
import type { CampusId } from '@/lib/church/constants';

/**
 * Campus social links — not a live Instagram API feed yet.
 * Full post grid requires Instagram Graph API (Business account + Meta app).
 * Update handles in src/lib/church/constants.ts → CAMPUS_SOCIAL
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
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-cloud flex items-center gap-2">
          <Icon name="PhotoIcon" size={15} variant="outline" className="text-pink-400" />
          Social Feed
        </h2>
        <span className="text-[10px] text-cloud/30">{social.instagramLabel}</span>
      </div>

      <div className="rounded-xl border border-pink-400/20 bg-gradient-to-br from-pink-500/5 to-purple-500/5 p-6 text-center mb-3">
        <Icon name="CameraIcon" size={32} variant="outline" className="mx-auto text-pink-400 mb-3" />
        <p className="text-sm text-cloud/70 leading-relaxed">
          Follow us on Instagram for photos, reels &amp; updates from your campus.
        </p>
        <p className="text-[10px] text-cloud/30 mt-2">
          Live post grid needs Instagram Business API — links below open your campus pages.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <a
          href={social.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-400/20 text-xs text-pink-400 hover:from-pink-500/20 hover:to-purple-500/20 transition-all"
        >
          <Icon name="CameraIcon" size={12} variant="outline" />
          Instagram
        </a>
        <a
          href={social.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-blue-500/10 border border-blue-400/20 text-xs text-blue-400 hover:bg-blue-500/20 transition-all"
        >
          <Icon name="GlobeAltIcon" size={12} variant="outline" />
          Facebook
        </a>
      </div>
    </div>
  );
}
