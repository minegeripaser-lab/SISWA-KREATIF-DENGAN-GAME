import React, { useState } from 'react';
import { X, UserPlus, Trash2, Users, Check } from 'lucide-react';
import { Team } from '../types';

interface TeamMembersModalProps {
  team: Team;
  onUpdateTeam: (updatedTeam: Team) => void;
  onClose: () => void;
}

export const TeamMembersModal: React.FC<TeamMembersModalProps> = ({
  team,
  onUpdateTeam,
  onClose,
}) => {
  const [members, setMembers] = useState<string[]>([...team.members]);
  const [newMemberName, setNewMemberName] = useState('');
  const [teamName, setTeamName] = useState(team.name);
  const [scholar, setScholar] = useState(team.scholar);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    setMembers([...members, newMemberName.trim()]);
    setNewMemberName('');
  };

  const handleRemoveMember = (idx: number) => {
    setMembers(members.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    onUpdateTeam({
      ...team,
      name: teamName.trim() || team.name,
      scholar: scholar.trim() || team.scholar,
      members: members,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: team.accentHex }}
          >
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Pengaturan {team.name}</h3>
            <p className="text-xs text-slate-400">Daftar siswa & tokoh inspirasi cendekiawan muslim</p>
          </div>
        </div>

        {/* Edit Name & Scholar */}
        <div className="space-y-3 mb-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Kelompok</label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Tokoh Cendekiawan / Gelar</label>
            <input
              type="text"
              value={scholar}
              onChange={(e) => setScholar(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Member List */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Anggota Siswa ({members.length} Siswa)
          </label>
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {members.map((member, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-sm text-slate-200"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-700 text-[11px] font-bold flex items-center justify-center text-slate-300">
                    {idx + 1}
                  </span>
                  <span>{member}</span>
                </div>
                <button
                  onClick={() => handleRemoveMember(idx)}
                  className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {members.length === 0 && (
              <p className="text-xs text-slate-500 italic p-3 text-center">Belum ada nama siswa yang ditambahkan.</p>
            )}
          </div>
        </div>

        {/* Add Member Form */}
        <form onSubmit={handleAddMember} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Tambah nama siswa..."
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah</span>
          </button>
        </form>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-600/30"
          >
            <Check className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
