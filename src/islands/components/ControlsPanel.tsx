import { useState, useEffect } from 'react';
import type { GeneratorConfig } from '../../lib/favicon/types';

interface ControlsPanelProps {
  config: GeneratorConfig;
  onConfigChange: (updates: Partial<GeneratorConfig>) => void;
  disabled?: boolean;
}

export function ControlsPanel({ config, onConfigChange, disabled = false }: ControlsPanelProps) {
  const [localConfig, setLocalConfig] = useState(config);

  // Sync local config with prop changes
  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handlePaddingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    const updates = { paddingPercent: value };
    setLocalConfig(prev => ({ ...prev, ...updates }));
    onConfigChange(updates);
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    const updates = { radiusPercent: value };
    setLocalConfig(prev => ({ ...prev, ...updates }));
    onConfigChange(updates);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updates = { backgroundColor: e.target.value };
    setLocalConfig(prev => ({ ...prev, ...updates }));
    onConfigChange(updates);
  };

  const handleHexColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
      if (value.length === 7) {
        const updates = { backgroundColor: value };
        setLocalConfig(prev => ({ ...prev, ...updates }));
        onConfigChange(updates);
      }
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Customize Your Favicon
      </h3>
      
      {/* Padding Control */}
      <div className="space-y-3">
        <label className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Padding: {localConfig.paddingPercent}%
          </span>
        </label>
        <input
          type="range"
          min="0"
          max="30"
          step="1"
          value={localConfig.paddingPercent}
          onChange={handlePaddingChange}
          disabled={disabled}
          className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>0% (No padding)</span>
          <span>30% (Max padding)</span>
        </div>
      </div>

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
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="color"
              value={localConfig.backgroundColor}
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
              value={localConfig.backgroundColor}
              onChange={handleHexColorChange}
              disabled={disabled}
              placeholder="#ffffff"
              maxLength={7}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono ${
                disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900'
              }`}
            />
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Choose a background color for your favicon. White works well for most logos.
        </p>
      </div>

      {/* Quick Presets */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">
          Quick Presets
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onConfigChange({ paddingPercent: 10, radiusPercent: 0, backgroundColor: '#ffffff' })}
            disabled={disabled}
            className={`px-3 py-2 text-xs border rounded-md transition-colors ${
              disabled 
                ? 'bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Default
          </button>
          <button
            onClick={() => onConfigChange({ paddingPercent: 15, radiusPercent: 25, backgroundColor: '#f3f4f6' })}
            disabled={disabled}
            className={`px-3 py-2 text-xs border rounded-md transition-colors ${
              disabled 
                ? 'bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Rounded
          </button>
          <button
            onClick={() => onConfigChange({ paddingPercent: 20, radiusPercent: 50, backgroundColor: '#1f2937' })}
            disabled={disabled}
            className={`px-3 py-2 text-xs border rounded-md transition-colors ${
              disabled 
                ? 'bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Dark Circle
          </button>
          <button
            onClick={() => onConfigChange({ paddingPercent: 5, radiusPercent: 10, backgroundColor: '#3b82f6' })}
            disabled={disabled}
            className={`px-3 py-2 text-xs border rounded-md transition-colors ${
              disabled 
                ? 'bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Blue Badge
          </button>
        </div>
      </div>
    </div>
  );
}