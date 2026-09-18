import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Calendar, 
  Tag as TagIcon, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Trash2, 
  Star, 
  Bold, 
  Italic, 
  Underline, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Upload, 
  Check 
} from 'lucide-react';
import { Entry, MediaItem, Section } from '../../types';
import { useToast } from '../common/ToastContext';

interface EntryEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: Section;
  existingEntry?: Entry | null;
  initialDraft?: { title?: string; content?: string } | null;
  onSaveEntry: (entry: Entry, isNew: boolean) => void;
}

const EntryEditorModalContent: React.FC<EntryEditorModalProps> = ({
  onClose,
  section,
  existingEntry,
  initialDraft,
  onSaveEntry,
}) => {
  const { showToast } = useToast();

  const [title, setTitle] = useState(existingEntry?.title || initialDraft?.title || '');
  const [date, setDate] = useState(
    existingEntry?.date || new Date().toISOString().split('T')[0]
  );
  const [content, setContent] = useState(existingEntry?.content || initialDraft?.content || '');
  const [tags, setTags] = useState<string[]>(existingEntry?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [media, setMedia] = useState<MediaItem[]>(existingEntry?.media || []);
  const [isFavorite, setIsFavorite] = useState(existingEntry?.isFavorite || false);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // File Inputs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Clean up recording timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Tag Handling
  const handleAddTag = (e?: React.KeyboardEvent) => {
    if (e && e.key !== 'Enter') return;
    if (e) e.preventDefault();

    const formatted = tagInput.trim().startsWith('#') ? tagInput.trim() : `#${tagInput.trim()}`;
    if (formatted.length > 1 && !tags.includes(formatted)) {
      setTags([...tags, formatted]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Rich Text Insertion Helper
  const insertFormatting = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 4));
    }, 0);
  };

  // Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        showToast('Only image files are allowed', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const newMedia: MediaItem = {
          id: 'img-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
          type: 'image',
          url: reader.result as string,
          name: file.name,
          size: file.size,
        };
        setMedia(prev => [...prev, newMedia]);
        showToast('Image attached', 'success');
      };
      reader.readAsDataURL(file);
    });
  };

  // Video Upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      showToast('Only video files are allowed', 'error');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      showToast('Video exceeds 50MB limit', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const newMedia: MediaItem = {
        id: 'vid-' + Date.now(),
        type: 'video',
        url: reader.result as string,
        name: file.name,
        size: file.size,
      };
      setMedia(prev => [...prev, newMedia]);
      showToast('Video attached', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Audio Upload
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      showToast('Only audio files are allowed', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const newMedia: MediaItem = {
        id: 'aud-' + Date.now(),
        type: 'audio',
        url: reader.result as string,
        name: file.name || 'Audio Recording',
        size: file.size,
      };
      setMedia(prev => [...prev, newMedia]);
      showToast('Audio track attached', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Live Voice Recording (MediaRecorder API)
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = () => {
          const newMedia: MediaItem = {
            id: 'rec-' + Date.now(),
            type: 'audio',
            url: reader.result as string,
            name: `Voice Note (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
            size: audioBlob.size,
          };
          setMedia(prev => [...prev, newMedia]);
          showToast('Voice note recorded & attached', 'success');
        };
        reader.readAsDataURL(audioBlob);

        // Stop audio tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setIsPaused(false);
      setRecordingSeconds(0);

      timerRef.current = window.setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch {
      showToast('Microphone access denied or unavailable', 'error');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    } else if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const removeMedia = (id: string) => {
    setMedia(media.filter(m => m.id !== id));
  };

  // Save handler
  const handleSave = () => {
    if (!title.trim()) {
      showToast('Please enter an entry title', 'error');
      return;
    }

    const now = new Date().toISOString();
    const entryData: Entry = {
      id: existingEntry ? existingEntry.id : 'entry-' + Date.now(),
      sectionId: section.id,
      title: title.trim(),
      date: date || now.split('T')[0],
      content: content.trim(),
      tags,
      media,
      isFavorite,
      createdAt: existingEntry ? existingEntry.createdAt : now,
      updatedAt: now,
    };

    onSaveEntry(entryData, !existingEntry);
    onClose();
    showToast(existingEntry ? 'Entry updated successfully' : 'New entry created', 'success');
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-3xl rounded-3xl glass-panel border border-white/10 shadow-2xl p-6 sm:p-8 my-auto relative max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center border font-bold text-sm"
              style={{
                backgroundColor: `${section.color}20`,
                borderColor: `${section.color}40`,
                color: section.color,
              }}
            >
              {section.name.slice(0, 1)}
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-white truncate">
                {existingEntry ? 'Edit Notebook Entry' : `New Entry in ${section.name}`}
              </h2>
              <p className="text-xs text-slate-400">Capture your memory, thought, or milestone</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-xl border transition-all ${
                isFavorite
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Editor Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5 pr-1">
          {/* Title & Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Entry Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. BD Connect, Sreemangal Expedition, Test Automation..."
                className="w-full px-4 py-2.5 rounded-xl glass-input text-white text-sm focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Date</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-white text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Rich Text Toolbar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Notes / Story
              </label>
              <span className="text-[11px] text-slate-500">Supports Markdown</span>
            </div>

            <div className="flex flex-wrap items-center gap-1 p-2 rounded-t-xl bg-white/5 border border-white/10 border-b-0">
              <button
                type="button"
                onClick={() => insertFormatting('**', '**')}
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10"
                title="Bold"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('*', '*')}
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10"
                title="Italic"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<u>', '</u>')}
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10"
                title="Underline"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>
              <div className="w-[1px] h-4 bg-white/10 mx-1" />
              <button
                type="button"
                onClick={() => insertFormatting('## ')}
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10"
                title="Heading 1"
              >
                <Heading1 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('### ')}
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10"
                title="Heading 2"
              >
                <Heading2 className="w-3.5 h-3.5" />
              </button>
              <div className="w-[1px] h-4 bg-white/10 mx-1" />
              <button
                type="button"
                onClick={() => insertFormatting('- ')}
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10"
                title="Bullet list"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('1. ')}
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10"
                title="Numbered list"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('> ')}
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10"
                title="Quote"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('```\n', '\n```')}
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10"
                title="Code block"
              >
                <Code className="w-3.5 h-3.5" />
              </button>
            </div>

            <textarea
              ref={textareaRef}
              rows={7}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write your notes, memories, code snippets, or thoughts here..."
              className="w-full px-4 py-3 rounded-b-xl glass-input text-white text-sm font-sans focus:ring-2 focus:ring-indigo-500 font-normal leading-relaxed resize-y"
            />
          </div>

          {/* Media Attachments Section */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Attached Media (Photos, Video, Voice)
            </label>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              {/* Add Photo Button */}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl glass-button-secondary text-xs font-medium flex items-center gap-1.5"
              >
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Add Image</span>
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />

              {/* Add Video Button */}
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl glass-button-secondary text-xs font-medium flex items-center gap-1.5"
              >
                <VideoIcon className="w-3.5 h-3.5 text-purple-400" />
                <span>Add Video</span>
              </button>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleVideoUpload}
              />

              {/* Upload Audio File */}
              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl glass-button-secondary text-xs font-medium flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-sky-400" />
                <span>Upload Audio</span>
              </button>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleAudioUpload}
              />

              {/* Record Voice Button */}
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 text-amber-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Mic className="w-3.5 h-3.5 text-amber-400" />
                  <span>Record Voice</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 p-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-xs font-mono text-rose-200 font-bold">
                    {formatTimer(recordingSeconds)}
                  </span>
                  <button
                    type="button"
                    onClick={pauseRecording}
                    className="p-1 rounded bg-white/10 hover:bg-white/20 text-white"
                    title={isPaused ? 'Resume' : 'Pause'}
                  >
                    {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                  </button>
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="p-1 rounded bg-rose-600 hover:bg-rose-500 text-white"
                    title="Stop & Save"
                  >
                    <Square className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Media Gallery Previews */}
            {media.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                {media.map(m => (
                  <div
                    key={m.id}
                    className="relative group/media rounded-xl overflow-hidden bg-slate-900 border border-white/10 aspect-video flex items-center justify-center"
                  >
                    {m.type === 'image' && (
                      <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                    )}
                    {m.type === 'video' && (
                      <div className="flex flex-col items-center gap-1 text-slate-300 p-2 text-center">
                        <VideoIcon className="w-6 h-6 text-purple-400" />
                        <span className="text-[10px] truncate max-w-[100px]">{m.name || 'Video'}</span>
                      </div>
                    )}
                    {m.type === 'audio' && (
                      <div className="flex flex-col items-center gap-1 text-slate-300 p-2 text-center">
                        <Mic className="w-6 h-6 text-amber-400" />
                        <span className="text-[10px] truncate max-w-[100px]">{m.name || 'Voice Note'}</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => removeMedia(m.id)}
                      className="absolute top-1 right-1 p-1 rounded-md bg-black/70 hover:bg-rose-600 text-white opacity-0 group-hover/media:opacity-100 transition-opacity"
                      title="Remove attachment"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags Section */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <TagIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tags</span>
            </label>

            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-mono flex items-center gap-1.5"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="#add-tag and press Enter"
                  className="px-3 py-1 rounded-lg glass-input text-xs text-white placeholder-slate-500 w-44"
                />
                <button
                  type="button"
                  onClick={() => handleAddTag()}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl glass-button-secondary text-xs font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl glass-button-primary text-xs font-bold flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Save Entry</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const EntryEditorModal: React.FC<EntryEditorModalProps> = (props) => {
  if (!props.isOpen) return null;
  return <EntryEditorModalContent key={props.existingEntry?.id || (props.initialDraft?.title ? 'draft' : 'new')} {...props} />;
};
