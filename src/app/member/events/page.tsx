'use client';

import React, { useState } from 'react';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';


interface ChurchEvent {
  id: number;
  name: string;
  type: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  rsvp: number;
  description: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  image: string;
  alt: string;
  speaker?: string;
  highlights?: string[];
}

const mockEvents: ChurchEvent[] = [
  {
    id: 1, name: 'Sunday Morning Service', type: 'Sunday Service', date: 'Sun 22 Jun 2025', time: '09:00',
    location: 'Main Auditorium', capacity: 300, rsvp: 180, status: 'Upcoming',
    image: 'https://images.unsplash.com/photo-1438232992991-995b671e4668?w=600&q=80',
    alt: 'Congregation gathered for Sunday morning worship service in a modern church auditorium',
    description: 'Weekly Sunday worship service with praise, prayer and the Word. Come ready to encounter God.',
    highlights: ['Praise & Worship', 'Word of God', 'Communion (1st Sunday)', 'Prayer Ministry'],
  },
  {
    id: 2, name: 'Youth Night', type: 'Youth Event', date: 'Fri 20 Jun 2025', time: '18:30',
    location: 'Youth Hall', capacity: 80, rsvp: 45, status: 'Upcoming',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80',
    alt: 'Young people gathered for youth night worship and fellowship event',
    description: 'Friday night youth gathering with worship, games, and discipleship. All youth welcome!',
    highlights: ['Live Worship', 'Games & Fun', 'Discipleship Talk', 'Fellowship'],
  },
  {
    id: 3, name: "Women's Prayer Morning", type: 'Prayer Meeting', date: 'Sat 21 Jun 2025', time: '08:00',
    location: 'Prayer Room', capacity: 50, rsvp: 32, status: 'Upcoming',
    image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=600&q=80',
    alt: 'Women gathered in prayer circle during morning prayer meeting',
    description: "Monthly women's prayer and fellowship morning. Bring your prayer requests.",
    highlights: ['Intercessory Prayer', 'Testimonies', 'Fellowship Breakfast'],
  },
  {
    id: 4, name: "Men's Breakfast", type: "Men's Ministry", date: 'Sat 28 Jun 2025', time: '07:30',
    location: 'Fellowship Hall', capacity: 60, rsvp: 28, status: 'Upcoming',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80',
    alt: 'Men gathered around tables for church breakfast fellowship event',
    description: "Monthly men's breakfast with a guest speaker. Breakfast provided.",
    speaker: 'Bro. Thabo Sithole',
    highlights: ['Full Breakfast', 'Guest Speaker', 'Men\'s Fellowship', 'Prayer'],
  },
  {
    id: 5, name: 'Community Outreach', type: 'Outreach', date: 'Sun 29 Jun 2025', time: '10:00',
    location: 'Soweto Community Centre', capacity: 40, rsvp: 22, status: 'Upcoming',
    image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&q=80',
    alt: 'Outdoor church community outreach and food distribution event',
    description: 'Monthly community outreach and food distribution. Volunteers welcome.',
    highlights: ['Food Distribution', 'Prayer for Community', 'Gospel Sharing', 'Volunteer Opportunity'],
  },
  {
    id: 6, name: 'Youth Conference 2025', type: 'Conference', date: 'Fri 18 Jul 2025', time: '09:00',
    location: 'Main Auditorium', capacity: 200, rsvp: 87, status: 'Upcoming',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
    alt: 'Large youth conference gathering with worship and speakers on stage',
    description: 'Annual youth conference — 3 days of worship, teaching, and encounters with God.',
    speaker: 'Evangelist Thabo Sithole',
    highlights: ['3 Days of Worship', 'Keynote Speakers', 'Breakout Sessions', 'Night Sessions'],
  },
  {
    id: 7, name: "Women's Day Celebration", type: "Women's Ministry", date: 'Sat 9 Aug 2025', time: '10:00',
    location: 'Main Auditorium', capacity: 250, rsvp: 134, status: 'Upcoming',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80',
    alt: "Women's Day celebration service with women in formal attire at church event",
    description: "Annual Women's Day celebration service. A powerful day of honour, worship, and the Word.",
    speaker: 'Pastor Sarah Dlamini',
    highlights: ['Special Worship', 'Guest Speaker', 'Lunch Provided', 'Gifts for All Women'],
  },
];

