// GameOverScene: Endbildschirm mit Score und Neustart
class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.finalDistance = data.distance || 0;
        this.zonesReached = (data.zone || 0) + 1;
        this.difficulty = data.difficulty || 'mittel';
    }

    create() {
        this.add.image(400, 300, 'bg_pink');

        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.6);
        overlay.fillRect(0, 0, 800, 600);

        const box = this.add.graphics();
        box.fillStyle(0x2a0a2a, 0.9);
        box.fillRoundedRect(150, 80, 500, 440, 20);
        box.lineStyle(4, 0xFF69B4);
        box.strokeRoundedRect(150, 80, 500, 440, 20);

        // Titel
        this.add.text(400, 125, 'GAME OVER', {
            fontSize: '48px', fontFamily: 'Georgia, serif',
            color: '#FF1493', stroke: '#000', strokeThickness: 6,
            shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 8, fill: true }
        }).setOrigin(0.5);

        // Lama
        const llama = this.add.image(400, 210, 'llama').setScale(2);
        llama.setTint(0xAAAAAA);
        this.tweens.add({
            targets: llama, angle: -5, duration: 500,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        // Schwierigkeit
        const diffColors = { einfach: '#6BCB77', mittel: '#FFD700', schwer: '#FF4040' };
        const diffLabels = { einfach: 'Einfach', mittel: 'Mittel', schwer: 'Schwer' };
        this.add.text(400, 270, diffLabels[this.difficulty] || 'Mittel', {
            fontSize: '16px', fontFamily: 'monospace',
            color: diffColors[this.difficulty] || '#FFD700',
            stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5);

        // Score
        this.add.text(400, 300, 'Punkte: ' + this.finalScore, {
            fontSize: '30px', fontFamily: 'Georgia, serif',
            color: '#FFD700', stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5);

        // Distanz + Zonen
        this.add.text(400, 338, 'Distanz: ' + this.finalDistance + 'm  |  Zonen: ' + this.zonesReached, {
            fontSize: '16px', fontFamily: 'monospace',
            color: '#87CEEB', stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5);

        // Nochmal-Button (gleiche Schwierigkeit)
        const btnBg = this.add.graphics();
        this.drawBtn(btnBg, 0xFF69B4);

        this.add.text(400, 395, 'NOCHMAL!', {
            fontSize: '28px', fontFamily: 'Georgia, serif',
            color: '#FFFFFF', stroke: '#8B4513', strokeThickness: 3
        }).setOrigin(0.5);

        const btnZone = this.add.zone(400, 395, 250, 50).setInteractive({ useHandCursor: true });
        btnZone.on('pointerover', () => this.drawBtn(btnBg, 0xFF85C2));
        btnZone.on('pointerout', () => this.drawBtn(btnBg, 0xFF69B4));
        btnZone.on('pointerdown', () => this.restartGame());

        // Zum Menü - Button
        const menuBtnBg = this.add.graphics();
        this.drawMenuBtn(menuBtnBg, 0x8B4513);

        this.add.text(400, 455, 'HAUPTMENU', {
            fontSize: '20px', fontFamily: 'Georgia, serif',
            color: '#FFFFFF', stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5);

        const menuZone = this.add.zone(400, 455, 220, 44).setInteractive({ useHandCursor: true });
        menuZone.on('pointerover', () => this.drawMenuBtn(menuBtnBg, 0xA0522D));
        menuZone.on('pointerout', () => this.drawMenuBtn(menuBtnBg, 0x8B4513));
        menuZone.on('pointerdown', () => this.goToMenu());

        // Tastatur-Shortcuts
        this.input.keyboard.on('keydown-SPACE', () => this.restartGame());
        this.input.keyboard.on('keydown-ESC', () => this.goToMenu());
        this.input.keyboard.on('keydown-M', () => this.goToMenu());

        this.add.text(400, 490, 'LEERTASTE = Nochmal  |  M / ESC = Hauptmenu', {
            fontSize: '11px', fontFamily: 'monospace',
            color: '#999999', stroke: '#000', strokeThickness: 1
        }).setOrigin(0.5);

        // Fallende Streusel
        this.time.addEvent({
            delay: 200,
            callback: () => {
                const colors = [0xFF69B4, 0xFFD700, 0x87CEEB, 0xDDA0DD, 0xFF6B6B, 0x90EE90];
                const s = this.add.image(Phaser.Math.Between(50, 750), -10, 'sprinkle');
                s.setTint(Phaser.Utils.Array.GetRandom(colors));
                s.setAngle(Phaser.Math.Between(0, 360));
                s.setScale(Phaser.Math.FloatBetween(1, 2));
                this.tweens.add({
                    targets: s, y: 650,
                    duration: Phaser.Math.Between(2000, 4000),
                    angle: s.angle + 180,
                    onComplete: () => s.destroy()
                });
            },
            repeat: -1
        });
    }

    drawBtn(bg, color) {
        bg.clear();
        bg.fillStyle(color);
        bg.fillRoundedRect(275, 370, 250, 50, 12);
        bg.lineStyle(3, 0xFFD700);
        bg.strokeRoundedRect(275, 370, 250, 50, 12);
    }

    drawMenuBtn(bg, color) {
        bg.clear();
        bg.fillStyle(color);
        bg.fillRoundedRect(290, 433, 220, 44, 12);
        bg.lineStyle(2, 0xFFD700);
        bg.strokeRoundedRect(290, 433, 220, 44, 12);
    }

    restartGame() {
        window.audioManager.init();
        window.audioManager.resume();
        window.audioManager.startMusic();
        this.scene.start('GameScene', { difficulty: this.difficulty });
    }

    goToMenu() {
        window.audioManager.stopMusic();
        this.scene.start('MenuScene');
    }
}

window.GameOverScene = GameOverScene;
