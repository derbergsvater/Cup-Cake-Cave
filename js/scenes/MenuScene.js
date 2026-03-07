// MenuScene: Startbildschirm mit Titel, Anleitung und Schwierigkeitswahl
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        this.selectedDifficulty = 'mittel';

        // Hintergrund
        this.add.image(400, 300, 'bg_pink');

        // Dekorative Streusel
        for (let i = 0; i < 30; i++) {
            const s = this.add.image(
                Phaser.Math.Between(50, 750),
                Phaser.Math.Between(50, 550),
                'sprinkle'
            );
            s.setTint(Phaser.Display.Color.RandomRGB().color);
            s.setAngle(Phaser.Math.Between(0, 360));
            s.setAlpha(0.5);
            s.setScale(Phaser.Math.FloatBetween(1, 3));
        }

        // Titel-Box
        const titleBg = this.add.graphics();
        titleBg.fillStyle(0x000000, 0.5);
        titleBg.fillRoundedRect(100, 50, 600, 100, 20);

        this.add.text(400, 78, 'Die Cup-Cake-Hohlen', {
            fontSize: '42px', fontFamily: 'Georgia, serif',
            color: '#FFD700', stroke: '#8B4513', strokeThickness: 6,
            shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 5, fill: true }
        }).setOrigin(0.5);

        this.add.text(400, 128, 'Ein Lama-Abenteuer in der Dessert-Welt!', {
            fontSize: '16px', fontFamily: 'Georgia, serif',
            color: '#FFB6C1', stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5);

        // Lama-Preview
        const llama = this.add.image(400, 210, 'llama').setScale(2.5);
        this.tweens.add({
            targets: llama, y: 203, duration: 800,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        // Anleitungs-Box
        const infoBg = this.add.graphics();
        infoBg.fillStyle(0x000000, 0.5);
        infoBg.fillRoundedRect(150, 260, 500, 110, 16);

        const isMobile = !this.sys.game.device.os.desktop;
        const instructions = isMobile ? [
            'Steuerung:',
            'Touch-Buttons links = Laufen',
            'Touch-Button rechts = Springen',
            '',
            'Friss Zuckerfliegen, weiche Cup-Cake-Baren aus,',
        ] : [
            'Steuerung:',
            'Pfeiltasten / A,D - Laufen',
            'Leertaste / Pfeil hoch - Springen',
            '',
            'Friss Zuckerfliegen, weiche Cup-Cake-Baren aus,',
        ];
        instructions.forEach((line, i) => {
            this.add.text(400, 275 + i * 20, line, {
                fontSize: i === 0 ? '18px' : '14px', fontFamily: 'monospace',
                color: i === 0 ? '#FFD700' : '#FFFFFF',
                stroke: '#000', strokeThickness: 2
            }).setOrigin(0.5);
        });

        // --- Schwierigkeitsgrad-Auswahl ---
        const diffBg = this.add.graphics();
        diffBg.fillStyle(0x000000, 0.5);
        diffBg.fillRoundedRect(150, 385, 500, 80, 16);

        this.add.text(400, 398, 'Schwierigkeit:', {
            fontSize: '18px', fontFamily: 'Georgia, serif',
            color: '#FFD700', stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5);

        const difficulties = [
            { key: 'einfach', label: 'Einfach', color: 0x6BCB77, x: 240, desc: 'Mehr Leben, langsamer' },
            { key: 'mittel',  label: 'Mittel',  color: 0xFFD700, x: 400, desc: 'Ausgewogen' },
            { key: 'schwer',  label: 'Schwer',  color: 0xFF4040, x: 560, desc: 'Weniger Leben, schneller' }
        ];

        this.diffButtons = [];
        this.diffBgs = [];
        this.diffDescs = [];

        difficulties.forEach((d, i) => {
            const bg = this.add.graphics();
            this.diffBgs.push(bg);

            const text = this.add.text(d.x, 430, d.label, {
                fontSize: '18px', fontFamily: 'Georgia, serif',
                color: '#FFFFFF', stroke: '#000', strokeThickness: 3
            }).setOrigin(0.5);
            this.diffButtons.push(text);

            const zone = this.add.zone(d.x, 430, 120, 36).setInteractive({ useHandCursor: true });
            zone.on('pointerdown', () => {
                this.selectedDifficulty = d.key;
                this.updateDifficultyButtons(difficulties);
            });
        });

        // Beschreibung unter den Buttons
        this.diffDescText = this.add.text(400, 458, '', {
            fontSize: '12px', fontFamily: 'monospace',
            color: '#CCCCCC', stroke: '#000', strokeThickness: 1
        }).setOrigin(0.5);

        this.updateDifficultyButtons(difficulties);

        // Start-Button
        this.startBtnBg = this.add.graphics();
        this.drawStartBtn(0xFF69B4);

        this.add.text(400, 510, 'SPIELEN!', {
            fontSize: '28px', fontFamily: 'Georgia, serif',
            color: '#FFFFFF', stroke: '#8B4513', strokeThickness: 3
        }).setOrigin(0.5);

        const btnZone = this.add.zone(400, 510, 200, 50).setInteractive({ useHandCursor: true });
        btnZone.on('pointerover', () => this.drawStartBtn(0xFF85C2));
        btnZone.on('pointerout', () => this.drawStartBtn(0xFF69B4));
        btnZone.on('pointerdown', () => this.startGame());

        this.input.keyboard.on('keydown-SPACE', () => this.startGame());

        // Tastatur-Shortcuts für Schwierigkeit
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
            ? 'Tippe auf SPIELEN! um zu starten'
            : 'LEERTASTE = Starten  |  1/2/3 = Schwierigkeit';
        const spaceText = this.add.text(400, 555, hintText, {
            fontSize: '12px', fontFamily: 'monospace', color: '#FFD700'
        }).setOrigin(0.5);
        this.tweens.add({
            targets: spaceText, alpha: 0.3, duration: 600, yoyo: true, repeat: -1
        });
    }

    drawStartBtn(color) {
        this.startBtnBg.clear();
        this.startBtnBg.fillStyle(color);
        this.startBtnBg.fillRoundedRect(300, 485, 200, 50, 12);
        this.startBtnBg.lineStyle(3, 0xFFD700);
        this.startBtnBg.strokeRoundedRect(300, 485, 200, 50, 12);
    }

    updateDifficultyButtons(difficulties) {
        difficulties.forEach((d, i) => {
            const isSelected = d.key === this.selectedDifficulty;
            const bg = this.diffBgs[i];
            bg.clear();
            if (isSelected) {
                bg.fillStyle(d.color, 0.8);
                bg.fillRoundedRect(d.x - 60, 415, 120, 32, 8);
                bg.lineStyle(2, 0xFFFFFF);
                bg.strokeRoundedRect(d.x - 60, 415, 120, 32, 8);
            } else {
                bg.fillStyle(d.color, 0.3);
                bg.fillRoundedRect(d.x - 60, 415, 120, 32, 8);
                bg.lineStyle(1, d.color);
                bg.strokeRoundedRect(d.x - 60, 415, 120, 32, 8);
            }
            this.diffButtons[i].setAlpha(isSelected ? 1 : 0.6);
        });

        const selected = difficulties.find(d => d.key === this.selectedDifficulty);
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
