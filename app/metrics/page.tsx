'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DEMO_METRICS } from '@/lib/demo-data';
import { getEvents, subscribe } from '@/lib/analytics';
import { AnalyticsEvent } from '@/lib/types';
import { MetricCard } from '@/components/metrics/MetricCard';
import { FunnelCard } from '@/components/metrics/FunnelCard';
import { RecoveryBreakdown } from '@/components/metrics/RecoveryBreakdown';
import { TasteFeedbackBreakdown } from '@/components/metrics/TasteFeedbackBreakdown';

export default function MetricsPage() {
  const [events, setEvents] = useState<AnalyticsEvent[]>(() =>
    typeof window !== 'undefined' ? getEvents() : []
  );

  useEffect(() => {
    return subscribe(() => {
      setEvents(getEvents());
    });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <header className="mb-10 animate-fade-in">
          <Link href="/" className="inline-block text-muted-foreground hover:text-foreground font-medium mb-6 transition-colors">
            &larr; Back to prototype
          </Link>
          
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Prototype Metrics</h1>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-warning-light text-warning text-sm font-medium border border-warning/20">
              Illustrative demo data &mdash; not real analytics
            </div>
          </div>
        </header>

        <main className="space-y-10">
          {/* Section 1: Product Hypothesis */}
          <section className="bg-info-light border border-info/20 rounded-2xl p-6 md:p-8 animate-slide-up">
            <h2 className="text-xl font-bold text-info mb-4">Product Hypothesis</h2>
            <p className="text-lg text-foreground mb-6 font-medium">
              Specific recovery guidance can turn failed try-ons into successful sessions instead of dead ends.
            </p>
            
            <div className="bg-card/50 rounded-xl p-5 border border-info/10">
              <h3 className="font-semibold text-info mb-3">How we&apos;d test it</h3>
              <ul className="space-y-2 text-foreground">
                <li className="flex items-start">
                  <span className="mr-2 text-info">&bull;</span>
                  <span>Compare: A) Generic retry vs B) Specific recovery actions</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-info">&bull;</span>
                  <span>Primary metric: Failed &rarr; successful retry rate</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2: Key Metrics */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold">Key Metrics</h2>
              <span className="px-2 py-0.5 rounded-full bg-muted/20 text-muted-foreground text-xs font-medium uppercase tracking-wider">Demo Data</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard 
                label="First Try-On Success Rate" 
                value="72%" 
                sublabel="72 of 100 uploads" 
              />
              <MetricCard 
                label="Failed &rarr; Recovered" 
                value="68%" 
                sublabel="19 of 28 failures" 
                highlight={true} 
              />
              <MetricCard 
                label="Second Try-On Rate" 
                value="41%" 
                sublabel="41 of 100 users" 
              />
            </div>
          </section>

          {/* Section 3: Funnel */}
          <section>
            <FunnelCard funnel={DEMO_METRICS.funnel} />
          </section>

          {/* Section 4: Breakdowns */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RecoveryBreakdown actions={DEMO_METRICS.recoveryActions} />
            <TasteFeedbackBreakdown feedback={DEMO_METRICS.tasteFeedback} />
          </section>

          {/* Section 5: Session Events */}
          <section className="animate-slide-up bg-card border border-card-border rounded-2xl overflow-hidden">
            <div className="p-6 md:p-8 border-b border-card-border">
              <h2 className="text-xl font-bold text-foreground mb-1">Session Events</h2>
              <p className="text-muted-foreground text-sm">Events captured during this local demo session</p>
            </div>
            
            <div className="p-6 md:p-8">
              {events.length === 0 ? (
                <div className="text-center py-10 bg-muted/10 rounded-xl border border-dashed border-card-border">
                  <p className="text-muted-foreground font-medium">No events captured yet. Try the prototype first!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {[...events].reverse().map((event, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 p-4 rounded-xl bg-background border border-card-border/50">
                      <div className="flex-none pt-0.5">
                        <span className="inline-flex px-2.5 py-1 rounded-md bg-accent/5 text-accent text-xs font-mono font-semibold">
                          {event.event}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        {event.properties && Object.keys(event.properties).length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-2">
                            {Object.entries(event.properties).map(([k, v]) => (
                              <span key={k} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted/10 text-muted-foreground border border-muted/20">
                                <span className="font-medium mr-1">{k}:</span>
                                <span className="truncate max-w-[150px]">{String(v)}</span>
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-2 text-xs text-muted-foreground">
                          {new Date(event.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>

        <footer className="mt-16 pt-8 border-t border-card-border text-center">
          <p className="text-muted-foreground text-sm font-medium mb-1">Demo data &mdash; not affiliated with any company.</p>
          <p className="text-muted-foreground text-sm">Independent Product Concept &middot; Satjeet Singh</p>
        </footer>
      </div>
    </div>
  );
}
