import { TasteState, TasteFeedback } from './types';

const STORAGE_KEY = 'demo_taste';

const DEFAULT_TASTE: TasteState = {
  styles: {
    streetwear: 0.7,
    minimal: 0.5,
    casual: 0.6,
    formal: 0.4,
    bohemian: 0.3,
  },
  preferences: {
    oversized: true,
  },
  rejectedStyles: [],
};

function loadTaste(): TasteState {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_TASTE, styles: { ...DEFAULT_TASTE.styles }, preferences: { ...DEFAULT_TASTE.preferences }, rejectedStyles: [] };
  }
  try {
    const data = sessionStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        styles: { ...DEFAULT_TASTE.styles, ...parsed.styles },
        preferences: { ...DEFAULT_TASTE.preferences, ...parsed.preferences },
        rejectedStyles: Array.isArray(parsed.rejectedStyles) ? parsed.rejectedStyles : [],
      };
    }
  } catch {
    // fallback to default
  }
  return { ...DEFAULT_TASTE, styles: { ...DEFAULT_TASTE.styles }, preferences: { ...DEFAULT_TASTE.preferences }, rejectedStyles: [] };
}

function saveTaste(state: TasteState): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

let currentTaste: TasteState = loadTaste();
let listeners: Array<() => void> = [];

export function getTaste(): TasteState {
  if (typeof window !== 'undefined') {
    currentTaste = loadTaste();
  }
  return { ...currentTaste, styles: { ...currentTaste.styles }, preferences: { ...currentTaste.preferences }, rejectedStyles: [...currentTaste.rejectedStyles] };
}

export function updateTasteFromFeedback(style: string, feedback: TasteFeedback): TasteState {
  if (typeof window !== 'undefined') {
    currentTaste = loadTaste();
  }
  const styleLower = style.toLowerCase();
  const current = currentTaste.styles[styleLower] ?? 0.5;
  
  switch (feedback) {
    case 'more_like_this':
      currentTaste.styles[styleLower] = Math.min(1, current + 0.15);
      break;
    case 'less_like_this':
      currentTaste.styles[styleLower] = Math.max(0, current - 0.25);
      break;
    case 'save':
      // Save doesn't change taste scores, it's a different signal
      break;
  }
  
  saveTaste(currentTaste);
  listeners.forEach(fn => fn());
  return getTaste();
}

export function rejectStyle(style: string): TasteState {
  if (typeof window !== 'undefined') {
    currentTaste = loadTaste();
  }
  const styleLower = style.toLowerCase();
  currentTaste.styles[styleLower] = Math.max(0, (currentTaste.styles[styleLower] ?? 0.5) - 0.35);
  if (!currentTaste.rejectedStyles.includes(styleLower)) {
    currentTaste.rejectedStyles.push(styleLower);
  }
  saveTaste(currentTaste);
  listeners.forEach(fn => fn());
  return getTaste();
}

export function getTopStyle(): { style: string; score: number } {
  const taste = getTaste();
  const entries = Object.entries(taste.styles).filter(
    ([s]) => !taste.rejectedStyles.includes(s)
  );
  if (entries.length === 0) {
    return { style: 'casual', score: 0.5 };
  }
  entries.sort((a, b) => b[1] - a[1]);
  return { style: entries[0][0], score: entries[0][1] };
}

export function resetTaste(): void {
  currentTaste = { ...DEFAULT_TASTE, styles: { ...DEFAULT_TASTE.styles }, preferences: { ...DEFAULT_TASTE.preferences }, rejectedStyles: [] };
  saveTaste(currentTaste);
  listeners.forEach(fn => fn());
}

export function subscribeTaste(fn: () => void): () => void {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter(l => l !== fn);
  };
}

