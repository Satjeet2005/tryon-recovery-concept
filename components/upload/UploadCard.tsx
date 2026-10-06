'use client';

import React, { useRef, useState } from 'react';

interface UploadCardProps {
  onFileSelect: (file: File, preview: string) => void;
  selectedFile: File | null;
  previewUrl: string | null;
  error: string | null;
  isValidating: boolean;
}

export default function UploadCard({
  onFileSelect,
  selectedFile,
  previewUrl,
  error,
  isValidating
}: UploadCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (!file) return;
    // Revoke previous preview URL if present to prevent memory leaks
    if (previewUrl) {
      try { URL.revokeObjectURL(previewUrl); } catch { /* ignore */ }
    }
    const preview = URL.createObjectURL(file);
    onFileSelect(file, preview);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full flex flex-col gap-3 animate-scale-in">
      {/* Privacy Guarantee Statement */}
      <div className="w-full py-2 px-3 rounded-lg bg-emerald-50 border border-emerald-200/60 text-emerald-900 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-emerald-600 font-bold">🔒 Privacy First:</span>
          <span>Your photo stays in your browser — never sent to external AI or cloud servers.</span>
        </div>
      </div>

      <div 
        className={`relative w-full min-h-[280px] border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all cursor-pointer outline-none focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2
          ${isDragging ? 'border-accent bg-accent/5' : 'border-card-border bg-card hover:bg-muted/10'}
          ${error ? 'border-error bg-error-light/10' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          id="photo-file-input"
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'upload-error-msg' : undefined}
        />

        {isValidating ? (
          <div className="flex flex-col items-center text-muted-foreground animate-fade-in" role="status" aria-live="polite">
            <svg className="w-10 h-10 mb-4 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="font-medium">Validating image & inspecting resolution...</p>
          </div>
        ) : selectedFile && previewUrl ? (
          <div className="w-full h-full flex flex-col items-center animate-fade-in">
            <div className="relative w-full max-w-xs aspect-[3/4] mb-4 overflow-hidden rounded-lg shadow-sm border border-card-border">
              <img 
                src={previewUrl} 
                alt="Uploaded photo preview" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center mb-2">
              <p className="text-foreground font-medium truncate max-w-[250px]">{selectedFile.name}</p>
              <p className="text-muted-foreground text-xs">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button 
              type="button"
              className="px-4 py-1.5 text-xs font-medium bg-card border border-card-border rounded-md hover:bg-muted/20 text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              onClick={triggerFileInput}
            >
              Change photo
            </button>
          </div>
        ) : (
          <label 
            htmlFor="photo-file-input" 
            className="flex flex-col items-center text-center animate-fade-in cursor-pointer w-full h-full justify-center"
          >
            <div className="w-14 h-14 mb-3 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">Click or drag photo here</h3>
            <p className="text-muted-foreground text-xs max-w-xs mb-2">
              JPG, PNG, or WebP up to 5MB (at least 640×640px)
            </p>
            <span className="inline-block px-2.5 py-1 text-[11px] rounded bg-muted/10 text-muted-foreground font-medium">
              Browse file from device
            </span>
          </label>
        )}
      </div>

      {error && (
        <div 
          id="upload-error-msg" 
          className="p-3.5 rounded-lg bg-error-light/40 border border-error-light text-error text-sm font-medium flex items-center gap-2.5 animate-slide-up" 
          role="alert" 
          aria-live="assertive"
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}

