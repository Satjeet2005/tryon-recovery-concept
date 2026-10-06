import { describe, it, expect } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

describe('Mock Generation API Route', () => {
  it('fails on attempt 1 with LOW_LIGHT error', async () => {
    const req = new NextRequest('http://localhost:3000/api/generate', {
      method: 'POST',
      body: JSON.stringify({ attempt: 1 }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(false);
    expect(data.failure.code).toBe('LOW_LIGHT');
  });

  it('succeeds on attempt 2', async () => {
    const req = new NextRequest('http://localhost:3000/api/generate', {
      method: 'POST',
      body: JSON.stringify({ attempt: 2 }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.outfit).toBeDefined();
    expect(data.resultId).toBeDefined();
  });

  it('respects demo=success query param force override', async () => {
    const req = new NextRequest('http://localhost:3000/api/generate?demo=success', {
      method: 'POST',
      body: JSON.stringify({ attempt: 1 }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(data.success).toBe(true);
  });

  it('respects demo=failure query param force override', async () => {
    const req = new NextRequest('http://localhost:3000/api/generate?demo=failure', {
      method: 'POST',
      body: JSON.stringify({ attempt: 2 }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(data.success).toBe(false);
  });
});
