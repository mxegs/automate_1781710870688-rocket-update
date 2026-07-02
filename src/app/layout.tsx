import React from 'react';
import type { Metadata, Viewport } from 'next';
import PwaRegister from '@/components/PwaRegister';
import '../styles/tailwind.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A0A0A',
};

export const metadata: Metadata = {
  title: 'Christ Kingdom Citizens — CKC App',
  description: 'Christ Kingdom Citizens church app for members, visitors, events, sermons, and membership registration.',
  applicationName: 'CKC',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CKC',
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/assets/images/app_logo.png', type: 'image/png' }],
    apple: [{ url: '/assets/images/app_logo.png' }],
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
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}