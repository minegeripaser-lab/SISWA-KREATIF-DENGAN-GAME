import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Trash2, 
  Trophy, 
  Calendar, 
  School, 
  Download, 
  Star, 
  CheckCircle2, 
  XCircle,
  Eye,
  Award,
  Users
} from 'lucide-react';
import { GameSessionArchive, SCHOOL_IDENTITY, Team } from '../types';
import { getGameSessions, deleteGameSession } from '../lib/supabase';
import { soundEffects } from '../utils/soundEffects';

export const ArchivesReport: React.FC = () => {
  const [sessions, setSessions] = useState<GameSessionArchive[]>([]);
  const [selectedSession, setSelectedSession] = useState<GameSessionArchive | null>(null);

  const loadSessions = async () => {
    const data = await getGameSessions();
    setSessions(data);
    if (data.length > 0 && !selectedSession) {
      setSelectedSession(data[0]);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Hapus arsip sesi turnamen ini?')) {
      await deleteGameSession(id);
      loadSessions();
      if (selectedSession?.id === id) {
        setSelectedSession(null);
      }
    }
  };

  const handlePrint = () => {
    soundEffects.playStarChime();
    window.print();
  };

  // Export CSV
  const handleExportCsv = (session: GameSessionArchive) => {
    const headers = ['Peringkat', 'Nama Kelompok', 'Tokoh Cendekiawan', 'Skor Akhir', 'Bintang', 'Jumlah Kesalahan', 'Status', 'Daftar Anggota'];
    const sorted = [...session.teams].sort((a, b) => {
      if (a.isEliminated && !b.isEliminated) return 1;
      if (!a.isEliminated && b.isEliminated) return -1;
      return b.score - a.score;
    });

    const rows = sorted.map((t, idx) => [
      `"${idx + 1}"`,
      `"${t.name}"`,
      `"${t.scholar}"`,
      t.score,
      t.stars,
      t.mistakes,
      `"${t.isEliminated ? 'Tereliminasi' : (idx === 0 ? 'Juara 1' : idx === 1 ? 'Juara 2' : idx === 2 ? 'Juara 3' : 'Aktif')}"`,
      `"${t.members.join(', ')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Rekap_Nilai_MIN1PASER_${session.className.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Screen View: Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Laporan Evaluasi Resmi
            </span>
            <span className="text-xs text-slate-400">{SCHOOL_IDENTITY.madrasahName}</span>
          </div>
          <h2 className="text-2xl font-black text-white">Arsip Turnamen & Berita Acara Nilai</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Dokumentasi rekapitulasi penilaian cerdas cermat 8 kelompok santri lengkap dengan tanda tangan Kepala Madrasah.
          </p>
        </div>

        {selectedSession && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExportCsv(selectedSession)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Ekspor CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Dokumen Resmi (PDF)</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: List of Archives (Print Hidden) */}
        <div className="lg:col-span-4 space-y-3 print:hidden">
          <h3 className="font-extrabold text-sm text-slate-300 uppercase tracking-wider mb-2">
            Riwayat Pertandingan ({sessions.length})
          </h3>

          <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1">
            {sessions.map(s => {
              const isSelected = selectedSession?.id === s.id;
              const dateStr = new Date(s.playedAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedSession(s)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500/80 ring-1 ring-emerald-500/50 shadow-lg'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-black text-emerald-400">{s.className}</span>
                    <button
                      onClick={(e) => handleDeleteSession(s.id, e)}
                      className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
                      title="Hapus Arsip"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="font-bold text-sm text-white line-clamp-1 mb-1">
                    {s.sessionTitle}
                  </h4>

                  <p className="text-[11px] text-slate-400 line-clamp-1 mb-2">
                    {s.packageTitle}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                    <span className="flex items-center gap-1 text-amber-400 font-semibold">
                      <Trophy className="w-3 h-3" />
                      <span>{s.winnerTeamName ? s.winnerTeamName.replace('Kelompok ', 'K-') : 'Belum Ada'}</span>
                    </span>
                    <span>{dateStr}</span>
                  </div>
                </div>
              );
            })}

            {sessions.length === 0 && (
              <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs">
                Belum ada arsip permainan yang disimpan. Mainkan game di Arena lalu klik "Simpan Nilai".
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Printable Official Document Preview */}
        <div className="lg:col-span-8">
          {selectedSession ? (
            <div className="bg-white text-slate-900 p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-200 print:p-0 print:border-none print:shadow-none print:m-0 print:rounded-none">
              {/* KOP SURAT RESMI MIN 1 PASER */}
              <div className="border-b-4 border-double border-slate-900 pb-4 mb-6 text-center relative">
                <div className="flex items-center justify-center gap-4 mb-2">
                  <div className="w-16 h-16 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-2xl print:w-14 print:h-14">
                    <School className="w-9 h-9" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-700">
                      KEMENTERIAN AGAMA REPUBLIK INDONESIA
                    </h4>
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                      KANTOR KEMENTERIAN AGAMA KABUPATEN PASER
                    </h3>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-emerald-800">
                      {SCHOOL_IDENTITY.fullName.toUpperCase()} ({SCHOOL_IDENTITY.madrasahName})
                    </h2>
                    <p className="text-[11px] text-slate-600">
                      {SCHOOL_IDENTITY.address}, {SCHOOL_IDENTITY.city}, {SCHOOL_IDENTITY.province} • Email: {SCHOOL_IDENTITY.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Title */}
              <div className="text-center my-4">
                <h3 className="text-base sm:text-lg font-black uppercase underline decoration-2 underline-offset-4 tracking-wide text-slate-900">
                  BERITA ACARA & REKAPITULASI HASIL GAME KREATIF SISWA
                </h3>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  Nomor: 042/MIN.01-PSR/GAME-KREATIF/{new Date(selectedSession.playedAt).getFullYear()}
                </p>
              </div>

              {/* Information Metadata */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 my-4">
                <div>
                  <p><strong className="text-slate-700">Nama Kegiatan:</strong> {selectedSession.sessionTitle}</p>
                  <p><strong className="text-slate-700">Kelas / Rombel:</strong> {selectedSession.className}</p>
                  <p><strong className="text-slate-700">Paket Soal:</strong> {selectedSession.packageTitle}</p>
                </div>
                <div>
                  <p><strong className="text-slate-700">Waktu Pelaksanaan:</strong> {new Date(selectedSession.playedAt).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}</p>
                  <p><strong className="text-slate-700">Aturan Eliminasi:</strong> Maksimal 3 Kesalahan (3 Strikes)</p>
                  <p><strong className="text-slate-700">Kelompok Juara 1:</strong> <span className="font-bold text-emerald-700">{selectedSession.winnerTeamName || '-'}</span></p>
                </div>
              </div>

              {/* 8 Teams Results Table */}
              <div className="my-5 overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-extrabold border-b border-slate-300">
                      <th className="p-2 border border-slate-300 text-center w-10">No</th>
                      <th className="p-2 border border-slate-300">Nama Kelompok & Tokoh</th>
                      <th className="p-2 border border-slate-300">Anggota Siswa</th>
                      <th className="p-2 border border-slate-300 text-center">Skor</th>
                      <th className="p-2 border border-slate-300 text-center">Bintang</th>
                      <th className="p-2 border border-slate-300 text-center">Salah</th>
                      <th className="p-2 border border-slate-300 text-center">Status / Peringkat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...selectedSession.teams]
                      .sort((a, b) => {
                        if (a.isEliminated && !b.isEliminated) return 1;
                        if (!a.isEliminated && b.isEliminated) return -1;
                        return b.score - a.score;
                      })
                      .map((team, rankIdx) => (
                        <tr 
                          key={team.id}
                          className={`border-b border-slate-200 ${
                            rankIdx === 0
                              ? 'bg-amber-50/70 font-semibold'
                              : rankIdx % 2 === 0
                              ? 'bg-white'
                              : 'bg-slate-50/40'
                          }`}
                        >
                          <td className="p-2 border border-slate-300 text-center font-bold">
                            {rankIdx + 1}
                          </td>
                          <td className="p-2 border border-slate-300">
                            <span className="font-bold block text-slate-900">{team.name}</span>
                            <span className="text-[10px] text-slate-500">{team.scholar}</span>
                          </td>
                          <td className="p-2 border border-slate-300 text-[11px] text-slate-700">
                            {team.members.length > 0 ? team.members.join(', ') : '-'}
                          </td>
                          <td className="p-2 border border-slate-300 text-center font-black text-sm text-slate-900">
                            {team.score}
                          </td>
                          <td className="p-2 border border-slate-300 text-center font-semibold text-amber-600">
                            ⭐ {team.stars}
                          </td>
                          <td className="p-2 border border-slate-300 text-center font-semibold">
                            {team.mistakes}/3 {team.mistakes >= 3 ? '❌' : ''}
                          </td>
                          <td className="p-2 border border-slate-300 text-center">
                            {team.isEliminated ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-700 border border-red-200">
                                TERELIMINASI
                              </span>
                            ) : rankIdx === 0 ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                                JUARA 1 🏆
                              </span>
                            ) : rankIdx === 1 ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-200 text-slate-800">
                                JUARA 2 🥈
                              </span>
                            ) : rankIdx === 2 ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-orange-100 text-orange-800">
                                JUARA 3 🥉
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-600 font-medium">
                                Peringkat #{rankIdx + 1}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Notes */}
              {selectedSession.notes && (
                <div className="my-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700">
                  <strong>Catatan Evaluasi Guru: </strong>
                  <span>{selectedSession.notes}</span>
                </div>
              )}

              {/* Signatures Section with Ismail, S.Ag and Dzakirul Husni, S.Pd */}
              <div className="mt-8 pt-4 border-t border-slate-300 text-xs">
                <div className="flex justify-between items-start text-center">
                  {/* Left: Pembuat & Pengembang Aplikasi */}
                  <div className="w-56 space-y-1">
                    <p className="text-slate-600">Mengetahui / Guru Pengampu,</p>
                    <p className="font-semibold text-slate-800">Pembuat & Pengembang Aplikasi</p>
                    <div className="h-16 flex items-center justify-center">
                      <span className="text-emerald-700 italic font-serif text-sm">Ttd Digital Sah</span>
                    </div>
                    <p className="font-bold underline text-slate-900">{SCHOOL_IDENTITY.pengembang}</p>
                    <p className="text-[11px] text-slate-600">Guru MIN 1 Paser</p>
                  </div>

                  {/* Right: Kepala Madrasah Ismail, S.Ag */}
                  <div className="w-56 space-y-1">
                    <p className="text-slate-600">Tanah Grogot, {new Date(selectedSession.playedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}</p>
                    <p className="font-semibold text-slate-800">Kepala Madrasah MIN 1 Paser,</p>
                    <div className="h-16 flex items-center justify-center">
                      <span className="text-emerald-700 italic font-serif text-sm">Ttd Digital Sah</span>
                    </div>
                    <p className="font-bold underline text-slate-900">{SCHOOL_IDENTITY.kepalaMadrasah}</p>
                    <p className="text-[11px] text-slate-600">NIP. 197405102005011004</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
              <FileText className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <p>Pilih salah satu sesi di sebelah kiri untuk melihat dan mencetak Berita Acara resmi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
