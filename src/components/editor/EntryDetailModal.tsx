import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Calendar, 
  Star, 
  Edit3, 
  Copy, 
  Trash2, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Mic, 
  Maximize2 
} from 'lucide-react';
import { Entry, Section } from '../../types';

interface EntryDetailModalProps {
  entry: Entry | null;
  section: Section;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (entry: Entry) => void;
  onDuplicate: (entry: Entry) => void;
  onDelete: (entry: Entry) => void;
  onToggleFavorite: (entry: Entry) => void;
}

export const EntryDetailModal: React.FC<EntryDetailModalProps> = ({
  entry,
  section,
  isOpen,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleFavorite,
}) => {
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);

  if (!isOpen || !entry) return null;

  // Simple Markdown to HTML-like paragraphs parser
  const renderFormattedContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-xl font-bold font-display text-white mt-4 mb-2">
            {line.replace('## ', '')}
          </h2>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-lg font-semibold font-display text-indigo-200 mt-3 mb-1">
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-slate-300 text-sm my-1">
            {line.replace('- ', '')}
          </li>
        );
      }
      if (line.startsWith('> ')) {
        return (
          <blockquote
            key={idx}
            className="border-l-2 border-indigo-500 pl-3 my-2 text-indigo-300/90 italic text-sm"
          >
            {line.replace('> ', '')}
          </blockquote>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-slate-200 text-sm leading-relaxed my-1 font-sans">
          {line}
        </p>
      );
    });
  };

  const images = entry.media.filter(m => m.type === 'image');
  const videos = entry.media.filter(m => m.type === 'video');
  const audios = entry.media.filter(m => m.type === 'audio');

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-3xl rounded-3xl glass-panel border border-white/10 shadow-2xl p-6 sm:p-8 my-auto relative max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Top Actions Bar */}
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: `${section.color}20`,
                  color: section.color,
                }}
              >
                {section.name}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <Calendar className="w-3.5 h-3.5" />
                <span>{entry.date}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onToggleFavorite(entry)}
                className={`p-2 rounded-xl border transition-all ${
                  entry.isFavorite
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
                title={entry.isFavorite ? 'Starred' : 'Star this entry'}
              >
                <Star className={`w-4 h-4 ${entry.isFavorite ? 'fill-amber-400' : ''}`} />
              </button>

              <button
                onClick={() => onEdit(entry)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Edit entry"
              >
                <Edit3 className="w-4 h-4 text-indigo-400" />
              </button>

              <button
                onClick={() => onDuplicate(entry)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Duplicate entry"
              >
                <Copy className="w-4 h-4 text-cyan-400" />
              </button>

              <button
                onClick={() => onDelete(entry)}
                className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:text-rose-200 hover:bg-rose-500/20 transition-colors"
                title="Delete entry"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight leading-snug">
              {entry.title}
            </h1>

            {/* Tags */}
            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {entry.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-md text-xs font-mono bg-white/5 border border-white/10 text-indigo-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Images Gallery */}
            {images.length > 0 && (
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {images.map(img => (
                    <div
                      key={img.id}
                      onClick={() => setActiveLightboxImage(img.url)}
                      className="group/img relative rounded-2xl overflow-hidden bg-slate-900 border border-white/10 aspect-video cursor-zoom-in"
                    >
                      <img src={img.url} alt={img.caption || entry.title} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="w-6 h-6 text-white" />
                      </div>
                      {img.caption && (
                        <div className="absolute bottom-0 inset-x-0 p-2 bg-black/70 text-[11px] text-slate-200">
                          {img.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Videos */}
            {videos.length > 0 && (
              <div className="space-y-3">
                {videos.map(vid => (
                  <div key={vid.id} className="rounded-2xl overflow-hidden border border-white/10 bg-black">
                    <video
                      controls
                      src={vid.url}
                      className="w-full max-h-96 rounded-2xl"
                      preload="metadata"
                    />
                    {vid.name && (
                      <p className="p-2 text-xs text-slate-400 font-mono">{vid.name}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Audio Recordings */}
            {audios.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5" />
                  <span>Voice Recordings & Audio</span>
                </h4>
                {audios.map(aud => (
                  <div key={aud.id} className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-xs font-medium text-slate-300">{aud.name || 'Voice Note'}</span>
                    <audio controls src={aud.url} className="w-full sm:w-72 h-8" />
                  </div>
                ))}
              </div>
            )}

            {/* Formatted Content */}
            <div className="prose prose-invert max-w-none pt-2">
              {renderFormattedContent(entry.content)}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Fullscreen Lightbox for Images */}
      <AnimatePresence>
        {activeLightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveLightboxImage(null)}
            className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <button
              onClick={() => setActiveLightboxImage(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={activeLightboxImage}
              alt="Enlarged view"
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
