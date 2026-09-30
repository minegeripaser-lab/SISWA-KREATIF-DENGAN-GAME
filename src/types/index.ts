export type GradeLevel = '1' | '2' | '3' | '4' | '5' | '6';
export type DifficultyLevel = 'mudah' | 'sedang' | 'sulit_hots';

export interface QuestionOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface Question {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  points: number;
  timeLimitSeconds: number;
  subject: string;
  grade: GradeLevel;
  difficulty: DifficultyLevel;
  isAiGenerated?: boolean;
}

export interface Team {
  id: number; // 1 to 8
  name: string;
  scholar: string; // e.g., "Al-Khawarizmi (Bapak Aljabar)"
  quote: string;
  color: string;
  bgClass: string;
  borderClass: string;
  badgeClass: string;
  accentHex: string;
  members: string[];
  score: number;
  stars: number;
  mistakes: number; // 0, 1, 2, 3 (3 = TERELIMINASI)
  isEliminated: boolean;
  correctCount: number;
  incorrectCount: number;
  avatarIcon: string;
}

export interface QuizPackage {
  id: string;
  title: string;
  description: string;
  grade: GradeLevel;
  subject: string;
  totalQuestions: number;
  questions: Question[];
  createdAt: string;
  isCustom?: boolean;
}

export interface GameSessionArchive {
  id: string;
  sessionTitle: string;
  className: string;
  packageTitle: string;
  subjectName: string;
  playedAt: string;
  teams: Team[];
  winnerTeamId: number | null;
  winnerTeamName: string | null;
  winnerScore: number;
  totalRounds: number;
  eliminatedCount: number;
  notes?: string;
  madrasah: string;
  kepalaMadrasah: string;
  pengembang: string;
}

export interface SchoolIdentity {
  madrasahName: string;
  fullName: string;
  address: string;
  city: string;
  province: string;
  email: string;
  kepalaMadrasah: string;
  kepalaMadrasahTitle: string;
  pengembang: string;
  pengembangTitle: string;
  tagline: string;
}

export const SCHOOL_IDENTITY: SchoolIdentity = {
  madrasahName: 'MIN 1 PASER',
  fullName: 'Madrasah Ibtidaiyah Negeri 1 Paser',
  address: 'Jl. KH. Ahmad Dahlan, Tanah Grogot, Kab. Paser',
  city: 'Kabupaten Paser',
  province: 'Kalimantan Timur',
  email: 'minegeripaser@gmail.com',
  kepalaMadrasah: 'Ismail, S.Ag',
  kepalaMadrasahTitle: 'Kepala Madrasah MIN 1 Paser',
  pengembang: 'Dzakirul Husni, S.Pd',
  pengembangTitle: 'Pembuat & Pengembang Aplikasi',
  tagline: 'Siswa Kreatif dengan Game Kreatif - Madrasah Mandiri Berprestasi'
};

