import React from 'react';
import * as Icons from 'lucide-react';

interface DynamicIconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  className?: string;
  size?: number | string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className = 'w-5 h-5', size, ...props }) => {
  // Try exact match or PascalCase
  const IconComponent = (Icons as unknown as Record<string, React.FC<React.SVGProps<SVGSVGElement>>>)[name] || Icons.FolderHeart;
  
  if (!IconComponent) {
    return <Icons.FolderHeart className={className} width={size} height={size} {...props} />;
  }

  return <IconComponent className={className} width={size} height={size} {...props} />;
};

export const AVAILABLE_ICONS = [
  'User', 'GraduationCap', 'Home', 'Users', 'Gamepad2', 'Globe', 'Briefcase', 
  'Code', 'Trophy', 'Sparkles', 'BookOpen', 'Film', 'Music', 'Camera', 
  'Target', 'Heart', 'Coffee', 'Cpu', 'Layers', 'Compass', 'Lightbulb',
  'FileText', 'Bookmark', 'Activity', 'Shield', 'Flame', 'Zap', 'Star'
];
