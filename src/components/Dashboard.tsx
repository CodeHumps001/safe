import React, { useState } from 'react';
import { HazardReport, UserProfile, RouteSafetyAnalysis } from '../types';
import { HAZARD_CONFIG, SEVERITY_CONFIG } from '../utils/hazardConfig';
import { calculateRouteSafetyScore } from '../services/geminiService';
import { Shield, Award, Users, AlertOctagon, TrendingUp, ChevronRight, MessageSquare, ThumbsUp, Map, Cpu, Send, Check, RefreshCw } from 'lucide-react';

interface DashboardProps {
  profile: UserProfile;
  reports: HazardReport[];
  notifications: any[];
  onSelectReport: (report: HazardReport) => void;
  onPlanRoute: (route: { lat: number; lng: number }[], grade: 'A' | 'B' | 'C' | 'D' | 'F') => void;
  onClearRoute: () => void;
  onUpvoteReport: (id: string) => void;
  onAddComment: (id: string, comment: string) => void;
}

// Preset route coordinates for simulation
const ACCRA_PRESET_ROUTES = {
  legon_to_osu: {
    name: 'Legon Main Gate ➔ Dankwah Circle, Osu',
    coords: [
      { lat: 5.6508, lng: -0.1870 },
      { lat: 5.6200, lng: -0.1730 },
      { lat: 5.5900, lng: -0.1810 },
      { lat: 5.5582, lng: -0.1982 } // Dankwah Circle
    ]
  },
  motorway_to_circle: {
    name: 'Tema Motorway Exit ➔ Kwame Nkrumah Circle',
    coords: [
      { lat: 5.6483, lng: -0.1122 },
      { lat: 5.6100, lng: -0.1500 },
      { lat: 5.5800, lng: -0.2000 },
      { lat: 5.5594, lng: -0.2241 } // Alajo Underpass / Circle Area
    ]
  }
};

