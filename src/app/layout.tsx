import React from 'react';
import type { Metadata, Viewport } from 'next';
import PwaRegister from '@/components/PwaRegister';
import { APP_NAME } from '@/lib/assets';
import '../styles/tailwind.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A0A0A',
};

export const metadata: Metadata = {
  title: APP_NAME,
  description: 'Church app for members, visitors, events, sermons, and membership registration.',
  applicationName: APP_NAME,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: APP_NAME,
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/assets/brand/logo-mark-on-dark.png', type: 'image/png' }],
    apple: [{ url: '/assets/brand/logo-mark-on-dark.png' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet" />

        <script type="module" async src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fautomate13967back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.19" />
        <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.2" /></head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var first=(location.pathname.split('/').filter(Boolean)[0]||'').toLowerCase();var onBareLogin=!first||first==='login';var b=!onBareLogin&&JSON.parse(localStorage.getItem('ckc_last_church_branding')||'null');if(b&&b.p&&b.s){document.documentElement.style.setProperty('--ckc-primary',b.p);document.documentElement.style.setProperty('--ckc-secondary',b.s);}else{document.documentElement.style.setProperty('--ckc-primary','#6B7280');document.documentElement.style.setProperty('--ckc-secondary','#F7F3EE');}}catch(e){document.documentElement.style.setProperty('--ckc-primary','#6B7280');document.documentElement.style.setProperty('--ckc-secondary','#F7F3EE');}",
          }}
        />
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}