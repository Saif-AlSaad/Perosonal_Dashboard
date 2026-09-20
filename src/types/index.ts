export type SectionLayout = 'grid' | 'timeline' | 'notebook';

export interface UserProfile {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  location: string;
  education: string;
  careerFocus: string;
  avatarUrl: string;
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    portfolio?: string;
    email?: string;
  };
}

export interface Section {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  coverImage?: string;
  layout: SectionLayout;
  orderIndex: number;
  isCustom: boolean;
  createdAt: string;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  name?: string;
  duration?: number;
  size?: number;
  caption?: string;
}

export interface Entry {
  id: string;
  sectionId: string;
  title: string;
  date: string;
  content: string;
  tags: string[];
  media: MediaItem[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityItem {
  id: string;
  type: 'add' | 'update' | 'delete' | 'favorite';
  sectionId: string;
  sectionName: string;
  entryTitle: string;
  timestamp: string;
}

export type ThemePreset = 'midnight' | 'ocean' | 'purple' | 'minimal-white' | 'forest' | 'sunset' | 'custom';

export interface ThemeConfig {
  preset: ThemePreset;
  primaryColor: string;
  accentColor: string;
  bgColor: string;
  cardBg: string;
  cardBorder: string;
  glassBlur: number;
  glassOpacity: number;
}

export type BackgroundPreset = 'nebula' | 'cyber' | 'aurora' | 'deep-void' | 'obsidian' | 'iridescent' | 'custom';

export type Scene3DPreset = 'cosmic-drift' | 'galaxy-spiral' | 'earth-globe' | 'neural-plexus' | 'aurora-waves' | 'cyber-grid' | 'exoplanet';

export interface BackgroundConfig {
  preset: BackgroundPreset;
  customImageUrl?: string;
  blur: number; // 0 - 40px
  brightness: number; // 20 - 150%
  opacity: number; // 10 - 100%
  overlayDarkness: number; // 0 - 90%
  scale: number; // 100 - 150%
}

export interface UserSettings {
  passkeyHash: string;
  autoLockMinutes: number; // 0 for disabled
  enable3D?: boolean;
  reducedMotion: boolean;
  theme: ThemeConfig;
  background: BackgroundConfig;
  scene3DPreset?: string;
}

export interface DashboardStats {
  sectionsCount: number;
  entriesCount: number;
  photosCount: number;
  videosCount: number;
  audioCount: number;
  favoritesCount: number;
}
