import React from 'react';
import { PlayerControls } from '../game/types';
import { soundManager } from '../game/audio';

interface MobileControlsProps {
  controls: PlayerControls;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ controls }) => {
  const setKey = (key: keyof PlayerControls, value: boolean, e?: React.PointerEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    soundManager.init();
    controls[key] = value;
  };

  const handlePointerDown = (key: keyof PlayerControls, e: React.PointerEvent) => {
    setKey(key, true, e);
  };

  const handlePointerUp = (key: keyof PlayerControls, e: React.PointerEvent) => {
    setKey(key, false, e);
  };

  const handleDiagonalDown = (k1: keyof PlayerControls, k2: keyof PlayerControls, e: React.PointerEvent) => {
    setKey(k1, true, e);
    setKey(k2, true, e);
  };

  const handleDiagonalUp = (k1: keyof PlayerControls, k2: keyof PlayerControls, e: React.PointerEvent) => {
    setKey(k1, false, e);
    setKey(k2, false, e);
  };

  return (
    <div className="absolute inset-x-0 bottom-2 px-3 flex items-end justify-between pointer-events-none z-30 select-none touch-none">
      {/* 8-Way Virtual D-Pad (Left Side) */}
      <div className="pointer-events-auto relative w-36 h-36 bg-neutral-950/60 border border-neutral-700/60 rounded-full backdrop-blur-sm p-1 grid grid-cols-3 grid-rows-3 gap-1 shadow-2xl">
        {/* Top-Left */}
        <button
          onPointerDown={(e) => handleDiagonalDown('up', 'left', e)}
          onPointerUp={(e) => handleDiagonalUp('up', 'left', e)}
          onPointerLeave={(e) => handleDiagonalUp('up', 'left', e)}
          className="rounded-tl-full bg-neutral-800/30 active:bg-amber-500/50 flex items-center justify-center text-[10px] text-neutral-400 font-bold"
          aria-label="Up-Left (W+A)"
        >
          ◤
        </button>

        {/* Up */}
        <button
          onPointerDown={(e) => handlePointerDown('up', e)}
          onPointerUp={(e) => handlePointerUp('up', e)}
          onPointerLeave={(e) => handlePointerUp('up', e)}
          className="bg-neutral-800/60 active:bg-amber-500/80 rounded flex flex-col items-center justify-center text-white font-bold"
          aria-label="Up (W/ArrowUp)"
        >
          <span className="text-xs">▲</span>
          <span className="text-[8px] text-amber-300 font-arcade">W</span>
        </button>

        {/* Top-Right */}
        <button
          onPointerDown={(e) => handleDiagonalDown('up', 'right', e)}
          onPointerUp={(e) => handleDiagonalUp('up', 'right', e)}
          onPointerLeave={(e) => handleDiagonalUp('up', 'right', e)}
          className="rounded-tr-full bg-neutral-800/30 active:bg-amber-500/50 flex items-center justify-center text-[10px] text-neutral-400 font-bold"
          aria-label="Up-Right (W+D)"
        >
          ◥
        </button>

        {/* Left */}
        <button
          onPointerDown={(e) => handlePointerDown('left', e)}
          onPointerUp={(e) => handlePointerUp('left', e)}
          onPointerLeave={(e) => handlePointerUp('left', e)}
          className="bg-neutral-800/60 active:bg-amber-500/80 rounded flex flex-col items-center justify-center text-white font-bold"
          aria-label="Left (A/ArrowLeft)"
        >
          <span className="text-xs">◀</span>
          <span className="text-[8px] text-amber-300 font-arcade">A</span>
        </button>

        {/* Center Pivot */}
        <div className="bg-neutral-900/80 rounded-full flex items-center justify-center border border-neutral-700/50">
          <div className="w-4 h-4 rounded-full bg-neutral-600/70" />
        </div>

        {/* Right */}
        <button
          onPointerDown={(e) => handlePointerDown('right', e)}
          onPointerUp={(e) => handlePointerUp('right', e)}
          onPointerLeave={(e) => handlePointerUp('right', e)}
          className="bg-neutral-800/60 active:bg-amber-500/80 rounded flex flex-col items-center justify-center text-white font-bold"
          aria-label="Right (D/ArrowRight)"
        >
          <span className="text-xs">▶</span>
          <span className="text-[8px] text-amber-300 font-arcade">D</span>
        </button>

        {/* Bottom-Left */}
        <button
          onPointerDown={(e) => handleDiagonalDown('down', 'left', e)}
          onPointerUp={(e) => handleDiagonalUp('down', 'left', e)}
          onPointerLeave={(e) => handleDiagonalUp('down', 'left', e)}
          className="rounded-bl-full bg-neutral-800/30 active:bg-amber-500/50 flex items-center justify-center text-[10px] text-neutral-400 font-bold"
          aria-label="Down-Left (S+A)"
        >
          ◣
        </button>

        {/* Down */}
        <button
          onPointerDown={(e) => handlePointerDown('down', e)}
          onPointerUp={(e) => handlePointerUp('down', e)}
          onPointerLeave={(e) => handlePointerUp('down', e)}
          className="bg-neutral-800/60 active:bg-amber-500/80 rounded flex flex-col items-center justify-center text-white font-bold"
          aria-label="Down (S/ArrowDown)"
        >
          <span className="text-xs">▼</span>
          <span className="text-[8px] text-amber-300 font-arcade">S</span>
        </button>

        {/* Bottom-Right */}
        <button
          onPointerDown={(e) => handleDiagonalDown('down', 'right', e)}
          onPointerUp={(e) => handleDiagonalUp('down', 'right', e)}
          onPointerLeave={(e) => handleDiagonalUp('down', 'right', e)}
          className="rounded-br-full bg-neutral-800/30 active:bg-amber-500/50 flex items-center justify-center text-[10px] text-neutral-400 font-bold"
          aria-label="Down-Right (S+D)"
        >
          ◢
        </button>
      </div>

      {/* Action Buttons (Right Side) */}
      <div className="pointer-events-auto flex items-end gap-2.5 pb-1">
        {/* Tactical Bomb */}
        <button
          onPointerDown={(e) => handlePointerDown('bomb', e)}
          onPointerUp={(e) => handlePointerUp('bomb', e)}
          onPointerLeave={(e) => handlePointerUp('bomb', e)}
          className="w-12 h-12 rounded-full bg-amber-500/80 active:bg-amber-400 text-neutral-950 font-arcade text-[10px] font-bold shadow-lg flex flex-col items-center justify-center border-2 border-amber-300 active:scale-95 transition-transform"
        >
          <span>轰炸</span>
          <span className="text-[8px] opacity-80">L键</span>
        </button>

        {/* Jump Button (B) */}
        <button
          onPointerDown={(e) => handlePointerDown('jump', e)}
          onPointerUp={(e) => handlePointerUp('jump', e)}
          onPointerLeave={(e) => handlePointerUp('jump', e)}
          className="w-14 h-14 rounded-full bg-blue-600/85 active:bg-blue-400 text-white font-arcade text-xs font-bold shadow-xl flex flex-col items-center justify-center border-2 border-blue-400 active:scale-95 transition-transform"
        >
          <span>跳跃</span>
          <span className="text-[9px] text-blue-200">空格/K</span>
        </button>

        {/* Fire Button (A) */}
        <button
          onPointerDown={(e) => handlePointerDown('fire', e)}
          onPointerUp={(e) => handlePointerUp('fire', e)}
          onPointerLeave={(e) => handlePointerUp('fire', e)}
          className="w-16 h-16 rounded-full bg-red-600/90 active:bg-red-400 text-white font-arcade text-sm font-bold shadow-2xl flex flex-col items-center justify-center border-2 border-red-400 active:scale-95 transition-transform"
        >
          <span>射击</span>
          <span className="text-[10px] text-yellow-200">J/鼠标</span>
        </button>
      </div>
    </div>
  );
};
