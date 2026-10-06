'use client';

interface MetricCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  highlight?: boolean;
}

export function MetricCard({ label, value, sublabel, highlight }: MetricCardProps) {
  return (
    <div className={`p-6 rounded-2xl border ${highlight ? 'bg-success-light border-success/20' : 'bg-card border-card-border'} animate-slide-up`}>
      <div className={`text-4xl font-bold tracking-tight mb-2 ${highlight ? 'text-success' : 'text-foreground'}`}>
        {value}
      </div>
      <div className="font-medium text-foreground mb-1">{label}</div>
      {sublabel && <div className="text-sm text-muted-foreground">{sublabel}</div>}
    </div>
  );
}
