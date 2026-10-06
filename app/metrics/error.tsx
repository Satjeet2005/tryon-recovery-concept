'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function MetricsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Metrics Dashboard Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="max-w-md w-full bg-card rounded-xl border border-error-border p-6 shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-error-light text-error mx-auto flex items-center justify-center mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Metrics Unavailable</h2>
        <p className="text-sm text-muted mb-6">
          Unable to load analytics metrics. You can attempt to reload the dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-primary text-primary-foreground font-medium text-sm rounded-lg hover:bg-primary/90 transition-colors"
          >
            Reload Metrics
          </button>
          <Link
            href="/"
            className="px-4 py-2 bg-secondary text-secondary-foreground font-medium text-sm rounded-lg hover:bg-secondary/80 transition-colors"
          >
            Back to App
          </Link>
        </div>
      </div>
    </div>
  );
}
