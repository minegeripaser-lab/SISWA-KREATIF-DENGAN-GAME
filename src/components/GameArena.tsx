import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  RotateCw, 
  Sparkles, 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  Pause, 
  Eye, 
  EyeOff, 
  Save, 
  Layers, 
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Award
} from 'lucide-react';
import { Team, Question, QuizPackage, GameSessionArchive, SCHOOL_IDENTITY, INITIAL_8_TEAMS } from '../types';
import { TeamCard } from './TeamCard';
import { SpinWheel } from './SpinWheel';
import { TeamMembersModal } from './TeamMembersModal';
import { soundEffects } from '../utils/soundEffects';
import { saveGameSession } from '../lib/supabase';

interface GameArenaProps {
  quizPackages: QuizPackage[];
  onOpenAiGenerator: () => void;
  onOpenArchives: () => void;
}

export const GameArena: React.FC<GameArenaProps> = ({
  quizPackages,
  onOpenAiGenerator,
  onOpenArchives,
}) => {
  // State for Teams (8 Groups)
  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem('min1paser_active_teams');
    return saved ? JSON.parse(saved) : INITIAL_8_TEAMS;
  });

  // Selected Quiz Package
  const [selectedPackageId, setSelectedPackageId] = useState<string>(() => {
    return quizPackages[0]?.id || '';
  });

  const activePackage = quizPackages.find(p => p.id === selectedPackageId) || quizPackages[0];
  const questions: Question[] = activePackage?.questions || [];

  // Question Navigation & Controls
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [activeBuzzerTeam, setActiveBuzzerTeam] = useState<Team | null>(null);

  // Timer State
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [initialTimeLimit, setInitialTimeLimit] = useState(30);

  // Modals
  const [isWheelOpen, setIsWheelOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [classNameInput, setClassNameInput] = useState('Kelas 5 Abu Bakar Ash-Shiddiq');
  const [sessionNotes, setSessionNotes] = useState('');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Sync teams to localStorage
  useEffect(() => {
    localStorage.setItem('min1paser_active_teams', JSON.stringify(teams));
  }, [teams]);

  // Current Question
  const currentQuestion: Question | undefined = questions[currentQuestionIdx];

  // Set time limit when question changes
  useEffect(() => {
    if (currentQuestion) {
      const limit = currentQuestion.timeLimitSeconds || 30;
      setInitialTimeLimit(limit);
      setTimerSeconds(limit);
      setIsTimerRunning(false);
      setShowAnswer(false);
      setActiveBuzzerTeam(null);
    }
  }, [currentQuestionIdx, selectedPackageId]);

  // Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 4 && prev > 1) {
            soundEffects.playTick();
          }
          if (prev <= 1) {
            soundEffects.playWrong();
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  // Handle Score Change
  const handleAddScore = (teamId: number, points: number) => {
    setTeams(prev =>
      prev.map(t => {
        if (t.id === teamId) {
          const newScore = Math.max(0, t.score + points);
          const newCorrect = t.correctCount + 1;
          // Award a star for every 30 points
          const newStars = Math.floor(newScore / 30);
          return {
            ...t,
            score: newScore,
            correctCount: newCorrect,
            stars: Math.max(t.stars, newStars),
          };
        }
        return t;
      })
    );
  };

  // Handle Mistakes (3 Strikes Rule -> Elimination!)
  const handleAddMistake = (teamId: number) => {
    setTeams(prev =>
      prev.map(t => {
        if (t.id === teamId) {
          const newMistakes = t.mistakes + 1;
          const isEliminated = newMistakes >= 3;
          if (isEliminated) {
            // Trigger dramatic elimination alarm!
            soundEffects.playEliminated();
          }
          return {
            ...t,
            mistakes: newMistakes,
            isEliminated: isEliminated,
            incorrectCount: t.incorrectCount + 1,
            score: Math.max(0, t.score - 5), // deduction of 5 on wrong
          };
        }
        return t;
      })
    );
  };

  // Reset Mistakes (Recover team)
  const handleResetMistakes = (teamId: number) => {
    setTeams(prev =>
      prev.map(t => {
        if (t.id === teamId) {
          return {
            ...t,
            mistakes: 0,
            isEliminated: false,
          };
        }
        return t;
      })
    );
  };

  // Add Star
  const handleAddStar = (teamId: number) => {
    setTeams(prev =>
      prev.map(t => (t.id === teamId ? { ...t, stars: t.stars + 1, score: t.score + 5 } : t))
    );
  };

  // Handle Buzzer Hit
  const handleBuzzerClick = (team: Team) => {
    setActiveBuzzerTeam(team);
    setIsTimerRunning(false); // pause timer for answering
  };

  // Reset Game / New Session
  const handleResetGame = () => {
    if (window.confirm('Mulai sesi permainan baru? Semua skor dan kesalahan kelompok akan direset ke 0.')) {
      setTeams(INITIAL_8_TEAMS);
      setCurrentQuestionIdx(0);
      setShowAnswer(false);
      setActiveBuzzerTeam(null);
      setTimerSeconds(30);
      setIsTimerRunning(false);
    }
  };

  // Save Session Archive
  const handleSaveSession = async () => {
    // Sort teams to find winner
    const sorted = [...teams].sort((a, b) => b.score - a.score);
    const winner = sorted[0];

    const newArchive: GameSessionArchive = {
      id: `session-${Date.now()}`,
      sessionTitle: `Turnamen Cerdas Cermat ${classNameInput}`,
      className: classNameInput,
      packageTitle: activePackage?.title || 'Paket Turnamen MIN 1 Paser',
      subjectName: activePackage?.subject || 'Tematik Terpadu',
      playedAt: new Date().toISOString(),
      teams: teams,
      winnerTeamId: winner ? winner.id : null,
      winnerTeamName: winner ? winner.name : null,
      winnerScore: winner ? winner.score : 0,
      totalRounds: currentQuestionIdx + 1,
      eliminatedCount: teams.filter(t => t.isEliminated).length,
      notes: sessionNotes || 'Sesi turnamen cerdas cermat 8 kelompok di MIN 1 Paser berlangsung sportif.',
      madrasah: SCHOOL_IDENTITY.madrasahName,
      kepalaMadrasah: SCHOOL_IDENTITY.kepalaMadrasah,
      pengembang: SCHOOL_IDENTITY.pengembang,
    };

    await saveGameSession(newArchive);

    // Trigger victory fanfare and confetti
    soundEffects.playVictoryFanfare();
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });

    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 4000);
  };

  // Sorted teams for leaderboard
  const sortedLeaderboard = [...teams].sort((a, b) => {
    if (a.isEliminated && !b.isEliminated) return 1;
    if (!a.isEliminated && b.isEliminated) return -1;
    if (b.score !== a.score) return b.score - a.score;
    return b.stars - a.stars;
  });

  const activeTeamsCount = teams.filter(t => !t.isEliminated).length;
  const eliminatedTeamsCount = teams.filter(t => t.isEliminated).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        {/* Left: Session & Class Info */}
        <div className="flex-1 min-w-[280px]">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {SCHOOL_IDENTITY.madrasahName}
            </span>
            <span className="text-xs text-slate-400">• Arena Interaktif 8 Kelompok</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={classNameInput}
              onChange={(e) => setClassNameInput(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-bold text-sm sm:text-base focus:outline-none focus:border-emerald-500 min-w-[220px]"
              title="Klik untuk mengubah nama kelas / sesi turnamen"
            />
            {/* Status Badges */}
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/20">
                🟢 {activeTeamsCount} Kelompok Aktif
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-300 font-semibold border border-red-500/20">
                ❌ {eliminatedTeamsCount} Tereliminasi
              </span>
            </div>
          </div>
        </div>

        {/* Center: Package Selector */}
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400 hidden sm:block" />
          <select
            value={selectedPackageId}
            onChange={(e) => {
              setSelectedPackageId(e.target.value);
              setCurrentQuestionIdx(0);
            }}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white font-medium focus:outline-none focus:border-emerald-500 max-w-[360px] truncate"
            title="Pilih Paket Kuis Turnamen"
          >
            {quizPackages.map(pkg => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.grade ? `[Kls ${pkg.grade}] ` : ''}{pkg.title} ({pkg.questions.length} Soal)
              </option>
            ))}
          </select>
        </div>

        {/* Right Tools: Spin Wheel, Reset, Save */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsWheelOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all active:scale-95"
          >
            <RotateCw className="w-4 h-4" />
            <span>Roda Undian</span>
          </button>

          <button
            onClick={handleSaveSession}
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Simpan Nilai</span>
          </button>

          <button
            onClick={handleResetGame}
            title="Reset Skor Semua Kelompok"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Save Success Notice */}
      {isSavedNotice && (
        <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-2xl p-3 text-center text-emerald-300 font-bold text-sm flex items-center justify-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Hasil Turnamen berhasil disimpan ke Arsip Resmi MIN 1 Paser! Siap dicetak di tab Laporan.</span>
        </div>
      )}

      {/* Buzzer Alert Banner (When a group buzzes in) */}
      {activeBuzzerTeam && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 rounded-2xl p-4 shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-slate-950 text-amber-400 font-black flex items-center justify-center text-lg shadow-inner">
              🔔
            </span>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 block">
                BEL REBUTAN DIAKTIFKAN OLEH:
              </span>
              <h3 className="text-xl sm:text-2xl font-black">{activeBuzzerTeam.name}</h3>
              <p className="text-xs text-slate-800 font-semibold">{activeBuzzerTeam.scholar}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEffects.playCorrect();
                handleAddScore(activeBuzzerTeam.id, currentQuestion?.points || 10);
                setActiveBuzzerTeam(null);
              }}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all"
            >
              Jawaban Benar (+{currentQuestion?.points || 10})
            </button>
            <button
              onClick={() => {
                soundEffects.playWrong();
                handleAddMistake(activeBuzzerTeam.id);
                setActiveBuzzerTeam(null);
              }}
              className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all"
            >
              Jawaban Salah (+1 ❌)
            </button>
            <button
              onClick={() => setActiveBuzzerTeam(null)}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl"
            >
              Tutup Bel
            </button>
          </div>
        </div>
      )}

      {/* Main Question Arena Card (Projector View) */}
      {currentQuestion ? (
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
          {/* Top Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-extrabold text-xs sm:text-sm border border-emerald-500/40">
                Soal {currentQuestionIdx + 1} dari {questions.length}
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs border border-slate-700">
                {currentQuestion.subject}
              </span>
              <span className="hidden sm:inline-flex px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-300 font-medium text-xs">
                Kelas {currentQuestion.grade}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-300 font-bold text-xs">
                +{currentQuestion.points} Poin
              </span>
            </div>

            {/* Timer & Play/Pause Controls */}
            <div className="flex items-center gap-2">
              <div 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-black text-sm sm:text-base border transition-colors ${
                  timerSeconds <= 5
                    ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                    : timerSeconds <= 10
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-emerald-400'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{timerSeconds}s</span>
              </div>

              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`p-2 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors ${
                  isTimerRunning
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
                title={isTimerRunning ? 'Jeda Timer' : 'Mulai Timer'}
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  setTimerSeconds(initialTimeLimit);
                  setIsTimerRunning(false);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                title="Reset Waktu Soal"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Question Text */}
          <div className="my-6">
            <h2 className="text-lg sm:text-2xl font-black text-white leading-relaxed tracking-tight">
              {currentQuestion.questionText}
            </h2>
          </div>

          {/* 4 Answer Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {[
              { key: 'A', text: currentQuestion.optionA },
              { key: 'B', text: currentQuestion.optionB },
              { key: 'C', text: currentQuestion.optionC },
              { key: 'D', text: currentQuestion.optionD },
            ].map(opt => {
              const isCorrect = opt.key === currentQuestion.correctOption;
              const isRevealed = showAnswer;

              return (
                <div
                  key={opt.key}
                  className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                    isRevealed && isCorrect
                      ? 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-400 text-white'
                      : isRevealed && !isCorrect
                      ? 'bg-slate-900/50 border-slate-800 text-slate-500 opacity-60'
                      : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600 text-slate-200'
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                      isRevealed && isCorrect
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/30'
                        : 'bg-slate-700/80 text-white'
                    }`}
                  >
                    {opt.key}
                  </span>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-sm sm:text-base font-semibold leading-snug">{opt.text}</p>
                  </div>
                  {isRevealed && isCorrect && (
                    <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/30 flex-shrink-0">
                      KUNCI BENAR ✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Explanation & Reveal Section */}
          <div className="border-t border-slate-800/80 pt-4 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => {
                if (!showAnswer) {
                  soundEffects.playStarChime();
                }
                setShowAnswer(!showAnswer);
              }}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
                showAnswer
                  ? 'bg-slate-800 text-slate-300 border border-slate-700'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
              }`}
            >
              {showAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showAnswer ? 'Sembunyikan Kunci' : 'Buka Kunci & Pembahasan'}</span>
            </button>

            {/* Navigation buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIdx === 0}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-1 border border-slate-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              <button
                onClick={() => setCurrentQuestionIdx(prev => Math.min(questions.length - 1, prev + 1))}
                disabled={currentQuestionIdx >= questions.length - 1}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-600/30 transition-colors"
              >
                <span>Soal Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Revealed Explanation Box */}
          {showAnswer && (
            <div className="mt-4 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 animate-in fade-in">
              <div className="flex items-center gap-2 mb-1 text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Pembahasan Edukatif MIN 1 Paser:</span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed">{currentQuestion.explanation}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center">
          <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Paket Soal Belum Memiliki Soal</h3>
          <p className="text-xs text-slate-400 mb-4">Gunakan AI Generator untuk membuat soal kurikulum madrasah secara instan.</p>
          <button
            onClick={onOpenAiGenerator}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Buat Soal dengan AI Gemini</span>
          </button>
        </div>
      )}

      {/* 8 TEAMS ARENA GRID (The core requirement: 8 kelompok, skor, bintang, eliminasi 3 kesalahan) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>Arena 8 Kelompok Peserta</span>
            </h3>
            <p className="text-xs text-slate-400">
              Aturan Utama: 3 Kesalahan = Kelompok Tereliminasi otomatis ❌
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Klik kartu untuk mengelola atau klik ikon 👥 untuk edit anggota.</span>
          </div>
        </div>

        {/* The 8 Team Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {teams.map(team => (
            <TeamCard
              key={team.id}
              team={team}
              isBuzzing={activeBuzzerTeam?.id === team.id}
              onBuzzerClick={handleBuzzerClick}
              onAddScore={handleAddScore}
              onAddMistake={handleAddMistake}
              onResetMistakes={handleResetMistakes}
              onAddStar={handleAddStar}
              onEditMembers={(t) => setEditingTeam(t)}
            />
          ))}
        </div>
      </div>

      {/* Live Ranking & Leaderboard Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h4 className="font-extrabold text-sm text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Papan Peringkat Sementara (Live Standings)</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {sortedLeaderboard.map((team, rankIdx) => (
            <div
              key={team.id}
              className={`p-2.5 rounded-xl border text-center relative ${
                team.isEliminated
                  ? 'bg-red-950/20 border-red-900/40 opacity-50'
                  : rankIdx === 0
                  ? 'bg-amber-500/15 border-amber-500/50 shadow-md shadow-amber-500/10'
                  : 'bg-slate-800/60 border-slate-700/60'
              }`}
            >
              {/* Rank Badge */}
              <div className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black mb-1 bg-slate-700 text-white">
                {rankIdx === 0 ? '👑' : `#${rankIdx + 1}`}
              </div>

              <div className="text-xs font-bold text-white truncate" title={team.name}>
                {team.name.replace('Kelompok ', 'K-')}
              </div>

              <div className="text-sm font-black text-amber-400 mt-0.5">
                {team.score} <span className="text-[10px] text-slate-400 font-normal">pts</span>
              </div>

              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-0.5 mt-0.5">
                <span>⭐ {team.stars}</span>
                <span>•</span>
                <span className={team.mistakes >= 3 ? 'text-red-400 font-bold' : ''}>
                  {team.mistakes}/3 ❌
                </span>
              </div>

              {team.isEliminated && (
                <span className="block text-[9px] font-black text-red-400 uppercase tracking-tighter mt-1">
                  TERELIMINASI
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Spin Wheel Modal */}
      {isWheelOpen && (
        <SpinWheel
          teams={teams}
          onSelectTeam={(winner) => {
            setActiveBuzzerTeam(winner);
          }}
          onClose={() => setIsWheelOpen(false)}
        />
      )}

      {/* Edit Team Members Modal */}
      {editingTeam && (
        <TeamMembersModal
          team={editingTeam}
          onUpdateTeam={(updated) => {
            setTeams(prev => prev.map(t => (t.id === updated.id ? updated : t)));
          }}
          onClose={() => setEditingTeam(null)}
        />
      )}
    </div>
  );
};
