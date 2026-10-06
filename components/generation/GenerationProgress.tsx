'use client';

import React from 'react';

interface GenerationProgressProps {
  progress: number;
  stage: string;
  onCancel?: () => void;
}

export function GenerationProgress({ progress, stage, onCancel }: GenerationProgressProps) {
  const stages = [
    { label: "Reading your photo", threshold: 25 },
    { label: "Building your avatar", threshold: 60 },
    { label: "Fitting the outfit", threshold: 90 },
    { label: "Preparing your look", threshold: 100 },
  ];

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-card border border-card-border rounded-xl shadow-sm animate-fade-in space-y-6">
      <div className="text-center" aria-live="polite" role="status">
        <h2 className="text-xl font-semibold text-foreground mb-1">{stage}</h2>
        <p className="text-xs text-muted-foreground">Usually takes a few seconds in demo mode</p>
      </div>

      {/* Accessibility progressbar */}
      <div 
        className="w-full h-2.5 bg-muted/20 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Generation progress"
      >
        <div 
          className="h-full bg-accent transition-all duration-300 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-3.5">
        {stages.map((s, idx) => {
          const isCompleted = progress >= s.threshold;
          const isCurrent = progress < s.threshold && (idx === 0 || progress >= stages[idx - 1].threshold);
          
          return (
            <div key={idx} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                {isCompleted ? (
                  <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : isCurrent ? (
                  <span className="w-3.5 h-3.5 bg-accent rounded-full animate-gentle-pulse" />
                ) : (
                  <span className="w-3 h-3 border-2 border-muted/30 rounded-full" />
                )}
              </div>
              <span className={`text-sm ${isCompleted ? 'text-foreground' : isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-card-border/50 flex items-center justify-between gap-4 text-xs">
        <span className="text-muted-foreground text-[11px]">Demo processing — simulated AI generation</span>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1 bg-muted/20 hover:bg-muted/30 text-foreground font-medium rounded transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

