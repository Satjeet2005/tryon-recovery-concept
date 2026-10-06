import { describe, it, expect, beforeEach } from 'vitest';
import { trackEvent, getEvents, clearEvents, getSessionId, getFlowId, startNewFlow } from './analytics';

describe('Analytics & Telemetry Module', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.clear();
    }
    clearEvents();
  });

  it('attaches stable sessionId and flowId context to tracked events', () => {
    const sid = getSessionId();
    const fid = getFlowId();

    const ev = trackEvent('upload_started', { fileName: 'test.jpg' });

    expect(ev.context.sessionId).toBe(sid);
    expect(ev.context.flowId).toBe(fid);
    expect(ev.properties.fileName).toBe('test.jpg');
  });

  it('generates a new flowId on startNewFlow()', () => {
    const initialFlowId = getFlowId();
    const newFlowId = startNewFlow();

    expect(newFlowId).not.toBe(initialFlowId);
    expect(getFlowId()).toBe(newFlowId);

    const ev = trackEvent('upload_started', {});
    expect(ev.context.flowId).toBe(newFlowId);
  });

  it('supports explicit context overrides like attempt and generationId', () => {
    const ev = trackEvent('generation_started', {}, { attempt: 2, generationId: 'gen_123' });

    expect(ev.context.attempt).toBe(2);
    expect(ev.context.generationId).toBe('gen_123');
  });

  it('caps telemetry storage at 250 events max', () => {
    for (let i = 0; i < 300; i++) {
      trackEvent('test_event', { index: i });
    }

    const events = getEvents();
    expect(events.length).toBe(250);
    expect(events[events.length - 1].properties.index).toBe(299);
  });
});
