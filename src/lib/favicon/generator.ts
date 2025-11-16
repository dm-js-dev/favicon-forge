import { zip } from 'fflate';
import type { 
  SourceImage, 
  GeneratorConfig, 
  FaviconSize, 
  GeneratedIcon 
} from './types';
import { buildHeadSnippet, getSnippetInstructions } from './snippet';

const FAVICON_SIZES: FaviconSize[] = [16, 32, 48, 180, 192, 512];

const FAVICON_FILENAMES: Record<FaviconSize, string> = {
  16: 'favicon-16x16.png',
  32: 'favicon-32x32.png', 
  48: 'favicon-48x48.png',
  180: 'apple-touch-icon.png',
  192: 'android-chrome-192x192.png',
  512: 'android-chrome-512x512.png'
};

/**
 * Load image from source file
 */
async function loadImage(source: SourceImage): Promise<HTMLImageElement | ImageBitmap> {
  if (source.type === 'svg') {
    // For SVG, we need to create an image element
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = source.url;
    });
  } else {
    // For other formats, use ImageBitmap for better performance
    try {
      return await createImageBitmap(source.file);
    } catch {
      // Fallback to Image element
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = source.url;
      });
    }
  }
}

/**
 * Generate a single favicon icon
 */
async function generateIcon(
  image: HTMLImageElement | ImageBitmap,
  size: FaviconSize,
  config: GeneratorConfig
): Promise<GeneratedIcon> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  canvas.width = size;
  canvas.height = size;

  // Calculate padding
  const paddingPixels = Math.round(size * (config.paddingPercent / 100));
  const contentSize = size - paddingPixels * 2;

  // Draw background
  ctx.fillStyle = config.backgroundColor;
  ctx.fillRect(0, 0, size, size);

  // Apply border radius if specified
  if (config.radiusPercent > 0) {
    const radius = Math.round(size * (config.radiusPercent / 100));
    
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, radius);
    ctx.clip();
    
    // Redraw background within rounded rectangle
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, size, size);
  }

  // Calculate image dimensions (contain mode - fit within bounds)
  const imageWidth = image instanceof HTMLImageElement ? image.naturalWidth : image.width;
  const imageHeight = image instanceof HTMLImageElement ? image.naturalHeight : image.height;
  
  const scale = Math.min(contentSize / imageWidth, contentSize / imageHeight);
  const scaledWidth = imageWidth * scale;
  const scaledHeight = imageHeight * scale;
  
  // Center the image
  const x = paddingPixels + (contentSize - scaledWidth) / 2;
  const y = paddingPixels + (contentSize - scaledHeight) / 2;

  // Draw the image
  ctx.drawImage(image, x, y, scaledWidth, scaledHeight);

  if (config.radiusPercent > 0) {
    ctx.restore();
  }

  // Convert to blob
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to generate image blob'));
      }
    }, 'image/png');
  });

  return {
    size,
    blob,
    filename: FAVICON_FILENAMES[size]
  };
}

/**
 * Generate all favicon icons from source image
 */
export async function generateIcons(
  source: SourceImage,
  config: GeneratorConfig
): Promise<GeneratedIcon[]> {
  const image = await loadImage(source);
  const icons: GeneratedIcon[] = [];

  for (const size of FAVICON_SIZES) {
    const icon = await generateIcon(image, size, config);
    icons.push(icon);
  }

  return icons;
}

/**
 * Build ZIP file with all icons and HTML snippet
 */
export async function buildZip(icons: GeneratedIcon[]): Promise<Blob> {
  const files: Record<string, Uint8Array> = {};

  // Add all PNG icons
  for (const icon of icons) {
    const arrayBuffer = await icon.blob.arrayBuffer();
    files[icon.filename] = new Uint8Array(arrayBuffer);
  }

  // Add favicon.ico as copy of 32x32 PNG
  const favicon32 = icons.find(icon => icon.size === 32);
  if (favicon32) {
    const arrayBuffer = await favicon32.blob.arrayBuffer();
    files['favicon.ico'] = new Uint8Array(arrayBuffer);
  }

  // Add HTML snippet
  const htmlSnippet = buildHeadSnippet();
  const instructions = getSnippetInstructions();
  const fullSnippet = `${htmlSnippet}\n\n<!-- ${instructions.split('\n').join('\n   ')} -->`;
  
  files['head-snippet.html'] = new TextEncoder().encode(fullSnippet);

  // Create ZIP
  return new Promise((resolve, reject) => {
    zip(files, (err: Error | null, data: Uint8Array) => {
      if (err) {
        reject(new Error(`Failed to create ZIP: ${err.message}`));
      } else {
        resolve(new Blob([new Uint8Array(data)], { type: 'application/zip' }));
      }
    });
  });
}

/**
 * Validate source image file
 */
export function validateImageFile(file: File): string | null {
  // Check file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    return 'File size must be less than 10MB';
  }

  // Check file type
  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
  if (!allowedTypes.includes(file.type)) {
    return 'File must be PNG, JPG, WebP, or SVG';
  }

  return null;
}

/**
 * Get image type from file
 */
export function getImageType(file: File): 'png' | 'jpeg' | 'webp' | 'svg' {
  switch (file.type) {
    case 'image/png':
      return 'png';
    case 'image/jpeg':
      return 'jpeg';
    case 'image/webp':
      return 'webp';
    case 'image/svg+xml':
      return 'svg';
    default:
      throw new Error('Unsupported file type');
  }
}

/**
 * Check browser compatibility
 */
export function checkBrowserSupport(): string | null {
  if (!HTMLCanvasElement.prototype.getContext) {
    return 'Canvas API not supported';
  }

  if (!window.URL || !window.URL.createObjectURL) {
    return 'File API not supported';
  }

  if (!window.Blob) {
    return 'Blob API not supported';
  }

  return null;
}