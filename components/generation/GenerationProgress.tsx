'use client';

import React from 'react';

interface GenerationProgressProps {
  progress: number;
  stage: string;
}

export function GenerationProgress({ progress, stage }: GenerationProgressProps) {
  const stages = [
    { label: "Reading your photo", threshold: 25 },
    { label: "Building your avatar", threshold: 60 },
    { label: "Fitting the outfit", threshold: 90 },
    { label: "Preparing your look", threshold: 100 },
  ];

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-card border border-card-border rounded-xl shadow-sm animate-fade-in">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold text-foreground mb-1">{stage}</h2>
        <p className="text-sm text-muted-foreground">Usually takes a few seconds</p>
      </div>

      <div className="w-full h-2 bg-muted/20 rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-accent transition-all duration-300 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-4">
        {stages.map((s, idx) => {
          const isCompleted = progress >= s.threshold;
          const isCurrent = progress < s.threshold && (idx === 0 || progress >= stages[idx - 1].threshold);
          
          return (
            <div key={idx} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                {isCompleted ? (
                  <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : isCurrent ? (
                  <span className="w-3 h-3 bg-accent rounded-full animate-gentle-pulse" />
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

      <div className="mt-8 text-center">
        <p className="text-[10px] text-muted opacity-50">Demo generation — no real AI model is running.</p>
      </div>
    </div>
  );
}
