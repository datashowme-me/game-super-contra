import { Boss, Bullet, Enemy } from './types';
import { soundManager } from './audio';

export function createStageBoss(levelId: number, arenaStartX: number): Boss {
  if (levelId === 1) {
    return {
      id: 'boss_stage_1',
      name: '堡垒重炮壁垒',
      title: 'DEFENSE WALL FORTRESS',
      x: arenaStartX + 420,
      y: 420,
      width: 140,
      height: 220,
      hp: 120,
      maxHp: 120,
      phase: 1,
      maxPhases: 2,
      active: false,
      defeated: false,
      invulnerable: false,
      hitFlashTimer: 0,
      patternTimer: 0,
      patternStep: 0,
      parts: [
        {
          id: 10001,
          type: 'turret',
          x: arenaStartX + 380,
          y: 460,
          vx: 0,
          vy: 0,
          width: 40,
          height: 36,
          hp: 30,
          maxHp: 30,
          scoreValue: 1000,
          facing: 'left',
          aimAngle: Math.PI,
          attackTimer: 20,
          attackCooldown: 80,
          isGrounded: true,
          hitFlashTimer: 0,
          customData: { name: '下层主炮' }
        },
        {
          id: 10002,
          type: 'turret',
          x: arenaStartX + 380,
          y: 340,
          vx: 0,
          vy: 0,
          width: 40,
          height: 36,
          hp: 30,
          maxHp: 30,
          scoreValue: 1000,
          facing: 'left',
          aimAngle: Math.PI,
          attackTimer: 60,
          attackCooldown: 80,
          isGrounded: true,
          hitFlashTimer: 0,
          customData: { name: '上层主炮' }
        },
        {
          id: 10003,
          type: 'sniper',
          x: arenaStartX + 440,
          y: 250,
          vx: 0,
          vy: 0,
          width: 32,
          height: 44,
          hp: 20,
          maxHp: 20,
          scoreValue: 800,
          facing: 'left',
          aimAngle: Math.PI,
          attackTimer: 40,
          attackCooldown: 70,
          isGrounded: true,
          hitFlashTimer: 0,
          customData: { name: '高台哨塔' }
        }
      ]
    };
  } else if (levelId === 2) {
    return {
      id: 'boss_stage_2',
      name: '泰坦重装机械蛛',
      title: 'TITAN MECH ARACNOID',
      x: arenaStartX + 350,
      y: 400,
      width: 160,
      height: 140,
      hp: 180,
      maxHp: 180,
      phase: 1,
      maxPhases: 2,
      active: false,
      defeated: false,
      invulnerable: false,
      hitFlashTimer: 0,
      patternTimer: 0,
      patternStep: 0,
      parts: []
    };
  } else {
    // Stage 3: Alien Core
    return {
      id: 'boss_stage_3',
      name: '异形魔脑终极核心',
      title: 'GIGA ALIEN BRAIN & HELL HEART',
      x: arenaStartX + 400,
      y: 360,
      width: 150,
      height: 180,
      hp: 250,
      maxHp: 250,
      phase: 1,
      maxPhases: 3,
      active: false,
      defeated: false,
      invulnerable: false,
      hitFlashTimer: 0,
      patternTimer: 0,
      patternStep: 0,
      parts: []
    };
  }
}