export const INITIAL_8_TEAMS: Team[] = [
  {
    id: 1,
    name: 'Kelompok 1: Al-Khawarizmi',
    scholar: 'Al-Khawarizmi (Bapak Matematika & Algoritma)',
    quote: 'Ketelitian dan logika membawa kebenaran',
    color: 'emerald',
    bgClass: 'from-emerald-500/20 to-teal-500/10',
    borderClass: 'border-emerald-500/40 focus:border-emerald-500',
    badgeClass: 'bg-emerald-600 text-white',
    accentHex: '#059669',
    members: ['Ahmad Fauzi', 'Aisyah Putri', 'Rizky Pratama', 'Nur Halimah'],
    score: 0,
    stars: 0,
    mistakes: 0,
    isEliminated: false,
    correctCount: 0,
    incorrectCount: 0,
    avatarIcon: 'Calculator'
  },
  {
    id: 2,
    name: 'Kelompok 2: Ibnu Sina',
    scholar: 'Ibnu Sina / Avicenna (Bapak Kedokteran Modern)',
    quote: 'Ilmu menyembuhkan ketidaktahuan jiwa',
    color: 'blue',
    bgClass: 'from-blue-500/20 to-cyan-500/10',
    borderClass: 'border-blue-500/40 focus:border-blue-500',
    badgeClass: 'bg-blue-600 text-white',
    accentHex: '#2563eb',
    members: ['Muhammad Rayhan', 'Fatimah Az-Zahra', 'Bilal Hakim', 'Zahra Amelia'],
    score: 0,
    stars: 0,
    mistakes: 0,
    isEliminated: false,
    correctCount: 0,
    incorrectCount: 0,
    avatarIcon: 'Activity'
  },
  {
    id: 3,
    name: 'Kelompok 3: Al-Biruni',
    scholar: 'Al-Biruni (Pakar Astronomi & Geodesi)',
    quote: 'Meneliti alam semesta mengagungkan Sang Pencipta',
    color: 'amber',
    bgClass: 'from-amber-500/20 to-yellow-500/10',
    borderClass: 'border-amber-500/40 focus:border-amber-500',
    badgeClass: 'bg-amber-600 text-white',
    accentHex: '#d97706',
    members: ['Faris Ramadhan', 'Khansa Nabila', 'Ihsan Maulana', 'Safira Maharani'],
    score: 0,
    stars: 0,
    mistakes: 0,
    isEliminated: false,
    correctCount: 0,
    incorrectCount: 0,
    avatarIcon: 'Globe'
  },
  {
    id: 4,
    name: 'Kelompok 4: Jabir bin Hayyan',
    scholar: 'Jabir bin Hayyan (Bapak Kimia & Eksperimen)',
    quote: 'Eksperimen membuktikan teori dengan nyata',
    color: 'rose',
    bgClass: 'from-rose-500/20 to-red-500/10',
    borderClass: 'border-rose-500/40 focus:border-rose-500',
    badgeClass: 'bg-rose-600 text-white',
    accentHex: '#e11d48',
    members: ['Hafiz Al-Ghifari', 'Salwa Nurul', 'Daffa Arkan', 'Maryam Shakila'],
    score: 0,
    stars: 0,
    mistakes: 0,
    isEliminated: false,
    correctCount: 0,
    incorrectCount: 0,
    avatarIcon: 'FlaskConical'
  },
  {
    id: 5,
    name: 'Kelompok 5: Al-Kindi',
    scholar: 'Al-Kindi (Filosof Muslim & Fisikawan Cahaya)',
    quote: 'Jangan malu menerima kebenaran dari mana pun datangnya',
    color: 'purple',
    bgClass: 'from-purple-500/20 to-indigo-500/10',
    borderClass: 'border-purple-500/40 focus:border-purple-500',
    badgeClass: 'bg-purple-600 text-white',
    accentHex: '#7c3aed',
    members: ['Zidan Al-Farisi', 'Najwa Shihab', 'Akbar Syahputra', 'Syifa Rahma'],
    score: 0,
    stars: 0,
    mistakes: 0,
    isEliminated: false,
    correctCount: 0,
    incorrectCount: 0,
    avatarIcon: 'Brain'
  },
  {
    id: 6,
    name: 'Kelompok 6: Ibnu Rusyd',
    scholar: 'Ibnu Rusyd / Averroes (Pakar Logika & Fikih)',
    quote: 'Akal dan wahyu berjalan selaras membimbing manusia',
    color: 'orange',
    bgClass: 'from-orange-500/20 to-amber-500/10',
    borderClass: 'border-orange-500/40 focus:border-orange-500',
    badgeClass: 'bg-orange-600 text-white',
    accentHex: '#ea580c',
    members: ['Kenzo Al-Banjari', 'Nadia Syakirah', 'Wildan Firdaus', 'Alina Zhafira'],
    score: 0,
    stars: 0,
    mistakes: 0,
    isEliminated: false,
    correctCount: 0,
    incorrectCount: 0,
    avatarIcon: 'BookOpenCheck'
  },
  {
    id: 7,
    name: 'Kelompok 7: Al-Farabi',
    scholar: 'Al-Farabi (Guru Kedua & Maestro Musik Sains)',
    quote: 'Masyarakat yang mulia dibangun atas ilmu dan keadilan',
    color: 'cyan',
    bgClass: 'from-cyan-500/20 to-blue-500/10',
    borderClass: 'border-cyan-500/40 focus:border-cyan-500',
    badgeClass: 'bg-cyan-600 text-white',
    accentHex: '#0891b2',
    members: ['Fatih Rabbani', 'Aqila Humaira', 'Bintang Perkasa', 'Nayla Zahida'],
    score: 0,
    stars: 0,
    mistakes: 0,
    isEliminated: false,
    correctCount: 0,
    incorrectCount: 0,
    avatarIcon: 'Compass'
  },
  {
    id: 8,
    name: 'Kelompok 8: Al-Jazari',
    scholar: 'Al-Jazari (Bapak Robotika & Mekanika Mesin)',
    quote: 'Kreativitas menciptakan karya bermanfaat bagi sesama',
    color: 'pink',
    bgClass: 'from-pink-500/20 to-rose-500/10',
    borderClass: 'border-pink-500/40 focus:border-pink-500',
    badgeClass: 'bg-pink-600 text-white',
    accentHex: '#db2777',
    members: ['Adli Rahman', 'Yasmin Salsabila', 'Galih Pratama', 'Alya Mukhbita'],
    score: 0,
    stars: 0,
    mistakes: 0,
    isEliminated: false,
    correctCount: 0,
    incorrectCount: 0,
    avatarIcon: 'Cpu'
  }
];
