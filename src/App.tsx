import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { GameArena } from './components/GameArena';
import { AiGenerator } from './components/AiGenerator';
import { QuestionBank } from './components/QuestionBank';
import { ArchivesReport } from './components/ArchivesReport';
import { SetupDocs } from './components/SetupDocs';
import { QuizPackage, SCHOOL_IDENTITY } from './types';
import { getQuizPackages, initializeStorage } from './lib/supabase';
import { soundEffects } from './utils/soundEffects';
import { Heart, School, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'game' | 'ai' | 'bank' | 'archive' | 'docs'>('game');
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [quizPackages, setQuizPackages] = useState<QuizPackage[]>([]);

  useEffect(() => {
    initializeStorage();
    loadPackages();
  }, []);

  const loadPackages = async () => {
    const pkgs = await getQuizPackages();
    setQuizPackages(pkgs);
  };

  const handleCreatedPackage = (newPackage: QuizPackage) => {
    setQuizPackages(prev => [newPackage, ...prev]);
  };

  const handleSelectPackageToPlay = (pkg: QuizPackage) => {
    setQuizPackages(prev => {
      const exists = prev.some(p => p.id === pkg.id);
      return exists ? prev : [pkg, ...prev];
    });
    setActiveTab('game');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSoundMuted={isSoundMuted}
        setIsSoundMuted={setIsSoundMuted}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'game' && (
          <GameArena
            quizPackages={quizPackages}
            onOpenAiGenerator={() => setActiveTab('ai')}
            onOpenArchives={() => setActiveTab('archive')}
          />
        )}

        {activeTab === 'ai' && (
          <AiGenerator
            onCreatedPackage={handleCreatedPackage}
            onNavigateToArena={() => setActiveTab('game')}
          />
        )}

        {activeTab === 'bank' && (
          <QuestionBank
            onSelectPackageToPlay={handleSelectPackageToPlay}
          />
        )}

        {activeTab === 'archive' && (
          <ArchivesReport />
        )}

        {activeTab === 'docs' && (
          <SetupDocs />
        )}
      </main>

      {/* Official Footer with Identity for MIN 1 PASER */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 px-4 text-xs text-slate-400 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
              <School className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-white text-sm">
                SISWA KREATIF DENGAN GAME KREATIF
              </p>
              <p className="text-[11px] text-emerald-400 font-semibold">
                {SCHOOL_IDENTITY.fullName} ({SCHOOL_IDENTITY.madrasahName})
              </p>
            </div>
          </div>

          <div className="text-center md:text-right space-y-1">
            <p>
              Kepala Madrasah: <strong className="text-white">{SCHOOL_IDENTITY.kepalaMadrasah}</strong>
            </p>
            <p>
              Pembuat & Pengembang: <strong className="text-amber-400">{SCHOOL_IDENTITY.pengembang}</strong>
            </p>
            <p className="text-[11px] text-slate-500">
              Email: <span className="text-slate-400">{SCHOOL_IDENTITY.email}</span> • {SCHOOL_IDENTITY.address}, Tanah Grogot, Paser, Kaltim
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-800/80 mt-6 pt-4 text-center text-[11px] text-slate-500 flex flex-wrap items-center justify-center gap-2">
          <span>&copy; {new Date().getFullYear()} {SCHOOL_IDENTITY.madrasahName}. Seluruh Hak Cipta Dilindungi.</span>
          <span>•</span>
          <span className="text-emerald-400 font-medium">Madrasah Mandiri Berprestasi</span>
        </div>
      </footer>
    </div>
  );
}
