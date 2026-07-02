'use client';

import React, { useState } from 'react';
import AppShell from '@/components/AppShell';
import Icon from '@/components/ui/AppIcon';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const memberGrowthData = [
  { month: 'Jan', members: 298, visitors: 22 },
  { month: 'Feb', members: 305, visitors: 18 },
  { month: 'Mar', members: 312, visitors: 25 },
  { month: 'Apr', members: 318, visitors: 20 },
  { month: 'May', members: 328, visitors: 31 },
  { month: 'Jun', members: 342, visitors: 18 },
];

const attendanceData = [
  { week: 'W1 May', attendance: 210 },
  { week: 'W2 May', attendance: 195 },
  { week: 'W3 May', attendance: 225 },
  { week: 'W4 May', attendance: 218 },
  { week: 'W1 Jun', attendance: 230 },
  { week: 'W2 Jun', attendance: 245 },
];

const ministryData = [
  { name: 'Worship', members: 24 },
  { name: 'Youth', members: 38 },
  { name: "Children\'s", members: 18 },
  { name: 'Media', members: 12 },
  { name: 'Hospitality', members: 20 },
  { name: 'Outreach', members: 15 },
];

const prayerStats = [
  { name: 'New', value: 8, color: '#C5A073' },
  { name: 'Assigned', value: 6, color: '#D9B985' },
  { name: 'In Prayer', value: 9, color: '#8A7340' },
  { name: 'Answered', value: 4, color: '#D4BC94' },
];

const visitorConversionData = [
  { stage: 'New Visitor', count: 18 },
  { stage: 'Contacted', count: 14 },
  { stage: 'Follow-Up', count: 10 },
  { stage: 'Regular', count: 7 },
  { stage: 'Candidate', count: 4 },
  { stage: 'Member', count: 2 },
];

const kpiCards = [
  { label: 'Total Members', value: '342', sub: '+14 this quarter', icon: 'UsersIcon', color: 'sky' },
  { label: 'Active Members', value: '298', sub: '87% active rate', icon: 'UserCircleIcon', color: 'emerald' },
  { label: 'New Visitors (Jun)', value: '18', sub: '+5 vs last month', icon: 'UserPlusIcon', color: 'amber' },
  { label: 'Conversion Rate', value: '11%', sub: 'Visitor → Member', icon: 'ArrowTrendingUpIcon', color: 'purple' },
  { label: 'Events This Month', value: '9', sub: '3 upcoming', icon: 'CalendarDaysIcon', color: 'rose' },
  { label: 'Follow-Up Rate', value: '78%', sub: 'Completed on time', icon: 'CheckCircleIcon', color: 'teal' },
];

const colorMap: Record<string, string> = {
  sky: 'bg-ckc-gold/10 text-ckc-gold',
  emerald: 'bg-ckc-gold/10 text-ckc-gold',
  amber: 'bg-ckc-gold/10 text-ckc-gold',
  purple: 'bg-ckc-gold/10 text-ckc-gold',
  rose: 'bg-ckc-gold/10 text-ckc-gold',
  teal: 'bg-ckc-gold/10 text-ckc-gold',
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-ckc-black border border-white/15 rounded-lg px-3 py-2 text-xs">
        <p className="text-cloud/60 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'visitors' | 'events'>('overview');

  return (
    <AppShell access="staff">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cloud tracking-tight">Reports & Analytics</h1>
          <p className="text-cloud/40 text-sm mt-1">Church health metrics and activity overview</p>
        </div>
        <button className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-ckc-gold/30 text-cloud/70 hover:text-cloud text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
          <Icon name="ArrowDownTrayIcon" size={15} variant="outline" />
          Export
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 mb-6 w-fit">
        {(['overview', 'members', 'visitors', 'events'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
              activeTab === tab ? 'bg-ckc-gold text-white' : 'text-cloud/50 hover:text-cloud'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-ckc-gold/20 transition-colors">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${colorMap[kpi.color]}`}>
              <Icon name={kpi.icon} size={15} variant="outline" />
            </div>
            <p className="text-xl font-bold text-cloud font-mono">{kpi.value}</p>
            <p className="text-xs text-cloud/40 mt-0.5 leading-tight">{kpi.label}</p>
            <p className="text-xs text-ckc-gold mt-1 font-medium">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Member Growth */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-cloud mb-4">Member Growth (6 months)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={memberGrowthData}>
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="members" stroke="#C5A073" strokeWidth={2} dot={{ fill: '#C5A073', r: 3 }} name="Members" />
              <Line type="monotone" dataKey="visitors" stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B', r: 3 }} name="Visitors" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Attendance */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-cloud mb-4">Weekly Attendance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={attendanceData}>
              <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="attendance" fill="#C5A073" radius={[4, 4, 0, 0]} name="Attendance" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Ministry Participation */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-cloud mb-4">Ministry Participation</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ministryData} layout="vertical">
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="members" fill="#A855F7" radius={[0, 4, 4, 0]} name="Members" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Prayer Requests */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-cloud mb-4">Prayer Requests</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={prayerStats} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {prayerStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {prayerStats.map((stat) => (
              <div key={stat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }} />
                  <span className="text-cloud/50">{stat.name}</span>
                </div>
                <span className="text-cloud font-semibold font-mono">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visitor Conversion Funnel */}
      <div className="mt-5 bg-white/5 border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-cloud mb-4">Visitor Conversion Funnel</h3>
        <div className="flex items-end gap-2 h-32">
          {visitorConversionData.map((stage, i) => {
            const maxCount = visitorConversionData[0].count;
            const heightPct = (stage.count / maxCount) * 100;
            return (
              <div key={stage.stage} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-cloud font-mono">{stage.count}</span>
                <div
                  className="w-full rounded-t-md transition-all"
                  style={{
                    height: `${heightPct}%`,
                    backgroundColor: `rgba(197, 160, 115, ${0.3 + (i / visitorConversionData.length) * 0.7})`,
                  }}
                />
                <span className="text-xs text-cloud/40 text-center leading-tight" style={{ fontSize: '10px' }}>{stage.stage}</span>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
