import { Boss, Bullet, Enemy, Particle, Platform, Player, PowerUpItem, WaterZone } from './types';
import { spriteForge } from './SpriteForge';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public render(
    cameraX: number,
    levelId: number,
    theme: 'jungle' | 'tech_base' | 'alien_nest',
    platforms: Platform[],
    waterZones: WaterZone[],
    players: Player[],
    enemies: Enemy[],
    boss: Boss,
    bullets: Bullet[],
    powerUps: PowerUpItem[],
    particles: Particle[],
    screenShake: number,
    gameTime: number
  ) {
    const ctx = this.ctx;
    ctx.save();

    // Screen Shake
    if (screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * screenShake;
      const shakeY = (Math.random() - 0.5) * screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // Compute optimal 720-height world coordinate scale
    const baseHeight = 720;
    const scale = this.height / baseHeight;

    // 1. Draw Scenic Parallax Background
    this.drawBackground(cameraX, theme, gameTime, scale);

    // Camera offset & scaling for world objects
    ctx.save();
    ctx.scale(scale, scale);
    ctx.translate(-cameraX, 0);

    ctx.imageSmoothingEnabled = false;

    // 2. Draw Platforms & Terrain
    this.drawPlatforms(platforms, theme, gameTime);

    // 3. Draw Water Zones & Waterfall (Stage 1)
    this.drawWaterZones(waterZones, gameTime);

    // 4. Draw PowerUp Items
    this.drawPowerUps(powerUps, gameTime);

    // 5. Draw Enemies with SpriteForge
    this.drawEnemies(enemies, gameTime);

    // 6. Draw Boss with 16-bit Master Sprites
    if (boss.active && !boss.defeated) {
      this.drawBoss(boss, gameTime);
    }

    // 7. Draw Players with SpriteForge 16-bit Commando Animations
    players.forEach(player => {
      if (player.isAlive) {
        this.drawPlayer(player, gameTime);
      } else if (player.lives > 0) {
        this.drawRespawningPlayer(player, gameTime);
      }
    });

    // 8. Draw Bullets & Muzzle Flashes
    this.drawBullets(bullets, gameTime);

    // 9. Draw Particles & Effects
    this.drawParticles(particles);

    ctx.restore(); // Restore world camera & scale

    // 10. Draw Screen-Space HUD & Boss Bar
    this.drawHUD(players, boss, levelId);

    ctx.restore(); // Restore screen shake
  }

  // --- Parallax Background ---
  private drawBackground(cameraX: number, theme: 'jungle' | 'tech_base' | 'alien_nest', gameTime: number, scale: number = 1) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Check if preloaded high-res stage background is available from SpriteForge
    const bgKey = theme === 'jungle' ? 'stage_jungle' : theme === 'tech_base' ? 'stage_tech_base' : 'stage_alien_nest';
    const bgImg = spriteForge.getImage(bgKey);

    if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
      // High-resolution authentic arcade background with subtle parallax scrolling
      const imgRatio = bgImg.naturalWidth / bgImg.naturalHeight;
      const bgW = Math.max(w, h * imgRatio);
      const parallaxSpeed = 0.28 * scale;
      const offsetX = (cameraX * parallaxSpeed) % bgW;

      ctx.drawImage(bgImg, -offsetX, 0, bgW, h);
      if (-offsetX + bgW < w) {
        ctx.drawImage(bgImg, -offsetX + bgW, 0, bgW, h);
      }

      // Add atmospheric tint gradient to integrate with foreground
      if (theme === 'jungle') {
        const jungleOverlay = ctx.createLinearGradient(0, 0, 0, h);
        jungleOverlay.addColorStop(0, 'rgba(4, 30, 20, 0.2)');
        jungleOverlay.addColorStop(1, 'rgba(2, 18, 12, 0.35)');
        ctx.fillStyle = jungleOverlay;
        ctx.fillRect(0, 0, w, h);

        // Animated waterfall spray effect in jungle stage
        const waterfallX = (1400 - cameraX * 0.5) * scale;
        if (waterfallX > -100 && waterfallX < w + 100) {
          ctx.fillStyle = 'rgba(125, 211, 252, 0.4)';
          ctx.fillRect(waterfallX, 100 * scale, 36 * scale, 480 * scale);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          const foamY = (100 + (gameTime * 12) % 460) * scale;
          ctx.fillRect(waterfallX - 4 * scale, foamY, 44 * scale, 6 * scale);
        }
      } else if (theme === 'tech_base') {
        const techOverlay = ctx.createLinearGradient(0, 0, 0, h);
        techOverlay.addColorStop(0, 'rgba(15, 23, 42, 0.2)');
        techOverlay.addColorStop(1, 'rgba(2, 6, 23, 0.45)');
        ctx.fillStyle = techOverlay;
        ctx.fillRect(0, 0, w, h);
      } else {
        const alienOverlay = ctx.createLinearGradient(0, 0, 0, h);
        alienOverlay.addColorStop(0, 'rgba(30, 10, 45, 0.25)');
        alienOverlay.addColorStop(1, 'rgba(59, 7, 100, 0.4)');
        ctx.fillStyle = alienOverlay;
        ctx.fillRect(0, 0, w, h);
      }
      return;
    }

    if (theme === 'jungle') {
      // Deep tropical evening sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#0a1d17');
      skyGrad.addColorStop(0.5, '#134e38');
      skyGrad.addColorStop(1, '#062016');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Distant mountains (slow scroll: 0.1x)
      ctx.fillStyle = '#08251b';
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 120) {
        const mx = x - ((cameraX * 0.1) % 120);
        const my = 260 + Math.sin((x + cameraX * 0.1) * 0.005) * 60;
        ctx.lineTo(mx, my);
      }
      ctx.lineTo(w, h);
      ctx.fill();

      // Midground Jungle Canopy & Palm Silhouettes (0.3x)
      ctx.fillStyle = '#0d3829';
      for (let x = -100; x < w + 200; x += 90) {
        const px = x - ((cameraX * 0.3) % 90);
        ctx.beginPath();
        ctx.arc(px, 420, 60, Math.PI, Math.PI * 2);
        ctx.fill();
        // Trunk
        ctx.fillRect(px - 6, 420, 12, 220);
      }

      // Waterfall in background if around camera range
      const waterfallX = 1400 - cameraX * 0.6;
      if (waterfallX > -100 && waterfallX < w + 100) {
        ctx.fillStyle = 'rgba(125, 211, 252, 0.45)';
        ctx.fillRect(waterfallX, 180, 48, 460);
        // Foam ripples & splash spray
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        const foamY = 180 + (gameTime * 14) % 460;
        ctx.fillRect(waterfallX - 5, foamY, 58, 8);
      }

    } else if (theme === 'tech_base') {
      // Tech Base sci-fi industrial night
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#020617');
      skyGrad.addColorStop(0.7, '#0f172a');
      skyGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Distant industrial silos and towers (0.15x)
      ctx.fillStyle = '#111827';
      for (let x = 0; x < w + 200; x += 140) {
        const bx = x - ((cameraX * 0.15) % 140);
        ctx.fillRect(bx, 200, 70, 440);
        // Tower red antenna light
        if (Math.sin(gameTime * 0.1 + x) > 0) {
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(bx + 35, 195, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#111827';
        }
      }

      // Midground conduits & pipes (0.35x)
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(0, 340);
      ctx.lineTo(w, 340);
      ctx.stroke();

      // Cyber neon warning lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 348);
      ctx.lineTo(w, 348);
      ctx.stroke();

    } else {
      // Alien Hive pulsating biomechanical walls
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#1a0429');
      skyGrad.addColorStop(0.6, '#2e1065');
      skyGrad.addColorStop(1, '#3b0764');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Biomechanical spine ribs (0.2x)
      ctx.fillStyle = '#170524';
      for (let x = 0; x < w + 160; x += 80) {
        const rx = x - ((cameraX * 0.2) % 80);
        ctx.beginPath();
        ctx.ellipse(rx, 300, 35, 180, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Pulsing alien veins
      const veinGlow = 0.35 + Math.sin(gameTime * 0.05) * 0.25;
      ctx.strokeStyle = `rgba(236, 72, 153, ${veinGlow})`;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(0, 400 + Math.sin(gameTime * 0.02) * 20);
      for (let x = 0; x < w; x += 60) {
        ctx.lineTo(x, 400 + Math.sin((x + cameraX * 0.3) * 0.01) * 35);
      }
      ctx.stroke();
    }
  }

  // --- Terrain & Platforms ---
  private drawPlatforms(platforms: Platform[], theme: string, gameTime: number) {
    const ctx = this.ctx;

    platforms.forEach(p => {
      if (p.destroyed) return;

      if (p.type === 'solid') {
        if (theme === 'jungle') {
          // Multi-layer jungle terrain: lush grass fronds, moss layer, dark loam
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(p.x, p.y, p.width, 10);
          ctx.fillStyle = '#15803d';
          ctx.fillRect(p.x, p.y + 10, p.width, 8);
          ctx.fillStyle = '#1c1917';
          ctx.fillRect(p.x, p.y + 18, p.width, p.height - 18);

          // Detailed individual grass blades
          ctx.fillStyle = '#86efac';
          for (let gx = p.x; gx < p.x + p.width; gx += 12) {
            ctx.beginPath();
            ctx.moveTo(gx, p.y);
            ctx.lineTo(gx + 3, p.y - 6);
            ctx.lineTo(gx + 6, p.y);
            ctx.fill();
          }

          // Hanging jungle vines
          ctx.strokeStyle = '#166534';
          ctx.lineWidth = 2;
          for (let vx = p.x + 20; vx < p.x + p.width; vx += 70) {
            ctx.beginPath();
            ctx.moveTo(vx, p.y + 16);
            ctx.quadraticCurveTo(vx + 6, p.y + 36, vx - 2, p.y + 44);
            ctx.stroke();
          }

        } else if (theme === 'tech_base') {
          // Steel plating with industrial hazard caution diagonal stripes
          ctx.fillStyle = '#334155';
          ctx.fillRect(p.x, p.y, p.width, p.height);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(p.x, p.y + 14, p.width, p.height - 14);

          // Top diamond tread steel rim
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(p.x, p.y, p.width, 3);

          // Caution Hazard Yellow-Black stripes along side
          ctx.save();
          ctx.beginPath();
          ctx.rect(p.x, p.y + 3, p.width, 10);
          ctx.clip();
          for (let sx = p.x - 20; sx < p.x + p.width + 20; sx += 20) {
            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.moveTo(sx, p.y + 3);
            ctx.lineTo(sx + 10, p.y + 3);
            ctx.lineTo(sx, p.y + 13);
            ctx.lineTo(sx - 10, p.y + 13);
            ctx.fill();

            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.moveTo(sx + 10, p.y + 3);
            ctx.lineTo(sx + 20, p.y + 3);
            ctx.lineTo(sx + 10, p.y + 13);
            ctx.lineTo(sx, p.y + 13);
            ctx.fill();
          }
          ctx.restore();

          // Steel rivets
          ctx.fillStyle = '#e2e8f0';
          for (let bx = p.x + 12; bx < p.x + p.width; bx += 36) {
            ctx.fillRect(bx, p.y + 16, 4, 4);
          }

        } else {
          // Organic Alien Chitin Flesh
          ctx.fillStyle = '#7e22ce';
          ctx.fillRect(p.x, p.y, p.width, p.height);
          ctx.fillStyle = '#581c87';
          ctx.fillRect(p.x, p.y + 10, p.width, p.height - 10);

          // Bioluminescent alien slime edge
          ctx.fillStyle = '#d946ef';
          ctx.fillRect(p.x, p.y, p.width, 4);

          // Dripping slime filaments
          ctx.fillStyle = '#e879f9';
          for (let dx = p.x + 18; dx < p.x + p.width; dx += 45) {
            const dripLen = 8 + Math.sin((dx + gameTime * 2) * 0.1) * 6;
            ctx.fillRect(dx, p.y + 10, 3, dripLen);
          }
        }
      } else if (p.type === 'semi-solid' || p.type === 'bridge') {
        // Wood Suspension Bridge / Metal Catwalk
        ctx.fillStyle = p.color || '#854d0e';
        ctx.fillRect(p.x, p.y, p.width, p.height);

        // Highlight upper plank
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fillRect(p.x, p.y, p.width, 3);

        // Planks separation lines & rope binders
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        for (let px = p.x + 16; px < p.x + p.width; px += 24) {
          ctx.fillRect(px, p.y, 2, p.height);
        }
      } else if (p.type === 'conveyor_left' || p.type === 'conveyor_right') {
        // Moving Conveyor Belts
        ctx.fillStyle = '#334155';
        ctx.fillRect(p.x, p.y, p.width, p.height);
        ctx.fillStyle = '#f59e0b';
        // Moving rollers
        const offset = ((gameTime * (p.type === 'conveyor_left' ? -3 : 3)) % 20 + 20) % 20;
        for (let cx = p.x + offset; cx < p.x + p.width; cx += 20) {
          ctx.fillRect(cx, p.y + 2, 8, p.height - 4);
        }
      }
    });
  }

  // --- Water Zones ---
  private drawWaterZones(waterZones: WaterZone[], gameTime: number) {
    const ctx = this.ctx;
    waterZones.forEach(w => {
      // Shimmering translucent blue water
      ctx.fillStyle = 'rgba(14, 116, 144, 0.7)';
      ctx.fillRect(w.x, w.y, w.width, w.height);

      // Water surface wave animation
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(w.x, w.y);
      for (let x = w.x; x <= w.x + w.width; x += 15) {
        const wave = Math.sin((x + gameTime * 4) * 0.05) * 3;
        ctx.lineTo(x, w.y + wave);
      }
      ctx.lineTo(w.x + w.width, w.y + 6);
      ctx.lineTo(w.x, w.y + 6);
      ctx.fill();
    });
  }

  // --- PowerUp Items & Weapon Pods ---
  private drawPowerUps(powerUps: PowerUpItem[], gameTime: number) {
    const ctx = this.ctx;
    powerUps.forEach(item => {
      const pulse = 1 + Math.sin(gameTime * 0.15) * 0.1;
      const r = (item.width / 2) * pulse;

      ctx.save();
      ctx.translate(item.x + item.width / 2, item.y + item.height / 2);

      const colorMap: Record<string, string> = {
        'M': '#3b82f6', // Blue Machine Gun
        'S': '#ef4444', // Red Spread Gun
        'L': '#06b6d4', // Cyan Laser
        'F': '#f97316', // Orange Flame
        'B': '#10b981', // Emerald Barrier
        '1UP': '#eab308' // Gold Extra Life
      };

      const baseColor = colorMap[item.type] || '#ffffff';

      // Outer glow
      ctx.shadowColor = baseColor;
      ctx.shadowBlur = 12;

      ctx.fillStyle = baseColor;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Golden Falcon border ring
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Letter inside
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.type, 0, 1);

      ctx.restore();
    });
  }

  // --- Player Rendering via SpriteForge ---
  private drawPlayer(player: Player, gameTime: number) {
    const ctx = this.ctx;
    ctx.save();

    // Invulnerability Flashing
    if (player.isInvulnerable && Math.floor(gameTime / 4) % 2 === 0) {
      ctx.globalAlpha = 0.35;
    }

    // Barrier Forcefield Bubble
    if (player.hasBarrier) {
      const shieldGlow = 0.6 + Math.sin(gameTime * 0.2) * 0.3;
      ctx.strokeStyle = `rgba(52, 211, 153, ${shieldGlow})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.height * 0.65, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.fill();
    }

    // Call Agent Sprite Forge 16-Bit Commando Pipeline
    spriteForge.drawCommando(
      ctx,
      player.id,
      player.x,
      player.y,
      player.width,
      player.height,
      player.facing,
      player.aimDir,
      player.isGrounded,
      player.isJumping,
      player.isCrouching,
      player.isSwimming,
      player.animationFrame,
      gameTime
    );

    ctx.restore();
  }

  // --- Parachuting Respawn Animation ---
  private drawRespawningPlayer(player: Player, gameTime: number) {
    const ctx = this.ctx;
    ctx.save();
    const progress = Math.max(0, Math.min(1, 1 - (player.respawnTimer / 90)));
    const targetY = 540;
    const dropY = 40 + progress * (targetY - 40);
    const dropX = player.x;

    // Draw White Parachute Canopy
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(dropX + player.width / 2, dropY - 26, 26, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Red Falcon Stripe on Parachute
    ctx.fillStyle = player.id === 1 ? '#3b82f6' : '#ef4444';
    ctx.beginPath();
    ctx.arc(dropX + player.width / 2, dropY - 26, 12, Math.PI, 0);
    ctx.fill();

    // Suspension cords
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(dropX + player.width / 2 - 24, dropY - 26);
    ctx.lineTo(dropX + player.width / 2 - 6, dropY - 6);
    ctx.moveTo(dropX + player.width / 2 + 24, dropY - 26);
    ctx.lineTo(dropX + player.width / 2 + 6, dropY - 6);
    ctx.stroke();

    // Commando Sprite hanging from parachute
    spriteForge.drawCommando(
      ctx,
      player.id,
      dropX,
      dropY,
      player.width,
      player.height,
      player.facing,
      { dx: 0, dy: 1 },
      false,
      false,
      false,
      false,
      0,
      gameTime
    );

    ctx.restore();
  }

  // --- Enemies Rendering via SpriteForge ---
  private drawEnemies(enemies: Enemy[], gameTime: number) {
    const ctx = this.ctx;

    enemies.forEach(enemy => {
      // Hit flash
      if (enemy.hitFlashTimer > 0) {
        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, enemy.width, enemy.height);
        ctx.restore();
        return;
      }

      if (enemy.type === 'weapon_capsule') {
        spriteForge.drawWeaponCapsule(ctx, enemy.x, enemy.y, enemy.width, enemy.height, enemy.dropItem || 'S', gameTime);
      } else if (enemy.type === 'grunt') {
        spriteForge.drawGrunt(ctx, enemy, gameTime);
      } else if (enemy.type === 'sniper') {
        spriteForge.drawSniper(ctx, enemy, gameTime);
      } else if (enemy.type === 'turret') {
        spriteForge.drawTurret(ctx, enemy);
      } else {
        // Fallback procedural rendering for other enemies
        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        const isLeft = enemy.facing === 'left';
        if (isLeft && enemy.type !== 'wall_core') {
          ctx.scale(-1, 1);
          ctx.translate(-enemy.width, 0);
        }

        const w = enemy.width;
        const h = enemy.height;

        if (enemy.type === 'rolling_bomb') {
          const angle = (gameTime * 0.25) % (Math.PI * 2);
          ctx.translate(w / 2, h / 2);
          ctx.rotate(angle);
          ctx.fillStyle = '#e11d48';
          ctx.beginPath();
          ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          for (let i = 0; i < 6; i++) {
            const a = (i * Math.PI) / 3;
            ctx.fillRect(Math.cos(a) * (w / 2 - 2), Math.sin(a) * (w / 2 - 2), 4, 4);
          }
        } else if (enemy.type === 'flying_drone') {
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(4, 8, w - 8, h - 16);
          const rotorGlow = Math.sin(gameTime * 0.8) > 0 ? '#ffffff' : '#64748b';
          ctx.fillStyle = rotorGlow;
          ctx.fillRect(0, 4, 8, 3);
          ctx.fillRect(w - 8, 4, 8, 3);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(w / 2 - 3, h / 2 - 2, 6, 4);
        } else if (enemy.type === 'shield_soldier') {
          ctx.fillStyle = '#1e3a8a';
          ctx.fillRect(w / 2 - 10, h - 38, 16, 22);
          ctx.fillStyle = '#fed7aa';
          ctx.fillRect(w / 2 - 8, h - 48, 12, 10);
          ctx.fillStyle = '#64748b';
          ctx.fillRect(w - 12, h - 45, 12, 42);
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2;
          ctx.strokeRect(w - 12, h - 45, 12, 42);
        } else if (enemy.type === 'alien_pod') {
          const pulse = Math.sin(gameTime * 0.1) * 3;
          ctx.fillStyle = '#701a75';
          ctx.beginPath();
          ctx.ellipse(w / 2, h / 2, w / 2 + pulse, h / 2 - pulse, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 3;
          ctx.stroke();
        } else if (enemy.type === 'facehugger') {
          ctx.fillStyle = '#f472b6';
          ctx.beginPath();
          ctx.ellipse(w / 2, h / 2, 10, 6, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#db2777';
          ctx.lineWidth = 2;
          for (let i = -1; i <= 1; i++) {
            const legMove = Math.sin(gameTime * 0.5 + i) * 4;
            ctx.beginPath();
            ctx.moveTo(w / 2 + i * 6, h / 2);
            ctx.lineTo(w / 2 + i * 8, h / 2 + 8 + legMove);
            ctx.stroke();
          }
        }
        ctx.restore();
      }
    });
  }

  // --- Boss Rendering via SpriteForge ---
  private drawBoss(boss: Boss, gameTime: number) {
    const ctx = this.ctx;
    spriteForge.drawBoss(ctx, boss, gameTime);
  }

  // --- Bullets Rendering with Dynamic Glow & Muzzle Flash ---
  private drawBullets(bullets: Bullet[], gameTime: number) {
    const ctx = this.ctx;

    bullets.forEach(b => {
      ctx.save();
      ctx.translate(b.x, b.y);

      if (b.type === 'S') {
        // Spread Gun: Fiery red glowing plasma ball with halo
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(0, 0, b.radius * 0.55, 0, Math.PI * 2);
        ctx.fill();

      } else if (b.type === 'L') {
        // Laser Gun: Intense Piercing Electric Cyan Beam
        const angle = Math.atan2(b.vy, b.vx);
        ctx.rotate(angle);

        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;

        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-22, -b.radius, 44, b.radius * 2);

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-18, -b.radius * 0.5, 36, b.radius);

      } else if (b.type === 'F') {
        // Flame Gun: Rotating fireball cluster with spinning sparks
        const spin = (gameTime * 0.45) % (Math.PI * 2);
        ctx.rotate(spin);

        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 12;

        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(7, 0, b.radius * 0.8, 0, Math.PI * 2);
        ctx.arc(-7, 0, b.radius * 0.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(0, 0, b.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();

      } else if (b.type === 'M') {
        // Machine Gun: Rapid stream with bright tracer
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, b.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();

      } else if (b.type === 'P') {
        // Standard Pistol / Rifle Pellet
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
        ctx.fill();

      } else {
        // Enemy Bullets / Red plasma orbs
        ctx.fillStyle = b.color || '#f43f5e';
        ctx.beginPath();
        ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, b.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  // --- Particles Rendering ---
  private drawParticles(particles: Particle[]) {
    const ctx = this.ctx;
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);

      if (p.type === 'text' && p.text) {
        ctx.fillStyle = p.color;
        ctx.font = 'bold 12px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(p.text, p.x, p.y);
      } else if (p.type === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  // --- Screen-Space HUD & Boss Bar ---
  private drawHUD(players: Player[], boss: Boss, levelId: number) {
    const ctx = this.ctx;
    ctx.save();

    const p1 = players[0];
    const p2 = players[1];

    ctx.font = '10px "Press Start 2P", monospace';

    // P1 Stats (Left)
    if (p1) {
      ctx.fillStyle = '#38bdf8'; // Blue P1
      ctx.fillText('1P BILL', 24, 26);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${p1.score.toString().padStart(7, '0')}`, 24, 44);

      // Lives icon
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`LIVES: ${Math.max(0, p1.lives)}`, 24, 62);

      // Weapon badge
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(`GUN: [${p1.weapon}]`, 24, 80);
    }

    // P2 Stats (Right)
    if (p2) {
      ctx.fillStyle = '#f87171'; // Red P2
      ctx.textAlign = 'right';
      ctx.fillText('2P LANCE', this.width - 24, 26);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${p2.score.toString().padStart(7, '0')}`, this.width - 24, 44);

      ctx.fillStyle = '#f87171';
      ctx.fillText(`LIVES: ${Math.max(0, p2.lives)}`, this.width - 24, 62);

      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(`GUN: [${p2.weapon}]`, this.width - 24, 80);
      ctx.textAlign = 'left';
    }

    // Stage Info Center
    ctx.fillStyle = '#facc15';
    ctx.textAlign = 'center';
    ctx.fillText(`STAGE 0${levelId}`, this.width / 2, 28);
    ctx.textAlign = 'left';

    // Boss Health Bar (if active and not defeated)
    if (boss.active && !boss.defeated && boss.hp > 0) {
      const barW = Math.min(380, this.width - 120);
      const barH = 14;
      const barX = (this.width - barW) / 2;
      const barY = 50;

      // Boss Name
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 9px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`BOSS: ${boss.name} (${boss.title})`, this.width / 2, barY - 8);

      // Background Frame
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(barX - 2, barY - 2, barW + 4, barH + 4);

      // HP Fill
      const ratio = Math.max(0, boss.hp / boss.maxHp);
      const hpW = barW * ratio;

      const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
      grad.addColorStop(0, '#f43f5e');
      grad.addColorStop(1, '#e11d48');
      ctx.fillStyle = grad;
      ctx.fillRect(barX, barY, hpW, barH);
    }

    ctx.restore();
  }
}
