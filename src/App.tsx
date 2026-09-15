import React, { useState, useEffect, useCallback } from 'react';
import { 
  UserProfile, 
  UserSettings, 
  Section, 
  Entry, 
  ActivityItem, 
  DashboardStats,
  ThemeConfig,
  BackgroundConfig 
} from './types';
import { 
  initializeDatabase, 
  getProfile, 
  saveProfile, 
  getSettings, 
  saveSettings, 
  getSections, 
  saveSection, 
  deleteSection, 
  reorderSections, 
  getEntries, 
  saveEntry, 
  deleteEntry, 
  toggleFavorite, 
  getActivities 
} from './services/db';
import { 
  isAuthenticated, 
  setAuthenticated, 
  updateLastActive, 
  checkAutoLock 
} from './services/auth';
import { applyTheme } from './services/theme';

// Components
import { ThreeScene } from './components/canvas/ThreeScene';
import { BackgroundLayer } from './components/background/BackgroundLayer';
import { PasskeyScreen } from './components/auth/PasskeyScreen';
import { Header } from './components/dashboard/Header';
import { ProfileCard } from './components/dashboard/ProfileCard';
import { StatsBar } from './components/dashboard/StatsBar';
import { SectionGrid } from './components/dashboard/SectionGrid';
import { RecentActivity } from './components/dashboard/RecentActivity';
import { FavoritesView } from './components/dashboard/FavoritesView';
import { QuickActions } from './components/dashboard/QuickActions';
import { SectionPage } from './components/section/SectionPage';
import { SectionModal } from './components/modals/SectionModal';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';
import { ThemeModal } from './components/theme/ThemeModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { EntryEditorModal } from './components/editor/EntryEditorModal';
import { ToastProvider } from './components/common/Toast';
import { useToast } from './components/common/ToastContext';

