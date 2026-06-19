'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

const demoRoles = [
  { label: 'Super Administrator', value: 'super_admin', description: 'Full system access' },
  { label: 'Pastor', value: 'pastor', description: 'Members, visitors, events, reports' },
  { label: 'Ministry Leader', value: 'ministry_leader', description: 'Ministry & team management' },
  { label: 'Prayer Team', value: 'prayer_team', description: 'Prayer request management' },
  { label: 'Church Member', value: 'member', description: 'Announcements, events, prayer' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('super_admin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    // Store role in sessionStorage for demo
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('church_role', selectedRole);
      sessionStorage.setItem('church_user', email);
    }
    setTimeout(() => {
      // Members go to member portal, all others go to dashboard
      if (selectedRole === 'member') {
        router.push('/member');
      } else {
        router.push('/dashboard');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-dark flex items-center justify-center p-4">
      {/* Background subtle pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-sky/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-sky/3 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky/10 border border-sky/20 mb-4">
            <Icon name="BuildingLibraryIcon" size={28} variant="outline" className="text-sky" />
          </div>
          <h1 className="text-2xl font-bold text-cloud tracking-tight">Church Connect</h1>
          <p className="text-cloud/40 text-sm mt-1">Church Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <h2 className="text-base font-semibold text-cloud mb-5">Sign in to your account</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-cloud/60 mb-1.5">Email address</label>
              <div className="relative">
                <Icon name="EnvelopeIcon" size={16} variant="outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-cloud/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pastor@church.org"
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:outline-none focus:border-sky/50 focus:bg-sky/5 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-cloud/60 mb-1.5">Password</label>
              <div className="relative">
                <Icon name="LockClosedIcon" size={16} variant="outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-cloud/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-10 py-2.5 text-sm text-cloud placeholder-cloud/20 focus:outline-none focus:border-sky/50 focus:bg-sky/5 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cloud/30 hover:text-cloud/60 transition-colors"
                >
                  <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={16} variant="outline" />
                </button>
              </div>
            </div>

            {/* Role selector (demo) */}
            <div>
              <label className="block text-xs font-medium text-cloud/60 mb-1.5">
                Sign in as <span className="text-sky/70">(demo — select role)</span>
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {demoRoles.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedRole(role.value)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-all ${
                      selectedRole === role.value
                        ? 'bg-sky/10 border-sky/30 text-sky' :'bg-white/3 border-white/8 text-cloud/50 hover:border-white/20 hover:text-cloud/70'
                    }`}
                  >
                    <span className="text-xs font-medium">{role.label}</span>
                    {selectedRole === role.value && (
                      <Icon name="CheckCircleIcon" size={14} variant="solid" className="text-sky flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                <Icon name="ExclamationCircleIcon" size={14} variant="outline" className="text-rose-400 flex-shrink-0" />
                <p className="text-xs text-rose-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky hover:bg-sky/90 disabled:bg-sky/40 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <Icon name="ArrowRightOnRectangleIcon" size={16} variant="outline" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-white/8">
            <p className="text-xs text-cloud/30 text-center">
              Forgot your password?{' '}
              <span className="text-sky/60 cursor-pointer hover:text-sky transition-colors">Contact your administrator</span>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-cloud/20 mt-6">
          Church Connect · Internal Management System
        </p>
      </div>
    </div>
  );
}
