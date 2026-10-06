'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DEMO_METRICS } from '@/lib/demo-data';
import { getEvents, subscribe, clearEvents } from '@/lib/analytics';
import { AnalyticsEvent } from '@/lib/types';
import { MetricCard } from '@/components/metrics/MetricCard';

export default function MetricsPage() {
  const [events, setEvents] = useState<AnalyticsEvent[]>(() =>
    typeof window !== 'undefined' ? getEvents() : []
  );

  useEffect(() => {
    return subscribe(() => {
      setEvents(getEvents());
    });
  }, []);

  const handleClearSessionEvents = () => {
    clearEvents();
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-10">
        
        {/* Header */}
        <header className="animate-fade-in space-y-4">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground font-medium transition-colors">
            &larr; Return to Try-On Experience
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-1">Prototype Metrics & Hypothesis</h1>
              <p className="text-sm text-muted-foreground">Measuring the product impact of cause-specific try-on recovery</p>
            </div>
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-amber-50 text-amber-900 text-xs font-semibold border border-amber-200 shrink-0 self-start sm:self-auto">
              <span>📊 Dataset: Illustrative Prototype Baseline</span>
            </div>
          </div>
        </header>

        {/* Section 1: Product Hypothesis Definition */}
        <section className="bg-card border border-card-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6 animate-slide-up">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Core Product Hypothesis</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-info-light text-info border border-info/30">
              A/B Test Design
            </span>
          </div>

          <p className="text-base text-foreground leading-relaxed">
            When virtual try-on generation fails, providing <strong>cause-specific diagnosis and actionable recovery choices</strong> leads to higher user re-engagement and successful try-ons compared to generic <em>&quot;Try Again&quot;</em> retries.
          </p>

          {/* Comparison Table */}
          <div className="overflow-x-auto border border-card-border rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/20 text-muted-foreground font-semibold border-b border-card-border">
                <tr>
                  <th className="p-3">Dimension</th>
                  <th className="p-3">Control (Generic Retry)</th>
                  <th className="p-3 text-accent font-bold">Variant (Diagnosed Recovery)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border/60">
                <tr>
                  <td className="p-3 font-medium">User Re-engagement (2nd Try)</td>
                  <td className="p-3 text-muted-foreground">{DEMO_METRICS.hypothesisComparison.genericRetry.secondTryRate}</td>
                  <td className="p-3 font-bold text-accent">{DEMO_METRICS.hypothesisComparison.diagnosedRecovery.secondTryRate}</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Recovery Success Rate</td>
                  <td className="p-3 text-muted-foreground">{DEMO_METRICS.hypothesisComparison.genericRetry.recoverySuccessRate}</td>
                  <td className="p-3 font-bold text-accent">{DEMO_METRICS.hypothesisComparison.diagnosedRecovery.recoverySuccessRate}</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Captured User Intent Signal</td>
                  <td className="p-3 text-muted-foreground">{DEMO_METRICS.hypothesisComparison.genericRetry.userIntentCaptured}</td>
                  <td className="p-3 font-bold text-accent">{DEMO_METRICS.hypothesisComparison.diagnosedRecovery.userIntentCaptured}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-muted-foreground italic">Note: Table represents the target illustrative hypothesis model for product evaluation.</p>
        </section>

        {/* Section 2: Primary Baseline Metrics with Explicit Denominators */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Primary Metrics</h2>
              <p className="text-xs text-muted-foreground">Every metric explicitly states its calculation denominator</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-muted/20 text-muted-foreground text-xs font-semibold">
              Illustrative Baseline (100 Sessions)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard 
              label="First-Try Success Rate" 
              value="72.0%" 
              sublabel="72 successful 1st attempts / 100 total sessions" 
            />
            <MetricCard 
              label="Failed → Recovered Rate" 
              value="67.9%" 
              sublabel="19 recovered sessions / 28 failed 1st attempts" 
              highlight={true} 
            />
            <MetricCard 
              label="Second-Try Engagement" 
              value="85.7%" 
              sublabel="24 second attempts / 28 failed 1st attempts" 
            />
          </div>
        </section>

        {/* Section 3: Failure Reasons & Recovery Breakdown */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Failure Reasons Breakdown */}
          <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-foreground">Recovery by Failure Reason</h3>
            <p className="text-xs text-muted-foreground">Success rate of user recovery grouped by initial failure cause</p>

            <div className="space-y-3 pt-2">
              {DEMO_METRICS.byFailureReason.map((item) => (
                <div key={item.code} className="p-3 rounded-lg bg-muted/10 border border-card-border/60 text-xs space-y-1">
                  <div className="flex justify-between font-medium text-foreground">
                    <span>{item.label}</span>
                    <span className="font-bold">{Math.round(item.rate * 100)}% Recovered</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-[11px]">
                    <span>Occurrences: {item.count} sessions</span>
                    <span>{item.recovered} / {item.count} recovered</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recovery Actions Distribution */}
          <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-foreground">Recovery Action Efficiency</h3>
            <p className="text-xs text-muted-foreground">Success rate resulting from each specific recovery choice</p>

            <div className="space-y-3 pt-2">
              {DEMO_METRICS.byRecoveryAction.map((item) => (
                <div key={item.action} className="p-3 rounded-lg bg-muted/10 border border-card-border/60 text-xs space-y-1">
                  <div className="flex justify-between font-medium text-foreground">
                    <span>{item.label}</span>
                    <span className="font-bold text-accent">{Math.round(item.successRate * 100)}% Success</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-[11px]">
                    <span>Selected: {item.selectedCount} times</span>
                    <span>{item.successCount} / {item.selectedCount} succeeded</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: Live Session Telemetry Log */}
        <section className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-sm animate-slide-up">
          <div className="p-6 md:p-8 border-b border-card-border flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h2 className="text-xl font-bold text-foreground">Live Browser Session Telemetry</h2>
              </div>
              <p className="text-muted-foreground text-xs">Real-time event stream captured during your current browser session</p>
            </div>
            
            {events.length > 0 && (
              <button
                type="button"
                onClick={handleClearSessionEvents}
                className="px-3 py-1.5 text-xs font-medium bg-muted/20 hover:bg-muted/30 text-foreground rounded-lg transition-colors shrink-0"
              >
                Clear Log
              </button>
            )}
          </div>
          
          <div className="p-6 md:p-8">
            {events.length === 0 ? (
              <div className="text-center py-10 bg-muted/10 rounded-xl border border-dashed border-card-border space-y-2">
                <p className="text-muted-foreground font-medium text-sm">No live session events captured yet.</p>
                <p className="text-xs text-muted">Interact with the try-on experience on the home page to see live telemetry stream here!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                {[...events].reverse().map((event, i) => (
                  <div key={event.id || i} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 p-3.5 rounded-xl bg-background border border-card-border/60 text-xs">
                    <div className="flex-none pt-0.5">
                      <span className="inline-flex px-2.5 py-1 rounded bg-accent/10 text-accent font-mono font-semibold text-[11px]">
                        {event.event}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      {event.properties && Object.keys(event.properties).length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(event.properties).map(([k, v]) => (
                            <span key={k} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-muted/10 text-muted-foreground border border-muted/20">
                              <strong className="mr-1 text-foreground">{k}:</strong>
                              <span className="truncate max-w-[180px]">{String(v)}</span>
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-1.5 text-[10px] text-muted">
                        {new Date(event.timestamp).toLocaleTimeString()} &middot; {new Date(event.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-card-border text-center text-xs text-muted-foreground space-y-1">
          <p className="font-medium">Illustrative prototype dataset &middot; Not production analytics</p>
          <p>Independent Product Concept &middot; Satjeet Singh</p>
        </footer>
      </div>
    </div>
  );
}

