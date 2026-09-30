-- ====================================================================
-- SISTEM "SISWA KREATIF DENGAN GAME KREATIF" - MIN 1 PASER
-- Skema Database PostgreSQL untuk Supabase
-- Madrasah: MIN 1 PASER
-- Kepala Madrasah: Ismail, S.Ag
-- Pengembang: Dzakirul Husni, S.Pd
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE difficulty_level AS ENUM ('mudah', 'sedang', 'sulit_hots');
CREATE TYPE school_grade AS ENUM ('1', '2', '3', '4', '5', '6');
CREATE TYPE game_status AS ENUM ('draft', 'ongoing', 'paused', 'completed');

-- 3. PROFILES / GURU & OPERATOR
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  role VARCHAR(50) DEFAULT 'guru' CHECK (role IN ('superadmin', 'kepala_madrasah', 'guru', 'juri')),
  nip VARCHAR(50),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. KATEGORI MATA PELAJARAN (MAPEL)
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(20) NOT NULL UNIQUE,
  icon VARCHAR(50) DEFAULT 'BookOpen',
  color VARCHAR(50) DEFAULT 'emerald',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. BANK SOAL (QUESTIONS)
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject_code VARCHAR(50) NOT NULL,
  subject_name VARCHAR(100) NOT NULL,
  grade school_grade NOT NULL DEFAULT '4',
  difficulty difficulty_level NOT NULL DEFAULT 'sedang',
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option VARCHAR(1) NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  explanation TEXT,
  points INT DEFAULT 10,
  time_limit_seconds INT DEFAULT 30,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. PAKET KUIS (QUIZ PACKAGES)
CREATE TABLE IF NOT EXISTS public.quiz_packages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  grade school_grade NOT NULL DEFAULT '4',
  subject_name VARCHAR(100) NOT NULL,
  total_questions INT DEFAULT 0,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. SESI PERMAINAN & ARSIP TURNAMEN (GAME SESSIONS)
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_title VARCHAR(200) NOT NULL,
  class_name VARCHAR(50) NOT NULL,
  quiz_package_id UUID REFERENCES public.quiz_packages(id) ON DELETE SET NULL,
  package_title VARCHAR(200),
  status game_status DEFAULT 'completed',
  current_question_index INT DEFAULT 0,
  max_mistakes_allowed INT DEFAULT 3,
  
  -- Rekap 8 Kelompok Peserta (Data lengkap JSONB: skor, bintang, jumlah salah, status eliminasi)
  teams_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Pemenang Turnamen
  winner_team_id INT,
  winner_team_name VARCHAR(100),
  winner_score INT DEFAULT 0,
  
  -- Informasi Penyelenggara Resmi
  madrasah_name VARCHAR(100) DEFAULT 'MIN 1 PASER',
  kepala_madrasah VARCHAR(100) DEFAULT 'Ismail, S.Ag',
  guru_pengembang VARCHAR(100) DEFAULT 'Dzakirul Husni, S.Pd',
  
  notes TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- Read Access untuk semua authenticated & public (untuk permainan di kelas proyektor)
CREATE POLICY "Public Read Access for Subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Public Read Access for Questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Public Read Access for Quiz Packages" ON public.quiz_packages FOR SELECT USING (true);
CREATE POLICY "Public Read Access for Game Sessions" ON public.game_sessions FOR SELECT USING (true);

-- Insert & Update Access
CREATE POLICY "Allow All Insert for Game Sessions" ON public.game_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow All Update for Game Sessions" ON public.game_sessions FOR UPDATE USING (true);
CREATE POLICY "Allow All Insert for Questions" ON public.questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow All Insert for Packages" ON public.quiz_packages FOR INSERT WITH CHECK (true);

-- 9. DATA AWAL (SEED MATA PELAJARAN MIN 1 PASER)
INSERT INTO public.subjects (name, code, icon, color, description) VALUES
('Akidah Akhlak', 'AA', 'Heart', 'emerald', 'Materi Aqidah Islam, Rukun Iman, dan Akhlakul Karimah'),
('Fikih Ibadah', 'FIQ', 'BookOpen', 'teal', 'Materi Thaharah, Shalat Berjamaah, Puasa, Zakat, dan Ibadah Harian'),
('Al-Qur''an Hadis', 'QH', 'BookMarked', 'green', 'Hukum Tajwid, Surah-surah Pendek, dan Hadis Pilihan'),
('Sejarah Kebudayaan Islam', 'SKI', 'History', 'amber', 'Kisah Nabi Muhammad SAW, Sahabat Khulafaur Rasyidin, dan Cendekiawan'),
('Bahasa Arab', 'BA', 'Languages', 'cyan', 'Kosakata (Mufradat), Percakapan Harian, dan Tata Bahasa Arab'),
('IPAS & Alam Nusantara', 'IPAS', 'Compass', 'blue', 'Ilmu Pengetahuan Alam & Sosial, Sains Kreatif, dan Ekosistem Paser'),
('Matematika Kreatif', 'MTK', 'Calculator', 'indigo', 'Aritmatika Cepat, Geometri, Pecahan, dan Teka-Teki Logika'),
('Bahasa Indonesia', 'BIN', 'FileText', 'purple', 'Kosa Kata, Menulis Kreatif, Pantun Paser, dan Pemahaman Teks'),
('Pendidikan Pancasila', 'PPKN', 'Shield', 'red', 'Nilai Pancasila, Norma Kebangsaan, dan Cinta Tanah Air')
ON CONFLICT (name) DO NOTHING;
