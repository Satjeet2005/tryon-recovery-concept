import { AnalyticsEvent } from './types';

const STORAGE_KEY = 'demo_events';

function loadEvents(): AnalyticsEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = sessionStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveEvents(evts: AnalyticsEvent[]): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(evts));
  } catch {
    // Ignore storage quota / permissions errors in restricted environments
  }
}

let events: AnalyticsEvent[] = loadEvents();
let listeners: Array<() => void> = [];

function generateId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

export function trackEvent(eventName: string, properties: Record<string, unknown> = {}): AnalyticsEvent {
  if (events.length === 0 && typeof window !== 'undefined') {
    events = loadEvents();
  }
  const event: AnalyticsEvent = {
    id: generateId(),
    event: eventName,
    timestamp: new Date().toISOString(),
    properties,
  };
  events.push(event);
  saveEvents(events);
  listeners.forEach(fn => fn());
  return event;
}

export function getEvents(): AnalyticsEvent[] {
  if (typeof window !== 'undefined') {
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

