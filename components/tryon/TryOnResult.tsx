'use client';

import React from 'react';
import { Outfit } from '@/lib/types';

interface TryOnResultProps {
  outfit: Outfit;
}

export function TryOnResult({ outfit }: TryOnResultProps) {
  // Extract color values safely
  const color1 = outfit.color || '#a8a29e';
  const color2 = outfit.secondaryColor || '#57534e';
  
  return (
    <div className="w-full max-w-sm mx-auto animate-scale-in">
      <div className="text-center mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your look</span>
      </div>
      
      <div 
        className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border border-card-border bg-card"
        style={{ 
          background: `linear-gradient(135deg, ${color1}22 0%, ${color1}66 100%)` 
        }}
      >
        {/* CSS Silhouette */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 opacity-80">
          {/* Head */}
          <div className="w-16 h-20 rounded-full bg-muted/40 mb-2 border-2 border-white/20" />
          {/* Neck */}
          <div className="w-6 h-8 bg-muted/40 mb-[-12px] z-0" />
          {/* Torso / Top */}
          <div 
            className="w-40 h-48 rounded-t-3xl rounded-b-xl z-10 shadow-inner"
            style={{ backgroundColor: color1 }}
          >
            {/* Details on torso */}
            <div className="w-full h-full relative overflow-hidden rounded-t-3xl rounded-b-xl">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-6 bg-white/20 rounded-b-full" />
               <div className="absolute bottom-4 left-4 w-6 h-8 bg-black/10 rounded-md" />
               <div className="absolute bottom-4 right-4 w-6 h-8 bg-black/10 rounded-md" />
            </div>
          </div>
          {/* Legs / Bottoms */}
          <div className="flex gap-1 z-0 mt-[-10px]">
            <div className="w-16 h-40 rounded-b-sm" style={{ backgroundColor: color2 }} />
            <div className="w-16 h-40 rounded-b-sm" style={{ backgroundColor: color2 }} />
          </div>
        </div>

        {/* Overlay Label */}
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <h3 className="text-white font-medium text-lg leading-tight mb-1">{outfit.name}</h3>
          <p className="text-white/80 text-sm">{outfit.style}</p>
        </div>
      </div>
    </div>
  );
}
