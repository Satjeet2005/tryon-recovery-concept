'use client';

interface UploadValidationProps {
  file: File | null;
  isValid: boolean;
  error: string | null;
}

export default function UploadValidation({ file, isValid, error }: UploadValidationProps) {
  if (!file) return null;

  return (
    <div className="w-full mt-4 animate-fade-in">
      {isValid && !error ? (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-success-light/30 border border-success-light">
          <div className="w-8 h-8 shrink-0 rounded-full bg-success flex items-center justify-center text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-success">Image ready</p>
            <p className="text-sm text-muted-foreground">Your photo looks good and is ready for processing.</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-error-light/30 border border-error-light">
          <div className="w-8 h-8 shrink-0 rounded-full bg-error flex items-center justify-center text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-error">Validation failed</p>
            <p className="text-sm text-error/80">{error}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
