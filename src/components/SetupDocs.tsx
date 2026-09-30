import React, { useState } from 'react';
import { 
  Database, 
  Terminal, 
  Globe, 
  Github, 
  Key, 
  Copy, 
  Check, 
  ShieldCheck, 
  Cpu, 
  ExternalLink,
  Server,
  Layers,
  Sparkles
} from 'lucide-react';
import { SCHOOL_IDENTITY } from '../types';
import { checkStorageStatus } from '../lib/supabase';

export const SetupDocs: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const storageStatus = checkStorageStatus();

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const sqlSchema = `-- ====================================================================
-- SISTEM "SISWA KREATIF DENGAN GAME KREATIF" - MIN 1 PASER
-- Skema Database PostgreSQL untuk Supabase
-- Madrasah: MIN 1 PASER
-- Kepala Madrasah: Ismail, S.Ag
-- Pengembang: Dzakirul Husni, S.Pd
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABEL BANK SOAL
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject_name VARCHAR(100) NOT NULL,
  grade VARCHAR(10) NOT NULL DEFAULT '4',
  difficulty VARCHAR(20) NOT NULL DEFAULT 'sedang',
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABEL PAKET KUIS
CREATE TABLE IF NOT EXISTS public.quiz_packages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  grade VARCHAR(10) NOT NULL DEFAULT '4',
  subject_name VARCHAR(100) NOT NULL,
  total_questions INT DEFAULT 0,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABEL ARSIP SESI PERMAINAN & REKAP 8 KELOMPOK
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_title VARCHAR(200) NOT NULL,
  class_name VARCHAR(50) NOT NULL,
  package_title VARCHAR(200),
  subject_name VARCHAR(100),
  max_mistakes_allowed INT DEFAULT 3,
  teams_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  winner_team_name VARCHAR(100),
  winner_score INT DEFAULT 0,
  madrasah_name VARCHAR(100) DEFAULT 'MIN 1 PASER',
  kepala_madrasah VARCHAR(100) DEFAULT 'Ismail, S.Ag',
  guru_pengembang VARCHAR(100) DEFAULT 'Dzakirul Husni, S.Pd',
  notes TEXT,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read pkg" ON public.quiz_packages FOR SELECT USING (true);
CREATE POLICY "Allow public read sessions" ON public.game_sessions FOR SELECT USING (true);
CREATE POLICY "Allow public insert sessions" ON public.game_sessions FOR INSERT WITH CHECK (true);`;

  const nextAppRouterApi = `// Next.js App Router API: app/api/gemini/generate-questions/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' }
      }
    })
  : null;

export async function POST(req: Request) {
  try {
    const { subject, grade, difficulty, count, topic } = await req.json();
    if (!ai) {
      return NextResponse.json({ error: 'GEMINI_API_KEY belum disetel' }, { status: 500 });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: \`Buat \${count} butir soal pilihan ganda Madrasah Ibtidaiyah MIN 1 Paser: \${subject}, Kelas \${grade}, Topik \${topic}\`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              questionText: { type: Type.STRING },
              optionA: { type: Type.STRING },
              optionB: { type: Type.STRING },
              optionC: { type: Type.STRING },
              optionD: { type: Type.STRING },
              correctOption: { type: Type.STRING },
              explanation: { type: Type.STRING },
              points: { type: Type.INTEGER },
              timeLimitSeconds: { type: Type.INTEGER }
            },
            required: ['questionText', 'optionA', 'optionB', 'optionC', 'optionD', 'correctOption', 'explanation', 'points', 'timeLimitSeconds']
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      questions: JSON.parse(response.text || '[]')
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}`;

  const gitCommands = `# 1. Inisialisasi Repository Git
git init
git add .
git commit -m "feat: Siswa Kreatif dengan Game Kreatif MIN 1 Paser"

# 2. Push ke GitHub
git branch -M main
git remote add origin https://github.com/USERNAME/siswa-kreatif-game-kreatif-min1paser.git
git push -u origin main

# 3. Deploy ke Vercel
vercel --prod`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900/60 via-slate-900 to-indigo-900/60 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-3 border border-purple-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Arsitektur Produksi & Integrasi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Dokumentasi Instalasi, GitHub & Deployment
            </h2>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Panduan integrasi Next.js App Router, Supabase PostgreSQL, Google Gemini AI 3.8 Flash, serta cara deployment ke Vercel untuk MIN 1 Paser.
            </p>
          </div>

          {/* Status Badge */}
          <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-2xl">
            <span className="text-xs text-slate-400 block mb-1">Status Mode Penyimpanan:</span>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${storageStatus.isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-sm font-bold text-white">
                {storageStatus.isSupabaseConfigured ? 'Supabase Live Connected' : 'Embedded Persistent Storage (Aktif)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {storageStatus.isSupabaseConfigured
                ? `Terhubung ke: ${storageStatus.supabaseUrl}`
                : 'Penyimpanan lokal persisten aktif dengan data bawaan MIN 1 Paser.'}
            </p>
          </div>
        </div>
      </div>

      {/* Identity Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h3 className="font-extrabold text-white text-base mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-emerald-400" />
          <span>Identitas Resmi Madrasah & Pengembang</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400 block mb-0.5">Nama Madrasah</span>
            <strong className="text-white text-sm block">{SCHOOL_IDENTITY.madrasahName}</strong>
            <span className="text-slate-400 text-[11px]">{SCHOOL_IDENTITY.fullName}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400 block mb-0.5">Kepala Madrasah</span>
            <strong className="text-emerald-400 text-sm block">{SCHOOL_IDENTITY.kepalaMadrasah}</strong>
            <span className="text-slate-400 text-[11px]">{SCHOOL_IDENTITY.kepalaMadrasahTitle}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400 block mb-0.5">Pembuat & Pengembang</span>
            <strong className="text-amber-400 text-sm block">{SCHOOL_IDENTITY.pengembang}</strong>
            <span className="text-slate-400 text-[11px]">{SCHOOL_IDENTITY.pengembangTitle}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400 block mb-0.5">Kontak Resmi</span>
            <strong className="text-blue-400 text-sm block">{SCHOOL_IDENTITY.email}</strong>
            <span className="text-slate-400 text-[11px]">Tanah Grogot, Paser, Kaltim</span>
          </div>
        </div>
      </div>

      {/* SQL Migration Script */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Database className="w-5 h-5 text-teal-400" />
              <span>Skrip Migrasi Supabase PostgreSQL (`01_init_schema.sql`)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Salin dan jalankan skrip ini di SQL Editor pada Dashboard Supabase Anda.
            </p>
          </div>

          <button
            onClick={() => handleCopy(sqlSchema, 'sql')}
            className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-teal-600/30"
          >
            {copiedKey === 'sql' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedKey === 'sql' ? 'Tersalin ke Clipboard!' : 'Salin Skrip SQL'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-emerald-300 font-mono text-xs overflow-x-auto max-h-72 leading-relaxed">
          {sqlSchema}
        </pre>
      </div>

      {/* Next.js App Router Structure */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-400" />
              <span>Next.js App Router API Route Implementation</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Implementasi route backend Gemini AI di `app/api/gemini/generate-questions/route.ts`
            </p>
          </div>

          <button
            onClick={() => handleCopy(nextAppRouterApi, 'next')}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-blue-600/30"
          >
            {copiedKey === 'next' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedKey === 'next' ? 'Tersalin!' : 'Salin Kode Next.js'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-blue-300 font-mono text-xs overflow-x-auto max-h-64 leading-relaxed">
          {nextAppRouterApi}
        </pre>
      </div>

      {/* Git & Vercel Deployment Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GitHub setup */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Github className="w-4 h-4 text-slate-300" />
              <span>Langkah Push ke GitHub</span>
            </h4>
            <button
              onClick={() => handleCopy(gitCommands, 'git')}
              className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
            >
              {copiedKey === 'git' ? 'Tersalin' : 'Salin Perintah'}
            </button>
          </div>

          <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 font-mono text-xs overflow-x-auto leading-relaxed">
            {gitCommands}
          </pre>
        </div>

        {/* Environment Variables */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" />
            <span>Variabel Lingkungan (.env.local)</span>
          </h4>

          <div className="space-y-2 text-xs font-mono text-slate-300">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500"># API Key Google Gemini (Server-side)</span>
              <p className="text-emerald-400">GEMINI_API_KEY="AIzaSy..."</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500"># Supabase PostgreSQL Configuration</span>
              <p className="text-blue-400">VITE_SUPABASE_URL="https://xxx.supabase.co"</p>
              <p className="text-blue-400">VITE_SUPABASE_ANON_KEY="eyJhbGciOi..."</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
