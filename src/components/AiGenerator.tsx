import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Send, 
  Save, 
  Gamepad2, 
  CheckCircle2, 
  RefreshCw, 
  AlertCircle,
  HelpCircle,
  Clock,
  Award,
  ChevronDown
} from 'lucide-react';
import { Question, QuizPackage, GradeLevel, DifficultyLevel } from '../types';
import { saveQuestion, saveQuizPackage } from '../lib/supabase';
import { soundEffects } from '../utils/soundEffects';

interface AiGeneratorProps {
  onCreatedPackage: (newPackage: QuizPackage) => void;
  onNavigateToArena: () => void;
}

export const AiGenerator: React.FC<AiGeneratorProps> = ({
  onCreatedPackage,
  onNavigateToArena,
}) => {
  const [subject, setSubject] = useState('Akidah Akhlak');
  const [grade, setGrade] = useState<GradeLevel>('5');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('sedang');
  const [count, setCount] = useState<number>(5);
  const [topic, setTopic] = useState('Asmaul Husna dan Akhlak Terpuji');
  const [context, setContext] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [newPackageTitle, setNewPackageTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const subjects = [
    'Akidah Akhlak',
    'Fikih Ibadah',
    'Al-Qur\'an Hadis',
    'Sejarah Kebudayaan Islam',
    'Bahasa Arab',
    'IPAS & Alam Nusantara',
    'Matematika Kreatif',
    'Bahasa Indonesia',
    'Pendidikan Pancasila',
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/gemini/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          grade,
          difficulty,
          count,
          topic,
          context,
        }),
      });

      const data = await response.json();
      if (data.success && Array.isArray(data.questions)) {
        setGeneratedQuestions(data.questions);
        setNewPackageTitle(`Kuis AI: ${subject} - ${topic || 'Kelas ' + grade}`);
        soundEffects.playStarChime();
        setSuccessMessage(`Berhasil menghasilkan ${data.questions.length} butir soal cerdas cermat dengan Google Gemini AI!`);
      } else {
        throw new Error(data.error || 'Gagal menghasilkan soal');
      }
    } catch (err: any) {
      console.error('Error generating questions:', err);
      setErrorMessage('Terjadi kendala saat memproses dengan Gemini AI. Menggunakan mode cadangan cerdas.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToBank = async () => {
    if (generatedQuestions.length === 0) return;
    try {
      for (const q of generatedQuestions) {
        await saveQuestion(q);
      }
      soundEffects.playCorrect();
      setSuccessMessage('Semua butir soal berhasil disimpan ke Bank Soal MIN 1 Paser!');
    } catch (e) {
      console.error(e);
      setErrorMessage('Gagal menyimpan soal ke Bank Soal.');
    }
  };

  const handleCreatePackageAndPlay = async () => {
    if (generatedQuestions.length === 0) return;
    const pkgTitle = newPackageTitle.trim() || `Kuis AI: ${subject} Kelas ${grade}`;
    const newPkg: QuizPackage = {
      id: `ai-pkg-${Date.now()}`,
      title: pkgTitle,
      description: `Paket soal yang dihasilkan otomatis oleh Google Gemini AI untuk MIN 1 Paser pada topik ${topic}.`,
      grade,
      subject,
      totalQuestions: generatedQuestions.length,
      questions: generatedQuestions,
      createdAt: new Date().toISOString(),
      isCustom: true,
    };

    await saveQuizPackage(newPkg);
    for (const q of generatedQuestions) {
      await saveQuestion(q);
    }

    onCreatedPackage(newPkg);
    soundEffects.playStarChime();
    onNavigateToArena();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900/60 via-slate-900 to-teal-900/60 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Didukung Google Gemini 3.8 Flash Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Generator Soal Cerdas Madrasah AI
            </h2>
            <p className="text-slate-300 text-sm mt-2 leading-relaxed">
              Otomasi pembuatan soal cerdas cermat 8 kelompok sesuai standar kurikulum Kementerian Agama Republik Indonesia & Kurikulum Merdeka MIN 1 Paser.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-4xl shadow-lg">
              🤖
            </div>
          </div>
        </div>
      </div>

      {/* Main Generator Form & Preview Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <span>Parameter Pembuatan Soal</span>
          </h3>

          <form onSubmit={handleGenerate} className="space-y-4">
            {/* Subject */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Mata Pelajaran
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-emerald-500"
              >
                {subjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Grade & Difficulty Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Tingkat Kelas
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as GradeLevel)}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-emerald-500"
                >
                  <option value="1">Kelas 1 MI</option>
                  <option value="2">Kelas 2 MI</option>
                  <option value="3">Kelas 3 MI</option>
                  <option value="4">Kelas 4 MI</option>
                  <option value="5">Kelas 5 MI</option>
                  <option value="6">Kelas 6 MI</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Tingkat Kesulitan
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-emerald-500"
                >
                  <option value="mudah">Mudah (Dasar/C1-C2)</option>
                  <option value="sedang">Sedang (Penerapan/C3)</option>
                  <option value="sulit_hots">Sulit (Nalar HOTS/C4-C6)</option>
                </select>
              </div>
            </div>

            {/* Question Count */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Jumlah Butir Soal yang Digenerate: <strong className="text-amber-400">{count} Soal</strong>
              </label>
              <div className="flex gap-2">
                {[3, 5, 8, 10, 15].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCount(num)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
                      count === num
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Specifics */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Topik / Materi / Bab Pembelajaran
                </label>
                <span className="text-[11px] text-emerald-400 font-semibold">IPAS Kelas 6 Siap Pakai</span>
              </div>
              <input
                type="text"
                placeholder="Contoh: Tata Surya, Rangka & Sendi Manusia, Energi Terbarukan..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 mb-2"
                required
              />

              {/* Quick Topic Presets for IPAS Kelas 6 */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '🪐 Tata Surya & Antariksa', topic: 'Sistem Tata Surya, Rotasi, Revolusi Bumi & Gerhana', grade: '6' as GradeLevel },
                  { label: '🦴 Rangka, Sendi & Otot', topic: 'Rangka, Sendi, Otot Antagonis & Sistem Saraf Manusia', grade: '6' as GradeLevel },
                  { label: '⚡ Energi & Perubahan Iklim', topic: 'Energi Terbarukan, Efek Rumah Kaca & Pelestarian Alam Paser', grade: '6' as GradeLevel },
                  { label: '🌏 Benua Dunia & ASEAN', topic: 'Karakteristik Benua Dunia, Waktu & Peran Indonesia di ASEAN', grade: '6' as GradeLevel },
                ].map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSubject('IPAS & Alam Nusantara');
                      setGrade(item.grade);
                      setTopic(item.topic);
                    }}
                    className="text-[10px] px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/25 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Extra Context */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Catatan Guru Tambahan (Opsional)
              </label>
              <textarea
                placeholder="Misal: Sertakan contoh kontekstual kehidupan santri atau kearifan lokal Kabupaten Paser..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-extrabold text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition-all active:scale-95"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Gemini AI Sedang Menulis Soal...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Soal dengan Gemini AI</span>
                </>
              )}
            </button>
          </form>

          {/* Feedback messages */}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Generated Preview Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
              <div>
                <h3 className="font-extrabold text-white text-lg">
                  Hasil Pratinjau Soal ({generatedQuestions.length} Butir)
                </h3>
                <p className="text-xs text-slate-400">
                  Periksa butir soal, kunci jawaban, dan pembahasan sebelum disimpan.
                </p>
              </div>

              {generatedQuestions.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveToBank}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Simpan ke Bank</span>
                  </button>

                  <button
                    onClick={handleCreatePackageAndPlay}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-colors"
                  >
                    <Gamepad2 className="w-3.5 h-3.5" />
                    <span>Mainkan di Arena</span>
                  </button>
                </div>
              )}
            </div>

            {/* Package Title Field if questions exist */}
            {generatedQuestions.length > 0 && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Paket Kuis
                </label>
                <input
                  type="text"
                  value={newPackageTitle}
                  onChange={(e) => setNewPackageTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {/* Questions List */}
            {generatedQuestions.length > 0 ? (
              <div className="space-y-4 max-h-[560px] overflow-y-auto pr-2">
                {generatedQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/70 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-extrabold border border-emerald-500/30">
                        Nomor {idx + 1}
                      </span>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-amber-400 font-bold">+{q.points} Poin</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-300">{q.timeLimitSeconds}s</span>
                      </div>
                    </div>

                    <p className="text-sm font-bold text-white leading-relaxed">
                      {q.questionText}
                    </p>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {[
                        { k: 'A', text: q.optionA },
                        { k: 'B', text: q.optionB },
                        { k: 'C', text: q.optionC },
                        { k: 'D', text: q.optionD },
                      ].map(opt => (
                        <div
                          key={opt.k}
                          className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                            opt.k === q.correctOption
                              ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200 font-bold'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center font-black text-[11px] ${
                            opt.k === q.correctOption ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-white'
                          }`}>
                            {opt.k}
                          </span>
                          <span className="truncate">{opt.text}</span>
                        </div>
                      ))}
                    </div>

                    {/* Explanation */}
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
                      <strong className="text-emerald-400">Pembahasan: </strong>
                      <span>{q.explanation}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h4 className="text-base font-bold text-white mb-1">Belum Ada Soal yang Digenerate</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Silakan isi parameter di sebelah kiri lalu klik "Generate Soal dengan Gemini AI" untuk mendapatkan pertanyaan cerdas cermat.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
