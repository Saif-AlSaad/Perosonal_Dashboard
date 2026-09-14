import React from 'react';
import { BackgroundConfig } from '../../types';

interface BackgroundLayerProps {
  config: BackgroundConfig;
}

export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({ config }) => {
  const {
    preset,
    customImageUrl,
    blur,
    brightness,
    opacity,
    overlayDarkness,
    scale,
  } = config;

  const getPresetBackgroundStyle = (): React.CSSProperties => {
    switch (preset) {
      case 'nebula':
        return {
          background: `
            radial-gradient(circle at 15% 25%, rgba(99, 102, 241, 0.22) 0%, transparent 45%),
            radial-gradient(circle at 85% 75%, rgba(6, 182, 212, 0.18) 0%, transparent 45%),
            radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.15) 0%, transparent 60%),
            #07090e
          `,
        };
      case 'cyber':
        return {
          backgroundImage: `
            linear-gradient(to right, rgba(99, 102, 241, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.08) 1px, transparent 1px),
            radial-gradient(circle at 50% 20%, rgba(14, 165, 233, 0.2) 0%, transparent 70%),
            #060810
          `,
          backgroundSize: '60px 60px, 60px 60px, 100% 100%, 100% 100%',
        };
      case 'aurora':
        return {
          background: `
            radial-gradient(ellipse at 30% 10%, rgba(16, 185, 129, 0.22) 0%, transparent 55%),
            radial-gradient(ellipse at 70% 30%, rgba(6, 182, 212, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 80%, rgba(99, 102, 241, 0.18) 0%, transparent 60%),
            #030e0b
          `,
        };
      case 'deep-void':
        return {
          background: `
            radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.3) 0%, transparent 80%),
            #030508
          `,
        };
      case 'obsidian':
        return {
          backgroundImage: `
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 40%),
            linear-gradient(135deg, rgba(255, 255, 255, 0.02) 25%, transparent 25%),
            linear-gradient(225deg, rgba(255, 255, 255, 0.02) 25%, transparent 25%),
            #090b10
          `,
          backgroundSize: '100% 100%, 80px 80px, 80px 80px, 100% 100%',
        };
      case 'iridescent':
        return {
          background: `
            radial-gradient(circle at 20% 20%, rgba(244, 63, 94, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 80% 30%, rgba(168, 85, 247, 0.18) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(6, 182, 212, 0.15) 0%, transparent 45%),
            radial-gradient(circle at 90% 90%, rgba(245, 158, 11, 0.12) 0%, transparent 40%),
            #0a0812
          `,
        };
      case 'custom':
      default:
        if (customImageUrl) {
          return {
            backgroundImage: `url(${customImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          };
        }
        return {
          background: '#07090e',
        };
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Dynamic Background Surface */}
      <div
        className="absolute inset-0 transition-all duration-700 ease-out"
        style={{
          ...getPresetBackgroundStyle(),
          filter: `blur(${blur}px) brightness(${brightness}%)`,
          opacity: opacity / 100,
          transform: `scale(${scale / 100})`,
        }}
      />

      {/* Adaptive Readability Overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
        style={{
          backgroundColor: `rgba(0, 0, 0, ${overlayDarkness / 100})`,
        }}
      />
    </div>
  );
};
