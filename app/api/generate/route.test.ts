import { describe, it, expect } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

describe('Mock Generation API Route', () => {
  it('includes the attempted outfit in content failures, but not in system failures', async () => {
    const mk = (b: object) => new NextRequest('http://localhost:3000/api/generate', { method: 'POST', body: JSON.stringify(b) });
    const fit = await (await POST(mk({ attempt: 1, brightnessScore: 200 }))).json();
    expect(fit.failure.code).toBe('OUTFIT_FIT_FAILURE');
    expect(fit.outfit?.style).toBeTruthy();
    const net = await (await POST(mk({ attempt: 1, forceMode: 'NETWORK_ERROR' }))).json();
    expect(net.outfit).toBeUndefined();
  });

  it('fails on attempt 1 with LOW_LIGHT when brightness score is below 55', async () => {
    const req = new NextRequest('http://localhost:3000/api/generate', {
      method: 'POST',
      body: JSON.stringify({ attempt: 1, brightnessScore: 40 }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(false);
    expect(data.failure.code).toBe('LOW_LIGHT');
    expect(data.failure.primaryAction).toBe('upload_brighter');
  });

  it('fails on attempt 1 with FULL_BODY_NOT_VISIBLE heuristic when image is landscape', async () => {
    const req = new NextRequest('http://localhost:3000/api/generate', {
      method: 'POST',
      body: JSON.stringify({ attempt: 1, brightnessScore: 120, isLandscape: true }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(data.success).toBe(false);
    expect(data.failure.code).toBe('FULL_BODY_NOT_VISIBLE');
    expect(data.failure.primaryAction).toBe('upload_full_body');
  });

  it('fails on attempt 1 with OUTFIT_FIT_FAILURE when brightness is good and portrait orientation', async () => {
    const req = new NextRequest('http://localhost:3000/api/generate', {
      method: 'POST',
      body: JSON.stringify({ attempt: 1, brightnessScore: 120, isLandscape: false }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(data.success).toBe(false);
    expect(data.failure.code).toBe('OUTFIT_FIT_FAILURE');
    expect(data.failure.primaryAction).toBe('different_outfit');
  });

  it('succeeds on retry sequence (attempt 2)', async () => {
    const req = new NextRequest('http://localhost:3000/api/generate', {
      method: 'POST',
      body: JSON.stringify({ attempt: 2, outfitMode: 'default' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.outfit).toBeDefined();
  });

  it('succeeds on different_outfit recovery (attempt 2) returning a non-current style', async () => {
    const req = new NextRequest('http://localhost:3000/api/generate', {
      method: 'POST',
      body: JSON.stringify({ attempt: 2, outfitMode: 'different', currentStyle: 'Streetwear' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.outfit.style).not.toBe('Streetwear');
  });

  it('succeeds on similar_style recovery (attempt 2) preferring preferredStyle', async () => {
    const req = new NextRequest('http://localhost:3000/api/generate', {
      method: 'POST',
      body: JSON.stringify({ attempt: 2, outfitMode: 'similar', preferredStyle: 'Minimal', currentStyle: 'Minimal' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.outfit.style).toBe('Minimal');
  });

  it('succeeds on "show another look" continuation (attempt 3)', async () => {
    const req = new NextRequest('http://localhost:3000/api/generate', {
      method: 'POST',
      body: JSON.stringify({ attempt: 3, outfitMode: 'similar', preferredStyle: 'Minimal' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.outfit).toBeDefined();
  });

  it('excludes rejected styles from recommendation pool', async () => {
    const req = new NextRequest('http://localhost:3000/api/generate', {
      method: 'POST',
      body: JSON.stringify({ attempt: 2, outfitMode: 'default', rejectedStyles: ['streetwear'] }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.outfit.style.toLowerCase()).not.toBe('streetwear');
  });

  it('returns explicit NO_RECOMMENDATION when all styles are rejected', async () => {
    const allStyles = ['streetwear', 'minimal', 'casual', 'formal', 'bohemian'];
    const req = new NextRequest('http://localhost:3000/api/generate', {
      method: 'POST',
      body: JSON.stringify({ attempt: 2, outfitMode: 'default', rejectedStyles: allStyles }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(false);
    expect(data.exhausted).toBe(true);
    expect(data.error.code).toBe('NO_RECOMMENDATION');
  });

  it('rejects invalid attempt value with 400 status', async () => {
    const req = new NextRequest('http://localhost:3000/api/generate', {
      method: 'POST',
      body: JSON.stringify({ attempt: -1 }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_REQUEST');
  });

  it('rejects invalid latencyMs with 400 status', async () => {
    const req = new NextRequest('http://localhost:3000/api/generate', {
      method: 'POST',
      body: JSON.stringify({ attempt: 1, latencyMs: 999999 }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe('INVALID_REQUEST');
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
