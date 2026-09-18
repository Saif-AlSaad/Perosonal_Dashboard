import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Radio, 
  CloudRain, 
  Disc, 
  Waves
} from 'lucide-react';

export type SoundscapePresetId = 'cosmic-drone' | 'cyberpunk-rain' | 'lo-fi-vinyl' | 'deep-void';

interface SoundscapePreset {
  id: SoundscapePresetId;
  label: string;
  icon: React.ElementType;
  color: string;
  badge: string;
}

const PRESETS: SoundscapePreset[] = [
  { id: 'cosmic-drone', label: 'Cosmic Drone', icon: Radio, color: '#6366f1', badge: 'Analog Pad' },
  { id: 'cyberpunk-rain', label: 'Cyber Rain', icon: CloudRain, color: '#06b6d4', badge: 'Atmospheric' },
  { id: 'lo-fi-vinyl', label: 'Lo-Fi Vinyl', icon: Disc, color: '#f59e0b', badge: 'Warm Crackle' },
  { id: 'deep-void', label: 'Deep Void', icon: Waves, color: '#a855f7', badge: 'Binaural Drift' },
];

export const AmbientSoundscape: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePreset, setActivePreset] = useState<SoundscapePresetId>('cosmic-drone');
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  // Audio Context & nodes ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const activeNodesRef = useRef<{ stop: () => void }[]>([]);

  // Initialize or resume Web Audio context
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtxClass();
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : volume, ctx.currentTime);
      masterGain.connect(ctx.destination);

      audioCtxRef.current = ctx;
      masterGainRef.current = masterGain;
    }

    if (audioCtxRef.current.state === 'suspended') {
      void audioCtxRef.current.resume();
    }

    return { ctx: audioCtxRef.current, masterGain: masterGainRef.current! };
  }, [isMuted, volume]);

  // Stop currently running synth nodes
  const stopCurrentSoundscape = useCallback(() => {
    activeNodesRef.current.forEach(node => {
      try {
        node.stop();
      } catch {
        // Node already stopped
      }
    });
    activeNodesRef.current = [];
  }, []);

  // Generate sounds based on preset
  const startSoundscape = useCallback((presetId: SoundscapePresetId) => {
    stopCurrentSoundscape();
    const { ctx, masterGain } = getAudioContext();

    if (presetId === 'cosmic-drone') {
      // Warm detuned chord oscillators + sub-bass + pink lowpass sweep
      const freqs = [55, 82.4, 110, 164.8]; // A1, E2, A2, E3
      const oscs: OscillatorNode[] = [];
      const droneGain = ctx.createGain();
      droneGain.gain.setValueAtTime(0.22, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, ctx.currentTime);
      filter.Q.setValueAtTime(3, ctx.currentTime);

      // Slow LFO to sweep filter
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
      lfoGain.gain.setValueAtTime(140, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx % 2 === 0 ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        // detune slightly for lush warmth
        osc.detune.setValueAtTime((idx - 1.5) * 6, ctx.currentTime);
        osc.connect(filter);
        osc.start();
        oscs.push(osc);
      });

      filter.connect(droneGain);
      droneGain.connect(masterGain);

      activeNodesRef.current.push({
        stop: () => {
          oscs.forEach(o => o.stop());
          lfo.stop();
          droneGain.disconnect();
          filter.disconnect();
        }
      });
    } else if (presetId === 'cyberpunk-rain') {
      // Filtered white noise with random droplet impulses
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(1000, ctx.currentTime);
      bandpass.Q.setValueAtTime(0.8, ctx.currentTime);

      const rainGain = ctx.createGain();
      rainGain.gain.setValueAtTime(0.28, ctx.currentTime);

      whiteNoise.connect(bandpass);
      bandpass.connect(rainGain);
      rainGain.connect(masterGain);
      whiteNoise.start();

      activeNodesRef.current.push({
        stop: () => {
          whiteNoise.stop();
          bandpass.disconnect();
          rainGain.disconnect();
        }
      });
    } else if (presetId === 'lo-fi-vinyl') {
      // Crackle pops + soft rumble
      const bufferSize = ctx.sampleRate;
      const crackleBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = crackleBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // Sparse clicks
        data[i] = Math.random() > 0.994 ? (Math.random() * 2 - 1) * 0.7 : 0;
      }

      const crackleSource = ctx.createBufferSource();
      crackleSource.buffer = crackleBuffer;
      crackleSource.loop = true;

      const crackleFilter = ctx.createBiquadFilter();
      crackleFilter.type = 'highpass';
      crackleFilter.frequency.setValueAtTime(1200, ctx.currentTime);

      const crackleGain = ctx.createGain();
      crackleGain.gain.setValueAtTime(0.18, ctx.currentTime);

      // Warm low hum
      const hum = ctx.createOscillator();
      hum.type = 'sine';
      hum.frequency.setValueAtTime(60, ctx.currentTime);
      const humGain = ctx.createGain();
      humGain.gain.setValueAtTime(0.06, ctx.currentTime);

      crackleSource.connect(crackleFilter);
      crackleFilter.connect(crackleGain);
      crackleGain.connect(masterGain);

      hum.connect(humGain);
      humGain.connect(masterGain);

      crackleSource.start();
      hum.start();

      activeNodesRef.current.push({
        stop: () => {
          crackleSource.stop();
          hum.stop();
          crackleGain.disconnect();
          humGain.disconnect();
        }
      });
    } else if (presetId === 'deep-void') {
      // Binaural wave oscillators (40Hz and 44Hz) with slow stereo modulation
      const oscL = ctx.createOscillator();
      const oscR = ctx.createOscillator();
      oscL.type = 'sine';
      oscR.type = 'sine';
      oscL.frequency.setValueAtTime(45, ctx.currentTime);
      oscR.frequency.setValueAtTime(49, ctx.currentTime);

      const merger = ctx.createChannelMerger(2);
      oscL.connect(merger, 0, 0);
      oscR.connect(merger, 0, 1);

      const voidGain = ctx.createGain();
      voidGain.gain.setValueAtTime(0.35, ctx.currentTime);

      merger.connect(voidGain);
      voidGain.connect(masterGain);

      oscL.start();
      oscR.start();

      activeNodesRef.current.push({
        stop: () => {
          oscL.stop();
          oscR.stop();
          voidGain.disconnect();
        }
      });
    }
  }, [getAudioContext, stopCurrentSoundscape]);

  // Toggle play/pause
  const togglePlay = () => {
    if (isPlaying) {
      stopCurrentSoundscape();
      setIsPlaying(false);
    } else {
      startSoundscape(activePreset);
      setIsPlaying(true);
    }
  };

  // Switch soundscape preset
  const handleSelectPreset = (presetId: SoundscapePresetId) => {
    setActivePreset(presetId);
    if (isPlaying) {
      startSoundscape(presetId);
    }
  };

  // Update volume
  const handleVolumeChange = (newVal: number) => {
    setVolume(newVal);
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(
        isMuted ? 0 : newVal,
        audioCtxRef.current.currentTime
      );
    }
  };

  // Toggle mute
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(
        nextMuted ? 0 : volume,
        audioCtxRef.current.currentTime
      );
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCurrentSoundscape();
      if (audioCtxRef.current) {
        void audioCtxRef.current.close();
      }
    };
  }, [stopCurrentSoundscape]);

  const currentPresetConfig = PRESETS.find(p => p.id === activePreset) || PRESETS[0];

  return (
    <div className="relative rounded-3xl glass-card p-6 overflow-hidden flex flex-col justify-between group border border-white/10 shadow-2xl min-h-[260px]">
      {/* Ambient background glow */}
      <div
        className="absolute -top-12 -left-12 w-40 h-40 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-25 group-hover:opacity-50"
        style={{ backgroundColor: currentPresetConfig.color }}
      />

      {/* Header with Title & Animated Audio Waves */}
      <div className="relative z-10 flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div
            className="p-1.5 rounded-xl border transition-colors"
            style={{
              backgroundColor: `${currentPresetConfig.color}20`,
              borderColor: `${currentPresetConfig.color}40`,
              color: currentPresetConfig.color,
            }}
          >
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold font-display text-white tracking-tight">
              Soundscape Engine
            </h4>
            <p className="text-[11px] text-slate-400 font-sans">
              Synthesized Bio-Ambient Audio
            </p>
          </div>
        </div>

        {/* Equalizer frequency bars animation */}
        <div className="flex items-end gap-0.5 h-5 px-2 py-1 rounded-lg bg-white/5 border border-white/5">
          {[0.6, 1.0, 0.4, 0.8, 0.5, 0.9, 0.3].map((heightRatio, i) => (
            <span
              key={i}
              className="w-1 rounded-full transition-all duration-300"
              style={{
                backgroundColor: currentPresetConfig.color,
                height: isPlaying ? `${Math.max(4, heightRatio * 18)}px` : '3px',
                animation: isPlaying ? `audio-pulse ${0.5 + i * 0.12}s ease-in-out infinite alternate` : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* Preset Selector Grid */}
      <div className="relative z-10 grid grid-cols-2 gap-2 my-3">
        {PRESETS.map((preset) => {
          const Icon = preset.icon;
          const isActive = preset.id === activePreset;
          return (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset.id)}
              className={`p-2.5 rounded-2xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                isActive
                  ? 'bg-white/10 border-white/25 text-white shadow-lg'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/8'
              }`}
            >
              <div
                className="p-1.5 rounded-xl transition-colors"
                style={{
                  backgroundColor: isActive ? `${preset.color}30` : 'rgba(255, 255, 255, 0.05)',
                  color: isActive ? preset.color : '#94a3b8',
                }}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold truncate leading-tight">
                  {preset.label}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {preset.badge}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Controls: Play/Pause Button + Volume Slider */}
      <div className="relative z-10 pt-3 border-t border-white/5 flex items-center justify-between gap-3">
        <button
          onClick={togglePlay}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-lg hover:scale-102 active:scale-98 cursor-pointer"
          style={{
            background: isPlaying
              ? `linear-gradient(135deg, ${currentPresetConfig.color} 0%, #4f46e5 100%)`
              : 'rgba(255, 255, 255, 0.1)',
            boxShadow: isPlaying ? `0 4px 20px -2px ${currentPresetConfig.color}60` : 'none',
          }}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Playing</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Listen</span>
            </>
          )}
        </button>

        {/* Volume & Mute control */}
        <div className="flex items-center gap-2 flex-1 max-w-[140px]">
          <button
            onClick={toggleMute}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-slate-300" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            title={`Volume: ${Math.round(volume * 100)}%`}
          />
        </div>
      </div>
    </div>
  );
};
