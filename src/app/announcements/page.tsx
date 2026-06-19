'use client';

import React, { useState } from 'react';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';

interface Announcement {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  expiryDate?: string;
  category: string;
  pinned: boolean;
  status: 'Published' | 'Scheduled' | 'Draft';
}

const mockAnnouncements: Announcement[] = [
  { id: 1, title: 'Sunday Service Time Change', content: 'Please note that from 6 July, our Sunday morning service will begin at 08:30 instead of 09:00. This change allows us to accommodate our growing congregation.', author: 'Pastor Dlamini', date: '15 Jun 2025', expiryDate: '6 Jul 2025', category: 'General', pinned: true, status: 'Published' },
  { id: 2, title: "Men's Conference 2025", content: "We are excited to announce our annual Men's Conference taking place on 28-29 June. Theme: 'Standing Firm'. Registration is now open. Cost: R150 per person.", author: 'Elder Mokoena', date: '10 Jun 2025', expiryDate: '28 Jun 2025', category: 'Events', pinned: true, status: 'Published' },
  { id: 3, title: 'Membership Class Starting July', content: 'A new membership class will begin on 6 July for all those interested in becoming official members of the church. Please speak to the church office to register.', author: 'Pastor Dlamini', date: '12 Jun 2025', category: 'General', pinned: false, status: 'Published' },
  { id: 4, title: 'Community Food Drive', content: 'We are collecting non-perishable food items for our monthly community outreach. Please bring donations to the church foyer by 29 June.', author: 'Outreach Team', date: '8 Jun 2025', expiryDate: '29 Jun 2025', category: 'Outreach', pinned: false, status: 'Published' },
  { id: 5, title: 'Youth Camp Registration Open', content: 'Youth Camp 2025 is happening from 18-20 July. Open to all youth aged 13-25. Cost: R350. Limited spaces available.', author: 'Lerato Dlamini', date: '14 Jun 2025', expiryDate: '10 Jul 2025', category: 'Youth', pinned: false, status: 'Published' },
  { id: 6, title: 'Christmas Service Planning', content: 'Planning for our Christmas services has begun. Volunteers needed for the Christmas choir and drama team.', author: 'Pastor Dlamini', date: '16 Jun 2025', category: 'General', pinned: false, status: 'Draft' },
];

const categoryColors: Record<string, string> = {
  General: 'bg-sky/10 text-sky',
  Events: 'bg-purple-500/10 text-purple-400',
  Outreach: 'bg-emerald-500/10 text-emerald-400',
  Youth: 'bg-amber-500/10 text-amber-400',
  Ministry: 'bg-rose-500/10 text-rose-400',
};

const statusColors: Record<string, string> = {
  Published: 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20',
  Scheduled: 'bg-amber-500/10 text-amber-400 border-amber-400/20',
  Draft: 'bg-white/5 text-cloud/40 border-white/10',
};

