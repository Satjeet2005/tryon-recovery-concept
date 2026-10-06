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
    <div className="w-full flex flex-col gap-4 animate-scale-in">
      <div 
        className={`relative w-full min-h-[300px] border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent
          ${isDragging ? 'border-accent bg-accent/5' : 'border-card-border bg-card hover:bg-gray-50'}
          ${error ? 'border-error bg-error-light/10' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        role="button"
        tabIndex={0}
        aria-label="Upload photo"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') triggerFileInput(); }}
      >
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg, image/png, image/webp"
          className="hidden"
          aria-hidden="true"
        />

        {isValidating ? (
          <div className="flex flex-col items-center text-muted-foreground animate-fade-in">
            <svg className="w-10 h-10 mb-4 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>Validating image...</p>
          </div>
        ) : selectedFile && previewUrl ? (
          <div className="w-full h-full flex flex-col items-center animate-fade-in">
            <div className="relative w-full max-w-sm aspect-[3/4] mb-4 overflow-hidden rounded-lg shadow-sm border border-card-border">
              {/* Note: In a real app we might use standard img or Next/Image */}
              {/* Using standard img here for object URL preview */}
              <img 
                src={previewUrl} 
                alt="Selected file preview" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center">
              <p className="text-foreground font-medium truncate max-w-[250px]">{selectedFile.name}</p>
              <p className="text-muted-foreground text-sm">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button 
              className="mt-4 px-4 py-2 text-sm font-medium bg-card border border-card-border rounded-md hover:bg-gray-50 text-foreground transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                triggerFileInput();
              }}
            >
              Change photo
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center animate-fade-in">
            <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center text-muted">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Click or drag to upload</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Supports JPEG, PNG, or WebP up to 5MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-error-light text-error text-sm font-medium flex items-center gap-2 animate-slide-up">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
