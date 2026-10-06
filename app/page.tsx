'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import type { FlowState, FailureReason, Outfit, RecoveryAction, TasteFeedback, ImageAnalysisResult, DemoControls } from '@/lib/types';
import { validateImage } from '@/lib/validation';
import { trackEvent } from '@/lib/analytics';
import { getTaste, updateTasteFromFeedback, rejectStyle, resetTaste, getTopStyle } from '@/lib/taste-state';

import PhotoGuidance from '@/components/upload/PhotoGuidance';
import UploadCard from '@/components/upload/UploadCard';
import UploadValidation from '@/components/upload/UploadValidation';
import { GenerationProgress } from '@/components/generation/GenerationProgress';
import { FailureCard } from '@/components/recovery/FailureCard';
import { RecoveryActions } from '@/components/recovery/RecoveryActions';
import { TryOnResult } from '@/components/tryon/TryOnResult';
import { TasteFeedback as TasteFeedbackComponent } from '@/components/tryon/TasteFeedback';
import { RecommendationReason } from '@/components/tryon/RecommendationReason';

const PROGRESS_STAGES = [
  { threshold: 0, label: 'Reading your photo' },
  { threshold: 25, label: 'Building your avatar' },
  { threshold: 60, label: 'Fitting the outfit' },
  { threshold: 90, label: 'Preparing your look' },
];

function getStageLabel(progress: number): string {
  let label = PROGRESS_STAGES[0].label;
  for (const stage of PROGRESS_STAGES) {
    if (progress >= stage.threshold) {
      label = stage.label;
    }
  }
  return label;
}

function buildRecommendationReason(outfit: Outfit, tasteState: ReturnType<typeof getTaste>): string {
  const style = outfit.style.toLowerCase();
  const score = tasteState.styles[style] ?? 0.5;
  
  if (score > 0.7) {
    return `Recommended because you liked ${outfit.style.toLowerCase()} looks.`;
  } else if (score > 0.5) {
    return `Recommended based on your recent try-ons.`;
  } else {
    return `Trying something new based on your preferences.`;
  }
}

