// MenuScene: Startbildschirm mit Titel, Anleitung und Schwierigkeitswahl
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        this.selectedDifficulty = 'mittel';

        // Hintergrund
        this.add.image(400, 300, 'bg_pink').setAlpha(0.9);

        const gradient = this.add.graphics();
        gradient.fillGradientStyle(0x120E1A, 0x120E1A, 0x2A1435, 0x2A1435, 0.56);
        gradient.fillRect(0, 0, 800, 600);

        const glow = this.add.graphics();
        glow.fillStyle(0xFF5EA8, 0.18);
        glow.fillCircle(130, 90, 220);
        glow.fillStyle(0x58D5FF, 0.12);
        glow.fillCircle(690, 120, 190);

        for (let i = 0; i < 36; i++) {
            const s = this.add.image(
                Phaser.Math.Between(20, 780),
                Phaser.Math.Between(40, 560),
                'sprinkle'
            );
            s.setTint(Phaser.Display.Color.RandomRGB().color);
            s.setAngle(Phaser.Math.Between(0, 360));
            s.setAlpha(0.22);
            s.setScale(Phaser.Math.FloatBetween(0.9, 2.4));
        }

        const panel = this.add.graphics();
        panel.fillStyle(0x07060D, 0.48);
        panel.fillRoundedRect(70, 34, 660, 530, 24);
        panel.lineStyle(2, 0xFFD166, 0.85);
        panel.strokeRoundedRect(70, 34, 660, 530, 24);

        this.add.text(400, 90, 'Die Cup-Cake-Hoehlen', {
            fontSize: '64px',
            fontFamily: '"Baloo 2"',
            fontStyle: '800',
            color: '#FFE3B0',
            stroke: '#B23A74',
            strokeThickness: 3
        }).setOrigin(0.5);

        this.add.text(400, 140, 'Ella sprintet durch eine lebendige Dessert-Welt', {
            fontSize: '19px',
            fontFamily: 'Outfit',
            fontStyle: '600',
            color: '#F6D7E8'
        }).setOrigin(0.5);

        const llama = this.add.image(400, 216, 'llama').setScale(3);
        this.tweens.add({
            targets: llama,
            y: 206,
            duration: 950,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        const infoBg = this.add.graphics();
        infoBg.fillStyle(0x0F0D1A, 0.74);
        infoBg.fillRoundedRect(130, 268, 540, 120, 14);
        infoBg.lineStyle(1, 0x59D8FF, 0.45);
        infoBg.strokeRoundedRect(130, 268, 540, 120, 14);

        const isMobile = !this.sys.game.device.os.desktop;
        const instructions = isMobile ? [
            'Steuerung',
            'Touch links/rechts = Laufen',
            'Touch rechts gross = Springen',
            'Blauer Touch-Button = Spucken',
            'Friss Zuckerfliegen und nutze Power-ups klug'
        ] : [
            'Steuerung',
            'Pfeile / A,D = Laufen',
            'W / Pfeil hoch / Leertaste = Springen',
            'F = Spucken',
            'Friss Zuckerfliegen und nutze Power-ups klug'
        ];

        instructions.forEach((line, i) => {
            this.add.text(400, 286 + i * 22, line, {
                fontSize: i === 0 ? '20px' : '15px',
                fontFamily: i === 0 ? '"Baloo 2"' : 'Outfit',
                fontStyle: i === 0 ? '700' : '600',
                color: i === 0 ? '#FFD166' : '#FFFFFF'
            }).setOrigin(0.5);
        });

        const diffBg = this.add.graphics();
        diffBg.fillStyle(0x0F0D1A, 0.74);
        diffBg.fillRoundedRect(130, 405, 540, 90, 14);
        diffBg.lineStyle(1, 0xFF7FB6, 0.45);
        diffBg.strokeRoundedRect(130, 405, 540, 90, 14);

        this.add.text(400, 424, 'Schwierigkeit', {
            fontSize: '21px',
            fontFamily: '"Baloo 2"',
            fontStyle: '700',
            color: '#FFD166'
        }).setOrigin(0.5);

        const difficulties = [
            { key: 'einfach', label: 'Einfach', color: 0x6BCB77, x: 250, desc: 'Mehr Leben, ruhigeres Tempo' },
            { key: 'mittel',  label: 'Mittel',  color: 0xFFD166, x: 400, desc: 'Ausgewogener Lauf' },
            { key: 'schwer',  label: 'Schwer',  color: 0xFF5B6E, x: 550, desc: 'Weniger Leben, mehr Druck' }
        ];

        this.diffButtons = [];
        this.diffBgs = [];

        difficulties.forEach((d) => {
            const bg = this.add.graphics();
            this.diffBgs.push(bg);

            const text = this.add.text(d.x, 460, d.label, {
                fontSize: '19px',
                fontFamily: '"Baloo 2"',
                fontStyle: '700',
                color: '#FFFFFF'
            }).setOrigin(0.5);
            this.diffButtons.push(text);

            const zone = this.add.zone(d.x, 460, 136, 40).setInteractive({ useHandCursor: true });
            zone.on('pointerdown', () => {
                this.selectedDifficulty = d.key;
                this.updateDifficultyButtons(difficulties);
            });
        });

        this.diffDescText = this.add.text(400, 487, '', {
            fontSize: '13px',
            fontFamily: 'Outfit',
            fontStyle: '600',
            color: '#DDE7FF'
        }).setOrigin(0.5);

        this.updateDifficultyButtons(difficulties);

        this.startBtnBg = this.add.graphics();
        this.drawStartBtn(0xFF5EA8);

        this.add.text(400, 535, 'SPIEL STARTEN', {
            fontSize: '30px',
            fontFamily: '"Baloo 2"',
            fontStyle: '800',
            color: '#FFFFFF',
            stroke: '#7D2B52',
            strokeThickness: 2
        }).setOrigin(0.5);

        const btnZone = this.add.zone(400, 535, 240, 56).setInteractive({ useHandCursor: true });
        btnZone.on('pointerover', () => this.drawStartBtn(0xFF7FBE));
        btnZone.on('pointerout', () => this.drawStartBtn(0xFF5EA8));
        btnZone.on('pointerdown', () => this.startGame());

        this.input.keyboard.on('keydown-SPACE', () => this.startGame());
        this.input.keyboard.on('keydown-ONE', () => {
            this.selectedDifficulty = 'einfach';
            this.updateDifficultyButtons(difficulties);
        });
        this.input.keyboard.on('keydown-TWO', () => {
            this.selectedDifficulty = 'mittel';
            this.updateDifficultyButtons(difficulties);
        });
        this.input.keyboard.on('keydown-THREE', () => {
            this.selectedDifficulty = 'schwer';
            this.updateDifficultyButtons(difficulties);
        });

        const hintText = isMobile
            ? 'Tippe auf den Button, um zu starten'
            : 'Leertaste startet sofort  |  1 / 2 / 3 waehlt Schwierigkeit';

        const hint = this.add.text(400, 576, hintText, {
            fontSize: '12px',
            fontFamily: 'Outfit',
            fontStyle: '600',
            color: '#EED6E4'
        }).setOrigin(0.5);

        this.tweens.add({ targets: hint, alpha: 0.35, duration: 700, yoyo: true, repeat: -1 });
    }

    drawStartBtn(color) {
        this.startBtnBg.clear();
        this.startBtnBg.fillStyle(color, 1);
        this.startBtnBg.fillRoundedRect(280, 506, 240, 58, 16);
        this.startBtnBg.lineStyle(2, 0xFFD166, 0.95);
        this.startBtnBg.strokeRoundedRect(280, 506, 240, 58, 16);
    }

    updateDifficultyButtons(difficulties) {
        difficulties.forEach((d, i) => {
            const isSelected = d.key === this.selectedDifficulty;
            const bg = this.diffBgs[i];
            bg.clear();
            bg.fillStyle(d.color, isSelected ? 0.85 : 0.28);
            bg.fillRoundedRect(d.x - 68, 440, 136, 40, 10);
            bg.lineStyle(isSelected ? 2 : 1, isSelected ? 0xFFFFFF : d.color, isSelected ? 1 : 0.65);
            bg.strokeRoundedRect(d.x - 68, 440, 136, 40, 10);
            this.diffButtons[i].setAlpha(isSelected ? 1 : 0.7);
            this.diffButtons[i].setScale(isSelected ? 1.04 : 1);
        });

        const selected = difficulties.find((d) => d.key === this.selectedDifficulty);
        this.diffDescText.setText(selected.desc);
    }

    startGame() {
        window.audioManager.init();
        window.audioManager.resume();
        window.audioManager.startMusic();
        this.scene.start('GameScene', { difficulty: this.selectedDifficulty });
    }
}

window.MenuScene = MenuScene;
