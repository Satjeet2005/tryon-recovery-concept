import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const OUTFITS = [
  { id: 'outfit-1', name: 'Oversized Streetwear Look', style: 'Streetwear', color: '#1a1a2e', secondaryColor: '#e94560' },
  { id: 'outfit-2', name: 'Minimal Linen Set', style: 'Minimal', color: '#f5f0eb', secondaryColor: '#8b7355' },
  { id: 'outfit-3', name: 'Relaxed Casual Fit', style: 'Casual', color: '#2d4059', secondaryColor: '#ea5455' },
  { id: 'outfit-4', name: 'Smart Casual Blazer', style: 'Formal', color: '#222831', secondaryColor: '#00adb5' },
  { id: 'outfit-5', name: 'Boho Layered Look', style: 'Bohemian', color: '#b85c38', secondaryColor: '#e0c097' },
  { id: 'outfit-6', name: 'Urban Streetwear Hoodie', style: 'Streetwear', color: '#393e46', secondaryColor: '#f96d00' },
  { id: 'outfit-7', name: 'Clean Minimal Tee', style: 'Minimal', color: '#eeeeee', secondaryColor: '#686d76' },
];

const FAILURE_REASONS = {
  LOW_LIGHT: { code: 'LOW_LIGHT' as const, title: 'Your photo is too dark', description: 'Try a brighter photo with your face and full body clearly visible.' },
  FULL_BODY_NOT_VISIBLE: { code: 'FULL_BODY_NOT_VISIBLE' as const, title: "We can't see your full outfit area", description: 'Try a full-body photo with your feet and shoulders visible.' },
  IMAGE_QUALITY: { code: 'IMAGE_QUALITY' as const, title: 'We need a clearer photo', description: 'Try a sharper image with less blur and better lighting.' },
};

let counter = 0;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const attempt = body.attempt || 1;
  const outfitMode = body.outfitMode || 'default';
  const currentStyle = body.currentStyle || 'Streetwear';

  const searchParams = request.nextUrl.searchParams;
  const demoParam = searchParams.get('demo');

  // Wait 4-6 seconds in dev/prod, fast in test
  const delay = process.env.NODE_ENV === 'test' ? 10 : Math.floor(Math.random() * 2000) + 4000;
  await new Promise(resolve => setTimeout(resolve, delay));

  let shouldSucceed = attempt >= 2;
  if (demoParam === 'success') {
    shouldSucceed = true;
  } else if (demoParam === 'failure') {
    shouldSucceed = false;
  }

  if (!shouldSucceed) {
    return Response.json({
      success: false,
      failure: FAILURE_REASONS.LOW_LIGHT
    });
  }

  let selectedOutfit = OUTFITS[0];

  if (outfitMode === 'different') {
    const differentOutfits = OUTFITS.filter(o => o.style !== currentStyle);
    if (differentOutfits.length > 0) {
      counter++;
      selectedOutfit = differentOutfits[counter % differentOutfits.length];
    }
  } else if (outfitMode === 'similar') {
    const similarOutfits = OUTFITS.filter(o => o.style === currentStyle);
    if (similarOutfits.length > 0) {
      counter++;
      selectedOutfit = similarOutfits[counter % similarOutfits.length];
    }
  }

  return Response.json({
    success: true,
    resultId: `result_${Date.now()}`,
    outfit: selectedOutfit
  });
}
