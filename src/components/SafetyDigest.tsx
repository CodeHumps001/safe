import React, { useState } from 'react';
import { GHANA_DISTRICTS } from '../utils/seedData';
import { generateWeeklyDigest } from '../services/geminiService';
import { WeeklyDigest, HazardReport } from '../types';
import { FileText, Map, Cpu, TrendingUp, TrendingDown, RefreshCw, Calendar, BookOpen, AlertTriangle } from 'lucide-react';

interface SafetyDigestProps {
  reports: HazardReport[];
}

export default function SafetyDigest({ reports }: SafetyDigestProps) {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Accra Metropolitan (AMA)');
  const [digest, setDigest] = useState<WeeklyDigest | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateDigest = async (district: string) => {
    setSelectedDistrict(district);
    setIsGenerating(true);

    try {
      // Pass the hazards from that district
      const localHazards = reports.filter(r => r.locationName.includes(district.split(' ')[0]));
      const weeklyDigest = await generateWeeklyDigest(district, localHazards);
      setDigest(weeklyDigest);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Trigger default load on click
  React.useEffect(() => {
    handleGenerateDigest(selectedDistrict);
  }, []);

  return (
    <div className="space-y-6" id="safety-digest-panel">
      
      {/* Newspaper header */}
      <div className="bento-card-gradient border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="max-w-md">
          <p className="text-[9px] uppercase tracking-[0.2em] text-brand-gold font-bold mb-1">ACCRA CIVIC FORECASTS</p>
          <h1 className="font-display font-black tracking-tight text-2xl text-white flex items-center gap-2">
            <BookOpen className="text-brand-gold w-7 h-7" />
            AI District Safety Intel
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Generate customized seasonal summaries and threat bulletins compiled by our AI engine analyzing community hazard statistics.
          </p>
        </div>

        <div className="space-y-1.5 w-full md:w-64">
          <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Select Assembly / Area</label>
          <select
            value={selectedDistrict}
            onChange={(e) => handleGenerateDigest(e.target.value)}
            className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-brand-gold cursor-pointer"
          >
            {GHANA_DISTRICTS.map((dist) => (
              <option key={dist} value={dist}>{dist}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isGenerating && (
        <div className="bg-zinc-950 border border-white/5 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 animate-pulse">
          <RefreshCw className="w-10 h-10 text-brand-gold animate-spin" />
          <h3 className="text-sm font-black uppercase tracking-wider text-brand-gold">Compiling Regional Statistics...</h3>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">Gemini is processing rainfall telemetry and road construction updates to compile your safety bulletin.</p>
        </div>
      )}

      {/* Digest Output */}
      {digest && !isGenerating && (
        <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 shadow-2xl relative space-y-6 animate-fade-in">
          
          {/* Badge indicator */}
          <div className="absolute top-6 right-6 bg-brand-gold/10 border border-brand-gold/20 text-brand-gold font-mono text-[9px] px-3 py-1 rounded-full font-black uppercase flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5" />
            Gemini Synthesis Active
          </div>

          {/* Newspaper Masthead */}
          <div className="border-b-2 border-white/5 pb-5">
            <div className="flex items-center justify-between flex-wrap gap-2 text-slate-500 font-mono text-[9px] uppercase font-bold mb-1.5">
              <span className="flex items-center gap-1.5 tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                Week Ending: {new Date().toLocaleDateString('en-GH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span className="tracking-widest">Issue #16 — District Gazette</span>
            </div>
            <h2 className="font-display font-black text-xl md:text-3xl text-white tracking-tight leading-none mt-2">
              {digest.headline}
            </h2>
          </div>

          {/* Core Story Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 pb-2">Executive Summary</h3>
              <p className="text-slate-300 text-sm leading-relaxed first-letter:text-4xl first-letter:font-black first-letter:text-brand-gold first-letter:mr-2.5 first-letter:float-left">
                {digest.summary}
              </p>

              {/* District trends indicator */}
              <div className="bg-zinc-950 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-200">District Commute Trend</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Statistical risk variance compared to last week.</p>
                </div>

                <div className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider border ${
                  digest.trend === 'improving'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : digest.trend === 'stable'
                    ? 'bg-zinc-800 text-slate-300 border-white/5'
                    : 'bg-brand-red/10 text-brand-red border-brand-red/20 animate-pulse'
                }`}>
                  {digest.trend === 'improving' ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  {digest.trend}
                </div>
              </div>
            </div>

            {/* Top Regional Concerns list */}
            <div className="bg-zinc-950 border border-white/5 p-5 rounded-2xl space-y-3.5">
              <h3 className="text-[10px] font-black text-brand-red uppercase tracking-[0.2em] flex items-center gap-1.5 border-b border-white/5 pb-2">
                <AlertTriangle className="w-4 h-4" />
                Active District Risks
              </h3>
              <div className="space-y-2.5">
                {digest.topHazards.map((hazard: any, idx) => {
                  let hazardText = '';
                  if (typeof hazard === 'string') {
                    hazardText = hazard;
                  } else if (hazard && typeof hazard === 'object') {
                    const label = hazard.type ? hazard.type.replace('_', ' ').toUpperCase() : 'ROAD RISK';
                    const desc = hazard.description || hazard.summary || '';
                    hazardText = `${label}${desc ? ': ' + desc : ''}`;
                  } else {
                    hazardText = String(hazard);
                  }
                  return (
                    <div key={idx} className="flex gap-2.5 items-start">
                      <span className="w-5 h-5 rounded bg-zinc-900 border border-white/5 flex items-center justify-center font-mono font-black text-[10px] text-brand-red flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">{hazardText}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* District safety tips */}
          <div className="border-t border-white/5 pt-5 space-y-3">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Recommended Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {digest.safetyTips.map((tip: any, idx) => {
                let tipText = '';
                if (typeof tip === 'string') {
                  tipText = tip;
                } else if (tip && typeof tip === 'object') {
                  tipText = tip.tip || tip.recommendation || JSON.stringify(tip);
                } else {
                  tipText = String(tip);
                }
                return (
                  <div key={idx} className="bg-zinc-950/80 border border-white/5 p-4 rounded-2xl flex items-start gap-2.5">
                    <span className="text-brand-gold font-bold text-sm">✓</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{tipText}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
