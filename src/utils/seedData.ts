import { HazardReport, UserProfile, LeaderboardUser, Notification, WeeklyDigest } from '../types';

export const GHANA_DISTRICTS = [
  'Accra Metropolitan (AMA)',
  'Ayawaso West (East Legon)',
  'La Dade Kotopon (Osu/Cantonments)',
  'Adentan Municipal',
  'Kumasi Metropolitan (Kejetia/Adum)',
  'Oforikrom Municipal (KNUST)',
  'Tamale Metropolitan',
  'Sekondi Takoradi Metropolitan',
  'Tema Metropolitan'
];

export const MOCK_PROFILE: UserProfile = {
  name: 'Kofi Mensah',
  email: 'kofi.mensah@saferoute.gh',
  role: 'driver',
  district: 'Ayawaso West (East Legon)',
  reputationPoints: 680,
  reputationLevel: 'Gold',
  joinedDate: '2026-03-12',
  reportsSubmitted: 24,
  reportsVerified: 19,
  upvotesReceived: 142
};

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n-1',
    title: 'Report Verified! 🎉',
    message: 'Your report of a deep pothole on Boundary Road has been verified by 5 community members. +25 reputation points!',
    type: 'success',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hrs ago
    read: false
  },
  {
    id: 'n-2',
    title: 'CRITICAL ALERT: Flooded Underpass 🌊',
    message: 'Severe flooding reported at Alajo Underpass. Saloon cars are strongly advised to divert immediately.',
    type: 'critical',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hrs ago
    read: false
  },
  {
    id: 'n-3',
    title: 'Weekly Digest Available',
    message: 'The AI Safety Digest for Ayawaso West (East Legon) is now ready. Review road safety trends in your neighborhood.',
    type: 'info',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    read: true
  }
];

export const MOCK_LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, name: 'Ama Osei', role: 'responder', district: 'Accra Metropolitan (AMA)', reportsSubmitted: 98, reportsVerified: 85, score: 2450, level: 'Platinum' },
  { rank: 2, name: 'Kwame Boateng', role: 'rider', district: 'Kumasi Metropolitan (Kejetia/Adum)', reportsSubmitted: 76, reportsVerified: 62, score: 1840, level: 'Platinum' },
  { rank: 3, name: 'Abubakar Sadik', role: 'commuter', district: 'Tamale Metropolitan', reportsSubmitted: 45, reportsVerified: 38, score: 980, level: 'Gold' },
  { rank: 4, name: 'Kofi Mensah', role: 'driver', district: 'Ayawaso West (East Legon)', reportsSubmitted: 24, reportsVerified: 19, score: 680, level: 'Gold' }, // Active user
  { rank: 5, name: 'Esi Twum', role: 'student', district: 'Oforikrom Municipal (KNUST)', reportsSubmitted: 18, reportsVerified: 14, score: 490, level: 'Silver' },
  { rank: 6, name: 'Selorm Agbenu', role: 'commuter', district: 'Sekondi Takoradi Metropolitan', reportsSubmitted: 12, reportsVerified: 9, score: 310, level: 'Silver' },
  { rank: 7, name: 'Naa Adjeley', role: 'authority', district: 'La Dade Kotopon (Osu/Cantonments)', reportsSubmitted: 8, reportsVerified: 7, score: 220, level: 'Bronze' }
];

