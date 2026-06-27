import React from 'react';
import { Map, BarChart2, Trophy, BookOpen } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'map' | 'dashboard' | 'leaderboard' | 'digest';
  setActiveTab: (tab: 'map' | 'dashboard' | 'leaderboard' | 'digest') => void;
}

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0b]/95 border-t border-white/5 py-3.5 px-6 flex justify-around items-center z-[99] backdrop-blur-md shadow-2xl">
      <button
        onClick={() => setActiveTab('map')}
        className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
          activeTab === 'map' ? 'text-brand-gold font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Map className="w-5 h-5" />
        <span className="text-[9px] font-black tracking-wider uppercase font-mono">Map</span>
      </button>

      <button
        onClick={() => setActiveTab('dashboard')}
        className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
          activeTab === 'dashboard' ? 'text-brand-gold font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <BarChart2 className="w-5 h-5" />
        <span className="text-[9px] font-black tracking-wider uppercase font-mono">Dashboard</span>
      </button>

      <button
        onClick={() => setActiveTab('leaderboard')}
        className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
          activeTab === 'leaderboard' ? 'text-brand-gold font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Trophy className="w-5 h-5" />
        <span className="text-[9px] font-black tracking-wider uppercase font-mono">Leaders</span>
      </button>

      <button
        onClick={() => setActiveTab('digest')}
        className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
          activeTab === 'digest' ? 'text-brand-gold font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <BookOpen className="w-5 h-5" />
        <span className="text-[9px] font-black tracking-wider uppercase font-mono">Digests</span>
      </button>
    </div>
  );
}
