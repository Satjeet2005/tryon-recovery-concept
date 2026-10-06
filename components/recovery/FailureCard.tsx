'use client';

import React from 'react';
import { FailureReason } from '@/lib/types';

interface FailureCardProps {
  failure: FailureReason;
}

export function FailureCard({ failure }: FailureCardProps) {
  const categoryColors = {
    input: 'bg-amber-100 text-amber-800 border-amber-300',
    content: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    system: 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <div className="w-full max-w-md mx-auto p-5 bg-card border border-card-border rounded-xl shadow-sm animate-slide-up space-y-3">
      {/* Top badges */}
      <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
        <span className={`px-2.5 py-0.5 rounded-full font-medium border ${categoryColors[failure.category] || categoryColors.system}`}>
          Category: {failure.category.toUpperCase()}
        </span>
        {failure.isSimulatedDemoFailure && (
          <span className="px-2.5 py-0.5 rounded-full bg-info-light text-info font-medium border border-info/30 text-[11px]">
            Demo Mode Simulated Failure
          </span>
        )}
      </div>

      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground mb-1">{failure.title || "Try-On Generation Issue"}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{failure.description}</p>
        </div>
      </div>
    </div>
  );
}

