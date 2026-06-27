import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import MapContainer from './components/MapContainer';
import Dashboard from './components/Dashboard';
import Leaderboard from './components/Leaderboard';
import SafetyDigest from './components/SafetyDigest';
import ReportForm from './components/ReportForm';
import { HazardReport, UserProfile, LeaderboardUser, Notification } from './types';
import { MOCK_REPORTS, MOCK_PROFILE, MOCK_NOTIFICATIONS, MOCK_LEADERBOARD } from './utils/seedData';
import { ShieldAlert, AlertTriangle, HelpCircle, Check, Send, AlertOctagon, PlusCircle, ArrowLeft } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'dashboard' | 'leaderboard' | 'digest'>('map');
  const [reports, setReports] = useState<HazardReport[]>([]);
  const [profile, setProfile] = useState<UserProfile>(MOCK_PROFILE);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

  // Map & Reporting Coordinates State
  const [selectedReport, setSelectedReport] = useState<HazardReport | null>(null);
  const [isReportingMode, setIsReportingMode] = useState(false);
  const [reportingCoords, setReportingCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [activeRoute, setActiveRoute] = useState<{ lat: number; lng: number }[] | null>(null);
  const [routeSafetyGrade, setRouteSafetyGrade] = useState<'A' | 'B' | 'C' | 'D' | 'F' | undefined>(undefined);

  // Initialize and load from LocalStorage
  useEffect(() => {
    const cachedReports = localStorage.getItem('saferoute_reports');
    const cachedProfile = localStorage.getItem('saferoute_profile');
    const cachedNotifications = localStorage.getItem('saferoute_notifications');
    const cachedLeaderboard = localStorage.getItem('saferoute_leaderboard');

    // 1. Validate Reports
    if (cachedReports) {
      try {
        const parsed = JSON.parse(cachedReports);
        if (Array.isArray(parsed)) {
          // A valid report must have an id, type, severity, locationName, and description
          const validReports = parsed.filter(
            (r: any) =>
              r &&
              typeof r === 'object' &&
              typeof r.id === 'string' &&
              typeof r.type === 'string' &&
              typeof r.severity === 'string' &&
              typeof r.locationName === 'string' &&
              typeof r.description === 'string'
          );
          if (validReports.length > 0) {
            setReports(validReports);
          } else {
            setReports(MOCK_REPORTS);
            localStorage.setItem('saferoute_reports', JSON.stringify(MOCK_REPORTS));
          }
        } else {
          setReports(MOCK_REPORTS);
          localStorage.setItem('saferoute_reports', JSON.stringify(MOCK_REPORTS));
        }
      } catch (err) {
        setReports(MOCK_REPORTS);
        localStorage.setItem('saferoute_reports', JSON.stringify(MOCK_REPORTS));
      }
    } else {
      setReports(MOCK_REPORTS);
      localStorage.setItem('saferoute_reports', JSON.stringify(MOCK_REPORTS));
    }

    // 2. Validate Profile
    if (cachedProfile) {
      try {
        const parsed = JSON.parse(cachedProfile);
        if (parsed && typeof parsed === 'object' && typeof parsed.name === 'string') {
          setProfile(parsed);
        } else {
          setProfile(MOCK_PROFILE);
          localStorage.setItem('saferoute_profile', JSON.stringify(MOCK_PROFILE));
        }
      } catch (err) {
        setProfile(MOCK_PROFILE);
        localStorage.setItem('saferoute_profile', JSON.stringify(MOCK_PROFILE));
      }
    } else {
      setProfile(MOCK_PROFILE);
      localStorage.setItem('saferoute_profile', JSON.stringify(MOCK_PROFILE));
    }

    // 3. Validate Notifications
    if (cachedNotifications) {
      try {
        const parsed = JSON.parse(cachedNotifications);
        if (Array.isArray(parsed)) {
          const validNotifications = parsed.filter(
            (n: any) => n && typeof n === 'object' && typeof n.id === 'string' && typeof n.message === 'string'
          );
          setNotifications(validNotifications);
        } else {
          setNotifications(MOCK_NOTIFICATIONS);
          localStorage.setItem('saferoute_notifications', JSON.stringify(MOCK_NOTIFICATIONS));
        }
      } catch (err) {
        setNotifications(MOCK_NOTIFICATIONS);
        localStorage.setItem('saferoute_notifications', JSON.stringify(MOCK_NOTIFICATIONS));
      }
    } else {
      setNotifications(MOCK_NOTIFICATIONS);
      localStorage.setItem('saferoute_notifications', JSON.stringify(MOCK_NOTIFICATIONS));
    }

    // 4. Validate Leaderboard
    if (cachedLeaderboard) {
      try {
        const parsed = JSON.parse(cachedLeaderboard);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLeaderboard(parsed);
        } else {
          setLeaderboard(MOCK_LEADERBOARD);
          localStorage.setItem('saferoute_leaderboard', JSON.stringify(MOCK_LEADERBOARD));
        }
      } catch (err) {
        setLeaderboard(MOCK_LEADERBOARD);
        localStorage.setItem('saferoute_leaderboard', JSON.stringify(MOCK_LEADERBOARD));
      }
    } else {
      setLeaderboard(MOCK_LEADERBOARD);
      localStorage.setItem('saferoute_leaderboard', JSON.stringify(MOCK_LEADERBOARD));
    }
  }, []);

  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Upvote / Verify a report
  const handleUpvoteReport = (id: string) => {
    const updatedReports = reports.map((r) => {
      if (r.id === id) {
        let voteChange = 0;
        let nextVotedState: 'up' | 'down' | null = null;

        if (r.userVoted === 'up') {
          voteChange = -1;
          nextVotedState = null;
        } else {
          voteChange = r.userVoted === 'down' ? 2 : 1;
          nextVotedState = 'up';
        }

        return {
          ...r,
          upvotes: r.upvotes + voteChange,
          userVoted: nextVotedState,
        };
      }
      return r;
    });

    setReports(updatedReports);
    saveToStorage('saferoute_reports', updatedReports);
  };

  // Add Comment on report
  const handleAddComment = (reportId: string, content: string) => {
    const updatedReports = reports.map((r) => {
      if (r.id === reportId) {
        const newComment = {
          id: `comment-${Date.now()}`,
          reportId,
          userName: profile.name,
          userRole: profile.role,
          content,
          createdAt: new Date().toISOString(),
        };
        return {
          ...r,
          comments: [...r.comments, newComment],
        };
      }
      return r;
    });

    setReports(updatedReports);
    saveToStorage('saferoute_reports', updatedReports);
  };

  // Handle new Hazard report submission
  const handleAddReport = (newReportData: any) => {
    const newReport: HazardReport = {
      id: `report-${Date.now()}`,
      type: newReportData.type,
      severity: newReportData.severity,
      latitude: newReportData.latitude,
      longitude: newReportData.longitude,
      locationName: newReportData.locationName,
      description: newReportData.description,
      isBlockingTraffic: newReportData.isBlockingTraffic,
      reporterName: profile.name,
      reporterRole: profile.role,
      reporterReputation: profile.reputationPoints,
      upvotes: 0,
      downvotes: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      comments: [],
      photoUrl: newReportData.photoUrl,
      aiAnalyzed: newReportData.aiAnalyzed,
      aiAnalysisResult: newReportData.aiAnalysisResult
    };

    const updatedReports = [newReport, ...reports];
    setReports(updatedReports);
    saveToStorage('saferoute_reports', updatedReports);

    // Gamification: Update user profile stats & reputation XP (+10 Points!)
    const xpGained = 10;
    const nextPoints = profile.reputationPoints + xpGained;
    let nextLevel = profile.reputationLevel;
    if (nextPoints >= 1000) nextLevel = 'Platinum';
    else if (nextPoints >= 500) nextLevel = 'Gold';
    else if (nextPoints >= 100) nextLevel = 'Silver';

    const updatedProfile: UserProfile = {
      ...profile,
      reportsSubmitted: profile.reportsSubmitted + 1,
      reputationPoints: nextPoints,
      reputationLevel: nextLevel,
    };
    setProfile(updatedProfile);
    saveToStorage('saferoute_profile', updatedProfile);

    // Update Leaderboard dynamically so user instantly sees themselves climb!
    const updatedLeaderboard = leaderboard.map((user) => {
      if (user.name === profile.name) {
        return {
          ...user,
          reportsSubmitted: user.reportsSubmitted + 1,
          score: nextPoints,
          level: nextLevel,
        };
      }
      return user;
    }).sort((a, b) => b.score - a.score);

    // Re-index ranks
    const reindexedLeaderboard = updatedLeaderboard.map((user, idx) => ({
      ...user,
      rank: idx + 1,
    }));
    setLeaderboard(reindexedLeaderboard);
    saveToStorage('saferoute_leaderboard', reindexedLeaderboard);

    // Trigger Success Notification alert
    const newNotification: Notification = {
      id: `notif-${Date.now()}`,
      title: 'XP Awarded! 🛡️',
      message: `Thanks for reporting! You received +10 Reputation points. Keep up the high citizenship!`,
      type: 'success',
      createdAt: new Date().toISOString(),
      read: false,
    };
    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    saveToStorage('saferoute_notifications', updatedNotifications);

    // Complete flow
    setIsReportingMode(false);
    setReportingCoords(null);
    setActiveTab('map');
    setSelectedReport(newReport);
  };

  // Clear notifications
  const handleClearNotifications = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveToStorage('saferoute_notifications', updated);
  };

  const handleSelectCoordsFromMap = (coords: { lat: number; lng: number }) => {
    setReportingCoords(coords);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col font-sans text-slate-100 pb-16 md:pb-0" id="saferoute-root">
      
      {/* Brand Header */}
      <Navbar
        profile={profile}
        notifications={notifications}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          // If moving away from map, clear route overlay
          if (tab !== 'map') {
            setActiveRoute(null);
            setRouteSafetyGrade(undefined);
          }
        }}
        onClearNotifications={handleClearNotifications}
      />

      {/* Main Panel Content Splitter */}
      <main className="flex-1 flex flex-col md:flex-row relative overflow-hidden h-[calc(100vh-73px-64px)] md:h-[calc(100vh-73px)]">
        
        {/* Dynamic Sidebar / Tab view switcher */}
        <div className={`flex-1 md:w-[480px] md:max-w-xl md:flex-shrink-0 bg-[#0a0a0b] border-r border-white/5 p-4 md:p-6 overflow-y-auto h-full ${
          activeTab === 'map' && !isReportingMode ? 'hidden md:block' : 'block'
        }`}>
          {isReportingMode ? (
            <ReportForm
              onAddReport={handleAddReport}
              onCancel={() => {
                setIsReportingMode(false);
                setReportingCoords(null);
              }}
              selectedCoords={reportingCoords}
            />
          ) : (
            <>
              {activeTab === 'map' && (
                <div className="space-y-6">
                  {/* Floating CTA to launch report form */}
                  <div className="bento-card-gradient border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-30">
                      <div className="w-10 h-10 rounded-full border border-brand-gold/30 flex items-center justify-center">
                        <div className="w-2 h-2 bg-brand-gold rounded-full animate-ping"></div>
                      </div>
                    </div>
                    <div className="relative z-10">
                      <p className="text-[9px] uppercase tracking-[0.2em] text-brand-gold font-bold mb-1">CIVIC MONITOR INTAKE</p>
                      <h3 className="font-display font-black tracking-tight text-xl text-slate-100 flex items-center gap-1.5">
                        <PlusCircle className="w-5 h-5 text-brand-gold" />
                        Pavement Intelligence
                      </h3>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        Observe a pothole, flooding, or construction? Submit location coordinates, attach a photo, and verify alerts to safeguard delivery riders and transit drivers.
                      </p>
                      
                      <div className="mt-5 flex flex-wrap gap-2.5">
                        <button
                          onClick={() => {
                            setIsReportingMode(true);
                            // Default to center of Accra if no coords
                            setReportingCoords({ lat: 5.6037, lng: -0.1870 });
                          }}
                          className="bg-brand-gold hover:bg-amber-400 text-slate-950 text-[10px] uppercase tracking-widest font-black px-5 py-3 rounded-xl shadow-lg shadow-brand-gold/10 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                        >
                          📍 Spot-pick on Map
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tiny instructions panel */}
                  <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-5 space-y-3 text-slate-400 text-xs leading-relaxed">
                    <div className="font-black text-brand-gold uppercase tracking-[0.2em] text-[9px] flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Map Operations guide
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-300">
                      • <strong className="text-white">Tap community markers</strong> to inspect real-time AI computer vision logs, verify alerts, and check district warnings.
                    </p>
                    <p className="text-[11px] leading-relaxed text-slate-300">
                      • <strong className="text-white">Double-click directly</strong> on any section of the asphalt map coordinates to drop a pin and launch the report builder instantly.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'dashboard' && (
                <Dashboard
                  profile={profile}
                  reports={reports}
                  notifications={notifications}
                  onSelectReport={(report) => {
                    setSelectedReport(report);
                    setActiveTab('map');
                  }}
                  onPlanRoute={(route, grade) => {
                    setActiveRoute(route);
                    setRouteSafetyGrade(grade);
                    setActiveTab('map');
                  }}
                  onClearRoute={() => {
                    setActiveRoute(null);
                    setRouteSafetyGrade(undefined);
                  }}
                  onUpvoteReport={handleUpvoteReport}
                  onAddComment={handleAddComment}
                />
              )}

              {activeTab === 'leaderboard' && (
                <Leaderboard users={leaderboard} />
              )}

              {activeTab === 'digest' && (
                <SafetyDigest reports={reports} />
              )}
            </>
          )}
        </div>

        {/* Full-width Map canvas wrapper */}
        <div className={`flex-1 h-full relative ${
          activeTab === 'map' || isReportingMode ? 'block' : 'hidden md:block'
        }`}>
          {isReportingMode && (
            <div className="absolute top-4 left-4 z-[99] pointer-events-auto bg-brand-gold text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-fade-in-right">
              <AlertOctagon className="w-4 h-4 animate-spin-slow" />
              Double click on the road map surface to drop a hazard pin!
            </div>
          )}

          <MapContainer
            reports={reports}
            selectedReport={selectedReport}
            onSelectReport={(report) => {
              setSelectedReport(report);
              // Make sure we highlight comment block if needed
            }}
            isReportingMode={isReportingMode}
            reportingCoords={reportingCoords}
            onSelectCoords={handleSelectCoordsFromMap}
            activeRoute={activeRoute}
            routeSafetyGrade={routeSafetyGrade}
          />
        </div>
      </main>

      {/* Touch Bottom Navigator Bar (Only on Mobile) */}
      <BottomNav activeTab={activeTab} setActiveTab={(tab) => {
        setActiveTab(tab);
        if (tab !== 'map') {
          setActiveRoute(null);
          setRouteSafetyGrade(undefined);
        }
      }} />
    </div>
  );
}
