export type SourceImage = {
  file: File;
  url: string; // ObjectURL или dataURL
  type: 'png' | 'jpeg' | 'webp' | 'svg';
};

export type GeneratorConfig = {
  paddingPercent: number; // 0–30
  radiusPercent: number;  // 0–50
  backgroundColor: string; // '#RRGGBB'
};

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