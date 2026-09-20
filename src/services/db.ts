import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { 
  UserProfile, 
  UserSettings, 
  Section, 
  Entry, 
  ActivityItem 
} from '../types';
import { hashPasskey } from './auth';
import { THEME_PRESETS } from './theme';

interface LifeOSDB extends DBSchema {
  profile: {
    key: string;
    value: UserProfile;
  };
  settings: {
    key: string;
    value: UserSettings;
  };
  sections: {
    key: string;
    value: Section;
    indexes: { 'by-order': number };
  };
  entries: {
    key: string;
    value: Entry;
    indexes: { 
      'by-section': string;
      'by-date': string;
    };
  };
  activity: {
    key: string;
    value: ActivityItem;
    indexes: { 'by-timestamp': string };
  };
}

const DB_NAME = 'demo_life_os_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<LifeOSDB>> | null = null;

export async function getDB(): Promise<IDBPDatabase<LifeOSDB>> {
  if (!dbPromise) {
    dbPromise = openDB<LifeOSDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('profile')) {
          db.createObjectStore('profile');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
        if (!db.objectStoreNames.contains('sections')) {
          const sectionStore = db.createObjectStore('sections', { keyPath: 'id' });
          sectionStore.createIndex('by-order', 'orderIndex');
        }
        if (!db.objectStoreNames.contains('entries')) {
          const entryStore = db.createObjectStore('entries', { keyPath: 'id' });
          entryStore.createIndex('by-section', 'sectionId');
          entryStore.createIndex('by-date', 'date');
        }
        if (!db.objectStoreNames.contains('activity')) {
          const activityStore = db.createObjectStore('activity', { keyPath: 'id' });
          activityStore.createIndex('by-timestamp', 'timestamp');
        }
      },
    });
  }
  return dbPromise;
}

// Default Seed Profile
export const DEFAULT_PROFILE: UserProfile = {
  name: 'Demo User',
  title: 'Software Engineer & Creator',
  tagline: 'Software Engineering • Systems • Creative Tech • Building',
  bio: 'Passionate software engineer and creator dedicated to building clean, high-performance web products, interactive digital systems, and resilient software architectures.',
  location: 'San Francisco, CA',
  education: 'B.S. in Computer Science',
  careerFocus: 'Full Stack Engineering & Quality Assurance',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  socialLinks: {
    github: 'https://github.com/demo',
    linkedin: 'https://linkedin.com/in/demo',
    portfolio: 'https://demo-example.dev',
    email: 'demo@example.com',
  },
};

