import React from 'react';
import { 
  Gamepad2, 
  Sparkles, 
  BookOpen, 
  Award, 
  FileText, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  School,
  Database
} from 'lucide-react';
import { SCHOOL_IDENTITY } from '../types';
import { soundEffects } from '../utils/soundEffects';

interface NavbarProps {
  activeTab: 'game' | 'ai' | 'bank' | 'archive' | 'docs';
  setActiveTab: (tab: 'game' | 'ai' | 'bank' | 'archive' | 'docs') => void;
  isSoundMuted: boolean;
  setIsSoundMuted: (muted: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isSoundMuted,
  setIsSoundMuted,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleSound = () => {
    const newState = soundEffects.toggleMute();
    setIsSoundMuted(newState);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-emerald-500/20 text-white shadow-xl">
      {/* Top Identity Ribbon */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 px-4 py-1 text-xs flex flex-wrap items-center justify-between text-emerald-100 border-b border-emerald-600/30">
        <div className="flex items-center gap-2 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span>{SCHOOL_IDENTITY.fullName} ({SCHOOL_IDENTITY.madrasahName}) • Kab. Paser, Kaltim</span>
        </div>
        <div className="flex items-center gap-4 text-emerald-200 text-[11px]">
          <span>Kepala Madrasah: <strong className="text-white">{SCHOOL_IDENTITY.kepalaMadrasah}</strong></span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">Pengembang: <strong className="text-white">{SCHOOL_IDENTITY.pengembang}</strong></span>
          <span className="hidden md:inline">|</span>
          <span className="hidden md:inline text-amber-300 font-semibold">{SCHOOL_IDENTITY.tagline}</span>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setActiveTab('game')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-emerald-400 font-black text-lg">
              <School className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent">
                SISWA KREATIF DENGAN GAME KREATIF
              </h1>
              <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                MIN 1 PASER
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Turnamen 8 Kelompok • Eliminasi 3 Kesalahan • AI Generator
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1">
          <button
            onClick={() => setActiveTab('game')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'game'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Gamepad2 className="w-4 h-4 text-emerald-400" />
            <span>Arena Game</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'ai'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI Soal Gemini</span>
          </button>

          <button
            onClick={() => setActiveTab('bank')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'bank'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <BookOpen className="w-4 h-4 text-teal-400" />
            <span>Bank Soal</span>
          </button>

          <button
            onClick={() => setActiveTab('archive')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'archive'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Arsip & Laporan</span>
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'docs'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Database className="w-4 h-4 text-purple-400" />
            <span>Setup & Supabase</span>
          </button>
        </nav>

        {/* Right Action Tools: Sound, Fullscreen, Badge */}
        <div className="flex items-center gap-2">
          {/* Mute / Unmute Button */}
          <button
            onClick={toggleSound}
            title={isSoundMuted ? 'Nyalakan Efek Suara' : 'Bisukan Efek Suara'}
            className={`p-2 rounded-lg border transition-colors ${
              isSoundMuted
                ? 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Fullscreen Button for Projector Mode */}
          <button
            onClick={toggleFullscreen}
            title="Tampilan Layar Penuh (Mode Proyektor Kelas)"
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="lg:hidden flex items-center justify-around bg-slate-950/80 border-t border-slate-800 px-2 py-2">
        <button
          onClick={() => setActiveTab('game')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-2 rounded-lg ${
            activeTab === 'game' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>Arena</span>
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-2 rounded-lg ${
            activeTab === 'ai' ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Soal</span>
        </button>
        <button
          onClick={() => setActiveTab('bank')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-2 rounded-lg ${
            activeTab === 'bank' ? 'text-teal-400 bg-teal-500/10' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Bank Soal</span>
        </button>
        <button
          onClick={() => setActiveTab('archive')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-2 rounded-lg ${
            activeTab === 'archive' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Laporan</span>
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-2 rounded-lg ${
            activeTab === 'docs' ? 'text-purple-400 bg-purple-500/10' : 'text-slate-400'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Setup</span>
        </button>
      </div>
    </header>
  );
};
