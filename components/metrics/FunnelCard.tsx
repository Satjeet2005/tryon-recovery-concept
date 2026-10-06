'use client';

import { useEffect, useState } from 'react';

interface FunnelCardProps {
  funnel: { uploads: number; firstTryOnSuccess: number; secondTryOn: number };
}

export function FunnelCard({ funnel }: FunnelCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const steps = [
    { label: 'Uploads', value: funnel.uploads, pct: 100 },
    { label: 'First Try-On Success', value: funnel.firstTryOnSuccess, pct: Math.round((funnel.firstTryOnSuccess / funnel.uploads) * 100) },
    { label: 'Second Try-On', value: funnel.secondTryOn, pct: Math.round((funnel.secondTryOn / funnel.uploads) * 100) }
  ];

  return (
    <div className="bg-card border border-card-border rounded-2xl p-6 md:p-8 animate-slide-up">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-foreground">User Funnel</h3>
        <span className="text-xs font-medium bg-muted/20 text-muted-foreground px-2 py-1 rounded-full">Demo Data</span>
      </div>
      
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={step.label} className="relative">
            <div className="flex justify-between items-end mb-2">
              <span className="font-medium text-foreground">{step.label}</span>
              <span className="text-sm text-muted-foreground">{step.value} ({step.pct}%)</span>
            </div>
            <div className="h-6 bg-muted/20 rounded-full overflow-hidden w-full">
              <div 
                className="h-full bg-accent rounded-full transition-all duration-1000 ease-out"
                style={{ width: mounted ? `${step.pct}%` : '0%' }}
              />
            </div>
            {index < steps.length - 1 && (
              <div className="absolute -bottom-5 left-8 text-muted-foreground animate-fade-in">
                &darr;
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
