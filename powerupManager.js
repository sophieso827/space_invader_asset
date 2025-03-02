/* Last modified: 2025-02-28 12:55:37 UTC */
/* Author: sophieso827 */

class PowerupManager {
    constructor(scene) {
        this.scene = scene;
        this.activePowerups = new Map();
        this.powerupSprites = new Set();
        this.lastSpawnTime = 0;
        this.spawnDelay = 15000; // 15 seconds between possible powerup spawns
    }

    initialize() {
        try {
            // Set up spawn timer
            this.scene.time.addEvent({
                delay: 1000,
                callback: this.update,
                callbackScope: this,
                loop: true
            });
        } catch (error) {
            console.error('Error initializing PowerupManager:', error);
        }
    }

    update() {
        try {
            // Check if it's time to try spawning a powerup
            if (this.scene.time.now - this.lastSpawnTime >= this.spawnDelay) {
                this.trySpawnPowerup();
            }

            // Update active powerups
            this.activePowerups.forEach((data, key) => {
                if (data.expiryTime && this.scene.time.now >= data.expiryTime) {
                    this.deactivatePowerup(key);
                }
            });

            // Clean up off-screen powerup sprites
            this.powerupSprites.forEach(sprite => {
                if (sprite.y > GAME_CONFIG.HEIGHT + 50) {
                    this.destroyPowerupSprite(sprite);
                }
            });
        } catch (error) {
            console.error('Error in PowerupManager update:', error);
        }
    }

    trySpawnPowerup() {
        try {
            if (Math.random() < POWERUP_CONFIG.SPAWN_CHANCE) {
                const powerupTypes = Object.keys(POWERUP_CONFIG.TYPES);
                const randomType = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
                this.spawnPowerup(randomType);
            }
            this.lastSpawnTime = this.scene.time.now;
        } catch (error) {
            console.error('Error trying to spawn powerup:', error);
        }
    }

    spawnPowerup(type) {
        try {
            const x = Phaser.Math.Between(50, GAME_CONFIG.WIDTH - 50);
            const powerupSprite = this.createPowerupSprite(x, -30, type);
            
            if (powerupSprite) {
                this.powerupSprites.add(powerupSprite);
                
                // Add physics
                this.scene.physics.world.enable(powerupSprite);
                powerupSprite.body.setVelocityY(POWERUP_CONFIG.FALL_SPEED);
                
                // Add particle effect
                this.scene.particleManager.createPowerupEffect(
                    powerupSprite,
                    POWERUP_CONFIG.TYPES[type].color
                );
            }
        } catch (error) {
            console.error('Error spawning powerup:', error);
        }
    }

    createPowerupSprite(x, y, type) {
        try {
            const sprite = this.scene.add.sprite(x, y, 'powerup');
            sprite.setTint(POWERUP_CONFIG.TYPES[type].color);
            sprite.powerupType = type;
            sprite.setScale(0.8);
            
            // Add floating animation
            this.scene.tweens.add({
                targets: sprite,
                y: y + 10,
                duration: 1000,
                yoyo: true,
                repeat: -1
            });

            return sprite;
        } catch (error) {
            console.error('Error creating powerup sprite:', error);
            return null;
        }
    }

    collectPowerup(sprite) {
        try {
            const type = sprite.powerupType;
            this.activatePowerup(type);
            this.destroyPowerupSprite(sprite);
            
            // Play powerup sound
            this.scene.audioManager.play('POWERUP');
            
            // Create collection effect
            this.scene.particleManager.createExplosion(
                sprite.x,
                sprite.y,
                POWERUP_CONFIG.TYPES[type].color
            );
        } catch (error) {
            console.error('Error collecting powerup:', error);
        }
    }

    activatePowerup(type) {
        try {
            const config = POWERUP_CONFIG.TYPES[type];
            const duration = config.duration || 0;

            switch (type) {
                case 'SLOW_TIME':
                    this.activateSlowTime();
                    break;
                case 'DOUBLE_POINTS':
                    this.activateDoublePoints();
                    break;
                case 'EXTRA_LIFE':
                    this.scene.gameState.addLife();
                    break;
            }

            if (duration > 0) {
                this.activePowerups.set(type, {
                    expiryTime: this.scene.time.now + duration,
                    effect: config
                });

                // Create floating text effect
                this.scene.particleManager.createTextEffect(
                    GAME_CONFIG.WIDTH / 2,
                    GAME_CONFIG.HEIGHT / 2,
                    type.replace('_', ' '),
                    { color: '#' + config.color.toString(16), duration: 2000 }
                );
            }
        } catch (error) {
            console.error('Error activating powerup:', error);
        }
    }

    activateSlowTime() {
        try {
            // Slow down all falling words
            this.scene.wordRenderer.words.forEach(word => {
                if (word.body) {
                    word.body.setVelocityY(word.body.velocity.y * 0.5);
                }
            });
        } catch (error) {
            console.error('Error activating slow time:', error);
        }
    }

    activateDoublePoints() {
        try {
            this.scene.gameState.activeMultiplier = 2;
        } catch (error) {
            console.error('Error activating double points:', error);
        }
    }

    deactivatePowerup(type) {
        try {
            const powerup = this.activePowerups.get(type);
            if (!powerup) return;

            switch (type) {
                case 'SLOW_TIME':
                    this.deactivateSlowTime();
                    break;
                case 'DOUBLE_POINTS':
                    this.scene.gameState.activeMultiplier = 1;
                    break;
            }

            this.activePowerups.delete(type);
        } catch (error) {
            console.error('Error deactivating powerup:', error);
        }
    }

    deactivateSlowTime() {
        try {
            // Reset word speeds to normal
            this.scene.wordRenderer.words.forEach(word => {
                if (word.body) {
                    word.body.setVelocityY(this.scene.wordRenderer.getCurrentFallSpeed());
                }
            });
        } catch (error) {
            console.error('Error deactivating slow time:', error);
        }
    }

    destroyPowerupSprite(sprite) {
        try {
            this.powerupSprites.delete(sprite);
            sprite.destroy();
        } catch (error) {
            console.error('Error destroying powerup sprite:', error);
        }
    }

    cleanup() {
        try {
            this.powerupSprites.forEach(sprite => {
                sprite.destroy();
            });
            this.powerupSprites.clear();
            this.activePowerups.clear();
        } catch (error) {
            console.error('Error cleaning up PowerupManager:', error);
        }
    }
}