import { 
  Boss, 
  Bullet, 
  Difficulty, 
  Enemy, 
  GameMode, 
  GameState, 
  LevelConfig, 
  Particle, 
  Platform, 
  Player, 
  PlayerControls, 
  PowerUpItem, 
  WaterZone, 
  WeaponType 
} from './types';
import { LEVELS } from './levels';
import { createStageBoss, updateBossAI } from './bosses';
import { soundManager } from './audio';
import { GameRenderer } from './renderer';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private renderer: GameRenderer;

  public state: GameState = 'TITLE';
  public mode: GameMode = '1P';
  public difficulty: Difficulty = 'VETERAN';
  public currentLevelId: number = 1;
  public levelConfig: LevelConfig = LEVELS[0];

  public players: Player[] = [];
  public enemies: Enemy[] = [];
  public boss: Boss;
  public bullets: Bullet[] = [];
  public powerUps: PowerUpItem[] = [];
  public particles: Particle[] = [];

  public cameraX: number = 0;
  public screenShake: number = 0;
  public gameTime: number = 0;
  public isPaused: boolean = false;

  private animationFrameId: number | null = null;
  private lastTime: number = 0;

  // Controls input state
  public p1Controls: PlayerControls = { up: false, down: false, left: false, right: false, fire: false, jump: false, bomb: false };
  public p2Controls: PlayerControls = { up: false, down: false, left: false, right: false, fire: false, jump: false, bomb: false };

  // Auto-Fire feature (default enabled for smooth effortless combat)
  public autoFire: boolean = true;

  // Callbacks for React state
  public onStateChange?: (state: GameState) => void;
  public onBossWarning?: () => void;
  public onPlayerStatUpdate?: () => void;

  // Konami Code buffer
  private konamiSequence: string[] = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  private konamiIndex: number = 0;
  public hasKonamiCode: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.renderer = new GameRenderer(this.ctx, canvas.width, canvas.height);
    this.boss = createStageBoss(1, 3600);

    this.bindKeyboard();
  }

  public setDimensions(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.renderer.resize(width, height);
  }

  public activeKeys: Set<string> = new Set();
  public onControlsUpdate?: () => void;

  // --- Keyboard & Konami Code Listener ---
  private bindKeyboard() {
    const handleKeyDown = (e: KeyboardEvent) => {
      soundManager.init();

      const key = (e.key || '').toLowerCase();
      const code = e.code || '';
      const keyCode = e.keyCode || e.which || 0;

      this.activeKeys.add(code || key);

      // Prevent page scrolling on gaming keys
      if (
        code === 'Space' || 
        code === 'ArrowUp' || 
        code === 'ArrowDown' || 
        code === 'ArrowLeft' || 
        code === 'ArrowRight' ||
        key === ' ' ||
        keyCode === 32 ||
        keyCode === 38 ||
        keyCode === 40 ||
        keyCode === 37 ||
        keyCode === 39
      ) {
        e.preventDefault();
      }

      // Check Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A
      const expected = this.konamiSequence[this.konamiIndex].toLowerCase();
      if (key === expected || code.toLowerCase() === expected) {
        this.konamiIndex++;
        if (this.konamiIndex === this.konamiSequence.length) {
          this.activateKonamiCode();
          this.konamiIndex = 0;
        }
      } else {
        this.konamiIndex = 0;
      }

      const is1P = this.mode === '1P';

      // 1. UP
      if (
        code === 'KeyW' || 
        key === 'w' || 
        keyCode === 87 || 
        (is1P && (code === 'ArrowUp' || key === 'arrowup' || keyCode === 38))
      ) {
        this.p1Controls.up = true;
      }

      // 2. DOWN
      if (
        code === 'KeyS' || 
        key === 's' || 
        keyCode === 83 || 
        (is1P && (code === 'ArrowDown' || key === 'arrowdown' || keyCode === 40))
      ) {
        this.p1Controls.down = true;
      }

      // 3. LEFT
      if (
        code === 'KeyA' || 
        key === 'a' || 
        keyCode === 65 || 
        (is1P && (code === 'ArrowLeft' || key === 'arrowleft' || keyCode === 37))
      ) {
        this.p1Controls.left = true;
      }

      // 4. RIGHT
      if (
        code === 'KeyD' || 
        key === 'd' || 
        keyCode === 68 || 
        (is1P && (code === 'ArrowRight' || key === 'arrowright' || keyCode === 39))
      ) {
        this.p1Controls.right = true;
      }

      // 5. JUMP (Space, K, X)
      if (
        code === 'Space' || 
        key === ' ' || 
        keyCode === 32 || 
        code === 'KeyK' || 
        key === 'k' || 
        keyCode === 75 || 
        code === 'KeyX' || 
        key === 'x' || 
        keyCode === 88
      ) {
        this.p1Controls.jump = true;
      }

      // 6. FIRE (J, Z, F, Enter, Num0)
      if (
        code === 'KeyJ' || 
        key === 'j' || 
        keyCode === 74 || 
        code === 'KeyZ' || 
        key === 'z' || 
        keyCode === 90 || 
        code === 'KeyF' || 
        key === 'f' || 
        keyCode === 70 || 
        (is1P && (code === 'Enter' || key === 'enter' || keyCode === 13 || code === 'Numpad0' || code === 'Numpad1'))
      ) {
        this.p1Controls.fire = true;
      }

      // 7. BOMB (L, C, B, Shift)
      if (
        code === 'KeyL' || 
        key === 'l' || 
        keyCode === 76 || 
        code === 'KeyC' || 
        key === 'c' || 
        keyCode === 67 || 
        code === 'KeyB' || 
        key === 'b' || 
        keyCode === 66 || 
        code === 'ShiftLeft' || 
        keyCode === 16
      ) {
        this.p1Controls.bomb = true;
      }

      // 8. Toggle Auto-Fire (T key)
      if (code === 'KeyT' || key === 't' || keyCode === 84) {
        this.toggleAutoFire();
      }

      // 2P Mode Controls
      if (!is1P) {
        if (code === 'ArrowUp' || key === 'arrowup' || keyCode === 38) this.p2Controls.up = true;
        if (code === 'ArrowDown' || key === 'arrowdown' || keyCode === 40) this.p2Controls.down = true;
        if (code === 'ArrowLeft' || key === 'arrowleft' || keyCode === 37) this.p2Controls.left = true;
        if (code === 'ArrowRight' || key === 'arrowright' || keyCode === 39) this.p2Controls.right = true;
        if (code === 'Numpad1' || code === 'KeyU' || key === 'u' || keyCode === 85) this.p2Controls.fire = true;
        if (code === 'Numpad2' || code === 'KeyI' || key === 'i' || keyCode === 73) this.p2Controls.jump = true;
        if (code === 'Numpad3' || code === 'KeyO' || key === 'o' || keyCode === 79) this.p2Controls.bomb = true;
      }

      // Borrow Life in 2P Mode: Dead player presses Jump/Fire
      if (this.mode === '2P' && this.state === 'PLAYING') {
        if (!this.players[0].isAlive && this.players[0].lives <= 0 && this.players[1].lives > 1) {
          if (this.p1Controls.fire || this.p1Controls.jump) {
            this.players[1].lives--;
            this.respawnPlayer(this.players[0]);
            this.players[0].lives = 1;
            soundManager.playPowerup();
            this.spawnTextParticle(this.players[0].x, this.players[0].y, '1P BORROWED LIFE!', '#38bdf8');
          }
        } else if (!this.players[1].isAlive && this.players[1].lives <= 0 && this.players[0].lives > 1) {
          if (this.p2Controls.fire || this.p2Controls.jump) {
            this.players[0].lives--;
            this.respawnPlayer(this.players[1]);
            this.players[1].lives = 1;
            soundManager.playPowerup();
            this.spawnTextParticle(this.players[1].x, this.players[1].y, '2P BORROWED LIFE!', '#f87171');
          }
        }
      }

      if (this.onControlsUpdate) this.onControlsUpdate();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = (e.key || '').toLowerCase();
      const code = e.code || '';
      const keyCode = e.keyCode || e.which || 0;

      this.activeKeys.delete(code || key);

      const is1P = this.mode === '1P';

      // 1. UP
      if (
        code === 'KeyW' || 
        key === 'w' || 
        keyCode === 87 || 
        (is1P && (code === 'ArrowUp' || key === 'arrowup' || keyCode === 38))
      ) {
        this.p1Controls.up = false;
      }

      // 2. DOWN
      if (
        code === 'KeyS' || 
        key === 's' || 
        keyCode === 83 || 
        (is1P && (code === 'ArrowDown' || key === 'arrowdown' || keyCode === 40))
      ) {
        this.p1Controls.down = false;
      }

      // 3. LEFT
      if (
        code === 'KeyA' || 
        key === 'a' || 
        keyCode === 65 || 
        (is1P && (code === 'ArrowLeft' || key === 'arrowleft' || keyCode === 37))
      ) {
        this.p1Controls.left = false;
      }

      // 4. RIGHT
      if (
        code === 'KeyD' || 
        key === 'd' || 
        keyCode === 68 || 
        (is1P && (code === 'ArrowRight' || key === 'arrowright' || keyCode === 39))
      ) {
        this.p1Controls.right = false;
      }

      // 5. JUMP
      if (
        code === 'Space' || 
        key === ' ' || 
        keyCode === 32 || 
        code === 'KeyK' || 
        key === 'k' || 
        keyCode === 75 || 
        code === 'KeyX' || 
        key === 'x' || 
        keyCode === 88
      ) {
        this.p1Controls.jump = false;
      }

      // 6. FIRE
      if (
        code === 'KeyJ' || 
        key === 'j' || 
        keyCode === 74 || 
        code === 'KeyZ' || 
        key === 'z' || 
        keyCode === 90 || 
        code === 'KeyF' || 
        key === 'f' || 
        keyCode === 70 || 
        (is1P && (code === 'Enter' || key === 'enter' || keyCode === 13 || code === 'Numpad0' || code === 'Numpad1'))
      ) {
        this.p1Controls.fire = false;
      }

      // 7. BOMB
      if (
        code === 'KeyL' || 
        key === 'l' || 
        keyCode === 76 || 
        code === 'KeyC' || 
        key === 'c' || 
        keyCode === 67 || 
        code === 'KeyB' || 
        key === 'b' || 
        keyCode === 66 || 
        code === 'ShiftLeft' || 
        keyCode === 16
      ) {
        this.p1Controls.bomb = false;
      }

      // 2P Mode
      if (!is1P) {
        if (code === 'ArrowUp' || key === 'arrowup' || keyCode === 38) this.p2Controls.up = false;
        if (code === 'ArrowDown' || key === 'arrowdown' || keyCode === 40) this.p2Controls.down = false;
        if (code === 'ArrowLeft' || key === 'arrowleft' || keyCode === 37) this.p2Controls.left = false;
        if (code === 'ArrowRight' || key === 'arrowright' || keyCode === 39) this.p2Controls.right = false;
        if (code === 'Numpad1' || code === 'KeyU' || key === 'u' || keyCode === 85) this.p2Controls.fire = false;
        if (code === 'Numpad2' || code === 'KeyI' || key === 'i' || keyCode === 73) this.p2Controls.jump = false;
        if (code === 'Numpad3' || code === 'KeyO' || key === 'o' || keyCode === 79) this.p2Controls.bomb = false;
      }

      if (this.onControlsUpdate) this.onControlsUpdate();
    };

    // Attach to window, document, and canvas with capture to ensure iframe events are intercepted
    window.addEventListener('keydown', handleKeyDown, { capture: true, passive: false });
    document.addEventListener('keydown', handleKeyDown, { capture: true, passive: false });
    this.canvas.addEventListener('keydown', handleKeyDown, { capture: true, passive: false });

    window.addEventListener('keyup', handleKeyUp, { capture: true, passive: false });
    document.addEventListener('keyup', handleKeyUp, { capture: true, passive: false });
    this.canvas.addEventListener('keyup', handleKeyUp, { capture: true, passive: false });

    // Use visibilitychange to only clear stuck keys when tab is truly hidden (not on momentary iframe blur)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.activeKeys.clear();
        this.p1Controls = { up: false, down: false, left: false, right: false, fire: false, jump: false, bomb: false };
        this.p2Controls = { up: false, down: false, left: false, right: false, fire: false, jump: false, bomb: false };
        if (this.onControlsUpdate) this.onControlsUpdate();
      }
    });

    // Mouse click & drag on canvas to aim & fire
    this.canvas.addEventListener('pointerdown', (e) => {
      soundManager.init();
      this.canvas.focus();
      const rect = this.canvas.getBoundingClientRect();
      const scale = this.canvas.height / 720;
      const clickX = (e.clientX - rect.left) / scale + this.cameraX;
      const clickY = (e.clientY - rect.top) / scale;

      const p1 = this.players[0];
      if (p1 && p1.isAlive) {
        const dx = clickX - (p1.x + p1.width / 2);
        const dy = clickY - (p1.y + p1.height / 2);
        if (Math.abs(dx) > 10) {
          p1.facing = dx > 0 ? 'right' : 'left';
        }
        if (dy < -20) {
          p1.aimDir = Math.abs(dx) < 35 ? { dx: 0, dy: -1 } : { dx: dx > 0 ? 1 : -1, dy: -1 };
        } else if (dy > 30 && !p1.isGrounded) {
          p1.aimDir = { dx: dx > 0 ? 1 : -1, dy: 1 };
        } else {
          p1.aimDir = { dx: p1.facing === 'right' ? 1 : -1, dy: 0 };
        }
      }
      this.p1Controls.fire = true;
      if (this.onControlsUpdate) this.onControlsUpdate();
    });

    this.canvas.addEventListener('pointerup', () => {
      this.p1Controls.fire = false;
      if (this.onControlsUpdate) this.onControlsUpdate();
    });
  }

  public getViewWidth(): number {
    const s = this.canvas.height / 720;
    return this.canvas.width / (s || 1);
  }

  public toggleAutoFire(): boolean {
    this.autoFire = !this.autoFire;
    soundManager.playPowerup();
    const text = this.autoFire ? '★ 自动开枪: 已开启 (AUTO-FIRE ON) ★' : '★ 自动开枪: 已关闭 (AUTO-FIRE OFF) ★';
    const color = this.autoFire ? '#f97316' : '#94a3b8';
    this.spawnTextParticle(this.cameraX + 400, 220, text, color);
    if (this.onPlayerStatUpdate) this.onPlayerStatUpdate();
    if (this.onControlsUpdate) this.onControlsUpdate();
    return this.autoFire;
  }

  public activateKonamiCode() {
    this.hasKonamiCode = true;
    soundManager.playKonamiJingle();
    this.players.forEach(p => {
      p.lives = 30;
    });
    this.spawnTextParticle(this.cameraX + 400, 200, '★ 30 LIVES ACTIVATED! ★', '#facc15');
    if (this.onPlayerStatUpdate) this.onPlayerStatUpdate();
  }

  // --- Start Game / Level ---
  public startLevel(levelId: number, mode?: GameMode, difficulty?: Difficulty) {
    if (mode) this.mode = mode;
    if (difficulty) this.difficulty = difficulty;
    this.currentLevelId = levelId;
    this.levelConfig = LEVELS.find(l => l.id === levelId) || LEVELS[0];

    soundManager.init();
    const defaultLives = this.hasKonamiCode ? 30 : this.difficulty === 'HARDCORE' ? 1 : this.difficulty === 'RECRUIT' ? 5 : 3;

    // Initialize Players
    const p1: Player = {
      id: 1,
      name: 'Bill Rizer (1P)',
      color: '#2563eb', // Blue pants
      accentColor: '#38bdf8',
      headbandColor: '#ffffff', // White bandana
      x: 180,
      y: 540,
      vx: 0,
      vy: 0,
      width: 32,
      height: 48,
      facing: 'right',
      aimAngle: 0,
      aimDir: { dx: 1, dy: 0 },
      isGrounded: false,
      isJumping: false,
      isCrouching: false,
      isSwimming: false,
      dropThroughTimer: 0,
      weapon: 'P',
      lives: defaultLives,
      score: this.players[0]?.score || 0,
      kills: this.players[0]?.kills || 0,
      isAlive: true,
      isInvulnerable: true,
      invulnerableTimer: 240,
      hasBarrier: false,
      barrierTimer: 0,
      respawnTimer: 0,
      fireCooldown: 0,
      bombs: 2,
      animationFrame: 0,
      animationTimer: 0,
    };

    this.players = [p1];

    if (this.mode === '2P') {
      const p2: Player = {
        id: 2,
        name: 'Lance Bean (2P)',
        color: '#dc2626', // Red pants
        accentColor: '#f87171',
        headbandColor: '#ef4444', // Red bandana
        x: 230,
        y: 540,
        vx: 0,
        vy: 0,
        width: 32,
        height: 48,
        facing: 'right',
        aimAngle: 0,
        aimDir: { dx: 1, dy: 0 },
        isGrounded: false,
        isJumping: false,
        isCrouching: false,
        isSwimming: false,
        dropThroughTimer: 0,
        weapon: 'P',
        lives: defaultLives,
        score: this.players[1]?.score || 0,
        kills: this.players[1]?.kills || 0,
        isAlive: true,
        isInvulnerable: true,
        invulnerableTimer: 240,
        hasBarrier: false,
        barrierTimer: 0,
        respawnTimer: 0,
        fireCooldown: 0,
        bombs: 2,
        animationFrame: 0,
        animationTimer: 0,
      };
      this.players.push(p2);
    }

    // Initialize Boss
    this.boss = createStageBoss(this.currentLevelId, this.levelConfig.bossTriggerX);

    // Populate Initial Enemies
    this.enemies = this.levelConfig.initialEnemies.map((e, idx) => ({
      ...e,
      id: Date.now() + idx,
      hitFlashTimer: 0,
    }));

    this.bullets = [];
    this.powerUps = [];
    this.particles = [];
    this.cameraX = 0;
    this.screenShake = 0;
    this.gameTime = 0;
    this.isPaused = false;
    this.state = 'PLAYING';

    // Start Stage BGM
    soundManager.playBGM(this.levelConfig.theme);

    if (this.onStateChange) this.onStateChange(this.state);
    if (this.onPlayerStatUpdate) this.onPlayerStatUpdate();

    this.startLoop();
  }

  // --- Game Loop ---
  private startLoop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.lastTime = performance.now();
    const loop = (time: number) => {
      this.update();
      this.render();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  public stopLoop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  // --- Main Update ---
  private update() {
    if (this.isPaused || this.state !== 'PLAYING') return;

    this.gameTime++;
    if (this.screenShake > 0) this.screenShake *= 0.9;

    // 1. Update Players
    this.players.forEach(p => this.updatePlayer(p));

    // 2. Camera Tracking
    this.updateCamera();

    // 3. Enemy Spawning & AI
    this.updateEnemies();

    // 4. Boss AI
    this.updateBoss();

    // 5. Bullets physics & collisions
    this.updateBullets();

    // 6. PowerUps pickup
    this.updatePowerUps();

    // 7. Particles
    this.updateParticles();

    // 8. Check Game Over / Stage Clear conditions
    this.checkGameFlow();
  }

  // --- Player Update ---
  private updatePlayer(player: Player) {
    if (!player.isAlive) {
      if (player.lives > 0) {
        player.respawnTimer--;
        if (player.respawnTimer <= 0) {
          this.respawnPlayer(player);
        }
      }
      return;
    }

    const controls = player.id === 1 ? this.p1Controls : this.p2Controls;

    // Invulnerability timer
    if (player.isInvulnerable) {
      player.invulnerableTimer--;
      if (player.invulnerableTimer <= 0) player.isInvulnerable = false;
    }

    // Barrier timer
    if (player.hasBarrier) {
      player.barrierTimer--;
      if (player.barrierTimer <= 0) player.hasBarrier = false;
    }

    // Drop through timer
    if (player.dropThroughTimer > 0) player.dropThroughTimer--;

    // Check Water immersion
    const inWater = this.levelConfig.waterZones.some(w => 
      player.x + player.width > w.x && 
      player.x < w.x + w.width && 
      player.y + player.height >= w.y + 10
    );
    player.isSwimming = inWater;

    // Aiming Direction Calculation
    let dx = 0;
    let dy = 0;
    if (controls.up) dy = -1;
    if (controls.down) dy = 1;
    if (controls.left) dx = -1;
    if (controls.right) dx = 1;

    if (dx !== 0) {
      player.facing = dx > 0 ? 'right' : 'left';
    }

    // Crouching: Down pressed while grounded
    if (controls.down && player.isGrounded && dx === 0 && !player.isSwimming) {
      player.isCrouching = true;
      player.aimDir = { dx: player.facing === 'right' ? 1 : -1, dy: 0 };
    } else {
      player.isCrouching = false;
      if (dx === 0 && dy === 0) {
        player.aimDir = { dx: player.facing === 'right' ? 1 : -1, dy: 0 };
      } else if (dx === 0 && dy === -1) {
        player.aimDir = { dx: 0, dy: -1 }; // Aim up
      } else if (dx !== 0 && dy === -1) {
        player.aimDir = { dx: dx, dy: -1 }; // Aim diagonal up
      } else if (dx !== 0 && dy === 1) {
        player.aimDir = { dx: dx, dy: 1 }; // Aim diagonal down
      } else {
        player.aimDir = { dx: dx, dy: 0 };
      }
    }

    // Movement: Left / Right
    const moveSpeed = player.isSwimming ? 2.2 : player.isCrouching ? 0 : 3.8;
    if (controls.left) {
      player.vx = -moveSpeed;
      player.animationFrame += 0.25;
    } else if (controls.right) {
      player.vx = moveSpeed;
      player.animationFrame += 0.25;
    } else {
      player.vx = 0;
    }

    // Jumping / Drop-through
    if (controls.jump && player.isGrounded) {
      if (controls.down) {
        // Drop down through semi-solid platform!
        player.dropThroughTimer = 18;
        player.y += 4;
        player.isGrounded = false;
      } else {
        // Classic acrobatic jump
        player.vy = -12.5;
        player.isGrounded = false;
        player.isJumping = true;
        soundManager.playJump();
      }
    }

    // Apply Gravity
    player.vy += 0.65;
    if (player.vy > 14) player.vy = 14;

    // Apply Velocity
    player.x += player.vx;
    player.y += player.vy;

    // Platform Collisions
    this.handlePlayerPlatformCollisions(player);

    // Screen Boundary Clamping (cannot move back past camera left edge)
    const viewW = this.getViewWidth();
    const minX = this.cameraX + 8;
    const maxX = this.cameraX + viewW - player.width - 8;
    if (player.x < minX) player.x = minX;
    if (player.x > maxX) player.x = maxX;

    // Firing Weapons (Manual or Automatic Continuous Shooting)
    if (player.fireCooldown > 0) player.fireCooldown--;

    const shouldFire = controls.fire || this.autoFire;
    if (shouldFire && player.fireCooldown <= 0) {
      this.fireWeapon(player);
    }

    // Screen Bomb / Special
    if (controls.bomb && player.bombs > 0) {
      player.bombs--;
      this.triggerBomb(player);
      controls.bomb = false; // consume press
    }

    // Pit Fall Death
    if (player.y > this.levelConfig.worldHeight + 50) {
      this.killPlayer(player);
    }
  }

  // --- Platform Collisions ---
  private handlePlayerPlatformCollisions(player: Player) {
    player.isGrounded = false;

    for (const p of this.levelConfig.platforms) {
      if (p.destroyed) return;

      const px = player.x + 6;
      const pw = player.width - 12;
      const py = player.y;
      const ph = player.height;

      // Conveyor speed adjustment
      if (p.type === 'conveyor_left' && player.isGrounded) player.x -= 1.5;
      if (p.type === 'conveyor_right' && player.isGrounded) player.x += 1.5;

      // Check horizontal overlap
      if (px + pw > p.x && px < p.x + p.width) {
        // Semi-solid & Bridge: only land on top when falling
        if (p.type === 'semi-solid' || p.type === 'bridge' || p.type.startsWith('conveyor')) {
          if (player.dropThroughTimer > 0) continue;
          const feet = py + ph;
          const prevFeet = feet - player.vy;

          if (prevFeet <= p.y + 4 && feet >= p.y) {
            player.y = p.y - ph;
            player.vy = 0;
            player.isGrounded = true;
            player.isJumping = false;
          }
        } else if (p.type === 'solid') {
          // Full solid platform
          const feet = py + ph;
          const prevFeet = feet - player.vy;
          if (prevFeet <= p.y + 8 && feet >= p.y) {
            player.y = p.y - ph;
            player.vy = 0;
            player.isGrounded = true;
            player.isJumping = false;
          }
        }
      }
    }
  }

  // --- Weapon Firing ---
  private fireWeapon(player: Player) {
    const aim = player.aimDir;
    const len = Math.hypot(aim.dx, aim.dy) || 1;
    const normX = aim.dx / len;
    const normY = aim.dy / len;

    const spawnX = player.x + player.width / 2 + normX * 18;
    const spawnY = player.y + (player.isCrouching ? player.height - 12 : player.height / 2 - 4) + normY * 18;
    const owner = player.id === 1 ? 'player1' : 'player2';

    if (player.weapon === 'P') {
      // Standard Rifle
      player.fireCooldown = 11;
      soundManager.playShootP();
      this.spawnShellCasing(spawnX, spawnY, normX);
      this.bullets.push({
        id: Date.now() + Math.random(),
        x: spawnX,
        y: spawnY,
        vx: normX * 11,
        vy: normY * 11,
        radius: 3.5,
        type: 'P',
        owner,
        damage: 1,
        penetration: 1,
        color: '#f8fafc',
        lifetime: 120
      });
    } else if (player.weapon === 'M') {
      // Machine Gun
      player.fireCooldown = 6;
      soundManager.playShootM();
      this.spawnShellCasing(spawnX, spawnY, normX);
      this.bullets.push({
        id: Date.now() + Math.random(),
        x: spawnX + (Math.random() - 0.5) * 4,
        y: spawnY + (Math.random() - 0.5) * 4,
        vx: normX * 13,
        vy: normY * 13,
        radius: 4,
        type: 'M',
        owner,
        damage: 1.2,
        penetration: 1,
        color: '#eab308',
        lifetime: 110
      });
    } else if (player.weapon === 'S') {
      // Spread Gun (5-way spread fan)
      player.fireCooldown = 18;
      soundManager.playShootS();
      const baseAngle = Math.atan2(normY, normX);
      const angles = [-0.28, -0.14, 0, 0.14, 0.28];

      angles.forEach(offset => {
        const a = baseAngle + offset;
        this.bullets.push({
          id: Date.now() + Math.random(),
          x: spawnX,
          y: spawnY,
          vx: Math.cos(a) * 11,
          vy: Math.sin(a) * 11,
          radius: 5.5,
          type: 'S',
          owner,
          damage: 1.5,
          penetration: 1,
          color: '#ef4444',
          lifetime: 120
        });
      });
    } else if (player.weapon === 'L') {
      // Laser Gun (High damage, pierces multiple enemies)
      player.fireCooldown = 10;
      soundManager.playShootL();
      this.bullets.push({
        id: Date.now() + Math.random(),
        x: spawnX,
        y: spawnY,
        vx: normX * 16,
        vy: normY * 16,
        radius: 6,
        type: 'L',
        owner,
        damage: 3.5,
        penetration: 4,
        color: '#38bdf8',
        lifetime: 100
      });
    } else if (player.weapon === 'F') {
      // Flame Gun (Spinning explosive fireball)
      player.fireCooldown = 16;
      soundManager.playShootF();
      this.bullets.push({
        id: Date.now() + Math.random(),
        x: spawnX,
        y: spawnY,
        vx: normX * 8.5,
        vy: normY * 8.5,
        radius: 8,
        type: 'F',
        owner,
        damage: 2.8,
        penetration: 2,
        color: '#f97316',
        lifetime: 140
      });
    }
  }

  // --- Screen Bomb ---
  private triggerBomb(player: Player) {
    this.screenShake = 22;
    soundManager.playExplosionBig();
    this.spawnTextParticle(this.cameraX + 400, 260, '★ TACTICAL AIRSTRIKE BOMB! ★', '#fbbf24');

    // Wipe all standard enemy bullets
    this.bullets = this.bullets.filter(b => b.owner !== 'enemy');

    // Damage all visible enemies
    this.enemies.forEach(e => {
      e.hp -= 15;
      e.hitFlashTimer = 10;
      if (e.hp <= 0) {
        player.score += e.scoreValue;
        player.kills++;
        this.spawnExplosion(e.x + e.width / 2, e.y + e.height / 2, 'big');
      }
    });

    // Damage boss if visible
    if (this.boss.active && !this.boss.defeated) {
      this.boss.hp -= 25;
      this.boss.hitFlashTimer = 15;
      this.boss.parts.forEach(p => { p.hp -= 15; p.hitFlashTimer = 15; });
    }
  }

  // --- Player Death & Respawn ---
  public killPlayer(player: Player) {
    if (!player.isAlive || player.isInvulnerable || player.hasBarrier) return;

    player.isAlive = false;
    player.lives--;
    player.weapon = 'P'; // Reset to standard rifle
    player.respawnTimer = 90; // 1.5 seconds

    soundManager.playPlayerDeath();
    this.spawnExplosion(player.x + player.width / 2, player.y + player.height / 2, 'big');

    if (this.onPlayerStatUpdate) this.onPlayerStatUpdate();
  }

  private respawnPlayer(player: Player) {
    player.isAlive = true;
    player.x = this.cameraX + (player.id === 1 ? 120 : 180);
    player.y = 80;
    player.vx = 0;
    player.vy = 2;
    player.isInvulnerable = true;
    player.invulnerableTimer = 180; // 3 seconds grace
    player.weapon = 'P';
  }

  // --- Camera Controller ---
  private updateCamera() {
    // If Boss Arena reached, lock camera onto arena
    if (this.cameraX >= this.levelConfig.bossTriggerX) {
      this.cameraX = this.levelConfig.bossTriggerX;
      if (!this.boss.active) {
        this.boss.active = true;
        soundManager.playBossWarning();
        soundManager.playBGM('boss');
        if (this.onBossWarning) this.onBossWarning();
      }
      return;
    }

    // Camera tracks rightmost active player
    const viewW = this.getViewWidth();
    const activePlayers = this.players.filter(p => p.isAlive);
    if (activePlayers.length > 0) {
      const avgX = activePlayers.reduce((sum, p) => sum + p.x, 0) / activePlayers.length;
      const targetCamX = avgX - viewW * 0.35;

      // Only scroll rightward (classic arcade progression)
      if (targetCamX > this.cameraX) {
        this.cameraX += (targetCamX - this.cameraX) * 0.08;
      }
    }

    // Clamp camera within world bounds
    const maxCamX = this.levelConfig.worldWidth - viewW;
    if (this.cameraX > maxCamX) this.cameraX = maxCamX;
  }

  // --- Enemies & Spawning ---
  private updateEnemies() {
    // Continuous random enemy spawner while advancing
    const viewW = this.getViewWidth();
    if (this.gameTime % this.levelConfig.spawnerInterval === 0 && this.cameraX < this.levelConfig.bossTriggerX) {
      // Spawn running grunt or winged capsule
      const spawnX = this.cameraX + viewW + 40;
      const isCapsule = Math.random() < 0.25;

      if (isCapsule) {
        const drops: WeaponType[] = ['M', 'S', 'L', 'F'];
        const randomDrop = drops[Math.floor(Math.random() * drops.length)];
        this.enemies.push({
          id: Date.now() + Math.random(),
          type: 'weapon_capsule',
          x: spawnX,
          y: 180 + Math.random() * 80,
          vx: -2.2,
          vy: 0,
          width: 36,
          height: 26,
          hp: 1,
          maxHp: 1,
          scoreValue: 200,
          facing: 'left',
          aimAngle: 0,
          attackTimer: 0,
          attackCooldown: 999,
          isGrounded: false,
          dropItem: randomDrop,
          hitFlashTimer: 0
        });
      } else {
        this.enemies.push({
          id: Date.now() + Math.random(),
          type: 'grunt',
          x: spawnX,
          y: 580,
          vx: -2.4,
          vy: 0,
          width: 32,
          height: 48,
          hp: 1,
          maxHp: 1,
          scoreValue: 100,
          facing: 'left',
          aimAngle: Math.PI,
          attackTimer: 0,
          attackCooldown: 120,
          isGrounded: true,
          hitFlashTimer: 0
        });
      }
    }

    // Update active enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (e.hitFlashTimer > 0) e.hitFlashTimer--;

      // Movement & Patrol
      if (e.type === 'weapon_capsule') {
        e.x += e.vx;
        e.y += Math.sin(this.gameTime * 0.08) * 1.5;
      } else if (e.type === 'grunt' || e.type === 'shield_soldier' || e.type === 'facehugger' || e.type === 'rolling_bomb') {
        e.x += e.vx;
        // Gravity
        e.vy += 0.5;
        e.y += e.vy;
        // Platform collision
        for (const p of this.levelConfig.platforms) {
          if (e.x + e.width > p.x && e.x < p.x + p.width && e.y + e.height >= p.y && e.y + e.height <= p.y + 16) {
            e.y = p.y - e.height;
            e.vy = 0;
            e.isGrounded = true;
          }
        }
      } else if (e.type === 'flying_drone') {
        e.x += e.vx;
        e.y += Math.sin(this.gameTime * 0.06) * 1.2;
      }

      // Attack AI for snipers and turrets
      const targetPlayer = this.getClosestPlayer(e.x, e.y);
      if (targetPlayer) {
        e.aimAngle = Math.atan2(targetPlayer.y - e.y, targetPlayer.x - e.x);
        e.facing = targetPlayer.x < e.x ? 'left' : 'right';

        e.attackTimer++;
        if (e.attackTimer >= e.attackCooldown) {
          e.attackTimer = 0;
          // Shoot at target if within reasonable range
          if (Math.abs(targetPlayer.x - e.x) < 550) {
            this.bullets.push({
              id: Date.now() + Math.random(),
              x: e.x + (e.facing === 'left' ? -6 : e.width + 6),
              y: e.y + e.height / 2,
              vx: Math.cos(e.aimAngle) * 4,
              vy: Math.sin(e.aimAngle) * 4,
              radius: 4,
              type: 'ENEMY',
              owner: 'enemy',
              damage: 1,
              penetration: 1,
              color: '#f43f5e',
              lifetime: 240
            });
          }
        }
      }

      // Enemy vs Player Body Collision
      this.players.forEach(p => {
        if (p.isAlive && !p.isInvulnerable && !p.hasBarrier) {
          if (
            p.x + p.width > e.x &&
            p.x < e.x + e.width &&
            p.y + p.height > e.y &&
            p.y < e.y + e.height
          ) {
            this.killPlayer(p);
          }
        }
      });

      // Remove enemies far off screen to left
      if (e.x < this.cameraX - 100 || e.y > this.levelConfig.worldHeight + 80) {
        this.enemies.splice(i, 1);
      }
    }
  }

  // --- Boss AI & Flow ---
  private updateBoss() {
    if (!this.boss.active || this.boss.defeated) return;

    const target = this.getClosestPlayer(this.boss.x, this.boss.y) || { x: this.cameraX + 200, y: 400 };
    const { addShake } = updateBossAI(
      this.boss,
      target.x,
      target.y,
      this.bullets,
      (newEnemy) => {
        this.enemies.push({
          id: Date.now() + Math.random(),
          type: newEnemy.type || 'rolling_bomb',
          x: newEnemy.x || this.boss.x,
          y: newEnemy.y || this.boss.y,
          vx: newEnemy.vx || -3,
          vy: newEnemy.vy || 0,
          width: newEnemy.width || 24,
          height: newEnemy.height || 24,
          hp: newEnemy.hp || 1,
          maxHp: newEnemy.maxHp || 1,
          scoreValue: newEnemy.scoreValue || 150,
          facing: 'left',
          aimAngle: Math.PI,
          attackTimer: 0,
          attackCooldown: 999,
          isGrounded: true,
          hitFlashTimer: 0
        });
      }
    );

    if (addShake) this.screenShake = addShake;

    // Check Boss Defeat
    if (this.boss.hp <= 0 && !this.boss.defeated) {
      this.boss.defeated = true;
      this.screenShake = 35;
      soundManager.playExplosionBig();
      soundManager.playStageClear();

      // Giant explosion particle cascade
      for (let i = 0; i < 25; i++) {
        setTimeout(() => {
          this.spawnExplosion(
            this.boss.x + Math.random() * this.boss.width,
            this.boss.y + Math.random() * this.boss.height,
            'big'
          );
        }, i * 80);
      }

      this.spawnTextParticle(this.cameraX + 400, 240, '★ STAGE CLEAR! ★', '#22c55e');

      setTimeout(() => {
        if (this.currentLevelId < 3) {
          this.state = 'STAGE_CLEAR';
        } else {
          this.state = 'VICTORY';
        }
        if (this.onStateChange) this.onStateChange(this.state);
      }, 3000);
    }
  }

  // --- Bullets Physics & Collision ---
  private updateBullets() {
    for (let bIdx = this.bullets.length - 1; bIdx >= 0; bIdx--) {
      const b = this.bullets[bIdx];
      b.x += b.vx;
      b.y += b.vy;
      b.lifetime--;

      // Remove expired bullets or bullets way off-screen
      if (b.lifetime <= 0 || b.x < this.cameraX - 50 || b.x > this.cameraX + this.canvas.width + 50) {
        this.bullets.splice(bIdx, 1);
        continue;
      }

      // Player Bullets hitting Enemies or Boss
      if (b.owner === 'player1' || b.owner === 'player2') {
        const shooter = b.owner === 'player1' ? this.players[0] : this.players[1];

        // 1. Check against enemies
        let hitSomething = false;
        for (let eIdx = this.enemies.length - 1; eIdx >= 0; eIdx--) {
          const e = this.enemies[eIdx];
          if (
            b.x >= e.x &&
            b.x <= e.x + e.width &&
            b.y >= e.y &&
            b.y <= e.y + e.height
          ) {
            e.hp -= b.damage;
            e.hitFlashTimer = 6;
            this.spawnExplosion(b.x, b.y, 'small');

            // Defeated enemy
            if (e.hp <= 0) {
              if (shooter) {
                shooter.score += e.scoreValue;
                shooter.kills++;
              }

              // Drop powerup if specified
              if (e.dropItem) {
                this.spawnPowerUp(e.x + e.width / 2, e.y + e.height / 2, e.dropItem);
              }

              soundManager.playExplosionSmall();
              this.enemies.splice(eIdx, 1);
            }

            b.penetration--;
            if (b.penetration <= 0) {
              hitSomething = true;
              break;
            }
          }
        }

        if (hitSomething) {
          this.bullets.splice(bIdx, 1);
          continue;
        }

        // 2. Check against Boss Sub-Parts
        if (this.boss.active && !this.boss.defeated) {
          let hitPart = false;
          for (const part of this.boss.parts) {
            if (
              part.hp > 0 &&
              b.x >= part.x &&
              b.x <= part.x + part.width &&
              b.y >= part.y &&
              b.y <= part.y + part.height
            ) {
              part.hp -= b.damage;
              part.hitFlashTimer = 6;
              this.spawnExplosion(b.x, b.y, 'small');
              if (part.hp <= 0) {
                if (shooter) shooter.score += part.scoreValue;
                soundManager.playExplosionBig();
                this.spawnExplosion(part.x + part.width / 2, part.y + part.height / 2, 'big');
              }
              hitPart = true;
              break;
            }
          }

          if (hitPart) {
            this.bullets.splice(bIdx, 1);
            continue;
          }

          // 3. Check against Main Boss Core
          if (
            b.x >= this.boss.x &&
            b.x <= this.boss.x + this.boss.width &&
            b.y >= this.boss.y &&
            b.y <= this.boss.y + this.boss.height
          ) {
            this.boss.hp -= b.damage;
            this.boss.hitFlashTimer = 6;
            this.spawnExplosion(b.x, b.y, 'small');

            b.penetration--;
            if (b.penetration <= 0) {
              this.bullets.splice(bIdx, 1);
              continue;
            }
          }
        }
      }

      // Enemy Bullets hitting Players
      else if (b.owner === 'enemy') {
        for (const p of this.players) {
          if (p.isAlive && !p.isInvulnerable && !p.hasBarrier) {
            // Check crouch / swim hit box reduction
            const hitH = p.isCrouching ? 20 : p.isSwimming ? 24 : p.height;
            const hitY = p.y + (p.height - hitH);

            if (
              b.x >= p.x &&
              b.x <= p.x + p.width &&
              b.y >= hitY &&
              b.y <= p.y + p.height
            ) {
              this.killPlayer(p);
              this.bullets.splice(bIdx, 1);
              break;
            }
          }
        }
      }
    }
  }

  // --- PowerUps ---
  private spawnPowerUp(x: number, y: number, type: WeaponType | 'B' | '1UP') {
    this.powerUps.push({
      id: Date.now() + Math.random(),
      type,
      x,
      y,
      vx: 0,
      vy: 1.5,
      width: 28,
      height: 28,
      isGrounded: false,
      flashTimer: 0
    });
  }

  private updatePowerUps() {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const item = this.powerUps[i];
      item.y += item.vy;

      // Platform collision
      for (const p of this.levelConfig.platforms) {
        if (item.x + item.width > p.x && item.x < p.x + p.width && item.y + item.height >= p.y && item.y + item.height <= p.y + 14) {
          item.y = p.y - item.height;
          item.vy = 0;
          item.isGrounded = true;
        }
      }

      // Check player collection
      for (const player of this.players) {
        if (player.isAlive) {
          if (
            player.x + player.width > item.x &&
            player.x < item.x + item.width &&
            player.y + player.height > item.y &&
            player.y < item.y + item.height
          ) {
            soundManager.playPowerup();

            if (item.type === 'B') {
              player.hasBarrier = true;
              player.barrierTimer = 600; // 10 seconds barrier!
              this.spawnTextParticle(player.x, player.y - 15, 'BARRIER ACTIVE!', '#10b981');
            } else if (item.type === '1UP') {
              player.lives++;
              this.spawnTextParticle(player.x, player.y - 15, '1UP EXTRA LIFE!', '#eab308');
            } else {
              player.weapon = item.type;
              const names: Record<string, string> = {
                'M': 'MACHINE GUN [M]!',
                'S': 'SPREAD GUN [S]!',
                'L': 'LASER BEAM [L]!',
                'F': 'FLAME GUN [F]!'
              };
              this.spawnTextParticle(player.x, player.y - 15, names[item.type] || 'POWER UP!', '#ef4444');
            }

            this.powerUps.splice(i, 1);
            break;
          }
        }
      }
    }
  }

  // --- Particles & FX ---
  private spawnExplosion(x: number, y: number, size: 'small' | 'big') {
    const count = size === 'big' ? 24 : 10;
    const speed = size === 'big' ? 7 : 4;
    const colors = ['#f43f5e', '#fbbf24', '#f97316', '#ffffff'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = Math.random() * speed;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        radius: Math.random() * (size === 'big' ? 6 : 3) + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.04 + 0.02,
        type: 'spark'
      });
    }

    if (size === 'big') {
      this.particles.push({
        x,
        y,
        vx: 0,
        vy: 0,
        radius: 8,
        color: '#facc15',
        alpha: 0.9,
        decay: 0.05,
        type: 'ring'
      });
    }
  }

  private spawnTextParticle(x: number, y: number, text: string, color: string) {
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: -1.2,
      radius: 0,
      color,
      alpha: 1,
      decay: 0.015,
      type: 'text',
      text
    });
  }

  private spawnShellCasing(x: number, y: number, facingDir: number) {
    this.particles.push({
      x: x - facingDir * 8,
      y: y - 2,
      vx: -facingDir * (Math.random() * 2 + 1.5) + (Math.random() - 0.5),
      vy: -Math.random() * 2.5 - 2,
      radius: 2,
      color: '#facc15',
      alpha: 1,
      decay: 0.04,
      type: 'debris'
    });
  }

  private updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;

      if (p.type === 'ring') p.radius += 3.5;
      if (p.type === 'debris') p.vy += 0.35; // Gravity on ejected shell casings

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  // --- Helpers ---
  private getClosestPlayer(x: number, y: number): Player | null {
    const alive = this.players.filter(p => p.isAlive);
    if (alive.length === 0) return null;
    let closest = alive[0];
    let minDist = Math.hypot(closest.x - x, closest.y - y);
    for (let i = 1; i < alive.length; i++) {
      const dist = Math.hypot(alive[i].x - x, alive[i].y - y);
      if (dist < minDist) {
        minDist = dist;
        closest = alive[i];
      }
    }
    return closest;
  }

  private checkGameFlow() {
    // Check All Players Dead
    const anyAliveOrRespawning = this.players.some(p => p.isAlive || p.lives > 0);
    if (!anyAliveOrRespawning) {
      this.state = 'GAME_OVER';
      soundManager.stopBGM();
      if (this.onStateChange) this.onStateChange(this.state);
    }
  }

  // --- Render Call ---
  public render() {
    this.renderer.render(
      this.cameraX,
      this.currentLevelId,
      this.levelConfig.theme,
      this.levelConfig.platforms,
      this.levelConfig.waterZones,
      this.players,
      this.enemies,
      this.boss,
      this.bullets,
      this.powerUps,
      this.particles,
      this.screenShake,
      this.gameTime
    );
  }

  public destroy() {
    this.stopLoop();
    soundManager.stopBGM();
  }
}
