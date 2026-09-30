import React, { useRef, useEffect, useState } from 'react';
import { RotateCw, Sparkles, X } from 'lucide-react';
import { Team } from '../types';
import { soundEffects } from '../utils/soundEffects';

interface SpinWheelProps {
  teams: Team[];
  onSelectTeam: (team: Team) => void;
  onClose: () => void;
}

export const SpinWheel: React.FC<SpinWheelProps> = ({ teams, onSelectTeam, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<Team | null>(null);
  const currentAngleRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  // Active (non-eliminated) teams or all teams if all eliminated
  const activeTeams = teams.filter(t => !t.isEliminated).length > 0
    ? teams.filter(t => !t.isEliminated)
    : teams;

  const colors = [
    '#059669', // Emerald
    '#2563eb', // Blue
    '#d97706', // Amber
    '#e11d48', // Rose
    '#7c3aed', // Purple
    '#ea580c', // Orange
    '#0891b2', // Cyan
    '#db2777', // Pink
  ];

  const drawWheel = (angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 12;
    const numSegments = activeTeams.length;
    const sliceAngle = (2 * Math.PI) / numSegments;

    ctx.clearRect(0, 0, size, size);

    // Outer shadow ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius + 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a';
    ctx.shadowColor = '#00000088';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.restore();

    // Slices
    activeTeams.forEach((team, i) => {
      const startAngle = angle + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = team.accentHex || colors[i % colors.length];
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff44';
      ctx.stroke();

      // Text label inside slice
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
      ctx.shadowColor = '#000000aa';
      ctx.shadowBlur = 4;
      const displayName = team.name.replace('Kelompok ', 'K-');
      ctx.fillText(displayName, radius - 20, 4);
      ctx.restore();
    });

    // Center Hub
    ctx.beginPath();
    ctx.arc(center, center, 28, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    // Center decorative star icon
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', center, center);
  };

  useEffect(() => {
    drawWheel(currentAngleRef.current);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [activeTeams]);

  const spin = () => {
    if (isSpinning || activeTeams.length === 0) return;

    setIsSpinning(true);
    setSelectedWinner(null);

    const spinDuration = 3500; // ms
    const startTime = performance.now();
    const startAngle = currentAngleRef.current;
    // 5 to 8 full rotations + random angle
    const extraRotations = (5 + Math.random() * 4) * 2 * Math.PI;
    const targetAngle = startAngle + extraRotations;

    let lastTickAngle = startAngle;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);

      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentAngle = startAngle + (targetAngle - startAngle) * easeOut;
      currentAngleRef.current = currentAngle;

      drawWheel(currentAngle);

      // Play tick sound every slice crossed
      const sliceAngle = (2 * Math.PI) / activeTeams.length;
      if (Math.abs(currentAngle - lastTickAngle) >= sliceAngle * 0.4) {
        soundEffects.playWheelSpin();
        lastTickAngle = currentAngle;
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        // Calculate which team is at the top pointer (angle = 3*PI/2)
        const normalizedAngle = (2 * Math.PI - (currentAngle % (2 * Math.PI))) % (2 * Math.PI);
        // Pointer is at top (-PI/2 or 3*PI/2)
        const pointerAngle = (3 * Math.PI / 2);
        const relativeAngle = (pointerAngle - (currentAngle % (2 * Math.PI)) + 4 * Math.PI) % (2 * Math.PI);
        const winningIndex = Math.floor(relativeAngle / sliceAngle) % activeTeams.length;
        const winner = activeTeams[winningIndex];

        setSelectedWinner(winner);
        soundEffects.playStarChime();
        onSelectTeam(winner);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl max-w-md w-full p-6 relative flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSpinning}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Undian Keberuntungan MIN 1 Paser</span>
          </div>
          <h3 className="text-xl font-extrabold text-white">Roda Pemilihan Kelompok</h3>
          <p className="text-xs text-slate-400">Putar roda untuk menentukan kelompok yang berhak menjawab!</p>
        </div>

        {/* Wheel Container with Pointer */}
        <div className="relative my-2">
          {/* Top Indicator Triangle Arrow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[20px] border-t-amber-400 filter drop-shadow-md"></div>

          {/* Canvas */}
          <canvas
            ref={canvasRef}
            width={340}
            height={340}
            className="rounded-full shadow-2xl"
          />
        </div>

        {/* Result Announcement */}
        {selectedWinner && (
          <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-teal-500/20 border border-amber-500/40 text-center animate-bounce">
            <span className="text-xs text-amber-300 font-medium">Kelompok Terpilih:</span>
            <p className="text-lg font-black text-white">{selectedWinner.name}</p>
            <p className="text-xs text-emerald-300">{selectedWinner.scholar}</p>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-5 flex gap-3 w-full">
          <button
            onClick={spin}
            disabled={isSpinning}
            className="flex-1 py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 disabled:opacity-50 shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-95"
          >
            <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'Roda Sedang Berputar...' : 'Putar Roda Sekarang!'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
