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
        this.add.image(400, 300, 'bg_pink').setAlpha(0.5);

        const overlay = this.add.graphics();
        overlay.fillGradientStyle(0x120E1A, 0x120E1A, 0x1E1028, 0x1E1028, 0.9);
        overlay.fillRect(0, 0, 800, 600);

        const glow = this.add.graphics();
        glow.fillStyle(0xFF5EA8, 0.2);
        glow.fillCircle(120, 110, 180);
        glow.fillStyle(0x59D8FF, 0.13);
        glow.fillCircle(680, 90, 160);

        const box = this.add.graphics();
        box.fillStyle(0x090711, 0.76);
        box.fillRoundedRect(140, 72, 520, 456, 24);
        box.lineStyle(2, 0xFFD166, 0.95);
        box.strokeRoundedRect(140, 72, 520, 456, 24);

        this.add.text(400, 128, 'GAME OVER', {
            fontSize: '62px',
            fontFamily: '"Baloo 2"',
            fontStyle: '800',
            color: '#FF6BAE',
            stroke: '#61143A',
            strokeThickness: 8,
            shadow: { offsetX: 0, offsetY: 5, color: '#000', blur: 10, fill: true }
        }).setOrigin(0.5);

        const llama = this.add.image(400, 216, 'llama').setScale(2.2).setTint(0xB8B8B8);
        this.tweens.add({
            targets: llama,
            angle: 8,
            y: 222,
            duration: 680,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        const diffColors = { einfach: '#6BCB77', mittel: '#FFD166', schwer: '#FF5B6E' };
        const diffLabels = { einfach: 'Einfach', mittel: 'Mittel', schwer: 'Schwer' };
        this.add.text(400, 286, `Modus: ${diffLabels[this.difficulty] || 'Mittel'}`, {
            fontSize: '18px',
            fontFamily: 'Outfit',
            fontStyle: '700',
            color: diffColors[this.difficulty] || '#FFD166'
        }).setOrigin(0.5);

        this.add.text(400, 328, `Punkte ${this.finalScore}`, {
            fontSize: '44px',
            fontFamily: '"Baloo 2"',
            fontStyle: '800',
            color: '#FFE3B0'
        }).setOrigin(0.5);

        this.add.text(400, 368, `Distanz ${this.finalDistance}m  |  Zonen ${this.zonesReached}`, {
            fontSize: '16px',
            fontFamily: 'Outfit',
            fontStyle: '600',
            color: '#CBE9FF'
        }).setOrigin(0.5);

        const retryBg = this.add.graphics();
        this.drawBtn(retryBg, 0xFF5EA8, 270, 406, 260, 56);
        this.add.text(400, 434, 'NOCH EIN VERSUCH', {
            fontSize: '28px',
            fontFamily: '"Baloo 2"',
            fontStyle: '800',
            color: '#FFFFFF',
            stroke: '#7D2B52',
            strokeThickness: 4
        }).setOrigin(0.5);

        const retryZone = this.add.zone(400, 434, 260, 56).setInteractive({ useHandCursor: true });
        retryZone.on('pointerover', () => this.drawBtn(retryBg, 0xFF7FBE, 270, 406, 260, 56));
        retryZone.on('pointerout', () => this.drawBtn(retryBg, 0xFF5EA8, 270, 406, 260, 56));
        retryZone.on('pointerdown', () => this.restartGame());

        const menuBg = this.add.graphics();
        this.drawBtn(menuBg, 0x2D6ACB, 300, 474, 200, 44);
        this.add.text(400, 496, 'HAUPTMENU', {
            fontSize: '21px',
            fontFamily: '"Baloo 2"',
            fontStyle: '700',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        const menuZone = this.add.zone(400, 496, 200, 44).setInteractive({ useHandCursor: true });
        menuZone.on('pointerover', () => this.drawBtn(menuBg, 0x4A83DF, 300, 474, 200, 44));
        menuZone.on('pointerout', () => this.drawBtn(menuBg, 0x2D6ACB, 300, 474, 200, 44));
        menuZone.on('pointerdown', () => this.goToMenu());

        this.input.keyboard.on('keydown-SPACE', () => this.restartGame());
        this.input.keyboard.on('keydown-ESC', () => this.goToMenu());
        this.input.keyboard.on('keydown-M', () => this.goToMenu());

        this.add.text(400, 542, 'Leertaste = Neustart  |  M / ESC = Menu', {
            fontSize: '12px',
            fontFamily: 'Outfit',
            fontStyle: '600',
            color: '#D4C7DB'
        }).setOrigin(0.5);

        this.time.addEvent({
            delay: 220,
            callback: () => {
                const colors = [0xFF69B4, 0xFFD700, 0x87CEEB, 0xDDA0DD, 0xFF6B6B, 0x90EE90];
                const s = this.add.image(Phaser.Math.Between(40, 760), -10, 'sprinkle');
                s.setTint(Phaser.Utils.Array.GetRandom(colors));
                s.setAngle(Phaser.Math.Between(0, 360));
                s.setScale(Phaser.Math.FloatBetween(0.9, 2));
                this.tweens.add({
                    targets: s,
                    y: 640,
                    duration: Phaser.Math.Between(2400, 4200),
                    angle: s.angle + 240,
                    onComplete: () => s.destroy()
                });
            },
            repeat: -1
        });
    }

    drawBtn(bg, color, x, y, w, h) {
        bg.clear();
        bg.fillStyle(color, 1);
        bg.fillRoundedRect(x, y, w, h, 14);
        bg.lineStyle(2, 0xFFD166, 0.95);
        bg.strokeRoundedRect(x, y, w, h, 14);
    }

    restartGame() {
        window.audioManager.init();
        window.audioManager.resume();
        window.audioManager.startMusic();
        if (!this.sys.game.device.os.desktop) {
            const el = document.documentElement;
            const rfs = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
            if (rfs) rfs.call(el).catch(() => {});
        }
        this.scene.start('GameScene', { difficulty: this.difficulty });
    }

    goToMenu() {
        window.audioManager.stopMusic();
        this.scene.start('MenuScene');
    }
}

window.GameOverScene = GameOverScene;
