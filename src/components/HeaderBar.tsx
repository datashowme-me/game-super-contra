import React from 'react';
import { Volume2, VolumeX, Shield, Play, Gamepad2, Map, Keyboard, Flame } from 'lucide-react';
import { soundManager } from '../game/audio';

interface HeaderBarProps {
  onOpenLevelSelect: () => void;
  onOpenControls: () => void;
  onOpenCheat: () => void;
  onQuickStart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  hasKonamiCode: boolean;
  showVirtualPad?: boolean;
  onToggleVirtualPad?: () => void;
  autoFire?: boolean;
  onToggleAutoFire?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onOpenLevelSelect,
  onOpenControls,
  onOpenCheat,
  onQuickStart,
  isMuted,
  onToggleMute,
  hasKonamiCode,
  showVirtualPad = true,
  onToggleVirtualPad,
  autoFire = true,
  onToggleAutoFire,
}) => {
  return (
    <header className="flex items-center justify-between gap-3 sm:gap-8 px-4 sm:px-6 py-2.5 sm:py-3.5 bg-neutral-900/95 border-b border-neutral-800 backdrop-blur z-20 overflow-x-auto">
      {/* Zone 1: Single text wordmark */}
      <div className="flex items-center gap-2.5 shrink-0">
        <span className="font-arcade text-red-500 text-xs sm:text-sm tracking-wider uppercase whitespace-nowrap">
          魂斗罗: 终极突击
        </span>
        {hasKonamiCode && (
          <span className="font-arcade text-[10px] text-amber-400 border border-amber-500/40 px-1.5 py-0.5 rounded bg-amber-500/10 whitespace-nowrap">
            30条命
          </span>
        )}
      </div>

      {/* Zone 2: Navigation buttons (visible across screen sizes) */}
      <nav className="flex items-center gap-2 sm:gap-5 text-xs text-neutral-300 font-medium">
        <button
          onClick={onOpenLevelSelect}
          className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 px-1.5 py-1 rounded hover:bg-neutral-800/60"
        >
          <Map className="w-3.5 h-3.5 text-amber-400" />
          <span>选关</span>
        </button>

        <button
          onClick={onOpenControls}
          className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 px-1.5 py-1 rounded hover:bg-neutral-800/60"
        >
          <Keyboard className="w-3.5 h-3.5 text-blue-400" />
          <span>键位说明</span>
        </button>

        {onToggleAutoFire && (
          <button
            onClick={onToggleAutoFire}
            className={`transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-semibold ${
              autoFire
                ? 'bg-orange-500/20 border-orange-500/60 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.3)]'
                : 'bg-neutral-800/60 border-neutral-700 text-neutral-400 hover:text-white'
            }`}
            title="自动开火：开启后角色将持续自动朝朝向/瞄准方向开火，按键盘 T 键亦可随时切换"
          >
            <Flame className={`w-3.5 h-3.5 ${autoFire ? 'text-orange-400 animate-pulse' : 'text-neutral-500'}`} />
            <span>自动开枪: {autoFire ? '开' : '关'}</span>
          </button>
        )}

        {onToggleVirtualPad && (
          <button
            onClick={onToggleVirtualPad}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 px-2 py-1 rounded border text-[11px] ${
              showVirtualPad
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-neutral-800/60 border-neutral-700 text-neutral-400'
            }`}
            title="开启/关闭屏幕虚拟按键（鼠标点击或触控）"
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>屏幕按键: {showVirtualPad ? '开' : '关'}</span>
          </button>
        )}

        <button
          onClick={onOpenCheat}
          className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 hidden sm:flex items-center gap-1.5"
        >
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>30条命</span>
        </button>
      </nav>

      {/* Zone 3: Primary action & sound control */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={() => {
            soundManager.init();
            onToggleMute();
          }}
          className="p-1.5 sm:p-2 rounded text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
          title={isMuted ? '开启音效' : '静音'}
          aria-label="Sound control"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        <button
          onClick={onQuickStart}
          className="px-3 sm:px-4 py-1.5 sm:py-2 font-arcade text-xs font-bold text-neutral-950 bg-red-500 hover:bg-red-400 rounded transition-all shadow-md flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>快速出击</span>
        </button>
      </div>
    </header>
  );
};
