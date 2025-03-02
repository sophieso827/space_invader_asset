class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        // Show loading message
        const loadingText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'Loading...',
            { fontSize: '32px', fill: '#fff' }
        );
        loadingText.setOrigin(0.5);

        // Load background
        this.load.image('background', ASSETS.SPRITES.BACKGROUND.path);
        
        // ...existing asset loading code...
    }

    create() {
        this.scene.start('MainScene');
    }
}