// Default Seed Sections
export const DEFAULT_SECTIONS: Section[] = [
  {
    id: 'myself',
    name: 'Myself',
    icon: 'User',
    description: 'Who I am, my personality, goals, philosophies, and personal reflections.',
    color: '#6366f1',
    layout: 'notebook',
    orderIndex: 0,
    isCustom: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'education',
    name: 'Education',
    icon: 'GraduationCap',
    description: 'My academic journey, coursework, certifications, and technical learning.',
    color: '#3b82f6',
    layout: 'timeline',
    orderIndex: 1,
    isCustom: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'family',
    name: 'Family',
    icon: 'Home',
    description: 'Important people, roots, traditions, and family milestones.',
    color: '#ec4899',
    layout: 'grid',
    orderIndex: 2,
    isCustom: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'friends',
    name: 'Friends',
    icon: 'Users',
    description: 'Cherished memories, university companions, and people who inspire me.',
    color: '#8b5cf6',
    layout: 'grid',
    orderIndex: 3,
    isCustom: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'hobby',
    name: 'Hobby',
    icon: 'Gamepad2',
    description: 'Mechanical keyboards, photography, gaming, and relaxing routines.',
    color: '#f59e0b',
    layout: 'grid',
    orderIndex: 4,
    isCustom: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'travel',
    name: 'Travel',
    icon: 'Globe',
    description: "Places I've visited and breathtaking destinations I plan to explore.",
    color: '#06b6d4',
    layout: 'grid',
    orderIndex: 5,
    isCustom: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'career',
    name: 'Career',
    icon: 'Briefcase',
    description: 'My career journey, QA engineering roadmap, and professional goals.',
    color: '#10b981',
    layout: 'timeline',
    orderIndex: 6,
    isCustom: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'projects',
    name: 'Projects',
    icon: 'Code',
    description: 'Software applications, testing suites, and experimental builds.',
    color: '#a855f7',
    layout: 'grid',
    orderIndex: 7,
    isCustom: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'achievements',
    name: 'Achievements',
    icon: 'Trophy',
    description: 'Honors, awards, completed milestones, and certifications.',
    color: '#eab308',
    layout: 'grid',
    orderIndex: 8,
    isCustom: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'memories',
    name: 'Favorite Memories',
    icon: 'Sparkles',
    description: 'Special moments, timeless memories, and life highlights.',
    color: '#f43f5e',
    layout: 'grid',
    orderIndex: 9,
    isCustom: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

// Seed Entries with realistic demo context
export const DEFAULT_ENTRIES: Entry[] = [
  {
    id: 'entry-bd-connect',
    sectionId: 'projects',
    title: 'PulseConnect — Emergency & Essential Community Directory',
    date: '2026-09-14',
    content: `## Project Vision
A unified, ultra-fast progressive web directory designed to help citizens quickly locate verified emergency services, local resources, and utility helplines during critical situations.

### Core Features
- **Instant Search:** Instant fuzzy indexing for emergency responders, blood banks, civil assistance, and utility helplines.
- **Offline First:** Cached locally via Service Workers so emergency contacts remain accessible without active cellular data.
- **Regional Filtering:** Rapid lookup by region and municipality.
- **Strict Data Verification:** Community verified with automated ping checks against outdated numbers.

### Technology Stack
- Next.js & React 19
- Tailwind CSS
- SQLite / Cloudflare D1 edge database
- Automated Cypress test coverage for search reliability`,
    tags: ['#project', '#web', '#pulseconnect', '#emergency', '#directory'],
    media: [
      {
        id: 'm-bdconnect-1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
        caption: 'PulseConnect dashboard interface and real-time directory search',
      },
    ],
    isFavorite: true,
    createdAt: '2026-09-14T08:00:00.000Z',
    updatedAt: '2026-09-14T10:30:00.000Z',
  },
  {
    id: 'entry-qa-framework',
    sectionId: 'projects',
    title: 'Playwright & Cypress Automated Regression Test Suite',
    date: '2026-08-28',
    content: `Designed an enterprise-grade automated testing framework for end-to-end user journeys and API mock validations.

### Architectural Highlights
- **Page Object Model (POM)** architecture for resilient maintainability.
- Multi-browser cross-platform matrix testing (Chromium, Firefox, WebKit).
- CI/CD integration with GitHub Actions triggering on every pull request.
- Visual regression snapshots detecting micro-layout shifts.`,
    tags: ['#qa', '#automation', '#playwright', '#testing', '#cicd'],
    media: [
      {
        id: 'm-qa-1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80',
        caption: 'Automated test suite executing across headless browser instances',
      },
    ],
    isFavorite: true,
    createdAt: '2026-08-28T14:00:00.000Z',
    updatedAt: '2026-08-28T16:00:00.000Z',
  },
  {
    id: 'entry-qa-internship',
    sectionId: 'career',
    title: 'QA Engineering & Testing Mastery Roadmap 2026',
    date: '2026-09-10',
    content: `### Career Objective
To establish a stellar foundation as a Software Quality Assurance Engineer, championing automated testing, performance profiling, and resilient software delivery.

### Key Milestones for 2026
1. Master API Automation Testing with Postman, Newman, and RestAssured.
2. Implement load and stress testing pipelines with k6 and JMeter.
3. Attain ISTQB Foundation Level (CTFL) certification.
4. Advocate for "Shift-Left" testing culture in team environments.`,
    tags: ['#career', '#qa', '#roadmap', '#goals'],
    media: [],
    isFavorite: true,
    createdAt: '2026-09-10T11:00:00.000Z',
    updatedAt: '2026-09-10T11:00:00.000Z',
  },
  {
    id: 'entry-university-se',
    sectionId: 'education',
    title: 'Advanced Software Engineering & Distributed Systems',
    date: '2026-06-15',
    content: `Completed coursework focusing on:
- Object-Oriented Analysis and Design (OOAD) with Design Patterns.
- Microservices communication and fault tolerance.
- Formal methods and software testing methodologies (Boundary Value Analysis, Equivalence Partitioning, Mutation Testing).
- Maintained a top GPA across core computer science laboratories.`,
    tags: ['#education', '#university', '#academics', '#cse'],
    media: [],
    isFavorite: false,
    createdAt: '2026-06-15T10:00:00.000Z',
    updatedAt: '2026-06-15T10:00:00.000Z',
  },
  {
    id: 'entry-hackathon-win',
    sectionId: 'achievements',
    title: 'First Place — Inter-University Smart City Hackathon',
    date: '2026-04-20',
    content: `Our 4-person engineering team won 1st place among 45 participating teams for developing an automated civic issue reporting and verification system.

I led the quality engineering and QA architecture, building simulated edge tests that demonstrated real-time stability under sudden traffic spikes.`,
    tags: ['#hackathon', '#achievement', '#winner', '#teamwork'],
    media: [
      {
        id: 'm-trophy-1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?auto=format&fit=crop&w=1000&q=80',
        caption: 'Team receiving the champions trophy and certificate',
      },
    ],
    isFavorite: true,
    createdAt: '2026-04-20T18:00:00.000Z',
    updatedAt: '2026-04-20T18:00:00.000Z',
  },
  {
    id: 'entry-sylhet-trip',
    sectionId: 'travel',
    title: 'Serene Mountain Mist & Pine Valley Escape',
    date: '2026-07-22',
    content: `An unforgettable three-day journey through peaceful alpine trails, cascading waterfalls, and misty pine valleys.

The morning drizzle across the rolling green slopes was deeply calming. Took dozens of high-contrast landscape photos and enjoyed authentic camp coffee at sunrise.`,
    tags: ['#travel', '#mountains', '#nature', '#photography', '#escape'],
    media: [
      {
        id: 'm-sylhet-1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80',
        caption: 'Lush green alpine trails and misty morning valley views',
      },
    ],
    isFavorite: true,
    createdAt: '2026-07-22T09:00:00.000Z',
    updatedAt: '2026-07-22T09:00:00.000Z',
  },
  {
    id: 'entry-mech-keyboard',
    sectionId: 'hobby',
    title: 'Custom 75% Mechanical Keyboard Build & Desk Setup',
    date: '2026-05-12',
    content: `Built my dream coding and testing setup:
- Custom anodized aluminum 75% case with brass weight.
- Gateron Oil King linear switches hand-lubed with Krytox 205g0.
- Durock V2 screw-in stabilizers with Holee mod.
- PBT doubleshot gradient keycaps with deep acoustic profile ("thock").
The typing feel during late-night programming sessions is unmatched!`,
    tags: ['#hobby', '#keyboard', '#desksetup', '#tech'],
    media: [
      {
        id: 'm-kb-1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
        caption: 'Completed 75% keyboard build on wool felt desk mat',
      },
    ],
    isFavorite: false,
    createdAt: '2026-05-12T16:00:00.000Z',
    updatedAt: '2026-05-12T16:00:00.000Z',
  },
  {
    id: 'entry-eid-dinner',
    sectionId: 'family',
    title: 'Annual Family Reunion & Festive Feast',
    date: '2026-03-31',
    content: `Gathered with the entire family for our annual reunion celebration. Endless laughter, traditional homemade dishes, sweet delicacies, and memorable stories passed down across generations. Taking time off from screens and coding to be fully present with family is the greatest blessing.`,
    tags: ['#family', '#celebration', '#reunion', '#memories'],
    media: [
      {
        id: 'm-family-1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1000&q=80',
        caption: 'Warm family gathering and evening celebration lights',
      },
    ],
    isFavorite: true,
    createdAt: '2026-03-31T20:00:00.000Z',
    updatedAt: '2026-03-31T20:00:00.000Z',
  },
  {
    id: 'entry-university-crew',
    sectionId: 'friends',
    title: 'Midnight Canteen Debates & Project Sprints',
    date: '2026-02-18',
    content: `Some of the finest memories are not just the finished apps, but the late-night tea at the campus canteen with the engineering crew, debugging mysterious memory leaks and arguing about tech stacks. Grateful for this camaraderie.`,
    tags: ['#friends', '#university', '#campuslife'],
    media: [],
    isFavorite: false,
    createdAt: '2026-02-18T23:30:00.000Z',
    updatedAt: '2026-02-18T23:30:00.000Z',
  },
  {
    id: 'entry-personal-philosophy',
    sectionId: 'myself',
    title: 'Personal Philosophy: Craftsmanship, Testing, & Clarity',
    date: '2026-01-05',
    content: `Three guiding principles I hold dear as an engineer and individual:
1. **Never Assume — Verify:** In software and life, testing assumptions early saves countless headaches later.
2. **Craftsmanship over Haste:** The extra 10% effort spent on polish, clean code, and subtle visual delight transforms good work into exceptional work.
3. **Continuous Curiosity:** Always remain a student. The moment you believe you know everything is the moment you stop growing.`,
    tags: ['#myself', '#philosophy', '#reflection', '#growth'],
    media: [],
    isFavorite: true,
    createdAt: '2026-01-05T09:00:00.000Z',
    updatedAt: '2026-01-05T09:00:00.000Z',
  },
];

// Seed Activities
export const DEFAULT_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'add',
    sectionId: 'projects',
    sectionName: 'Projects',
    entryTitle: 'PulseConnect — Emergency & Essential Community Directory',
    timestamp: '2026-09-14T08:00:00.000Z',
  },
  {
    id: 'act-2',
    type: 'update',
    sectionId: 'career',
    sectionName: 'Career',
    entryTitle: 'QA Engineering & Testing Mastery Roadmap 2026',
    timestamp: '2026-09-10T11:00:00.000Z',
  },
  {
    id: 'act-3',
    type: 'add',
    sectionId: 'projects',
    sectionName: 'Projects',
    entryTitle: 'Playwright & Cypress Automated Regression Test Suite',
    timestamp: '2026-08-28T14:00:00.000Z',
  },
  {
    id: 'act-4',
    type: 'favorite',
    sectionId: 'travel',
    sectionName: 'Travel',
    entryTitle: 'Serene Mountain Mist & Pine Valley Escape',
    timestamp: '2026-07-22T09:00:00.000Z',
  },
];

