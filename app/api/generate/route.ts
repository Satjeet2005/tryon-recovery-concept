import { NextRequest } from 'next/server';
import { FAILURE_REASONS, DEMO_OUTFITS } from '../../../lib/demo-data';
import { FailureCode } from '../../../lib/types';

export const dynamic = 'force-dynamic';

let counter = 0;

const VALID_OUTFIT_MODES = ['default', 'different', 'similar'];
const VALID_FORCE_MODES = [
  'auto',
  'success',
  'failure',
  'LOW_LIGHT',
  'FULL_BODY_NOT_VISIBLE',
  'MULTIPLE_PEOPLE',
  'OUTFIT_FIT_FAILURE',
  'NETWORK_ERROR',
  'TIMEOUT',
  'NO_RECOMMENDATION',
];

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object') {
    return Response.json(
      { success: false, error: { code: 'INVALID_REQUEST', message: 'Invalid JSON payload.' } },
      { status: 400 }
    );
  }

  // Validate attempt
  const attempt = body.attempt;
  if (typeof attempt !== 'number' || !Number.isInteger(attempt) || attempt < 1 || attempt > 20) {
    return Response.json(
      { success: false, error: { code: 'INVALID_REQUEST', message: 'Attempt must be an integer between 1 and 20.' } },
      { status: 400 }
    );
  }

  // Validate outfitMode
  const outfitMode = body.outfitMode || 'default';
  if (!VALID_OUTFIT_MODES.includes(outfitMode)) {
    return Response.json(
      { success: false, error: { code: 'INVALID_REQUEST', message: 'Invalid outfitMode parameter.' } },
      { status: 400 }
    );
  }

  // Validate forceMode
  const forceMode = body.forceMode || 'auto';
  if (!VALID_FORCE_MODES.includes(forceMode)) {
    return Response.json(
      { success: false, error: { code: 'INVALID_REQUEST', message: 'Invalid forceMode parameter.' } },
      { status: 400 }
    );
  }

  // Validate brightnessScore if present
  if (body.brightnessScore !== undefined) {
    if (typeof body.brightnessScore !== 'number' || !Number.isFinite(body.brightnessScore) || body.brightnessScore < 0 || body.brightnessScore > 255) {
      return Response.json(
        { success: false, error: { code: 'INVALID_REQUEST', message: 'brightnessScore must be a number between 0 and 255.' } },
        { status: 400 }
      );
    }
  }

  // Validate isLandscape if present
  if (body.isLandscape !== undefined && typeof body.isLandscape !== 'boolean') {
    return Response.json(
      { success: false, error: { code: 'INVALID_REQUEST', message: 'isLandscape must be a boolean.' } },
      { status: 400 }
    );
  }

  // Validate preferredStyle & currentStyle strings
  if (body.preferredStyle !== undefined && (typeof body.preferredStyle !== 'string' || body.preferredStyle.length > 50)) {
    return Response.json(
      { success: false, error: { code: 'INVALID_REQUEST', message: 'preferredStyle must be a string up to 50 characters.' } },
      { status: 400 }
    );
  }
  if (body.currentStyle !== undefined && (typeof body.currentStyle !== 'string' || body.currentStyle.length > 50)) {
    return Response.json(
      { success: false, error: { code: 'INVALID_REQUEST', message: 'currentStyle must be a string up to 50 characters.' } },
      { status: 400 }
    );
  }

  // Validate rejectedStyles array
  if (body.rejectedStyles !== undefined) {
    if (!Array.isArray(body.rejectedStyles) || body.rejectedStyles.length > 20 || body.rejectedStyles.some((s: string) => typeof s !== 'string' || s.length > 50)) {
      return Response.json(
        { success: false, error: { code: 'INVALID_REQUEST', message: 'rejectedStyles must be an array of up to 20 strings.' } },
        { status: 400 }
      );
    }
  }

  // Validate latencyMs
  const customLatency = body.latencyMs;
  if (customLatency !== undefined) {
    if (typeof customLatency !== 'number' || !Number.isFinite(customLatency) || customLatency < 0 || customLatency > 10000) {
      return Response.json(
        { success: false, error: { code: 'INVALID_REQUEST', message: 'latencyMs must be between 0 and 10000.' } },
        { status: 400 }
      );
    }
  }

  const currentStyle = (body.currentStyle || 'Streetwear').toLowerCase();
  const preferredStyle = (body.preferredStyle || 'streetwear').toLowerCase();
  const currentOutfitId = typeof body.currentOutfitId === 'string' ? body.currentOutfitId : undefined;
  const rejectedStyles: string[] = Array.isArray(body.rejectedStyles) 
    ? body.rejectedStyles.map((s: string) => String(s).toLowerCase()) 
    : [];

  const searchParams = request.nextUrl.searchParams;
  const demoParam = searchParams.get('demo');

  // Determine delay (respect test environment, custom latency, or demo default)
  let delay = process.env.NODE_ENV === 'test' ? 10 : Math.floor(Math.random() * 2000) + 3500;
  if (typeof customLatency === 'number') {
    delay = process.env.NODE_ENV === 'test' ? 10 : customLatency;
  }
  await new Promise(resolve => setTimeout(resolve, delay));

  // Handle forceMode / demoParam overrides
  const effectiveMode = demoParam || forceMode;
  let failureCode: FailureCode | null = null;
  let shouldSucceed = attempt >= 2;

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
  } else if (effectiveMode === 'NO_RECOMMENDATION') {
    return Response.json({
      success: false,
      exhausted: true,
      error: {
        code: 'NO_RECOMMENDATION',
        title: 'All style recommendations exhausted',
        message: 'All available style categories have been filtered by your taste preferences. Reset your taste engine to explore more looks.',
      },
    });
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

  // Phase 4: Handle exhausted recommendation pool
  if (validOutfits.length === 0) {
    return Response.json({
      success: false,
      exhausted: true,
      error: {
        code: 'NO_RECOMMENDATION',
        title: 'All styles filtered out',
        message: 'You have rejected all available style categories. Reset your taste preferences to discover new outfits.',
      },
    });
  }

  let candidates = validOutfits;

  if (outfitMode === 'similar') {
    // Prefer outfits matching preferredStyle, then currentStyle
    const preferredMatches = validOutfits.filter(o => o.style.toLowerCase() === preferredStyle);
    if (preferredMatches.length > 0) {
      candidates = preferredMatches;
    } else {
      const currentMatches = validOutfits.filter(o => o.style.toLowerCase() === currentStyle);
      if (currentMatches.length > 0) {
        candidates = currentMatches;
      }
    }
  } else if (outfitMode === 'different') {
    // Exclude current style
    const differentMatches = validOutfits.filter(o => o.style.toLowerCase() !== currentStyle);
    if (differentMatches.length > 0) {
      const preferredDifferent = differentMatches.filter(o => o.style.toLowerCase() === preferredStyle);
      candidates = preferredDifferent.length > 0 ? preferredDifferent : differentMatches;
    }
  } else {
    // Default mode: prefer preferredStyle if valid matches exist
    const preferredMatches = validOutfits.filter(o => o.style.toLowerCase() === preferredStyle);
    if (preferredMatches.length > 0) {
      candidates = preferredMatches;
    }
  }

  // Phase 4: Exclude current outfit where alternatives exist
  if (currentOutfitId && candidates.length > 1) {
    const alternativeCandidates = candidates.filter(o => o.id !== currentOutfitId);
    if (alternativeCandidates.length > 0) {
      candidates = alternativeCandidates;
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
