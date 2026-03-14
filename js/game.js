// Spielkonfiguration und Start
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    resolution: Math.min(2, window.devicePixelRatio || 1),
    autoRound: true,
    parent: 'game-container',
    backgroundColor: '#2a0a2a',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: false
        }
    },
    scene: [BootScene, MenuScene, GameScene, GameOverScene],
    fps: {
        target: 60,
        forceSetTimeOut: true
    },
    render: {
        antialias: true,
        antialiasGL: true,
        pixelArt: false,
        roundPixels: true,
        powerPreference: 'high-performance'
    },
    input: {
        activePointers: 4,
        touch: { capture: true }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        autoRound: true
    },
    pixelArt: false,
    roundPixels: true
};

const game = new Phaser.Game(config);
