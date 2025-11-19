export type SourceImage = {
  file: File;
  url: string; // ObjectURL или dataURL
  type: 'png' | 'jpeg' | 'webp' | 'svg';
};

export type ImageCrop = {
  // Normalized [0..1] rectangle within the source image
  x: number; // left
  y: number; // top
  width: number; // width of crop
  height: number; // height of crop
};

export type ImageModeConfig = {
  mode: 'image';
  radiusPercent: number; // 0–50
  backgroundColor: string; // '#RRGGBB' | 'transparent'
  crop?: ImageCrop; // optional; if not provided, center-crop to square
};

export type CustomModeConfig = {
  mode: 'custom';
  radiusPercent: number; // 0–50
  backgroundColor: string; // '#RRGGBB' | 'transparent'
  text: string; // up to 4 grapheme clusters (emoji/text)
  textColor?: string; // optional foreground color for text/emoji
};

export type GeneratorConfig = ImageModeConfig | CustomModeConfig;

export type FaviconSize =
  | 16
  | 32
  | 48
  | 180
  | 192
  | 512;

export type GeneratedIcon = {
  size: FaviconSize;
  blob: Blob;
  filename: string;
};

export type GeneratorStatus = 'idle' | 'ready' | 'generating' | 'error';

export interface SeoData {
  title: string;
  description: string;
  url?: string;
  image?: string;
  noIndex?: boolean;
}

export interface ErrorMessage {
  type: 'validation' | 'generation' | 'network';
  message: string;
}