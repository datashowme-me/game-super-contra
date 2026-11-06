import React from 'react';
import { RotateCcw, Map, Home, Skull } from 'lucide-react';
import { Player } from '../game/types';

interface GameOverModalProps {
  isOpen: boolean;
  players: Player[];
  levelId: number;
  onRetry: () => void;
  onSelectLevel: () => void;
  onReturnTitle: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  players,
  levelId,
  onRetry,
  onSelectLevel,
  onReturnTitle,
}) => {
  if (!isOpen) return null;

  const totalScore = players.reduce((sum, p) => sum + p.score, 0);
  const totalKills = players.reduce((sum, p) => sum + p.kills, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-neutral-900 border border-red-500/50 rounded-2xl w-full max-w-lg p-6 shadow-[0_0_50px_rgba(239,68,68,0.3)] text-center space-y-6">
        {/* Skull Icon & Header */}
        <div className="space-y-2">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
            <Skull className="w-8 h-8 text-red-500 animate-pulse" />
          </div>
          <h2 className="font-arcade text-2xl font-black text-red-500 tracking-wider">
            GAME OVER
          </h2>
          <p className="font-arcade text-xs text-neutral-400">特种作战小队全员阵亡 · 任务失败</p>
        </div>

        {/* Combat Performance Stats */}
        <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-4 text-xs space-y-3">
          <div className="flex justify-between items-center text-neutral-400">
            <span>战区代号:</span>
            <span className="font-arcade text-amber-400">STAGE 0{levelId}</span>
          </div>

          <div className="flex justify-between items-center text-neutral-400">
            <span>总得分 (SCORE):</span>
            <span className="font-arcade text-white text-sm">{totalScore.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center text-neutral-400">
            <span>歼敌数量 (ENEMIES DEFEATED):</span>
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

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={onRetry}
            className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-arcade text-xs font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>重新挑战本关 (CONTINUE)</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={onSelectLevel}
              className="py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-arcade text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Map className="w-3.5 h-3.5 text-amber-400" />
              <span>选择战区</span>
            </button>

            <button
              onClick={onReturnTitle}
              className="py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-arcade text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>返回主界面</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
