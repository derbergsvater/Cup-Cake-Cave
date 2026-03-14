// GameScene: Mario-Style Plattformer mit Kamera-Follow und Level-Generierung
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.difficulty = data.difficulty || 'mittel';
        const diffSettings = {
            einfach: {
                lives: 5, playerSpeed: 200, jumpForce: -420,
                enemyDensity: 0.3, powerUpDensity: 0.25,
                hurtCooldownMs: 2000, projSpeed: 140, label: 'Einfach'
            },
            mittel: {
                lives: 3, playerSpeed: 220, jumpForce: -400,
                enemyDensity: 0.45, powerUpDensity: 0.18,
                hurtCooldownMs: 1500, projSpeed: 180, label: 'Mittel'
            },
            schwer: {
                lives: 2, playerSpeed: 240, jumpForce: -380,
                enemyDensity: 0.6, powerUpDensity: 0.12,
                hurtCooldownMs: 1200, projSpeed: 220, label: 'Schwer'
            }
        };
        this.diff = diffSettings[this.difficulty];

        this.score = 0;
        this.lives = this.diff.lives;
        this.isInvulnerable = false;
        this.isFlying = false;
        this.isBig = false;
        this.isFast = false;
        this.isStarPower = false;
        this.hurtCooldown = 0;
        this.walkFrame = 0;
        this.walkTimer = 0;
        this.maxPlayerX = 0; // Weiteste Position (für Distanz)
        this.currentPlayerTexture = 'llama';
        this.lastDistanceMeters = -1;
        this.lastShownScore = -1;
        this.cleanupAccumulator = 0;
        this.spitCooldownMs = 450;
        this.spitCooldown = 0;
        this.lastSpitStatus = '';

        // Zonen
        this.currentZone = 0;
        this.zoneLength = 3200; // Pixel bis Zonenwechsel
        this.lastZoneIndex = -1;
        this.zones = [
            { name: 'Rosa Zuckerguss', bg: 'bg_pink', ground: 'ground', tint: 0xFF69B4, track: 'zone_pink' },
            { name: 'Schokoladen-Grotte', bg: 'bg_choco', ground: 'ground_choco', tint: 0x8B4513, track: 'zone_choco' },
            { name: 'Minz-Kristalle', bg: 'bg_mint', ground: 'ground_mint', tint: 0x40E0D0, track: 'zone_mint' },
            { name: 'Erdbeer-Tal', bg: 'bg_strawberry', ground: 'ground_strawberry', tint: 0xFF4060, track: 'zone_strawberry' },
            { name: 'Karamell-Kammer', bg: 'bg_caramel', ground: 'ground_caramel', tint: 0xE8A832, track: 'zone_caramel' }
        ];

        // Level-Generierung: wie weit wurde bereits generiert
        this.generatedUpTo = 0;
        this.chunkSize = 800; // Pixel pro Chunk
    }

    create() {
        // Welt-Grenzen: weit nach rechts, keine Begrenzung links außer 0
        this.physics.world.setBounds(0, 0, 999999, 600);

        // Hintergrund (scrollt per TileSprite)
        this.bgLayer = this.add.image(400, 300, 'bg_pink').setScrollFactor(0).setDepth(-10).setAlpha(0.92);

        // Gruppen
        this.groundGroup = this.physics.add.staticGroup();
        this.ceilingGroup = this.physics.add.staticGroup();
        this.platforms = this.physics.add.staticGroup();
        this.itemBlocks = this.physics.add.staticGroup();
        this.obstacles = this.physics.add.group();
        this.sugarFlies = this.physics.add.group();
        this.cupcakeBears = this.physics.add.group();
        this.projectiles = this.physics.add.group();
        this.llamaSpits = this.physics.add.group();
        this.powerUps = this.physics.add.group();
        this.stalactites = this.physics.add.group();
        this.tunnelZones = this.physics.add.staticGroup();

        // Cupcake-Tunnel Deko-Bilder (werden separat getrackt fuer Cleanup)
        this.tunnelImages = [];
        this.playerInTunnel = false;

        // Deko
        this.decoElements = [];
        this.kitchenDecoElements = [];

        // Partikel
        this.sparkleParticles = this.add.particles(0, 0, 'particle', {
            speed: { min: 50, max: 150 }, scale: { start: 0.8, end: 0 },
            lifespan: 500, emitting: false,
            tint: [0xFFD700, 0xFF69B4, 0x00FFFF, 0xFF6B6B]
        });
        this.hitParticles = this.add.particles(0, 0, 'particle', {
            speed: { min: 100, max: 200 }, scale: { start: 1, end: 0 },
            lifespan: 400, emitting: false, tint: [0xFF0000, 0xFF6600]
        });

        // Initiales Level generieren
        this.generateChunks(0, this.chunkSize * 3);

        // Spieler
        this.player = this.physics.add.sprite(100, 480, 'llama');
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.05);
        this.player.setSize(36, 46);
        this.player.setOffset(10, 10);
        this.player.setDepth(10);

        // Kollisionen
        this.physics.add.collider(this.player, this.groundGroup);
        this.physics.add.collider(this.player, this.ceilingGroup);
        this._platformCollider = this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.player, this.itemBlocks, this.hitItemBlock, null, this);
        this.physics.add.collider(this.obstacles, this.groundGroup);
        this.physics.add.collider(this.cupcakeBears, this.groundGroup);
        this.physics.add.collider(this.cupcakeBears, this.platforms);

        this.physics.add.overlap(this.player, this.sugarFlies, this.eatSugarFly, null, this);
        this.physics.add.overlap(this.player, this.obstacles, this.hitObstacle, null, this);
        this.physics.add.overlap(this.player, this.stalactites, this.hitObstacle, null, this);
        this.physics.add.overlap(this.player, this.projectiles, this.hitByProjectile, null, this);
        this.physics.add.overlap(this.player, this.powerUps, this.collectPowerUp, null, this);
        this.physics.add.overlap(this.player, this.cupcakeBears, this.hitBear, null, this);
        this.physics.add.overlap(this.player, this.tunnelZones, this.enterTunnel, null, this);
        this.physics.add.overlap(this.llamaSpits, this.sugarFlies, this.hitEnemyWithSpit, null, this);
        this.physics.add.overlap(this.llamaSpits, this.cupcakeBears, this.hitEnemyWithSpit, null, this);
        this.physics.add.overlap(this.llamaSpits, this.obstacles, this.hitObstacleWithSpit, null, this);
        this.physics.add.overlap(this.llamaSpits, this.projectiles, this.hitProjectileWithSpit, null, this);
        this.physics.add.overlap(this.llamaSpits, this.stalactites, this.hitStalactiteWithSpit, null, this);

        // Steuerung
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyA = this.input.keyboard.addKey('A');
        this.keyD = this.input.keyboard.addKey('D');
        this.keyW = this.input.keyboard.addKey('W');
        this.keyF = this.input.keyboard.addKey('F');
        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Touch-Steuerung fuer Mobilgeraete
        this.touchLeft = false;
        this.touchRight = false;
        this.touchJump = false;
        this.touchJumpJustPressed = false;
        this.touchSpitJustPressed = false;
        this.isMobile = !this.sys.game.device.os.desktop;
        if (this.isMobile) this.createTouchControls();

        // Kamera folgt dem Spieler
        this.cameras.main.startFollow(this.player, true, 0.1, 0.05);
        this.cameras.main.setFollowOffset(-150, 50);
        this.cameras.main.setBounds(0, 0, 999999, 600);

        // HUD
        this.createHUD();
        this.showZoneAnnouncement(this.zones[0].name);
        this.zoneText.setText(this.zones[0].name);

        // Start-Spruch
        this.time.delayedCall(500, () => {
            this.showSpeechBubble('Los gehts!');
            window.audioManager.speakStart();
        });
    }

    // Sprechblase ueber dem Spieler
    showSpeechBubble(text) {
        if (this._speechBubble) this._speechBubble.destroy();
        if (this._speechBubbleBg) this._speechBubbleBg.destroy();

        const px = this.player.x;
        const py = this.player.y - 50;

        // Hintergrund-Blase
        const bg = this.add.graphics();
        bg.setDepth(120);
        const textObj = this.add.text(px, py, text, {
            fontSize: '14px', fontFamily: 'monospace',
            color: '#000000', fontStyle: 'bold',
            padding: { x: 4, y: 2 }
        }).setOrigin(0.5).setDepth(121);

        const bounds = textObj.getBounds();
        bg.fillStyle(0xFFFFFF, 0.9);
        bg.fillRoundedRect(bounds.x - 6, bounds.y - 4, bounds.width + 12, bounds.height + 8, 8);
        bg.lineStyle(2, 0x000000, 0.5);
        bg.strokeRoundedRect(bounds.x - 6, bounds.y - 4, bounds.width + 12, bounds.height + 8, 8);
        // Kleines Dreieck nach unten (Sprechblasen-Spitze)
        bg.fillStyle(0xFFFFFF, 0.9);
        bg.fillTriangle(px - 5, bounds.y + bounds.height + 4, px + 5, bounds.y + bounds.height + 4, px, bounds.y + bounds.height + 12);

        this._speechBubble = textObj;
        this._speechBubbleBg = bg;

        // Einblenden und nach oben schweben
        textObj.setAlpha(0);
        bg.setAlpha(0);
        this.tweens.add({
            targets: [textObj, bg], alpha: 1, duration: 150,
            onComplete: () => {
                this.tweens.add({
                    targets: [textObj, bg], alpha: 0, y: '-=20',
                    duration: 600, delay: 1200,
                    onComplete: () => {
                        textObj.destroy();
                        bg.destroy();
                        this._speechBubble = null;
                        this._speechBubbleBg = null;
                    }
                });
            }
        });
    }

    createHUD() {
        const hudBg = this.add.graphics();
        hudBg.fillStyle(0x08060F, 0.58);
        hudBg.fillRoundedRect(8, 8, 280, 92, 12);
        hudBg.lineStyle(1, 0xFFD166, 0.9);
        hudBg.strokeRoundedRect(8, 8, 280, 92, 12);
        hudBg.setDepth(100).setScrollFactor(0);

        this.scoreText = this.add.text(20, 14, 'Punkte: 0', {
            fontSize: '23px', fontFamily: '"Baloo 2"',
            color: '#FFE3B0', stroke: '#000', strokeThickness: 2
        }).setDepth(100).setScrollFactor(0);

        this.livesText = this.add.text(20, 43, '', {
            fontSize: '16px', fontFamily: 'Outfit',
            color: '#FF9DC8', stroke: '#000', strokeThickness: 2
        }).setDepth(100).setScrollFactor(0);
        this.updateLivesDisplay();

        this.powerUpText = this.add.text(20, 69, '', {
            fontSize: '13px', fontFamily: 'Outfit',
            color: '#9FE8FF', stroke: '#000', strokeThickness: 2
        }).setDepth(100).setScrollFactor(0);

        const rightBg = this.add.graphics();
        rightBg.fillStyle(0x08060F, 0.58);
        rightBg.fillRoundedRect(520, 8, 272, 82, 12);
        rightBg.lineStyle(1, 0xFFD166, 0.9);
        rightBg.strokeRoundedRect(520, 8, 272, 82, 12);
        rightBg.setDepth(100).setScrollFactor(0);

        this.distanceText = this.add.text(780, 14, 'Distanz: 0m', {
            fontSize: '17px', fontFamily: 'Outfit',
            color: '#FFFFFF', stroke: '#000', strokeThickness: 2
        }).setOrigin(1, 0).setDepth(100).setScrollFactor(0);

        this.zoneText = this.add.text(780, 39, '', {
            fontSize: '13px', fontFamily: 'Outfit',
            color: '#FFB6D7', stroke: '#000', strokeThickness: 2
        }).setOrigin(1, 0).setDepth(100).setScrollFactor(0);

        this.spitText = this.add.text(780, 58, '', {
            fontSize: '12px', fontFamily: 'Outfit',
            color: '#A8F5FF', stroke: '#000', strokeThickness: 2
        }).setOrigin(1, 0).setDepth(100).setScrollFactor(0);

        const diffColors = { einfach: '#6BCB77', mittel: '#FFD700', schwer: '#FF4040' };
        this.add.text(780, 74, this.diff.label, {
            fontSize: '11px', fontFamily: 'Outfit',
            color: diffColors[this.difficulty] || '#FFFFFF',
            stroke: '#000', strokeThickness: 2
        }).setOrigin(1, 0).setDepth(100).setScrollFactor(0);

        this.updateSpitStatusText();
    }

    createTouchControls() {
        const btnAlpha = 0.35;
        const btnDepth = 150;

        // --- Linker Bereich: Richtungstasten ---
        // Links-Button
        const btnLeft = this.add.graphics();
        btnLeft.fillStyle(0xFFFFFF, btnAlpha);
        btnLeft.fillRoundedRect(10, 480, 70, 70, 12);
        btnLeft.setDepth(btnDepth).setScrollFactor(0);
        const lblLeft = this.add.text(45, 515, '\u25C0', {
            fontSize: '32px', color: '#FFFFFF'
        }).setOrigin(0.5).setDepth(btnDepth + 1).setScrollFactor(0).setAlpha(0.6);

        // Rechts-Button
        const btnRight = this.add.graphics();
        btnRight.fillStyle(0xFFFFFF, btnAlpha);
        btnRight.fillRoundedRect(90, 480, 70, 70, 12);
        btnRight.setDepth(btnDepth).setScrollFactor(0);
        const lblRight = this.add.text(125, 515, '\u25B6', {
            fontSize: '32px', color: '#FFFFFF'
        }).setOrigin(0.5).setDepth(btnDepth + 1).setScrollFactor(0).setAlpha(0.6);

        // --- Rechter Bereich: Sprung-Button ---
        const btnJump = this.add.graphics();
        btnJump.fillStyle(0xFF69B4, btnAlpha);
        btnJump.fillCircle(730, 515, 45);
        btnJump.setDepth(btnDepth).setScrollFactor(0);
        const lblJump = this.add.text(730, 515, '\u25B2', {
            fontSize: '36px', color: '#FFFFFF'
        }).setOrigin(0.5).setDepth(btnDepth + 1).setScrollFactor(0).setAlpha(0.6);

        const btnSpit = this.add.graphics();
        btnSpit.fillStyle(0x61D8F0, btnAlpha);
        btnSpit.fillCircle(640, 515, 35);
        btnSpit.setDepth(btnDepth).setScrollFactor(0);
        const lblSpit = this.add.text(640, 515, '\uD83D\uDCA6', {
            fontSize: '28px', fontFamily: 'Outfit', color: '#FFFFFF'
        }).setOrigin(0.5).setDepth(btnDepth + 1).setScrollFactor(0).setAlpha(0.8);

        // Unsichtbare interaktive Zonen fuer Touch
        const zoneLeft = this.add.zone(45, 515, 80, 80)
            .setScrollFactor(0).setDepth(btnDepth + 2).setInteractive();
        const zoneRight = this.add.zone(125, 515, 80, 80)
            .setScrollFactor(0).setDepth(btnDepth + 2).setInteractive();
        const zoneJump = this.add.zone(730, 515, 100, 100)
            .setScrollFactor(0).setDepth(btnDepth + 2).setInteractive();
        const zoneSpit = this.add.zone(640, 515, 80, 80)
            .setScrollFactor(0).setDepth(btnDepth + 2).setInteractive();

        // Touch-Events
        zoneLeft.on('pointerdown', () => { this.touchLeft = true; btnLeft.setAlpha(0.7); });
        zoneLeft.on('pointerup', () => { this.touchLeft = false; btnLeft.setAlpha(1); });
        zoneLeft.on('pointerout', () => { this.touchLeft = false; btnLeft.setAlpha(1); });

        zoneRight.on('pointerdown', () => { this.touchRight = true; btnRight.setAlpha(0.7); });
        zoneRight.on('pointerup', () => { this.touchRight = false; btnRight.setAlpha(1); });
        zoneRight.on('pointerout', () => { this.touchRight = false; btnRight.setAlpha(1); });

        zoneJump.on('pointerdown', () => {
            this.touchJump = true;
            this.touchJumpJustPressed = true;
            btnJump.setAlpha(0.7);
        });
        zoneJump.on('pointerup', () => { this.touchJump = false; btnJump.setAlpha(1); });
        zoneJump.on('pointerout', () => { this.touchJump = false; btnJump.setAlpha(1); });

        zoneSpit.on('pointerdown', () => {
            this.touchSpitJustPressed = true;
            btnSpit.setAlpha(0.7);
        });
        zoneSpit.on('pointerup', () => { btnSpit.setAlpha(1); });
        zoneSpit.on('pointerout', () => { btnSpit.setAlpha(1); });

        // Multi-Touch aktivieren
        this.input.addPointer(3);
    }

    showZoneAnnouncement(name) {
        if (this.zoneAnnouncement) this.zoneAnnouncement.destroy();
        this.zoneAnnouncement = this.add.text(400, 200, '~ ' + name + ' ~', {
            fontSize: '32px', fontFamily: 'Georgia, serif',
            color: '#FFD700', stroke: '#000', strokeThickness: 5,
            shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 8, fill: true }
        }).setOrigin(0.5).setDepth(110).setScrollFactor(0).setAlpha(0);

        this.tweens.add({
            targets: this.zoneAnnouncement,
            alpha: 1, y: 180, duration: 500, ease: 'Back.easeOut',
            onComplete: () => {
                this.tweens.add({
                    targets: this.zoneAnnouncement,
                    alpha: 0, y: 160, duration: 800, delay: 1500,
                    onComplete: () => { if (this.zoneAnnouncement) this.zoneAnnouncement.destroy(); }
                });
            }
        });
    }

    updateLivesDisplay() {
        let hearts = '';
        for (let i = 0; i < this.lives; i++) hearts += '\u2764 ';
        this.livesText.setText('Leben: ' + hearts);
    }

    updatePowerUpDisplay() {
        const active = [];
        if (this.isFlying) active.push('FLUG');
        if (this.isBig) active.push('GROSS');
        if (this.isFast) active.push('SCHNELL');
        if (this.isStarPower) active.push('STERN');
        this.powerUpText.setText(active.length ? active.join(' | ') : '');
    }

    getZoneAt(x) {
        const idx = Math.floor(x / this.zoneLength) % this.zones.length;
        return this.zones[idx];
    }

    // === LEVEL-GENERIERUNG ===

    generateChunks(from, to) {
        for (let x = from; x < to; x += this.chunkSize) {
            if (x < this.generatedUpTo) continue;
            this.generateChunk(x);
        }
        this.generatedUpTo = Math.max(this.generatedUpTo, to);
    }

    generateChunk(startX) {
        const zone = this.getZoneAt(startX);
        let gapX = null;

        // Bodenluecken (ab 2. Chunk, Schwierigkeitsabhaengig)
        if (startX > 800 && Math.random() < this.diff.enemyDensity * 0.3) {
            gapX = startX + Phaser.Math.Between(200, 600);
        }

        // Boden
        for (let x = startX; x < startX + this.chunkSize; x += 64) {
            if (gapX !== null && x >= gapX && x < gapX + 128) continue;
            this.groundGroup.create(x, 576, zone.ground);
            const c = this.ceilingGroup.create(x, 16, zone.ground);
            c.setFlipY(true);
        }

        // Plattformen - mit Ueberlappungspruefung
        const placed = []; // {x, y} der platzierten Plattformen in diesem Chunk

        const canPlace = (px, py, minDistX, minDistY) => {
            for (const p of placed) {
                if (Math.abs(p.x - px) < minDistX && Math.abs(p.y - py) < minDistY) return false;
            }
            return true;
        };

        const platCount = Phaser.Math.Between(1, 3);
        for (let i = 0; i < platCount; i++) {
            for (let attempt = 0; attempt < 5; attempt++) {
                const px = startX + Phaser.Math.Between(100, 700);
                const py = Phaser.Math.Between(420, 480);
                if (canPlace(px, py, 100, 40)) {
                    const key = Math.random() < 0.5 ? 'platform' : 'platform_small';
                    this.platforms.create(px, py, key).refreshBody();
                    placed.push({ x: px, y: py });
                    break;
                }
            }
        }

        // Hoehere Plattformen
        if (Math.random() < 0.5) {
            for (let attempt = 0; attempt < 5; attempt++) {
                const px = startX + Phaser.Math.Between(150, 650);
                const py = Phaser.Math.Between(370, 410);
                if (canPlace(px, py, 100, 40)) {
                    this.platforms.create(px, py, 'platform_small').refreshBody();
                    placed.push({ x: px, y: py });
                    break;
                }
            }
        }

        // Treppen-Formation
        if (Math.random() < 0.3) {
            const baseX = startX + Phaser.Math.Between(200, 500);
            if (canPlace(baseX, 480, 100, 40) && canPlace(baseX + 80, 430, 100, 40) && canPlace(baseX + 160, 380, 100, 40)) {
                this.platforms.create(baseX, 480, 'platform_small').refreshBody();
                this.platforms.create(baseX + 80, 430, 'platform_small').refreshBody();
                this.platforms.create(baseX + 160, 380, 'platform_small').refreshBody();
                placed.push({ x: baseX, y: 480 }, { x: baseX + 80, y: 430 }, { x: baseX + 160, y: 380 });
            }
        }

        // ?-Blöcke (Power-up-Blöcke) - freistehend, nicht in Plattformen
        const blockCount = Math.random() < this.diff.powerUpDensity ? Phaser.Math.Between(1, 2) : 0;
        for (let i = 0; i < blockCount; i++) {
            const bx = startX + Phaser.Math.Between(100, 700);
            // Platziere Block so, dass er frei anspringbar ist
            // y=480 = knapp über Boden, y=460 = etwas höher (beides gut erreichbar)
            const by = Phaser.Math.Between(460, 490);

            // Prüfe ob hier schon eine Plattform oder ein Block ist
            if (!canPlace(bx, by, 80, 40)) continue;

            const block = this.itemBlocks.create(bx, by, 'item_block');
            block.refreshBody();
            const types = ['powerup_fly', 'powerup_life', 'powerup_big', 'powerup_speed', 'powerup_star'];
            block.powerUpType = Phaser.Utils.Array.GetRandom(types);
            block.isUsed = false;
        }

        // Hindernisse
        if (startX > 400) {
            const obsCount = Math.random() < this.diff.enemyDensity ? Phaser.Math.Between(1, 3) : 0;
            for (let i = 0; i < obsCount; i++) {
                const ox = startX + Phaser.Math.Between(80, 720);
                this.placeObstacle(ox);
            }
        }

        // Zuckerfliegen
        if (Math.random() < this.diff.enemyDensity) {
            const flyCount = Phaser.Math.Between(1, 3);
            for (let i = 0; i < flyCount; i++) {
                const fx = startX + Phaser.Math.Between(100, 700);
                const fy = Phaser.Math.Between(380, 510);
                const fly = this.sugarFlies.create(fx, fy, 'sugarfly');
                fly.body.allowGravity = false;
                fly.setSize(18, 18);
                fly.flyBaseY = fy;
                fly.flyTime = Math.random() * 6;
                fly.flySpeed = Phaser.Math.FloatBetween(2, 4);
                fly.flyAmplitude = Phaser.Math.Between(15, 35);
            }
        }

        // Cup-Cake-Bär
        if (startX > 600 && Math.random() < this.diff.enemyDensity * 0.5) {
            const bx = startX + Phaser.Math.Between(200, 600);
            const bear = this.cupcakeBears.create(bx, 528, 'cupcakebear');
            bear.body.allowGravity = false;
            bear.setImmovable(true);
            bear.setSize(36, 40);
            bear.shootTimer = 0;
            bear.shootInterval = Phaser.Math.Between(1500, 3000);
        }

        // Stalaktiten
        if (Math.random() < 0.4) {
            const sx = startX + Phaser.Math.Between(100, 700);
            const st = this.stalactites.create(sx, Phaser.Math.Between(55, 100), 'stalactite_deco');
            st.body.allowGravity = false;
            st.setImmovable(true);
            st.setSize(16, 40);
        }

        // Cupcake-Tunnel (alle ~3 Chunks einer)
        if (Math.random() < 0.35 && startX > 400) {
            const tx = startX + Phaser.Math.Between(200, 500);
            // Cupcake-Bild VOR dem Spieler (Depth 15 > Spieler 10)
            const cupcake = this.add.image(tx, 490, 'cupcake_tunnel');
            cupcake.setOrigin(0.5, 0.5);
            cupcake.setScale(1.6);
            cupcake.setDepth(15);
            this.tunnelImages.push(cupcake);

            // Unsichtbare Tunnel-Overlap-Zone (wo das Loch ist)
            const zone = this.tunnelZones.create(tx, 500, null);
            zone.setSize(40, 50);
            zone.setVisible(false);
            zone.refreshBody();
        }

        // Frei schwebende Power-ups (selten, auf dem Boden oder auf Plattformen)
        if (Math.random() < this.diff.powerUpDensity * 0.4) {
            const px = startX + Phaser.Math.Between(200, 600);
            // Am Boden platzieren (sicher erreichbar)
            this.spawnPowerUpAt(px, 530);
        }

        // Hintergrund-Baeume/Pflanzen passend zur Zone
        const zoneTreeMap = {
            'Rosa Zuckerguss':     ['tree_lollipop', 'tree_cottoncandy'],
            'Schokoladen-Grotte':  ['tree_choco', 'tree_mushroom'],
            'Minz-Kristalle':      ['tree_crystal', 'tree_mint'],
            'Erdbeer-Tal':         ['tree_strawberry', 'tree_flower'],
            'Karamell-Kammer':     ['tree_palm', 'tree_pretzel']
        };
        const treesForZone = zoneTreeMap[zone.name] || ['tree_lollipop'];
        const treeCount = Phaser.Math.Between(2, 4);
        for (let i = 0; i < treeCount; i++) {
            const treeKey = Phaser.Utils.Array.GetRandom(treesForZone);
            const tx = startX + Phaser.Math.Between(40, 760);
            // Zwei Ebenen: hinten (kleiner) und vorne (groesser)
            const isFar = Math.random() < 0.4;
            const scale = isFar ? Phaser.Math.FloatBetween(1.8, 2.5) : Phaser.Math.FloatBetween(2.8, 3.8);
            const alpha = isFar ? 0.5 : 0.7;
            const depth = isFar ? -8 : -4;
            const baseY = isFar ? 545 : 552;
            const tree = this.add.image(tx, baseY, treeKey);
            tree.setOrigin(0.5, 1);
            tree.setScale(scale);
            tree.setAlpha(alpha);
            tree.setDepth(depth);
            this.decoElements.push(tree);
        }

        // Deko: Streusel
        for (let i = 0; i < 5; i++) {
            const s = this.add.image(
                startX + Math.random() * this.chunkSize,
                Phaser.Math.Between(80, 500), 'sprinkle'
            );
            s.setTint([0xFF69B4, 0xFFD700, 0x87CEEB, 0xDDA0DD, 0x90EE90][i % 5]);
            s.setAngle(Phaser.Math.Between(0, 360));
            s.setAlpha(0.3);
            s.setScale(Phaser.Math.FloatBetween(1, 2.5));
            s.setDepth(1);
            this.decoElements.push(s);
        }

        // Deko: Stalaktiten an Decke
        for (let i = 0; i < 2; i++) {
            const st = this.add.image(
                startX + Math.random() * this.chunkSize,
                Phaser.Math.Between(35, 65), 'stalactite_deco'
            );
            st.setAlpha(0.25);
            st.setDepth(1);
            st.setScale(Phaser.Math.FloatBetween(0.5, 1));
            this.decoElements.push(st);
        }

        // Küchendeko im Hintergrund
        if (Math.random() < 0.6) {
            const items = ['kitchen_mixer', 'kitchen_whisk', 'kitchen_roller',
                           'kitchen_bowl', 'kitchen_tray', 'kitchen_pipingbag', 'kitchen_scale'];
            const item = Phaser.Utils.Array.GetRandom(items);
            const img = this.add.image(
                startX + Phaser.Math.Between(100, 700),
                Phaser.Math.Between(120, 400), item
            );
            img.setAlpha(0.15 + Math.random() * 0.1);
            img.setScale(1.5 + Math.random() * 1.5);
            img.setDepth(-5);
            img.setAngle(Phaser.Math.Between(-15, 15));
            img.setTint(zone.tint);
            this.kitchenDecoElements.push(img);
        }
    }

    placeObstacle(x) {
        const roll = Math.random();
        let obs;
        if (roll < 0.30) {
            obs = this.obstacles.create(x, 530, 'obstacle');
            obs.setSize(16, 40);
        } else if (roll < 0.50) {
            obs = this.obstacles.create(x, 532, 'obstacle_choco');
            obs.setSize(24, 40);
        } else if (roll < 0.70) {
            obs = this.obstacles.create(x, 533, 'obstacle_gummy');
            obs.setSize(24, 36);
        } else {
            obs = this.obstacles.create(x, 542, 'obstacle_cream');
            obs.setSize(40, 16);
        }
        obs.setImmovable(true);
        obs.body.allowGravity = false;
    }

    // === ?-BLOCK TREFFEN ===

    hitItemBlock(player, block) {
        // Nur von unten aktivieren (Spieler springt gegen Block)
        if (block.isUsed) return;
        if (player.body.touching.up && block.body.touching.down) {
            block.isUsed = true;
            block.setTexture('item_block_empty');
            block.refreshBody();

            // Block-Animation: kurz nach oben federn
            const origY = block.y;
            this.tweens.add({
                targets: block, y: origY - 10, duration: 80, yoyo: true,
                onComplete: () => { block.y = origY; block.refreshBody(); }
            });

            window.audioManager.playBlockHit();

            // Power-up erscheint im Block (versteckt) und waechst heraus
            const puType = block.powerUpType;
            const pu = this.powerUps.create(block.x, block.y, puType);
            pu.body.allowGravity = false;
            pu.setSize(20, 20);
            pu.powerUpType = puType;
            pu.setDepth(9);
            pu.setScale(0.3);
            pu.setAlpha(0.5);

            // Phase 1: Aus dem Block herauswachsen (nach oben)
            this.tweens.add({
                targets: pu,
                y: block.y - 40,
                scale: 1.2,
                alpha: 1,
                duration: 400,
                ease: 'Back.easeOut',
                onComplete: () => {
                    // Phase 2: Kurz verweilen, dann nach unten gleiten
                    this.tweens.add({
                        targets: pu,
                        scale: 1,
                        duration: 200,
                        onComplete: () => {
                            // Phase 3: Sanft nach unten gleiten (Bodenhöhe)
                            pu.body.allowGravity = true;
                            pu.body.setGravityY(-400); // Langsames Fallen
                            pu.setBounce(0.3);
                            // Collider damit es auf Boden/Plattformen landet
                            this.physics.add.collider(pu, this.groundGroup);
                            this.physics.add.collider(pu, this.platforms);
                        }
                    });
                }
            });

            // Partikel
            this.sparkleParticles.emitParticleAt(block.x, block.y - 16, 8);
        }
    }

    // === UPDATE ===

    update(time, delta) {
        if (this.lives <= 0) return;

        this.handleInput(delta);
        this.updateEnemies(delta);
        this.updateCooldowns(delta);
        this.updateZone();
        this.updateTunnel();
        this.cleanupAccumulator += delta;
        if (this.cleanupAccumulator >= 250) {
            this.cleanupAccumulator = 0;
            this.cleanupFarAway();
        }

        // Level voraus generieren
        const camRight = this.cameras.main.scrollX + 900;
        if (camRight + this.chunkSize > this.generatedUpTo) {
            this.generateChunks(this.generatedUpTo, this.generatedUpTo + this.chunkSize * 2);
        }

        // Walk-Animation
        const isMoving = Math.abs(this.player.body.velocity.x) > 10;
        const onGround = this.player.body.touching.down || this.player.body.blocked.down;
        this.walkTimer += delta;
        if (this.walkTimer > 120) {
            this.walkTimer = 0;
            this.walkFrame = 1 - this.walkFrame;
            if (onGround && isMoving) {
                const nextTex = this.walkFrame ? 'llama_walk' : 'llama';
                if (this.currentPlayerTexture !== nextTex) {
                    this.currentPlayerTexture = nextTex;
                    this.player.setTexture(nextTex);
                }
            } else if (onGround) {
                if (this.currentPlayerTexture !== 'llama') {
                    this.currentPlayerTexture = 'llama';
                    this.player.setTexture('llama');
                }
            }
        }

        // Distanz (basiert auf weitester Position)
        this.maxPlayerX = Math.max(this.maxPlayerX, this.player.x);
        const distMeters = Math.floor(this.maxPlayerX / 50);
        if (distMeters !== this.lastDistanceMeters) {
            this.lastDistanceMeters = distMeters;
            this.distanceText.setText('Distanz: ' + distMeters + 'm');
        }

        // Score für Distanz
        const distScore = Math.floor(distMeters / 10);
        if (distScore > (this._lastDistScore || 0)) {
            this._lastDistScore = distScore;
            this.score += 5;
        }
        if (this.score !== this.lastShownScore) {
            this.lastShownScore = this.score;
            this.scoreText.setText('Punkte: ' + this.score);
        }

        // Absturz-Check (in Bodenlücke gefallen)
        if (this.player.y > 590) {
            this.takeDamage();
            // Zurück auf sicheren Boden
            this.player.setPosition(this.player.x - 100, 400);
            this.player.setVelocity(0, 0);
        }
    }

    updateZone() {
        const zoneIdx = Math.floor(this.player.x / this.zoneLength) % this.zones.length;
        if (zoneIdx !== this.lastZoneIndex) {
            const zone = this.zones[zoneIdx];
            this.bgLayer.setTexture(zone.bg);
            this.zoneText.setText(zone.name);
            // Musik passend zur Zone wechseln
            window.audioManager.setZoneTrack(zone.track);
            if (this.lastZoneIndex >= 0) {
                this.showZoneAnnouncement(zone.name);
                this.score += 50;
                window.audioManager.playPowerUp();
                window.audioManager.speakZone();
                this.cameras.main.flash(400, 255, 255, 255, false);
                const zonePhrases = ['Ooh, schoen hier!', 'Was ist das?', 'Spannend!', 'Neues Abenteuer!'];
                this.showSpeechBubble(zonePhrases[Math.floor(Math.random() * zonePhrases.length)]);
            }
        }
        this.lastZoneIndex = zoneIdx;
    }

    handleInput(delta) {
        const speed = this.isFast ? this.diff.playerSpeed * 1.4 : this.diff.playerSpeed;
        const jumpForce = this.isFlying ? this.diff.jumpForce * 0.7 : this.diff.jumpForce;

        const goLeft = this.cursors.left.isDown || this.keyA.isDown || this.touchLeft;
        const goRight = this.cursors.right.isDown || this.keyD.isDown || this.touchRight;

        if (goLeft) {
            this.player.setVelocityX(-speed);
            this.player.setFlipX(true);
        } else if (goRight) {
            this.player.setVelocityX(speed);
            this.player.setFlipX(false);
        } else {
            this.player.setVelocityX(this.player.body.velocity.x * 0.85);
        }

        const onGround = this.player.body.touching.down || this.player.body.blocked.down;
        const canJump = onGround || this.isFlying;

        const kbJump = Phaser.Input.Keyboard.JustDown(this.spaceBar) ||
            Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
            Phaser.Input.Keyboard.JustDown(this.keyW);

        if (kbJump || this.touchJumpJustPressed) {
            this.touchJumpJustPressed = false;
            if (canJump) {
                this.player.setVelocityY(jumpForce);
                window.audioManager.playJump();
            }
        }

        const kbSpit = Phaser.Input.Keyboard.JustDown(this.keyF);
        if (kbSpit || this.touchSpitJustPressed) {
            this.touchSpitJustPressed = false;
            this.trySpit();
        }

        if (this.isFlying) {
            this.player.body.gravity.y = -400;
            if (this.spaceBar.isDown || this.cursors.up.isDown || this.touchJump) {
                if (this.player.body.velocity.y > -100) {
                    this.player.setVelocityY(this.player.body.velocity.y - 15);
                }
            }
        } else {
            this.player.body.gravity.y = 0;
        }
    }

    updateSpitStatusText() {
        const ready = this.spitCooldown <= 0;
        const seconds = Math.max(0, this.spitCooldown / 1000).toFixed(1);
        const status = ready ? 'Spucke: bereit (F)' : `Spucke: ${seconds}s`;
        if (status !== this.lastSpitStatus) {
            this.lastSpitStatus = status;
            this.spitText.setText(status);
        }
    }

    trySpit() {
        if (this.spitCooldown > 0 || !this.player || !this.player.active) return;
        this.spitCooldown = this.spitCooldownMs;
        this.updateSpitStatusText();

        const dir = this.player.flipX ? -1 : 1;
        const spit = this.llamaSpits.create(this.player.x + dir * 26, this.player.y - 12, 'llama_spit');
        spit.body.allowGravity = false;
        spit.setVelocityX(dir * 420);
        spit.setSize(12, 12);
        spit.setDepth(11);
        spit.setAngularVelocity(480 * dir);
        this.time.delayedCall(1200, () => { if (spit && spit.active) spit.destroy(); });

        window.audioManager.playSpit();
        if (Math.random() < 0.14) this.showSpeechBubble('Pffft!');
    }

    updateEnemies(delta) {
        const camLeft = this.cameras.main.scrollX - 100;
        const camRight = this.cameras.main.scrollX + 900;

        const flies = this.sugarFlies.getChildren();
        for (let i = 0; i < flies.length; i++) {
            const fly = flies[i];
            if (fly.flyTime !== undefined) {
                fly.flyTime += delta * 0.003 * fly.flySpeed;
                fly.y = fly.flyBaseY + Math.sin(fly.flyTime) * fly.flyAmplitude;
                fly.setAngle(Math.sin(fly.flyTime * 3) * 10);
            }
        }

        const bears = this.cupcakeBears.getChildren();
        for (let i = 0; i < bears.length; i++) {
            const bear = bears[i];
            if (bear.x < camLeft || bear.x > camRight) continue;
            bear.shootTimer += delta;
            if (bear.shootTimer >= bear.shootInterval) {
                bear.shootTimer = 0;
                this.shootCupcake(bear);
            }
        }

        const powerUps = this.powerUps.getChildren();
        for (let i = 0; i < powerUps.length; i++) {
            const pu = powerUps[i];
            if (pu.bobBaseY !== undefined) {
                pu.bobTime += delta * 0.003;
                pu.y = pu.bobBaseY + Math.sin(pu.bobTime) * pu.bobAmp;
            }
        }
    }

    shootCupcake(bear) {
        const proj = this.projectiles.create(bear.x - 10, bear.y - 10, 'cupcake_proj');
        proj.body.allowGravity = false;
        const angle = Phaser.Math.Angle.Between(bear.x, bear.y, this.player.x, this.player.y);
        const speed = this.diff.projSpeed;
        proj.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        proj.setSize(14, 14);
        proj.setAngularVelocity(360);
        this.time.delayedCall(4000, () => { if (proj && proj.active) proj.destroy(); });
    }

    spawnPowerUpAt(x, y) {
        const types = ['powerup_fly', 'powerup_life', 'powerup_big', 'powerup_speed', 'powerup_star'];
        const type = Phaser.Utils.Array.GetRandom(types);
        const pu = this.powerUps.create(x, y, type);
        pu.body.allowGravity = false;
        pu.setSize(20, 20);
        pu.powerUpType = type;
        pu.bobBaseY = y;
        pu.bobTime = Math.random() * Math.PI * 2;
        pu.bobAmp = 8;
    }

    // === KOLLISIONS-HANDLER ===

    eatSugarFly(player, fly) {
        if (this.isStarPower || this.isBig) { this.scoreFly(fly); return; }
        const playerBottom = player.body.y + player.body.height;
        const flyTop = fly.body.y;
        if (playerBottom < flyTop + 12 || player.body.velocity.y > 50) {
            this.scoreFly(fly);
        } else {
            this.takeDamage();
            fly.destroy();
        }
    }

    scoreFly(fly) {
        this.score += 10;
        this.scoreText.setText('Punkte: ' + this.score);
        window.audioManager.playEat();
        // Gelegentlich "Mjam!" sagen
        if (Math.random() < 0.3) {
            window.audioManager.speakYummy();
            this.showSpeechBubble('Mjam!');
        }
        this.sparkleParticles.emitParticleAt(fly.x, fly.y, 8);
        const popup = this.add.text(fly.x, fly.y, '+10', {
            fontSize: '18px', fontFamily: 'monospace',
            color: '#FFD700', stroke: '#000', strokeThickness: 2
        }).setDepth(50);
        this.tweens.add({
            targets: popup, y: popup.y - 40, alpha: 0,
            duration: 600, onComplete: () => popup.destroy()
        });
        fly.destroy();
    }

    hitObstacle(player, obstacle) {
        if (this.isStarPower || this.isBig) {
            this.sparkleParticles.emitParticleAt(obstacle.x, obstacle.y, 10);
            obstacle.destroy();
            this.score += 5;
            this.scoreText.setText('Punkte: ' + this.score);
            window.audioManager.playEat();
            return;
        }
        // Draufspringen zerstoert das Hindernis
        const playerBottom = player.body.y + player.body.height;
        const obsTop = obstacle.body.y;
        if (playerBottom < obsTop + 12 && player.body.velocity.y > 0) {
            this.sparkleParticles.emitParticleAt(obstacle.x, obstacle.y, 8);
            obstacle.destroy();
            this.score += 5;
            this.scoreText.setText('Punkte: ' + this.score);
            player.setVelocityY(-200);
            window.audioManager.playEat();
            return;
        }
        this.takeDamage();
    }

    hitByProjectile(player, proj) {
        if (this.isStarPower || this.isBig) {
            proj.destroy();
            this.sparkleParticles.emitParticleAt(proj.x, proj.y, 5);
            return;
        }
        this.takeDamage();
        proj.destroy();
    }

    hitBear(player, bear) {
        if (this.isStarPower || this.isBig) {
            this.sparkleParticles.emitParticleAt(bear.x, bear.y, 12);
            bear.destroy();
            this.score += 25;
            this.scoreText.setText('Punkte: ' + this.score);
            window.audioManager.playEat();
            return;
        }
        const playerBottom = player.body.y + player.body.height;
        const bearTop = bear.body.y;
        if (playerBottom < bearTop + 12 && player.body.velocity.y > 0) {
            this.sparkleParticles.emitParticleAt(bear.x, bear.y, 10);
            bear.destroy();
            this.score += 25;
            this.scoreText.setText('Punkte: ' + this.score);
            player.setVelocityY(-250);
            window.audioManager.playEat();
            const popup = this.add.text(bear.x, bear.y, '+25', {
                fontSize: '22px', fontFamily: 'monospace',
                color: '#FF69B4', stroke: '#000', strokeThickness: 3
            }).setDepth(50);
            this.tweens.add({
                targets: popup, y: popup.y - 50, alpha: 0,
                duration: 800, onComplete: () => popup.destroy()
            });
        } else {
            this.takeDamage();
        }
    }

    hitEnemyWithSpit(spit, enemy) {
        if (!spit.active || !enemy.active) return;
        this.sparkleParticles.emitParticleAt(enemy.x, enemy.y, 8);
        spit.destroy();
        enemy.destroy();
        this.score += enemy.texture && enemy.texture.key === 'cupcakebear' ? 25 : 10;
        window.audioManager.playScore();
    }

    hitObstacleWithSpit(spit, obstacle) {
        if (!spit.active || !obstacle.active) return;
        this.sparkleParticles.emitParticleAt(obstacle.x, obstacle.y, 8);
        spit.destroy();
        obstacle.destroy();
        this.score += 5;
        window.audioManager.playBlockHit();
    }

    hitProjectileWithSpit(spit, proj) {
        if (!spit.active || !proj.active) return;
        this.sparkleParticles.emitParticleAt(proj.x, proj.y, 6);
        spit.destroy();
        proj.destroy();
        this.score += 3;
        window.audioManager.playScore();
    }

    hitStalactiteWithSpit(spit, st) {
        if (!spit.active || !st.active) return;
        this.sparkleParticles.emitParticleAt(st.x, st.y, 5);
        spit.destroy();
        st.destroy();
        this.score += 4;
        window.audioManager.playBlockHit();
    }

    takeDamage() {
        if (this.isInvulnerable || this.isStarPower || this.hurtCooldown > 0) return;
        this.lives--;
        this.updateLivesDisplay();
        window.audioManager.playHurt();
        // Spruch bei Schaden
        const hurtPhrases = ['Aua!', 'Autsch!', 'Au weia!', 'Hey!', 'Uff!'];
        this.showSpeechBubble(hurtPhrases[Math.floor(Math.random() * hurtPhrases.length)]);
        window.audioManager.speakHurt();
        this.hurtCooldown = this.diff.hurtCooldownMs;
        this.hitParticles.emitParticleAt(this.player.x, this.player.y, 10);
        this.player.setTint(0xFF0000);
        this.time.delayedCall(200, () => {
            if (this.player && this.player.active) this.player.clearTint();
        });
        this.cameras.main.shake(200, 0.008);
        this.player.setVelocityY(-200);
        if (this.lives <= 0) this.gameOver();
    }

    collectPowerUp(player, powerUp) {
        const type = powerUp.powerUpType;
        window.audioManager.playPowerUp();
        window.audioManager.speakWow();
        this.sparkleParticles.emitParticleAt(powerUp.x, powerUp.y, 15);
        const wowPhrases = ['Super!', 'Wow!', 'Yeah!', 'Cool!', 'Toll!'];
        this.showSpeechBubble(wowPhrases[Math.floor(Math.random() * wowPhrases.length)]);
        let label = '';
        switch (type) {
            case 'powerup_fly': this.activateFlying(); label = 'FLUG!'; break;
            case 'powerup_life':
                this.lives = Math.min(this.lives + 1, 5);
                this.updateLivesDisplay(); label = '+1 LEBEN!'; break;
            case 'powerup_big': this.activateBig(); label = 'GROSS!'; break;
            case 'powerup_speed': this.activateSpeed(); label = 'SCHNELL!'; break;
            case 'powerup_star': this.activateStarPower(); label = 'UNBESIEGBAR!'; break;
        }
        const popup = this.add.text(player.x, player.y - 30, label, {
            fontSize: '24px', fontFamily: 'Georgia, serif',
            color: '#FFD700', stroke: '#8B4513', strokeThickness: 4,
            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 4, fill: true }
        }).setOrigin(0.5).setDepth(50);
        this.tweens.add({
            targets: popup, y: popup.y - 60, alpha: 0, scale: 1.5,
            duration: 1000, onComplete: () => popup.destroy()
        });
        powerUp.destroy();
        this.updatePowerUpDisplay();
    }

    activateFlying() {
        if (this._flyTimer) this._flyTimer.remove();
        this.isFlying = true;
        this.updatePowerUpDisplay();
        if (!this.isStarPower) this.player.setTint(0x87CEEB);
        window.audioManager.playTemporaryTrack('flying', 6000);
        this._flyTimer = this.time.delayedCall(6000, () => {
            this.isFlying = false;
            this.player.body.gravity.y = 0;
            this._flyTimer = null;
            if (!this.isStarPower) this.player.clearTint();
            this.updatePowerUpDisplay();
        });
    }

    activateBig() {
        // Vorherigen Big-Timer abbrechen falls aktiv
        if (this._bigTimer) this._bigTimer.remove();
        if (!this.isBig) {
            this.player.y -= 20;
        }
        this.isBig = true;
        this.player.setScale(1.4);
        // Plattform-Kollision deaktivieren damit man nicht stecken bleibt
        if (this._platformCollider) {
            this._platformCollider.active = false;
        }
        this.updatePowerUpDisplay();
        this._bigTimer = this.time.delayedCall(7000, () => {
            this.isBig = false;
            this.player.setScale(1);
            if (this._platformCollider) {
                this._platformCollider.active = true;
            }
            this._bigTimer = null;
            this.updatePowerUpDisplay();
        });
    }

    activateSpeed() {
        if (this._speedTimer) this._speedTimer.remove();
        this.isFast = true;
        this.updatePowerUpDisplay();
        window.audioManager.playTemporaryTrack('speed', 5000);
        this._speedTimer = this.time.delayedCall(5000, () => {
            this.isFast = false;
            this._speedTimer = null;
            this.updatePowerUpDisplay();
        });
    }

    _stopStarEffects() {
        if (this._starTween) { this._starTween.stop(); this._starTween = null; }
        if (this._starEmitter) { this._starEmitter.remove(); this._starEmitter = null; }
        if (this._starTimer) { this._starTimer.remove(); this._starTimer = null; }
    }

    activateStarPower() {
        // Vorherige Star-Effekte sauber beenden
        this._stopStarEffects();

        this.isStarPower = true;
        this.isInvulnerable = true;
        this.updatePowerUpDisplay();
        window.audioManager.playTemporaryTrack('invincible', 8000);
        this._starTween = this.tweens.addCounter({
            from: 0, to: 360, duration: 500, repeat: -1,
            onUpdate: (tween) => {
                if (!this.player || !this.player.active) return;
                const color = Phaser.Display.Color.HSLToColor(tween.getValue() / 360, 1, 0.6);
                this.player.setTint(color.color);
            }
        });
        this._starEmitter = this.time.addEvent({
            delay: 80,
            callback: () => {
                if (this.player && this.player.active) {
                    this.sparkleParticles.emitParticleAt(
                        this.player.x + Phaser.Math.Between(-20, 20),
                        this.player.y + Phaser.Math.Between(-20, 20), 2
                    );
                }
            },
            repeat: -1
        });
        this._starTimer = this.time.delayedCall(8000, () => {
            this.isStarPower = false;
            this.isInvulnerable = false;
            this._stopStarEffects();
            if (!this.isFlying) this.player.clearTint();
            else this.player.setTint(0x87CEEB);
            this.updatePowerUpDisplay();
        });
    }

    updateCooldowns(delta) {
        if (this.spitCooldown > 0) {
            this.spitCooldown -= delta;
            if (this.spitCooldown <= 0) this.spitCooldown = 0;
            this.updateSpitStatusText();
        }

        if (this.hurtCooldown > 0) {
            this.hurtCooldown -= delta;
            this.player.setAlpha(Math.sin(this.hurtCooldown * 0.02) > 0 ? 1 : 0.3);
            if (this.hurtCooldown <= 0 && !this.playerInTunnel) this.player.setAlpha(1);
        }
    }

    // Tunnel-Overlap Callback: markiert dass Spieler im Tunnel ist
    enterTunnel(player, zone) {
        this._tunnelOverlapThisFrame = true;
    }

    // Pro Frame pruefen ob Spieler noch im Tunnel ist
    updateTunnel() {
        if (this._tunnelOverlapThisFrame) {
            if (!this.playerInTunnel) {
                this.playerInTunnel = true;
                if (this.hurtCooldown <= 0) this.player.setAlpha(0);
            }
        } else {
            if (this.playerInTunnel) {
                this.playerInTunnel = false;
                if (this.hurtCooldown <= 0) this.player.setAlpha(1);
            }
        }
        this._tunnelOverlapThisFrame = false;
    }

    cleanupFarAway() {
        const px = this.player.x;
        const cleanDist = 2000;

        // Nur sehr weit entfernte Objekte aufräumen (hinter dem Spieler)
        [this.obstacles, this.sugarFlies, this.cupcakeBears,
         this.projectiles, this.llamaSpits, this.powerUps, this.stalactites, this.tunnelZones].forEach(group => {
            group.getChildren().forEach(obj => {
                if (obj.x < px - cleanDist || obj.y > 650) obj.destroy();
            });
        });

        // Deko aufräumen
        this.decoElements = this.decoElements.filter(d => {
            if (d.x < px - cleanDist) { d.destroy(); return false; }
            return true;
        });
        this.kitchenDecoElements = this.kitchenDecoElements.filter(d => {
            if (d.x < px - cleanDist) { d.destroy(); return false; }
            return true;
        });
        this.tunnelImages = this.tunnelImages.filter(d => {
            if (d.x < px - cleanDist) { d.destroy(); return false; }
            return true;
        });

        // Boden/Decke/Plattformen weit hinter dem Spieler aufräumen
        [this.groundGroup, this.ceilingGroup, this.platforms, this.itemBlocks].forEach(group => {
            group.getChildren().forEach(obj => {
                if (obj.x < px - cleanDist) obj.destroy();
            });
        });
    }

    gameOver() {
        window.audioManager.playGameOver();
        window.audioManager.speakOhNo();
        window.audioManager.stopMusic();
        this.showSpeechBubble('Oh nein!');
        this.physics.pause();
        this.player.setTint(0x888888);
        this.hitParticles.emitParticleAt(this.player.x, this.player.y, 30);
        this.time.delayedCall(1500, () => {
            this.scene.start('GameOverScene', {
                score: this.score,
                distance: Math.floor(this.maxPlayerX / 50),
                zone: Math.floor(this.maxPlayerX / this.zoneLength),
                difficulty: this.difficulty
            });
        });
    }
}

window.GameScene = GameScene;
