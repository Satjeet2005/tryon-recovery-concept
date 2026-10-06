'use client';

import { useEffect, useState } from 'react';

interface TasteFeedbackBreakdownProps {
  feedback: { moreLikeThis: number; lessLikeThis: number; saved: number };
}

export function TasteFeedbackBreakdown({ feedback }: TasteFeedbackBreakdownProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const data = [
    { label: 'More like this', value: feedback.moreLikeThis, color: 'bg-success' },
    { label: 'Less like this', value: feedback.lessLikeThis, color: 'bg-error' },
    { label: 'Saved', value: feedback.saved, color: 'bg-info' },
  ];

  return (
    <div className="bg-card border border-card-border rounded-2xl p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground">Taste Feedback Distribution</h3>
        <span className="text-xs font-medium bg-muted/20 text-muted-foreground px-2 py-1 rounded-full hidden sm:inline-block">Demo Data</span>
      </div>
      
      <div className="space-y-5">
        {data.map((item) => {
          const pct = Math.round(item.value * 100);
          return (
            <div key={item.label}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-foreground">{item.label}</span>
                <span className="text-sm font-semibold text-foreground">{pct}%</span>
              </div>
              <div className="h-3 bg-muted/20 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ease-out rounded-full ${item.color}`}
                  style={{ width: mounted ? `${pct}%` : '0%' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
