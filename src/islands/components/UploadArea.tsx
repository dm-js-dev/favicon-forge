import React, { useCallback } from 'react';

interface UploadAreaProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  hasImage?: boolean;
}

export function UploadArea({ onFileSelect, disabled = false, hasImage = false }: UploadAreaProps) {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      onFileSelect(imageFile);
    }
  }, [onFileSelect, disabled]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div className="space-y-4">
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-colors
          ${disabled 
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
            : 'border-gray-400 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
          }
          ${hasImage ? 'border-green-400 bg-green-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={handleFileInputChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        <div className="space-y-4">
          <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center ${
            hasImage ? 'bg-green-200' : disabled ? 'bg-gray-200' : 'bg-blue-200'
          }`}>
            {hasImage ? (
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className={`w-8 h-8 ${disabled ? 'text-gray-500' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
          </div>
          
          <div>
            <h3 className={`text-lg font-semibold mb-2 ${disabled ? 'text-gray-500' : 'text-gray-900'}`}>
              {hasImage ? 'Image uploaded successfully!' : 'Upload your logo'}
            </h3>
            <p className={`text-sm mb-4 ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
              {hasImage 
                ? 'Click here or drag another image to replace'
                : 'Drag and drop an image here, or click to browse'
              }
            </p>
            <div className={`text-xs ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>
              <p>Supported formats: PNG, JPG, WebP, SVG</p>
              <p>Maximum size: 10MB</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}