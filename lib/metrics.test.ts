import { describe, it, expect } from 'vitest';
import { calculateSessionFunnel } from './metrics';
import { AnalyticsEvent } from './types';

describe('Live Session Metrics Calculator', () => {
  it('calculates funnel metrics accurately for a single flow sequence', () => {
    const mockEvents: AnalyticsEvent[] = [
      { id: '1', event: 'upload_started', timestamp: '2026-10-06T12:00:00Z', context: { sessionId: 's1', flowId: 'f1' }, properties: {} },
      { id: '2', event: 'upload_validated', timestamp: '2026-10-06T12:00:01Z', context: { sessionId: 's1', flowId: 'f1' }, properties: {} },
      { id: '3', event: 'generation_started', timestamp: '2026-10-06T12:00:02Z', context: { sessionId: 's1', flowId: 'f1', attempt: 1 }, properties: {} },
      { id: '4', event: 'generation_failed', timestamp: '2026-10-06T12:00:05Z', context: { sessionId: 's1', flowId: 'f1', attempt: 1 }, properties: { reason: 'LOW_LIGHT' } },
      { id: '5', event: 'recovery_upload_brighter_clicked', timestamp: '2026-10-06T12:00:10Z', context: { sessionId: 's1', flowId: 'f1', attempt: 2 }, properties: {} },
      { id: '6', event: 'generation_started', timestamp: '2026-10-06T12:00:15Z', context: { sessionId: 's1', flowId: 'f1', attempt: 2 }, properties: {} },
      { id: '7', event: 'try_on_success', timestamp: '2026-10-06T12:00:18Z', context: { sessionId: 's1', flowId: 'f1', attempt: 2 }, properties: {} },
      { id: '8', event: 'feedback_given', timestamp: '2026-10-06T12:00:20Z', context: { sessionId: 's1', flowId: 'f1', attempt: 2 }, properties: { feedback: 'more_like_this' } },
    ];

    const funnel = calculateSessionFunnel(mockEvents);

    expect(funnel.totalEvents).toBe(8);
    expect(funnel.uniqueFlowsCount).toBe(1);
    expect(funnel.firstAttemptFailures).toBe(1);
    expect(funnel.secondAttemptStarts).toBe(1);
    expect(funnel.recoveredWithin2).toBe(1);
    expect(funnel.secondAttemptRate).toBe('100.0%');
    expect(funnel.recoveryRate).toBe('100.0%');
  });

  it('separates multiple independent flows in one browser session accurately', () => {
    const mockEvents: AnalyticsEvent[] = [
      // Flow 1: fails attempt 1, succeeds attempt 2
      { id: '1', event: 'generation_started', timestamp: '2026-10-06T12:00:00Z', context: { sessionId: 's1', flowId: 'f1', attempt: 1 }, properties: {} },
      { id: '2', event: 'generation_failed', timestamp: '2026-10-06T12:00:02Z', context: { sessionId: 's1', flowId: 'f1', attempt: 1 }, properties: {} },
      { id: '3', event: 'generation_started', timestamp: '2026-10-06T12:00:05Z', context: { sessionId: 's1', flowId: 'f1', attempt: 2 }, properties: {} },
      { id: '4', event: 'try_on_success', timestamp: '2026-10-06T12:00:08Z', context: { sessionId: 's1', flowId: 'f1', attempt: 2 }, properties: {} },

      // Flow 2: fails attempt 1, abandoned (never attempts 2)
      { id: '5', event: 'generation_started', timestamp: '2026-10-06T12:01:00Z', context: { sessionId: 's1', flowId: 'f2', attempt: 1 }, properties: {} },
      { id: '6', event: 'generation_failed', timestamp: '2026-10-06T12:01:02Z', context: { sessionId: 's1', flowId: 'f2', attempt: 1 }, properties: {} },
    ];

    const funnel = calculateSessionFunnel(mockEvents);

    expect(funnel.uniqueFlowsCount).toBe(2);
    expect(funnel.firstAttemptFailures).toBe(2);
    expect(funnel.secondAttemptStarts).toBe(1);
    expect(funnel.recoveredWithin2).toBe(1);
    expect(funnel.secondAttemptRate).toBe('50.0%');
    expect(funnel.recoveryRate).toBe('50.0%');
  });

  it('returns "Not enough session data" when 0 first-attempt failures occur', () => {
    const mockEvents: AnalyticsEvent[] = [
      { id: '1', event: 'generation_started', timestamp: '2026-10-06T12:00:00Z', context: { sessionId: 's1', flowId: 'f1', attempt: 1 }, properties: {} },
      { id: '2', event: 'try_on_success', timestamp: '2026-10-06T12:00:02Z', context: { sessionId: 's1', flowId: 'f1', attempt: 1 }, properties: {} },
    ];

    const funnel = calculateSessionFunnel(mockEvents);

    expect(funnel.firstTrySuccesses).toBe(1);
    expect(funnel.firstAttemptFailures).toBe(0);
    expect(funnel.secondAttemptRate).toBe('Not enough session data');
    expect(funnel.recoveryRate).toBe('Not enough session data');
  });
});
