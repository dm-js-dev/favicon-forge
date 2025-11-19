import { useState, useEffect } from 'react';
import type { GeneratorConfig } from '../../lib/favicon/types';

interface ControlsPanelProps {
  config: GeneratorConfig;
  onConfigChange: (updates: Partial<GeneratorConfig>) => void;
  disabled?: boolean;
}

export function ControlsPanel({ config, onConfigChange, disabled = false }: ControlsPanelProps) {
  const [localConfig, setLocalConfig] = useState<any>(config);

  // Sync local config with prop changes
  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    const updates = { radiusPercent: value };
    setLocalConfig((prev: any) => ({ ...prev, ...(updates as any) }));
    onConfigChange(updates);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updates = { backgroundColor: e.target.value } as Partial<GeneratorConfig>;
    setLocalConfig((prev: any) => ({ ...prev, ...(updates as any) }));
    onConfigChange(updates);
  };

  const handleHexColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
      if (value.length === 7) {
        const updates = { backgroundColor: value };
        setLocalConfig((prev: any) => ({ ...prev, ...(updates as any) }));
        onConfigChange(updates);
      }
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Customize Your Favicon
      </h3>
      
      {/* Padding removed: using crop instead */}

      {/* Border Radius Control */}
      <div className="space-y-3">
        <label className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Corner Radius: {localConfig.radiusPercent}%
          </span>
        </label>
        <input
          type="range"
          min="0"
          max="50"
          step="1"
          value={localConfig.radiusPercent}
          onChange={handleRadiusChange}
          disabled={disabled}
          className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>0% (Square)</span>
          <span>50% (Circular)</span>
        </div>
      </div>

      {/* Background Color Control */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">
          Background Color
        </label>
        <div className="flex gap-3 items-center">
          <div className="flex-1">
            <input
              type="color"
              value={(localConfig as any).backgroundColor === 'transparent' ? '#ffffff' : (localConfig as any).backgroundColor}
              onChange={handleColorChange}
              disabled={disabled}
              className={`w-full h-10 border border-gray-300 rounded cursor-pointer ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={(localConfig as any).backgroundColor}
              onChange={handleHexColorChange}
              disabled={disabled}
              placeholder="#ffffff"
              maxLength={7}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono ${
                disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900'
              }`}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={(localConfig as any).backgroundColor === 'transparent'}
              onChange={(e) => {
                const updates = { backgroundColor: e.target.checked ? 'transparent' : '#ffffff' } as Partial<GeneratorConfig>;
                setLocalConfig((prev: any) => ({ ...prev, ...(updates as any) }));
                onConfigChange(updates);
              }}
              disabled={disabled}
            />
            Transparent
          </label>
        </div>
        <p className="text-xs text-gray-500">
          Choose a background color for your favicon. White works well for most logos.
        </p>
      </div>
      {/* Quick Presets removed: no padding now */}
    </div>
  );
}