import React, { useRef } from 'react';
import { 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Camera, 
  Trash2, 
  ExternalLink, 
  Mail, 
  Globe, 
  Edit3 
} from 'lucide-react';
import { UserProfile } from '../../types';
import { useToast } from '../common/ToastContext';

interface ProfileCardProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onOpenEditModal: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onUpdateProfile,
  onOpenEditModal,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size must be under 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      onUpdateProfile({ ...profile, avatarUrl: dataUrl });
      showToast('Profile photo updated successfully', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    onUpdateProfile({ ...profile, avatarUrl: '' });
    showToast('Profile photo removed', 'info');
  };

  return (
    <div className="relative w-full rounded-3xl glass-card p-6 sm:p-8 overflow-hidden group border border-slate-200 dark:border-white/10 shadow-sm">
      {/* Decorative ambient gradient inside card */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
        {/* Avatar Area with controls */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative group/avatar">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-white/20 shadow-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center transition-transform duration-300 group-hover/avatar:scale-102">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-indigo-600 to-cyan-600 text-white text-3xl font-extrabold font-display">
                  {profile.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* Quick Hover Controls Overlay */}
            <div className="absolute inset-0 rounded-3xl bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                title="Upload new picture"
                aria-label="Upload profile picture"
              >
                <Camera className="w-4 h-4" />
              </button>
              {profile.avatarUrl && (
                <button
                  onClick={handleRemoveAvatar}
                  className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                  title="Remove picture"
                  aria-label="Remove profile picture"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Change Photo</span>
          </button>
        </div>

        {/* Profile Details & Bio */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2.5">
                <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
                  {profile.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                  Online
                </span>
              </div>
              <p 
                className="font-semibold text-sm mt-0.5 font-sans transition-colors"
                style={{ color: 'var(--theme-primary)' }}
              >
                {profile.title}
              </p>
            </div>

            <button
              onClick={onOpenEditModal}
              className="self-center md:self-start px-3.5 py-1.5 rounded-xl glass-button-secondary text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
              <span>Edit Profile</span>
            </button>
          </div>

          {/* Bio statement */}
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4 max-w-2xl">
            {profile.bio}
          </p>

          {/* Metadata Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-5">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="truncate">{profile.location}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <GraduationCap className="w-4 h-4 text-sky-500 shrink-0" />
              <span className="truncate">{profile.education}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <Briefcase className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="truncate">{profile.careerFocus}</span>
            </div>
          </div>

          {/* Social Links & Highlights */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-3 border-t border-slate-200 dark:border-white/5">
            {profile.socialLinks.github && (
              <a
                href={profile.socialLinks.github}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl glass-pill text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition-colors font-medium"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>GitHub</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-50" />
              </a>
            )}
            {profile.socialLinks.linkedin && (
              <a
                href={profile.socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl glass-pill text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition-colors font-medium"
              >
                <svg className="w-3.5 h-3.5 fill-[#0ea5e9]" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span>LinkedIn</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-50" />
              </a>
            )}
            {profile.socialLinks.portfolio && (
              <a
                href={profile.socialLinks.portfolio}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl glass-pill text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition-colors font-medium"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                <span>Portfolio</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-50" />
              </a>
            )}
            {profile.socialLinks.email && (
              <a
                href={`mailto:${profile.socialLinks.email}`}
                className="px-3 py-1.5 rounded-xl glass-pill text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition-colors font-medium"
              >
                <Mail className="w-3.5 h-3.5 text-indigo-500" />
                <span>Contact</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
