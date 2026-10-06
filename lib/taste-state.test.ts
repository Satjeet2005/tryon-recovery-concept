import { describe, it, expect, beforeEach } from 'vitest';
import { getTaste, updateTasteFromFeedback, rejectStyle, getTopStyle, resetTaste } from './taste-state';

describe('Taste State Management', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.clear();
    }
    resetTaste();
  });

  it('provides default taste preferences on initialization', () => {
    const taste = getTaste();
    expect(taste.styles.streetwear).toBe(0.7);
    expect(taste.styles.minimal).toBe(0.5);
    expect(taste.rejectedStyles).toEqual([]);
  });

  it('increases style score on "more_like_this" feedback', () => {
    const updated = updateTasteFromFeedback('streetwear', 'more_like_this');
    expect(updated.styles.streetwear).toBeCloseTo(0.85);
  });

  it('decreases style score on "less_like_this" feedback', () => {
    const updated = updateTasteFromFeedback('streetwear', 'less_like_this');
    expect(updated.styles.streetwear).toBeCloseTo(0.45);
  });

  it('adds style to rejectedStyles and penalizes score on rejectStyle', () => {
    const updated = rejectStyle('streetwear');
    expect(updated.rejectedStyles).toContain('streetwear');
    expect(updated.styles.streetwear).toBeLessThan(0.7);
  });

  it('calculates the top non-rejected style accurately', () => {
    expect(getTopStyle().style).toBe('streetwear');

    rejectStyle('streetwear');
    const newTop = getTopStyle();
    expect(newTop.style).not.toBe('streetwear');
    expect(newTop.style).toBe('casual');
  });

  it('persists taste state to sessionStorage when window is available', () => {
    updateTasteFromFeedback('minimal', 'more_like_this');
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const stored = sessionStorage.getItem('demo_taste');
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.styles.minimal).toBeCloseTo(0.65);
    }
  });
});
