'use client';

import { ImageAnalysisResult } from '@/lib/types';

interface UploadValidationProps {
  file: File | null;
  isValid: boolean;
  error: string | null;
  analysis?: ImageAnalysisResult | null;
}

export default function UploadValidation({ file, isValid, error, analysis }: UploadValidationProps) {
  if (!file) return null;

  return (
    <div className="w-full mt-3 space-y-3 animate-fade-in" role="region" aria-label="Photo validation report">
      {isValid && !error ? (
        <div className="p-4 rounded-xl bg-card border border-card-border shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 shrink-0 rounded-full bg-success flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Image Passes Technical Requirements</p>
              <p className="text-xs text-muted-foreground">Automated checks verified format, file size, and minimum resolution (&ge;640×640px).</p>
            </div>
          </div>

          {/* Automated Check Badges */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-card-border/50 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-success-light text-success font-medium">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Format: JPG/PNG/WebP
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-success-light text-success font-medium">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Size: &le; 5MB
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-success-light text-success font-medium">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Resolution: &ge; 640×640px
            </span>
          </div>

          {/* Client-side Advisory Signals */}
          {analysis && (
            <div className="space-y-2 pt-2 border-t border-card-border/50 text-xs">
              <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Client Advisory Quality Signals</p>
              
              {/* Brightness Advisory */}
              {analysis.brightness.status === 'warning' ? (
                <div className="p-2.5 rounded-lg bg-warning-light/40 border border-warning/30 text-amber-900 flex items-start gap-2">
                  <svg className="w-4 h-4 text-warning shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <span className="font-semibold text-amber-800">Lighting Advisory: </span>
                    <span>{analysis.brightness.message} (Luminance score: {analysis.brightness.score}/255).</span>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200/60 text-emerald-900 flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong className="text-emerald-700">Good Lighting Signal:</strong> Canvas luminance score looks bright ({analysis.brightness.score}/255).</span>
                </div>
              )}

              {/* Aspect Ratio Advisory */}
              {analysis.aspectRatio.status === 'warning' && (
                <div className="p-2.5 rounded-lg bg-info-light/40 border border-info/30 text-info flex items-start gap-2">
                  <svg className="w-4 h-4 text-info shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <span className="font-semibold">Framing Advisory: </span>
                    <span>{analysis.aspectRatio.message}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : error ? (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-error-light/40 border border-error-light">
          <div className="w-8 h-8 shrink-0 rounded-full bg-error flex items-center justify-center text-white mt-0.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-error text-sm">Validation Check Failed</p>
            <p className="text-xs text-error/90 mt-0.5">{error}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