// Database Initialization & Seed Check
export async function initializeDatabase(): Promise<void> {
  const db = await getDB();

  // Check if profile exists
  const existingProfile = await db.get('profile', 'main');
  if (!existingProfile) {
    await db.put('profile', DEFAULT_PROFILE, 'main');
  }

  // Check if settings exist
  const existingSettings = await db.get('settings', 'main');
  if (!existingSettings) {
    const defaultPasskeyHash = await hashPasskey('demopass');
    const defaultSettings: UserSettings = {
      passkeyHash: defaultPasskeyHash,
      autoLockMinutes: 15,
      reducedMotion: false,
      theme: THEME_PRESETS.midnight,
      background: {
        preset: 'nebula',
        blur: 0,
        brightness: 100,
        opacity: 100,
        overlayDarkness: 35,
        scale: 100,
      },
    };
    await db.put('settings', defaultSettings, 'main');
  }

  // Check if sections exist
  const existingSections = await db.getAll('sections');
  if (existingSections.length === 0) {
    const tx = db.transaction('sections', 'readwrite');
    for (const sec of DEFAULT_SECTIONS) {
      await tx.store.put(sec);
    }
    await tx.done;
  }

  // Check if entries exist
  const existingEntries = await db.getAll('entries');
  if (existingEntries.length === 0) {
    const tx = db.transaction('entries', 'readwrite');
    for (const ent of DEFAULT_ENTRIES) {
      await tx.store.put(ent);
    }
    await tx.done;
  }

  // Check if activities exist
  const existingActivities = await db.getAll('activity');
  if (existingActivities.length === 0) {
    const tx = db.transaction('activity', 'readwrite');
    for (const act of DEFAULT_ACTIVITIES) {
      await tx.store.put(act);
    }
    await tx.done;
  }
}

