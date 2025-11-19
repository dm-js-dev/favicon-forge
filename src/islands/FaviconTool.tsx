import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { generateIcons, buildZip, validateImageFile, getImageType } from '../lib/favicon/generator';
import { buildHeadSnippet } from '../lib/favicon/snippet';
import type { SourceImage, GeneratorConfig, ImageModeConfig, CustomModeConfig, ImageCrop } from '../lib/favicon/types';

export default function FaviconTool() {
  const [activeTab, setActiveTab] = useState<'image' | 'custom'>('image');
  const [sourceImage, setSourceImage] = useState<SourceImage | null>(null);
  const [config, setConfig] = useState<GeneratorConfig>({
    mode: 'image',
    radiusPercent: 0,
    backgroundColor: '#ffffff',
    crop: undefined
  } as ImageModeConfig);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Cropper state (for image mode)
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<ImageCrop | undefined>(undefined);

  // Custom text state
  // Default text so custom favicon tab shows an immediate preview
  const [customText, setCustomText] = useState('😎Yo');
  const [customTextColor, setCustomTextColor] = useState<string>('#000000');
  const customInputRef = useRef<HTMLInputElement>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [snippetCopied, setSnippetCopied] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const commonEmojis = useMemo(
    () => [
      // Faces & expressions
      '😀','😁','😂','🤣','😊','😇','🙂','😉','😍','😘','😎','🤩','🤔','🤗','😴','🤯','🥳','😡','😢','😭','🤮','🤒','🤕','🤐','🤨','😏','😈','👻','💀','🤖','👽',
      // Hands & gestures
      '👍','👎','👏','🙏','🤝','🤙','👌','✌️','🤌','🤏','✋','🖐️','🤚','🫰','🫶','💪','🖖','🤜','🤛','👊','🤲',
      // Hearts & symbols
      '❤️','💖','💙','💚','💛','🧡','💜','🖤','🤍','🤎','💔','❣️','💯','✅','❌','⚠️','ℹ️','♻️','⭐','🌟','✨','⚡️','🔥','💡','☑️','🎯','🔔','🔕',
      // Objects & tools
      '🚀','✈️','🛰️','🪐','🛸','🚗','🚌','🚲','⚙️','🔧','🔨','🪛','🧰','🪄','🔒','🔑','🔍','🧪','🔬','💻','🖱️','📱','💾','🧠','🧩','📌','📎','📝','📈','📉','📦','🛠️',
      // Animals & nature
      '🐶','🐱','🦊','🐻','🐼','🦄','🐸','🐵','🦁','🐯','🐨','🐷','🐔','🐧','🐢','🦋','🐞','🐝','🍀','🌈','☀️','🌙','☁️','❄️','💧','🌊','🌍','🌎','🌏','🌱','🌿','🌵','🌻','🌹',
      // Food & drink
      '🍎','🍊','🍋','🍌','🍉','🍇','🍓','🍒','🍑','🥝','🥑','🥦','🌶️','🍔','🍕','🍣','🥐','🥨','🍪','🍩','🍰','🍫','☕','🍵','🍺','🍷','🥤',
      // Arts & leisure
      '🎉','🎈','🎁','🏆','⚽','🏀','🎲','🧸','🎮','🎧','🎤','🎬','🎨','📚','📰','✏️','🖊️','🖍️','🗂️','🗃️',
      // Misc travel & places
      '🏠','🏢','🏗️','🗼','🗽','⛩️','🏰','🗿','🛤️','⛵','🚤','🚂','🛞','🏝️','🏜️','🏕️',
      // Additional symbols
      '🪐','🔄','🆕','🆒','🛡️','♾️','🔁','▶️','⏸️','⏯️','⏹️','⏺️','⏱️','⏰','⌚','📅','📂','🗑️'
    ],
    []
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => validateImageFile(file);
  const getFileImageType = (file: File): 'png' | 'jpeg' | 'webp' | 'svg' => getImageType(file);

  const handleFile = useCallback((file: File) => {
    setError(null);
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      const url = URL.createObjectURL(file);
      const type = getFileImageType(file);
      setSourceImage({ file, url, type });
    } catch (err) {
      setError('Failed to process file');
    }
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = useCallback((event: React.DragEvent) => { event.preventDefault(); setIsDragOver(true); }, []);
  const handleDragLeave = useCallback((event: React.DragEvent) => { event.preventDefault(); setIsDragOver(false); }, []);
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleUploadClick = () => fileInputRef.current?.click();
  const generateBtnRef = useRef<HTMLButtonElement>(null);

  const generateFavicons = async () => {
    if (config.mode === 'image' && !sourceImage) return;
    setIsGenerating(true);
    setError(null);
    try {
      const icons = await generateIcons(sourceImage, config);
      const zipBlob = await buildZip(icons);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url; a.download = 'favicons.zip';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Favicon generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate favicons');
    } finally {
      setIsGenerating(false);
    }
  };

  // Update config when tab/text/crop changes
  useEffect(() => {
    if (activeTab === 'image') {
      setConfig((prev) => ({
        mode: 'image',
        radiusPercent: (prev as any).radiusPercent ?? 0,
        backgroundColor: (prev as any).backgroundColor ?? '#ffffff',
        crop: croppedArea
      }) as ImageModeConfig);
    } else {
      setConfig((prev) => ({
        mode: 'custom',
        radiusPercent: (prev as any).radiusPercent ?? 0,
        backgroundColor: (prev as any).backgroundColor ?? 'transparent',
        text: customText,
        textColor: customTextColor
      }) as CustomModeConfig);
    }
  }, [activeTab, croppedArea, customText, customTextColor]);

  // Normalize crop from react-easy-crop (use percent values)
  const onCropComplete = useCallback((percent: any, _pixels: any) => {
    if (!sourceImage) return;
    const { x, y, width, height } = percent; // 0..100
    setCroppedArea({ x: x / 100, y: y / 100, width: width / 100, height: height / 100 });
  }, [sourceImage]);

  // Build thumbnail previews that respect crop/text
  const [previewUrls, setPreviewUrls] = useState<Record<number, string>>({});
  useEffect(() => {
    let canceled = false;
    const sizes = [16, 32, 48, 180, 192, 512];

    const drawRoundedClip = (ctx: CanvasRenderingContext2D, size: number, radiusPercent: number) => {
      if (radiusPercent <= 0) return () => {};
      const r = Math.round(size * (radiusPercent / 100));
      ctx.save();
      ctx.beginPath();
      // @ts-ignore roundRect may not exist in lib types
      if (ctx.roundRect) ctx.roundRect(0, 0, size, size, r);
      else {
        ctx.moveTo(r, 0);
        ctx.lineTo(size - r, 0);
        ctx.quadraticCurveTo(size, 0, size, r);
        ctx.lineTo(size, size - r);
        ctx.quadraticCurveTo(size, size, size - r, size);
        ctx.lineTo(r, size);
        ctx.quadraticCurveTo(0, size, 0, size - r);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.closePath();
      }
      ctx.clip();
      return () => ctx.restore();
    };

    const build = async () => {
      const map: Record<number, string> = {};
      if (activeTab === 'image' && sourceImage) {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const im = new Image();
          im.onload = () => resolve(im);
          im.onerror = reject;
          im.src = sourceImage.url;
        });
        for (const size of sizes) {
          const view = Math.min(size, 64);
          const canvas = document.createElement('canvas');
          canvas.width = view; canvas.height = view;
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;
          const undo = drawRoundedClip(ctx, view, (config as any).radiusPercent ?? 0);
          const bg = (config as any).backgroundColor;
          if (bg && bg !== 'transparent') { ctx.fillStyle = bg; ctx.fillRect(0, 0, view, view); } else { ctx.clearRect(0, 0, view, view); }
          const iw = img.naturalWidth || img.width; const ih = img.naturalHeight || img.height;
          const cropN = (config as any).crop ?? (() => {
            const side = Math.min(iw, ih);
            return { x: (iw - side) / 2 / iw, y: (ih - side) / 2 / ih, width: side / iw, height: side / ih };
          })();
          let sx = Math.round(cropN.x * iw);
          let sy = Math.round(cropN.y * ih);
          let sw = Math.round(cropN.width * iw);
          let sh = Math.round(cropN.height * ih);
          // Clamp
          sx = Math.max(0, Math.min(sx, iw - 1));
          sy = Math.max(0, Math.min(sy, ih - 1));
          sw = Math.max(1, Math.min(sw, iw - sx));
          sh = Math.max(1, Math.min(sh, ih - sy));
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, view, view);
          undo();
          map[size] = canvas.toDataURL('image/png');
        }
      } else if (activeTab === 'custom') {
        for (const size of sizes) {
          const view = Math.min(size, 64);
          const canvas = document.createElement('canvas');
          canvas.width = view; canvas.height = view;
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;
          const undo = drawRoundedClip(ctx, view, (config as any).radiusPercent ?? 0);
          const bg = (config as any).backgroundColor;
          if (bg && bg !== 'transparent') { ctx.fillStyle = bg; ctx.fillRect(0, 0, view, view); } else { ctx.clearRect(0, 0, view, view); }
          const text = (config as any).text ?? '';
          if (text) {
            const families = 'system-ui, -apple-system, Segoe UI, Roboto, "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            const maxBox = view * 0.85;
            let lo = 8, hi = view * 1.5, best = 8;
            while (lo <= hi) {
              const mid = Math.floor((lo + hi) / 2);
              ctx.font = `${mid}px ${families}`;
              const m = ctx.measureText(text);
              const w = m.width; const h = (m.actualBoundingBoxAscent ?? mid * 0.8) + (m.actualBoundingBoxDescent ?? mid * 0.2);
              if (w <= maxBox && h <= maxBox) { best = mid; lo = mid + 1; } else { hi = mid - 1; }
            }
            ctx.font = `${best}px ${families}`;
            ctx.fillStyle = (config as any).textColor || '#000000';
            ctx.fillText(text, view / 2, view / 2);
          }
          undo();
          map[size] = canvas.toDataURL('image/png');
        }
      }
      if (!canceled) setPreviewUrls(map);
    };

    build();
    return () => { canceled = true; };
  }, [activeTab, sourceImage, (config as any).backgroundColor, (config as any).radiusPercent, (config as any).crop, (config as any).text, (config as any).textColor]);

  // Limit input to 4 grapheme clusters
  const segmenter = useMemo(() => {
    try {
      // @ts-ignore
      return new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    } catch { return null; }
  }, []);
  const setCustomTextLimited = (value: string) => {
    if (segmenter) {
      // @ts-ignore
      const segments = Array.from(segmenter.segment(value));
      const limited = segments.slice(0, 4).map((s: any) => s.segment).join('');
      setCustomText(limited);
    } else {
      setCustomText(Array.from(value).slice(0, 4).join(''));
    }
  };

  const insertEmojiAtCaret = (emoji: string) => {
    const input = customInputRef.current;
    if (!input) {
      setCustomTextLimited(customText + emoji);
      return;
    }
    const start = input.selectionStart ?? customText.length;
    const end = input.selectionEnd ?? customText.length;
    const next = customText.slice(0, start) + emoji + customText.slice(end);
    setCustomTextLimited(next);
    setEmojiOpen(false);
    // Restore caret near inserted emoji
    requestAnimationFrame(() => {
      input.focus();
      const pos = start + emoji.length;
      try { input.setSelectionRange(pos, pos); } catch {}
    });
  };

  return (
    <div className="space-y-8">
      {/* Sticky Generate Button (appears when main button scrolled out) */}
      {showSticky && (
        <div className="fixed top-0 left-0 w-full z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex justify-center">
          <button
            onClick={generateFavicons}
            disabled={(activeTab === 'image' && !sourceImage) || isGenerating}
            className={`px-6 py-2 rounded-md font-semibold transition-colors animate-pulse ring-2 ring-blue-400/60 ${((activeTab === 'image' && sourceImage) || activeTab === 'custom') && !isGenerating ? 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600' : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'} `}
            aria-label="Sticky generate favicons button"
          >
            {isGenerating ? 'Generating...' : 'Start generating favicons'}
          </button>
        </div>
      )}
      {/* Mode Tabs */}
      <div className="flex gap-2">
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'image' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
          onClick={() => setActiveTab('image')}
        >
          Upload Image
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'custom' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
          onClick={() => setActiveTab('custom')}
        >
          Create Your Own
        </button>
      </div>

      {/* Main Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            1. {activeTab === 'image' ? 'Upload an image and select crop' : 'Create your favicon'}
          </h3>
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {activeTab === 'image' ? (
            <div
              className={`border-2 border-dashed rounded-xl p-4 transition-colors ${isDragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {!sourceImage ? (
                <div className="text-center cursor-pointer" onClick={handleUploadClick}>
                  <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">Drag & drop or click to choose</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">PNG, JPG, WebP, SVG (max 10MB)</p>
                </div>
              ) : (
                <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                  <Cropper
                    image={sourceImage.url}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    cropShape="rect"
                    showGrid={false}
                  />
                  <div className="absolute bottom-2 left-2 right-2 flex items-center gap-3 bg-white/70 dark:bg-gray-800/70 rounded-md px-3 py-2">
                    <label className="text-xs text-gray-700 dark:text-gray-300">Zoom</label>
                    <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-full" />
                  </div>
                  <button
                    className="absolute top-2 right-2 text-xs text-blue-600 dark:text-blue-400 bg-white/80 dark:bg-gray-900/60 px-2 py-1 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSourceImage(null);
                      setCroppedArea(undefined);
                      setZoom(1);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Text / emoji (up to 4)</label>
                <div className="flex gap-2">
                  <input
                    ref={customInputRef}
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomTextLimited(e.target.value)}
                    placeholder="A 😊"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setEmojiOpen(v => !v)}
                    className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100"
                    aria-haspopup="dialog"
                    aria-expanded={emojiOpen}
                  >
                    😊 Emoji
                  </button>
                </div>
                {emojiOpen && (
                  <div
                    className="absolute z-20 mt-2 w-64 max-h-56 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg p-2"
                    onMouseLeave={() => setEmojiOpen(false)}
                  >
                    <div className="grid grid-cols-8 gap-1 text-xl">
                      {commonEmojis.map((e) => (
                        <button
                          key={e}
                          className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          onClick={() => insertEmojiAtCaret(e)}
                          type="button"
                          aria-label={`Insert ${e}`}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Text size auto-fits the favicon. Click Emoji to insert.</p>
              </div>
            </div>
          )}
        </div>

        {/* Preview Section */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Preview</h3>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
            <div className="grid grid-cols-3 gap-4">
              {[16, 32, 48, 180, 192, 512].map((size) => (
                <div key={size} className="text-center">
                  <div
                    className="mx-auto mb-2 border-2 border-gray-200 dark:border-gray-600 overflow-hidden"
                    style={{
                      width: Math.min(size, 64),
                      height: Math.min(size, 64),
                      backgroundColor: (config as any).backgroundColor === 'transparent' ? 'transparent' : (config as any).backgroundColor,
                      borderRadius: config.radiusPercent > 0 ? `${config.radiusPercent}%` : '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    {activeTab === 'image' ? (
                      previewUrls[size] ? (
                        <img src={previewUrls[size]} alt="Favicon preview" className="w-full h-full" />
                      ) : (
                        <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
                      )
                    ) : (
                      previewUrls[size] ? (
                        <img src={previewUrls[size]} alt="Favicon preview" className="w-full h-full" />
                      ) : (
                        <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
                      )
                    )}
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{size}×{size}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Controls + Download */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">2. Settings</h3>
          <div className="space-y-6">
            {/* Border Radius */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Corner Radius: {config.radiusPercent}%</label>
              <input
                type="range"
                min="0"
                max="50"
                value={config.radiusPercent}
                onChange={(e) => setConfig(prev => ({ ...(prev as any), radiusPercent: parseInt(e.target.value) }) as GeneratorConfig)}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1"><span>0% (Square)</span><span>50% (Circle)</span></div>
            </div>

            {/* Background Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Background Color</label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={(config as any).backgroundColor === 'transparent' ? '#ffffff' : (config as any).backgroundColor}
                  onChange={(e) => setConfig(prev => ({ ...(prev as any), backgroundColor: e.target.value }) as GeneratorConfig)}
                  className="w-16 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={(config as any).backgroundColor}
                  onChange={(e) => setConfig(prev => ({ ...(prev as any), backgroundColor: e.target.value }) as GeneratorConfig)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md text-sm font-mono"
                />
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={(config as any).backgroundColor === 'transparent'}
                    onChange={(e) => setConfig(prev => ({ ...(prev as any), backgroundColor: e.target.checked ? 'transparent' : '#ffffff' }) as GeneratorConfig)}
                  />
                  Transparent
                </label>
              </div>
            </div>
            {activeTab === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Text Color</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={customTextColor}
                    onChange={(e) => setCustomTextColor(e.target.value)}
                    className="w-16 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customTextColor}
                    onChange={(e) => setCustomTextColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md text-sm font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      // Auto contrast suggestion: if background is dark, set white; else black
                      const bg = (config as any).backgroundColor;
                      if (!bg || bg === 'transparent') { setCustomTextColor('#000000'); return; }
                      const hex = bg.replace('#','');
                      if (hex.length === 3) {
                        const r = parseInt(hex[0]+hex[0],16), g = parseInt(hex[1]+hex[1],16), b = parseInt(hex[2]+hex[2],16);
                        const luminance = (0.299*r + 0.587*g + 0.114*b)/255;
                        setCustomTextColor(luminance < 0.5 ? '#ffffff' : '#000000');
                      } else if (hex.length === 6) {
                        const r = parseInt(hex.substring(0,2),16), g = parseInt(hex.substring(2,4),16), b = parseInt(hex.substring(4,6),16);
                        const luminance = (0.299*r + 0.587*g + 0.114*b)/255;
                        setCustomTextColor(luminance < 0.5 ? '#ffffff' : '#000000');
                      }
                    }}
                    className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-xs"
                  >Auto Contrast</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Download Section */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">3. Download & Use</h3>
          <div className="space-y-4">
            <button
              ref={generateBtnRef}
              onClick={generateFavicons}
              disabled={(activeTab === 'image' && !sourceImage) || isGenerating}
              className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${((activeTab === 'image' && sourceImage) || activeTab === 'custom') && !isGenerating ? 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600' : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'}`}
            >
              {isGenerating ? 'Generating...' : 'Start generating favicons'}
            </button>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">HTML Snippet</h4>
                <button
                  type="button"
                  onClick={() => {
                    const snippet = buildHeadSnippet();
                    navigator.clipboard.writeText(snippet).then(() => {
                      setSnippetCopied(true);
                      setTimeout(() => setSnippetCopied(false), 1600);
                    }).catch(() => {});
                  }}
                  className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 font-medium text-gray-800 dark:text-gray-100"
                >
                  {snippetCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <code className="block text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 font-mono whitespace-pre overflow-x-auto">
                {buildHeadSnippet()}
              </code>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Paste inside your {'<head>'}. Adjust paths if needed.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Browser Support Warning */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm text-yellow-800 dark:text-yellow-200"><strong>Note:</strong> This tool requires a modern browser with Canvas API support. All processing happens locally - no images are uploaded to servers.</p>
          </div>
        </div>
      </div>
    </div>
  );
}