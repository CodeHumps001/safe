import React from 'react';
import { LeaderboardUser } from '../types';
import { Trophy, Medal, Award, Flame, ShieldAlert, Sparkles, User } from 'lucide-react';

interface LeaderboardProps {
  users: LeaderboardUser[];
  currentUserEmail?: string;
}

export default function Leaderboard({ users, currentUserEmail }: LeaderboardProps) {
  return (
    <div className="space-y-6" id="leaderboard-panel">
      {/* Hero Header */}
      <div className="bento-card-gradient border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="max-w-md">
          <p className="text-[9px] uppercase tracking-[0.2em] text-brand-gold font-bold mb-1">CIVIC CONTRIBUTION RANKINGS</p>
          <h1 className="font-display font-black tracking-tight text-2xl text-white flex items-center gap-2">
            <Trophy className="text-brand-gold w-7 h-7" />
            Ghana Civic Safety Champions
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Every verified report patches a road, guides emergency transit, and guards lives. Earn reputation points to level up and win district awards.
          </p>
        </div>
        <div className="bg-brand-gold/10 border border-brand-gold/30 text-brand-gold font-mono text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-2xl flex items-center gap-2 font-black shadow-sm">
          <Flame className="w-4 h-4" />
          Kofi Mensah: Gold Guardian
        </div>
      </div>

      {/* Top 3 podium display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {users.slice(0, 3).map((user, idx) => {
          const podiumColors = [
            { bg: 'from-brand-gold/15 to-zinc-950/40 border-brand-gold/30', medal: '🥇', text: 'text-brand-gold', label: '1st Champion' },
            { bg: 'from-slate-400/15 to-zinc-950/40 border-slate-400/30', medal: '🥈', text: 'text-slate-300', label: '2nd Contributor' },
            { bg: 'from-amber-700/15 to-zinc-950/40 border-amber-700/30', medal: '🥉', text: 'text-amber-600', label: '3rd Guard' }
          ][idx];

          return (
            <div
              key={user.name}
              className={`bg-gradient-to-b ${podiumColors.bg} border rounded-3xl p-6 text-center flex flex-col items-center justify-center space-y-4 shadow-xl relative`}
            >
              <div className="absolute top-4 right-4 text-[9px] font-black font-mono tracking-widest text-slate-500 uppercase">
                {podiumColors.label}
              </div>
              <div className="w-14 h-14 rounded-full bg-zinc-950 flex items-center justify-center text-3xl shadow-lg border border-white/10">
                {podiumColors.medal}
              </div>
              <div>
                <h3 className="font-display font-black text-base text-slate-100">{user.name}</h3>
                <span className="text-[9px] bg-zinc-950 border border-white/10 text-slate-300 px-3 py-1 rounded-full font-mono mt-2 inline-block uppercase tracking-wider">
                  {user.role} • {user.district.split(' ')[0]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full border-t border-white/10 pt-4 text-[9px] font-black uppercase tracking-wider text-slate-500">
                <div>
                  <span>Verified Reports</span>
                  <div className="text-base font-mono font-black tracking-tight text-slate-200 mt-1">{user.reportsVerified}</div>
                </div>
                <div>
                  <span>Reputation XP</span>
                  <div className={`text-base font-mono font-black tracking-tight ${podiumColors.text} mt-1`}>{user.score}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Leaderboard Table */}
      <div className="bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-300">Contribution Leaderboard</span>
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Rankings update in real-time</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#050506]/50 text-slate-500 uppercase tracking-wider text-[9px] font-black border-b border-white/10">
              <tr>
                <th className="p-4 w-16 text-center">Rank</th>
                <th className="p-4">Safety Agent</th>
                <th className="p-4 hidden md:table-cell">District Location</th>
                <th className="p-4 text-center">Submitted</th>
                <th className="p-4 text-center">Verified</th>
                <th className="p-4 text-right pr-6">Score (XP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 font-semibold text-slate-200">
              {users.map((user) => {
                const isCurrentUser = user.name === 'Kofi Mensah';
                
                return (
                  <tr
                    key={user.name}
                    className={`hover:bg-white/5 transition-colors ${
                      isCurrentUser ? 'bg-brand-gold/10 hover:bg-brand-gold/15 border-l-4 border-l-brand-gold' : ''
                    }`}
                  >
                    <td className="p-4 text-center font-mono font-black text-slate-400">
                      {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : `#${user.rank}`}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl bg-zinc-950 flex items-center justify-center text-xs border border-white/10 ${isCurrentUser ? 'text-brand-gold font-bold' : 'text-slate-400'}`}>
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-200 flex items-center gap-2">
                            {user.name}
                            {isCurrentUser && (
                              <span className="bg-brand-gold/10 text-brand-gold text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] text-slate-400 uppercase tracking-wider font-mono">{user.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell text-slate-400">
                      {user.district}
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-slate-300">{user.reportsSubmitted}</td>
                    <td className="p-4 text-center font-mono font-bold text-emerald-400">{user.reportsVerified}</td>
                    <td className="p-4 text-right pr-6 font-mono font-black text-brand-gold">{user.score}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
