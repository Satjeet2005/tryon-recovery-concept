'use client';

import React from 'react';
import type { RecoveryAction } from '@/lib/types';

interface RecoveryActionsProps {
  onAction: (action: RecoveryAction) => void;
  currentStyle: string;
}

export function RecoveryActions({ onAction, currentStyle }: RecoveryActionsProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <h4 className="text-sm font-medium text-foreground mb-4">What would you like to do?</h4>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Try again — primary, most prominent */}
        <button 
          onClick={() => onAction('retry')}
          className="flex flex-col items-center justify-center p-4 bg-accent text-white rounded-xl hover:bg-accent-hover transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent shadow-sm"
          aria-label="Try again with same photo and outfit"
        >
          <svg className="w-5 h-5 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="font-medium text-sm">Try again</span>
          <span className="text-xs text-white/70 mt-1">Same photo, same outfit</span>
        </button>

        {/* Different outfit */}
        <button 
          onClick={() => onAction('different_outfit')}
          className="flex flex-col items-center justify-center p-4 bg-card border border-card-border text-foreground rounded-xl hover:bg-muted/10 transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
          aria-label="Keep photo, try different outfit"
        >
          <svg className="w-5 h-5 mb-2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span className="font-medium text-sm">Different outfit</span>
          <span className="text-xs text-muted-foreground mt-1 text-center">Keep my photo, new outfit</span>
        </button>

        {/* Similar style */}
        <button 
          onClick={() => onAction('similar_style')}
          className="flex flex-col items-center justify-center p-4 bg-card border border-card-border text-foreground rounded-xl hover:bg-muted/10 transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
          aria-label={`Show more ${currentStyle} looks`}
        >
          <svg className="w-5 h-5 mb-2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <span className="font-medium text-sm">Similar style</span>
          <span className="text-xs text-muted-foreground mt-1 text-center">More {currentStyle} looks</span>
        </button>

        {/* Not my style */}
        <button 
          onClick={() => onAction('not_my_style')}
          className="flex flex-col items-center justify-center p-4 bg-transparent border border-dashed border-card-border text-foreground rounded-xl hover:bg-muted/10 transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
          aria-label="This is not my style, show something different"
        >
          <svg className="w-5 h-5 mb-2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="font-medium text-sm">Not my style</span>
          <span className="text-xs text-muted-foreground mt-1 text-center">Show me something different</span>
        </button>
      </div>
    </div>
  );
}
