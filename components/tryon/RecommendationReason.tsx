'use client';

import React from 'react';

interface RecommendationReasonProps {
  reason: string;
}

export function RecommendationReason({ reason }: RecommendationReasonProps) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-info-light/50 border border-info/10 rounded-full mb-4">
      <svg className="w-3.5 h-3.5 text-info flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
      <span className="text-xs font-medium text-muted-foreground">
        {reason}
      </span>
    </div>
  );
}
