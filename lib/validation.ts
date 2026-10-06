export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_DIMENSION = 640;

export function validateFileType(file: File): ValidationResult {
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

export async function validateImage(file: File): Promise<ValidationResult> {
  // Check type
  const typeResult = validateFileType(file);
  if (!typeResult.valid) return typeResult;
  
  // Check size
  const sizeResult = validateFileSize(file);
  if (!sizeResult.valid) return sizeResult;
  
  // Check dimensions
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(validateImageDimensions(img.naturalWidth, img.naturalHeight));
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      resolve({ valid: false, error: 'Could not read that image. Please try another file.' });
    };
    img.src = URL.createObjectURL(file);
  });
}
