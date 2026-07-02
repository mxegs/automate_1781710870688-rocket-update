import React from 'react';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';

export default function Footer() {
  const socialLinks = [
    { href: 'https://facebook.com/churchconnect', label: 'Facebook', icon: 'GlobeAltIcon', color: 'hover:text-ckc-gold' },
    { href: 'https://instagram.com/churchconnect', label: 'Instagram', icon: 'CameraIcon', color: 'hover:text-ckc-gold' },
    { href: 'https://youtube.com/@churchconnect', label: 'YouTube', icon: 'PlayCircleIcon', color: 'hover:text-red-400' },
    { href: 'https://wa.me/27110000000', label: 'WhatsApp', icon: 'ChatBubbleLeftRightIcon', color: 'hover:text-green-400' },
  ];

  return (
    <footer className="border-t border-[rgba(100,116,139,0.25)] py-10 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo + links */}
        <div className="flex flex-wrap items-center gap-6 md:gap-8">
          <AppLogo size={22} text="Church Connect" className="text-cloud font-bold text-base tracking-tight" />
          <a href="#problem" className="text-sm font-medium text-admin hover:text-cloud transition-colors">Report</a>
          <a href="#comparison" className="text-sm font-medium text-admin hover:text-cloud transition-colors">Compare</a>
          <a href="#integrations" className="text-sm font-medium text-admin hover:text-cloud transition-colors">Integrations</a>
          <a href="#demo" className="text-sm font-medium text-admin hover:text-cloud transition-colors">Demo</a>
        </div>

        {/* Right: social + legal */}
        <div className="flex items-center gap-4 text-admin">
          {socialLinks?.map((s) => (
            <a
              key={s?.label}
              href={s?.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s?.label}
              className={`transition-colors ${s?.color}`}
            >
              <Icon name={s?.icon} size={18} variant="outline" />
            </a>
          ))}
          <span className="text-xs text-admin/60 ml-1">·</span>
          <a href="#" className="text-xs text-admin hover:text-cloud transition-colors">Privacy</a>
          <a href="#" className="text-xs text-admin hover:text-cloud transition-colors">Terms</a>
          <span className="text-xs text-admin/60">© 2026 Church Connect</span>
        </div>
      </div>
    </footer>
  );
}