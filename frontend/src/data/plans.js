export const PLAN_TIERS = [
  {
    id: 'Free',
    name: 'Free',
    price: 0,
    tagline: 'Try FlockGuard on a couple of flocks',
    flockLimit: 2,
    teamLimit: 1,
    historyDays: 7,
    capabilities: {
      fullDetection: false, // critical mortality spikes only -- no feed/temp/humidity/behavior flags
      recommendations: false,
      analytics: false,
      reports: false,
      evidenceUpload: false,
    },
    highlight: false,
    features: [
      'Up to 2 flocks',
      'Daily feed, water & mortality logging',
      'Critical alerts only',
      '1 user',
      '7-day history',
    ],
  },
  {
    id: 'Pro',
    name: 'Pro',
    price: 49,
    tagline: 'For farms actively managing risk',
    flockLimit: 20,
    teamLimit: 5,
    historyDays: 365,
    capabilities: {
      fullDetection: true,
      recommendations: true,
      analytics: true,
      reports: true,
      evidenceUpload: true,
    },
    highlight: true,
    features: [
      'Up to 20 flocks',
      'Full daily records — production, temp/humidity, behavior, photo/video evidence',
      'AI-flagged pattern detection & verification',
      'AI recommendations',
      'Analytics & trend charts',
      'Exportable reports',
      'Up to 5 team members',
      '12-month history',
    ],
  },
  {
    id: 'Enterprise',
    name: 'Enterprise',
    price: 199,
    tagline: 'For multi-house or multi-farm operations',
    flockLimit: Infinity,
    teamLimit: Infinity,
    historyDays: Infinity,
    capabilities: {
      fullDetection: true,
      recommendations: true,
      analytics: true,
      reports: true,
      evidenceUpload: true,
    },
    highlight: false,
    features: [
      'Unlimited flocks',
      'Everything in Pro',
      'Multiple farms under one account',
      'Unlimited team members',
      'Priority support',
      'Unlimited history',
    ],
  },
];

export function planFor(planId) {
  return PLAN_TIERS.find((p) => p.id === planId) ?? PLAN_TIERS[0];
}
