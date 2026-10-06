'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import type { FlowState, FailureReason, Outfit, RecoveryAction, TasteFeedback } from '@/lib/types';
import { validateImage } from '@/lib/validation';
import { trackEvent } from '@/lib/analytics';
import { getTaste, updateTasteFromFeedback, rejectStyle } from '@/lib/taste-state';

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
  const [attempt, setAttempt] = useState(1);
  
  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  
  // Generation state
  const [progress, setProgress] = useState(0);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Result state
  const [failure, setFailure] = useState<FailureReason | null>(null);
  const [currentOutfit, setCurrentOutfit] = useState<Outfit | null>(null);
  const [, setOutfitMode] = useState<'default' | 'different' | 'similar'>('default');
  
  // Feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<string>('');
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File, preview: string) => {
    setUploadError(null);
    setIsValidating(true);
    setSelectedFile(file);
    setPreviewUrl(preview);
    setIsValid(false);
    
    trackEvent('upload_started', { fileName: file.name, fileSize: file.size });
    
    const result = await validateImage(file);
    setIsValidating(false);
    
    if (!result.valid) {
      setUploadError(result.error || 'Invalid image');
      setIsValid(false);
    } else {
      setUploadError(null);
      setIsValid(true);
      trackEvent('upload_validated', { fileName: file.name });
    }
  }, []);

  // Show toast with auto-dismiss
  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Start generation
  const startGeneration = useCallback(async (mode: 'default' | 'different' | 'similar' = 'default') => {
    setFlowState('generating');
    setProgress(0);
    setFailure(null);
    setOutfitMode(mode);
    
    trackEvent('generation_started', { attempt, outfitMode: mode });

    // Animate progress
    let currentProgress = 0;
    progressTimerRef.current = setInterval(() => {
      currentProgress += Math.random() * 8 + 2;
      if (currentProgress > 92) currentProgress = 92;
      setProgress(Math.floor(currentProgress));
    }, 400);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attempt,
          outfitMode: mode,
          currentStyle: currentOutfit?.style || 'Streetwear',
        }),
      });

      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setProgress(100);

      const data = await response.json();
      
      // Small delay for 100% to feel real
      await new Promise(r => setTimeout(r, 500));

      if (data.success) {
        setCurrentOutfit(data.outfit);
        setFlowState('success');
        const taste = getTaste();
        setRecommendation(buildRecommendationReason(data.outfit, taste));
        trackEvent('try_on_success', { outfit: data.outfit.name, style: data.outfit.style, attempt });
      } else {
        setFailure(data.failure);
        setFlowState('failure');
        trackEvent('generation_failed', { reason: data.failure.code, attempt });
      }
    } catch {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setFailure({
        code: 'IMAGE_QUALITY',
        title: 'Something unexpected happened',
        description: 'Please try again — this is a demo prototype and no real processing occurred.',
      });
      setFlowState('failure');
      trackEvent('generation_failed', { reason: 'NETWORK_ERROR', attempt });
    }
  }, [attempt, currentOutfit]);

  // Handle continue from upload
  const handleContinue = useCallback(() => {
    setAttempt(1);
    startGeneration('default');
  }, [startGeneration]);

  // Handle recovery actions
  const handleRecoveryAction = useCallback((action: RecoveryAction) => {
    const nextAttempt = attempt + 1;
    setAttempt(nextAttempt);

    switch (action) {
      case 'retry':
        trackEvent('retry_clicked', { attempt: nextAttempt });
        startGeneration('default');
        break;
      case 'different_outfit':
        trackEvent('different_outfit_selected', { attempt: nextAttempt });
        startGeneration('different');
        break;
      case 'similar_style':
        trackEvent('similar_style_selected', { 
          attempt: nextAttempt, 
          style: currentOutfit?.style || 'Streetwear' 
        });
        startGeneration('similar');
        break;
      case 'not_my_style': {
        const style = currentOutfit?.style || 'Streetwear';
        trackEvent('style_rejected', { style, attempt: nextAttempt });
        rejectStyle(style);
        showToast("Got it — we'll use that to refine your next looks.");
        // After a brief pause, generate with a different style
        setTimeout(() => {
          startGeneration('different');
        }, 1500);
        break;
      }
    }
  }, [attempt, currentOutfit, startGeneration, showToast]);

  // Handle taste feedback
  const handleTasteFeedback = useCallback((feedback: TasteFeedback) => {
    if (!currentOutfit) return;

    const style = currentOutfit.style;
    trackEvent('feedback_given', { feedback, style });

    switch (feedback) {
      case 'more_like_this':
        updateTasteFromFeedback(style, 'more_like_this');
        showToast("Got it — we'll show you more like this.");
        // Generate another look after brief pause
        setTimeout(() => {
          const nextAttempt = attempt + 1;
          setAttempt(nextAttempt);
          startGeneration('similar');
        }, 1500);
        break;
      case 'less_like_this':
        updateTasteFromFeedback(style, 'less_like_this');
        showToast("We'll dial this style back.");
        // Generate different style after brief pause
        setTimeout(() => {
          const nextAttempt = attempt + 1;
          setAttempt(nextAttempt);
          startGeneration('different');
        }, 1500);
        break;
      case 'save':
        trackEvent('look_saved', { outfit: currentOutfit.name, style });
        showToast("Saved to your looks.");
        break;
    }
  }, [currentOutfit, attempt, startGeneration, showToast]);

  // Start over
  const handleStartOver = useCallback(() => {
    setFlowState('upload');
    setAttempt(1);
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadError(null);
    setIsValid(false);
    setFailure(null);
    setCurrentOutfit(null);
    setProgress(0);
    setToastMessage(null);
    setRecommendation('');
  }, []);

  return (
    <main className="flex-1 flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-card-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-foreground">
              Try-On Recovery
            </h1>
            <p className="text-xs text-muted">Concept Prototype</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-info-light text-info font-medium">
              Demo Mode
            </span>
            <Link
              href="/metrics"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              Metrics
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-start">
        <div className="w-full max-w-2xl mx-auto px-4 py-6 md:py-10">
          
          {/* Upload Screen */}
          {flowState === 'upload' && (
            <div className="animate-fade-in space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
                  Let&apos;s start with a photo
                </h2>
                <p className="text-muted-foreground text-sm md:text-base">
                  Use a clear, well-lit photo where your full body is visible.
                </p>
              </div>

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
              />

              <button
                onClick={handleContinue}
                disabled={!isValid || isValidating}
                className="w-full py-3.5 px-6 rounded-xl font-medium text-sm transition-all
                  disabled:opacity-40 disabled:cursor-not-allowed
                  bg-accent text-white hover:bg-accent-hover 
                  active:scale-[0.98] shadow-sm"
                aria-label="Continue to generation"
              >
                Continue
              </button>
            </div>
          )}

          {/* Generating Screen */}
          {flowState === 'generating' && (
            <div className="animate-fade-in">
              <div className="text-center mb-8 space-y-2">
                <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
                  Creating your try-on
                </h2>
                <p className="text-muted-foreground text-sm">
                  Usually takes a few seconds
                </p>
              </div>
              <GenerationProgress
                progress={progress}
                stage={getStageLabel(progress)}
              />
            </div>
          )}

          {/* Failure + Recovery Screen */}
          {flowState === 'failure' && failure && (
            <div className="animate-fade-in space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
                  Let&apos;s try that again
                </h2>
                <p className="text-muted-foreground text-sm">
                  We hit a snag, but here are some options.
                </p>
              </div>

              <FailureCard failure={failure} />

              <RecoveryActions
                onAction={handleRecoveryAction}
                currentStyle={currentOutfit?.style || 'Streetwear'}
              />

              <button
                onClick={handleStartOver}
                className="w-full text-center text-xs text-muted hover:text-muted-foreground transition-colors py-2"
              >
                Start over with a new photo
              </button>
            </div>
          )}

          {/* Success Screen */}
          {flowState === 'success' && currentOutfit && (
            <div className="animate-fade-in space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
                  Your look
                </h2>
                {recommendation && (
                  <RecommendationReason reason={recommendation} />
                )}
              </div>

              <TryOnResult outfit={currentOutfit} />

              <TasteFeedbackComponent
                onFeedback={handleTasteFeedback}
                toastMessage={toastMessage}
              />

              <button
                onClick={handleStartOver}
                className="w-full text-center text-xs text-muted hover:text-muted-foreground transition-colors py-2"
              >
                Start over with a new photo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-card-border py-4 mt-auto">
        <p className="text-center text-[11px] text-muted">
          Independent Product Concept · Satjeet Singh
        </p>
      </footer>
    </main>
  );
}
