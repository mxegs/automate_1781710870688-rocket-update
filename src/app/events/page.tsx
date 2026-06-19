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
}

const mockEvents: ChurchEvent[] = [
  { id: 1, name: 'Sunday Morning Service', type: 'Sunday Service', date: '22 Jun 2025', time: '09:00', location: 'Main Auditorium', capacity: 300, rsvp: 180, description: 'Weekly Sunday worship service with praise, prayer and the Word.', status: 'Upcoming' },
  { id: 2, name: 'Youth Night', type: 'Youth Event', date: '20 Jun 2025', time: '18:30', location: 'Youth Hall', capacity: 80, rsvp: 45, description: 'Friday night youth gathering with worship and discipleship.', status: 'Upcoming' },
  { id: 3, name: "Women's Prayer Morning", type: 'Prayer Meeting', date: '21 Jun 2025', time: '08:00', location: 'Prayer Room', capacity: 50, rsvp: 32, description: 'Monthly women\'s prayer and fellowship morning.', status: 'Upcoming' },
  { id: 4, name: "Men's Breakfast", type: "Men's Ministry", date: '28 Jun 2025', time: '07:30', location: 'Fellowship Hall', capacity: 60, rsvp: 28, description: 'Monthly men\'s breakfast with a guest speaker.', status: 'Upcoming' },
  { id: 5, name: 'Community Outreach', type: 'Outreach', date: '29 Jun 2025', time: '10:00', location: 'Soweto Community Centre', capacity: 40, rsvp: 22, description: 'Monthly community outreach and food distribution.', status: 'Upcoming' },
  { id: 6, name: 'Sunday Evening Service', type: 'Sunday Service', date: '15 Jun 2025', time: '18:00', location: 'Main Auditorium', capacity: 300, rsvp: 145, description: 'Evening worship service.', status: 'Completed' },
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

const statusColors: Record<string, string> = {
  Upcoming: 'bg-sky/10 text-sky border-sky/20',
  Ongoing: 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20',
  Completed: 'bg-white/5 text-cloud/40 border-white/10',
};

export default function EventsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null);

  const types = ['All', ...Array.from(new Set(mockEvents.map((e) => e.type)))];

  const filtered = mockEvents.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'All' || e.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <AppShell access="staff">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cloud tracking-tight">Events</h1>
          <p className="text-cloud/40 text-sm mt-0.5">{mockEvents.filter((e) => e.status === 'Upcoming').length} upcoming events</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-sky text-slate-dark font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-sky/90 transition-colors"
        >
          <Icon name="PlusIcon" size={16} variant="outline" />
          Create Event
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Icon name="MagnifyingGlassIcon" size={16} variant="outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-cloud/30" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-cloud placeholder-cloud/30 focus:outline-none focus:border-sky/50 transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                typeFilter === t
                  ? 'bg-sky/10 text-sky border-sky/30' :'bg-white/5 text-cloud/50 border-white/10 hover:text-cloud hover:border-white/20'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Events grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((event) => {
          const fillPct = Math.round((event.rsvp / event.capacity) * 100);
          return (
            <div
              key={event.id}
              className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-sky/20 transition-colors cursor-pointer"
              onClick={() => setSelectedEvent(event)}
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${typeColors[event.type] || 'bg-white/5 text-cloud/50 border-white/10'}`}>
                  {event.type}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[event.status]}`}>
                  {event.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-cloud mb-2">{event.name}</h3>
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-xs text-cloud/50">
                  <Icon name="CalendarDaysIcon" size={12} variant="outline" />
                  <span>{event.date} at {event.time}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-cloud/50">
                  <Icon name="MapPinIcon" size={12} variant="outline" />
                  <span>{event.location}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-cloud/40">Attendance</span>
                  <span className="text-xs font-semibold text-cloud">{event.rsvp} / {event.capacity}</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${fillPct >= 90 ? 'bg-rose-400' : fillPct >= 70 ? 'bg-amber-400' : 'bg-sky'}`}
                    style={{ width: `${fillPct}%` }}
                  />
                </div>
                <p className="text-xs text-cloud/30 mt-1">{fillPct}% capacity</p>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-cloud/30">
          <Icon name="CalendarDaysIcon" size={32} variant="outline" className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No events found</p>
        </div>
      )}

      {/* Create Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-cloud">Create Event</h2>
              <button onClick={() => setShowAddModal(false)} className="text-cloud/40 hover:text-cloud">
                <Icon name="XMarkIcon" size={20} variant="outline" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Event Name', placeholder: 'Sunday Morning Service' },
                { label: 'Location', placeholder: 'Main Auditorium' },
              ].map((field) => (
                <div key={field.label}>
                  <label className="block text-xs font-semibold text-cloud/50 mb-1.5">{field.label}</label>
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:outline-none focus:border-sky/50 transition-colors"
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Date</label>
                  <input type="date" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud focus:outline-none focus:border-sky/50 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Time</label>
                  <input type="time" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud focus:outline-none focus:border-sky/50 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Event Type</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud focus:outline-none focus:border-sky/50 transition-colors">
                    <option>Sunday Service</option>
                    <option>Prayer Meeting</option>
                    <option>Youth Event</option>
                    <option>Conference</option>
                    <option>Outreach</option>
                    <option>Men&apos;s Ministry</option>
                    <option>Women&apos;s Ministry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Capacity</label>
                  <input type="number" placeholder="100" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:outline-none focus:border-sky/50 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-cloud/50 mb-1.5">Description</label>
                <textarea rows={3} placeholder="Event description..." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:outline-none focus:border-sky/50 transition-colors resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 bg-white/5 border border-white/10 text-cloud/70 text-sm font-semibold py-2.5 rounded-lg hover:bg-white/10 transition-colors">Cancel</button>
              <button onClick={() => setShowAddModal(false)} className="flex-1 bg-sky text-slate-dark text-sm font-bold py-2.5 rounded-lg hover:bg-sky/90 transition-colors">Create Event</button>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${typeColors[selectedEvent.type] || 'bg-white/5 text-cloud/50 border-white/10'}`}>
                {selectedEvent.type}
              </span>
              <button onClick={() => setSelectedEvent(null)} className="text-cloud/40 hover:text-cloud">
                <Icon name="XMarkIcon" size={20} variant="outline" />
              </button>
            </div>
            <h2 className="text-xl font-bold text-cloud mb-4">{selectedEvent.name}</h2>
            <div className="space-y-3 mb-5">
              {[
                { label: 'Date & Time', value: `${selectedEvent.date} at ${selectedEvent.time}`, icon: 'CalendarDaysIcon' },
                { label: 'Location', value: selectedEvent.location, icon: 'MapPinIcon' },
                { label: 'Capacity', value: `${selectedEvent.rsvp} / ${selectedEvent.capacity} attending`, icon: 'UsersIcon' },
                { label: 'Status', value: selectedEvent.status, icon: 'CheckCircleIcon' },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <Icon name={row.icon} size={14} variant="outline" className="text-cloud/30 flex-shrink-0" />
                  <span className="text-xs text-cloud/40 w-20">{row.label}</span>
                  <span className="text-sm text-cloud">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="bg-white/5 rounded-lg p-3 mb-5">
              <p className="text-xs text-cloud/40 mb-1">Description</p>
              <p className="text-sm text-cloud/70">{selectedEvent.description}</p>
            </div>
            <div className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-cloud/40">Attendance capacity</span>
                <span className="text-xs font-semibold text-cloud">{Math.round((selectedEvent.rsvp / selectedEvent.capacity) * 100)}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-sky rounded-full" style={{ width: `${Math.round((selectedEvent.rsvp / selectedEvent.capacity) * 100)}%` }} />
              </div>
            </div>
            <button onClick={() => setSelectedEvent(null)} className="w-full bg-sky text-slate-dark text-sm font-bold py-2.5 rounded-lg hover:bg-sky/90 transition-colors">Close</button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
