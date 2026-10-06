'use client';

import React from 'react';
import type { RecoveryAction, FailureReason } from '@/lib/types';

interface RecoveryActionsProps {
  failure: FailureReason;
  onAction: (action: RecoveryAction) => void;
  currentStyle?: string;
  isLoading?: boolean;
}

export function RecoveryActions({ failure, onAction, currentStyle, isLoading = false }: RecoveryActionsProps) {
  const primaryAction = failure.primaryAction;

  const renderActionButton = (action: RecoveryAction, isPrimary: boolean) => {
    const commonProps = {
      disabled: isLoading,
      'aria-busy': isLoading,
    };
    switch (action) {
      case 'upload_brighter':
        return (
          <button 
            key={action}
            onClick={() => onAction(action)}
            {...commonProps}
            className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent ${
              isPrimary ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm' : 'bg-card border border-card-border text-foreground hover:bg-muted/10'
            }`}
            aria-label="Upload a brighter photo with better lighting"
          >
            <svg className="w-5 h-5 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="font-semibold text-sm">Upload Brighter Photo</span>
            <span className={`text-xs mt-1 text-center ${isPrimary ? 'text-white/80' : 'text-muted-foreground'}`}>Choose a photo with even lighting</span>
          </button>
        );

      case 'upload_full_body':
        return (
          <button 
            key={action}
            onClick={() => onAction(action)}
            {...commonProps}
            className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent ${
              isPrimary ? 'bg-accent text-white hover:bg-accent-hover shadow-sm' : 'bg-card border border-card-border text-foreground hover:bg-muted/10'
            }`}
            aria-label="Upload a full-body photo including head to toe"
          >
            <svg className="w-5 h-5 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="font-semibold text-sm">Upload Full-Body Photo</span>
            <span className={`text-xs mt-1 text-center ${isPrimary ? 'text-white/80' : 'text-muted-foreground'}`}>Feet to shoulders clearly visible</span>
          </button>
        );

      case 'upload_solo':
        return (
          <button 
            key={action}
            onClick={() => onAction(action)}
            {...commonProps}
            className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent ${
              isPrimary ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm' : 'bg-card border border-card-border text-foreground hover:bg-muted/10'
            }`}
            aria-label="Upload a solo photo with only yourself"
          >
            <svg className="w-5 h-5 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="font-semibold text-sm">Upload Solo Photo</span>
            <span className={`text-xs mt-1 text-center ${isPrimary ? 'text-white/80' : 'text-muted-foreground'}`}>Single person in photo frame</span>
          </button>
        );

      case 'different_outfit':
        return (
          <button 
            key={action}
            onClick={() => onAction(action)}
            {...commonProps}
            className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent ${
              isPrimary ? 'bg-accent text-white hover:bg-accent-hover shadow-sm' : 'bg-card border border-card-border text-foreground hover:bg-muted/10'
            }`}
            aria-label="Try a different outfit style"
          >
            <svg className="w-5 h-5 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span className="font-semibold text-sm">Different Outfit</span>
            <span className={`text-xs mt-1 text-center ${isPrimary ? 'text-white/80' : 'text-muted-foreground'}`}>Keep photo, try new look</span>
          </button>
        );

      case 'similar_style':
        return (
          <button 
            key={action}
            onClick={() => onAction(action)}
            {...commonProps}
            className="flex flex-col items-center justify-center p-4 bg-card border border-card-border text-foreground rounded-xl hover:bg-muted/10 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
            aria-label={currentStyle ? `Try another ${currentStyle} look` : 'Try another look in a similar style'}
          >
            <svg className="w-5 h-5 mb-2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="font-semibold text-sm">Similar Style</span>
            <span className="text-xs text-muted-foreground mt-1 text-center">{currentStyle ? `More ${currentStyle} looks` : 'More like this'}</span>
          </button>
        );

      case 'not_my_style':
        return (
          <button 
            key={action}
            onClick={() => onAction(action)}
            {...commonProps}
            className="flex flex-col items-center justify-center p-4 bg-transparent border border-dashed border-card-border text-foreground rounded-xl hover:bg-muted/10 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
            aria-label="Reject this style category"
          >
            <svg className="w-5 h-5 mb-2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="font-semibold text-sm">Not My Style</span>
            <span className="text-xs text-muted-foreground mt-1 text-center">Refine taste preferences</span>
          </button>
        );

      case 'retry':
      default:
        return (
          <button 
            key={action}
            onClick={() => onAction('retry')}
            {...commonProps}
            className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent ${
              isPrimary ? 'bg-accent text-white hover:bg-accent-hover shadow-sm' : 'bg-card border border-card-border text-foreground hover:bg-muted/10'
            }`}
            aria-label="Retry generation with same photo and outfit"
          >
            <svg className="w-5 h-5 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="font-semibold text-sm">Try Again</span>
            <span className={`text-xs mt-1 text-center ${isPrimary ? 'text-white/80' : 'text-muted-foreground'}`}>Same photo, same outfit</span>
          </button>
        );
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cause-Specific Recovery Actions</h4>
        {failure.requiresUpload && (
          <span className="text-[11px] text-amber-700 font-medium">📸 Photo correction recommended</span>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Render Primary Action First */}
        {renderActionButton(primaryAction, true)}

        {/* Render Secondary Allowed Actions */}
        {failure.allowedActions
          .filter(a => a !== primaryAction)
          .map(action => renderActionButton(action, false))}
      </div>
    </div>
  );
}

