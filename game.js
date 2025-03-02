/* Last modified: 2025-02-28 13:01:01 UTC */
/* Author: sophieso827 */

class ChineseSpaceGame extends Phaser.Scene {
    constructor() {
        super({ key: 'ChineseSpaceGame' });
        this.gameState = null;
        this.audioManager = null;
        this.particleManager = null;
        this.wordRenderer = null;
        this.powerupManager = null;
        this.collisionManager = null;
        this.uiManager = null;
        this.player = null;
    }

    preload() {
        try {
            // Load background with correct path
            this.load.image('background', 'background.png');
            console.log('Loading background from:', 'background.png'); // Debug log
            
            // Load other sprites
            Object.entries(ASSETS.SPRITES).forEach(([key, config]) => {
                if (key !== 'BACKGROUND') { // Skip background as it's already loaded
                    this.load.image(key.toLowerCase(), config.path);
                }
            });

            // Load audio
            Object.entries(ASSETS.AUDIO).forEach(([key, config]) => {
                this.load.audio(key.toLowerCase(), config.path);
            });
        } catch (error) {
            console.error('Error in preload:', error);
        }
    }

    create() {
        try {
            // Initialize managers
            this.initializeManagers();
            
            // Create background
            this.createBackground();
            
            // Create player
            this.createPlayer();
            
            // Start background music
            this.audioManager.play('BACKGROUND', { loop: true });
            
            // Hide loading text
            const loadingText = document.getElementById('loadingText');
            if (loadingText) {
                loadingText.style.display = 'none';
            }
        } catch (error) {
            console.error('Error in create:', error);
        }
    }

    initializeManagers() {
        try {
            // Create and initialize all game managers
            this.gameState = new GameStateManager(this);
            this.audioManager = new AudioManager(this);
            this.particleManager = new ParticleManager(this);
            this.wordRenderer = new WordRenderer(this);
            this.powerupManager = new PowerupManager(this);
            this.collisionManager = new CollisionManager(this);
            this.uiManager = new UIManager(this);

            // Initialize each manager
            this.gameState.initialize();
            this.audioManager.initialize();
            this.particleManager.initialize();
            this.wordRenderer.initialize();
            this.powerupManager.initialize();
            this.collisionManager.initialize();
            this.uiManager.initialize();
        } catch (error) {
            console.error('Error initializing managers:', error);
        }
    }

    createBackground() {
        try {
            // Debug log to check if the texture exists
            console.log('Background texture exists:', this.textures.exists('background'));
            
            // Create background with simpler settings
            const bg = this.add.image(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2, 'background');
            bg.setDepth(-1);
            
            // Fit to screen while maintaining aspect ratio
            bg.setDisplaySize(GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);
            
        } catch (error) {
            console.error('Error creating background:', error);
            console.error('Available textures:', this.textures.list);
        }
    }

    createPlayer() {
        try {
            // Create player sprite
            this.player = this.add.sprite(
                GAME_CONFIG.WIDTH / 2,
                GAME_CONFIG.HEIGHT - 100,
                'player'
            );
            
            // Set up player physics
            this.physics.world.enable(this.player);
            this.player.body.setCollideWorldBounds(true);
            
            // Add player to collision group
            this.collisionManager.addToGroup(this.player, 'player');
            
            // Set up player movement controls
            this.setupPlayerControls();
        } catch (error) {
            console.error('Error creating player:', error);
        }
    }

    setupPlayerControls() {
        try {
            // Add keyboard controls
            this.cursors = this.input.keyboard.createCursorKeys();
            
            // Add touch/mouse controls for mobile
            this.input.on('pointermove', (pointer) => {
                if (!this.gameState.isPaused && pointer.isDown) {
                    const newX = Phaser.Math.Clamp(
                        pointer.x,
                        this.player.width / 2,
                        GAME_CONFIG.WIDTH - this.player.width / 2
                    );
                    this.player.x = newX;
                }
            });
        } catch (error) {
            console.error('Error setting up player controls:', error);
        }
    }

    update() {
        try {
            if (this.gameState.isGameOver || this.gameState.isPaused) {
                return;
            }

            // Update player movement
            this.updatePlayerMovement();
            
            // Update game state
            this.gameState.update();
        } catch (error) {
            console.error('Error in update:', error);
        }
    }

    updatePlayerMovement() {
        try {
            // Handle keyboard movement
            if (this.cursors.left.isDown) {
                this.player.x -= GAME_CONFIG.PLAYER_SPEED * (this.game.loop.delta / 1000);
            } else if (this.cursors.right.isDown) {
                this.player.x += GAME_CONFIG.PLAYER_SPEED * (this.game.loop.delta / 1000);
            }

            // Clamp player position to screen bounds
            this.player.x = Phaser.Math.Clamp(
                this.player.x,
                this.player.width / 2,
                GAME_CONFIG.WIDTH - this.player.width / 2
            );
        } catch (error) {
            console.error('Error updating player movement:', error);
        }
    }

    shootBullet(targetWord) {
        try {
            // Create bullet sprite
            const bullet = this.add.sprite(this.player.x, this.player.y - 20, 'bullet');
            
            // Enable physics for the bullet
            this.physics.world.enable(bullet);
            bullet.body.setVelocityY(-GAME_CONFIG.BULLET_SPEED);
            
            // Add bullet to collision group
            this.collisionManager.addToGroup(bullet, 'bullets');
            
            // Add particle trail
            this.particleManager.createTrail(bullet, {
                color: 0x00ffff,
                lifespan: 300
            });
            
            // Play shoot sound
            this.audioManager.play('SHOOT');
            
            // Destroy bullet when it goes off screen
            bullet.checkWorldBounds = true;
            bullet.outOfBoundsKill = true;
            
            return bullet;
        } catch (error) {
            console.error('Error shooting bullet:', error);
            return null;
        }
    }

    shutdown() {
        try {
            // Cleanup all managers
            this.gameState.cleanup();
            this.audioManager.cleanup();
            this.particleManager.cleanup();
            this.wordRenderer.cleanup();
            this.powerupManager.cleanup();
            this.collisionManager.cleanup();
            this.uiManager.cleanup();
            
            // Remove event listeners
            this.events.off('update');
            this.input.keyboard.shutdown();
        } catch (error) {
            console.error('Error in shutdown:', error);
        }
    }
}

// Configure and start the game
window.onload = () => {
    try {
        const config = {
            type: Phaser.AUTO,
            width: GAME_CONFIG.WIDTH,
            height: GAME_CONFIG.HEIGHT,
            parent: 'game-container',
            backgroundColor: '#000000',
            scene: [PreloadScene, MainScene],
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false
                }
            }
        };

        const game = new Phaser.Game(config);
        
        // Handle window resize
        window.addEventListener('resize', () => {
            game.scale.refresh();
        });
    } catch (error) {
        console.error('Error starting game:', error);
        document.getElementById('loadingText').textContent = 
            'Error starting game. Please refresh the page.';
    }
};