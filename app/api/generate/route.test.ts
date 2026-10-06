import { describe, it, expect } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

describe('Mock Generation API Route', () => {
  it('fails on attempt 1 with structured LOW_LIGHT error in auto mode', async () => {
    const req = new NextRequest('http://localhost:3000/api/generate', {
      method: 'POST',
      body: JSON.stringify({ attempt: 1 }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(false);
    expect(data.failure.code).toBe('LOW_LIGHT');
    expect(data.failure.primaryAction).toBe('upload_brighter');
    expect(data.failure.allowedActions).toContain('upload_brighter');
    expect(data.failure.requiresUpload).toBe(true);
  });

  it('succeeds on attempt 2 in auto mode', async () => {
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

  it('supports forceMode for MULTIPLE_PEOPLE failure', async () => {
    const req = new NextRequest('http://localhost:3000/api/generate', {
      method: 'POST',
      body: JSON.stringify({ attempt: 2, forceMode: 'MULTIPLE_PEOPLE' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(data.success).toBe(false);
    expect(data.failure.code).toBe('MULTIPLE_PEOPLE');
    expect(data.failure.primaryAction).toBe('upload_solo');
  });

  it('supports forceMode for OUTFIT_FIT_FAILURE content error', async () => {
    const req = new NextRequest('http://localhost:3000/api/generate', {
      method: 'POST',
      body: JSON.stringify({ attempt: 2, forceMode: 'OUTFIT_FIT_FAILURE' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(data.success).toBe(false);
    expect(data.failure.code).toBe('OUTFIT_FIT_FAILURE');
    expect(data.failure.requiresUpload).toBe(false);
    expect(data.failure.primaryAction).toBe('different_outfit');
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
});