const typeColors: Record<string, string> = {
  'Sunday Service': 'bg-sky/10 text-sky border-sky/20',
  'Youth Event': 'bg-purple-500/10 text-purple-400 border-purple-400/20',
  'Prayer Meeting': 'bg-rose-500/10 text-rose-400 border-rose-400/20',
  "Men's Ministry": 'bg-blue-500/10 text-blue-400 border-blue-400/20',
  "Women's Ministry": 'bg-pink-500/10 text-pink-400 border-pink-400/20',
  'Outreach': 'bg-amber-500/10 text-amber-400 border-amber-400/20',
  'Conference': 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20',
};

export default function MemberEventsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [rsvpedEvents, setRsvpedEvents] = useState<number[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const types = ['All', ...Array.from(new Set(mockEvents.map((e) => e.type)))];

  const filtered = mockEvents.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase()) ||
      e.type.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'All' || e.type === typeFilter;
    return matchSearch && matchType && e.status !== 'Completed';
  });

  const handleRsvp = (id: number, name: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (rsvpedEvents.includes(id)) {
      setRsvpedEvents((prev) => prev.filter((x) => x !== id));
      showNotification(`RSVP cancelled for ${name}`);
    } else {
      setRsvpedEvents((prev) => [...prev, id]);
      showNotification(`✓ You're registered for ${name}! A reminder will be sent before the event.`);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const myRsvps = mockEvents.filter((e) => rsvpedEvents.includes(e.id));

  return (
    <AppShell access="shared">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Notification toast */}
        {notification && (
          <div className="fixed top-4 right-4 z-50 bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 text-sm px-4 py-3 rounded-xl shadow-xl backdrop-blur-sm max-w-sm">
            {notification}
          </div>
        )}

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-cloud">Upcoming Events</h1>
          <p className="text-cloud/40 text-sm mt-0.5">RSVP to events and stay connected with your church</p>
        </div>

        {/* My RSVPs */}
        {myRsvps.length > 0 && (
          <div className="bg-emerald-500/5 border border-emerald-400/20 rounded-2xl p-4">
            <h2 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Icon name="CheckCircleIcon" size={13} variant="outline" />
              My RSVPs ({myRsvps.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {myRsvps.map((ev) => (
                <div key={ev.id} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                  <span className="text-cloud text-xs font-medium">{ev.name}</span>
                  <span className="text-cloud/40 text-xs">{ev.date}</span>
                  <button onClick={(e) => handleRsvp(ev.id, ev.name, e)} className="text-cloud/30 hover:text-rose-400 transition-colors">
                    <Icon name="XMarkIcon" size={12} variant="outline" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search + Filter */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Icon name="MagnifyingGlassIcon" size={15} variant="outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-cloud/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:outline-none focus:border-sky/50 transition-colors"
            />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-cloud/70 focus:outline-none focus:border-sky/50 transition-colors">
            {types.map((t) => <option key={t} value={t} className="bg-slate-800">{t === 'All' ? 'All Types' : t}</option>)}
          </select>
        </div>

        {/* Events Grid with Thumbnails */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Icon name="CalendarDaysIcon" size={32} variant="outline" className="text-cloud/20 mx-auto mb-3" />
            <p className="text-cloud/40 text-sm">No upcoming events found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((ev) => {
              const isRsvped = rsvpedEvents.includes(ev.id);
              const fillPct = Math.round((ev.rsvp / ev.capacity) * 100);
              const typeColor = typeColors[ev.type] || 'bg-white/5 text-cloud/40 border-white/10';
              return (
                <div
                  key={ev.id}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-sky/20 transition-all group cursor-pointer"
                  onClick={() => setSelectedEvent(ev)}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-black/40">
                    <img
                      src={ev.image}
                      alt={ev.alt}
                      className="w-full h-full object-cover opacity-75 group-hover:opacity-95 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute top-2.5 left-2.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${typeColor}`}>{ev.type}</span>
                    </div>
                    {isRsvped && (
                      <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-emerald-500/80 flex items-center justify-center">
                        <Icon name="CheckIcon" size={12} variant="outline" className="text-white" />
                      </div>
                    )}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5">
                      <p className="text-white font-bold text-sm leading-snug line-clamp-2 drop-shadow">{ev.name}</p>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center gap-2 text-xs text-cloud/50">
                        <Icon name="CalendarDaysIcon" size={11} variant="outline" />
                        <span>{ev.date} at {ev.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-cloud/50">
                        <Icon name="MapPinIcon" size={11} variant="outline" />
                        <span>{ev.location}</span>
                      </div>
                    </div>

                    {/* Capacity bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-[10px] text-cloud/30 mb-1">
                        <span>{ev.rsvp} registered</span>
                        <span>{ev.capacity - ev.rsvp} spots left</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${fillPct > 80 ? 'bg-rose-400' : fillPct > 60 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => handleRsvp(ev.id, ev.name, e)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                          isRsvped
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-400/20' :'bg-sky/10 text-sky border-sky/20 hover:bg-sky/20'
                        }`}
                      >
                        <Icon name={isRsvped ? 'CheckCircleIcon' : 'CalendarDaysIcon'} size={12} variant="outline" />
                        {isRsvped ? 'Cancel RSVP' : 'RSVP Now'}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); }}
                        className="px-3 py-2 rounded-xl text-xs border bg-white/5 border-white/10 text-cloud/50 hover:text-cloud hover:border-white/20 transition-colors"
                        aria-label="View details"
                      >
                        <Icon name="ArrowsPointingOutIcon" size={12} variant="outline" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Event Full Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedEvent(null)}>
          <div className="bg-[#0F172A] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Hero image */}
            <div className="relative aspect-video bg-black/40">
              <img
                src={selectedEvent.image}
                alt={selectedEvent.alt}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              >
                <Icon name="XMarkIcon" size={16} variant="outline" />
              </button>
              <div className="absolute bottom-4 left-4 right-4">
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full border font-medium mb-2 ${typeColors[selectedEvent.type] || 'bg-white/5 text-cloud/40 border-white/10'}`}>
                  {selectedEvent.type}
                </span>
                <h2 className="text-white font-bold text-xl leading-snug drop-shadow">{selectedEvent.name}</h2>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="flex items-center gap-2 text-sm text-cloud/60">
                  <Icon name="CalendarDaysIcon" size={14} variant="outline" className="text-sky flex-shrink-0" />
                  <span>{selectedEvent.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-cloud/60">
                  <Icon name="ClockIcon" size={14} variant="outline" className="text-sky flex-shrink-0" />
                  <span>{selectedEvent.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-cloud/60">
                  <Icon name="MapPinIcon" size={14} variant="outline" className="text-sky flex-shrink-0" />
                  <span>{selectedEvent.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-cloud/60">
                  <Icon name="UsersIcon" size={14} variant="outline" className="text-sky flex-shrink-0" />
                  <span>{selectedEvent.rsvp} / {selectedEvent.capacity} registered</span>
                </div>
                {selectedEvent.speaker && (
                  <div className="col-span-2 flex items-center gap-2 text-sm text-cloud/60">
                    <Icon name="MicrophoneIcon" size={14} variant="outline" className="text-amber-400 flex-shrink-0" />
                    <span>{selectedEvent.speaker}</span>
                  </div>
                )}
              </div>

              <p className="text-cloud/60 text-sm leading-relaxed mb-5">{selectedEvent.description}</p>

              {selectedEvent.highlights && selectedEvent.highlights.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-cloud/40 uppercase tracking-wider mb-2">What to Expect</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedEvent.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-cloud/60">
                        <div className="w-1.5 h-1.5 rounded-full bg-sky flex-shrink-0" />
                        {h}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Capacity bar */}
              <div className="mb-5">
                <div className="flex items-center justify-between text-xs text-cloud/40 mb-1.5">
                  <span>{selectedEvent.rsvp} registered</span>
                  <span>{selectedEvent.capacity - selectedEvent.rsvp} spots remaining</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      Math.round((selectedEvent.rsvp / selectedEvent.capacity) * 100) > 80 ? 'bg-rose-400' :
                      Math.round((selectedEvent.rsvp / selectedEvent.capacity) * 100) > 60 ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.round((selectedEvent.rsvp / selectedEvent.capacity) * 100)}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => { handleRsvp(selectedEvent.id, selectedEvent.name); setSelectedEvent(null); }}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border transition-all ${
                  rsvpedEvents.includes(selectedEvent.id)
                    ? 'bg-rose-500/10 text-rose-400 border-rose-400/20 hover:bg-rose-500/20' :'bg-sky/10 text-sky border-sky/20 hover:bg-sky/20'
                }`}
              >
                <Icon name={rsvpedEvents.includes(selectedEvent.id) ? 'XCircleIcon' : 'CheckCircleIcon'} size={16} variant="outline" />
                {rsvpedEvents.includes(selectedEvent.id) ? 'Cancel RSVP' : 'RSVP for this Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
