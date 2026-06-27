import React, { useState } from 'react';
import { Shield, Bell, Award, User, Layers, LogOut, Check } from 'lucide-react';
import { UserProfile, Notification } from '../types';

interface NavbarProps {
  profile: UserProfile;
  notifications: Notification[];
  activeTab: 'map' | 'dashboard' | 'leaderboard' | 'digest';
  setActiveTab: (tab: 'map' | 'dashboard' | 'leaderboard' | 'digest') => void;
  onClearNotifications: () => void;
}

export default function Navbar({
  profile,
  notifications,
  activeTab,
  setActiveTab,
  onClearNotifications
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <nav className="bg-[#0a0a0b]/90 border-b border-white/5 sticky top-0 z-[100] backdrop-blur-md px-6 py-4 flex items-center justify-between" id="navbar-deck">
      
      {/* Brand logo */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('map')}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-green via-brand-gold to-brand-red flex items-center justify-center p-0.5 shadow-md shadow-amber-500/10">
          <div className="w-full h-full bg-[#0a0a0b] rounded-[10px] flex items-center justify-center">
            <Shield className="w-5 h-5 text-brand-gold" />
          </div>
        </div>
        <div>
          <span className="font-display font-black text-base tracking-tight text-white block leading-none">
            SafeRoute <span className="text-brand-gold">Ghana</span>
          </span>
          <span className="text-[9px] text-slate-400 tracking-wider font-semibold font-mono uppercase mt-0.5 block leading-none">
            Civic Pothole & Flood Safety
          </span>
        </div>
      </div>

      {/* Tabs navigation - Desktop */}
      <div className="hidden md:flex items-center gap-1.5 bg-zinc-900 border border-white/5 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab('map')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'map' ? 'bg-zinc-800 text-brand-gold shadow-inner border border-white/5' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <span>🗺️</span> Interactive Map
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'dashboard' ? 'bg-zinc-800 text-brand-gold shadow-inner border border-white/5' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <span>📊</span> Dashboard
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'leaderboard' ? 'bg-zinc-800 text-brand-gold shadow-inner border border-white/5' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <span>🏆</span> Leaderboard
        </button>
        <button
          onClick={() => setActiveTab('digest')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'digest' ? 'bg-zinc-800 text-brand-gold shadow-inner border border-white/5' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <span>📰</span> AI Safety Digests
        </button>
      </div>

      {/* Action panel (Notifications & Profile avatar dropdown) */}
      <div className="flex items-center gap-4 relative">
        
        {/* Notifications bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-slate-300 hover:text-white transition-all relative active:scale-95"
            title="Notification Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-red rounded-full text-[8px] font-bold font-mono text-white flex items-center justify-center animate-bounce border border-slate-950">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications dropdown panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-zinc-900 border border-white/5 rounded-2xl shadow-2xl p-4 z-[999] backdrop-blur-lg animate-fade-in">
              <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-2 flex-wrap gap-2">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Alert Center</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => {
                      onClearNotifications();
                      setShowNotifications(false);
                    }}
                    className="text-[9px] font-bold text-brand-gold hover:text-amber-400 flex items-center gap-1 uppercase transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" /> Mark read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic py-4 text-center">No notifications present.</p>
              ) : (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl border flex flex-col gap-1 text-[11px] leading-snug transition-all ${
                        n.read
                          ? 'bg-[#0a0a0b]/40 border-white/5 text-slate-400'
                          : 'bg-white/5 border-brand-gold/20 text-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between gap-2 items-start font-bold">
                        <span>{n.title}</span>
                        <span className="text-[8px] text-slate-500 font-mono flex-shrink-0">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 font-normal leading-relaxed">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Avatar Indicator */}
        <div className="flex items-center gap-2.5 border-l border-white/5 pl-4 hidden sm:flex">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-xs font-bold text-brand-gold font-mono shadow-sm">
            KM
          </div>
          <div className="text-left">
            <span className="block font-bold text-xs text-slate-200 leading-none">{profile.name}</span>
            <span className="text-[9px] text-slate-400 font-mono capitalize block leading-none mt-1">{profile.role}</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
