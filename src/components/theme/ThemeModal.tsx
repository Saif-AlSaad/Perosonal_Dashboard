import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Image as ImageIcon, 
  Upload, 
  Sliders, 
  Check, 
  X,
  Box 
} from 'lucide-react';
import { 
  ThemeConfig, 
  ThemePreset, 
  BackgroundConfig, 
  BackgroundPreset,
  Scene3DPreset 
} from '../../types';
import { THEME_PRESETS, applyTheme } from '../../services/theme';
import { useToast } from '../common/ToastContext';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeConfig;
  currentBackground: BackgroundConfig;
  currentScene3D: Scene3DPreset;
  onSaveTheme: (theme: ThemeConfig) => void;
  onSaveBackground: (bg: BackgroundConfig) => void;
  onSaveScene: (preset: Scene3DPreset) => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  currentBackground,
  currentScene3D,
  onSaveTheme,
  onSaveBackground,
  onSaveScene,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'themes' | 'background' | '3d-scene'>('themes');

  // Theme state
  const [theme, setTheme] = useState<ThemeConfig>(currentTheme);

  // Background state
  const [background, setBackground] = useState<BackgroundConfig>(currentBackground);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 3D Scene state
  const [selectedScene, setSelectedScene] = useState<Scene3DPreset>(currentScene3D);

  // Sync state with incoming props when modal opens
  useEffect(() => {
    if (isOpen) {
      setTheme(currentTheme);
      setBackground(currentBackground);
      setSelectedScene(currentScene3D);
    }
  }, [isOpen, currentTheme, currentBackground, currentScene3D]);

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

  const scenePresets: { id: Scene3DPreset; name: string; emoji: string; desc: string; gradientFrom: string; gradientTo: string }[] = [
    { id: 'cosmic-drift', name: 'Cosmic Drift', emoji: '🌠', desc: 'Floating glass crystals & cosmic stardust with shockwave ripples', gradientFrom: '#6366f1', gradientTo: '#06b6d4' },
    { id: 'galaxy-spiral', name: 'Galaxy Spiral', emoji: '🌌', desc: 'Logarithmic spiral arms with shooting stars & luminous core', gradientFrom: '#7c3aed', gradientTo: '#ec4899' },
    { id: 'neural-plexus', name: 'Neural Plexus', emoji: '🧠', desc: 'Interconnected glowing nodes with synaptic pulses & mouse gravity', gradientFrom: '#14b8a6', gradientTo: '#6366f1' },
    { id: 'aurora-waves', name: 'Aurora Waves', emoji: '🌊', desc: 'Flowing parametric silk ribbons with bioluminescent floating orbs', gradientFrom: '#06b6d4', gradientTo: '#a855f7' },
    { id: 'cyber-grid', name: 'Cyber Grid', emoji: '⚡', desc: 'Infinite neon terrain with scrolling noise hills & wireframe sun', gradientFrom: '#f43f5e', gradientTo: '#f59e0b' },
    { id: 'exoplanet', name: 'Exoplanet', emoji: '🪐', desc: 'Ringed glass planet with kinetic orbital gyroscope & moonlets', gradientFrom: '#8b5cf6', gradientTo: '#06b6d4' },
  ];

  const handleSceneSelect = (presetId: Scene3DPreset) => {
    setSelectedScene(presetId);
    onSaveScene(presetId);
    showToast(`3D scene switched to ${presetId}`, 'success');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl rounded-3xl glass-panel border border-white/10 shadow-2xl p-6 sm:p-8 relative my-auto max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-white">
                Atmosphere & Customization
              </h2>
              <p className="text-xs text-slate-400">Tailor the visual aesthetic of your digital universe</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 my-4 p-1 rounded-2xl bg-white/5 border border-white/5 shrink-0">
          <button
            onClick={() => setActiveTab('themes')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'themes'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Themes</span>
          </button>
          <button
            onClick={() => setActiveTab('background')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'background'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Background</span>
          </button>
          <button
            onClick={() => setActiveTab('3d-scene')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === '3d-scene'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Scene</span>
          </button>
        </div>

        {/* Scrollable Tab Content */}
        <div className="flex-1 overflow-y-auto py-2 space-y-6 pr-1">
          {activeTab === 'themes' && (
            <>
              {/* Presets Grid */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
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
                            ? 'border-indigo-500 ring-2 ring-indigo-500/40 bg-indigo-500/10'
                            : 'hover:border-white/20'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{p.name}</h4>
                            {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{p.desc}</p>
                        </div>

                        {/* Color Swatch Dots */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {p.colors.map((c, i) => (
                            <span
                              key={i}
                              className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
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
              <div className="pt-4 border-t border-white/5 space-y-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">Custom Theme Color Fine-Tuning</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
                      Primary Accent
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.primaryColor}
                        onChange={e => handleCustomThemeChange('primaryColor', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs font-mono text-slate-400 uppercase">
                        {theme.primaryColor}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
                      Secondary Accent
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.accentColor}
                        onChange={e => handleCustomThemeChange('accentColor', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs font-mono text-slate-400 uppercase">
                        {theme.accentColor}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
                      Background Tint
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.bgColor}
                        onChange={e => handleCustomThemeChange('bgColor', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs font-mono text-slate-400 uppercase">
                        {theme.bgColor}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Glass Blur & Transparency Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Glass Blur</span>
                      <span className="font-mono">{theme.glassBlur}px</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="32"
                      value={theme.glassBlur}
                      onChange={e => handleCustomThemeChange('glassBlur', parseInt(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
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
                      className="w-full accent-indigo-500"
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
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
                            ? 'border-indigo-500 ring-2 ring-indigo-500/40 bg-indigo-500/10'
                            : 'hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white">{bg.name}</h4>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 leading-snug">{bg.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Upload Custom Image */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-white">Upload Custom Background Image</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    High resolution wallpapers, digital artwork, or space photography
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl glass-button-secondary text-xs font-semibold flex items-center gap-1.5 shrink-0"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
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
              <div className="space-y-4 pt-2 border-t border-white/5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Real-time Image & Overlay Adjustments
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Blur */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Blur Filter</span>
                      <span className="font-mono">{background.blur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={background.blur}
                      onChange={e => handleBgSliderChange('blur', parseInt(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  {/* Brightness */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Brightness</span>
                      <span className="font-mono">{background.brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="150"
                      value={background.brightness}
                      onChange={e => handleBgSliderChange('brightness', parseInt(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  {/* Overlay Darkness */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Darkness Overlay</span>
                      <span className="font-mono">{background.overlayDarkness}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      value={background.overlayDarkness}
                      onChange={e => handleBgSliderChange('overlayDarkness', parseInt(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  {/* Scale */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Scale / Zoom</span>
                      <span className="font-mono">{background.scale}%</span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="140"
                      value={background.scale}
                      onChange={e => handleBgSliderChange('scale', parseInt(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === '3d-scene' && (
            <>
              {/* 3D Scene Presets */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  3D Background Scene
                </label>
                <p className="text-[11px] text-slate-500 mb-4">
                  Choose a stunning animated Three.js scene that renders behind your dashboard
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {scenePresets.map(sp => {
                    const isSelected = selectedScene === sp.id;
                    return (
                      <div
                        key={sp.id}
                        onClick={() => handleSceneSelect(sp.id)}
                        className={`group p-4 rounded-2xl glass-card cursor-pointer border transition-all overflow-hidden relative ${
                          isSelected
                            ? 'border-indigo-500 ring-2 ring-indigo-500/40 bg-indigo-500/10'
                            : 'hover:border-white/20 hover:bg-white/5'
                        }`}
                      >
                        {/* Animated gradient preview strip */}
                        <div
                          className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl opacity-60 group-hover:opacity-100 transition-opacity"
                          style={{
                            background: `linear-gradient(90deg, ${sp.gradientFrom}, ${sp.gradientTo}, ${sp.gradientFrom})`,
                            backgroundSize: '200% 100%',
                            animation: isSelected ? 'gradient-shift 3s ease infinite' : 'none',
                          }}
                        />

                        <div className="flex items-start gap-3">
                          <span className="text-2xl mt-0.5" role="img" aria-label={sp.name}>{sp.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white truncate">{sp.name}</h4>
                              {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 leading-snug">{sp.desc}</p>
                          </div>
                        </div>

                        {/* Gradient dot preview */}
                        <div className="flex items-center gap-1.5 mt-3 ml-9">
                          <span
                            className="w-3 h-3 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: sp.gradientFrom }}
                          />
                          <span
                            className="w-3 h-3 rounded-full border border-white/20 shadow-sm"
                            style={{
                              background: `linear-gradient(135deg, ${sp.gradientFrom}, ${sp.gradientTo})`,
                            }}
                          />
                          <span
                            className="w-3 h-3 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: sp.gradientTo }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Info note */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2">
                <Box className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    3D scenes render using WebGL and respond to your mouse movement and clicks.
                    Scenes automatically adapt to your selected color theme.
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Disable 3D rendering in Settings → Performance if needed.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl glass-button-primary text-xs font-bold"
          >
            Apply & Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
