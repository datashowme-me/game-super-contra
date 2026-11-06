import React from 'react';
import { Users, User, Crosshair, Sparkles, Map, ShieldCheck, Zap } from 'lucide-react';
import { Difficulty, GameMode } from '../game/types';

interface TitleScreenProps {
  mode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  difficulty: Difficulty;
  onSelectDifficulty: (diff: Difficulty) => void;
  hasKonamiCode: boolean;
  onToggleKonami: () => void;
  onStartGame: () => void;
  onOpenLevelSelect: () => void;
  onOpenControls: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  mode,
  onSelectMode,
  difficulty,
  onSelectDifficulty,
  hasKonamiCode,
  onToggleKonami,
  onStartGame,
  onOpenLevelSelect,
  onOpenControls,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-y-auto px-4 py-8">
      {/* Background Hero Image with Dark Gradient Scrim */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/src/assets/images/contra_arcade_hero_1793951933403.jpg"
          alt="Contra Arcade Background"
          className="w-full h-full object-cover opacity-35 filter brightness-75 scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-neutral-950/40" />
      </div>

      {/* Main Arcade Title Card */}
      <div className="relative z-10 max-w-2xl w-full flex flex-col items-center text-center space-y-6">
        {/* Arcade Badge */}
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span>经典街机射击重制版</span>
          <span aria-hidden="true">·</span>
          <span>双人合作同屏作战</span>
          <span aria-hidden="true">·</span>
          <span>三大独立战区</span>
        </div>

        {/* Title Lockup */}
        <div className="space-y-2">
          <h1 className="font-arcade text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-yellow-300 drop-shadow-[0_4px_16px_rgba(239,68,68,0.5)] tracking-wider">
            魂斗罗: 终极突击
          </h1>
          <p className="font-arcade text-xs sm:text-sm text-red-400/90 tracking-widest uppercase">
            SUPER CONTRA: RED FALCON REVENGE
          </p>
        </div>

        {/* Game Mode Selector (1P vs 2P) */}
        <div className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 backdrop-blur-md space-y-4">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider text-left">
            选择出战模式 (PLAYER MODE)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1P Mode Button */}
            <button
              onClick={() => onSelectMode('1P')}
              className={`flex items-center gap-3.5 p-3.5 rounded-lg border text-left transition-all ${
                mode === '1P'
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                  : 'bg-neutral-800/50 border-neutral-700/60 text-neutral-300 hover:border-neutral-600'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-blue-400" />
              </div>
              <div className="min-w-0">
                <div className="font-arcade text-xs font-bold text-blue-300">1P 单兵特种作战</div>
                <div className="text-[11px] text-neutral-400 mt-0.5 truncate">
                  比尔 (Bill Rizer) · 蓝色迷彩
                </div>
              </div>
            </button>

            {/* 2P Mode Button */}
            <button
              onClick={() => onSelectMode('2P')}
              className={`flex items-center gap-3.5 p-3.5 rounded-lg border text-left transition-all ${
                mode === '2P'
                  ? 'bg-red-600/20 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                  : 'bg-neutral-800/50 border-neutral-700/60 text-neutral-300 hover:border-neutral-600'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-400/30 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-red-400" />
              </div>
              <div className="min-w-0">
                <div className="font-arcade text-xs font-bold text-red-300">2P 双人同屏合作</div>
                <div className="text-[11px] text-neutral-400 mt-0.5 truncate">
                  比尔 & 兰斯 (红蓝双雄) · 借命系统
                </div>
              </div>
            </button>
          </div>

          {/* Difficulty Selection */}
          <div className="pt-2 border-t border-neutral-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
            <span className="text-xs text-neutral-400">战役难度:</span>
            <div className="flex items-center gap-1.5 p-1 bg-neutral-950/60 rounded-lg border border-neutral-800">
              <button
                onClick={() => onSelectDifficulty('RECRUIT')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  difficulty === 'RECRUIT'
                    ? 'bg-emerald-600 text-white font-medium'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                新兵 (5命)
              </button>
              <button
                onClick={() => onSelectDifficulty('VETERAN')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  difficulty === 'VETERAN'
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                老兵 (3命)
              </button>
              <button
                onClick={() => onSelectDifficulty('HARDCORE')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  difficulty === 'HARDCORE'
                    ? 'bg-red-600 text-white font-medium'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                炼狱 (1命)
              </button>
            </div>
          </div>
        </div>

        {/* Konami Code Banner / Cheat Trigger */}
        <div className="w-full flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-left">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-xs">
              <span className="text-amber-300 font-semibold">科乐美秘籍: </span>
              <span className="font-arcade text-[10px] text-amber-200/80 tracking-wider">
                ↑ ↑ ↓ ↓ ← → ← → B A
              </span>
            </div>
          </div>
          <button
            onClick={onToggleKonami}
            className={`px-3 py-1 text-xs font-arcade rounded transition-all ${
              hasKonamiCode
                ? 'bg-amber-400 text-neutral-950 font-bold shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            {hasKonamiCode ? '已激活 30 条命' : '一键激活 30 命'}
          </button>
        </div>

        {/* Agent Sprite Forge v0.4.0 HD Engine Status */}
        <div className="w-full bg-neutral-900/60 border border-emerald-500/30 rounded-lg p-3 text-left flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-emerald-300">
                Agent Sprite Forge (v0.4.0) 高清像素引擎已装载
              </div>
              <div className="text-[11px] text-neutral-400">
                16-Bit 角色动作多帧绘制 · 巨型Boss实机原画像素流 · 弹壳抛壳拟真物理
              </div>
            </div>
          </div>
          <span className="font-arcade text-[10px] text-emerald-400 bg-emerald-500/15 border border-emerald-500/40 px-2 py-1 rounded">
            HD 60FPS
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <button
            onClick={onStartGame}
            className="w-full sm:flex-1 py-4 font-arcade text-sm font-bold text-neutral-950 bg-gradient-to-r from-red-500 to-amber-400 hover:from-red-400 hover:to-amber-300 rounded-lg shadow-lg hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>开始战斗 (START GAME)</span>
          </button>

          <button
            onClick={onOpenLevelSelect}
            className="w-full sm:w-auto px-6 py-4 font-arcade text-xs text-neutral-200 bg-neutral-900 border border-neutral-700 hover:border-amber-400/80 hover:text-amber-300 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <Map className="w-4 h-4 text-amber-400" />
            <span>关卡选择</span>
          </button>
        </div>

        {/* Quick Keyboard reference */}
        <div className="pt-2 text-xs text-neutral-400 flex flex-wrap items-center justify-center gap-3 sm:gap-6">
          <span className="text-amber-300">🔥 默认自动开火 (按 T 键切换)</span>
          <span>1P: WASD/方向键 · 空格/K跳跃 · J/鼠标射击 · L轰炸</span>
          <span>2P: 方向键 · 1/U射击 · 2/I跳跃</span>
        </div>
      </div>
    </div>
  );
};