export default function AnnouncementsPage() {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const filtered = mockAnnouncements.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.content.toLowerCase().includes(search.toLowerCase())
  );

  const pinned = filtered.filter((a) => a.pinned);
  const regular = filtered.filter((a) => !a.pinned);

  return (
    <AppShell access="staff">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cloud tracking-tight">Announcements</h1>
          <p className="text-cloud/40 text-sm mt-0.5">{mockAnnouncements.filter((a) => a.status === 'Published').length} published announcements</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-sky text-slate-dark font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-sky/90 transition-colors"
        >
          <Icon name="PlusIcon" size={16} variant="outline" />
          New Announcement
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Icon name="MagnifyingGlassIcon" size={16} variant="outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-cloud/30" />
        <input
          type="text"
          placeholder="Search announcements..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-cloud placeholder-cloud/30 focus:outline-none focus:border-sky/50 transition-colors"
        />
      </div>

      {/* Pinned */}
      {pinned.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="BookmarkIcon" size={14} variant="outline" className="text-sky" />
            <h2 className="text-xs font-semibold text-cloud/50 uppercase tracking-wider">Pinned</h2>
          </div>
          <div className="space-y-3">
            {pinned.map((ann) => (
              <AnnouncementCard key={ann.id} ann={ann} onClick={() => setSelectedAnnouncement(ann)} />
            ))}
          </div>
        </div>
      )}

      {/* Regular */}
      {regular.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-cloud/50 uppercase tracking-wider mb-3">All Announcements</h2>
          <div className="space-y-3">
            {regular.map((ann) => (
              <AnnouncementCard key={ann.id} ann={ann} onClick={() => setSelectedAnnouncement(ann)} />
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-cloud/30">
          <Icon name="MegaphoneIcon" size={32} variant="outline" className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No announcements found</p>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-cloud">New Announcement</h2>
              <button onClick={() => setShowAddModal(false)} className="text-cloud/40 hover:text-cloud">
                <Icon name="XMarkIcon" size={20} variant="outline" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Title</label>
                <input type="text" placeholder="Announcement title" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:outline-none focus:border-sky/50 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Category</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud focus:outline-none focus:border-sky/50 transition-colors">
                    <option>General</option>
                    <option>Events</option>
                    <option>Outreach</option>
                    <option>Youth</option>
                    <option>Ministry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Expiry Date</label>
                  <input type="date" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud focus:outline-none focus:border-sky/50 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Content</label>
                <textarea rows={5} placeholder="Write your announcement..." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:outline-none focus:border-sky/50 transition-colors resize-none" />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="pinned" className="w-4 h-4 rounded border-white/20 bg-white/5" />
                <label htmlFor="pinned" className="text-sm text-cloud/60">Pin this announcement</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 bg-white/5 border border-white/10 text-cloud/70 text-sm font-semibold py-2.5 rounded-lg hover:bg-white/10 transition-colors">Save Draft</button>
              <button onClick={() => setShowAddModal(false)} className="flex-1 bg-sky text-slate-dark text-sm font-bold py-2.5 rounded-lg hover:bg-sky/90 transition-colors">Publish</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${categoryColors[selectedAnnouncement.category] || 'bg-white/10 text-cloud/50'}`}>
                  {selectedAnnouncement.category}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[selectedAnnouncement.status]}`}>
                  {selectedAnnouncement.status}
                </span>
              </div>
              <button onClick={() => setSelectedAnnouncement(null)} className="text-cloud/40 hover:text-cloud">
                <Icon name="XMarkIcon" size={20} variant="outline" />
              </button>
            </div>
            <h2 className="text-xl font-bold text-cloud mb-3">{selectedAnnouncement.title}</h2>
            <p className="text-sm text-cloud/70 leading-relaxed mb-5">{selectedAnnouncement.content}</p>
            <div className="space-y-2 mb-5">
              {[
                { label: 'Author', value: selectedAnnouncement.author, icon: 'UserCircleIcon' },
                { label: 'Posted', value: selectedAnnouncement.date, icon: 'CalendarDaysIcon' },
                { label: 'Expires', value: selectedAnnouncement.expiryDate || 'No expiry', icon: 'ClockIcon' },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <Icon name={row.icon} size={14} variant="outline" className="text-cloud/30 flex-shrink-0" />
                  <span className="text-xs text-cloud/40 w-14">{row.label}</span>
                  <span className="text-sm text-cloud">{row.value}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setSelectedAnnouncement(null)} className="w-full bg-sky text-slate-dark text-sm font-bold py-2.5 rounded-lg hover:bg-sky/90 transition-colors">Close</button>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function AnnouncementCard({ ann, onClick }: { ann: Announcement; onClick: () => void }) {
  const categoryColors: Record<string, string> = {
    General: 'bg-sky/10 text-sky',
    Events: 'bg-purple-500/10 text-purple-400',
    Outreach: 'bg-emerald-500/10 text-emerald-400',
    Youth: 'bg-amber-500/10 text-amber-400',
    Ministry: 'bg-rose-500/10 text-rose-400',
  };

  const statusColors: Record<string, string> = {
    Published: 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20',
    Scheduled: 'bg-amber-500/10 text-amber-400 border-amber-400/20',
    Draft: 'bg-white/5 text-cloud/40 border-white/10',
  };

  return (
    <div
      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-sky/20 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${categoryColors[ann.category] || 'bg-white/10 text-cloud/50'}`}>
            {ann.category}
          </span>
          {ann.pinned && (
            <Icon name="BookmarkIcon" size={12} variant="outline" className="text-sky" />
          )}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${statusColors[ann.status]}`}>
          {ann.status}
        </span>
      </div>
      <h3 className="text-sm font-bold text-cloud mb-1">{ann.title}</h3>
      <p className="text-sm text-cloud/50 line-clamp-2 mb-2">{ann.content}</p>
      <div className="flex items-center gap-3 text-xs text-cloud/30">
        <span>{ann.author}</span>
        <span>·</span>
        <span>{ann.date}</span>
        {ann.expiryDate && (
          <>
            <span>·</span>
            <span className="text-amber-400/60">Expires {ann.expiryDate}</span>
          </>
        )}
      </div>
    </div>
  );
}
