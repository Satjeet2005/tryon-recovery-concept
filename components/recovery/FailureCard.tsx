'use client';

import React from 'react';
import { FailureReason } from '@/lib/types';

interface FailureCardProps {
  failure: FailureReason;
}

export function FailureCard({ failure }: FailureCardProps) {
  return (
    <div className="w-full max-w-md mx-auto p-5 bg-warning-light border border-warning/20 rounded-xl animate-slide-up">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-0.5">
          <svg className="w-6 h-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-medium text-foreground mb-1">{failure.title || "Something went wrong"}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{failure.description}</p>
        </div>
      </div>
    </div>
  );
}
