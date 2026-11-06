import React from 'react';
import { Play, Award, Map } from 'lucide-react';
import { Player } from '../game/types';

interface StageClearModalProps {
  isOpen: boolean;
  levelId: number;
  players: Player[];
  onNextStage: () => void;
  onSelectLevel: () => void;
}

export const StageClearModal: React.FC<StageClearModalProps> = ({
  isOpen,
  levelId,
  players,
  onNextStage,
  onSelectLevel,
}) => {
  if (!isOpen) return null;

  const totalScore = players.reduce((sum, p) => sum + p.score, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-neutral-900 border border-emerald-500/50 rounded-2xl w-full max-w-lg p-6 shadow-[0_0_50px_rgba(16,185,129,0.3)] text-center space-y-6">
        {/* Award Icon & Header */}
        <div className="space-y-2">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <Award className="w-8 h-8 text-emerald-400 animate-bounce" />
          </div>
          <h2 className="font-arcade text-2xl font-black text-emerald-400 tracking-wider">
            STAGE 0{levelId} CLEARED!
          </h2>
          <p className="font-arcade text-xs text-neutral-300">敌方防线彻底崩溃 · 守关BOSS已歼灭</p>
        </div>

        {/* Combat Score Card */}
        <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-4 text-xs space-y-3">
          <div className="flex justify-between items-center text-neutral-400">
            <span>战区通关得分:</span>
            <span className="font-arcade text-emerald-400 text-sm">{totalScore.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center text-neutral-400">
            <span>下一目标战区:</span>
            <span className="font-arcade text-amber-400">STAGE 0{levelId + 1}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={onNextStage}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 font-arcade text-xs font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>空降下一战区 (NEXT STAGE)</span>
          </button>

          <button
            onClick={onSelectLevel}
            className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-arcade text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <Map className="w-3.5 h-3.5 text-amber-400" />
            <span>自由选择关卡</span>
          </button>
        </div>
      </div>
    </div>
  );
};
