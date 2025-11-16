import { useState, useCallback } from 'react';
import type { 
  SourceImage, 
  GeneratorConfig, 
  GeneratorStatus, 
  ErrorMessage 
} from '../favicon/types';
import { 
  generateIcons, 
  buildZip, 
  validateImageFile, 
  getImageType,
  checkBrowserSupport
} from '../favicon/generator';

const DEFAULT_CONFIG: GeneratorConfig = {
  paddingPercent: 10,
  radiusPercent: 0,
  backgroundColor: '#ffffff'
};

export function useFaviconGenerator() {
  const [sourceImage, setSourceImage] = useState<SourceImage | null>(null);
  const [config, setConfig] = useState<GeneratorConfig>(DEFAULT_CONFIG);
  const [status, setStatus] = useState<GeneratorStatus>('idle');
  const [error, setError] = useState<ErrorMessage | null>(null);

  // Check browser support on first use
  const browserError = checkBrowserSupport();
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    clearError();

    if (browserError) {
      setError({
        type: 'validation',
        message: `Your browser is not supported: ${browserError}. Please update to a modern browser.`
      });
      return;
    }

    // Validate file
    const validationError = validateImageFile(file);
    if (validationError) {
      setError({
        type: 'validation',
        message: validationError
      });
      return;
    }

    try {
      const imageType = getImageType(file);
      const url = URL.createObjectURL(file);

      // Test if image loads properly
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Invalid image file'));
        img.src = url;
      });

      const newSourceImage: SourceImage = {
        file,
        url,
        type: imageType
      };

      setSourceImage(newSourceImage);
      setStatus('ready');
    } catch (err) {
      setError({
        type: 'validation',
        message: 'Invalid image file. Please try a different image.'
      });
      console.error('Image validation error:', err);
    }
  }, [browserError, clearError]);

  const updateConfig = useCallback((updates: Partial<GeneratorConfig>) => {
    setConfig((prev: GeneratorConfig) => ({ ...prev, ...updates }));
  }, []);

  const generateZip = useCallback(async (): Promise<void> => {
    if (!sourceImage) {
      setError({
        type: 'validation',
        message: 'Please upload an image first'
      });
      return;
    }

    if (browserError) {
      setError({
        type: 'generation',
        message: `Cannot generate favicons: ${browserError}`
      });
      return;
    }

    setStatus('generating');
    clearError();

    try {
      // Generate all icon sizes
      const icons = await generateIcons(sourceImage, config);
      
      // Build ZIP file
      const zipBlob = await buildZip(icons);

      // Trigger download
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'favicon-forge-assets.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus('ready');
    } catch (err) {
      setError({
        type: 'generation',
        message: err instanceof Error ? err.message : 'Failed to generate favicons. Please try again.'
      });
      setStatus('ready');
      console.error('Favicon generation error:', err);
    }
  }, [sourceImage, config, browserError, clearError]);

  const reset = useCallback(() => {
    if (sourceImage?.url) {
      URL.revokeObjectURL(sourceImage.url);
    }
    setSourceImage(null);
    setConfig(DEFAULT_CONFIG);
    setStatus('idle');
    setError(null);
  }, [sourceImage]);

  return {
    sourceImage,
    config,
    status,
    error,
    handleFileUpload,
    updateConfig,
    generateZip,
    reset,
    clearError,
    isReady: status === 'ready' && sourceImage !== null,
    isGenerating: status === 'generating',
    hasError: error !== null,
    browserSupported: !browserError
  };
}