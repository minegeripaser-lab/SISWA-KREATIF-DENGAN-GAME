import React from 'react';
import { 
  Star, 
  XCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Bell, 
  RotateCcw, 
  Plus, 
  Minus,
  Sparkles,
  Users
} from 'lucide-react';
import { Team } from '../types';
import { soundEffects } from '../utils/soundEffects';

interface TeamCardProps {
  team: Team;
  isBuzzing: boolean;
  onBuzzerClick: (team: Team) => void;
  onAddScore: (teamId: number, points: number) => void;
  onAddMistake: (teamId: number) => void;
  onResetMistakes: (teamId: number) => void;
  onAddStar: (teamId: number) => void;
  onEditMembers?: (team: Team) => void;
  disabled?: boolean;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  isBuzzing,
  onBuzzerClick,
  onAddScore,
  onAddMistake,
  onResetMistakes,
  onAddStar,
  onEditMembers,
  disabled = false,
}) => {
  const isEliminated = team.mistakes >= 3 || team.isEliminated;

  const handleBuzzer = () => {
    if (isEliminated || disabled) return;
    soundEffects.playBuzzer();
    onBuzzerClick(team);
  };

  const handleCorrect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEliminated) return;
    soundEffects.playCorrect();
    onAddScore(team.id, 10);
  };

  const handleWrong = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEliminated) return;
    soundEffects.playWrong();
    onAddMistake(team.id);
  };

  return (
    <div
      className={`relative rounded-2xl p-4 transition-all duration-300 border flex flex-col justify-between overflow-hidden ${
        isEliminated
          ? 'bg-slate-900/60 border-red-900/60 opacity-60 grayscale-[40%]'
          : isBuzzing
          ? 'bg-slate-800/95 border-amber-400 ring-4 ring-amber-400/40 shadow-2xl scale-[1.02]'
          : 'bg-slate-800/70 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800/90 shadow-lg'
      }`}
      style={{
        boxShadow: isBuzzing ? `0 0 25px ${team.accentHex}66` : undefined,
      }}
    >
      {/* Top Accent Strip */}
      <div 
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ backgroundColor: isEliminated ? '#ef4444' : team.accentHex }}
      />

      {/* Buzzer Active Glow Ribbon */}
      {isBuzzing && (
        <div className="absolute top-1.5 inset-x-0 bg-amber-500 text-slate-950 font-black text-xs py-0.5 text-center animate-pulse flex items-center justify-center gap-1">
          <Bell className="w-3.5 h-3.5 animate-bounce" />
          <span>BEL REBUTAN DIAKTIFKAN!</span>
        </div>
      )}

      {/* Team Header */}
      <div className={`flex items-start justify-between gap-2 ${isBuzzing ? 'pt-4' : 'pt-1'}`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: team.accentHex }}
            />
            <h4 className="font-extrabold text-sm sm:text-base text-white truncate" title={team.name}>
              {team.name}
            </h4>
          </div>
          <p className="text-[11px] text-slate-400 truncate mt-0.5" title={team.scholar}>
            {team.scholar}
          </p>
        </div>

        {/* Member list button */}
        {onEditMembers && (
          <button
            onClick={() => onEditMembers(team)}
            title="Lihat Anggota Kelompok"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Score & Stars Row */}
      <div className="my-3 flex items-center justify-between bg-slate-900/80 rounded-xl p-3 border border-slate-700/50">
        <div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Skor Akhir</span>
          <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {team.score}
          </span>
        </div>

        {/* Stars */}
        <div className="text-right">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Bintang</span>
          <div className="flex items-center gap-1 mt-0.5">
            <div className="flex text-amber-400">
              {Array.from({ length: Math.min(team.stars, 5) }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
              {team.stars === 0 && (
                <span className="text-xs text-slate-500 italic">0 Bintang</span>
              )}
            </div>
            {team.stars > 5 && (
              <span className="text-xs font-bold text-amber-400">+{team.stars - 5}</span>
            )}
          </div>
        </div>
      </div>

      {/* 3 Kesalahan (3 Strikes) Elimination Status */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
            <span>Kesalahan:</span>
            <span className="text-slate-400">({team.mistakes}/3)</span>
          </span>
          {isEliminated ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-600 text-white animate-pulse">
              TERELIMINASI ❌
            </span>
          ) : (
            <span className="text-[10px] text-emerald-400 font-medium">
              {3 - team.mistakes} Kesempatan Lagi
            </span>
          )}
        </div>

        {/* 3 Strike Badges */}
        <div className="grid grid-cols-3 gap-1.5">
          {/* Strike 1 */}
          <div
            className={`h-7 rounded-lg flex items-center justify-center text-xs font-black transition-all ${
              team.mistakes >= 1
                ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400'
                : 'bg-slate-900/60 border border-slate-700/40 text-slate-600'
            }`}
          >
            {team.mistakes >= 1 ? '⚠️ 1' : '•'}
          </div>

          {/* Strike 2 */}
          <div
            className={`h-7 rounded-lg flex items-center justify-center text-xs font-black transition-all ${
              team.mistakes >= 2
                ? 'bg-orange-500/20 border border-orange-500/50 text-orange-400'
                : 'bg-slate-900/60 border border-slate-700/40 text-slate-600'
            }`}
          >
            {team.mistakes >= 2 ? '⚠️ 2' : '•'}
          </div>

          {/* Strike 3 (ELIMINASI) */}
          <div
            className={`h-7 rounded-lg flex items-center justify-center text-xs font-black transition-all ${
              team.mistakes >= 3
                ? 'bg-red-600 text-white shadow-md shadow-red-600/40 font-extrabold'
                : 'bg-slate-900/60 border border-slate-700/40 text-slate-600'
            }`}
          >
            {team.mistakes >= 3 ? '❌ OUT' : '•'}
          </div>
        </div>
      </div>

      {/* Main Action / Buzzer Button */}
      <div className="space-y-2">
        <button
          onClick={handleBuzzer}
          disabled={isEliminated || disabled}
          className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
            isEliminated
              ? 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed'
              : isBuzzing
              ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-black animate-pulse shadow-amber-400/30'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-700/30'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>{isEliminated ? 'Kelompok Tereliminasi' : 'Bel Rebutan / Menjawab'}</span>
        </button>

        {/* Teacher Quick Scoring Controls */}
        <div className="grid grid-cols-4 gap-1 pt-1 border-t border-slate-700/40">
          <button
            onClick={handleCorrect}
            disabled={isEliminated}
            title="Jawaban Benar (+10 Poin)"
            className="py-1 px-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-0.5 disabled:opacity-40"
          >
            <Plus className="w-3 h-3" />
            <span>10</span>
          </button>

          <button
            onClick={handleWrong}
            disabled={isEliminated}
            title="Jawaban Salah (+1 Kesalahan)"
            className="py-1 px-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold flex items-center justify-center gap-0.5 disabled:opacity-40"
          >
            <XCircle className="w-3 h-3" />
            <span>Salah</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playStarChime();
              onAddStar(team.id);
            }}
            disabled={isEliminated}
            title="Beri Bintang Prestasi (+1 Star)"
            className="py-1 px-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-0.5 disabled:opacity-40"
          >
            <Star className="w-3 h-3" />
            <span>+⭐</span>
          </button>

          {/* Reset / Recover Strike */}
          <button
            onClick={() => onResetMistakes(team.id)}
            title="Reset Kesalahan / Pulihkan Nyawa"
            className="py-1 px-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600/50 text-xs font-medium flex items-center justify-center gap-0.5"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
