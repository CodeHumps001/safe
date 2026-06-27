import { HazardType, SeverityLevel } from '../types';

export interface HazardConfigDetail {
  label: string;
  emoji: string;
  color: string; // Tailwind bg-class or hex
  textClass: string;
  bgClass: string;
  markerColor: string;
  description: string;
}

export const HAZARD_CONFIG: Record<HazardType, HazardConfigDetail> = {
  pothole: {
    label: 'Pothole',
    emoji: '🕳️',
    color: '#F97316', // Orange
    textClass: 'text-orange-500',
    bgClass: 'bg-orange-500/10 border-orange-500/20',
    markerColor: '#EA580C',
    description: 'Road surface damage creating a hole, crater or depression.'
  },
  flooded_road: {
    label: 'Flooded Road',
    emoji: '🌊',
    color: '#3B82F6', // Blue
    textClass: 'text-blue-500',
    bgClass: 'bg-blue-500/10 border-blue-500/20',
    markerColor: '#2563EB',
    description: 'Road surface covered with deep water, impassable or dangerous.'
  },
  accident: {
    label: 'Active Accident',
    emoji: '🚨',
    color: '#EF4444', // Red
    textClass: 'text-red-500',
    bgClass: 'bg-red-500/10 border-red-500/20',
    markerColor: '#DC2626',
    description: 'Active accident scene. Emergency services may be active. Use caution.'
  },
  broken_traffic_light: {
    label: 'Broken Traffic Light',
    emoji: '🚦',
    color: '#EAB308', // Yellow
    textClass: 'text-yellow-500',
    bgClass: 'bg-yellow-500/10 border-yellow-500/20',
    markerColor: '#CA8A04',
    description: 'Traffic signals not functioning. Treat intersections as all-way stops.'
  },
  broken_street_light: {
    label: 'Broken Streetlight',
    emoji: '💡',
    color: '#8B5CF6', // Purple
    textClass: 'text-purple-500',
    bgClass: 'bg-purple-500/10 border-purple-500/20',
    markerColor: '#7C3AED',
    description: 'Street lighting completely dark. High risk of poor visibility or security concerns.'
  },
  fallen_tree: {
    label: 'Fallen Tree / Debris',
    emoji: '🌳',
    color: '#10B981', // Emerald Green
    textClass: 'text-emerald-500',
    bgClass: 'bg-emerald-500/10 border-emerald-500/20',
    markerColor: '#059669',
    description: 'Tree, branches, or large rubble obstructing one or more lanes.'
  },
  construction: {
    label: 'Road Construction',
    emoji: '🚧',
    color: '#F59E0B', // Amber
    textClass: 'text-amber-500',
    bgClass: 'bg-amber-500/10 border-amber-500/20',
    markerColor: '#D97706',
    description: 'Active construction zone. Expect diversions, uneven lanes, and slow traffic.'
  },
  heavy_traffic: {
    label: 'Heavy Gridlock',
    emoji: '🚗',
    color: '#6366F1', // Indigo
    textClass: 'text-indigo-500',
    bgClass: 'bg-indigo-500/10 border-indigo-500/20',
    markerColor: '#4F46E5',
    description: 'Unusually intense traffic jams causing standstill delays.'
  },
  unsafe_area: {
    label: 'Security / Unsafe Area',
    emoji: '⚠️',
    color: '#EC4899', // Pink
    textClass: 'text-pink-500',
    bgClass: 'bg-pink-500/10 border-pink-500/20',
    markerColor: '#DB2777',
    description: 'Recent security alert, crime incident, or low-safety zone.'
  }
};

export const SEVERITY_CONFIG: Record<SeverityLevel, { label: string; color: string; textClass: string; bgClass: string }> = {
  low: {
    label: 'Low Risk',
    color: '#10B981',
    textClass: 'text-emerald-500',
    bgClass: 'bg-emerald-500/10 border-emerald-500/20'
  },
  medium: {
    label: 'Moderate Risk',
    color: '#EAB308',
    textClass: 'text-yellow-500',
    bgClass: 'bg-yellow-500/10 border-yellow-500/20'
  },
  high: {
    label: 'High Risk',
    color: '#F97316',
    textClass: 'text-orange-500',
    bgClass: 'bg-orange-500/10 border-orange-500/20'
  },
  critical: {
    label: 'CRITICAL Danger',
    color: '#EF4444',
    textClass: 'text-red-500',
    bgClass: 'bg-red-500/10 border-red-500/20 animate-pulse'
  }
};
