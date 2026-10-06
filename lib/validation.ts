import { ImageAnalysisResult } from './types';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  analysis?: ImageAnalysisResult;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_DIMENSION = 640;

export function validateFileType(file: File): ValidationResult {
  const fileNameLower = file.name.toLowerCase();
  if (fileNameLower.endsWith('.heic') || fileNameLower.endsWith('.heif') || file.type === 'image/heic' || file.type === 'image/heif') {
    return {
      valid: false,
      error: "HEIC photos aren't supported in browser previews yet. Please upload a JPG, PNG, or WebP photo.",
    };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Please choose a JPG, PNG, or WebP image.',
    };
  }
  return { valid: true };
}

export function validateFileSize(file: File): ValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `That image is ${sizeMB}MB — please choose one under 5MB.`,
    };
  }
  return { valid: true };
}

export function validateImageDimensions(width: number, height: number): ValidationResult {
  if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
    return {
      valid: false,
      error: `That image is too small (${width}×${height}). Please choose an image at least ${MIN_DIMENSION}×${MIN_DIMENSION}.`,
    };
  }
  return { valid: true };
}

/**
 * Lightweight client-side brightness analysis sampling pixel luminance on an offscreen Canvas.
 * Purely advisory - does not block valid uploads.
 */
export function analyzeImageBrightness(img: HTMLImageElement): ImageAnalysisResult['brightness'] {
  try {
    const canvas = document.createElement('canvas');
    const width = 50;
    const height = 50;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { score: 128, status: 'pass' };

    ctx.drawImage(img, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    let totalLuminance = 0;
    const totalPixels = width * height;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // ITU-R BT.601 relative luminance formula
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      totalLuminance += luminance;
    }

    const averageScore = Math.round(totalLuminance / totalPixels);
    const isDark = averageScore < 55;

    return {
      score: averageScore,
      status: isDark ? 'warning' : 'pass',
      message: isDark 
        ? 'Photo looks dark (low lighting score). Bright lighting produces the best try-on results.' 
        : undefined,
    };
  } catch {
    // If canvas cross-origin or canvas read fails, gracefully pass
    return { score: 128, status: 'pass' };
  }
}

/**
 * Lightweight client-side aspect ratio advisory check.
 * Purely advisory - landscape photos are warned that portrait orientation works best.
 */
export function analyzeAspectRatio(width: number, height: number): ImageAnalysisResult['aspectRatio'] {
  const ratio = width / height;
  const isLandscape = ratio > 1.15;
  return {
    ratio,
    isLandscape,
    status: isLandscape ? 'warning' : 'pass',
    message: isLandscape 
      ? 'Portrait-oriented photos (taller than wide) usually work best for full-body try-on.' 
      : undefined,
  };
}

export async function validateImage(file: File): Promise<ValidationResult> {
  // Check type
  const typeResult = validateFileType(file);
  if (!typeResult.valid) return typeResult;
  
  // Check size
  const sizeResult = validateFileSize(file);
  if (!sizeResult.valid) return sizeResult;
  
  // Check dimensions & perform client-side advisory signals
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const dimResult = validateImageDimensions(img.naturalWidth, img.naturalHeight);
      if (!dimResult.valid) {
        URL.revokeObjectURL(img.src);
        resolve(dimResult);
        return;
      }

      const brightness = analyzeImageBrightness(img);
      const aspectRatio = analyzeAspectRatio(img.naturalWidth, img.naturalHeight);

      URL.revokeObjectURL(img.src);
      resolve({
        valid: true,
        analysis: {
          brightness,
          aspectRatio,
        },
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      resolve({ valid: false, error: 'Could not read that image. Please try another file.' });
    };
    img.src = URL.createObjectURL(file);
  });
}

