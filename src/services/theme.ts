import { ThemeConfig, ThemePreset } from '../types';

export const THEME_PRESETS: Record<ThemePreset, ThemeConfig> = {
  midnight: {
    preset: 'midnight',
    primaryColor: '#6366f1', // Indigo
    accentColor: '#06b6d4', // Cyan
    bgColor: '#07090e',
    cardBg: 'rgba(15, 23, 42, 0.65)',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
    glassBlur: 16,
    glassOpacity: 0.65,
  },
  ocean: {
    preset: 'ocean',
    primaryColor: '#0ea5e9', // Sky blue
    accentColor: '#14b8a6', // Teal
    bgColor: '#040d1a',
    cardBg: 'rgba(8, 28, 48, 0.65)',
    cardBorder: 'rgba(14, 165, 233, 0.15)',
    glassBlur: 18,
    glassOpacity: 0.65,
  },
  purple: {
    preset: 'purple',
    primaryColor: '#a855f7', // Purple
    accentColor: '#ec4899', // Pink
    bgColor: '#0d071a',
    cardBg: 'rgba(26, 14, 46, 0.65)',
    cardBorder: 'rgba(168, 85, 247, 0.18)',
    glassBlur: 16,
    glassOpacity: 0.65,
  },
  'minimal-white': {
    preset: 'minimal-white',
    primaryColor: '#4f46e5', // Deep Indigo
    accentColor: '#0284c7', // Slate Cyan
    bgColor: '#f8fafc',
    cardBg: '#ffffff',
    cardBorder: '#e2e8f0',
    glassBlur: 16,
    glassOpacity: 1,
  },
  forest: {
    preset: 'forest',
    primaryColor: '#10b981', // Emerald
    accentColor: '#84cc16', // Lime
    bgColor: '#04120c',
    cardBg: 'rgba(6, 32, 22, 0.65)',
    cardBorder: 'rgba(16, 185, 129, 0.15)',
    glassBlur: 16,
    glassOpacity: 0.65,
  },
  sunset: {
    preset: 'sunset',
    primaryColor: '#f43f5e', // Rose
    accentColor: '#f59e0b', // Amber
    bgColor: '#170912',
    cardBg: 'rgba(38, 16, 28, 0.65)',
    cardBorder: 'rgba(244, 63, 94, 0.18)',
    glassBlur: 16,
    glassOpacity: 0.65,
  },
  custom: {
    preset: 'custom',
    primaryColor: '#6366f1',
    accentColor: '#06b6d4',
    bgColor: '#07090e',
    cardBg: 'rgba(15, 23, 42, 0.65)',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
    glassBlur: 16,
    glassOpacity: 0.65,
  },
};

// Check if a background color is light based on perceived luminance
export function isLightHex(hex: string): boolean {
  if (!hex || !hex.startsWith('#')) return false;
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  if (isNaN(num)) return false;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 160;
}

// Convert hex to rgb string for CSS opacity calculations
function hexToRgb(hex: string): string {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return '99, 102, 241';
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}

export function applyTheme(theme: ThemeConfig): void {
  const root = document.documentElement;
  const primaryRgb = hexToRgb(theme.primaryColor);
  const accentRgb = hexToRgb(theme.accentColor);

  root.style.setProperty('--theme-primary', theme.primaryColor);
  root.style.setProperty('--theme-primary-rgb', primaryRgb);
  root.style.setProperty('--theme-accent', theme.accentColor);
  root.style.setProperty('--theme-accent-rgb', accentRgb);
  root.style.setProperty('--theme-bg', theme.bgColor);
  root.style.setProperty('--theme-card-bg', theme.cardBg);
  root.style.setProperty('--theme-card-border', theme.cardBorder);
  root.style.setProperty('--theme-card-hover-border', `rgba(${primaryRgb}, 0.35)`);
  root.style.setProperty('--theme-glass-blur', `${theme.glassBlur}px`);
  root.style.setProperty('--theme-glass-opacity', `${theme.glassOpacity}`);

  // Handle light theme text color inversion
  const isLight = theme.preset === 'minimal-white' || isLightHex(theme.bgColor);

  if (isLight) {
    root.classList.remove('dark');
    root.classList.add('light');
    document.body.style.color = '#0f172a';
    document.body.style.backgroundColor = theme.bgColor;
  } else {
    root.classList.remove('light');
    root.classList.add('dark');
    document.body.style.color = '#e2e8f0';
    document.body.style.backgroundColor = theme.bgColor;
  }
}
