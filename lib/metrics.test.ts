import { describe, it, expect } from 'vitest';
import { calculateSessionFunnel } from './metrics';
import { AnalyticsEvent } from './types';

describe('Live Session Metrics Calculator', () => {
  it('calculates funnel metrics accurately from event telemetry', () => {
    const mockEvents: AnalyticsEvent[] = [
      { id: '1', event: 'upload_started', timestamp: '2026-10-06T12:00:00Z', properties: {} },
      { id: '2', event: 'upload_validated', timestamp: '2026-10-06T12:00:01Z', properties: {} },
      { id: '3', event: 'generation_started', timestamp: '2026-10-06T12:00:02Z', properties: { attempt: 1 } },
      { id: '4', event: 'generation_failed', timestamp: '2026-10-06T12:00:05Z', properties: { attempt: 1, reason: 'LOW_LIGHT' } },
      { id: '5', event: 'recovery_upload_brighter_clicked', timestamp: '2026-10-06T12:00:10Z', properties: { attempt: 2 } },
      { id: '6', event: 'generation_started', timestamp: '2026-10-06T12:00:15Z', properties: { attempt: 2 } },
      { id: '7', event: 'try_on_success', timestamp: '2026-10-06T12:00:18Z', properties: { attempt: 2 } },
      { id: '8', event: 'feedback_given', timestamp: '2026-10-06T12:00:20Z', properties: { feedback: 'more_like_this' } },
    ];

    const funnel = calculateSessionFunnel(mockEvents);

    expect(funnel.totalEvents).toBe(8);
    expect(funnel.uploadsStarted).toBe(1);
    expect(funnel.uploadsValidated).toBe(1);
    expect(funnel.generationStarts).toBe(2);
    expect(funnel.firstAttemptFailures).toBe(1);
    expect(funnel.secondAttemptStarts).toBe(1);
    expect(funnel.successfulGenerations).toBe(1);
    expect(funnel.recoveryActionsCount).toBe(1);
    expect(funnel.tasteFeedbackCount).toBe(1);
    expect(funnel.secondAttemptRate).toBe('100.0%');
    expect(funnel.recoveryRate).toBe('100.0%');
  });

  it('returns "Not enough session data" when 0 first-attempt failures occur', () => {
    const mockEvents: AnalyticsEvent[] = [
      { id: '1', event: 'upload_started', timestamp: '2026-10-06T12:00:00Z', properties: {} },
    ];

    const funnel = calculateSessionFunnel(mockEvents);

    expect(funnel.secondAttemptRate).toBe('Not enough session data');
    expect(funnel.recoveryRate).toBe('Not enough session data');
  });
});
