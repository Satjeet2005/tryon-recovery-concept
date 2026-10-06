'use client';

import { useEffect, useState } from 'react';

interface RecoveryBreakdownProps {
  actions: { tryAgain: number; differentOutfit: number; similarStyle: number; notMyStyle: number };
}

export function RecoveryBreakdown({ actions }: RecoveryBreakdownProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const data = [
    { label: 'Try again', value: actions.tryAgain, opacity: '1' },
    { label: 'Different outfit', value: actions.differentOutfit, opacity: '0.8' },
    { label: 'Similar style', value: actions.similarStyle, opacity: '0.6' },
    { label: 'Not my style', value: actions.notMyStyle, opacity: '0.4' },
  ];

  return (
    <div className="bg-card border border-card-border rounded-2xl p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground">Recovery Action Distribution</h3>
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
                  className="h-full bg-accent transition-all duration-1000 ease-out rounded-full"
                  style={{ width: mounted ? `${pct}%` : '0%', opacity: item.opacity }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
