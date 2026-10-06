import { NextRequest } from 'next/server';
import { FAILURE_REASONS, DEMO_OUTFITS } from '../../../lib/demo-data';
import { FailureCode } from '../../../lib/types';

export const dynamic = 'force-dynamic';

let counter = 0;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const attempt = body.attempt || 1;
  const outfitMode = body.outfitMode || 'default';
  const currentStyle = body.currentStyle || 'Streetwear';
  const forceMode = body.forceMode || 'auto';
  const customLatency = body.latencyMs;

  const searchParams = request.nextUrl.searchParams;
  const demoParam = searchParams.get('demo');

  // Determine delay (respect test environment, custom latency, or demo default)
  let delay = process.env.NODE_ENV === 'test' ? 10 : Math.floor(Math.random() * 2000) + 3500;
  if (typeof customLatency === 'number' && customLatency >= 0) {
    delay = process.env.NODE_ENV === 'test' ? 10 : customLatency;
  }
  await new Promise(resolve => setTimeout(resolve, delay));

  // Determine success vs failure outcome
  let failureCode: FailureCode | null = null;
  let shouldSucceed = attempt >= 2;

  // Handle forceMode / demoParam overrides
  const effectiveMode = demoParam || forceMode;

  if (effectiveMode === 'success') {
    shouldSucceed = true;
  } else if (effectiveMode === 'failure' || effectiveMode === 'LOW_LIGHT') {
    shouldSucceed = false;
    failureCode = 'LOW_LIGHT';
  } else if (effectiveMode === 'FULL_BODY_NOT_VISIBLE') {
    shouldSucceed = false;
    failureCode = 'FULL_BODY_NOT_VISIBLE';
  } else if (effectiveMode === 'MULTIPLE_PEOPLE') {
    shouldSucceed = false;
    failureCode = 'MULTIPLE_PEOPLE';
  } else if (effectiveMode === 'OUTFIT_FIT_FAILURE') {
    shouldSucceed = false;
    failureCode = 'OUTFIT_FIT_FAILURE';
  } else if (effectiveMode === 'NETWORK_ERROR') {
    shouldSucceed = false;
    failureCode = 'NETWORK_ERROR';
  } else if (effectiveMode === 'TIMEOUT') {
    shouldSucceed = false;
    failureCode = 'TIMEOUT';
  }

  // Attempt 1 default failure code in auto mode
  if (!shouldSucceed && !failureCode) {
    failureCode = 'LOW_LIGHT';
  }

  if (!shouldSucceed && failureCode) {
    const failureReason = {
      ...FAILURE_REASONS[failureCode],
      isSimulatedDemoFailure: true,
    };
    return Response.json({
      success: false,
      failure: failureReason,
    });
  }

  let selectedOutfit = DEMO_OUTFITS[0];

  if (outfitMode === 'different') {
    const differentOutfits = DEMO_OUTFITS.filter(o => o.style !== currentStyle);
    if (differentOutfits.length > 0) {
      counter++;
      selectedOutfit = differentOutfits[counter % differentOutfits.length];
    }
  } else if (outfitMode === 'similar') {
    const similarOutfits = DEMO_OUTFITS.filter(o => o.style === currentStyle);
    if (similarOutfits.length > 0) {
      counter++;
      selectedOutfit = similarOutfits[counter % similarOutfits.length];
    } else {
      counter++;
      selectedOutfit = DEMO_OUTFITS[counter % DEMO_OUTFITS.length];
    }
  } else {
    counter++;
    selectedOutfit = DEMO_OUTFITS[counter % DEMO_OUTFITS.length];
  }

  return Response.json({
    success: true,
    resultId: `result_${Date.now()}`,
    outfit: selectedOutfit,
  });
}