export const MOCK_REPORTS: HazardReport[] = [
  {
    id: 'hr-1',
    type: 'pothole',
    severity: 'high',
    latitude: 5.6322,
    longitude: -0.1691,
    locationName: 'Boundary Road, East Legon (Near GNPC Petrol Station)',
    description: 'A cluster of three deep, sharp-edged potholes in the outer lane. Vehicles are braking heavily and swerving suddenly to avoid them, causing a near-miss zone.',
    isBlockingTraffic: false,
    reporterName: 'Kwame Boateng',
    reporterRole: 'rider',
    reporterReputation: 1840,
    upvotes: 18,
    downvotes: 1,
    status: 'active',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(), // 3 hours ago
    comments: [
      {
        id: 'c-1',
        reportId: 'hr-1',
        userName: 'Ama Osei',
        userRole: 'responder',
        content: 'I passed there with the ambulance an hour ago. Extremely dangerous if you are driving fast. Please stick to the inner lane.',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'c-2',
        reportId: 'hr-1',
        userName: 'Ekow Taylor',
        userRole: 'driver',
        content: 'Almost damaged my tire rim here yesterday night. No streetlights around either.',
        createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString()
      }
    ],
    aiAnalyzed: true,
    aiAnalysisResult: {
      hazardType: 'pothole',
      severity: 'high',
      confidence: 0.96,
      description: 'Multiple advanced asphalt surface failures forming steep craters. Highly hazardous to low-clearance vehicles and motorbikes.',
      safetyWarning: 'REDUCE SPEED: Active swerving maneuvers observed. Drive below 20km/h on this stretch.',
      recommendations: [
        'Decelerate early before approaching the petrol station block.',
        'Keep safe following distance of at least 3 car lengths.',
        'Avoid night transit until road surface repairs are completed.'
      ]
    }
  },
  {
    id: 'hr-2',
    type: 'flooded_road',
    severity: 'critical',
    latitude: 5.5654,
    longitude: -0.2241,
    locationName: 'Alajo Underpass, Accra Central',
    description: 'Severe flash flooding under the bridge after the morning downpour. Water level is about 2.5 feet high. Trotro buses are forcing their way, but saloon cars are completely stuck.',
    isBlockingTraffic: true,
    reporterName: 'Ama Osei',
    reporterRole: 'responder',
    reporterReputation: 2450,
    upvotes: 42,
    downvotes: 0,
    status: 'active',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    comments: [
      {
        id: 'c-3',
        reportId: 'hr-2',
        userName: 'Yaw Mensah',
        userRole: 'commuter',
        content: 'Do NOT try to pass. A Nissan Micra just stalled inside and people had to help push it out.',
        createdAt: new Date(Date.now() - 3600000 * 3.5).toISOString()
      }
    ],
    aiAnalyzed: true,
    aiAnalysisResult: {
      hazardType: 'flooded_road',
      severity: 'critical',
      confidence: 0.98,
      description: 'Major stormwater accumulation fully submerge the roadway. Water depth exceeds normal sedan tire diameters.',
      safetyWarning: 'STOP: Immediate risk of engine hydrolock and hydraulic current drag. Use Alajo bypass.',
      recommendations: [
        'Saloon cars must execute immediate U-turns and seek alternative routing.',
        'Emergency services are actively redirecting drivers.',
        'Do not step into the water due to submerged drainage channels.'
      ]
    }
  },
  {
    id: 'hr-3',
    type: 'accident',
    severity: 'high',
    latitude: 5.6483,
    longitude: -0.1122,
    locationName: 'Accra-Tema Motorway (Near Tetteh Quarshie Interchange)',
    description: 'Minor fender-bender between a commercial sprinter trotro and an SUV. Occurring right after the bend. Outbound lanes are heavily backed up.',
    isBlockingTraffic: true,
    reporterName: 'Kofi Mensah',
    reporterRole: 'driver',
    reporterReputation: 680,
    upvotes: 12,
    downvotes: 0,
    status: 'active',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    comments: [],
    aiAnalyzed: false
  },
  {
    id: 'hr-4',
    type: 'broken_traffic_light',
    severity: 'medium',
    latitude: 5.5582,
    longitude: -0.1982,
    locationName: 'Dankwah Circle Intersection, Osu',
    description: 'The traffic lights are completely dead. Absolute chaos as drivers from three directions are attempting to push through at the same time. No MTTD officer present yet.',
    isBlockingTraffic: false,
    reporterName: 'Naa Adjeley',
    reporterRole: 'authority',
    reporterReputation: 220,
    upvotes: 9,
    downvotes: 0,
    status: 'active',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    comments: [
      {
        id: 'c-4',
        reportId: 'hr-4',
        userName: 'Kofi Mensah',
        userRole: 'driver',
        content: 'Still broken as of 10 minutes ago. Community boys are trying to direct traffic manually now.',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ],
    aiAnalyzed: false
  },
  {
    id: 'hr-5',
    type: 'construction',
    severity: 'low',
    latitude: 6.6745,
    longitude: -1.5689,
    locationName: 'KNUST Main Gate Road, Kumasi',
    description: 'Repaving work is ongoing. Single lane traffic in effect. Expect delays during peak student movement hours.',
    isBlockingTraffic: false,
    reporterName: 'Esi Twum',
    reporterRole: 'student',
    reporterReputation: 490,
    upvotes: 14,
    downvotes: 1,
    status: 'under_review',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    comments: [],
    aiAnalyzed: false
  },
  {
    id: 'hr-6',
    type: 'broken_street_light',
    severity: 'medium',
    latitude: 6.6892,
    longitude: -1.6214,
    locationName: 'Anloga Junction, Kumasi',
    description: 'Over 8 streetlights in a row are completely dark. This high-speed stretch is pitched black at night, making it very risky for pedestrians crossing.',
    isBlockingTraffic: false,
    reporterName: 'Kwame Boateng',
    reporterRole: 'rider',
    reporterReputation: 1840,
    upvotes: 15,
    downvotes: 0,
    status: 'active',
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    comments: [],
    aiAnalyzed: false
  },
  {
    id: 'hr-7',
    type: 'unsafe_area',
    severity: 'high',
    latitude: 9.4075,
    longitude: -0.8398,
    locationName: 'Tamale Central Market Bypass',
    description: 'Active reports of rowdy behavior and youth gather blocking secondary lanes near the market. Drivers are advised to stick to the main double carriage highway.',
    isBlockingTraffic: false,
    reporterName: 'Abubakar Sadik',
    reporterRole: 'commuter',
    reporterReputation: 980,
    upvotes: 21,
    downvotes: 2,
    status: 'active',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    comments: [],
    aiAnalyzed: false
  },
  {
    id: 'hr-8',
    type: 'heavy_traffic',
    severity: 'medium',
    latitude: 4.8973,
    longitude: -1.7582,
    locationName: 'Takoradi Market Circle Outer Ring',
    description: 'Unusual gridlock around the market circle due to double-parked commercial delivery trucks. Moving at bumper-to-bumper speed.',
    isBlockingTraffic: false,
    reporterName: 'Selorm Agbenu',
    reporterRole: 'commuter',
    reporterReputation: 310,
    upvotes: 5,
    downvotes: 0,
    status: 'resolved',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    comments: [],
    aiAnalyzed: false
  }
];
