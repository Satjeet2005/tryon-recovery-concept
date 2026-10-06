import { Outfit, FailureReason, FailureCode } from './types';

export const FAILURE_REASONS: Record<FailureCode, FailureReason> = {
  LOW_LIGHT: {
    code: 'LOW_LIGHT',
    title: 'Your photo is too dark',
    description: 'Try a brighter photo with your face and full body clearly visible.',
  },
  FULL_BODY_NOT_VISIBLE: {
    code: 'FULL_BODY_NOT_VISIBLE',
    title: "We can't see your full outfit area",
    description: 'Try a full-body photo with your feet and shoulders visible.',
  },
  IMAGE_QUALITY: {
    code: 'IMAGE_QUALITY',
    title: 'We need a clearer photo',
    description: 'Try a sharper image with less blur and better lighting.',
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

// Demo metric data - clearly illustrative, not real
export const DEMO_METRICS = {
  funnel: {
    uploads: 100,
    firstTryOnSuccess: 72,
    secondTryOn: 41,
  },
  recovery: {
    failedGenerations: 28,
    successfulRetries: 19,
    recoveryRate: 0.68,
  },
  recoveryActions: {
    tryAgain: 0.42,
    differentOutfit: 0.25,
    similarStyle: 0.18,
    notMyStyle: 0.15,
  },
  tasteFeedback: {
    moreLikeThis: 0.54,
    lessLikeThis: 0.28,
    saved: 0.18,
  },
};
