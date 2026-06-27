export type HazardType =
  | 'pothole'
  | 'flooded_road'
  | 'accident'
  | 'broken_traffic_light'
  | 'broken_street_light'
  | 'fallen_tree'
  | 'construction'
  | 'heavy_traffic'
  | 'unsafe_area';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Comment {
  id: string;
  reportId: string;
  userName: string;
  userRole: string;
  content: string;
  createdAt: string;
}

export interface HazardReport {
  id: string;
  type: HazardType;
  severity: SeverityLevel;
  latitude: number;
  longitude: number;
  locationName: string;
  description: string;
  isBlockingTraffic: boolean;
  reporterName: string;
  reporterRole: string;
  reporterReputation: number;
  upvotes: number;
  downvotes: number;
  userVoted?: 'up' | 'down' | null;
  status: 'active' | 'under_review' | 'resolved';
  photoUrl?: string;
  createdAt: string;
  comments: Comment[];
  aiAnalyzed?: boolean;
  aiAnalysisResult?: {
    hazardType: HazardType;
    severity: SeverityLevel;
    confidence: number;
    description: string;
    safetyWarning: string;
    recommendations: string[];
  };
}

export interface UserProfile {
  name: string;
  email: string;
  role: 'student' | 'commuter' | 'driver' | 'rider' | 'responder' | 'authority';
  district: string;
  reputationPoints: number;
  reputationLevel: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  joinedDate: string;
  reportsSubmitted: number;
  reportsVerified: number;
  upvotesReceived: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'critical';
  createdAt: string;
  read: boolean;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  role: string;
  district: string;
  reportsSubmitted: number;
  reportsVerified: number;
  score: number;
  level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
}

export interface WeeklyDigest {
  district: string;
  headline: string;
  summary: string;
  topHazards: string[];
  safetyTips: string[];
  trend: 'improving' | 'stable' | 'worsening';
  generatedAt: string;
}

export interface RouteSafetyAnalysis {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  summary: string;
  recommendations: string[];
  criticalWarnings: string[];
  analyzedRoute: { lat: number; lng: number }[];
}