// Profile API
export async function getProfile(): Promise<UserProfile> {
  const db = await getDB();
  const profile = await db.get('profile', 'main');
  return profile || DEFAULT_PROFILE;
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  const db = await getDB();
  await db.put('profile', profile, 'main');
}

// Settings API
export async function getSettings(): Promise<UserSettings> {
  const db = await getDB();
  const settings = await db.get('settings', 'main');
  if (settings) return settings;

  const defaultPasskeyHash = await hashPasskey('demopass');
  const defaultSettings: UserSettings = {
    passkeyHash: defaultPasskeyHash,
    autoLockMinutes: 15,
    reducedMotion: false,
    theme: THEME_PRESETS.midnight,
    background: {
      preset: 'nebula',
      blur: 0,
      brightness: 100,
      opacity: 100,
      overlayDarkness: 35,
      scale: 100,
    },
  };
  return defaultSettings;
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  const db = await getDB();
  await db.put('settings', settings, 'main');
}

// Sections API
export async function getSections(): Promise<Section[]> {
  const db = await getDB();
  const sections = await db.getAllFromIndex('sections', 'by-order');
  return sections;
}

export async function saveSection(section: Section): Promise<void> {
  const db = await getDB();
  await db.put('sections', section);
}

export async function deleteSection(id: string): Promise<void> {
  const db = await getDB();
  // Also delete all entries belonging to this section
  const entries = await db.getAllFromIndex('entries', 'by-section', id);
  const tx = db.transaction(['sections', 'entries'], 'readwrite');
  await tx.objectStore('sections').delete(id);
  for (const entry of entries) {
    await tx.objectStore('entries').delete(entry.id);
  }
  await tx.done;
}

