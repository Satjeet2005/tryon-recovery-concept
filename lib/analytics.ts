import { AnalyticsEvent, EventContext } from './types';

const STORAGE_KEY = 'demo_events';
const SESSION_ID_KEY = 'demo_telemetry_session_id';
const FLOW_ID_KEY = 'demo_telemetry_flow_id';
const MAX_EVENTS = 250;

let memorySessionId: string | null = null;
let memoryFlowId: string | null = null;

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

export function getSessionId(): string {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      let sid = sessionStorage.getItem(SESSION_ID_KEY);
      if (!sid) {
        sid = generateId('session');
        sessionStorage.setItem(SESSION_ID_KEY, sid);
      }
      memorySessionId = sid;
      return sid;
    } catch {
      // fallback to memory
    }
  }
  if (!memorySessionId) {
    memorySessionId = generateId('session');
  }
  return memorySessionId;
}

export function getFlowId(): string {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      let fid = sessionStorage.getItem(FLOW_ID_KEY);
      if (!fid) {
        fid = generateId('flow');
        sessionStorage.setItem(FLOW_ID_KEY, fid);
      }
      memoryFlowId = fid;
      return fid;
    } catch {
      // fallback to memory
    }
  }
  if (!memoryFlowId) {
    memoryFlowId = generateId('flow');
  }
  return memoryFlowId;
}

export function startNewFlow(): string {
  const newFid = generateId('flow');
  memoryFlowId = newFid;
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      sessionStorage.setItem(FLOW_ID_KEY, newFid);
    } catch {
      // ignore
    }
  }
  return newFid;
}

function loadEvents(): AnalyticsEvent[] {
  if (typeof window === 'undefined' || !window.sessionStorage) return [];
  try {
    const data = sessionStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((ev: Partial<AnalyticsEvent>) => ({
      id: ev.id || generateId('evt'),
      event: ev.event || 'unknown',
      timestamp: ev.timestamp || new Date().toISOString(),
      context: {
        sessionId: ev.context?.sessionId || getSessionId(),
        flowId: ev.context?.flowId || getFlowId(),
        attempt: ev.context?.attempt ?? (typeof ev.properties?.attempt === 'number' ? ev.properties.attempt : undefined),
        generationId: ev.context?.generationId,
      },
      properties: ev.properties || {},
    }));
  } catch {
    return [];
  }
}

function saveEvents(evts: AnalyticsEvent[]): void {
  if (typeof window === 'undefined' || !window.sessionStorage) return;
  try {
    const capped = evts.length > MAX_EVENTS ? evts.slice(-MAX_EVENTS) : evts;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(capped));
  } catch {
    // Ignore storage errors
  }
}

let events: AnalyticsEvent[] = loadEvents();
let listeners: Array<() => void> = [];

export function trackEvent(
  eventName: string,
  properties: Record<string, unknown> = {},
  contextOverrides: Partial<EventContext> = {}
): AnalyticsEvent {
  if (events.length === 0 && typeof window !== 'undefined' && window.sessionStorage) {
    events = loadEvents();
  }
  
  const event: AnalyticsEvent = {
    id: generateId('evt'),
    event: eventName,
    timestamp: new Date().toISOString(),
    context: {
      sessionId: getSessionId(),
      flowId: getFlowId(),
      ...contextOverrides,
    },
    properties,
  };

  events.push(event);
  if (events.length > MAX_EVENTS) {
    events = events.slice(-MAX_EVENTS);
  }

  saveEvents(events);
  listeners.forEach(fn => fn());
  return event;
}

export function getEvents(): AnalyticsEvent[] {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    events = loadEvents();
  }
  return [...events];
}

export function clearEvents(): void {
  events = [];
  saveEvents(events);
  listeners.forEach(fn => fn());
}

export function subscribe(fn: () => void): () => void {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter(l => l !== fn);
  };
}