const DashboardContent: React.FC = () => {
  const { showToast } = useToast();

  // App State
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState<boolean>(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Navigation State
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [showFavoritesView, setShowFavoritesView] = useState(false);

  // Modal State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [sectionToEdit, setSectionToEdit] = useState<Section | null>(null);
  const [quickEntrySection, setQuickEntrySection] = useState<Section | null>(null);

  // Load Data
  const loadAppData = useCallback(async () => {
    try {
      await initializeDatabase();
      const [prof, sett, secs, ents, acts] = await Promise.all([
        getProfile(),
        getSettings(),
        getSections(),
        getEntries(),
        getActivities(8),
      ]);

      setProfile(prof);
      setSettings(sett);
      setSections(secs);
      setEntries(ents);
      setActivities(acts);

      // Check existing session
      const currentlyAuthed = isAuthenticated();
      if (currentlyAuthed) {
        const timedOut = checkAutoLock(sett.autoLockMinutes);
        setAuthed(!timedOut);
      } else {
        setAuthed(false);
      }

      // Apply theme CSS variables
      if (sett.theme) {
        applyTheme(sett.theme);
      }
    } catch (err) {
      console.error('Failed to load Life OS data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const fetchApp = async () => {
      await loadAppData();
    };
    if (active) {
      void fetchApp();
    }
    return () => {
      active = false;
    };
  }, [loadAppData]);

  // Activity tracking for Auto-Lock
  useEffect(() => {
    if (!authed || !settings || settings.autoLockMinutes <= 0) return;

    const handleUserActivity = () => {
      updateLastActive();
    };

    window.addEventListener('mousemove', handleUserActivity, { passive: true });
    window.addEventListener('keydown', handleUserActivity, { passive: true });
    window.addEventListener('click', handleUserActivity, { passive: true });

    const interval = setInterval(() => {
      if (checkAutoLock(settings.autoLockMinutes)) {
        setAuthed(false);
        showToast('Dashboard auto-locked due to inactivity', 'info');
      }
    }, 15000);

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      clearInterval(interval);
    };
  }, [authed, settings, showToast]);

  // Compute Statistics
  const dashboardStats: DashboardStats = React.useMemo(() => {
    let photosCount = 0;
    let videosCount = 0;
    let audioCount = 0;
    let favoritesCount = 0;

    entries.forEach(e => {
      if (e.isFavorite) favoritesCount++;
      e.media.forEach(m => {
        if (m.type === 'image') photosCount++;
        if (m.type === 'video') videosCount++;
        if (m.type === 'audio') audioCount++;
      });
    });

    return {
      sectionsCount: sections.length,
      entriesCount: entries.length,
      photosCount,
      videosCount,
      audioCount,
      favoritesCount,
    };
  }, [sections, entries]);

  // Lock Handler
  const handleLock = () => {
    setAuthenticated(false);
    setAuthed(false);
    setActiveSection(null);
    setShowFavoritesView(false);
    showToast('Dashboard locked', 'info');
  };

  // Section CRUD Handlers
  const handleSaveSection = async (sec: Section) => {
    await saveSection(sec);
    const updatedSecs = await getSections();
    setSections(updatedSecs);
    if (activeSection && activeSection.id === sec.id) {
      setActiveSection(sec);
    }
  };

  const handleDeleteSection = async (sec: Section) => {
    if (window.confirm(`Are you sure you want to delete "${sec.name}"? All entries in this section will also be deleted.`)) {
      await deleteSection(sec.id);
      const updatedSecs = await getSections();
      const updatedEnts = await getEntries();
      setSections(updatedSecs);
      setEntries(updatedEnts);
      if (activeSection && activeSection.id === sec.id) {
        setActiveSection(null);
      }
      showToast(`Section "${sec.name}" deleted`, 'info');
    }
  };

  const handleReorderSections = async (newOrderIds: string[]) => {
    await reorderSections(newOrderIds);
    const updatedSecs = await getSections();
    setSections(updatedSecs);
  };

  // Entry CRUD Handlers
  const handleSaveEntry = async (entry: Entry, isNew: boolean) => {
    const targetSection = sections.find(s => s.id === entry.sectionId);
    await saveEntry(entry, isNew, targetSection?.name);
    const updatedEnts = await getEntries();
    const updatedActs = await getActivities(8);
    setEntries(updatedEnts);
    setActivities(updatedActs);
  };

  const handleDeleteEntry = async (entryId: string) => {
    const entry = entries.find(e => e.id === entryId);
    const targetSection = sections.find(s => s.id === entry?.sectionId);
    if (window.confirm('Are you sure you want to delete this entry?')) {
      await deleteEntry(entryId, targetSection?.name);
      const updatedEnts = await getEntries();
      const updatedActs = await getActivities(8);
      setEntries(updatedEnts);
      setActivities(updatedActs);
      showToast('Entry deleted', 'info');
    }
  };

  const handleToggleFavorite = async (entryId: string) => {
    const isFav = await toggleFavorite(entryId);
    const updatedEnts = await getEntries();
    setEntries(updatedEnts);
    showToast(isFav ? 'Added to favorites' : 'Removed from favorites', 'info');
  };

  // Profile Update
  const handleUpdateProfile = async (updated: UserProfile) => {
    await saveProfile(updated);
    setProfile(updated);
  };

  // Settings & Theme Updates
  const handleSaveTheme = async (newTheme: ThemeConfig) => {
    if (!settings) return;
    const updatedSettings = { ...settings, theme: newTheme };
    await saveSettings(updatedSettings);
    setSettings(updatedSettings);
  };

  const handleSaveBackground = async (newBg: BackgroundConfig) => {
    if (!settings) return;
    const updatedSettings = { ...settings, background: newBg };
    await saveSettings(updatedSettings);
    setSettings(updatedSettings);
  };

  const handleSaveSettings = async (newSettings: UserSettings) => {
    await saveSettings(newSettings);
    setSettings(newSettings);
  };

  // Loading Screen
  if (loading || !profile || !settings) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#07090e] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-400">Booting Demo 3D Life OS...</p>
        </div>
      </div>
    );
  }

  // Passkey Lock Screen
  if (!authed) {
    return (
      <PasskeyScreen
        profile={profile}
        settings={settings}
        onUnlock={() => setAuthed(true)}
      />
    );
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background and 3D Canvas Layers */}
      <BackgroundLayer config={settings.background} />
      <ThreeScene enabled={settings.enable3D && !settings.reducedMotion} theme={settings.theme} />

      {/* Main Top Header */}
      <Header
        profile={profile}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenTheme={() => setIsThemeOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLock={handleLock}
      />

      {/* Main Body Content */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Navigation State Router */}
        {showFavoritesView ? (
          <FavoritesView
            entries={entries}
            sections={sections}
            onSelectEntry={(entry, sec) => {
              setShowFavoritesView(false);
              setActiveSection(sec);
            }}
            onBack={() => setShowFavoritesView(false)}
          />
        ) : activeSection ? (
          <SectionPage
            section={activeSection}
            entries={entries.filter(e => e.sectionId === activeSection.id)}
            onBack={() => setActiveSection(null)}
            onSaveEntry={handleSaveEntry}
            onDeleteEntry={handleDeleteEntry}
            onToggleFavorite={handleToggleFavorite}
          />
        ) : (
          /* Main 3D Dashboard View */
          <div className="space-y-8">
            {/* Central Profile Area */}
            <ProfileCard
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onOpenEditModal={() => setIsSettingsOpen(true)}
            />

            {/* Dashboard Statistics Bar */}
            <StatsBar
              stats={dashboardStats}
              onFilterFavorites={() => setShowFavoritesView(true)}
            />

            {/* 3D Section Realms Grid */}
            <SectionGrid
              sections={sections}
              entries={entries}
              onSelectSection={sec => setActiveSection(sec)}
              onOpenAddModal={() => {
                setSectionToEdit(null);
                setIsSectionModalOpen(true);
              }}
              onEditSection={sec => {
                setSectionToEdit(sec);
                setIsSectionModalOpen(true);
              }}
              onDeleteSection={handleDeleteSection}
              onReorderSections={handleReorderSections}
            />

            {/* Recent Activity Feed */}
            <RecentActivity
              activities={activities}
              onSelectActivity={act => {
                const targetSec = sections.find(s => s.id === act.sectionId);
                if (targetSec) {
                  setActiveSection(targetSec);
                }
              }}
            />
          </div>
        )}
      </main>

      {/* Floating Quick Actions Dock */}
      <QuickActions
        onNewEntry={() => {
          setQuickEntrySection(activeSection || sections[0]);
        }}
        onNewSection={() => {
          setSectionToEdit(null);
          setIsSectionModalOpen(true);
        }}
        onUploadPhoto={() => {
          setQuickEntrySection(activeSection || sections[0]);
        }}
        onRecordVoice={() => {
          setQuickEntrySection(activeSection || sections[0]);
        }}
        onSearch={() => setIsSearchOpen(true)}
        onLock={handleLock}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        sections={sections}
        entries={entries}
        onSelectResult={(entry, sec) => {
          setShowFavoritesView(false);
          setActiveSection(sec);
        }}
      />

      {/* Theme & Background Modal */}
      <ThemeModal
        isOpen={isThemeOpen}
        onClose={() => setIsThemeOpen(false)}
        currentTheme={settings.theme}
        currentBackground={settings.background}
        onSaveTheme={handleSaveTheme}
        onSaveBackground={handleSaveBackground}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        settings={settings}
        onSaveProfile={handleUpdateProfile}
        onSaveSettings={handleSaveSettings}
        onDataReload={loadAppData}
      />

      {/* Add / Edit Section Modal */}
      <SectionModal
        isOpen={isSectionModalOpen}
        onClose={() => {
          setIsSectionModalOpen(false);
          setSectionToEdit(null);
        }}
        sectionToEdit={sectionToEdit}
        onSave={handleSaveSection}
        existingCount={sections.length}
      />

      {/* Quick Entry Editor Modal */}
      {quickEntrySection && (
        <EntryEditorModal
          isOpen={true}
          onClose={() => setQuickEntrySection(null)}
          section={quickEntrySection}
          onSaveEntry={handleSaveEntry}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  );
}
