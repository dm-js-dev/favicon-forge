import { useState, useRef, useCallback } from 'react';

interface SourceImage {
  file: File;
  url: string;
  type: 'png' | 'jpeg' | 'webp' | 'svg';
}

interface GeneratorConfig {
  paddingPercent: number;
  radiusPercent: number;
  backgroundColor: string;
}

export default function FaviconTool() {
  const [sourceImage, setSourceImage] = useState<SourceImage | null>(null);
  const [config, setConfig] = useState<GeneratorConfig>({
    paddingPercent: 10,
    radiusPercent: 0,
    backgroundColor: '#ffffff'
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > 10 * 1024 * 1024) {
      return 'File size must be less than 10MB';
    }
    
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return 'File must be PNG, JPG, WebP, or SVG';
    }
    
    return null;
  };

  const getImageType = (file: File): 'png' | 'jpeg' | 'webp' | 'svg' => {
    switch (file.type) {
      case 'image/png': return 'png';
      case 'image/jpeg': return 'jpeg';
      case 'image/webp': return 'webp';
      case 'image/svg+xml': return 'svg';
      default: throw new Error('Unsupported file type');
    }
  };

  const handleFile = useCallback((file: File) => {
    setError(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const url = URL.createObjectURL(file);
      const type = getImageType(file);
      
      setSourceImage({ file, url, type });
    } catch (err) {
      setError('Failed to process file');
    }
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const generateFavicons = async () => {
    if (!sourceImage) return;
    
    setIsGenerating(true);
    try {
      // This is a placeholder - real implementation would use the generator
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Favicon generation would happen here!');
    } catch (err) {
      setError('Failed to generate favicons');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            1. Upload Your Image
          </h3>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
              isDragOver 
                ? 'border-blue-500 bg-blue-50' 
                : sourceImage 
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleUploadClick}
          >
            {sourceImage ? (
              <div>
                <img 
                  src={sourceImage.url} 
                  alt="Uploaded image" 
                  className="mx-auto h-24 w-24 object-contain mb-4 rounded-lg"
                />
                <p className="text-lg font-medium text-green-700 mb-2">
                  {sourceImage.file.name}
                </p>
                <p className="text-sm text-green-600 mb-4">
                  {(sourceImage.file.size / 1024).toFixed(1)} KB • {sourceImage.type.toUpperCase()}
                </p>
                <button 
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSourceImage(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  Remove image
                </button>
              </div>
            ) : (
              <>
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop your image here or click to browse
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Supports PNG, JPG, WebP, SVG (max 10MB)
                </p>
              </>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* Preview Section */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Preview
          </h3>
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="grid grid-cols-3 gap-4">
              {[16, 32, 48, 180, 192, 512].map((size) => (
                <div key={size} className="text-center">
                  <div 
                    className="bg-white border-2 border-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center"
                    style={{
                      width: Math.min(size, 64),
                      height: Math.min(size, 64),
                      borderRadius: config.radiusPercent > 0 ? `${config.radiusPercent}%` : '8px'
                    }}
                  >
                    {sourceImage ? (
                      <img 
                        src={sourceImage.url} 
                        alt="Favicon preview" 
                        className="w-full h-full object-contain p-1"
                        style={{
                          backgroundColor: config.backgroundColor,
                          borderRadius: config.radiusPercent > 0 ? `${config.radiusPercent}%` : '8px'
                        }}
                      />
                    ) : (
                      <div className="w-4 h-4 bg-gray-300 rounded"></div>
                    )}
                  </div>
                  <span className="text-xs text-gray-600">{size}×{size}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            2. Customize Settings
          </h3>
          
          <div className="space-y-6">
            {/* Padding */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Padding: {config.paddingPercent}%
              </label>
              <input
                type="range"
                min="0"
                max="30"
                value={config.paddingPercent}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  paddingPercent: parseInt(e.target.value) 
                }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>30%</span>
              </div>
            </div>

            {/* Border Radius */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Corner Radius: {config.radiusPercent}%
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={config.radiusPercent}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  radiusPercent: parseInt(e.target.value) 
                }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0% (Square)</span>
                <span>50% (Circle)</span>
              </div>
            </div>

            {/* Background Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Color
              </label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={config.backgroundColor}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    backgroundColor: e.target.value 
                  }))}
                  className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={config.backgroundColor}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    backgroundColor: e.target.value 
                  }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Download Section */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            3. Download & Use
          </h3>
          
          <div className="space-y-4">
            <button
              onClick={generateFavicons}
              disabled={!sourceImage || isGenerating}
              className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
                sourceImage && !isGenerating
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isGenerating 
                ? 'Generating...' 
                : sourceImage 
                  ? 'Generate & Download ZIP'
                  : 'Upload an image to generate favicons'
              }
            </button>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">HTML Snippet Preview</h4>
              <code className="block text-xs text-gray-600 bg-gray-100 p-3 rounded border font-mono">
                {`<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="icon" href="/favicon.ico">`}
              </code>
              <p className="text-xs text-gray-500 mt-2">
                Copy this code into your website's &lt;head&gt; section
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Browser Support Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This tool requires a modern browser with Canvas API support. 
              All processing happens locally - no images are uploaded to servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}