export default function TryOnFlow() {
  // Core flow state
  const [flowState, setFlowState] = useState<FlowState>('upload');
  const [, setAttempt] = useState(1);
  const attemptRef = useRef(1);

  const updateAttempt = useCallback((nextAttempt: number) => {
    attemptRef.current = nextAttempt;
    setAttempt(nextAttempt);
  }, []);
  
  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const [uploadTipHighlight, setUploadTipHighlight] = useState<string | null>(null);

  // Demo Controls state
  const [showDemoControls, setShowDemoControls] = useState(false);
  const [demoControls, setDemoControls] = useState<DemoControls>({
    forceMode: 'auto',
    latencyMs: 3500,
  });

  // Generation & AbortController reliability state
  const [progress, setProgress] = useState(0);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const generationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef<number>(0);
  
  // Result state
  const [failure, setFailure] = useState<FailureReason | null>(null);
  const [currentOutfit, setCurrentOutfit] = useState<Outfit | null>(null);
  
  // Feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<string>('');
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore flow state safely on mount if present
  useEffect(() => {
    try {
      const savedFlow = sessionStorage.getItem('demo_flow_state');
      if (savedFlow === 'upload' || savedFlow === 'success' || savedFlow === 'failure') {
        // keep restored flow state if compatible
      }
    } catch {
      // ignore
    }
  }, []);

  // Sync current flowState to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('demo_flow_state', flowState);
    } catch {
      // ignore
    }
  }, [flowState]);

  // Handle file selection & client-side evaluation
  const handleFileSelect = useCallback(async (file: File, preview: string) => {
    setUploadError(null);
    setIsValidating(true);
    setSelectedFile(file);
    setPreviewUrl(preview);
    setIsValid(false);
    setAnalysisResult(null);
    setUploadTipHighlight(null);
    
    trackEvent('upload_started', { fileName: file.name, fileSize: file.size });
    
    const result = await validateImage(file);
    setIsValidating(false);
    
    if (!result.valid) {
      setUploadError(result.error || 'Invalid image');
      setIsValid(false);
    } else {
      setUploadError(null);
      setIsValid(true);
      if (result.analysis) {
        setAnalysisResult(result.analysis);
      }
      trackEvent('upload_validated', { 
        fileName: file.name,
        brightnessScore: result.analysis?.brightness.score,
        isLandscape: result.analysis?.aspectRatio.isLandscape
      });
    }
  }, []);

  // Show toast with auto-dismiss
  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Cancel generation
  const handleCancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    if (generationTimeoutRef.current) clearTimeout(generationTimeoutRef.current);

    setProgress(0);
    setFlowState('upload');
    showToast('Generation cancelled.');
    trackEvent('generation_cancelled', { attempt: attemptRef.current });
  }, [showToast]);

  // Start generation with explicit attempt parameter, stale request protection & timeout
  const startGeneration = useCallback(async (
    mode: 'default' | 'different' | 'similar' = 'default',
    explicitAttempt?: number
  ) => {
    const currentAttempt = explicitAttempt ?? attemptRef.current;
    
    // Abort any existing in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Increment request ID token for stale response protection
    const currentRequestId = ++requestIdRef.current;

    setFlowState('generating');
    setProgress(0);
    setFailure(null);
    
    trackEvent('generation_started', { attempt: currentAttempt, outfitMode: mode, forceMode: demoControls.forceMode });

    // Animate progress
    let currentProgress = 0;
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    progressTimerRef.current = setInterval(() => {
      currentProgress += Math.random() * 8 + 3;
      if (currentProgress > 92) currentProgress = 92;
      setProgress(Math.floor(currentProgress));
    }, 350);

    // Timeout safeguard (12s timeout)
    if (generationTimeoutRef.current) clearTimeout(generationTimeoutRef.current);
    generationTimeoutRef.current = setTimeout(() => {
      if (requestIdRef.current === currentRequestId && controller.signal.aborted === false) {
        controller.abort();
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        setFailure({
          code: 'TIMEOUT',
          category: 'system',
          title: 'The request timed out',
          description: 'Generation took longer than expected. You can safely try again.',
          primaryAction: 'retry',
          allowedActions: ['retry'],
          requiresUpload: false,
        });
        setFlowState('failure');
        trackEvent('generation_failed', { reason: 'TIMEOUT', attempt: currentAttempt });
      }
    }, 12000);

    try {
      const topStyle = getTopStyle().style;
      const taste = getTaste();

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          attempt: currentAttempt,
          outfitMode: mode,
          currentStyle: currentOutfit?.style || 'Streetwear',
          preferredStyle: topStyle,
          rejectedStyles: taste.rejectedStyles,
          brightnessScore: analysisResult?.brightness.score,
          isLandscape: analysisResult?.aspectRatio.isLandscape,
          forceMode: demoControls.forceMode,
          latencyMs: demoControls.latencyMs,
        }),
      });

      // Discard stale responses if newer request launched
      if (requestIdRef.current !== currentRequestId) return;

      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (generationTimeoutRef.current) clearTimeout(generationTimeoutRef.current);
      setProgress(100);

      const data = await response.json();
      
      // Small delay for 100% progress animation smoothness
      await new Promise(r => setTimeout(r, 400));
      if (requestIdRef.current !== currentRequestId) return;

      if (data.success) {
        setCurrentOutfit(data.outfit);
        setFlowState('success');
        const tasteState = getTaste();
        setRecommendation(buildRecommendationReason(data.outfit, tasteState));
        trackEvent('try_on_success', { outfit: data.outfit.name, style: data.outfit.style, attempt: currentAttempt });
      } else {
        setFailure(data.failure);
        setFlowState('failure');
        trackEvent('generation_failed', { reason: data.failure.code, attempt: currentAttempt });
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        // Request aborted cleanly
        return;
      }
      if (requestIdRef.current !== currentRequestId) return;

      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (generationTimeoutRef.current) clearTimeout(generationTimeoutRef.current);

      setFailure({
        code: 'NETWORK_ERROR',
        category: 'system',
        title: "We couldn't reach the try-on service",
        description: 'A network connection issue interrupted processing. Your uploaded photo has been preserved so you can retry.',
        primaryAction: 'retry',
        allowedActions: ['retry'],
        requiresUpload: false,
      });
      setFlowState('failure');
      trackEvent('generation_failed', { reason: 'NETWORK_ERROR', attempt: currentAttempt });
    }
  }, [analysisResult, currentOutfit, demoControls]);

  // Handle continue from upload
  const handleContinue = useCallback(() => {
    const targetAttempt = attemptRef.current;
    startGeneration('default', targetAttempt);
  }, [startGeneration]);

  // Handle Cause-Specific Recovery Actions
  const handleRecoveryAction = useCallback((action: RecoveryAction) => {
    const nextAttempt = attemptRef.current + 1;
    updateAttempt(nextAttempt);

    switch (action) {
      case 'upload_brighter':
        trackEvent('recovery_upload_brighter_clicked', { attempt: nextAttempt });
        setUploadTipHighlight('💡 Tip: Please select or upload a photo with brighter, even lighting.');
        setFlowState('upload');
        break;

      case 'upload_full_body':
        trackEvent('recovery_upload_full_body_clicked', { attempt: nextAttempt });
        setUploadTipHighlight('💡 Tip: Please select a photo where your full body (head to toe) is visible.');
        setFlowState('upload');
        break;

      case 'upload_solo':
        trackEvent('recovery_upload_solo_clicked', { attempt: nextAttempt });
        setUploadTipHighlight('💡 Tip: Please select a photo featuring only yourself.');
        setFlowState('upload');
        break;

      case 'different_outfit':
        trackEvent('different_outfit_selected', { attempt: nextAttempt });
        startGeneration('different', nextAttempt);
        break;

      case 'similar_style':
        trackEvent('similar_style_selected', { 
          attempt: nextAttempt, 
          style: currentOutfit?.style || 'Streetwear' 
        });
        startGeneration('similar', nextAttempt);
        break;

      case 'not_my_style': {
        const style = currentOutfit?.style || 'Streetwear';
        trackEvent('style_rejected', { style, attempt: nextAttempt });
        rejectStyle(style);
        showToast("Got it — dialling back that style.");
        setTimeout(() => {
          startGeneration('different', nextAttempt);
        }, 1200);
        break;
      }

      case 'retry':
      default:
        trackEvent('retry_clicked', { attempt: nextAttempt });
        startGeneration('default', nextAttempt);
        break;
    }
  }, [updateAttempt, currentOutfit, startGeneration, showToast]);

  // Handle taste feedback
  const handleTasteFeedback = useCallback((feedback: TasteFeedback) => {
    if (!currentOutfit) return;

    const style = currentOutfit.style;
    trackEvent('feedback_given', { feedback, style });

    switch (feedback) {
      case 'more_like_this':
        updateTasteFromFeedback(style, 'more_like_this');
        showToast("Saved preference — we'll recommend more looks in this style!");
        break;

      case 'less_like_this':
        updateTasteFromFeedback(style, 'less_like_this');
        showToast("Saved preference — dialling back this style.");
        break;

      case 'save':
        trackEvent('look_saved', { outfit: currentOutfit.name, style });
        showToast("Saved look to your personal session wardrobe!");
        break;
    }
  }, [currentOutfit, showToast]);

  // Taste Loop Continuation — Show Me Another Look
  const handleShowNextLook = useCallback(() => {
    const nextAttempt = attemptRef.current + 1;
    updateAttempt(nextAttempt);
    trackEvent('show_next_look_clicked', { attempt: nextAttempt });
    startGeneration('similar', nextAttempt);
  }, [updateAttempt, startGeneration]);

  // Reset Taste Engine
  const handleResetTasteState = useCallback(() => {
    resetTaste();
    showToast("Taste preferences reset to baseline defaults.");
    trackEvent('taste_reset', {});
  }, [showToast]);

  // Start over completely
  const handleStartOver = useCallback(() => {
    setFlowState('upload');
    updateAttempt(1);
    setSelectedFile(null);
    if (previewUrl) {
      try { URL.revokeObjectURL(previewUrl); } catch { /* ignore */ }
    }
    setPreviewUrl(null);
    setUploadError(null);
    setIsValid(false);
    setAnalysisResult(null);
    setUploadTipHighlight(null);
    setFailure(null);
    setCurrentOutfit(null);
    setProgress(0);
    setToastMessage(null);
    setRecommendation('');
  }, [previewUrl, updateAttempt]);

  return (
    <main className="flex-1 flex flex-col">
      {/* Top Header */}
      <header className="w-full border-b border-card-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-bold text-foreground flex items-center gap-2">
              Try-On Recovery & Taste Loop
            </h1>
            <p className="text-xs text-muted-foreground">Flickd Product Concept Prototype</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowDemoControls(!showDemoControls)}
              className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors border border-accent/20 flex items-center gap-1.5"
            >
              <span>⚙️ Dev Controls</span>
            </button>

            <Link
              href="/metrics"
              className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors underline underline-offset-2"
            >
              Metrics Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Demo Mode Explanation Banner (Phase 1) */}
      <div className="w-full bg-info-light/60 border-b border-info/20 px-4 py-2.5">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-info">
          <div className="flex items-start gap-2">
            <span className="font-bold text-sm shrink-0">💡 Demo Mode:</span>
            <span>
              The 1st try-on attempt is <strong>intentionally simulated to fail</strong> to demonstrate cause-specific recovery pathways. Failures in this prototype do not imply a real flaw in your uploaded photo.
            </span>
          </div>
        </div>
      </div>

      {/* Developer / Demo Controls Panel Overlay (Phase 7) */}
      {showDemoControls && (
        <div className="w-full bg-card border-b border-card-border p-4 shadow-md animate-slide-down">
          <div className="max-w-3xl mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-accent">🛠️ Developer / Demo Simulation Panel</h3>
              <button 
                type="button" 
                onClick={() => setShowDemoControls(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Close ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-foreground">Force Outcome Mode:</label>
                <select
                  value={demoControls.forceMode}
                  onChange={(e) => setDemoControls({ ...demoControls, forceMode: e.target.value as DemoControls['forceMode'] })}
                  className="w-full p-2 rounded-lg bg-background border border-card-border text-foreground font-medium"
                >
                  <option value="auto">Auto (Attempt 1 Fails → Attempt 2+ Succeeds)</option>
                  <option value="success">Force Success (Always Succeed)</option>
                  <option value="LOW_LIGHT">Force Failure: LOW_LIGHT (Dark Photo)</option>
                  <option value="FULL_BODY_NOT_VISIBLE">Force Failure: FULL_BODY_NOT_VISIBLE</option>
                  <option value="MULTIPLE_PEOPLE">Force Failure: MULTIPLE_PEOPLE</option>
                  <option value="OUTFIT_FIT_FAILURE">Force Failure: OUTFIT_FIT_FAILURE</option>
                  <option value="NETWORK_ERROR">Force Failure: NETWORK_ERROR</option>
                  <option value="TIMEOUT">Force Failure: TIMEOUT</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-foreground">Simulated Generation Latency:</label>
                <select
                  value={demoControls.latencyMs}
                  onChange={(e) => setDemoControls({ ...demoControls, latencyMs: Number(e.target.value) })}
                  className="w-full p-2 rounded-lg bg-background border border-card-border text-foreground font-medium"
                >
                  <option value={800}>Fast (800ms)</option>
                  <option value={3500}>Normal Demo (3.5s)</option>
                  <option value={7000}>Slow (7s)</option>
                </select>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Current Mode: <strong className="text-foreground">{demoControls.forceMode}</strong> &middot; Latency: <strong className="text-foreground">{demoControls.latencyMs}ms</strong>
            </p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-start">
        <div className="w-full max-w-2xl mx-auto px-4 py-6 md:py-10">
          
          {/* Upload Screen */}
          {flowState === 'upload' && (
            <div className="animate-fade-in space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  Start your virtual try-on
                </h2>
                <p className="text-muted-foreground text-sm">
                  Upload a photo to see yourself in curated outfit recommendations.
                </p>
              </div>

              {/* Specific Guidance Highlight when returning from Recovery */}
              {uploadTipHighlight && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2 animate-bounce-short">
                  <span>{uploadTipHighlight}</span>
                </div>
              )}

              <PhotoGuidance />

              <UploadCard
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                previewUrl={previewUrl}
                error={uploadError}
                isValidating={isValidating}
              />

              <UploadValidation
                file={selectedFile}
                isValid={isValid}
                error={uploadError}
                analysis={analysisResult}
              />

              <button
                type="button"
                onClick={handleContinue}
                disabled={!isValid || isValidating}
                className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm transition-all
                  disabled:opacity-40 disabled:cursor-not-allowed
                  bg-accent text-white hover:bg-accent-hover 
                  active:scale-[0.98] shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Continue to generation"
              >
                Continue to Try-On Generation
              </button>
            </div>
          )}

          {/* Generating Screen */}
          {flowState === 'generating' && (
            <div className="animate-fade-in">
              <GenerationProgress
                progress={progress}
                stage={getStageLabel(progress)}
                onCancel={handleCancelGeneration}
              />
            </div>
          )}

          {/* Failure + Recovery Screen */}
          {flowState === 'failure' && failure && (
            <div className="animate-fade-in space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  Try-On Recovery Diagnostic
                </h2>
                <p className="text-muted-foreground text-sm">
                  We identified an issue during avatar generation. Choose a cause-specific action below:
                </p>
              </div>

              <FailureCard failure={failure} />

              <RecoveryActions
                failure={failure}
                onAction={handleRecoveryAction}
                currentStyle={currentOutfit?.style || 'Streetwear'}
              />

              <button
                type="button"
                onClick={handleStartOver}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-2 underline underline-offset-2"
              >
                Start over with a new photo
              </button>
            </div>
          )}

          {/* Success Screen */}
          {flowState === 'success' && currentOutfit && (
            <div className="animate-fade-in space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  Your Personalized Try-On
                </h2>
                {recommendation && (
                  <RecommendationReason reason={recommendation} />
                )}
              </div>

              <TryOnResult outfit={currentOutfit} />

              <TasteFeedbackComponent
                onFeedback={handleTasteFeedback}
                toastMessage={toastMessage}
                onNextLook={handleShowNextLook}
                onResetTaste={handleResetTasteState}
              />

              <button
                type="button"
                onClick={handleStartOver}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-2 underline underline-offset-2"
              >
                Start over with a new photo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-card-border py-4 mt-auto">
        <p className="text-center text-[11px] text-muted-foreground font-medium">
          Independent Product Concept &middot; Satjeet Singh
        </p>
      </footer>
    </main>
  );
}

