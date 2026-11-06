import { LevelConfig, Platform, WaterZone } from './types';

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: '第 1 关: 密林瀑布 (Jungle Outpost)',
    subtitle: '红隼战机盘旋，突破敌军丛林防御线',
    description: '经典的丛林密林与瀑布水域，注意水下隐蔽与高台狙击手，末端遭遇基地重炮壁垒。',
    worldWidth: 4200,
    worldHeight: 720,
    theme: 'jungle',
    bgGradient: ['#0f2e24', '#071813', '#030a08'],
    bossTriggerX: 3600,
    bossArenaWidth: 600,
    spawnerInterval: 120,
    waterZones: [
      { x: 750, y: 640, width: 450, height: 80 },
      { x: 1950, y: 640, width: 400, height: 80 },
    ],
    platforms: [
      // Ground sections
      { x: 0, y: 640, width: 750, height: 80, type: 'solid', color: '#2d6a4f' },
      { x: 1200, y: 640, width: 750, height: 80, type: 'solid', color: '#2d6a4f' },
      { x: 2350, y: 640, width: 1850, height: 80, type: 'solid', color: '#2d6a4f' },

      // Water bridge
      { x: 750, y: 550, width: 220, height: 16, type: 'semi-solid', color: '#744210' },
      { x: 970, y: 550, width: 230, height: 16, type: 'semi-solid', color: '#744210' },

      // Jungle elevated rock platforms & trees
      { x: 250, y: 500, width: 160, height: 18, type: 'semi-solid', color: '#386641' },
      { x: 450, y: 400, width: 200, height: 18, type: 'semi-solid', color: '#386641' },
      { x: 1300, y: 510, width: 180, height: 18, type: 'semi-solid', color: '#386641' },
      { x: 1550, y: 410, width: 220, height: 18, type: 'semi-solid', color: '#386641' },
      { x: 1850, y: 320, width: 150, height: 18, type: 'semi-solid', color: '#386641' },

      // Second bridge
      { x: 1950, y: 560, width: 400, height: 16, type: 'semi-solid', color: '#744210' },

      // High rock fortress approach
      { x: 2450, y: 520, width: 180, height: 18, type: 'semi-solid', color: '#386641' },
      { x: 2700, y: 420, width: 200, height: 18, type: 'semi-solid', color: '#386641' },
      { x: 2950, y: 320, width: 180, height: 18, type: 'semi-solid', color: '#386641' },
      { x: 3200, y: 450, width: 220, height: 18, type: 'semi-solid', color: '#386641' },

      // Boss Arena Platforms
      { x: 3620, y: 520, width: 160, height: 18, type: 'semi-solid', color: '#4a5568' },
      { x: 3820, y: 420, width: 160, height: 18, type: 'semi-solid', color: '#4a5568' },
    ],
    initialEnemies: [
      // Early weapon capsule for player to power up
      { type: 'weapon_capsule', x: 280, y: 220, vx: 2, vy: 0, width: 36, height: 26, hp: 1, maxHp: 1, scoreValue: 200, facing: 'right', aimAngle: 0, attackTimer: 0, attackCooldown: 999, isGrounded: false, dropItem: 'S' },
      
      // Patrol grunts & ledge snipers positioned fairly
      { type: 'grunt', x: 720, y: 600, vx: -1.8, vy: 0, width: 32, height: 48, hp: 1, maxHp: 1, scoreValue: 100, facing: 'left', aimAngle: Math.PI, attackTimer: 0, attackCooldown: 120, isGrounded: true },
      { type: 'sniper', x: 620, y: 360, vx: 0, vy: 0, width: 32, height: 48, hp: 2, maxHp: 2, scoreValue: 200, facing: 'left', aimAngle: Math.PI, attackTimer: 60, attackCooldown: 100, isGrounded: true },
      
      { type: 'turret', x: 1400, y: 480, vx: 0, vy: 0, width: 36, height: 32, hp: 5, maxHp: 5, scoreValue: 500, facing: 'left', aimAngle: Math.PI, attackTimer: 20, attackCooldown: 100, isGrounded: true },
      { type: 'grunt', x: 1600, y: 600, vx: -2.2, vy: 0, width: 32, height: 48, hp: 1, maxHp: 1, scoreValue: 100, facing: 'left', aimAngle: Math.PI, attackTimer: 0, attackCooldown: 120, isGrounded: true },
      { type: 'weapon_capsule', x: 1700, y: 200, vx: 2, vy: 0, width: 36, height: 26, hp: 1, maxHp: 1, scoreValue: 200, facing: 'right', aimAngle: 0, attackTimer: 0, attackCooldown: 999, isGrounded: false, dropItem: 'S' },
      
      { type: 'rolling_bomb', x: 2100, y: 530, vx: -3, vy: 0, width: 24, height: 24, hp: 1, maxHp: 1, scoreValue: 150, facing: 'left', aimAngle: Math.PI, attackTimer: 0, attackCooldown: 999, isGrounded: true },
      { type: 'sniper', x: 2780, y: 380, vx: 0, vy: 0, width: 32, height: 48, hp: 2, maxHp: 2, scoreValue: 200, facing: 'left', aimAngle: Math.PI, attackTimer: 30, attackCooldown: 85, isGrounded: true },
      { type: 'turret', x: 3000, y: 290, vx: 0, vy: 0, width: 36, height: 32, hp: 5, maxHp: 5, scoreValue: 500, facing: 'left', aimAngle: Math.PI, attackTimer: 10, attackCooldown: 90, isGrounded: true },
      { type: 'weapon_capsule', x: 3100, y: 180, vx: 2, vy: 0, width: 36, height: 26, hp: 1, maxHp: 1, scoreValue: 200, facing: 'right', aimAngle: 0, attackTimer: 0, attackCooldown: 999, isGrounded: false, dropItem: 'L' },
      { type: 'weapon_capsule', x: 3450, y: 240, vx: 2, vy: 0, width: 36, height: 26, hp: 1, maxHp: 1, scoreValue: 200, facing: 'right', aimAngle: 0, attackTimer: 0, attackCooldown: 999, isGrounded: false, dropItem: 'B' },
    ]
  },
  {
    id: 2,
    name: '第 2 关: 机械基地 (Iron Fortress)',
    subtitle: '突入高科技重工核心，摧毁泰坦机械蛛',
    description: '钢铁工业基地，充满传送带、激光感应装置与重盾精兵，关底遭遇泰坦机械巨蛛。',
    worldWidth: 4400,
    worldHeight: 720,
    theme: 'tech_base',
    bgGradient: ['#1e1b4b', '#0f172a', '#020617'],
    bossTriggerX: 3750,
    bossArenaWidth: 650,
    spawnerInterval: 100,
    waterZones: [],
    platforms: [
      // Base solid flooring
      { x: 0, y: 640, width: 4400, height: 80, type: 'solid', color: '#334155' },

      // Conveyor belts & metal catwalks
      { x: 300, y: 520, width: 260, height: 18, type: 'conveyor_right', color: '#64748b' },
      { x: 650, y: 420, width: 220, height: 18, type: 'conveyor_left', color: '#64748b' },
      { x: 950, y: 320, width: 240, height: 18, type: 'semi-solid', color: '#475569' },
      { x: 1250, y: 480, width: 280, height: 18, type: 'conveyor_right', color: '#64748b' },
      { x: 1600, y: 380, width: 240, height: 18, type: 'semi-solid', color: '#475569' },

      { x: 1950, y: 500, width: 260, height: 18, type: 'conveyor_left', color: '#64748b' },
      { x: 2300, y: 400, width: 260, height: 18, type: 'semi-solid', color: '#475569' },
      { x: 2650, y: 310, width: 220, height: 18, type: 'conveyor_right', color: '#64748b' },
      { x: 2950, y: 450, width: 280, height: 18, type: 'semi-solid', color: '#475569' },
      { x: 3300, y: 360, width: 260, height: 18, type: 'semi-solid', color: '#475569' },

      // Boss Arena Catwalks
      { x: 3800, y: 510, width: 180, height: 18, type: 'semi-solid', color: '#64748b' },
      { x: 4050, y: 390, width: 200, height: 18, type: 'semi-solid', color: '#64748b' },
    ],
    initialEnemies: [
      { type: 'shield_soldier', x: 550, y: 590, vx: -1.2, vy: 0, width: 36, height: 50, hp: 8, maxHp: 8, scoreValue: 400, facing: 'left', aimAngle: Math.PI, attackTimer: 30, attackCooldown: 110, isGrounded: true },
      { type: 'flying_drone', x: 800, y: 250, vx: -1.8, vy: 0.5, width: 32, height: 28, hp: 3, maxHp: 3, scoreValue: 250, facing: 'left', aimAngle: Math.PI, attackTimer: 45, attackCooldown: 80, isGrounded: false },
      { type: 'weapon_capsule', x: 400, y: 190, vx: 2, vy: 0, width: 36, height: 26, hp: 1, maxHp: 1, scoreValue: 200, facing: 'right', aimAngle: 0, attackTimer: 0, attackCooldown: 999, isGrounded: false, dropItem: 'F' },

      { type: 'turret', x: 1000, y: 290, vx: 0, vy: 0, width: 36, height: 32, hp: 6, maxHp: 6, scoreValue: 500, facing: 'left', aimAngle: Math.PI, attackTimer: 10, attackCooldown: 80, isGrounded: true },
      { type: 'rolling_bomb', x: 1450, y: 450, vx: -3.5, vy: 0, width: 24, height: 24, hp: 1, maxHp: 1, scoreValue: 150, facing: 'left', aimAngle: Math.PI, attackTimer: 0, attackCooldown: 999, isGrounded: true },
      { type: 'weapon_capsule', x: 1500, y: 220, vx: 2, vy: 0, width: 36, height: 26, hp: 1, maxHp: 1, scoreValue: 200, facing: 'right', aimAngle: 0, attackTimer: 0, attackCooldown: 999, isGrounded: false, dropItem: 'S' },

      { type: 'shield_soldier', x: 2100, y: 590, vx: -1.2, vy: 0, width: 36, height: 50, hp: 8, maxHp: 8, scoreValue: 400, facing: 'left', aimAngle: Math.PI, attackTimer: 20, attackCooldown: 100, isGrounded: true },
      { type: 'sniper', x: 2400, y: 360, vx: 0, vy: 0, width: 32, height: 48, hp: 3, maxHp: 3, scoreValue: 300, facing: 'left', aimAngle: Math.PI, attackTimer: 15, attackCooldown: 70, isGrounded: true },
      { type: 'flying_drone', x: 2800, y: 200, vx: -2, vy: 0.8, width: 32, height: 28, hp: 4, maxHp: 4, scoreValue: 250, facing: 'left', aimAngle: Math.PI, attackTimer: 25, attackCooldown: 75, isGrounded: false },
      { type: 'weapon_capsule', x: 2900, y: 160, vx: 2, vy: 0, width: 36, height: 26, hp: 1, maxHp: 1, scoreValue: 200, facing: 'right', aimAngle: 0, attackTimer: 0, attackCooldown: 999, isGrounded: false, dropItem: 'L' },
      { type: 'weapon_capsule', x: 3500, y: 220, vx: 2, vy: 0, width: 36, height: 26, hp: 1, maxHp: 1, scoreValue: 200, facing: 'right', aimAngle: 0, attackTimer: 0, attackCooldown: 999, isGrounded: false, dropItem: 'B' },
    ]
  },
  {
    id: 3,
    name: '第 3 关: 异形母巢 (Alien Hive Nest)',
    subtitle: '潜入生化巢穴深渊，直面异形母脑核心',
    description: '生体异质粘液洞窟，胞囊不断孵化幼体抱脸虫，最深处盘踞着异形终极母脑心脏。',
    worldWidth: 4600,
    worldHeight: 720,
    theme: 'alien_nest',
    bgGradient: ['#3b0764', '#1f0933', '#09010f'],
    bossTriggerX: 3850,
    bossArenaWidth: 700,
    spawnerInterval: 80,
    waterZones: [],
    platforms: [
      // Organic flesh ground
      { x: 0, y: 640, width: 4600, height: 80, type: 'solid', color: '#581c87' },

      // Tendon and bone bridges
      { x: 280, y: 510, width: 220, height: 20, type: 'semi-solid', color: '#7e22ce' },
      { x: 580, y: 390, width: 240, height: 20, type: 'semi-solid', color: '#7e22ce' },
      { x: 920, y: 480, width: 200, height: 20, type: 'semi-solid', color: '#7e22ce' },
      { x: 1220, y: 360, width: 260, height: 20, type: 'semi-solid', color: '#7e22ce' },
      { x: 1580, y: 460, width: 220, height: 20, type: 'semi-solid', color: '#7e22ce' },

      { x: 1900, y: 340, width: 240, height: 20, type: 'semi-solid', color: '#7e22ce' },
      { x: 2240, y: 480, width: 260, height: 20, type: 'semi-solid', color: '#7e22ce' },
      { x: 2600, y: 380, width: 240, height: 20, type: 'semi-solid', color: '#7e22ce' },
      { x: 2940, y: 470, width: 260, height: 20, type: 'semi-solid', color: '#7e22ce' },
      { x: 3300, y: 350, width: 280, height: 20, type: 'semi-solid', color: '#7e22ce' },

      // Boss Arena Platforms
      { x: 3900, y: 500, width: 180, height: 20, type: 'semi-solid', color: '#9333ea' },
      { x: 4180, y: 380, width: 200, height: 20, type: 'semi-solid', color: '#9333ea' },
    ],
    initialEnemies: [
      { type: 'alien_pod', x: 620, y: 350, vx: 0, vy: 0, width: 44, height: 40, hp: 10, maxHp: 10, scoreValue: 600, facing: 'left', aimAngle: 0, attackTimer: 30, attackCooldown: 120, isGrounded: true },
      { type: 'facehugger', x: 800, y: 600, vx: -3, vy: 0, width: 28, height: 24, hp: 2, maxHp: 2, scoreValue: 200, facing: 'left', aimAngle: Math.PI, attackTimer: 0, attackCooldown: 60, isGrounded: true },
      { type: 'weapon_capsule', x: 400, y: 180, vx: 2, vy: 0, width: 36, height: 26, hp: 1, maxHp: 1, scoreValue: 200, facing: 'right', aimAngle: 0, attackTimer: 0, attackCooldown: 999, isGrounded: false, dropItem: 'S' },

      { type: 'alien_pod', x: 1300, y: 320, vx: 0, vy: 0, width: 44, height: 40, hp: 10, maxHp: 10, scoreValue: 600, facing: 'left', aimAngle: 0, attackTimer: 40, attackCooldown: 110, isGrounded: true },
      { type: 'flying_drone', x: 1500, y: 220, vx: -2.2, vy: 0.6, width: 32, height: 28, hp: 4, maxHp: 4, scoreValue: 300, facing: 'left', aimAngle: Math.PI, attackTimer: 20, attackCooldown: 60, isGrounded: false },
      { type: 'weapon_capsule', x: 1700, y: 160, vx: 2, vy: 0, width: 36, height: 26, hp: 1, maxHp: 1, scoreValue: 200, facing: 'right', aimAngle: 0, attackTimer: 0, attackCooldown: 999, isGrounded: false, dropItem: 'L' },

      { type: 'alien_pod', x: 2300, y: 440, vx: 0, vy: 0, width: 44, height: 40, hp: 12, maxHp: 12, scoreValue: 600, facing: 'left', aimAngle: 0, attackTimer: 20, attackCooldown: 100, isGrounded: true },
      { type: 'facehugger', x: 2700, y: 600, vx: -3.5, vy: 0, width: 28, height: 24, hp: 2, maxHp: 2, scoreValue: 200, facing: 'left', aimAngle: Math.PI, attackTimer: 0, attackCooldown: 50, isGrounded: true },
      { type: 'weapon_capsule', x: 2800, y: 190, vx: 2, vy: 0, width: 36, height: 26, hp: 1, maxHp: 1, scoreValue: 200, facing: 'right', aimAngle: 0, attackTimer: 0, attackCooldown: 999, isGrounded: false, dropItem: 'F' },
      { type: 'weapon_capsule', x: 3400, y: 180, vx: 2, vy: 0, width: 36, height: 26, hp: 1, maxHp: 1, scoreValue: 200, facing: 'right', aimAngle: 0, attackTimer: 0, attackCooldown: 999, isGrounded: false, dropItem: 'B' },
    ]
  }
];
