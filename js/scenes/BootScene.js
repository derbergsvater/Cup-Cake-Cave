// BootScene: Generiert alle Assets und wechselt zum Menü
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    create() {
        AssetGenerator.generate(this);
        this.scene.start('MenuScene');
    }
}

window.BootScene = BootScene;
