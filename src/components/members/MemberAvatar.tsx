'use client';

import React from 'react';
import { avatarToneClass, initialsFromFullName } from '@/lib/members/photo';

export default function MemberAvatar({
  memberId,
  name,
  photoUrl,
  sizePx = 40,
}: {
  memberId: string;
  name: string;
  photoUrl?: string | null;
  sizePx?: number;
}) {
  const initials = initialsFromFullName(name);
  const size = { width: sizePx, height: sizePx };

  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt=""
        className="shrink-0 rounded-full object-cover"
        style={size}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarToneClass(memberId)}`}
      style={size}
      aria-hidden
    >
      {initials}
    </div>
  );
}
