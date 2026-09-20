import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Image as ImageIcon, 
  Upload, 
  Sliders, 
  Check, 
  X 
} from 'lucide-react';
import { 
  ThemeConfig, 
  ThemePreset, 
  BackgroundConfig, 
  BackgroundPreset
} from '../../types';
import { THEME_PRESETS, applyTheme } from '../../services/theme';
import { useToast } from '../common/ToastContext';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeConfig;
  currentBackground: BackgroundConfig;
  onSaveTheme: (theme: ThemeConfig) => void;
  onSaveBackground: (bg: BackgroundConfig) => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  currentBackground,
  onSaveTheme,
  onSaveBackground,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'themes' | 'background'>('themes');

  // Theme state
  const [theme, setTheme] = useState<ThemeConfig>(currentTheme);

  // Background state
  const [background, setBackground] = useState<BackgroundConfig>(currentBackground);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state with incoming props when modal opens
  useEffect(() => {
    if (isOpen) {
      setTheme(currentTheme);
      setBackground(currentBackground);
    }
  }, [isOpen, currentTheme, currentBackground]);

  const presets: { id: ThemePreset; name: string; desc: string; colors: string[] }[] = [
    { id: 'midnight', name: 'Midnight', desc: 'Deep charcoal & neon indigo', colors: ['#6366f1', '#06b6d4', '#07090e'] },
    { id: 'ocean', name: 'Ocean', desc: 'Abyssal deep teal & cyan', colors: ['#0ea5e9', '#14b8a6', '#040d1a'] },
    { id: 'purple', name: 'Purple Space', desc: 'Cosmic violet & starlight rose', colors: ['#a855f7', '#ec4899', '#0d071a'] },
    { id: 'minimal-white', name: 'Minimal White', desc: 'Clean frosted daylight aesthetic', colors: ['#4f46e5', '#0284c7', '#f1f5f9'] },
    { id: 'forest', name: 'Forest', desc: 'Deep evergreen & emerald glow', colors: ['#10b981', '#84cc16', '#04120c'] },
    { id: 'sunset', name: 'Sunset', desc: 'Twilight dusk rose & amber', colors: ['#f43f5e', '#f59e0b', '#170912'] },
  ];

  const bgPresets: { id: BackgroundPreset; name: string; desc: string }[] = [
    { id: 'nebula', name: 'Nebula Galaxy', desc: 'Deep space cosmic dust glow' },
    { id: 'cyber', name: 'Cyber Grid', desc: 'High-tech wireframe perspective' },
    { id: 'aurora', name: 'Aurora Borealis', desc: 'Organic emerald flowing lights' },
    { id: 'deep-void', name: 'Deep Void', desc: 'Ultra-minimal starlight void' },
    { id: 'obsidian', name: 'Obsidian Minimal', desc: 'Architectural geometric patterns' },
    { id: 'iridescent', name: 'Iridescent Glass', desc: 'Soft pastel multi-spectrum aura' },
  ];

  const handleSelectPreset = (presetId: ThemePreset) => {
    const newTheme = { ...THEME_PRESETS[presetId] };
    setTheme(newTheme);
    applyTheme(newTheme);
    onSaveTheme(newTheme);
    showToast(`Theme switched to ${presetId}`, 'success');
  };

  const handleCustomThemeChange = (key: keyof ThemeConfig, val: string | number) => {
    const updated = {
      ...theme,
      preset: 'custom' as ThemePreset,
      [key]: val,
    };
    setTheme(updated);
    applyTheme(updated);
    onSaveTheme(updated);
  };

  const handleBgPresetSelect = (presetId: BackgroundPreset) => {
    const updated: BackgroundConfig = {
      ...background,
      preset: presetId,
    };
    setBackground(updated);
    onSaveBackground(updated);
    showToast(`Background preset applied: ${presetId}`, 'success');
  };

  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const updated: BackgroundConfig = {
        ...background,
        preset: 'custom',
        customImageUrl: dataUrl,
      };
      setBackground(updated);
      onSaveBackground(updated);
      showToast('Custom background image applied', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleBgSliderChange = (key: keyof BackgroundConfig, val: number) => {
    const updated = { ...background, [key]: val };
    setBackground(updated);
    onSaveBackground(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-8 relative my-auto max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div 
              className="p-2 rounded-xl border transition-colors"
              style={{
                backgroundColor: 'rgba(var(--theme-primary-rgb), 0.15)',
                borderColor: 'rgba(var(--theme-primary-rgb), 0.3)',
                color: 'var(--theme-primary)'
              }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                Atmosphere & Customization
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tailor the visual aesthetic of your digital universe</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 my-4 p-1 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab('themes')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'themes'
                ? 'text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            style={activeTab === 'themes' ? {
              backgroundColor: 'var(--theme-primary)',
              boxShadow: '0 4px 14px 0 rgba(var(--theme-primary-rgb), 0.4)'
            } : {}}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Themes</span>
          </button>
          <button
            onClick={() => setActiveTab('background')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'background'
                ? 'text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            style={activeTab === 'background' ? {
              backgroundColor: 'var(--theme-primary)',
              boxShadow: '0 4px 14px 0 rgba(var(--theme-primary-rgb), 0.4)'
            } : {}}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Background</span>
          </button>
        </div>

        {/* Scrollable Tab Content */}
        <div className="flex-1 overflow-y-auto py-2 space-y-6 pr-1">
          {activeTab === 'themes' && (
            <>
              {/* Presets Grid */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3">
                  Predefined Curated Themes
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {presets.map(p => {
                    const isSelected = theme.preset === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleSelectPreset(p.id)}
                        className={`p-3.5 rounded-2xl glass-card cursor-pointer border transition-all flex items-center justify-between ${
                          isSelected
                            ? 'ring-2'
                            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                        }`}
                        style={isSelected ? {
                          borderColor: 'var(--theme-primary)',
                          boxShadow: '0 0 0 2px rgba(var(--theme-primary-rgb), 0.4)',
                          backgroundColor: 'rgba(var(--theme-primary-rgb), 0.12)'
                        } : {}}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{p.name}</h4>
                            {isSelected && (
                              <Check 
                                className="w-3.5 h-3.5" 
                                style={{ color: 'var(--theme-primary)' }}
                              />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{p.desc}</p>
                        </div>

                        {/* Color Swatch Dots */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {p.colors.map((c, i) => (
                            <span
                              key={i}
                              className="w-4 h-4 rounded-full border border-slate-300 dark:border-white/20 shadow-xs"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Theme Editor */}
              <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4" style={{ color: 'var(--theme-accent)' }} />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Custom Theme Color Fine-Tuning</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Primary Accent
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.primaryColor}
                        onChange={e => handleCustomThemeChange('primaryColor', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-300 uppercase">
                        {theme.primaryColor}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Secondary Accent
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.accentColor}
                        onChange={e => handleCustomThemeChange('accentColor', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-300 uppercase">
                        {theme.accentColor}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Background Tint
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.bgColor}
                        onChange={e => handleCustomThemeChange('bgColor', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-300 uppercase">
                        {theme.bgColor}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Glass Blur & Transparency Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      <span>Glass Blur</span>
                      <span className="font-mono">{theme.glassBlur}px</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="32"
                      value={theme.glassBlur}
                      onChange={e => handleCustomThemeChange('glassBlur', parseInt(e.target.value))}
                      className="w-full cursor-pointer"
                      style={{ accentColor: 'var(--theme-primary)' }}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      <span>Glass Opacity</span>
                      <span className="font-mono">{Math.round(theme.glassOpacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.3"
                      max="0.95"
                      step="0.05"
                      value={theme.glassOpacity}
                      onChange={e =>
                        handleCustomThemeChange('glassOpacity', parseFloat(e.target.value))
                      }
                      className="w-full cursor-pointer"
                      style={{ accentColor: 'var(--theme-primary)' }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'background' && (
            <>
              {/* Background Presets */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3">
                  Built-in Aesthetic Presets
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {bgPresets.map(bg => {
                    const isSelected = background.preset === bg.id;
                    return (
                      <div
                        key={bg.id}
                        onClick={() => handleBgPresetSelect(bg.id)}
                        className={`p-3 rounded-2xl glass-card cursor-pointer border transition-all text-left ${
                          isSelected
                            ? 'ring-2'
                            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                        }`}
                        style={isSelected ? {
                          borderColor: 'var(--theme-primary)',
                          boxShadow: '0 0 0 2px rgba(var(--theme-primary-rgb), 0.4)',
                          backgroundColor: 'rgba(var(--theme-primary-rgb), 0.12)'
                        } : {}}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{bg.name}</h4>
                          {isSelected && (
                            <Check 
                              className="w-3.5 h-3.5" 
                              style={{ color: 'var(--theme-primary)' }}
                            />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{bg.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Upload Custom Image */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Upload Custom Background Image</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    High resolution wallpapers, digital artwork, or space photography
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 dark:glass-button-secondary border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" style={{ color: 'var(--theme-accent)' }} />
                  <span>Choose Image</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCustomBgUpload}
                />
              </div>

              {/* Real-time Fine-Tuning Controls */}
              <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-white/10">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Real-time Image & Overlay Adjustments
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Blur */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      <span>Blur Filter</span>
                      <span className="font-mono">{background.blur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={background.blur}
                      onChange={e => handleBgSliderChange('blur', parseInt(e.target.value))}
                      className="w-full cursor-pointer"
                      style={{ accentColor: 'var(--theme-primary)' }}
                    />
                  </div>

                  {/* Brightness */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      <span>Brightness</span>
                      <span className="font-mono">{background.brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="150"
                      value={background.brightness}
                      onChange={e => handleBgSliderChange('brightness', parseInt(e.target.value))}
                      className="w-full cursor-pointer"
                      style={{ accentColor: 'var(--theme-primary)' }}
                    />
                  </div>

                  {/* Overlay Darkness */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      <span>Darkness Overlay</span>
                      <span className="font-mono">{background.overlayDarkness}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      value={background.overlayDarkness}
                      onChange={e => handleBgSliderChange('overlayDarkness', parseInt(e.target.value))}
                      className="w-full cursor-pointer"
                      style={{ accentColor: 'var(--theme-primary)' }}
                    />
                  </div>

                  {/* Scale */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-1 font-medium">
                      <span>Scale / Zoom</span>
                      <span className="font-mono">{background.scale}%</span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="140"
                      value={background.scale}
                      onChange={e => handleBgSliderChange('scale', parseInt(e.target.value))}
                      className="w-full cursor-pointer"
                      style={{ accentColor: 'var(--theme-primary)' }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl glass-button-primary text-xs font-bold cursor-pointer"
          >
            Apply & Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
