// Asset-Generator: Erstellt alle Spielgrafiken prozedural als Texturen
class AssetGenerator {

    static generate(scene) {
        this.createLlama(scene);
        this.createLlamaWalk(scene);
        this.createGround(scene);
        this.createGroundVariants(scene);
        this.createPlatform(scene);
        this.createObstacle(scene);
        this.createObstacleVariants(scene);
        this.createSugarFly(scene);
        this.createCupcakeBear(scene);
        this.createCupcakeProjectile(scene);
        this.createLlamaSpit(scene);
        this.createPowerUps(scene);
        this.createBackgrounds(scene);
        this.createParticle(scene);
        this.createHeart(scene);
        this.createSprinkle(scene);
        this.createKitchenItems(scene);
        this.createStalactite(scene);
        this.createItemBlock(scene);
        this.createBackgroundTrees(scene);
        this.createCupcakeTunnel(scene);
    }

    // Lama-Spielfigur (Seitenansicht, blickt nach rechts)
    static createLlama(scene) {
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0xFFF8DC);
        g.fillEllipse(24, 36, 32, 22);
        g.fillRect(32, 10, 10, 26);
        g.fillEllipse(40, 10, 16, 14);
        g.fillStyle(0xFFB6C1);
        g.fillEllipse(36, 2, 4, 8);
        g.fillStyle(0x000000);
        g.fillCircle(43, 8, 2);
        g.fillStyle(0xFFFFFF);
        g.fillCircle(44, 7, 0.8);
        g.fillStyle(0xFFE4C9);
        g.fillEllipse(47, 12, 8, 5);
        g.lineStyle(1, 0xFF69B4);
        g.beginPath();
        g.arc(46, 13, 2, 0, Math.PI, false);
        g.strokePath();
        g.lineStyle(3, 0xFFF8DC);
        g.beginPath();
        g.arc(6, 30, 6, -Math.PI * 0.8, -Math.PI * 0.1, false);
        g.strokePath();
        g.fillStyle(0xFFF8DC);
        g.fillRect(30, 44, 5, 12);
        g.fillRect(36, 44, 5, 12);
        g.fillRect(12, 44, 5, 12);
        g.fillRect(18, 44, 5, 12);
        g.fillStyle(0xD2691E);
        g.fillRect(30, 54, 5, 3);
        g.fillRect(36, 54, 5, 3);
        g.fillRect(12, 54, 5, 3);
        g.fillRect(18, 54, 5, 3);
        g.generateTexture('llama', 56, 58);
        g.destroy();
    }

    // Lama Walk-Frame (Seitenansicht, Beine versetzt)
    static createLlamaWalk(scene) {
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0xFFF8DC);
        g.fillEllipse(24, 36, 32, 22);
        g.fillRect(32, 10, 10, 26);
        g.fillEllipse(40, 10, 16, 14);
        g.fillStyle(0xFFB6C1);
        g.fillEllipse(36, 2, 4, 8);
        g.fillStyle(0x000000);
        g.fillCircle(43, 8, 2);
        g.fillStyle(0xFFFFFF);
        g.fillCircle(44, 7, 0.8);
        g.fillStyle(0xFFE4C9);
        g.fillEllipse(47, 12, 8, 5);
        g.lineStyle(1, 0xFF69B4);
        g.beginPath();
        g.arc(46, 13, 2, 0, Math.PI, false);
        g.strokePath();
        g.lineStyle(3, 0xFFF8DC);
        g.beginPath();
        g.arc(6, 30, 6, -Math.PI * 0.8, -Math.PI * 0.1, false);
        g.strokePath();
        g.fillStyle(0xFFF8DC);
        g.fillRect(32, 42, 5, 14);
        g.fillRect(38, 46, 5, 10);
        g.fillRect(10, 46, 5, 10);
        g.fillRect(16, 42, 5, 14);
        g.fillStyle(0xD2691E);
        g.fillRect(32, 54, 5, 3);
        g.fillRect(38, 54, 5, 3);
        g.fillRect(10, 54, 5, 3);
        g.fillRect(16, 54, 5, 3);
        g.generateTexture('llama_walk', 56, 58);
        g.destroy();
    }

    // Boden-Tile (Cup-Cake-Teig)
    static createGround(scene) {
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0xD2A679);
        g.fillRect(0, 0, 64, 48);
        g.fillStyle(0xFF69B4);
        g.fillRect(0, 0, 64, 8);
        g.fillStyle(0xFF85C2);
        for (let x = 0; x < 64; x += 16) {
            g.fillCircle(x + 8, 8, 6);
        }
        g.fillStyle(0xC4956A);
        for (let i = 0; i < 8; i++) {
            g.fillCircle(8 + (i % 4) * 16, 20 + Math.floor(i / 4) * 14, 2);
        }
        g.fillStyle(0xFF0000); g.fillRect(10, 3, 4, 2);
        g.fillStyle(0x00FF00); g.fillRect(30, 2, 4, 2);
        g.fillStyle(0xFFFF00); g.fillRect(50, 4, 4, 2);
        g.fillStyle(0x00FFFF); g.fillRect(20, 5, 3, 2);
        g.generateTexture('ground', 64, 48);
        g.destroy();
    }

    // Boden-Varianten für verschiedene Zonen
    static createGroundVariants(scene) {
        // Schokoladen-Zone
        const g1 = scene.make.graphics({ add: false });
        g1.fillStyle(0x5C3317);
        g1.fillRect(0, 0, 64, 48);
        g1.fillStyle(0x8B4513);
        g1.fillRect(0, 0, 64, 8);
        g1.fillStyle(0x6B3A1F);
        for (let x = 0; x < 64; x += 16) { g1.fillCircle(x + 8, 8, 6); }
        g1.fillStyle(0x4A2A0A);
        for (let i = 0; i < 6; i++) { g1.fillCircle(10 + i * 10, 25, 2); }
        // Schokostreusel
        g1.fillStyle(0xFFFFFF); g1.fillRect(15, 3, 4, 2);
        g1.fillStyle(0xFF69B4); g1.fillRect(40, 2, 4, 2);
        g1.generateTexture('ground_choco', 64, 48);
        g1.destroy();

        // Minz-Zone
        const g2 = scene.make.graphics({ add: false });
        g2.fillStyle(0x98D4BB);
        g2.fillRect(0, 0, 64, 48);
        g2.fillStyle(0x40E0D0);
        g2.fillRect(0, 0, 64, 8);
        g2.fillStyle(0x5EDFC5);
        for (let x = 0; x < 64; x += 16) { g2.fillCircle(x + 8, 8, 6); }
        g2.fillStyle(0x7ABFA5);
        for (let i = 0; i < 6; i++) { g2.fillCircle(10 + i * 10, 25, 2); }
        g2.fillStyle(0xFFFFFF); g2.fillRect(12, 3, 5, 2);
        g2.fillStyle(0x006400); g2.fillRect(35, 4, 4, 2);
        g2.generateTexture('ground_mint', 64, 48);
        g2.destroy();

        // Erdbeer-Zone
        const g3 = scene.make.graphics({ add: false });
        g3.fillStyle(0xC9636A);
        g3.fillRect(0, 0, 64, 48);
        g3.fillStyle(0xFF4060);
        g3.fillRect(0, 0, 64, 8);
        g3.fillStyle(0xFF6080);
        for (let x = 0; x < 64; x += 16) { g3.fillCircle(x + 8, 8, 6); }
        g3.fillStyle(0xA44050);
        for (let i = 0; i < 6; i++) { g3.fillCircle(10 + i * 10, 25, 2); }
        // Erdbeer-Samen
        g3.fillStyle(0xFFFF00);
        for (let i = 0; i < 8; i++) {
            g3.fillRect(5 + i * 8, 15 + (i % 3) * 10, 2, 3);
        }
        g3.generateTexture('ground_strawberry', 64, 48);
        g3.destroy();

        // Karamell-Zone
        const g4 = scene.make.graphics({ add: false });
        g4.fillStyle(0xC68E3C);
        g4.fillRect(0, 0, 64, 48);
        g4.fillStyle(0xE8A832);
        g4.fillRect(0, 0, 64, 8);
        g4.fillStyle(0xD4993A);
        for (let x = 0; x < 64; x += 16) { g4.fillCircle(x + 8, 8, 6); }
        g4.fillStyle(0xA87830);
        for (let i = 0; i < 6; i++) { g4.fillCircle(10 + i * 10, 28, 2); }
        g4.generateTexture('ground_caramel', 64, 48);
        g4.destroy();
    }

    // Plattform (schwebendes Kuchenstück)
    static createPlatform(scene) {
        const g = scene.make.graphics({ add: false });
        // Teig
        g.fillStyle(0xE8C890);
        g.fillRoundedRect(0, 8, 80, 16, 4);
        // Zuckerguss oben
        g.fillStyle(0xFF69B4);
        g.fillRoundedRect(0, 4, 80, 10, 6);
        // Streusel
        const cols = [0xFF0000, 0x00FF00, 0xFFFF00, 0x00FFFF, 0xFF00FF];
        for (let i = 0; i < 6; i++) {
            g.fillStyle(cols[i % cols.length]);
            g.fillRect(8 + i * 12, 6 + (i % 2) * 3, 4, 2);
        }
        g.generateTexture('platform', 80, 24);
        g.destroy();

        // Kleine Plattform
        const g2 = scene.make.graphics({ add: false });
        g2.fillStyle(0xE8C890);
        g2.fillRoundedRect(0, 8, 48, 14, 4);
        g2.fillStyle(0xAA66CC);
        g2.fillRoundedRect(0, 4, 48, 10, 6);
        for (let i = 0; i < 3; i++) {
            g2.fillStyle(cols[i % cols.length]);
            g2.fillRect(8 + i * 14, 6, 4, 2);
        }
        g2.generateTexture('platform_small', 48, 22);
        g2.destroy();
    }

    // Hindernis (Zuckerstange)
    static createObstacle(scene) {
        const g = scene.make.graphics({ add: false });
        for (let y = 0; y < 48; y += 8) {
            g.fillStyle(y % 16 === 0 ? 0xFF0000 : 0xFFFFFF);
            g.fillRect(4, y, 16, 8);
        }
        g.fillStyle(0xFF0000);
        g.fillCircle(12, 4, 8);
        g.generateTexture('obstacle', 24, 48);
        g.destroy();
    }

    // Zusätzliche Hindernis-Varianten
    static createObstacleVariants(scene) {
        // Schokoladen-Brunnen (tropfend)
        const g1 = scene.make.graphics({ add: false });
        g1.fillStyle(0x5C3317);
        g1.fillRoundedRect(4, 10, 24, 38, 4);
        g1.fillStyle(0x8B4513);
        g1.fillRoundedRect(0, 6, 32, 10, 5);
        // Schokolade tropft über
        g1.fillStyle(0x3D1F0A);
        g1.fillRoundedRect(8, 0, 6, 14, 3);
        g1.fillRoundedRect(20, 0, 6, 10, 3);
        g1.generateTexture('obstacle_choco', 32, 48);
        g1.destroy();

        // Gummibärchen-Hindernis
        const g2 = scene.make.graphics({ add: false });
        g2.fillStyle(0xFF4040);
        // Körper
        g2.fillRoundedRect(4, 12, 24, 28, 8);
        // Kopf
        g2.fillCircle(16, 10, 10);
        // Ohren
        g2.fillCircle(8, 4, 5);
        g2.fillCircle(24, 4, 5);
        // Augen
        g2.fillStyle(0x000000);
        g2.fillCircle(12, 9, 2);
        g2.fillCircle(20, 9, 2);
        // Bauch-Linie
        g2.lineStyle(1, 0xCC3030);
        g2.beginPath();
        g2.arc(16, 26, 6, 0, Math.PI, false);
        g2.strokePath();
        g2.generateTexture('obstacle_gummy', 32, 42);
        g2.destroy();

        // Donut-Ring (muss man durchspringen)
        const g3 = scene.make.graphics({ add: false });
        g3.fillStyle(0xE8A060);
        g3.fillCircle(24, 24, 24);
        g3.fillStyle(0xFF69B4);
        g3.fillCircle(24, 22, 22);
        // Loch
        g3.fillStyle(0x000000, 0);
        g3.fillCircle(24, 24, 10);
        // Streusel auf dem Donut
        g3.fillStyle(0xFF0000); g3.fillRect(10, 10, 4, 2);
        g3.fillStyle(0x00FF00); g3.fillRect(30, 8, 4, 2);
        g3.fillStyle(0xFFFF00); g3.fillRect(20, 6, 4, 2);
        g3.fillStyle(0x00FFFF); g3.fillRect(36, 14, 4, 2);
        g3.generateTexture('obstacle_donut', 48, 48);
        g3.destroy();

        // Stalaktit von der Decke (Zuckerguss-Tropfen)
        const g4 = scene.make.graphics({ add: false });
        g4.fillStyle(0xFFB6C1);
        g4.fillTriangle(12, 60, 0, 0, 24, 0);
        g4.fillStyle(0xFF85C2);
        g4.fillTriangle(12, 45, 3, 0, 21, 0);
        // Glanz
        g4.fillStyle(0xFFFFFF, 0.4);
        g4.fillRect(8, 5, 3, 20);
        g4.generateTexture('stalactite', 24, 60);
        g4.destroy();

        // Sahne-Klecks am Boden (rutschig)
        const g5 = scene.make.graphics({ add: false });
        g5.fillStyle(0xFFFDD0);
        g5.fillEllipse(24, 12, 48, 20);
        g5.fillStyle(0xFFFFFF);
        g5.fillEllipse(24, 8, 40, 12);
        // Sahne-Spitze
        g5.fillCircle(24, 3, 6);
        g5.generateTexture('obstacle_cream', 48, 24);
        g5.destroy();
    }

    // Zuckerfliege
    static createSugarFly(scene) {
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0xFFD700);
        g.fillCircle(12, 14, 8);
        g.fillStyle(0xFFFFFF, 0.7);
        g.fillEllipse(6, 6, 10, 8);
        g.fillEllipse(18, 6, 10, 8);
        g.fillStyle(0x000000);
        g.fillCircle(9, 12, 2);
        g.fillCircle(15, 12, 2);
        g.fillStyle(0xFFA500);
        g.fillRect(6, 14, 12, 2);
        g.fillRect(6, 18, 12, 2);
        g.generateTexture('sugarfly', 24, 24);
        g.destroy();
    }

    // Cup-Cake-Bär
    static createCupcakeBear(scene) {
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0xE8A0BF);
        g.fillRect(8, 28, 32, 20);
        g.fillStyle(0x8B4513);
        g.fillCircle(24, 24, 18);
        g.fillCircle(10, 10, 8);
        g.fillCircle(38, 10, 8);
        g.fillStyle(0xFFB6C1);
        g.fillCircle(10, 10, 4);
        g.fillCircle(38, 10, 4);
        g.fillStyle(0xFF0000);
        g.fillCircle(18, 22, 3);
        g.fillCircle(30, 22, 3);
        g.fillStyle(0x000000);
        g.fillCircle(18, 22, 1.5);
        g.fillCircle(30, 22, 1.5);
        g.lineStyle(2, 0x000000);
        g.beginPath();
        g.arc(24, 30, 5, 0, Math.PI, false);
        g.strokePath();
        g.lineStyle(1, 0xCC80A0);
        for (let x = 10; x < 38; x += 4) {
            g.beginPath(); g.moveTo(x, 28); g.lineTo(x, 48); g.strokePath();
        }
        g.generateTexture('cupcakebear', 48, 48);
        g.destroy();
    }

    // Cupcake-Projektil
    static createCupcakeProjectile(scene) {
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0xE8A0BF);
        g.fillRect(2, 10, 16, 8);
        g.fillStyle(0xFF69B4);
        g.fillCircle(10, 10, 8);
        g.fillStyle(0xFF0000);
        g.fillCircle(10, 4, 3);
        g.generateTexture('cupcake_proj', 20, 20);
        g.destroy();
    }

    static createLlamaSpit(scene) {
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0x8EF3FF);
        g.fillCircle(8, 8, 7);
        g.fillStyle(0xD7FCFF);
        g.fillCircle(10, 6, 3);
        g.lineStyle(2, 0x4ACCE0, 0.8);
        g.strokeCircle(8, 8, 7);
        g.generateTexture('llama_spit', 16, 16);
        g.destroy();
    }

    // Power-Ups
    static createPowerUps(scene) {
        const gFly = scene.make.graphics({ add: false });
        gFly.fillStyle(0x87CEEB);
        gFly.fillCircle(12, 12, 12);
        gFly.fillStyle(0xFFFFFF);
        gFly.fillTriangle(4, 12, 12, 6, 12, 18);
        gFly.fillTriangle(20, 12, 12, 6, 12, 18);
        gFly.generateTexture('powerup_fly', 24, 24);
        gFly.destroy();

        const gLife = scene.make.graphics({ add: false });
        gLife.fillStyle(0xFF1493);
        gLife.fillCircle(8, 8, 6);
        gLife.fillCircle(16, 8, 6);
        gLife.fillTriangle(2, 10, 22, 10, 12, 22);
        gLife.generateTexture('powerup_life', 24, 24);
        gLife.destroy();

        const gBig = scene.make.graphics({ add: false });
        gBig.fillStyle(0x32CD32);
        gBig.fillCircle(12, 12, 12);
        gBig.fillStyle(0xFFFFFF);
        gBig.fillRect(8, 4, 8, 16);
        gBig.fillRect(4, 8, 16, 8);
        gBig.generateTexture('powerup_big', 24, 24);
        gBig.destroy();

        const gSpeed = scene.make.graphics({ add: false });
        gSpeed.fillStyle(0xFFD700);
        gSpeed.fillCircle(12, 12, 12);
        gSpeed.fillStyle(0xFFFFFF);
        gSpeed.fillTriangle(14, 2, 6, 14, 14, 12);
        gSpeed.fillTriangle(10, 12, 18, 10, 10, 22);
        gSpeed.generateTexture('powerup_speed', 24, 24);
        gSpeed.destroy();

        const gStar = scene.make.graphics({ add: false });
        gStar.fillStyle(0xDA70D6);
        gStar.fillCircle(12, 12, 12);
        gStar.fillStyle(0xFFFF00);
        gStar.fillTriangle(12, 2, 8, 18, 22, 8);
        gStar.fillTriangle(12, 22, 2, 8, 16, 18);
        gStar.generateTexture('powerup_star', 24, 24);
        gStar.destroy();
    }

    // Mehrere Hintergründe für Zonen
    static createBackgrounds(scene) {
        const zones = [
            { key: 'bg_pink',   top: [255,180,220], bot: [80,40,120], drops: 0xFFB6C1 },
            { key: 'bg_choco',  top: [140,90,50],   bot: [50,25,15],  drops: 0x8B4513 },
            { key: 'bg_mint',   top: [150,230,210], bot: [30,80,70],  drops: 0x40E0D0 },
            { key: 'bg_strawberry', top: [255,150,150], bot: [120,30,50], drops: 0xFF6080 },
            { key: 'bg_caramel', top: [230,190,120], bot: [100,60,20], drops: 0xD4993A }
        ];

        zones.forEach(z => {
            const g = scene.make.graphics({ add: false });
            const w = 800, h = 600;
            for (let y = 0; y < h; y++) {
                const t = y / h;
                const r = Math.floor(z.top[0] * (1-t) + z.bot[0] * t);
                const green = Math.floor(z.top[1] * (1-t) + z.bot[1] * t);
                const b = Math.floor(z.top[2] * (1-t) + z.bot[2] * t);
                g.fillStyle(Phaser.Display.Color.GetColor(r, green, b));
                g.fillRect(0, y, w, 1);
            }
            // Zuckerguss-Tropfen Decke
            g.fillStyle(z.drops, 0.5);
            for (let x = 0; x < w; x += 55) {
                const dropH = 25 + Math.random() * 45;
                g.fillRoundedRect(x, 0, 18, dropH, 8);
            }
            // Streusel
            const colors = [0xFF6B6B, 0x4ECDC4, 0xFFE66D, 0xFF69B4, 0xA78BFA, 0x6BCB77];
            for (let i = 0; i < 40; i++) {
                g.fillStyle(colors[i % colors.length], 0.25);
                g.fillRect(Math.random() * w, Math.random() * h * 0.7, 8, 3);
            }
            g.fillStyle(0xFFFFFF, 0.06);
            for (let i = 0; i < 6; i++) {
                g.fillCircle(Math.random() * w, Math.random() * h * 0.8, 20 + Math.random() * 35);
            }
            g.generateTexture(z.key, w, h);
            g.destroy();
        });

        // bg_pink wird auch als Fallback in Menü/GameOver genutzt
    }

    // Küchengegenstände als Hintergrund-Deko
    static createKitchenItems(scene) {
        // Mixer / Rührgerät
        const gM = scene.make.graphics({ add: false });
        gM.fillStyle(0xCCCCCC);
        // Griff
        gM.fillRoundedRect(20, 0, 20, 14, 4);
        // Motorgehäuse
        gM.fillRoundedRect(14, 12, 32, 24, 6);
        // Knopf
        gM.fillStyle(0xFF0000);
        gM.fillCircle(30, 20, 4);
        // Rührstäbe
        gM.fillStyle(0xAAAAAA);
        gM.fillRect(18, 36, 4, 30);
        gM.fillRect(28, 36, 4, 30);
        gM.fillRect(38, 36, 4, 30);
        // Rührstab-Enden
        gM.fillStyle(0x999999);
        gM.fillCircle(20, 64, 4);
        gM.fillCircle(30, 64, 4);
        gM.fillCircle(40, 64, 4);
        gM.generateTexture('kitchen_mixer', 60, 70);
        gM.destroy();

        // Schneebesen
        const gW = scene.make.graphics({ add: false });
        gW.fillStyle(0xCCCCCC);
        gW.fillRect(10, 0, 4, 20); // Griff
        gW.lineStyle(2, 0xAAAAAA);
        for (let i = 0; i < 5; i++) {
            gW.beginPath();
            gW.moveTo(12, 20);
            gW.lineTo(4 + i * 4, 50);
            gW.strokePath();
        }
        // Draht-Bögen
        gW.lineStyle(1.5, 0xBBBBBB);
        gW.beginPath();
        gW.arc(12, 42, 10, 0, Math.PI, false);
        gW.strokePath();
        gW.generateTexture('kitchen_whisk', 24, 55);
        gW.destroy();

        // Nudelholz / Teigrolle
        const gR = scene.make.graphics({ add: false });
        gR.fillStyle(0xD2A679);
        gR.fillRoundedRect(10, 8, 60, 16, 8);
        // Griffe
        gR.fillStyle(0x8B4513);
        gR.fillRoundedRect(0, 10, 14, 12, 4);
        gR.fillRoundedRect(66, 10, 14, 12, 4);
        gR.generateTexture('kitchen_roller', 80, 32);
        gR.destroy();

        // Rührschüssel
        const gB = scene.make.graphics({ add: false });
        gB.fillStyle(0xE8E0D0);
        gB.fillEllipse(30, 20, 60, 30);
        gB.fillStyle(0xDDCCBB);
        gB.fillEllipse(30, 18, 50, 22);
        // Teig in der Schüssel
        gB.fillStyle(0xF5DEB3, 0.8);
        gB.fillEllipse(30, 16, 42, 16);
        gB.generateTexture('kitchen_bowl', 60, 36);
        gB.destroy();

        // Backblech/Muffinform
        const gT = scene.make.graphics({ add: false });
        gT.fillStyle(0x888888);
        gT.fillRoundedRect(0, 0, 70, 30, 4);
        // Muffin-Löcher
        gT.fillStyle(0x666666);
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 3; col++) {
                gT.fillCircle(12 + col * 22, 8 + row * 14, 8);
            }
        }
        gT.generateTexture('kitchen_tray', 70, 30);
        gT.destroy();

        // Spritzbeutel
        const gP = scene.make.graphics({ add: false });
        gP.fillStyle(0xFFFFFF);
        gP.fillTriangle(20, 0, 0, 40, 40, 40);
        // Spitze
        gP.fillStyle(0xCCCCCC);
        gP.fillTriangle(20, 40, 16, 50, 24, 50);
        // Streifen
        gP.lineStyle(1, 0xDDDDDD);
        gP.beginPath(); gP.moveTo(20, 5); gP.lineTo(8, 40); gP.strokePath();
        gP.beginPath(); gP.moveTo(20, 5); gP.lineTo(32, 40); gP.strokePath();
        gP.generateTexture('kitchen_pipingbag', 40, 52);
        gP.destroy();

        // Waage
        const gS = scene.make.graphics({ add: false });
        gS.fillStyle(0xCCCCCC);
        gS.fillRoundedRect(8, 20, 44, 16, 4);
        // Anzeige
        gS.fillStyle(0x333333);
        gS.fillRoundedRect(18, 22, 24, 8, 2);
        gS.fillStyle(0x00FF00);
        gS.fillRect(22, 24, 8, 4); // Display
        // Schale oben
        gS.fillStyle(0xDDDDDD);
        gS.fillEllipse(30, 14, 50, 12);
        gS.generateTexture('kitchen_scale', 60, 38);
        gS.destroy();
    }

    // Stalaktit für Decke
    static createStalactite(scene) {
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0xFFB6C1);
        g.fillTriangle(12, 50, 0, 0, 24, 0);
        g.fillStyle(0xFFCCDD, 0.5);
        g.fillRect(8, 3, 3, 20);
        g.generateTexture('stalactite_deco', 24, 50);
        g.destroy();
    }

    // Partikel-Textur
    static createParticle(scene) {
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0xFFFFFF);
        g.fillCircle(4, 4, 4);
        g.generateTexture('particle', 8, 8);
        g.destroy();
    }

    // Herz für HUD
    static createHeart(scene) {
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0xFF1493);
        g.fillCircle(6, 5, 5);
        g.fillCircle(14, 5, 5);
        g.fillTriangle(1, 7, 19, 7, 10, 18);
        g.generateTexture('heart', 20, 20);
        g.destroy();
    }

    // Streusel-Deko
    static createSprinkle(scene) {
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0xFF69B4);
        g.fillRoundedRect(0, 0, 8, 3, 1);
        g.generateTexture('sprinkle', 8, 3);
        g.destroy();
    }
    // Hintergrund-Baeume und Pflanzen pro Zone
    static createBackgroundTrees(scene) {
        // --- Rosa Zone: Lollipop-Baum ---
        const gL = scene.make.graphics({ add: false });
        // Stiel
        gL.fillStyle(0xFFFFFF);
        gL.fillRoundedRect(22, 40, 6, 60, 3);
        gL.fillStyle(0xFF69B4, 0.6);
        for (let y = 42; y < 96; y += 12) { gL.fillRect(22, y, 6, 5); }
        // Lutscher-Kopf (Spirale)
        gL.fillStyle(0xFF69B4);
        gL.fillCircle(25, 28, 26);
        gL.fillStyle(0xFFB6C1);
        gL.fillCircle(25, 28, 20);
        gL.fillStyle(0xFF69B4);
        gL.fillCircle(25, 28, 14);
        gL.fillStyle(0xFFD1DC);
        gL.fillCircle(25, 28, 8);
        gL.fillStyle(0xFFFFFF);
        gL.fillCircle(25, 26, 4);
        gL.generateTexture('tree_lollipop', 50, 100);
        gL.destroy();

        // --- Rosa Zone: Zuckerwatte-Baum ---
        const gC = scene.make.graphics({ add: false });
        gC.fillStyle(0xD2A679);
        gC.fillRoundedRect(18, 50, 8, 55, 3);
        // Zuckerwatte-Krone (fluffig)
        gC.fillStyle(0xFFB6C1, 0.8);
        gC.fillCircle(22, 30, 22);
        gC.fillCircle(10, 38, 16);
        gC.fillCircle(34, 38, 16);
        gC.fillCircle(16, 18, 14);
        gC.fillCircle(30, 20, 15);
        gC.fillStyle(0xFFD1DC, 0.5);
        gC.fillCircle(20, 24, 12);
        gC.fillCircle(28, 32, 10);
        gC.generateTexture('tree_cottoncandy', 50, 105);
        gC.destroy();

        // --- Schoko Zone: Schokoladen-Baum ---
        const gS = scene.make.graphics({ add: false });
        // Stamm
        gS.fillStyle(0x5C3317);
        gS.fillRoundedRect(18, 45, 10, 60, 4);
        gS.fillStyle(0x4A2A0A);
        gS.fillRoundedRect(20, 50, 6, 55, 3);
        // Aeste
        gS.fillStyle(0x5C3317);
        gS.fillRect(10, 52, 14, 5);
        gS.fillRect(24, 60, 14, 5);
        // Krone (dunkle Schokolade)
        gS.fillStyle(0x3D1F0A);
        gS.fillCircle(23, 28, 24);
        gS.fillCircle(12, 38, 16);
        gS.fillCircle(34, 36, 17);
        // Schoko-Glasur-Tropfen
        gS.fillStyle(0x8B4513, 0.7);
        gS.fillCircle(23, 22, 16);
        gS.fillCircle(14, 30, 10);
        gS.fillCircle(32, 28, 11);
        // Pralinen-Details
        gS.fillStyle(0xFFFFFF, 0.3);
        gS.fillCircle(18, 20, 3);
        gS.fillCircle(28, 26, 2);
        gS.generateTexture('tree_choco', 50, 105);
        gS.destroy();

        // --- Schoko Zone: Kakao-Pilz ---
        const gP = scene.make.graphics({ add: false });
        gP.fillStyle(0xE8D0B0);
        gP.fillRoundedRect(14, 40, 8, 40, 3);
        // Pilzkopf
        gP.fillStyle(0x8B4513);
        gP.fillEllipse(18, 34, 36, 26);
        gP.fillStyle(0xD2A679, 0.5);
        gP.fillCircle(12, 30, 5);
        gP.fillCircle(24, 28, 4);
        gP.fillCircle(18, 36, 3);
        gP.generateTexture('tree_mushroom', 36, 80);
        gP.destroy();

        // --- Minz Zone: Kristall-Saeule ---
        const gK = scene.make.graphics({ add: false });
        gK.fillStyle(0x40E0D0, 0.7);
        gK.fillTriangle(20, 0, 8, 90, 32, 90);
        gK.fillStyle(0x7FFFD4, 0.5);
        gK.fillTriangle(20, 10, 12, 90, 28, 90);
        gK.fillStyle(0xFFFFFF, 0.3);
        gK.fillRect(17, 15, 3, 50);
        // Kleine Kristalle daneben
        gK.fillStyle(0x40E0D0, 0.5);
        gK.fillTriangle(6, 50, 0, 90, 12, 90);
        gK.fillTriangle(34, 40, 28, 90, 40, 90);
        gK.generateTexture('tree_crystal', 40, 90);
        gK.destroy();

        // --- Minz Zone: Minz-Pflanze ---
        const gMP = scene.make.graphics({ add: false });
        gMP.fillStyle(0x2E8B57);
        gMP.fillRoundedRect(16, 50, 6, 40, 2);
        // Blaetter
        gMP.fillStyle(0x3CB371, 0.8);
        gMP.fillEllipse(10, 44, 18, 12);
        gMP.fillEllipse(28, 40, 18, 12);
        gMP.fillEllipse(8, 32, 16, 10);
        gMP.fillEllipse(30, 28, 16, 10);
        gMP.fillEllipse(18, 22, 20, 14);
        gMP.fillStyle(0x98FB98, 0.4);
        gMP.fillEllipse(18, 26, 12, 8);
        gMP.generateTexture('tree_mint', 40, 90);
        gMP.destroy();

        // --- Erdbeer Zone: Erdbeer-Busch ---
        const gEB = scene.make.graphics({ add: false });
        gEB.fillStyle(0x228B22);
        gEB.fillRoundedRect(18, 50, 8, 40, 3);
        // Busch-Krone
        gEB.fillStyle(0x32CD32, 0.8);
        gEB.fillCircle(22, 32, 22);
        gEB.fillCircle(10, 40, 15);
        gEB.fillCircle(34, 38, 16);
        gEB.fillStyle(0x3CB371, 0.6);
        gEB.fillCircle(22, 28, 14);
        // Erdbeeren
        gEB.fillStyle(0xFF2040);
        gEB.fillCircle(10, 32, 5);
        gEB.fillCircle(30, 28, 4);
        gEB.fillCircle(20, 38, 5);
        gEB.fillCircle(34, 40, 4);
        // Samen auf den Erdbeeren
        gEB.fillStyle(0xFFFF00);
        gEB.fillRect(9, 31, 2, 1); gEB.fillRect(29, 27, 2, 1);
        gEB.fillRect(19, 37, 2, 1); gEB.fillRect(33, 39, 2, 1);
        gEB.generateTexture('tree_strawberry', 50, 90);
        gEB.destroy();

        // --- Erdbeer Zone: Blumen-Stiel ---
        const gBl = scene.make.graphics({ add: false });
        gBl.fillStyle(0x228B22);
        gBl.fillRoundedRect(13, 30, 5, 55, 2);
        // Blaetter am Stiel
        gBl.fillStyle(0x32CD32);
        gBl.fillEllipse(8, 55, 14, 8);
        gBl.fillEllipse(22, 45, 14, 8);
        // Bluete oben
        gBl.fillStyle(0xFF6080);
        gBl.fillCircle(15, 18, 12);
        gBl.fillCircle(8, 22, 8);
        gBl.fillCircle(22, 22, 8);
        gBl.fillStyle(0xFFFF00);
        gBl.fillCircle(15, 20, 5);
        gBl.generateTexture('tree_flower', 32, 85);
        gBl.destroy();

        // --- Karamell Zone: Karamell-Palme ---
        const gKP = scene.make.graphics({ add: false });
        // Stamm (Waffelrolle)
        gKP.fillStyle(0xD2A679);
        gKP.fillRoundedRect(18, 35, 10, 70, 4);
        gKP.lineStyle(1, 0xC4956A, 0.5);
        for (let y = 40; y < 100; y += 8) {
            gKP.beginPath();
            gKP.moveTo(18, y); gKP.lineTo(28, y + 4);
            gKP.strokePath();
            gKP.beginPath();
            gKP.moveTo(28, y); gKP.lineTo(18, y + 4);
            gKP.strokePath();
        }
        // Palmenblaetter (Karamell-Faecher)
        gKP.fillStyle(0xE8A832, 0.8);
        gKP.fillTriangle(23, 20, -5, 40, 15, 50);
        gKP.fillTriangle(23, 20, 51, 40, 31, 50);
        gKP.fillTriangle(23, 18, 5, 10, 10, 40);
        gKP.fillTriangle(23, 18, 41, 10, 36, 40);
        gKP.fillStyle(0xD4993A, 0.6);
        gKP.fillTriangle(23, 24, 0, 44, 18, 48);
        gKP.fillTriangle(23, 24, 46, 44, 28, 48);
        // Karamell-Tropfen
        gKP.fillStyle(0xC68E3C);
        gKP.fillCircle(23, 16, 6);
        gKP.generateTexture('tree_palm', 50, 105);
        gKP.destroy();

        // --- Karamell Zone: Brezel-Busch ---
        const gBr = scene.make.graphics({ add: false });
        gBr.fillStyle(0xD2A679);
        gBr.fillRoundedRect(14, 40, 6, 30, 2);
        // Brezel-Form
        gBr.lineStyle(5, 0xC68E3C);
        gBr.beginPath();
        gBr.arc(12, 24, 12, Math.PI * 0.3, Math.PI * 1.7, false);
        gBr.strokePath();
        gBr.beginPath();
        gBr.arc(24, 24, 12, Math.PI * 1.3, Math.PI * 2.7, false);
        gBr.strokePath();
        // Salzkristalle
        gBr.fillStyle(0xFFFFFF, 0.7);
        gBr.fillRect(8, 18, 3, 2);
        gBr.fillRect(22, 16, 3, 2);
        gBr.fillRect(16, 28, 3, 2);
        gBr.generateTexture('tree_pretzel', 36, 70);
        gBr.destroy();
    }

    // Cupcake-Tunnel: Grosser Cupcake mit Loch zum Durchlaufen
    static createCupcakeTunnel(scene) {
        const w = 140, h = 130;
        // Canvas-basiert fuer transparentes Loch
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');

        // --- Muffin-Foermchen (unten) ---
        // Trapezform
        ctx.fillStyle = '#E8A0BF';
        ctx.beginPath();
        ctx.moveTo(15, 55);
        ctx.lineTo(5, h);
        ctx.lineTo(w - 5, h);
        ctx.lineTo(w - 15, 55);
        ctx.closePath();
        ctx.fill();
        // Rillen im Foermchen
        ctx.strokeStyle = '#CC80A0';
        ctx.lineWidth = 1.5;
        for (let x = 20; x < w - 15; x += 8) {
            ctx.beginPath();
            ctx.moveTo(x, 58);
            ctx.lineTo(x - 3, h - 2);
            ctx.stroke();
        }

        // --- Frosting / Glasur (oben) ---
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.ellipse(w / 2, 45, 62, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        // Frosting-Wellen oben
        ctx.fillStyle = '#FF85C2';
        for (let x = 20; x < w - 10; x += 22) {
            ctx.beginPath();
            ctx.arc(x, 26, 16, 0, Math.PI * 2);
            ctx.fill();
        }
        // Frosting-Spitze
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.arc(w / 2, 14, 14, 0, Math.PI * 2);
        ctx.fill();
        // Kirsche oben
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(w / 2, 6, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#CC0000';
        ctx.beginPath();
        ctx.arc(w / 2 - 2, 4, 3, 0, Math.PI * 2);
        ctx.fill();
        // Stiel
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w / 2, 0);
        ctx.quadraticCurveTo(w / 2 + 8, -2, w / 2 + 2, 4);
        ctx.stroke();

        // Streusel auf dem Frosting
        const sprinkleColors = ['#FF0000', '#00FF00', '#FFFF00', '#00FFFF', '#FF00FF', '#FFFFFF'];
        for (let i = 0; i < 12; i++) {
            ctx.fillStyle = sprinkleColors[i % sprinkleColors.length];
            const sx = 25 + Math.random() * 90;
            const sy = 18 + Math.random() * 30;
            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(Math.random() * Math.PI);
            ctx.fillRect(-4, -1, 8, 3);
            ctx.restore();
        }

        // --- Tunnel-Loch (transparent ausschneiden) ---
        ctx.globalCompositeOperation = 'destination-out';
        // Ovales Loch im unteren Bereich (Muffin-Teil)
        ctx.beginPath();
        ctx.ellipse(w / 2, 90, 32, 34, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';

        // Tunnel-Rand (Innenseite sichtbar machen)
        ctx.strokeStyle = '#C4706A';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(w / 2, 90, 32, 34, 0, 0, Math.PI * 2);
        ctx.stroke();
        // Innere Schattierung oben im Loch
        ctx.strokeStyle = 'rgba(80, 30, 20, 0.4)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(w / 2, 90, 30, 32, 0, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();

        scene.textures.addCanvas('cupcake_tunnel', canvas);
    }

    // ?-Block (Power-up-Block, von unten anspringen)
    static createItemBlock(scene) {
        // Aktiver Block (mit ?)
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0xFFD700);
        g.fillRoundedRect(0, 0, 32, 32, 4);
        g.lineStyle(2, 0xCC9900);
        g.strokeRoundedRect(0, 0, 32, 32, 4);
        // Innerer Rand
        g.lineStyle(1, 0xFFEE88);
        g.strokeRoundedRect(3, 3, 26, 26, 3);
        // Fragezeichen
        g.fillStyle(0x8B4513);
        g.fillRoundedRect(11, 6, 10, 4, 2);
        g.fillRect(17, 10, 4, 8);
        g.fillCircle(19, 24, 2.5);
        g.generateTexture('item_block', 32, 32);
        g.destroy();

        // Leerer Block (bereits getroffen)
        const g2 = scene.make.graphics({ add: false });
        g2.fillStyle(0x886633);
        g2.fillRoundedRect(0, 0, 32, 32, 4);
        g2.lineStyle(2, 0x664422);
        g2.strokeRoundedRect(0, 0, 32, 32, 4);
        g2.lineStyle(1, 0x997744);
        g2.strokeRoundedRect(3, 3, 26, 26, 3);
        g2.generateTexture('item_block_empty', 32, 32);
        g2.destroy();
    }
}

window.AssetGenerator = AssetGenerator;
