import React from 'react';
import { Trophy, RotateCcw, Home } from 'lucide-react';
import { Player } from '../game/types';

interface VictoryModalProps {
  isOpen: boolean;
  players: Player[];
  onPlayAgain: () => void;
  onReturnTitle: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  players,
  onPlayAgain,
  onReturnTitle,
}) => {
  if (!isOpen) return null;

  const totalScore = players.reduce((sum, p) => sum + p.score, 0);
  const totalKills = players.reduce((sum, p) => sum + p.kills, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-neutral-900 border border-amber-400/60 rounded-2xl w-full max-w-lg p-6 shadow-[0_0_60px_rgba(251,191,36,0.35)] text-center space-y-6">
        {/* Trophy Icon & Header */}
        <div className="space-y-2">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
          </div>
          <h2 className="font-arcade text-2xl font-black text-amber-400 tracking-wider">
            MISSION ACCOMPLISHED!
          </h2>
          <p className="font-arcade text-xs text-neutral-300">红隼异形母体已被彻底消灭 · 地球重归和平</p>
        </div>

        {/* Victory Stats */}
        <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-4 text-xs space-y-3">
          <div className="flex justify-between items-center text-neutral-400">
            <span>战役最终评级:</span>
            <span className="font-arcade text-amber-300 text-sm">★ S-RANK SPECIAL FORCE ★</span>
          </div>

          <div className="flex justify-between items-center text-neutral-400">
            <span>总计作战得分:</span>
            <span className="font-arcade text-white text-base">{totalScore.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center text-neutral-400">
            <span>全歼异形总数:</span>
            <span className="font-arcade text-white">{totalKills} 目标</span>
          </div>

          {/* Breakdown for 2P */}
          {players.length > 1 && (
            <div className="pt-2 border-t border-neutral-800/80 grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded bg-blue-950/30 border border-blue-500/20 text-blue-300">
                1P 比尔: {players[0].score} 分 / {players[0].kills} 击杀
              </div>
              <div className="p-2 rounded bg-red-950/30 border border-red-500/20 text-red-300">
                2P 兰斯: {players[1].score} 分 / {players[1].kills} 击杀
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          <button
            onClick={onPlayAgain}
            className="w-full py-4 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-neutral-950 font-arcade text-xs font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>再次出击 (PLAY AGAIN)</span>
          </button>

          <button
            onClick={onReturnTitle}
            className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-arcade text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>返回主界面</span>
          </button>
        </div>
      </div>
    </div>
  );
};
