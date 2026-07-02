'use client';

import React, { useState, useEffect } from 'react';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          scrolled ? 'nav-blur py-3' : 'py-5 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <AppLogo
              size={28}
              text="Automate"
              className="text-cloud font-bold text-xl tracking-tight"
            />
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-widest text-admin">
            <a href="#problem" className="hover:text-cloud transition-colors duration-200">Report</a>
            <a href="#comparison" className="hover:text-cloud transition-colors duration-200">Compare</a>
            <a href="#integrations" className="hover:text-cloud transition-colors duration-200">Integrations</a>
            <a
              href="#demo"
              className="btn-sky px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest"
            >
              See Demo
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-cloud p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <Icon name={menuOpen ? 'XMarkIcon' : 'Bars3Icon'} size={24} variant="outline" />
          </button>
        </div>
      </nav>
      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 bg-ckc-black flex flex-col justify-center items-center gap-8 transition-transform duration-500 ${
          menuOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        {['Report', 'Compare', 'Integrations']?.map((item) => (
          <a
            key={item}
            href={`#${item?.toLowerCase()}`}
            onClick={() => setMenuOpen(false)}
            className="text-4xl font-bold uppercase tracking-tighter text-cloud hover:text-ckc-gold transition-colors"
          >
            {item}
          </a>
        ))}
        <a
          href="#demo"
          onClick={() => setMenuOpen(false)}
          className="btn-sky px-8 py-4 text-sm font-bold uppercase tracking-widest rounded-sm"
        >
          See Your Church Automated
        </a>
      </div>
    </>
  );
}