export async function reorderSections(sectionIds: string[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('sections', 'readwrite');
  for (let i = 0; i < sectionIds.length; i++) {
    const sec = await tx.store.get(sectionIds[i]);
    if (sec) {
      sec.orderIndex = i;
      await tx.store.put(sec);
    }
  }
  await tx.done;
}

// Entries API
export async function getEntries(sectionId?: string): Promise<Entry[]> {
  const db = await getDB();
  if (sectionId) {
    return await db.getAllFromIndex('entries', 'by-section', sectionId);
  }
  return await db.getAll('entries');
}

export async function getEntry(id: string): Promise<Entry | undefined> {
  const db = await getDB();
  return await db.get('entries', id);
}

export async function saveEntry(entry: Entry, isNew: boolean = false, sectionName?: string): Promise<void> {
  const db = await getDB();
  await db.put('entries', entry);

  // Log activity
  if (sectionName) {
    await logActivity({
      id: 'act-' + Date.now(),
      type: isNew ? 'add' : 'update',
      sectionId: entry.sectionId,
      sectionName: sectionName,
      entryTitle: entry.title,
      timestamp: new Date().toISOString(),
    });
  }
}

export async function deleteEntry(id: string, sectionName?: string): Promise<void> {
  const db = await getDB();
  const entry = await db.get('entries', id);
  if (entry) {
    await db.delete('entries', id);
    if (sectionName) {
      await logActivity({
        id: 'act-' + Date.now(),
        type: 'delete',
        sectionId: entry.sectionId,
        sectionName: sectionName,
        entryTitle: entry.title,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export async function toggleFavorite(id: string): Promise<boolean> {
  const db = await getDB();
  const entry = await db.get('entries', id);
  if (entry) {
    entry.isFavorite = !entry.isFavorite;
    entry.updatedAt = new Date().toISOString();
    await db.put('entries', entry);
    return entry.isFavorite;
  }
  return false;
}

// Activity API
export async function getActivities(limit: number = 10): Promise<ActivityItem[]> {
  const db = await getDB();
  const all = await db.getAll('activity');
  return all
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

export async function logActivity(activity: ActivityItem): Promise<void> {
  const db = await getDB();
  await db.put('activity', activity);
}

// Backup & Restore
export async function exportAllData(): Promise<string> {
  const db = await getDB();
  const profile = await db.get('profile', 'main');
  const settings = await db.get('settings', 'main');
  const sections = await db.getAll('sections');
  const entries = await db.getAll('entries');
  const activity = await db.getAll('activity');

  const exportPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    profile,
    settings,
    sections,
    entries,
    activity,
  };

  return JSON.stringify(exportPayload, null, 2);
}

export async function importData(jsonString: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonString);
    if (!data.profile || !data.sections || !data.entries) {
      throw new Error('Invalid backup file structure');
    }

    const db = await getDB();
    const tx = db.transaction(['profile', 'settings', 'sections', 'entries', 'activity'], 'readwrite');
    
    await tx.objectStore('profile').clear();
    await tx.objectStore('profile').put(data.profile, 'main');

    if (data.settings) {
      await tx.objectStore('settings').clear();
      await tx.objectStore('settings').put(data.settings, 'main');
    }

    await tx.objectStore('sections').clear();
    for (const sec of data.sections) {
      await tx.objectStore('sections').put(sec);
    }

    await tx.objectStore('entries').clear();
    for (const ent of data.entries) {
      await tx.objectStore('entries').put(ent);
    }

    if (data.activity) {
      await tx.objectStore('activity').clear();
      for (const act of data.activity) {
        await tx.objectStore('activity').put(act);
      }
    }

    await tx.done;
    return true;
  } catch (err) {
    console.error('Import failed', err);
    return false;
  }
}

export async function resetDatabaseToSeed(): Promise<void> {
  const db = await getDB();
  const defaultPasskeyHash = await hashPasskey('demopass');
  const defaultSettings: UserSettings = {
    passkeyHash: defaultPasskeyHash,
    autoLockMinutes: 15,
    reducedMotion: false,
    theme: THEME_PRESETS.midnight,
    background: {
      preset: 'nebula',
      blur: 0,
      brightness: 100,
      opacity: 100,
      overlayDarkness: 35,
      scale: 100,
    },
  };

  const tx = db.transaction(['profile', 'settings', 'sections', 'entries', 'activity'], 'readwrite');
  
  await tx.objectStore('profile').clear();
  await tx.objectStore('settings').clear();
  await tx.objectStore('sections').clear();
  await tx.objectStore('entries').clear();
  await tx.objectStore('activity').clear();

  await tx.objectStore('profile').put(DEFAULT_PROFILE, 'main');
  await tx.objectStore('settings').put(defaultSettings, 'main');

  for (const sec of DEFAULT_SECTIONS) {
    await tx.objectStore('sections').put(sec);
  }

  for (const ent of DEFAULT_ENTRIES) {
    await tx.objectStore('entries').put(ent);
  }

  for (const act of DEFAULT_ACTIVITIES) {
    await tx.objectStore('activity').put(act);
  }

  await tx.done;
}