export default function Dashboard({
  profile,
  reports,
  notifications,
  onSelectReport,
  onPlanRoute,
  onClearRoute,
  onUpvoteReport,
  onAddComment
}: DashboardProps) {
  const [selectedRouteKey, setSelectedRouteKey] = useState<string>('');
  const [routeAnalysis, setRouteAnalysis] = useState<RouteSafetyAnalysis | null>(null);
  const [isScoringRoute, setIsScoringRoute] = useState(false);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');

  const activeReports = reports.filter(r => r.status === 'active' || r.status === 'under_review');
  const criticalCount = activeReports.filter(r => r.severity === 'critical' || r.severity === 'high').length;

  const handleRouteScoring = async (key: string) => {
    if (!key) {
      onClearRoute();
      setRouteAnalysis(null);
      return;
    }
    
    setSelectedRouteKey(key);
    setIsScoringRoute(true);
    
    const selectedRoute = ACCRA_PRESET_ROUTES[key as keyof typeof ACCRA_PRESET_ROUTES];
    
    try {
      // Find active reports near this route path (simplified radius)
      const nearbyHazards = reports.filter(r => {
        // Just grab hazards that are high/critical for the demo
        return r.status === 'active';
      });

      const analysis = await calculateRouteSafetyScore(selectedRoute.coords, nearbyHazards);
      setRouteAnalysis(analysis);
      
      // Plot the route on the main map!
      onPlanRoute(selectedRoute.coords, analysis.grade);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScoringRoute(false);
    }
  };

  const handlePostComment = (reportId: string) => {
    if (!newCommentText.trim()) return;
    onAddComment(reportId, newCommentText);
    setNewCommentText('');
  };

  return (
    <div className="space-y-6" id="dashboard-deck">
      
      {/* 1. Profile Rank Greeting Widget (Bento Style) */}
      <div className="bento-card-gradient border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <div className="w-16 h-16 rounded-full border border-brand-gold flex items-center justify-center">
            <div className="w-4 h-4 bg-brand-gold rounded-full"></div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-gold/10 border border-brand-gold/25 flex items-center justify-center text-brand-gold text-3xl shadow-lg shadow-brand-gold/5">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-black tracking-tight text-2xl text-white">Akwaaba, {profile.name}!</h1>
              <span className="bg-brand-gold/15 border border-brand-gold/30 text-brand-gold text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                {profile.reputationLevel}
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Your safety contributions defend Ghanaian roads. District: <span className="text-slate-200 font-bold">{profile.district}</span>
            </p>
          </div>
        </div>

        {/* Reputation Progress bar */}
        <div className="w-full md:w-64 space-y-1.5 relative z-10">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">
            <span>Reputation PROGRESS</span>
            <span className="text-brand-gold font-mono">{profile.reputationPoints} / 1000 XP</span>
          </div>
          <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-white/10">
            <div className="h-full bg-gradient-to-r from-brand-green via-brand-gold to-brand-red rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{ width: `${(profile.reputationPoints / 1000) * 100}%` }} />
          </div>
          <p className="text-[9px] text-slate-500 text-right font-mono uppercase tracking-wider">320 XP to Platinum Tier</p>
        </div>
      </div>

      {/* 2. Key Metric Stat Cards (Bento Grid Style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bento-card-gradient border border-white/10 p-5 rounded-3xl shadow-xl flex flex-col justify-between">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">My Reports</div>
          <div className="text-3xl font-black tracking-tighter text-white font-mono">{profile.reportsSubmitted}</div>
          <div className="text-[10px] text-emerald-400 font-bold mt-2.5 flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Approved 100%
          </div>
        </div>

        <div className="bento-card-gradient border border-white/10 p-5 rounded-3xl shadow-xl flex flex-col justify-between">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Verified Rate</div>
          <div className="text-3xl font-black tracking-tighter text-brand-gold font-mono">
            {profile.reportsSubmitted > 0 ? ((profile.reportsVerified / profile.reportsSubmitted) * 100).toFixed(0) : 100}%
          </div>
          <div className="text-[10px] text-slate-400 mt-2.5">
            {profile.reportsVerified} reports verified
          </div>
        </div>

        <div className="bento-card-gradient border border-white/10 p-5 rounded-3xl shadow-xl flex flex-col justify-between">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Upvotes Received</div>
          <div className="text-3xl font-black tracking-tighter text-white font-mono">+{profile.upvotesReceived}</div>
          <div className="text-[10px] text-brand-gold font-bold mt-2.5 flex items-center gap-0.5">
            ★ Safe Commuter Medal
          </div>
        </div>

        <div className="bento-card-gradient border border-white/10 p-5 rounded-3xl shadow-xl flex flex-col justify-between">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Active Alerts</div>
          <div className="text-3xl font-black tracking-tighter text-brand-red font-mono">{activeReports.length}</div>
          <div className="text-[10px] text-brand-red font-bold mt-2.5 flex items-center gap-1">
            <AlertOctagon className="w-3.5 h-3.5 animate-pulse" /> {criticalCount} high risk
          </div>
        </div>
      </div>

      {/* 3. Star AI Feature: Real-time Route Safety Scorer (Bento Grid Style) */}
      <div className="bento-card-gradient border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-6 right-6 bg-brand-gold/10 border border-brand-gold/25 text-brand-gold font-mono text-[9px] px-3 py-1 rounded-full font-black uppercase flex items-center gap-1 shadow-sm">
          <Cpu className="w-3.5 h-3.5" />
          GEMINI AI COGNITION
        </div>

        <div className="max-w-xl">
          <p className="text-[9px] uppercase tracking-[0.2em] text-brand-gold font-bold mb-1">SAFETY PREDICTION ROUTER</p>
          <h2 className="font-display font-black tracking-tight text-xl text-white flex items-center gap-2">
            AI Commute Safety Grade Crawler
          </h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Planning a journey? Select an Accra thoroughfare to run our neural pavement damage inspector. Gemini compiles active potholes, washouts, and unlit segments to formulate Alternate Safety Grades.
          </p>
        </div>

        {/* Selection Input */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Select Connection</label>
            <select
              value={selectedRouteKey}
              onChange={(e) => handleRouteScoring(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-brand-gold cursor-pointer"
            >
              <option value="">-- Choose travel route --</option>
              {Object.entries(ACCRA_PRESET_ROUTES).map(([key, route]) => (
                <option key={key} value={key}>{route.name}</option>
              ))}
            </select>
          </div>

          {selectedRouteKey && (
            <div className="flex items-end pb-1">
              <button
                onClick={() => handleRouteScoring(selectedRouteKey)}
                className="bg-zinc-900 hover:bg-zinc-800 text-slate-200 text-xs font-semibold px-4 py-3 rounded-xl border border-white/10 flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScoringRoute ? 'animate-spin' : ''}`} />
                Recalculate route safety
              </button>
            </div>
          )}
        </div>

        {/* AI Route Scorer Results Panel */}
        {isScoringRoute && (
          <div className="bg-zinc-950 border border-brand-gold/30 rounded-2xl p-8 mt-6 text-center flex flex-col items-center justify-center space-y-3 shadow-2xl">
            <RefreshCw className="w-8 h-8 text-brand-gold animate-spin" />
            <div className="text-sm font-black uppercase tracking-wider text-brand-gold">Gemini scoring pavement anomalies...</div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">Analyzing distance intervals to active pothole grids and calculating seasonal washouts.</p>
          </div>
        )}

        {routeAnalysis && !isScoringRoute && (
          <div className="bg-zinc-950 rounded-2xl border border-white/10 p-5 mt-6 space-y-5 animate-fade-in shadow-2xl">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3.5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-display font-black text-3xl shadow-lg border ${
                  routeAnalysis.score >= 80
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10'
                    : routeAnalysis.score >= 60
                    ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 shadow-yellow-500/10'
                    : 'bg-red-500/10 text-brand-red border-red-500/30 shadow-red-500/10 animate-pulse'
                }`}>
                  {routeAnalysis.grade}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Route Safety Score: {routeAnalysis.score}%</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-mono uppercase tracking-wider">Computed from community records</div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">AI Safety Analysis Summary</div>
              <p className="text-xs text-slate-200 leading-relaxed italic">
                "{routeAnalysis.summary}"
              </p>
            </div>

            {routeAnalysis.criticalWarnings.length > 0 && (
              <div className="bg-brand-red/10 border border-brand-red/25 p-3.5 rounded-xl space-y-1 shadow-inner">
                <div className="text-xs font-bold text-brand-red flex items-center gap-1.5 uppercase tracking-wide">
                  <AlertOctagon className="w-4 h-4" />
                  Immediate Roadway Hazards Detected
                </div>
                {routeAnalysis.criticalWarnings.map((warning: any, idx) => {
                  let warningText = '';
                  if (typeof warning === 'string') {
                    warningText = warning;
                  } else if (warning && typeof warning === 'object') {
                    const label = warning.type ? warning.type.replace('_', ' ').toUpperCase() : 'HAZARD';
                    const loc = warning.locationName || warning.location || '';
                    const desc = warning.description || '';
                    warningText = `${label}${loc ? ' near ' + loc : ''}${desc ? ': ' + desc : ''}`;
                  } else {
                    warningText = String(warning);
                  }
                  return (
                    <p key={idx} className="text-[11px] text-slate-300 pl-5 leading-normal">• {warningText}</p>
                  );
                })}
              </div>
            )}

            <div className="space-y-2 pt-1">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Recommended Precautions</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {routeAnalysis.recommendations.map((rec: any, idx) => {
                  let recText = '';
                  if (typeof rec === 'string') {
                    recText = rec;
                  } else if (rec && typeof rec === 'object') {
                    recText = rec.recommendation || rec.tip || JSON.stringify(rec);
                  } else {
                    recText = String(rec);
                  }
                  return (
                    <div key={idx} className="bg-zinc-950 border border-white/10 p-3 rounded-xl flex items-start gap-2.5">
                      <span className="text-brand-gold font-bold text-xs mt-0.5">✓</span>
                      <p className="text-[11px] text-slate-300 leading-normal">{recText}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Active Road Hazards list (Bento Styled Cards) */}
      <div className="space-y-3">
        <h3 className="font-display font-black tracking-tight text-lg text-white">Active Regional Road Hazards</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeReports.map((report) => {
            const config = HAZARD_CONFIG[report.type];
            const severity = SEVERITY_CONFIG[report.severity];
            const isInspecting = activeReportId === report.id;

            return (
              <div
                key={report.id}
                className={`bg-zinc-950 border rounded-3xl transition-all shadow-md overflow-hidden ${
                  isInspecting ? 'border-brand-gold bg-zinc-950 shadow-2xl shadow-brand-gold/10' : 'border-white/10 hover:border-brand-gold/30'
                }`}
              >
                {/* Header */}
                <div className="p-5 flex gap-4 items-start">
                  <button
                    onClick={() => onSelectReport(report)}
                    className="w-12 h-12 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-center text-2xl hover:scale-110 active:scale-90 transition-transform flex-shrink-0"
                    title="Zoom in on Map"
                  >
                    {config.emoji}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-black text-sm text-slate-100 truncate">{config.label}</span>
                      <span className="text-[8px] px-2 py-0.5 rounded font-black uppercase tracking-wider" style={{ backgroundColor: severity.color + '20', color: severity.color }}>
                        {severity.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold truncate mt-1 uppercase tracking-wider">{report.locationName}</p>
                    <p className="text-xs text-slate-300 leading-relaxed mt-2.5 line-clamp-2">{report.description}</p>
                  </div>
                </div>

                {/* Report Action buttons */}
                <div className="bg-zinc-950 px-5 py-3 flex items-center justify-between border-t border-white/10 flex-wrap gap-2 text-[10px] font-bold text-slate-400">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => onUpvoteReport(report.id)}
                      className={`flex items-center gap-1.5 hover:text-brand-gold transition-colors ${report.userVoted === 'up' ? 'text-brand-gold font-bold' : ''}`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      Verify ({report.upvotes})
                    </button>
                    <button
                      onClick={() => setActiveReportId(isInspecting ? null : report.id)}
                      className="flex items-center gap-1.5 hover:text-slate-200 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Comments ({report.comments.length})
                    </button>
                  </div>
                  <span className="text-slate-500 font-mono text-[9px]">Reported {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {/* Inspecting comment Thread Panel */}
                {isInspecting && (
                  <div className="p-5 bg-zinc-950 border-t border-white/10 space-y-4 animate-fade-in">
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Discussion Thread</div>
                    
                    {report.comments.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-2">No comments posted yet. Help the community by providing status updates!</p>
                    ) : (
                      <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                        {report.comments.map((comment) => (
                          <div key={comment.id} className="bg-zinc-950 border border-white/10 p-3 rounded-2xl space-y-1">
                            <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
                              <span className="text-slate-200">{comment.userName} ({comment.userRole})</span>
                              <span className="text-slate-500 font-mono">{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Provide status update (e.g. water receded, road cleared...)"
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-gold"
                      />
                      <button
                        onClick={() => handlePostComment(report.id)}
                        className="bg-brand-gold hover:bg-amber-400 text-slate-950 p-2.5 rounded-xl transition-all cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
