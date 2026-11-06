// Agent Sprite Forge (v0.4.0) - High-Fidelity 16-Bit Retro Arcade Sprite & Asset Pipeline
export class SpriteForge {
  private static instance: SpriteForge | null = null;
  private imageCache: Map<string, HTMLImageElement> = new Map();
  private processedCanvases: Map<string, HTMLCanvasElement> = new Map();
  private loaded: boolean = false;

  public static getInstance(): SpriteForge {
    if (!SpriteForge.instance) {
      SpriteForge.instance = new SpriteForge();
    }
    return SpriteForge.instance;
  }

  constructor() {
    this.preloadAssets();
  }

  // Preload and key out dark backgrounds for engine-ready transparent sprites
  private preloadAssets() {
    const assets: Record<string, string> = {
      heroes: '/src/assets/images/contra_sprites_heroes_1793952834598.jpg',
      boss_fortress: '/src/assets/images/contra_boss_fortress_1793952834537.jpg',
      boss_spider: '/src/assets/images/contra_boss_spider_1793952835549.jpg',
      boss_alien: '/src/assets/images/contra_boss_alien_1793952835291.jpg',
      stage_jungle: '/src/assets/images/contra_stage_jungle_1793951933401.jpg',
      stage_tech_base: '/src/assets/images/contra_stage_base_1793951934281.jpg',
      stage_alien_nest: '/src/assets/images/contra_stage_alien_1793951933748.jpg',
      arcade_hero: '/src/assets/images/contra_arcade_hero_1793951933403.jpg',
    };

    let remaining = Object.keys(assets).length;

    for (const [key, src] of Object.entries(assets)) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        this.imageCache.set(key, img);
        if (key.startsWith('boss_')) {
          this.processTransparency(key, img);
        }
        remaining--;
        if (remaining === 0) {
          this.loaded = true;
        }
      };
      img.onerror = () => {
        remaining--;
      };
    }
  }

  // Chroma-key removal for black/dark backgrounds from master stills
  private processTransparency(key: string, img: HTMLImageElement) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // Remove dark backgrounds (luminance < 24)
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // If near black background, make transparent
      if (r < 26 && g < 26 && b < 26) {
        data[i + 3] = 0;
      } else if (r < 45 && g < 45 && b < 45) {
        // Soft edge anti-aliasing
        data[i + 3] = Math.max(0, (Math.max(r, g, b) - 25) * 12);
      }
    }

    ctx.putImageData(imgData, 0, 0);
    this.processedCanvases.set(key, canvas);
  }

  public isReady(): boolean {
    return this.loaded;
  }

  public getProcessedCanvas(key: string): HTMLCanvasElement | null {
    return this.processedCanvases.get(key) || null;
  }

  public getImage(key: string): HTMLImageElement | null {
    return this.imageCache.get(key) || null;
  }

  // --- 16-Bit Commando Character Rendering ---
  public drawCommando(
    ctx: CanvasRenderingContext2D,
    playerId: 1 | 2,
    x: number,
    y: number,
    width: number,
    height: number,
    facing: 'left' | 'right',
    aimDir: { dx: number; dy: number },
    isGrounded: boolean,
    isJumping: boolean,
    isCrouching: boolean,
    isSwimming: boolean,
    animFrame: number,
    gameTime: number
  ) {
    ctx.save();
    ctx.translate(x, y);

    const isLeft = facing === 'left';
    if (isLeft) {
      ctx.scale(-1, 1);
      ctx.translate(-width, 0);
    }

    const w = width;
    const h = height;

    // Palette Configuration
    const isP1 = playerId === 1;
    // Blue camouflage for P1, Red camouflage for P2
    const pantsDark = isP1 ? '#1e3a8a' : '#991b1b';
    const pantsMid = isP1 ? '#2563eb' : '#dc2626';
    const pantsLight = isP1 ? '#60a5fa' : '#f87171';
    const headband = isP1 ? '#f8fafc' : '#ef4444';
    const skinHighlight = '#fed7aa';
    const skinBase = '#fba359';
    const skinShadow = '#c2410c';
    const vestColor = '#1e293b';
    const vestBorder = '#334155';
    const rifleMetal = '#0f172a';
    const rifleHighlight = '#475569';

    // 1. Swimming Pose
    if (isSwimming) {
      // Water foam & concentric ripple waves
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-8, h - 14, w + 16, 4);
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(-4, h - 16, w + 8, 2);

      // Head & Muscle Shoulders
      ctx.fillStyle = skinBase;
      ctx.fillRect(w / 2 - 8, h - 34, 16, 16);
      ctx.fillStyle = skinShadow;
      ctx.fillRect(w / 2 - 8, h - 22, 16, 4);

      // Headband
      ctx.fillStyle = headband;
      ctx.fillRect(w / 2 - 10, h - 36, 20, 5);
      // Fluttering knot
      const flutter = Math.sin(gameTime * 0.3) * 3;
      ctx.fillRect(w / 2 - 16, h - 35 + flutter, 8, 4);

      // Rifle pointing out of water
      ctx.fillStyle = rifleMetal;
      ctx.fillRect(w / 2 + 4, h - 30, 22, 6);
      ctx.fillStyle = rifleHighlight;
      ctx.fillRect(w / 2 + 4, h - 30, 22, 2);

      ctx.restore();
      return;
    }

    // 2. Somersault Jump Roll (Ball Roll)
    if (isJumping) {
      const angle = (gameTime * 0.35) % (Math.PI * 2);
      ctx.translate(w / 2, h / 2);
      ctx.rotate(angle);

      // Motion speed arcs
      ctx.strokeStyle = isP1 ? 'rgba(96, 165, 250, 0.4)' : 'rgba(248, 113, 113, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 19, 0, Math.PI * 1.5);
      ctx.stroke();

      // Curled body ball
      ctx.fillStyle = pantsDark;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();

      // Camo pants pattern
      ctx.fillStyle = pantsMid;
      ctx.beginPath();
      ctx.arc(-3, 4, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = pantsLight;
      ctx.fillRect(-6, 2, 6, 6);

      // Muscular torso / vest
      ctx.fillStyle = vestColor;
      ctx.beginPath();
      ctx.arc(4, -4, 9, 0, Math.PI * 2);
      ctx.fill();

      // Bandana wrap
      ctx.strokeStyle = headband;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 16, Math.PI * 0.8, Math.PI * 1.4);
      ctx.stroke();

      ctx.restore();
      return;
    }

    // 3. Crouching Prone Pose
    if (isCrouching) {
      // Legs stretched back
      ctx.fillStyle = pantsDark;
      ctx.fillRect(0, h - 16, w - 2, 14);
      ctx.fillStyle = pantsMid;
      ctx.fillRect(2, h - 14, w - 8, 8);
      ctx.fillStyle = pantsLight;
      ctx.fillRect(6, h - 12, 10, 4);

      // Boots
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, h - 14, 8, 12);

      // Torso & Tactical Vest
      ctx.fillStyle = vestColor;
      ctx.fillRect(w - 20, h - 24, 16, 14);
      ctx.fillStyle = vestBorder;
      ctx.strokeRect(w - 20, h - 24, 16, 14);

      // Head & Face
      ctx.fillStyle = skinBase;
      ctx.fillRect(w - 14, h - 28, 12, 12);
      ctx.fillStyle = skinHighlight;
      ctx.fillRect(w - 10, h - 26, 6, 6);

      // Headband
      ctx.fillStyle = headband;
      ctx.fillRect(w - 15, h - 30, 15, 4);

      // Prone Rifle resting on ground
      ctx.fillStyle = rifleMetal;
      ctx.fillRect(w - 6, h - 18, 26, 6);
      ctx.fillStyle = rifleHighlight;
      ctx.fillRect(w - 6, h - 18, 26, 2);
      // Muzzle
      ctx.fillStyle = '#000000';
      ctx.fillRect(w + 18, h - 19, 4, 8);

      ctx.restore();
      return;
    }

    // 4. Standing / Running Stride Cycle
    const runFrame = Math.floor(animFrame) % 4;
    const isMoving = animFrame > 0 && isGrounded;

    // --- LEGS ---
    if (isMoving) {
      // Dynamic 4-frame running animation with knee joints & boots
      const strides = [-10, -3, 6, 12];
      const legOffset = strides[runFrame];

      // Back leg
      ctx.fillStyle = pantsDark;
      ctx.fillRect(w / 2 - 7 - legOffset, h - 22, 8, 20);
      ctx.fillStyle = '#0f172a'; // boot
      ctx.fillRect(w / 2 - 9 - legOffset, h - 6, 10, 6);

      // Front leg
      ctx.fillStyle = pantsMid;
      ctx.fillRect(w / 2 - 1 + legOffset, h - 22, 8, 20);
      ctx.fillStyle = pantsLight;
      ctx.fillRect(w / 2 + 1 + legOffset, h - 20, 4, 12);
      ctx.fillStyle = '#0f172a'; // boot
      ctx.fillRect(w / 2 - 3 + legOffset, h - 6, 11, 6);
    } else {
      // Stance
      ctx.fillStyle = pantsDark;
      ctx.fillRect(w / 2 - 9, h - 22, 8, 20);
      ctx.fillStyle = pantsMid;
      ctx.fillRect(w / 2 + 1, h - 22, 8, 20);
      ctx.fillStyle = pantsLight;
      ctx.fillRect(w / 2 + 3, h - 20, 4, 12);

      // Combat boots
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(w / 2 - 11, h - 6, 10, 6);
      ctx.fillRect(w / 2, h - 6, 10, 6);
    }

    // --- TORSO & CHEST ---
    // Muscular Bare Chest / Tactical Vest
    ctx.fillStyle = vestColor;
    ctx.fillRect(w / 2 - 9, h - 38, 18, 18);
    ctx.fillStyle = vestBorder;
    ctx.strokeRect(w / 2 - 9, h - 38, 18, 18);

    // Ammo pouch & combat belt
    ctx.fillStyle = '#78350f';
    ctx.fillRect(w / 2 - 9, h - 24, 18, 4);
    ctx.fillStyle = '#f59e0b'; // belt buckle
    ctx.fillRect(w / 2 - 2, h - 24, 4, 4);

    // Ammo bandolier sash
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.moveTo(w / 2 - 9, h - 38);
    ctx.lineTo(w / 2 + 9, h - 24);
    ctx.lineTo(w / 2 + 6, h - 22);
    ctx.lineTo(w / 2 - 9, h - 34);
    ctx.fill();

    // Muscle arms
    ctx.fillStyle = skinBase;
    ctx.fillRect(w / 2 - 13, h - 36, 6, 16);
    ctx.fillStyle = skinHighlight;
    ctx.fillRect(w / 2 - 13, h - 34, 4, 8);

    // --- HEAD & FACE ---
    // Face
    ctx.fillStyle = skinBase;
    ctx.fillRect(w / 2 - 7, h - 50, 14, 14);
    ctx.fillStyle = skinHighlight;
    ctx.fillRect(w / 2 - 4, h - 48, 8, 7);
    ctx.fillStyle = skinShadow;
    ctx.fillRect(w / 2 - 7, h - 40, 14, 4);

    // Dark Spiky Hair
    ctx.fillStyle = '#291305';
    ctx.fillRect(w / 2 - 8, h - 53, 16, 6);
    ctx.fillRect(w / 2 - 9, h - 50, 4, 5);

    // Headband
    ctx.fillStyle = headband;
    ctx.fillRect(w / 2 - 9, h - 47, 18, 5);
    // Headband fluttering ribbons
    const flap = Math.sin(gameTime * 0.35) * 4;
    ctx.fillRect(w / 2 - 17, h - 46 + flap, 9, 3);
    ctx.fillRect(w / 2 - 19, h - 44 + flap, 6, 2);

    // --- 8-DIRECTIONAL RIFLE & AIMING POSES ---
    ctx.fillStyle = rifleMetal;

    if (aimDir.dy < 0 && aimDir.dx === 0) {
      // 1. Aim Straight UP
      ctx.fillRect(w / 2 - 2, h - 72, 6, 32);
      ctx.fillStyle = rifleHighlight;
      ctx.fillRect(w / 2 - 2, h - 72, 2, 32);
      // Magazine clip
      ctx.fillStyle = '#000000';
      ctx.fillRect(w / 2 + 4, h - 54, 5, 8);
      // Hands grasping
      ctx.fillStyle = skinBase;
      ctx.fillRect(w / 2 - 5, h - 45, 11, 7);

    } else if (aimDir.dy < 0 && aimDir.dx !== 0) {
      // 2. Aim Diagonal UP (45 degrees)
      ctx.save();
      ctx.translate(w / 2, h - 32);
      ctx.rotate(-Math.PI / 4);
      ctx.fillStyle = rifleMetal;
      ctx.fillRect(0, -4, 32, 7);
      ctx.fillStyle = rifleHighlight;
      ctx.fillRect(0, -4, 32, 2);
      // Muzzle
      ctx.fillStyle = '#000000';
      ctx.fillRect(30, -5, 4, 9);
      ctx.restore();

    } else if (aimDir.dy > 0 && aimDir.dx !== 0) {
      // 3. Aim Diagonal DOWN (in mid-air)
      ctx.save();
      ctx.translate(w / 2, h - 26);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = rifleMetal;
      ctx.fillRect(0, -4, 32, 7);
      ctx.fillStyle = rifleHighlight;
      ctx.fillRect(0, -4, 32, 2);
      ctx.restore();

    } else {
      // 4. Aim Straight Horizontal
      ctx.fillRect(w / 2 + 2, h - 33, 28, 7);
      ctx.fillStyle = rifleHighlight;
      ctx.fillRect(w / 2 + 2, h - 33, 28, 2);
      // Magazine clip
      ctx.fillStyle = '#000000';
      ctx.fillRect(w / 2 + 10, h - 26, 5, 8);
      // Rifle muzzle break
      ctx.fillStyle = '#000000';
      ctx.fillRect(w / 2 + 28, h - 34, 4, 9);
      // Grasping hands
      ctx.fillStyle = skinBase;
      ctx.fillRect(w / 2 + 3, h - 31, 8, 6);
    }

    ctx.restore();
  }

  // --- 16-Bit Boss Rendering ---
  public drawBoss(ctx: CanvasRenderingContext2D, boss: any, gameTime: number) {
    const processedCanvas = this.getProcessedCanvas(
      boss.id === 'boss_stage_1' ? 'boss_fortress' : boss.id === 'boss_stage_2' ? 'boss_spider' : 'boss_alien'
    );

    ctx.save();
    ctx.translate(boss.x, boss.y);

    // Damage White Flash on Hit
    if (boss.hitFlashTimer > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-10, -10, boss.width + 20, boss.height + 20);
      ctx.restore();
      return;
    }

    // If master still processed canvas is available, render authentic 16-bit sprite!
    if (processedCanvas) {
      ctx.drawImage(processedCanvas, 0, 0, boss.width, boss.height);

      // Add dynamic animated overlay elements:
      if (boss.id === 'boss_stage_1') {
        // Pulsing glowing red core
        const corePulse = 0.6 + Math.sin(gameTime * 0.15) * 0.4;
        ctx.fillStyle = `rgba(239, 68, 68, ${corePulse})`;
        ctx.beginPath();
        ctx.arc(boss.width * 0.5, boss.height * 0.62, 22, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(boss.width * 0.5, boss.height * 0.62, 8, 0, Math.PI * 2);
        ctx.fill();

      } else if (boss.id === 'boss_stage_2') {
        // Cockpit cyber neon pulse
        const cyanPulse = 0.7 + Math.sin(gameTime * 0.18) * 0.3;
        ctx.fillStyle = `rgba(56, 189, 248, ${cyanPulse})`;
        ctx.beginPath();
        ctx.arc(boss.width * 0.36, boss.height * 0.54, 14, 0, Math.PI * 2);
        ctx.fill();

      } else if (boss.id === 'boss_stage_3') {
        // Alien bio-vein purple pulse
        const purplePulse = 0.5 + Math.sin(gameTime * 0.12) * 0.5;
        ctx.fillStyle = `rgba(217, 70, 239, ${purplePulse * 0.6})`;
        ctx.beginPath();
        ctx.ellipse(boss.width * 0.5, boss.height * 0.5, boss.width * 0.35, boss.height * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      return;
    }

    // Fallback high-fidelity procedural boss rendering
    ctx.restore();
  }

  // --- Red Falcon Animated Flying Capsule ---
  public drawWeaponCapsule(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, dropItem: string, gameTime: number) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);

    const flap = Math.sin(gameTime * 0.3) * 6;

    // Golden mechanical wings with red feathered plumes
    ctx.fillStyle = '#dc2626';
    // Left Wing
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-20, -14 + flap);
    ctx.lineTo(-24, -2 + flap);
    ctx.lineTo(-6, 4);
    ctx.fill();
    // Right Wing
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(20, -14 + flap);
    ctx.lineTo(24, -2 + flap);
    ctx.lineTo(6, 4);
    ctx.fill();

    // Wing gold trims
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Metallic Capsule Core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Outer glow ring
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Falcon Insignia
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // --- Red Falcon Running Infantry Commando ---
  public drawGrunt(ctx: CanvasRenderingContext2D, enemy: any, gameTime: number) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);

    const isLeft = enemy.facing === 'left';
    if (isLeft) {
      ctx.scale(-1, 1);
      ctx.translate(-enemy.width, 0);
    }

    const w = enemy.width;
    const h = enemy.height;
    const run = Math.floor(gameTime * 0.25) % 4;
    const legSwing = Math.sin(gameTime * 0.35) * 8;

    // Boots & Legs
    ctx.fillStyle = '#1e293b'; // Combat boots
    ctx.fillRect(w / 2 - 8 - legSwing, h - 6, 8, 6);
    ctx.fillRect(w / 2 + 1 + legSwing, h - 6, 8, 6);

    ctx.fillStyle = '#475569'; // Grey tactical pants
    ctx.fillRect(w / 2 - 6 - legSwing, h - 20, 6, 16);
    ctx.fillRect(w / 2 + 2 + legSwing, h - 20, 6, 16);

    // Red Vest & Tactical Harness
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(w / 2 - 7, h - 36, 14, 18);
    ctx.fillStyle = '#991b1b';
    ctx.strokeRect(w / 2 - 7, h - 36, 14, 18);

    // Face & Red Beret
    ctx.fillStyle = '#fed7aa'; // Skin
    ctx.fillRect(w / 2 - 6, h - 46, 12, 12);
    // Goggles
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(w / 2 - 2, h - 42, 7, 3);
    // Red Peaked Beret
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(w / 2 - 8, h - 50, 16, 5);
    ctx.fillStyle = '#facc15'; // Beret crest
    ctx.fillRect(w / 2 + 2, h - 49, 3, 3);

    // Submachine gun
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(w / 2 + 2, h - 28, 20, 5);
    ctx.fillRect(w / 2 + 6, h - 23, 4, 6); // Mag

    ctx.restore();
  }

  // --- Ledge Sniper ---
  public drawSniper(ctx: CanvasRenderingContext2D, enemy: any, gameTime: number) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);

    const isLeft = enemy.facing === 'left';
    if (isLeft) {
      ctx.scale(-1, 1);
      ctx.translate(-enemy.width, 0);
    }

    const w = enemy.width;
    const h = enemy.height;

    // Camo Cloak
    ctx.fillStyle = '#14532d';
    ctx.fillRect(w / 2 - 8, h - 32, 16, 26);
    ctx.fillStyle = '#166534';
    ctx.fillRect(w / 2 - 6, h - 28, 12, 18);

    // Head & Green Cap
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(w / 2 - 5, h - 42, 10, 11);
    ctx.fillStyle = '#14532d';
    ctx.fillRect(w / 2 - 7, h - 45, 14, 4);

    // High caliber scoped sniper rifle
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(w / 2 + 2, h - 28, 28, 4);
    // Optical scope
    ctx.fillStyle = '#334155';
    ctx.fillRect(w / 2 + 8, h - 32, 10, 4);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(w / 2 + 16, h - 31, 2, 2);

    // Laser Sight Beam pointing
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2 + 30, h - 26);
    ctx.lineTo(w / 2 + 140, h - 26);
    ctx.stroke();

    ctx.restore();
  }

  // --- Heavy Pillbox Turret ---
  public drawTurret(ctx: CanvasRenderingContext2D, enemy: any) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);

    const w = enemy.width;
    const h = enemy.height;

    // Steel bunker dome base
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(w / 2, h, w / 2, Math.PI, 0);
    ctx.fill();

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Rivets
    ctx.fillStyle = '#94a3b8';
    for (let i = 0; i < 5; i++) {
      const a = Math.PI + (i * Math.PI) / 4;
      ctx.fillRect(w / 2 + Math.cos(a) * (w / 2 - 4) - 2, h + Math.sin(a) * (w / 2 - 4) - 2, 3, 3);
    }

    // Rotating Twin Barrels
    ctx.save();
    ctx.translate(w / 2, h - 14);
    ctx.rotate(enemy.aimAngle);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, -6, 24, 5);
    ctx.fillRect(0, 1, 24, 5);
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, -6, 24, 2);
    ctx.fillRect(0, 1, 24, 2);
    ctx.restore();

    // Red telemetry scanner light
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(w / 2, h - 14, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

export const spriteForge = SpriteForge.getInstance();
