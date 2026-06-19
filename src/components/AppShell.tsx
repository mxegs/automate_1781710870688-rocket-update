'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      <Sidebar />
      {/* Main content — offset for sidebar */}
      <div className="md:ml-60 pt-14 md:pt-0 transition-all duration-300">
        <main className="min-h-screen p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