export function updateBossAI(
  boss: Boss,
  targetX: number,
  targetY: number,
  bullets: Bullet[],
  spawnEnemy: (enemy: Partial<Enemy>) => void
): { addShake?: number } {
  if (!boss.active || boss.defeated) return {};
  boss.patternTimer++;

  if (boss.hitFlashTimer > 0) {
    boss.hitFlashTimer--;
  }

  // Update sub-parts hit flash
  boss.parts.forEach(part => {
    if (part.hitFlashTimer > 0) part.hitFlashTimer--;
    // sub-parts attack nearest target
    part.attackTimer++;
    if (part.hp > 0 && part.attackTimer >= part.attackCooldown) {
      part.attackTimer = 0;
      const angle = Math.atan2(targetY - part.y, targetX - part.x);
      bullets.push({
        id: Date.now() + Math.random(),
        x: part.x - 10,
        y: part.y + 10,
        vx: Math.cos(angle) * 4.5,
        vy: Math.sin(angle) * 4.5,
        radius: 5,
        type: 'ENEMY',
        owner: 'enemy',
        damage: 1,
        penetration: 1,
        color: '#ff3366',
        lifetime: 300
      });
    }
  });

  // Check phase change
  if (boss.hp < boss.maxHp * 0.5 && boss.phase === 1) {
    boss.phase = 2;
    soundManager.playBossWarning();
  }

  let addShake = 0;

  // Boss 1 AI: Fortress Wall
  if (boss.id === 'boss_stage_1') {
    // Core pulsing cannon fire
    if (boss.patternTimer % 110 === 0) {
      // Fires triple red energy orbs
      [-0.25, 0, 0.25].forEach(offset => {
        const angle = Math.PI + offset;
        bullets.push({
          id: Date.now() + Math.random(),
          x: boss.x - 20,
          y: boss.y + 20,
          vx: Math.cos(angle) * 5,
          vy: Math.sin(angle) * 5,
          radius: 7,
          type: 'BOSS_FIRE',
          owner: 'enemy',
          damage: 1,
          penetration: 1,
          color: '#f43f5e',
          lifetime: 300
        });
      });
    }

    // Phase 2: spawn rolling bombs down the ramp
    if (boss.phase === 2 && boss.patternTimer % 140 === 0) {
      spawnEnemy({
        type: 'rolling_bomb',
        x: boss.x - 40,
        y: boss.y + 120,
        vx: -3.5,
        vy: 0,
        width: 24,
        height: 24,
        hp: 1,
        maxHp: 1,
        scoreValue: 150,
        isGrounded: true
      });
    }
  }

  // Boss 2 AI: Titan Mech Spider
  else if (boss.id === 'boss_stage_2') {
    // Oscillate up and down / stomping
    const stepTime = boss.patternTimer % 300;
    if (stepTime < 100) {
      // Hovering & firing plasma spread
      boss.y = 350 + Math.sin(boss.patternTimer * 0.05) * 50;
      if (boss.patternTimer % 45 === 0) {
        const spreadCount = boss.phase === 2 ? 5 : 3;
        for (let i = 0; i < spreadCount; i++) {
          const spreadAngle = Math.PI - 0.4 + (i * 0.8) / (spreadCount - 1);
          bullets.push({
            id: Date.now() + Math.random(),
            x: boss.x - 40,
            y: boss.y + 20,
            vx: Math.cos(spreadAngle) * 5.5,
            vy: Math.sin(spreadAngle) * 5.5,
            radius: 6,
            type: 'BOSS_LASER',
            owner: 'enemy',
            damage: 1,
            penetration: 1,
            color: '#38bdf8',
            lifetime: 280
          });
        }
      }
    } else if (stepTime === 160) {
      // Heavy stomp on ground!
      boss.y = 500;
      addShake = 12;
      soundManager.playExplosionBig();
      // Shockwave bullets left and right
      bullets.push({
        id: Date.now() + Math.random(),
        x: boss.x - 50,
        y: 620,
        vx: -6,
        vy: 0,
        radius: 8,
        type: 'ENEMY_HEAVY',
        owner: 'enemy',
        damage: 1,
        penetration: 1,
        color: '#fbbf24',
        lifetime: 150
      });
    } else if (stepTime > 180 && stepTime < 240) {
      // Returning up
      boss.y += (350 - boss.y) * 0.08;
    }

    // Phase 2: Launch homing flying drone
    if (boss.phase === 2 && boss.patternTimer % 180 === 0) {
      spawnEnemy({
        type: 'flying_drone',
        x: boss.x - 20,
        y: boss.y - 40,
        vx: -2.5,
        vy: 0.5,
        width: 32,
        height: 28,
        hp: 4,
        maxHp: 4,
        scoreValue: 300,
        isGrounded: false
      });
    }
  }

  // Boss 3 AI: Giga Alien Hive Brain
  else if (boss.id === 'boss_stage_3') {
    // Pulsing organic breathing
    const pulse = Math.sin(boss.patternTimer * 0.08);
    boss.height = 180 + pulse * 14;
    boss.width = 150 - pulse * 8;

    // Spiral bio-spore volley
    if (boss.patternTimer % 35 === 0) {
      const angle = (boss.patternTimer * 0.12) % (Math.PI * 2);
      bullets.push({
        id: Date.now() + Math.random(),
        x: boss.x - 20,
        y: boss.y,
        vx: Math.cos(angle) * 4,
        vy: Math.sin(angle) * 4,
        radius: 6,
        type: 'BOSS_FIRE',
        owner: 'enemy',
        damage: 1,
        penetration: 1,
        color: '#a855f7',
        lifetime: 300
      });
    }

    // Direct aimed bio-tentacle projectile
    if (boss.patternTimer % 90 === 0) {
      const angle = Math.atan2(targetY - boss.y, targetX - boss.x);
      bullets.push({
        id: Date.now() + Math.random(),
        x: boss.x - 30,
        y: boss.y + 10,
        vx: Math.cos(angle) * 6,
        vy: Math.sin(angle) * 6,
        radius: 9,
        type: 'ENEMY_HEAVY',
        owner: 'enemy',
        damage: 1,
        penetration: 1,
        color: '#ec4899',
        lifetime: 250
      });
    }

    // Hatch facehugger minions
    if (boss.patternTimer % 150 === 0) {
      spawnEnemy({
        type: 'facehugger',
        x: boss.x - 60,
        y: boss.y + 60,
        vx: -4,
        vy: -3,
        width: 28,
        height: 24,
        hp: 2,
        maxHp: 2,
        scoreValue: 200,
        isGrounded: false
      });
    }
  }

  return { addShake };
}
