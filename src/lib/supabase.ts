import { QuizPackage, Question, GameSessionArchive, Team } from '../types';
import { CURATED_QUESTIONS, PRESET_PACKAGES } from '../data/curatedQuestions';

const PACKAGES_KEY = 'min1paser_quiz_packages';
const QUESTIONS_KEY = 'min1paser_questions';
const SESSIONS_KEY = 'min1paser_game_sessions';

export interface StorageStatus {
  isSupabaseConfigured: boolean;
  supabaseUrl: string | null;
  storageType: 'supabase' | 'local_persistent';
}

export function checkStorageStatus(): StorageStatus {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || null;
  const isSupabaseConfigured = Boolean(
    supabaseUrl &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    import.meta.env.VITE_SUPABASE_ANON_KEY !== 'your-anon-key'
  );

  return {
    isSupabaseConfigured,
    supabaseUrl,
    storageType: isSupabaseConfigured ? 'supabase' : 'local_persistent'
  };
}

// Initialize seed data in LocalStorage if not present and merge new preset packages
export function initializeStorage() {
  if (typeof window === 'undefined') return;

  // Sync Packages
  const rawPackages = localStorage.getItem(PACKAGES_KEY);
  if (!rawPackages) {
    localStorage.setItem(PACKAGES_KEY, JSON.stringify(PRESET_PACKAGES));
  } else {
    try {
      const existingPackages: QuizPackage[] = JSON.parse(rawPackages);
      // Ensure all current PRESET_PACKAGES exist
      let updated = false;
      for (const preset of PRESET_PACKAGES) {
        const foundIdx = existingPackages.findIndex(p => p.id === preset.id);
        if (foundIdx === -1) {
          existingPackages.push(preset);
          updated = true;
        } else if (!existingPackages[foundIdx].isCustom) {
          // Keep preset question counts and questions up to date
          existingPackages[foundIdx] = preset;
          updated = true;
        }
      }
      if (updated) {
        localStorage.setItem(PACKAGES_KEY, JSON.stringify(existingPackages));
      }
    } catch (e) {
      localStorage.setItem(PACKAGES_KEY, JSON.stringify(PRESET_PACKAGES));
    }
  }

  // Sync Questions
  const rawQuestions = localStorage.getItem(QUESTIONS_KEY);
  if (!rawQuestions) {
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(CURATED_QUESTIONS));
  } else {
    try {
      const existingQuestions: Question[] = JSON.parse(rawQuestions);
      let updated = false;
      for (const curated of CURATED_QUESTIONS) {
        if (!existingQuestions.some(q => q.id === curated.id)) {
          existingQuestions.push(curated);
          updated = true;
        }
      }
      if (updated) {
        localStorage.setItem(QUESTIONS_KEY, JSON.stringify(existingQuestions));
      }
    } catch (e) {
      localStorage.setItem(QUESTIONS_KEY, JSON.stringify(CURATED_QUESTIONS));
    }
  }
  if (!localStorage.getItem(SESSIONS_KEY)) {
    // Seed one exemplary historical session for demonstration
    const sampleSession: GameSessionArchive = {
      id: 'session-demo-01',
      sessionTitle: 'Lomba Cerdas Cermat Kreatif Peringatan Hari Santri Nasional',
      className: 'Kelas 5 Umar bin Khattab',
      packageTitle: 'Turnamen Akbar Cerdas Cermat Siswa Kreatif MIN 1 Paser',
      subjectName: 'PAI & Keilmuan Terpadu',
      playedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      teams: [
        {
          id: 1,
          name: 'Kelompok 1: Al-Khawarizmi',
          scholar: 'Al-Khawarizmi (Bapak Matematika)',
          quote: '',
          color: 'emerald',
          bgClass: '',
          borderClass: '',
          badgeClass: '',
          accentHex: '#059669',
          members: ['Ahmad Fauzi', 'Aisyah Putri', 'Rizky Pratama'],
          score: 120,
          stars: 4,
          mistakes: 1,
          isEliminated: false,
          correctCount: 7,
          incorrectCount: 1,
          avatarIcon: 'Calculator'
        },
        {
          id: 2,
          name: 'Kelompok 2: Ibnu Sina',
          scholar: 'Ibnu Sina (Bapak Kedokteran)',
          quote: '',
          color: 'blue',
          bgClass: '',
          borderClass: '',
          badgeClass: '',
          accentHex: '#2563eb',
          members: ['Muhammad Rayhan', 'Fatimah Az-Zahra', 'Bilal Hakim'],
          score: 95,
          stars: 3,
          mistakes: 2,
          isEliminated: false,
          correctCount: 6,
          incorrectCount: 2,
          avatarIcon: 'Activity'
        },
        {
          id: 3,
          name: 'Kelompok 3: Al-Biruni',
          scholar: 'Al-Biruni (Pakar Astronomi)',
          quote: '',
          color: 'amber',
          bgClass: '',
          borderClass: '',
          badgeClass: '',
          accentHex: '#d97706',
          members: ['Faris Ramadhan', 'Khansa Nabila'],
          score: 75,
          stars: 2,
          mistakes: 2,
          isEliminated: false,
          correctCount: 5,
          incorrectCount: 2,
          avatarIcon: 'Globe'
        },
        {
          id: 4,
          name: 'Kelompok 4: Jabir bin Hayyan',
          scholar: 'Jabir bin Hayyan (Bapak Kimia)',
          quote: '',
          color: 'rose',
          bgClass: '',
          borderClass: '',
          badgeClass: '',
          accentHex: '#e11d48',
          members: ['Hafiz Al-Ghifari', 'Salwa Nurul'],
          score: 60,
          stars: 2,
          mistakes: 3,
          isEliminated: true,
          correctCount: 4,
          incorrectCount: 3,
          avatarIcon: 'FlaskConical'
        },
        {
          id: 5,
          name: 'Kelompok 5: Al-Kindi',
          scholar: 'Al-Kindi (Filosof Muslim)',
          quote: '',
          color: 'purple',
          bgClass: '',
          borderClass: '',
          badgeClass: '',
          accentHex: '#7c3aed',
          members: ['Zidan Al-Farisi', 'Najwa Shihab'],
          score: 50,
          stars: 1,
          mistakes: 3,
          isEliminated: true,
          correctCount: 3,
          incorrectCount: 3,
          avatarIcon: 'Brain'
        },
        {
          id: 6,
          name: 'Kelompok 6: Ibnu Rusyd',
          scholar: 'Ibnu Rusyd (Pakar Logika & Fikih)',
          quote: '',
          color: 'orange',
          bgClass: '',
          borderClass: '',
          badgeClass: '',
          accentHex: '#ea580c',
          members: ['Kenzo Al-Banjari', 'Nadia Syakirah'],
          score: 40,
          stars: 1,
          mistakes: 2,
          isEliminated: false,
          correctCount: 3,
          incorrectCount: 2,
          avatarIcon: 'BookOpenCheck'
        },
        {
          id: 7,
          name: 'Kelompok 7: Al-Farabi',
          scholar: 'Al-Farabi (Guru Kedua)',
          quote: '',
          color: 'cyan',
          bgClass: '',
          borderClass: '',
          badgeClass: '',
          accentHex: '#0891b2',
          members: ['Fatih Rabbani', 'Aqila Humaira'],
          score: 30,
          stars: 1,
          mistakes: 3,
          isEliminated: true,
          correctCount: 2,
          incorrectCount: 3,
          avatarIcon: 'Compass'
        },
        {
          id: 8,
          name: 'Kelompok 8: Al-Jazari',
          scholar: 'Al-Jazari (Bapak Robotika)',
          quote: '',
          color: 'pink',
          bgClass: '',
          borderClass: '',
          badgeClass: '',
          accentHex: '#db2777',
          members: ['Adli Rahman', 'Yasmin Salsabila'],
          score: 20,
          stars: 0,
          mistakes: 3,
          isEliminated: true,
          correctCount: 2,
          incorrectCount: 3,
          avatarIcon: 'Cpu'
        }
      ],
      winnerTeamId: 1,
      winnerTeamName: 'Kelompok 1: Al-Khawarizmi',
      winnerScore: 120,
      totalRounds: 10,
      eliminatedCount: 4,
      notes: 'Pertandingan cerdas cermat sangat seru dan antusias. Kelompok Al-Khawarizmi juara 1 dengan konsistensi nilai tertinggi.',
      madrasah: 'MIN 1 PASER',
      kepalaMadrasah: 'Ismail, S.Ag',
      pengembang: 'Dzakirul Husni, S.Pd'
    };
    localStorage.setItem(SESSIONS_KEY, JSON.stringify([sampleSession]));
  }
}

