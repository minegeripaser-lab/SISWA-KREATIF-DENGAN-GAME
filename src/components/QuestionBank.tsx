import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Play, 
  Download, 
  Upload, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  X,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { Question, QuizPackage, GradeLevel, DifficultyLevel } from '../types';
import { getQuestions, saveQuestion, deleteQuestion, getQuizPackages, saveQuizPackage } from '../lib/supabase';
import { soundEffects } from '../utils/soundEffects';

interface QuestionBankProps {
  onSelectPackageToPlay: (pkg: QuizPackage) => void;
}

export const QuestionBank: React.FC<QuestionBankProps> = ({ onSelectPackageToPlay }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [packages, setPackages] = useState<QuizPackage[]>([]);
  const [activeTab, setActiveTab] = useState<'questions' | 'packages'>('questions');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Semua');
  const [selectedGrade, setSelectedGrade] = useState('Semua');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Semua');

  // Modal State for Manual New Question
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Question>>({
    subject: 'Akidah Akhlak',
    grade: '5',
    difficulty: 'sedang',
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'A',
    explanation: '',
    points: 10,
    timeLimitSeconds: 30,
  });

  const loadData = async () => {
    const qData = await getQuestions();
    const pData = await getQuizPackages();
    setQuestions(qData);
    setPackages(pData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const subjects = [
    'Semua',
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

  // Filtered Questions
  const filteredQuestions = questions.filter(q => {
    const matchesSearch =
      q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.explanation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'Semua' || q.subject === selectedSubject;
    const matchesGrade = selectedGrade === 'Semua' || q.grade === selectedGrade;
    const matchesDifficulty = selectedDifficulty === 'Semua' || q.difficulty === selectedDifficulty;
    return matchesSearch && matchesSubject && matchesGrade && matchesDifficulty;
  });

  // Handle Save New Question
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.questionText || !formData.optionA || !formData.optionB) {
      alert('Mohon lengkapi teks soal dan opsi jawaban.');
      return;
    }

    const newQ: Question = {
      id: `manual-${Date.now()}`,
      questionText: formData.questionText,
      optionA: formData.optionA,
      optionB: formData.optionB,
      optionC: formData.optionC || '-',
      optionD: formData.optionD || '-',
      correctOption: (formData.correctOption as 'A' | 'B' | 'C' | 'D') || 'A',
      explanation: formData.explanation || 'Pembahasan materi MIN 1 Paser.',
      points: Number(formData.points) || 10,
      timeLimitSeconds: Number(formData.timeLimitSeconds) || 30,
      subject: formData.subject || 'Akidah Akhlak',
      grade: (formData.grade as GradeLevel) || '5',
      difficulty: (formData.difficulty as DifficultyLevel) || 'sedang',
      isAiGenerated: false,
    };

    await saveQuestion(newQ);
    soundEffects.playCorrect();
    setIsAddModalOpen(false);
    loadData();
  };

  // Handle Delete Question
  const handleDeleteQuestion = async (id: string) => {
    if (window.confirm('Hapus butir soal ini dari bank soal?')) {
      await deleteQuestion(id);
      loadData();
    }
  };

  // Export Questions to JSON file
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Bank_Soal_MIN1PASER_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON Questions
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          for (const q of imported) {
            await saveQuestion(q);
          }
          soundEffects.playStarChime();
          alert(`Berhasil mengimpor ${imported.length} butir soal ke Bank Soal MIN 1 Paser!`);
          loadData();
        }
      } catch (err) {
        alert('Format file JSON tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Bank Soal Madrasah
            </span>
            <span className="text-xs text-slate-400">Kurikulum Kemenag RI & Merdeka</span>
          </div>
          <h2 className="text-2xl font-black text-white">Bank Soal & Manajemen Paket Kuis</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Koleksi terstandar soal cerdas cermat MIN 1 Paser untuk mengasah kreativitas dan nalar santri.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Soal Manual</span>
          </button>

          <button
            onClick={handleExportJson}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Ekspor seluruh bank soal ke file JSON"
          >
            <Download className="w-4 h-4 text-teal-400" />
            <span className="hidden sm:inline">Ekspor JSON</span>
          </button>

          <label className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Impor JSON</span>
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>
        </div>
      </div>

      {/* Tabs Switcher: Questions vs Packages */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'questions'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Daftar Soal ({questions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('packages')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'packages'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Paket Kuis Turnamen ({packages.length})</span>
        </button>
      </div>

      {activeTab === 'questions' ? (
        <>
          {/* Filters Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kata kunci soal atau pembahasan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                {subjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Semua">Semua Kelas</option>
                <option value="1">Kelas 1</option>
                <option value="2">Kelas 2</option>
                <option value="3">Kelas 3</option>
                <option value="4">Kelas 4</option>
                <option value="5">Kelas 5</option>
                <option value="6">Kelas 6</option>
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Semua">Semua Tingkat</option>
                <option value="mudah">Mudah</option>
                <option value="sedang">Sedang</option>
                <option value="sulit_hots">HOTS / Sulit</option>
              </select>
            </div>
          </div>

          {/* Questions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-[11px] font-black border border-emerald-500/30">
                        {q.subject}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-semibold">
                        Kelas {q.grade}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        q.difficulty === 'sulit_hots'
                          ? 'bg-rose-500/20 text-rose-300'
                          : q.difficulty === 'sedang'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-teal-500/20 text-teal-300'
                      }`}>
                        {q.difficulty}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors"
                      title="Hapus Soal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-sm font-bold text-white leading-relaxed line-clamp-3">
                    {q.questionText}
                  </p>

                  {/* Options */}
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    {[
                      { k: 'A', text: q.optionA },
                      { k: 'B', text: q.optionB },
                      { k: 'C', text: q.optionC },
                      { k: 'D', text: q.optionD },
                    ].map(opt => (
                      <div
                        key={opt.k}
                        className={`p-2 rounded-xl border flex items-center gap-1.5 ${
                          opt.k === q.correctOption
                            ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200 font-bold'
                            : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded text-[10px] font-black flex items-center justify-center ${
                          opt.k === q.correctOption ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-white'
                        }`}>
                          {opt.k}
                        </span>
                        <span className="truncate">{opt.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span className="truncate max-w-[260px]">
                    <strong className="text-emerald-400">Pembahasan: </strong>{q.explanation}
                  </span>
                  <span className="text-amber-400 font-bold flex-shrink-0">+{q.points} Poin</span>
                </div>
              </div>
            ))}
          </div>

          {filteredQuestions.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
              <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white mb-1">Tidak Ada Soal yang Cocok</h4>
              <p className="text-xs text-slate-400">Coba ubah filter pencarian atau tambahkan soal baru.</p>
            </div>
          )}
        </>
      ) : (
        /* Quiz Packages List */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map(pkg => (
            <div
              key={pkg.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-extrabold text-xs border border-emerald-500/30">
                    {pkg.subject}
                  </span>
                  <span className="text-xs text-slate-400">Kelas {pkg.grade} MI</span>
                </div>

                <h3 className="text-lg font-black text-white mb-2 leading-snug">
                  {pkg.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {pkg.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400">
                  {pkg.questions.length} Butir Soal
                </span>

                <button
                  onClick={() => onSelectPackageToPlay(pkg)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all active:scale-95"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Mainkan di Arena</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah Soal Manual */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Plus className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-white">Tambah Butir Soal Baru</h3>
                <p className="text-xs text-slate-400">Kurikulum MIN 1 Paser untuk 8 Kelompok Cerdas Cermat</p>
              </div>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Mata Pelajaran</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    {subjects.filter(s => s !== 'Semua').map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Kelas</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value as GradeLevel })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    {['1', '2', '3', '4', '5', '6'].map(g => (
                      <option key={g} value={g}>Kelas {g} MI</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tingkat Kesulitan</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as DifficultyLevel })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="mudah">Mudah</option>
                    <option value="sedang">Sedang</option>
                    <option value="sulit_hots">HOTS / Sulit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Teks Pertanyaan</label>
                <textarea
                  rows={3}
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  placeholder="Tuliskan teks pertanyaan cerdas cermat..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Opsi A</label>
                  <input
                    type="text"
                    value={formData.optionA}
                    onChange={(e) => setFormData({ ...formData, optionA: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Opsi B</label>
                  <input
                    type="text"
                    value={formData.optionB}
                    onChange={(e) => setFormData({ ...formData, optionB: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Opsi C</label>
                  <input
                    type="text"
                    value={formData.optionC}
                    onChange={(e) => setFormData({ ...formData, optionC: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Opsi D</label>
                  <input
                    type="text"
                    value={formData.optionD}
                    onChange={(e) => setFormData({ ...formData, optionD: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Kunci Jawaban Benar</label>
                  <select
                    value={formData.correctOption}
                    onChange={(e) => setFormData({ ...formData, correctOption: e.target.value as 'A' | 'B' | 'C' | 'D' })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-black text-emerald-400 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="A">Opsi A</option>
                    <option value="B">Opsi B</option>
                    <option value="C">Opsi C</option>
                    <option value="D">Opsi D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Alokasi Poin</label>
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Batas Waktu (Detik)</label>
                  <input
                    type="number"
                    value={formData.timeLimitSeconds}
                    onChange={(e) => setFormData({ ...formData, timeLimitSeconds: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Pembahasan & Penjelasan</label>
                <textarea
                  rows={2}
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="Penjelasan edukatif untuk santri..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/30"
                >
                  Simpan Butir Soal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
