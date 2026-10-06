import { describe, it, expect } from 'vitest';
import { validateFileType, validateFileSize, validateImageDimensions } from './validation';

describe('Validation Logic', () => {
  describe('validateFileType', () => {
    it('accepts JPG, PNG, and WebP files', () => {
      const jpg = new File([], 'test.jpg', { type: 'image/jpeg' });
      const png = new File([], 'test.png', { type: 'image/png' });
      const webp = new File([], 'test.webp', { type: 'image/webp' });

      expect(validateFileType(jpg).valid).toBe(true);
      expect(validateFileType(png).valid).toBe(true);
      expect(validateFileType(webp).valid).toBe(true);
    });

    it('rejects unsupported file types like TXT or PDF', () => {
      const txt = new File([], 'test.txt', { type: 'text/plain' });
      const pdf = new File([], 'test.pdf', { type: 'application/pdf' });

      const resTxt = validateFileType(txt);
      expect(resTxt.valid).toBe(false);
      expect(resTxt.error).toContain('JPG, PNG, or WebP');

      expect(validateFileType(pdf).valid).toBe(false);
    });
  });

  describe('validateFileSize', () => {
    it('accepts files under 5MB', () => {
      const smallFile = new File(['a'.repeat(1024 * 1024)], 'small.jpg', { type: 'image/jpeg' });
      expect(validateFileSize(smallFile).valid).toBe(true);
    });

    it('rejects files larger than 5MB', () => {
      const dummyBuffer = new ArrayBuffer(5.5 * 1024 * 1024);
      const largeFile = new File([dummyBuffer], 'large.jpg', { type: 'image/jpeg' });

      const res = validateFileSize(largeFile);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('under 5MB');
    });
  });

  describe('validateImageDimensions', () => {
    it('accepts images meeting or exceeding 640x640', () => {
      expect(validateImageDimensions(640, 640).valid).toBe(true);
      expect(validateImageDimensions(1920, 1080).valid).toBe(true);
    });

    it('rejects images smaller than 640 in any dimension', () => {
      const resWidth = validateImageDimensions(500, 800);
      expect(resWidth.valid).toBe(false);
      expect(resWidth.error).toContain('too small');

      const resHeight = validateImageDimensions(800, 400);
      expect(resHeight.valid).toBe(false);
      expect(resHeight.error).toContain('too small');
    });
  });
});