// QUIZ PACKAGES API
export async function getQuizPackages(): Promise<QuizPackage[]> {
  initializeStorage();
  try {
    const raw = localStorage.getItem(PACKAGES_KEY);
    return raw ? JSON.parse(raw) : PRESET_PACKAGES;
  } catch (e) {
    console.error('Error fetching quiz packages:', e);
    return PRESET_PACKAGES;
  }
}

export async function saveQuizPackage(pkg: QuizPackage): Promise<void> {
  const packages = await getQuizPackages();
  const existingIdx = packages.findIndex(p => p.id === pkg.id);
  if (existingIdx >= 0) {
    packages[existingIdx] = pkg;
  } else {
    packages.unshift(pkg);
  }
  localStorage.setItem(PACKAGES_KEY, JSON.stringify(packages));
}

export async function deleteQuizPackage(id: string): Promise<void> {
  const packages = await getQuizPackages();
  const filtered = packages.filter(p => p.id !== id);
  localStorage.setItem(PACKAGES_KEY, JSON.stringify(filtered));
}

// QUESTIONS API
export async function getQuestions(): Promise<Question[]> {
  initializeStorage();
  try {
    const raw = localStorage.getItem(QUESTIONS_KEY);
    return raw ? JSON.parse(raw) : CURATED_QUESTIONS;
  } catch (e) {
    console.error('Error fetching questions:', e);
    return CURATED_QUESTIONS;
  }
}

export async function saveQuestion(q: Question): Promise<void> {
  const questions = await getQuestions();
  const existingIdx = questions.findIndex(item => item.id === q.id);
  if (existingIdx >= 0) {
    questions[existingIdx] = q;
  } else {
    questions.unshift(q);
  }
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
}

export async function deleteQuestion(id: string): Promise<void> {
  const questions = await getQuestions();
  const filtered = questions.filter(item => item.id !== id);
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(filtered));
}

// GAME SESSIONS ARCHIVE API
export async function getGameSessions(): Promise<GameSessionArchive[]> {
  initializeStorage();
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error fetching sessions:', e);
    return [];
  }
}

export async function saveGameSession(session: GameSessionArchive): Promise<void> {
  const sessions = await getGameSessions();
  sessions.unshift(session);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export async function deleteGameSession(id: string): Promise<void> {
  const sessions = await getGameSessions();
  const filtered = sessions.filter(s => s.id !== id);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(filtered));
}
