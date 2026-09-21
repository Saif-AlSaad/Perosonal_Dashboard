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

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export type SoundscapePresetId = 'cosmic-drone' | 'cyberpunk-rain' | 'lo-fi-vinyl' | 'deep-void';

interface SoundscapePreset {
  id: SoundscapePresetId;
  label: string;
  icon: React.ElementType;
  color: string;
  badge: string;
}

const YT_DEEP_VOID_VIDEO_ID = 'I3OJUwILelU';

const PRESETS: SoundscapePreset[] = [
  { id: 'cosmic-drone', label: 'Cosmic Drone', icon: Radio, color: '#6366f1', badge: 'Analog Pad' },
  { id: 'cyberpunk-rain', label: 'Cyber Rain', icon: CloudRain, color: '#06b6d4', badge: 'Atmospheric' },
  { id: 'lo-fi-vinyl', label: 'Lo-Fi Vinyl', icon: Disc, color: '#f59e0b', badge: 'Warm Crackle' },
  { id: 'deep-void', label: 'Deep Void', icon: Waves, color: '#a855f7', badge: 'Healing Ambient' },
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

  // YouTube Audio Player Ref for Deep Void
  const ytPlayerRef = useRef<any>(null);
  const isYtReadyRef = useRef<boolean>(false);

  // State refs for async callbacks
  const isPlayingRef = useRef(isPlaying);
  const activePresetRef = useRef(activePreset);
  const volumeRef = useRef(volume);
  const isMutedRef = useRef(isMuted);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    activePresetRef.current = activePreset;
    volumeRef.current = volume;
    isMutedRef.current = isMuted;
  }, [isPlaying, activePreset, volume, isMuted]);

  // Initialize YouTube IFrame Player
  useEffect(() => {
    let isCancelled = false;

    const createPlayer = () => {
      if (isCancelled || !window.YT || !window.YT.Player || ytPlayerRef.current) return;
      try {
        ytPlayerRef.current = new window.YT.Player('ambient-deep-void-yt-player', {
          height: '100',
          width: '100',
          videoId: YT_DEEP_VOID_VIDEO_ID,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            loop: 1,
            playlist: YT_DEEP_VOID_VIDEO_ID,
            playsinline: 1,
            rel: 0,
          },
          events: {
            onReady: (event: any) => {
              isYtReadyRef.current = true;
              const currentVol = isMutedRef.current ? 0 : Math.round(volumeRef.current * 100);
              event.target.setVolume(currentVol);
              if (isMutedRef.current) {
                event.target.mute();
              }
              if (isPlayingRef.current && activePresetRef.current === 'deep-void') {
                event.target.playVideo();
              }
            },
            onStateChange: (event: any) => {
              if (window.YT && event.data === window.YT.PlayerState.ENDED) {
                event.target.playVideo();
              }
            },
          },
        });
      } catch (err) {
        console.warn('Could not initialize YouTube player for Deep Void:', err);
      }
    };

    if (!window.YT) {
      const existingScript = document.getElementById('youtube-iframe-api');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      }

      const prevReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevReady) prevReady();
        createPlayer();
      };
    } else {
      createPlayer();
    }

    return () => {
      isCancelled = true;
    };
  }, []);

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

    // If preset is Deep Void, play YouTube music stream
    if (presetId === 'deep-void') {
      if (ytPlayerRef.current && isYtReadyRef.current) {
        try {
          const currentVol = isMutedRef.current ? 0 : Math.round(volumeRef.current * 100);
          ytPlayerRef.current.setVolume(currentVol);
          if (isMutedRef.current) {
            ytPlayerRef.current.mute();
          } else {
            ytPlayerRef.current.unMute();
          }
          ytPlayerRef.current.playVideo();
        } catch (err) {
          console.warn('Failed to start YouTube playback:', err);
        }
      }
      return;
    }

    // Otherwise, ensure YouTube is paused and play Web Audio synth
    if (ytPlayerRef.current && isYtReadyRef.current) {
      try {
        ytPlayerRef.current.pauseVideo();
      } catch {
        // Ignore
      }
    }

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
    }
  }, [getAudioContext, stopCurrentSoundscape]);

  // Toggle play/pause
  const togglePlay = () => {
    if (isPlaying) {
      stopCurrentSoundscape();
      if (ytPlayerRef.current && isYtReadyRef.current) {
        try {
          ytPlayerRef.current.pauseVideo();
        } catch {
          // Ignore
        }
      }
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
    if (ytPlayerRef.current && isYtReadyRef.current) {
      try {
        ytPlayerRef.current.setVolume(isMuted ? 0 : Math.round(newVal * 100));
      } catch {
        // Ignore
      }
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
    if (ytPlayerRef.current && isYtReadyRef.current) {
      try {
        if (nextMuted) {
          ytPlayerRef.current.mute();
        } else {
          ytPlayerRef.current.unMute();
          ytPlayerRef.current.setVolume(Math.round(volume * 100));
        }
      } catch {
        // Ignore
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCurrentSoundscape();
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch {
          // Ignore
        }
      }
      if (audioCtxRef.current) {
        void audioCtxRef.current.close();
      }
    };
  }, [stopCurrentSoundscape]);

  const currentPresetConfig = PRESETS.find(p => p.id === activePreset) || PRESETS[0];

  return (
    <div className="relative rounded-3xl glass-card p-6 overflow-hidden flex flex-col justify-between group border border-slate-200 dark:border-white/10 shadow-2xl min-h-[260px]">
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
            <h4 className="text-sm font-bold font-display text-slate-900 dark:text-white tracking-tight">
              Soundscape Engine
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
              Synthesized Bio-Ambient Audio
            </p>
          </div>
        </div>

        {/* Equalizer frequency bars animation */}
        <div className="flex items-end gap-0.5 h-5 px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
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
                  ? 'bg-indigo-50/90 dark:bg-white/10 border-indigo-300 dark:border-white/25 text-indigo-950 dark:text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-white/5 border-slate-200/90 dark:border-white/5 text-slate-700 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:text-slate-200 dark:hover:bg-white/8'
              }`}
            >
              <div
                className="p-1.5 rounded-xl transition-colors"
                style={{
                  backgroundColor: isActive ? `${preset.color}30` : 'rgba(15, 23, 42, 0.05)',
                  color: isActive ? preset.color : '#64748b',
                }}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold truncate leading-tight">
                  {preset.label}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {preset.badge}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Controls: Play/Pause Button + Volume Slider */}
      <div className="relative z-10 pt-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between gap-3">
        <button
          onClick={togglePlay}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md hover:scale-102 active:scale-98 cursor-pointer ${
            isPlaying
              ? 'text-white'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 dark:bg-white/10 dark:text-white dark:border-white/10'
          }`}
          style={{
            background: isPlaying
              ? `linear-gradient(135deg, ${currentPresetConfig.color} 0%, #4f46e5 100%)`
              : undefined,
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
            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-200 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-400"
            title={`Volume: ${Math.round(volume * 100)}%`}
          />
        </div>
      </div>

      {/* Hidden YouTube audio player for Deep Void preset */}
      <div
        className="absolute -left-[9999px] -top-[9999px] w-1 h-1 overflow-hidden pointer-events-none opacity-0"
        aria-hidden="true"
        tabIndex={-1}
      >
        <div id="ambient-deep-void-yt-player" />
      </div>
    </div>
  );
};
