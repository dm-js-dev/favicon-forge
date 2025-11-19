import { zip } from 'fflate';
import type {
  SourceImage,
  GeneratorConfig,
  FaviconSize,
  GeneratedIcon,
  ImageModeConfig,
  CustomModeConfig,
  ImageCrop
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
  image: HTMLImageElement | ImageBitmap | null,
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

  // Apply border radius clip if specified (so background and content both clipped)
  if (config.radiusPercent > 0) {
    const radius = Math.round(size * (config.radiusPercent / 100));
    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(0, 0, size, size, radius);
    } else {
      ctx.moveTo(radius, 0);
      ctx.lineTo(size - radius, 0);
      ctx.quadraticCurveTo(size, 0, size, radius);
      ctx.lineTo(size, size - radius);
      ctx.quadraticCurveTo(size, size, size - radius, size);
      ctx.lineTo(radius, size);
      ctx.quadraticCurveTo(0, size, 0, size - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
    }
    ctx.clip();
  }

  // Draw background (if not transparent)
  const bg = (config as ImageModeConfig | CustomModeConfig).backgroundColor;
  if (bg && bg !== 'transparent') {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);
  } else {
    // Ensure transparent background
    ctx.clearRect(0, 0, size, size);
  }

  if (config.mode === 'image') {
    if (!image) throw new Error('No source image provided');
    const imageWidth = image instanceof HTMLImageElement ? image.naturalWidth : image.width;
    const imageHeight = image instanceof HTMLImageElement ? image.naturalHeight : image.height;

    // Determine crop rectangle (pixels)
    const crop: ImageCrop = config.crop ?? (() => {
      // Default: centered square crop
      const side = Math.min(imageWidth, imageHeight);
      const x = Math.max(0, (imageWidth - side) / 2);
      const y = Math.max(0, (imageHeight - side) / 2);
      return { x: x / imageWidth, y: y / imageHeight, width: side / imageWidth, height: side / imageHeight };
    })();

    let sx = Math.round(crop.x * imageWidth);
    let sy = Math.round(crop.y * imageHeight);
    let sw = Math.round(crop.width * imageWidth);
    let sh = Math.round(crop.height * imageHeight);

    // Clamp to image bounds to avoid empty draws
    sx = Math.max(0, Math.min(sx, imageWidth - 1));
    sy = Math.max(0, Math.min(sy, imageHeight - 1));
    sw = Math.max(1, Math.min(sw, imageWidth - sx));
    sh = Math.max(1, Math.min(sh, imageHeight - sy));

    // Draw the cropped area to fill the canvas (cover)
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, size, size);
  } else {
    // Custom mode: render text/emoji auto-fitted
    const text = (config as CustomModeConfig).text ?? '';
    if (text) {
      const families = 'system-ui, -apple-system, Segoe UI, Roboto, "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Determine max font size to fit within canvas with some padding
      const maxBox = size * 0.85;
      let fontSize = Math.floor(size); // start high
      const minFont = 8;

      const measure = (fs: number) => {
        ctx.font = `${fs}px ${families}`;
        const metrics = ctx.measureText(text);
        const width = metrics.width;
        // Approximate height using metrics; fallback to fs
        const actualHeight = (metrics.actualBoundingBoxAscent ?? fs * 0.8) + (metrics.actualBoundingBoxDescent ?? fs * 0.2);
        return { width, height: actualHeight };
      };

      // Binary search for best font size
      let lo = minFont, hi = size * 1.5, best = minFont;
      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        const { width, height } = measure(mid);
        if (width <= maxBox && height <= maxBox) {
          best = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }

      ctx.font = `${best}px ${families}`;
      const fg = (config as CustomModeConfig).textColor || '#000000';
      ctx.fillStyle = fg;
      ctx.fillText(text, size / 2, size / 2);
    }
  }

  // Restore after clip
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
  source: SourceImage | null,
  config: GeneratorConfig
): Promise<GeneratedIcon[]> {
  const image = config.mode === 'image' ? await loadImage(source as SourceImage) : null;
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