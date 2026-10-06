// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react';
import { NextRequest } from 'next/server';

const analysis = vi.hoisted(() => ({
  current: { brightness: { score: 198, status: 'pass' }, aspectRatio: { ratio: 0.57, isLandscape: false, status: 'pass' } } as unknown,
}));

vi.mock('@/lib/validation', () => ({
  validateImage: async () => ({ valid: true, analysis: analysis.current }),
}));

import TryOnFlow from '@/app/page';
import { POST } from '@/app/api/generate/route';

type Sent = { attempt: number; outfitMode: string; preferredStyle?: string; rejectedStyles?: string[] };
let sent: Sent[] = [];
let outfitsReturned: string[] = [];

const BRIGHT = { brightness: { score: 198, status: 'pass' }, aspectRatio: { ratio: 0.57, isLandscape: false, status: 'pass' } };
const DARK = { brightness: { score: 30, status: 'warning' }, aspectRatio: { ratio: 0.57, isLandscape: false, status: 'pass' } };

beforeEach(() => {
  sent = [];
  outfitsReturned = [];
  analysis.current = BRIGHT;
  sessionStorage.clear();
  (URL as unknown as { createObjectURL: () => string }).createObjectURL = () => 'blob:test';
  (URL as unknown as { revokeObjectURL: () => void }).revokeObjectURL = () => {};
  globalThis.fetch = ((_url: string, init: RequestInit) =>
    new Promise((resolve, reject) => {
      const body = JSON.parse(String(init.body));
      sent.push(body);
      init.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
      POST(new NextRequest('http://localhost/api/generate', { method: 'POST', body: String(init.body) })).then(async (res) => {
        const data = await res.clone().json();
        if (data?.outfit) outfitsReturned.push(`${data.outfit.name} [${data.outfit.style}]`);
        resolve(res);
      }, reject);
    })) as typeof fetch;
});
afterEach(() => cleanup());

async function upload(container: HTMLElement) {
  const input = container.querySelector('input[type=file]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [new File([new Uint8Array(10)], 'test.jpg', { type: 'image/jpeg' })] } });
  const btn = await screen.findByRole('button', { name: /continue to generation/i });
  await waitFor(() => expect((btn as HTMLButtonElement).disabled).toBe(false));
  return btn;
}
const failureShown = () => screen.findByText(/try-on recovery diagnostic/i, {}, { timeout: 5000 });
const successShown = () => screen.findByText(/your personalized try-on/i, {}, { timeout: 5000 });
const sleep = (ms: number) => act(() => new Promise<void>((r) => setTimeout(r, ms)));
const attempts = () => JSON.stringify(sent.map((s) => s.attempt));

describe('latest build, real route handler', () => {
  it('S1 bright portrait: first failure type + 4 intents + recovery', async () => {
    const { container } = render(<TryOnFlow />);
    fireEvent.click(await upload(container));
    await failureShown();
    expect(screen.queryByText(/didn't fit your avatar/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /different outfit style/i }));
    await successShown();
    expect(attempts()).toBe('[1,2]');
  }, 20000);

  it('S2 dark photo: upload-brighter loop then Show me another look', async () => {
    analysis.current = DARK;
    const { container } = render(<TryOnFlow />);
    fireEvent.click(await upload(container));
    await failureShown();
    expect(screen.queryByText(/too dark/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /upload a brighter photo/i }));
    analysis.current = BRIGHT;
    fireEvent.click(await upload(container));
    await successShown();
    expect(attempts()).toBe('[1,2]');
    fireEvent.click(screen.getByRole('button', { name: /show me another look/i }));
    await waitFor(() => expect(sent.length).toBeGreaterThanOrEqual(3), { timeout: 5000 });
    await sleep(900);
    expect(attempts()).toBe('[1,2,3]');
    expect(screen.queryByText(/your personalized try-on/i)).toBeTruthy();
  }, 25000);

  it('S3 taste loop: Less like this then Show me another look', async () => {
    const { container } = render(<TryOnFlow />);
    fireEvent.click(await upload(container));
    await failureShown();
    fireEvent.click(screen.getByRole('button', { name: /different outfit style/i }));
    await successShown();
    const first = outfitsReturned[outfitsReturned.length - 1];
    fireEvent.click(screen.getByRole('button', { name: /less like this/i }));
    fireEvent.click(screen.getByRole('button', { name: /show me another look/i }));
    await waitFor(() => expect(outfitsReturned.length).toBeGreaterThanOrEqual(2), { timeout: 5000 });
    await sleep(700);
    const last = sent[sent.length - 1];
    expect(typeof last.preferredStyle).toBe('string');
    expect(outfitsReturned[outfitsReturned.length - 1]).not.toBe(first);
  }, 25000);

  it('S4 double-click guard on recovery action', async () => {
    const { container } = render(<TryOnFlow />);
    fireEvent.click(await upload(container));
    await failureShown();
    const btn = screen.getByRole('button', { name: /different outfit style/i });
    fireEvent.click(btn);
    fireEvent.click(btn);
    await sleep(1500);
    expect(sent.length).toBe(2); // initial attempt + exactly one recovery request
  }, 20000);

  it('S5 failure shows the attempted outfit and "Not my style" rejects that style', async () => {
    const { container } = render(<TryOnFlow />);
    fireEvent.click(await upload(container));
    await failureShown();
    const attemptedStyle = outfitsReturned[0].match(/\[(.+)\]$/)![1];
    expect(screen.queryByText(/while fitting/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /reject this style category/i }));
    await waitFor(() => expect(sent.length).toBeGreaterThanOrEqual(2), { timeout: 6000 });
    const taste = JSON.parse(sessionStorage.getItem('demo_taste') || '{}');
    expect(taste.rejectedStyles ?? []).toEqual([attemptedStyle.toLowerCase()]);
  }, 25000);

  it('S6 cancel during the post-response smoothing delay', async () => {
    const { container } = render(<TryOnFlow />);
    fireEvent.click(await upload(container));
    await waitFor(() => expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100'), { timeout: 5000, interval: 5 });
    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));
    await sleep(1000);
    // Cancelling must leave the user on the upload screen.
    expect(screen.queryByText(/start your virtual try-on/i)).toBeTruthy();
  }, 20000);
});
