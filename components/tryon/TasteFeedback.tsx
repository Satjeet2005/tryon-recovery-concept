'use client';

import React from 'react';
import type { TasteFeedback as TasteFeedbackType } from '@/lib/types';

interface TasteFeedbackProps {
  onFeedback: (feedback: TasteFeedbackType) => void;
  toastMessage: string | null;
  onNextLook?: () => void;
  onResetTaste?: () => void;
}

export function TasteFeedback({ onFeedback, toastMessage, onNextLook, onResetTaste }: TasteFeedbackProps) {
  return (
    <div className="w-full max-w-md mx-auto mt-6 flex flex-col items-center space-y-4">
      <div className="flex items-center justify-center gap-3 w-full">
        {/* Less like this */}
        <button 
          type="button"
          onClick={() => onFeedback('less_like_this')}
          className="flex flex-col items-center gap-1.5 flex-1 py-3 px-4 rounded-xl border border-card-border bg-card text-muted-foreground hover:bg-error-light hover:text-error hover:border-error/20 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Less like this"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l2.5-5A2 2 0 017.736 5H14a2 2 0 012 2v7m-6 0v6a2 2 0 002 2h2.5a2 2 0 001.96-1.56L19 12V7" />
          </svg>
          <span className="text-xs font-medium">Less like this</span>
        </button>

        {/* More like this */}
        <button 
          type="button"
          onClick={() => onFeedback('more_like_this')}
          className="flex flex-col items-center gap-1.5 flex-1 py-3 px-4 rounded-xl border-2 border-success/20 bg-success-light text-success hover:bg-success hover:text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-success shadow-sm"
          aria-label="More like this"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-2.5 5A2 2 0 0116.264 21H10a2 2 0 01-2-2v-7m6 0V5a2 2 0 00-2-2H9.5a2 2 0 00-1.96 1.56L6 12v5" />
          </svg>
          <span className="text-xs font-medium">More like this</span>
        </button>

        {/* Save */}
        <button 
          type="button"
          onClick={() => onFeedback('save')}
          className="flex flex-col items-center gap-1.5 flex-1 py-3 px-4 rounded-xl border border-card-border bg-card text-muted-foreground hover:bg-accent hover:text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Save look"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <span className="text-xs font-medium">Save</span>
        </button>
      </div>

      {/* Show me another look CTA */}
      {onNextLook && (
        <button
          type="button"
          onClick={onNextLook}
          className="w-full py-3 px-4 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span>Show me another look</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      )}

      {/* Toast & Reset controls */}
      <div className="flex items-center justify-between w-full pt-2 text-xs">
        {onResetTaste && (
          <button
            type="button"
            onClick={onResetTaste}
            className="text-muted-foreground hover:text-foreground text-[11px] underline underline-offset-2 transition-colors"
          >
            Reset taste preferences
          </button>
        )}
        <span className="text-[10px] text-muted ml-auto">Local preference engine</span>
      </div>

      {/* Toast Message */}
      {toastMessage && (
        <div className="mt-2 px-5 py-2.5 bg-foreground text-background text-sm rounded-full shadow-lg animate-toast-enter" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

