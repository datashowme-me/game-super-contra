import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './game/engine';
import { Difficulty, GameMode, GameState } from './game/types';
import { HeaderBar } from './components/HeaderBar';
import { TitleScreen } from './components/TitleScreen';
import { LevelSelectModal } from './components/LevelSelectModal';
import { ControlsModal } from './components/ControlsModal';
import { GameOverModal } from './components/GameOverModal';
import { StageClearModal } from './components/StageClearModal';
import { VictoryModal } from './components/VictoryModal';
import { MobileControls } from './components/MobileControls';
import { soundManager } from './game/audio';
import { Gamepad2, Monitor, Pause, Play, RotateCcw, ShieldAlert, Sparkles, Volume2, VolumeX, Keyboard, Flame } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [gameMode, setGameMode] = useState<GameMode>('1P');
  const [difficulty, setDifficulty] = useState<Difficulty>('VETERAN');
  const [selectedLevelId, setSelectedLevelId] = useState<number>(1);

  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState<boolean>(false);
  const [isControlsOpen, setIsControlsOpen] = useState<boolean>(false);
  const [hasKonamiCode, setHasKonamiCode] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  
  // Auto-Fire enabled by default so player automatically shoots continuous fire
  const [autoFire, setAutoFire] = useState<boolean>(true);

  // Crystal Clear HD Mode by default (CRT filter disabled by default for maximum sharpness)
  const [enableCRT, setEnableCRT] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [bossWarningActive, setBossWarningActive] = useState<boolean>(false);
  
  // Show virtual buttons by default so user can use mouse click or touch anytime
  const [showVirtualPad, setShowVirtualPad] = useState<boolean>(true);
  
  // Real-time key state trigger for reactive HUD badges
  const [, setControlsTick] = useState<number>(0);

  // Initialize Engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;
    setAutoFire(engine.autoFire);

    engine.onStateChange = (state) => {
      setGameState(state);
      setIsPaused(false);
    };

    engine.onPlayerStatUpdate = () => {
      setHasKonamiCode(engine.hasKonamiCode);
      setAutoFire(engine.autoFire);
    };

    engine.onControlsUpdate = () => {
      setControlsTick(t => t + 1);
      setAutoFire(engine.autoFire);
    };

    engine.onBossWarning = () => {
      setBossWarningActive(true);
      setTimeout(() => setBossWarningActive(false), 3000);
    };

    // Handle Resize
    const updateSize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      canvasRef.current.width = rect.width;
      canvasRef.current.height = rect.height;
      engine.setDimensions(rect.width, rect.height);
    };

    // Prevent DOM buttons from retaining keyboard focus and intercepting Space/Arrow keys
    const handleGlobalClick = (e: MouseEvent) => {
      if (e.target instanceof HTMLElement && (e.target.tagName === 'BUTTON' || e.target.closest('button'))) {
        setTimeout(() => {
          if (document.activeElement instanceof HTMLElement && document.activeElement.tagName === 'BUTTON') {
            document.activeElement.blur();
          }
          window.focus();
          canvasRef.current?.focus();
        }, 40);
      } else {
        canvasRef.current?.focus();
      }
    };

    window.addEventListener('click', handleGlobalClick);

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('click', handleGlobalClick);
      engine.destroy();
    };
  }, []);

  // Sync Audio Mute
  const handleToggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    soundManager.setMuted(newMuted);
  };

  // Start / Deploy Game
  const handleStartGame = (levelId: number = selectedLevelId) => {
    if (!engineRef.current) return;
    soundManager.init();
    setSelectedLevelId(levelId);
    engineRef.current.startLevel(levelId, gameMode, difficulty);
    setGameState('PLAYING');
    setIsLevelSelectOpen(false);
    setIsPaused(false);

    // Release any focused button and forcefully focus canvas and window
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    window.focus();
    setTimeout(() => {
      canvasRef.current?.focus();
    }, 20);
  };

  const handleNextStage = () => {
    const nextId = selectedLevelId + 1;
    if (nextId <= 3) {
      handleStartGame(nextId);
    } else {
      setGameState('VICTORY');
    }
  };

  const handleToggleAutoFire = () => {
    if (!engineRef.current) return;
    const val = engineRef.current.toggleAutoFire();
    setAutoFire(val);
  };

  const handleToggleKonami = () => {
    if (!engineRef.current) return;
    soundManager.init();
    engineRef.current.activateKonamiCode();
    setHasKonamiCode(true);
  };

  const handleTogglePause = () => {
    if (!engineRef.current || gameState !== 'PLAYING') return;
    const newPaused = !isPaused;
    setIsPaused(newPaused);
    engineRef.current.isPaused = newPaused;
  };

  // Real-time control states
  const p1 = engineRef.current?.p1Controls || { up: false, down: false, left: false, right: false, fire: false, jump: false, bomb: false };

  return (
    <div className="flex flex-col w-screen h-screen bg-neutral-950 text-neutral-100 overflow-hidden font-sans select-none">
      {/* Top Bar with responsive navigation & controls */}
      <HeaderBar
        onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
        onOpenControls={() => setIsControlsOpen(true)}
        onOpenCheat={handleToggleKonami}
        onQuickStart={() => handleStartGame(1)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        hasKonamiCode={hasKonamiCode}
        showVirtualPad={showVirtualPad}
        onToggleVirtualPad={() => setShowVirtualPad(!showVirtualPad)}
        autoFire={autoFire}
        onToggleAutoFire={handleToggleAutoFire}
      />

      {/* Main Game Screen Viewport */}
      <div 
        ref={containerRef} 
        onClick={() => {
          soundManager.init();
          canvasRef.current?.focus();
        }}
        className="relative flex-1 w-full h-full bg-neutral-950 overflow-hidden flex items-center justify-center cursor-crosshair"
      >
        {/* Canvas for Game Renderer */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block pixel-art focus:outline-none"
          tabIndex={0}
        />

        {/* Title Screen Overlay */}
        {gameState === 'TITLE' && (
          <TitleScreen
            mode={gameMode}
            onSelectMode={(m) => setGameMode(m)}
            difficulty={difficulty}
            onSelectDifficulty={(d) => setDifficulty(d)}
            hasKonamiCode={hasKonamiCode}
            onToggleKonami={handleToggleKonami}
            onStartGame={() => handleStartGame(selectedLevelId)}
            onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
            onOpenControls={() => setIsControlsOpen(true)}
          />
        )}

        {/* Boss Warning Banner Flash */}
        {bossWarningActive && (
          <div className="absolute inset-x-0 top-1/3 flex flex-col items-center justify-center z-40 pointer-events-none animate-warning-flash">
            <div className="bg-red-600/90 border-y-4 border-amber-400 py-3 px-8 shadow-2xl flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-amber-300 animate-bounce" />
              <div className="text-center">
                <div className="font-arcade text-xl font-black text-amber-300 tracking-widest">
                  ⚠ 警告: 敌方巨型 BOSS 逼近 ⚠
                </div>
                <div className="font-arcade text-[10px] text-white tracking-widest mt-0.5">
                  WARNING: MASSIVE ENEMY LIFE-FORM DETECTED
                </div>
              </div>
            </div>
          </div>
        )}

        {/* On-Screen Real-Time Reactive Keyboard & Mouse Key HUD */}
        {gameState === 'PLAYING' && (
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto bg-neutral-950/90 border border-neutral-700/80 rounded-full px-4 py-1.5 backdrop-blur-md flex items-center gap-2 sm:gap-3 text-[11px] text-neutral-300 shadow-2xl max-w-[96vw] overflow-x-auto whitespace-nowrap">
            <span className="font-arcade text-[10px] text-amber-400 flex items-center gap-1">
              <Keyboard className="w-3.5 h-3.5" />
              <span>按键监控:</span>
            </span>

            {/* WASD & Arrow Directional Badges with Real-Time Active Glow */}
            <div className="flex items-center gap-1 font-mono">
              <span className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${p1.up ? 'bg-emerald-500 text-neutral-950 font-bold shadow-[0_0_8px_#10b981]' : 'bg-neutral-800 text-neutral-300'}`}>W/↑</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${p1.left ? 'bg-emerald-500 text-neutral-950 font-bold shadow-[0_0_8px_#10b981]' : 'bg-neutral-800 text-neutral-300'}`}>A/←</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${p1.down ? 'bg-emerald-500 text-neutral-950 font-bold shadow-[0_0_8px_#10b981]' : 'bg-neutral-800 text-neutral-300'}`}>S/↓</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${p1.right ? 'bg-emerald-500 text-neutral-950 font-bold shadow-[0_0_8px_#10b981]' : 'bg-neutral-800 text-neutral-300'}`}>D/→</span>
            </div>

            <span className="text-neutral-600">|</span>

            {/* Jump Space / K */}
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${p1.jump ? 'bg-blue-500 text-white font-bold shadow-[0_0_10px_#3b82f6]' : 'bg-neutral-800 text-blue-300'}`}>
              空格/K [跳跃]
            </span>

            <span className="text-neutral-600">|</span>

            {/* Fire J / Click */}
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${p1.fire ? 'bg-red-500 text-white font-bold shadow-[0_0_10px_#ef4444]' : 'bg-neutral-800 text-yellow-300'}`}>
              J/鼠标 [射击]
            </span>

            <span className="text-neutral-600">|</span>

            {/* Bomb L */}
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${p1.bomb ? 'bg-amber-400 text-neutral-950 font-bold shadow-[0_0_10px_#f59e0b]' : 'bg-neutral-800 text-amber-300'}`}>
              L [轰炸]
            </span>

            <span className="text-neutral-600">|</span>

            {/* Auto-Fire Toggle Button */}
            <button
              onClick={handleToggleAutoFire}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                autoFire
                  ? 'bg-orange-500 text-neutral-950 font-bold shadow-[0_0_10px_#f97316]'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
              title="切换自动开枪（按键盘 T 键亦可随时切换）"
            >
              <Flame className={`w-3 h-3 ${autoFire ? 'animate-pulse' : ''}`} />
              <span>T [自动开枪:{autoFire ? '开' : '关'}]</span>
            </button>
          </div>
        )}

        {/* Pause Overlay */}
        {isPaused && (
          <div className="absolute inset-0 bg-neutral-950/85 backdrop-blur-sm z-40 flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6 text-center space-y-5 max-w-sm w-full">
              <h3 className="font-arcade text-lg font-bold text-amber-400">战斗暂停 (PAUSED)</h3>
              <div className="space-y-2">
                <button
                  onClick={handleTogglePause}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 font-arcade text-xs text-white rounded transition-colors"
                >
                  继续战斗 (RESUME)
                </button>
                <button
                  onClick={() => handleStartGame(selectedLevelId)}
                  className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 font-arcade text-xs text-neutral-300 rounded transition-colors"
                >
                  重新开始 (RESTART)
                </button>
                <button
                  onClick={() => {
                    setIsPaused(false);
                    setGameState('TITLE');
                    if (engineRef.current) engineRef.current.state = 'TITLE';
                  }}
                  className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 font-arcade text-xs text-neutral-400 rounded transition-colors"
                >
                  返回主菜单 (TITLE)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Optional Retro CRT Scanline Overlay (Off by default for pure HD crystal clarity) */}
        {enableCRT && (
          <div className="absolute inset-0 scanlines crt-curvature pointer-events-none z-20" />
        )}

        {/* Dual Support: On-Screen Virtual Controls (Click with mouse OR touch with finger) */}
        {gameState === 'PLAYING' && showVirtualPad && engineRef.current && (
          <MobileControls controls={engineRef.current.p1Controls} />
        )}

        {/* In-Game Floating HUD Buttons (Auto-Fire, Virtual Pad Toggle, CRT Toggle, Pause) */}
        {gameState === 'PLAYING' && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-30">
            <button
              onClick={handleToggleAutoFire}
              className={`p-2 rounded border backdrop-blur transition-all text-xs flex items-center gap-1 ${
                autoFire
                  ? 'bg-orange-500/20 border-orange-500/60 text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.35)]'
                  : 'bg-neutral-900/70 border-neutral-700 text-neutral-400'
              }`}
              title={`切换自动射击 (当前: ${autoFire ? '开启' : '关闭'}，按 T 键亦可切换)`}
            >
              <Flame className={`w-4 h-4 ${autoFire ? 'text-orange-400 animate-pulse' : 'text-neutral-400'}`} />
            </button>

            <button
              onClick={() => setShowVirtualPad(!showVirtualPad)}
              className={`p-2 rounded border backdrop-blur transition-colors text-xs flex items-center gap-1 ${
                showVirtualPad
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                  : 'bg-neutral-900/70 border-neutral-700 text-neutral-400'
              }`}
              title="切换屏幕按键（鼠标可直接点击操作）"
            >
              <Gamepad2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setEnableCRT(!enableCRT)}
              className={`p-2 rounded border backdrop-blur transition-colors ${
                enableCRT
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-neutral-900/70 border-neutral-700 text-neutral-400'
              }`}
              title="切换 CRT 复古扫描线 (默认为纯净超清画质)"
            >
              <Monitor className="w-4 h-4" />
            </button>

            <button
              onClick={handleTogglePause}
              className="p-2 rounded bg-neutral-900/70 border border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
              title="暂停游戏"
            >
              {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <LevelSelectModal
        isOpen={isLevelSelectOpen}
        onClose={() => setIsLevelSelectOpen(false)}
        selectedLevelId={selectedLevelId}
        onSelectLevel={(id) => setSelectedLevelId(id)}
        onDeploy={(id) => handleStartGame(id)}
      />

      <ControlsModal
        isOpen={isControlsOpen}
        onClose={() => setIsControlsOpen(false)}
      />

      <GameOverModal
        isOpen={gameState === 'GAME_OVER'}
        players={engineRef.current?.players || []}
        levelId={selectedLevelId}
        onRetry={() => handleStartGame(selectedLevelId)}
        onSelectLevel={() => setIsLevelSelectOpen(true)}
        onReturnTitle={() => setGameState('TITLE')}
      />

      <StageClearModal
        isOpen={gameState === 'STAGE_CLEAR'}
        levelId={selectedLevelId}
        players={engineRef.current?.players || []}
        onNextStage={handleNextStage}
        onSelectLevel={() => setIsLevelSelectOpen(true)}
      />

      <VictoryModal
        isOpen={gameState === 'VICTORY'}
        players={engineRef.current?.players || []}
        onPlayAgain={() => handleStartGame(1)}
        onReturnTitle={() => setGameState('TITLE')}
      />
    </div>
  );
}
