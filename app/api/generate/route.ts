import { NextRequest } from 'next/server';
import { FAILURE_REASONS, DEMO_OUTFITS } from '../../../lib/demo-data';
import { FailureCode } from '../../../lib/types';

export const dynamic = 'force-dynamic';

let counter = 0;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const attempt = body.attempt || 1;
  const outfitMode = body.outfitMode || 'default';
  const currentStyle = (body.currentStyle || 'Streetwear').toLowerCase();
  const preferredStyle = (body.preferredStyle || 'streetwear').toLowerCase();
  const rejectedStyles: string[] = Array.isArray(body.rejectedStyles) 
    ? body.rejectedStyles.map((s: string) => String(s).toLowerCase()) 
    : [];
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

  // Attempt 1 default failure code in auto mode derived from client-side image heuristics
  if (!shouldSucceed && !failureCode) {
    const brightnessScore = typeof body.brightnessScore === 'number' ? body.brightnessScore : 128;
    const isLandscape = Boolean(body.isLandscape);

    if (brightnessScore < 55) {
      failureCode = 'LOW_LIGHT';
    } else if (isLandscape) {
      failureCode = 'FULL_BODY_NOT_VISIBLE';
    } else {
      failureCode = 'OUTFIT_FIT_FAILURE';
    }
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

  // Filter outfits by rejected styles
  const validOutfits = DEMO_OUTFITS.filter(o => !rejectedStyles.includes(o.style.toLowerCase()));
  const pool = validOutfits.length > 0 ? validOutfits : DEMO_OUTFITS;

  let candidates = pool;

  if (outfitMode === 'similar') {
    // Prefer outfits matching preferredStyle, then currentStyle
    const preferredMatches = pool.filter(o => o.style.toLowerCase() === preferredStyle);
    if (preferredMatches.length > 0) {
      candidates = preferredMatches;
    } else {
      const currentMatches = pool.filter(o => o.style.toLowerCase() === currentStyle);
      if (currentMatches.length > 0) {
        candidates = currentMatches;
      }
    }
  } else if (outfitMode === 'different') {
    // Exclude current style
    const differentMatches = pool.filter(o => o.style.toLowerCase() !== currentStyle);
    if (differentMatches.length > 0) {
      // If preferredStyle is different from currentStyle, prefer that
      const preferredDifferent = differentMatches.filter(o => o.style.toLowerCase() === preferredStyle);
      candidates = preferredDifferent.length > 0 ? preferredDifferent : differentMatches;
    }
  } else {
    // Default mode: prefer preferredStyle if valid matches exist
    const preferredMatches = pool.filter(o => o.style.toLowerCase() === preferredStyle);
    if (preferredMatches.length > 0) {
      candidates = preferredMatches;
    }
  }

  counter++;
  const selectedOutfit = candidates[counter % candidates.length];

  return Response.json({
    success: true,
    resultId: `result_${Date.now()}`,
    outfit: selectedOutfit,
  });
}

