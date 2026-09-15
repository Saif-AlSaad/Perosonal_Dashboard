export const AVAILABLE_ICONS = [
  'User', 'GraduationCap', 'Home', 'Users', 'Gamepad2', 'Globe', 'Briefcase', 
  'Code', 'Trophy', 'Sparkles', 'BookOpen', 'Film', 'Music', 'Camera', 
  'Target', 'Heart', 'Coffee', 'Cpu', 'Layers', 'Compass', 'Lightbulb',
  'FileText', 'Bookmark', 'Activity', 'Shield', 'Flame', 'Zap', 'Star'
] as const;

export type AvailableIconName = typeof AVAILABLE_ICONS[number];
