export type GameState = 
  | 'TITLE'
  | 'LEVEL_SELECT'
  | 'PLAYING'
  | 'PAUSED'
  | 'STAGE_CLEAR'
  | 'GAME_OVER'
  | 'VICTORY';

export type GameMode = '1P' | '2P';

export type Difficulty = 'RECRUIT' | 'VETERAN' | 'HARDCORE';

export type WeaponType = 'P' | 'M' | 'S' | 'L' | 'F';

export interface PlayerControls {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  fire: boolean;
  jump: boolean;
  bomb: boolean;
}

export interface KeyBindings {
  up: string[];
  down: string[];
  left: string[];
  right: string[];
  fire: string[];
  jump: string[];
  bomb: string[];
}

export interface Player {
  id: 1 | 2;
  name: string;
  color: string;
  accentColor: string;
  headbandColor: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 'left' | 'right';
  aimAngle: number; // in radians or direct direction
  aimDir: { dx: number; dy: number };
  isGrounded: boolean;
  isJumping: boolean;
  isCrouching: boolean;
  isSwimming: boolean;
  dropThroughTimer: number; // for semi-solid platforms
  weapon: WeaponType;
  lives: number;
  score: number;
  kills: number;
  isAlive: boolean;
  isInvulnerable: boolean;
  invulnerableTimer: number;
  hasBarrier: boolean;
  barrierTimer: number;
  respawnTimer: number;
  fireCooldown: number;
  bombs: number;
  animationFrame: number;
  animationTimer: number;
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: WeaponType | 'ENEMY' | 'ENEMY_HEAVY' | 'BOSS_LASER' | 'BOSS_FIRE';
  owner: 'player1' | 'player2' | 'enemy';
  damage: number;
  penetration: number;
  color: string;
  lifetime: number;
  spinAngle?: number;
}

export type EnemyType = 
  | 'grunt' 
  | 'sniper' 
  | 'turret' 
  | 'rolling_bomb' 
  | 'flying_drone' 
  | 'alien_pod' 
  | 'facehugger' 
  | 'shield_soldier' 
  | 'weapon_capsule' 
  | 'wall_core' 
  | 'boss_part';

export interface Enemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  scoreValue: number;
  facing: 'left' | 'right';
  aimAngle: number;
  attackTimer: number;
  attackCooldown: number;
  isGrounded: boolean;
  isInvulnerable?: boolean;
  dropItem?: WeaponType | 'B' | '1UP';
  hitFlashTimer: number;
  customData?: Record<string, any>;
}

export interface Boss {
  id: string;
  name: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  phase: number;
  maxPhases: number;
  active: boolean;
  defeated: boolean;
  parts: Enemy[];
  patternTimer: number;
  patternStep: number;
  invulnerable: boolean;
  hitFlashTimer: number;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'solid' | 'semi-solid' | 'bridge' | 'conveyor_left' | 'conveyor_right';
  color?: string;
  destroyed?: boolean;
}

export interface WaterZone {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PowerUpItem {
  id: number;
  type: WeaponType | 'B' | '1UP';
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isGrounded: boolean;
  flashTimer: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  type: 'spark' | 'smoke' | 'fire' | 'debris' | 'text' | 'ring';
  text?: string;
}

export interface LevelConfig {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  worldWidth: number;
  worldHeight: number;
  theme: 'jungle' | 'tech_base' | 'alien_nest';
  bgGradient: string[];
  platforms: Platform[];
  waterZones: WaterZone[];
  bossTriggerX: number;
  bossArenaWidth: number;
  initialEnemies: Omit<Enemy, 'id' | 'hitFlashTimer'>[];
  spawnerInterval: number; // in frames
}
