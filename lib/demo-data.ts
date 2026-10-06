import { Outfit, FailureReason, FailureCode } from './types';

export const FAILURE_REASONS: Record<FailureCode, FailureReason> = {
  LOW_LIGHT: {
    code: 'LOW_LIGHT',
    category: 'input',
    title: 'Your photo is too dark',
    description: 'Try a brighter photo with your face and full body clearly visible.',
    primaryAction: 'upload_brighter',
    allowedActions: ['upload_brighter', 'retry'],
    requiresUpload: true,
  },
  FULL_BODY_NOT_VISIBLE: {
    code: 'FULL_BODY_NOT_VISIBLE',
    category: 'input',
    title: "We couldn't see your full body",
    description: 'Try a full-body photo with your feet and shoulders clearly visible.',
    primaryAction: 'upload_full_body',
    allowedActions: ['upload_full_body', 'retry'],
    requiresUpload: true,
  },
  MULTIPLE_PEOPLE: {
    code: 'MULTIPLE_PEOPLE',
    category: 'input',
    title: 'We found more than one person',
    description: 'Please upload a photo featuring only yourself for an accurate try-on fit.',
    primaryAction: 'upload_solo',
    allowedActions: ['upload_solo', 'retry'],
    requiresUpload: true,
  },
  OUTFIT_FIT_FAILURE: {
    code: 'OUTFIT_FIT_FAILURE',
    category: 'content',
    title: "This outfit didn't fit your avatar",
    description: "The digital garment couldn't align cleanly. Try an alternative outfit or style.",
    primaryAction: 'different_outfit',
    allowedActions: ['different_outfit', 'similar_style', 'not_my_style'],
    requiresUpload: false,
  },
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    category: 'system',
    title: "We couldn't reach the try-on service",
    description: 'A network glitch interrupted generation. You can safely try again.',
    primaryAction: 'retry',
    allowedActions: ['retry'],
    requiresUpload: false,
  },
  TIMEOUT: {
    code: 'TIMEOUT',
    category: 'system',
    title: 'The request timed out',
    description: 'Generation took longer than expected. You can try submitting again.',
    primaryAction: 'retry',
    allowedActions: ['retry'],
    requiresUpload: false,
  },
};

export const DEMO_OUTFITS: Outfit[] = [
  {
    id: 'outfit-1',
    name: 'Oversized Streetwear Look',
    style: 'Streetwear',
    color: '#1a1a2e',
    secondaryColor: '#e94560',
  },
  {
    id: 'outfit-2',
    name: 'Minimal Linen Set',
    style: 'Minimal',
    color: '#f5f0eb',
    secondaryColor: '#8b7355',
  },
  {
    id: 'outfit-3',
    name: 'Relaxed Casual Fit',
    style: 'Casual',
    color: '#2d4059',
    secondaryColor: '#ea5455',
  },
  {
    id: 'outfit-4',
    name: 'Smart Casual Blazer',
    style: 'Formal',
    color: '#222831',
    secondaryColor: '#00adb5',
  },
  {
    id: 'outfit-5',
    name: 'Boho Layered Look',
    style: 'Bohemian',
    color: '#b85c38',
    secondaryColor: '#e0c097',
  },
  {
    id: 'outfit-6',
    name: 'Urban Streetwear Hoodie',
    style: 'Streetwear',
    color: '#393e46',
    secondaryColor: '#f96d00',
  },
  {
    id: 'outfit-7',
    name: 'Clean Minimal Tee',
    style: 'Minimal',
    color: '#eeeeee',
    secondaryColor: '#686d76',
  },
];

export const DEMO_METRICS = {
  datasetName: 'Illustrative Target Baseline (100 Simulated Sessions)',
  funnel: {
    totalSessions: 100, // Total sessions initiating try-on
    firstTryOnSuccess: 72, // 72 of 100 sessions succeeded on 1st try (Control Group)
    failedGenerations: 28, // 28 of 100 sessions failed on 1st try
    secondTryOn: 24, // 24 of 28 failed sessions attempted a 2nd try (85.7% 2nd-try rate)
    recoveredSuccess: 19, // 19 of 28 failed sessions achieved successful recovery (67.9% recovery rate)
  },
  byFailureReason: [
    { code: 'LOW_LIGHT', label: 'Photo Too Dark', count: 12, recovered: 9, rate: 0.75 },
    { code: 'FULL_BODY_NOT_VISIBLE', label: 'Incomplete Body Framing', count: 8, recovered: 5, rate: 0.625 },
    { code: 'MULTIPLE_PEOPLE', label: 'Multiple People Detected', count: 4, recovered: 3, rate: 0.75 },
    { code: 'OUTFIT_FIT_FAILURE', label: 'Outfit Alignment Failure', count: 3, recovered: 2, rate: 0.667 },
    { code: 'NETWORK_ERROR', label: 'System Timeout / Error', count: 1, recovered: 0, rate: 0.0 },
  ],
  byRecoveryAction: [
    { action: 'upload_brighter', label: 'Upload Brighter Photo', selectedCount: 9, successCount: 8, successRate: 0.889 },
    { action: 'upload_full_body', label: 'Upload Full-Body Photo', selectedCount: 6, successCount: 5, successRate: 0.833 },
    { action: 'different_outfit', label: 'Try Different Outfit', selectedCount: 4, successCount: 3, successRate: 0.75 },
    { action: 'retry', label: 'Generic Retry', selectedCount: 5, successCount: 3, successRate: 0.60 },
  ],
  tasteFeedback: {
    totalGiven: 65,
    moreLikeThis: 35, // 53.8%
    lessLikeThis: 18, // 27.7%
    saved: 12, // 18.5%
  },
  hypothesisComparison: {
    title: 'Product Hypothesis — Target Outcomes to Validate',
    note: 'Illustrative target model — not measured production A/B test data',
    genericRetry: {
      label: 'Control Baseline (Generic Retry)',
      secondTryRate: 'Target Baseline: ~45%',
      recoverySuccessRate: 'Target Baseline: ~32%',
      userIntentCaptured: '0% (No intent captured)',
    },
    diagnosedRecovery: {
      label: 'Variant Target (Diagnosed Recovery)',
      secondTryRate: 'Target Goal: >80%',
      recoverySuccessRate: 'Target Goal: >65%',
      userIntentCaptured: 'Target Goal: >75%',
    },
  },
};

