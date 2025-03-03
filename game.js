/* Last modified: 2025-03-03 03:07:07 UTC */
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
            // Load sprites
            Object.entries(ASSETS.SPRITES).forEach(([key, config]) => {
                this.load.image(key.toLowerCase(), config.path);
                
                // Add error handler for each sprite
                this.load.on(`fileerror-image-${key.toLowerCase()}`, (file) => {
                    console.error(`Error loading sprite: ${file.key}`);
                });
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
            
            // Create player with error handling
            this.createPlayer();
            
            // Start background music
            this.audioManager.play('background', { loop: true });
            
            // Hide loading text
            const loadingText = document.getElementById('loadingText');
            if (loadingText) {
                loadingText.style.display = 'none';
            }

            // Spawn initial words
            this.spawnInitialWords();
        } catch (error) {
            console.error('Error in create:', error);
        }
    }

    // Add this new method
    spawnInitialWords() {
        try {
            // Spawn a few initial words with different positions
            const initialPositions = [
                { x: GAME_CONFIG.WIDTH * 0.25, y: 100 },
                { x: GAME_CONFIG.WIDTH * 0.5, y: 150 },
                { x: GAME_CONFIG.WIDTH * 0.75, y: 200 }
            ];

            initialPositions.forEach(pos => {
                this.wordRenderer.spawnWordAt(pos.x, pos.y);
            });
        } catch (error) {
            console.error('Error spawning initial words:', error);
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
            // Create static background with reduced size
            const bg = this.add.sprite(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2, 'background');
            bg.setDepth(-1);
            // Scale down the background
            bg.setScale(0.8); // Adjust this value as needed
            
            // Remove the scroll effect by removing the update event
        } catch (error) {
            console.error('Error creating background:', error);
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
            this.audioManager.play('shoot');
            
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
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: GAME_CONFIG.DEBUG_MODE
                }
            },
            scene: ChineseSpaceGame
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