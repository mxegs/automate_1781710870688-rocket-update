'use client';

import React, { useState } from 'react';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';

const churchInfo = {
  name: 'Church Connect',
  tagline: 'A community of faith, love, and purpose',
  founded: '1998',
  location: 'Johannesburg, South Africa',
  pastor: 'Pastor James Mokoena',
  serviceTime: 'Sundays at 09:00 & 11:00',
  phone: '+27 11 000 0000',
  email: 'info@churchconnect.co.za',
  website: 'www.churchconnect.co.za',
  about: `Church Connect is a vibrant, Spirit-filled community of believers committed to knowing God, growing together, and serving our city. We are a multigenerational church that believes in the power of the Word of God, the presence of the Holy Spirit, and the importance of authentic community.

Founded in 1998, we have grown from a small home group into a thriving congregation of hundreds of families. We are passionate about discipleship, missions, and making a tangible difference in the lives of people in our community and beyond.

We believe that church is not just a Sunday experience — it is a family, a community, and a movement. Whether you are new to faith or have been walking with God for decades, there is a place for you here.`,
  vision: `To be a church that transforms lives, strengthens families, and impacts our city with the love and power of Jesus Christ — one person at a time.`,
  mission: `To make disciples of all nations by preaching the Gospel, equipping believers, and serving our community with excellence and compassion.`,
  values: [
    {
      title: 'Word-Centred',
      description: 'We believe the Bible is the inspired, authoritative Word of God and the foundation for all we do.',
      icon: '📖',
      color: 'sky',
    },
    {
      title: 'Spirit-Led',
      description: 'We depend on the Holy Spirit for guidance, power, and transformation in every area of church life.',
      icon: '🔥',
      color: 'amber',
    },
    {
      title: 'Community',
      description: 'We are better together. We prioritise authentic relationships, small groups, and belonging.',
      icon: '🤝',
      color: 'emerald',
    },
    {
      title: 'Discipleship',
      description: 'We are committed to helping every person grow in their faith and become more like Christ.',
      icon: '🌱',
      color: 'green',
    },
    {
      title: 'Generosity',
      description: 'We give freely of our time, talents, and resources because we have received freely from God.',
      icon: '💛',
      color: 'yellow',
    },
    {
      title: 'Excellence',
      description: 'We honour God by doing everything with excellence — not perfection, but our very best.',
      icon: '⭐',
      color: 'purple',
    },
    {
      title: 'Outreach',
      description: 'We are called to serve our city and the world, sharing the love of Christ through action.',
      icon: '🌍',
      color: 'rose',
    },
    {
      title: 'Prayer',
      description: 'Prayer is the foundation of everything we do. We are a house of prayer for all nations.',
      icon: '🙏',
      color: 'indigo',
    },
  ],
  leadership: [
    { name: 'Pastor James Mokoena', role: 'Senior Pastor', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', alt: 'Senior Pastor James Mokoena portrait' },
    { name: 'Pastor Sarah Dlamini', role: 'Associate Pastor', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80', alt: 'Associate Pastor Sarah Dlamini portrait' },
    { name: 'Elder Ruth Khumalo', role: 'Elder & Bible Teacher', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80', alt: 'Elder Ruth Khumalo portrait' },
    { name: 'Deacon Sipho Nkosi', role: 'Deacon & Outreach Lead', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80', alt: 'Deacon Sipho Nkosi portrait' },
  ],
  socialMedia: {
    facebook: 'https://facebook.com/churchconnect',
    instagram: 'https://instagram.com/churchconnect',
    youtube: 'https://youtube.com/@churchconnect',
    whatsapp: 'https://wa.me/27110000000',
  },
};

const colorMap: Record<string, string> = {
  sky: 'bg-sky/10 border-sky/20 text-sky',
  amber: 'bg-amber-500/10 border-amber-400/20 text-amber-400',
  emerald: 'bg-emerald-500/10 border-emerald-400/20 text-emerald-400',
  green: 'bg-green-500/10 border-green-400/20 text-green-400',
  yellow: 'bg-yellow-500/10 border-yellow-400/20 text-yellow-400',
  purple: 'bg-purple-500/10 border-purple-400/20 text-purple-400',
  rose: 'bg-rose-500/10 border-rose-400/20 text-rose-400',
  indigo: 'bg-indigo-500/10 border-indigo-400/20 text-indigo-400',
};

type TabType = 'about' | 'vision' | 'values' | 'leadership' | 'contact';

export default function ChurchInfoPage() {
  const [activeTab, setActiveTab] = useState<TabType>('about');

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'about', label: 'About', icon: 'BuildingLibraryIcon' },
    { id: 'vision', label: 'Vision & Mission', icon: 'EyeIcon' },
    { id: 'values', label: 'Our Values', icon: 'HeartIcon' },
    { id: 'leadership', label: 'Leadership', icon: 'UsersIcon' },
    { id: 'contact', label: 'Contact', icon: 'PhoneIcon' },
  ];

  return (
    <AppShell access="shared">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Hero */}
        <div className="relative bg-gradient-to-br from-sky/10 via-white/5 to-purple-500/5 border border-white/10 rounded-2xl p-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-sky/10 border border-sky/20 flex items-center justify-center mb-4">
              <Icon name="BuildingLibraryIcon" size={28} variant="outline" className="text-sky" />
            </div>
            <h1 className="text-2xl font-bold text-cloud">{churchInfo.name}</h1>
            <p className="text-cloud/50 text-sm mt-1">{churchInfo.tagline}</p>
            <div className="flex flex-wrap gap-4 mt-4 text-xs text-cloud/40">
              <span className="flex items-center gap-1.5"><Icon name="MapPinIcon" size={12} variant="outline" />{churchInfo.location}</span>
              <span className="flex items-center gap-1.5"><Icon name="CalendarDaysIcon" size={12} variant="outline" />Founded {churchInfo.founded}</span>
              <span className="flex items-center gap-1.5"><Icon name="ClockIcon" size={12} variant="outline" />{churchInfo.serviceTime}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-sky/10 text-sky border border-sky/20' : 'text-cloud/50 hover:text-cloud'
              }`}
            >
              <Icon name={tab.icon} size={12} variant="outline" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* About */}
        {activeTab === 'about' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-base font-bold text-cloud mb-4 flex items-center gap-2">
              <Icon name="BuildingLibraryIcon" size={16} variant="outline" className="text-sky" />
              About Our Church
            </h2>
            <div className="space-y-4">
              {churchInfo.about.split('\n\n').map((para, i) => (
                <p key={i} className="text-cloud/60 text-sm leading-relaxed">{para}</p>
              ))}
            </div>
          </div>
        )}

        {/* Vision & Mission */}
        {activeTab === 'vision' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-sky/10 via-white/5 to-transparent border border-sky/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="EyeIcon" size={16} variant="outline" className="text-sky" />
                <span className="text-xs font-semibold text-sky uppercase tracking-wider">Our Vision</span>
              </div>
              <p className="text-cloud font-semibold text-lg leading-relaxed">{churchInfo.vision}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/10 via-white/5 to-transparent border border-emerald-400/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="RocketLaunchIcon" size={16} variant="outline" className="text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Our Mission</span>
              </div>
              <p className="text-cloud font-semibold text-lg leading-relaxed">{churchInfo.mission}</p>
            </div>
          </div>
        )}

        {/* Values */}
        {activeTab === 'values' && (
          <div>
            <p className="text-cloud/50 text-sm mb-4">The core values that guide everything we do as a church.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {churchInfo.values.map((val) => (
                <div key={val.title} className={`flex items-start gap-3 p-4 rounded-xl border ${colorMap[val.color] || 'bg-white/5 border-white/10 text-cloud/50'}`}>
                  <span className="text-2xl flex-shrink-0">{val.icon}</span>
                  <div>
                    <h3 className="font-bold text-sm mb-1">{val.title}</h3>
                    <p className="text-xs opacity-70 leading-relaxed">{val.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leadership */}
        {activeTab === 'leadership' && (
          <div>
            <p className="text-cloud/50 text-sm mb-4">Meet the leaders who serve and shepherd our church family.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {churchInfo.leadership.map((leader) => (
                <div key={leader.name} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-sky/20 transition-all">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                    <img src={leader.image} alt={leader.alt} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-cloud font-semibold text-sm">{leader.name}</p>
                    <p className="text-cloud/40 text-xs mt-0.5">{leader.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        {activeTab === 'contact' && (
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-base font-bold text-cloud mb-4">Get in Touch</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-sky/10 border border-sky/20 flex items-center justify-center flex-shrink-0">
                    <Icon name="MapPinIcon" size={14} variant="outline" className="text-sky" />
                  </div>
                  <div>
                    <p className="text-cloud/40 text-xs">Location</p>
                    <p className="text-cloud">{churchInfo.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center flex-shrink-0">
                    <Icon name="PhoneIcon" size={14} variant="outline" className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-cloud/40 text-xs">Phone</p>
                    <p className="text-cloud">{churchInfo.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-400/20 flex items-center justify-center flex-shrink-0">
                    <Icon name="EnvelopeIcon" size={14} variant="outline" className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-cloud/40 text-xs">Email</p>
                    <p className="text-cloud">{churchInfo.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-400/20 flex items-center justify-center flex-shrink-0">
                    <Icon name="ClockIcon" size={14} variant="outline" className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-cloud/40 text-xs">Service Times</p>
                    <p className="text-cloud">{churchInfo.serviceTime}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-sm font-bold text-cloud mb-4">Follow Us</h2>
              <div className="grid grid-cols-2 gap-3">
                <a href={churchInfo.socialMedia.facebook} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-400/20 hover:bg-blue-500/20 transition-all">
                  <Icon name="GlobeAltIcon" size={18} variant="outline" className="text-blue-400" />
                  <div>
                    <p className="text-blue-400 text-xs font-semibold">Facebook</p>
                    <p className="text-cloud/30 text-[10px]">@churchconnect</p>
                  </div>
                </a>
                <a href={churchInfo.socialMedia.instagram} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-pink-500/10 border border-pink-400/20 hover:bg-pink-500/20 transition-all">
                  <Icon name="CameraIcon" size={18} variant="outline" className="text-pink-400" />
                  <div>
                    <p className="text-pink-400 text-xs font-semibold">Instagram</p>
                    <p className="text-cloud/30 text-[10px]">@churchconnect</p>
                  </div>
                </a>
                <a href={churchInfo.socialMedia.youtube} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-400/20 hover:bg-red-500/20 transition-all">
                  <Icon name="PlayCircleIcon" size={18} variant="outline" className="text-red-400" />
                  <div>
                    <p className="text-red-400 text-xs font-semibold">YouTube</p>
                    <p className="text-cloud/30 text-[10px]">@churchconnect</p>
                  </div>
                </a>
                <a href={churchInfo.socialMedia.whatsapp} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-400/20 hover:bg-green-500/20 transition-all">
                  <Icon name="ChatBubbleLeftRightIcon" size={18} variant="outline" className="text-green-400" />
                  <div>
                    <p className="text-green-400 text-xs font-semibold">WhatsApp</p>
                    <p className="text-cloud/30 text-[10px]">Chat with us</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
