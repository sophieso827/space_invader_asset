/* Last modified: 2025-02-28 12:57:15 UTC */
/* Author: sophieso827 */

class CollisionManager {
    constructor(scene) {
        this.scene = scene;
        this.collisionGroups = new Map();
        this.debugMode = GAME_CONFIG.DEBUG_MODE;
    }

    initialize() {
        try {
            // Set up collision groups
            this.setupCollisionGroups();
            
            // Set up collision handlers
            this.setupCollisionHandlers();
        } catch (error) {
            console.error('Error initializing CollisionManager:', error);
        }
    }

    setupCollisionGroups() {
        try {
            // Player collision group
            this.collisionGroups.set('player', {
                group: this.scene.physics.add.group(),
                collidesWith: ['words', 'powerups']
            });

            // Bullets collision group
            this.collisionGroups.set('bullets', {
                group: this.scene.physics.add.group(),
                collidesWith: ['words']
            });

            // Words collision group
            this.collisionGroups.set('words', {
                group: this.scene.physics.add.group(),
                collidesWith: ['player', 'bullets']
            });

            // Powerups collision group
            this.collisionGroups.set('powerups', {
                group: this.scene.physics.add.group(),
                collidesWith: ['player']
            });
        } catch (error) {
            console.error('Error setting up collision groups:', error);
        }
    }

    setupCollisionHandlers() {
        try {
            // Player - Word collisions
            this.scene.physics.add.overlap(
                this.collisionGroups.get('player').group,
                this.collisionGroups.get('words').group,
                this.handlePlayerWordCollision,
                null,
                this
            );

            // Bullet - Word collisions
            this.scene.physics.add.overlap(
                this.collisionGroups.get('bullets').group,
                this.collisionGroups.get('words').group,
                this.handleBulletWordCollision,
                null,
                this
            );

            // Player - Powerup collisions
            this.scene.physics.add.overlap(
                this.collisionGroups.get('player').group,
                this.collisionGroups.get('powerups').group,
                this.handlePlayerPowerupCollision,
                null,
                this
            );
        } catch (error) {
            console.error('Error setting up collision handlers:', error);
        }
    }

    addToGroup(object, groupName) {
        try {
            const group = this.collisionGroups.get(groupName);
            if (group) {
                group.group.add(object);
                
                if (this.debugMode) {
                    this.addDebugVisuals(object);
                }
            }
        } catch (error) {
            console.error('Error adding object to collision group:', error);
        }
    }

    removeFromGroup(object, groupName) {
        try {
            const group = this.collisionGroups.get(groupName);
            if (group) {
                group.group.remove(object);
            }
        } catch (error) {
            console.error('Error removing object from collision group:', error);
        }
    }

    handlePlayerWordCollision(player, word) {
        try {
            // Player takes damage when colliding with a word
            this.scene.gameState.decrementLives();
            
            // Create explosion effect
            this.scene.particleManager.createExplosion(word.x, word.y, 0xff0000);
            
            // Destroy the word
            this.scene.wordRenderer.destroyWord(word);
            
            // Screen shake effect
            this.scene.cameras.main.shake(200, 0.01);
        } catch (error) {
            console.error('Error handling player-word collision:', error);
        }
    }

    handleBulletWordCollision(bullet, word) {
        try {
            // Check if the typed word matches
            if (this.scene.gameState.currentTypedWord === word.wordData.chinese ||
                this.scene.gameState.currentTypedWord === word.wordData.pinyin) {
                
                // Add score
                this.scene.gameState.addScore(word.wordData.chinese.length * 100);
                
                // Create success effects
                this.scene.particleManager.createExplosion(word.x, word.y, 0x00ff00);
                this.scene.particleManager.createTextEffect(
                    word.x,
                    word.y,
                    '+' + (word.wordData.chinese.length * 100),
                    { color: '#00ff00' }
                );
                
                // Play success sound
                this.scene.audioManager.play('EXPLODE');
            }
            
            // Destroy both bullet and word
            bullet.destroy();
            this.scene.wordRenderer.destroyWord(word);
        } catch (error) {
            console.error('Error handling bullet-word collision:', error);
        }
    }

    handlePlayerPowerupCollision(player, powerup) {
        try {
            this.scene.powerupManager.collectPowerup(powerup);
        } catch (error) {
            console.error('Error handling player-powerup collision:', error);
        }
    }

    addDebugVisuals(object) {
        try {
            if (object.body) {
                const graphics = this.scene.add.graphics();
                graphics.lineStyle(1, 0x00ff00);
                graphics.strokeRect(0, 0, object.body.width, object.body.height);
                object.add(graphics);
            }
        } catch (error) {
            console.error('Error adding debug visuals:', error);
        }
    }

    cleanup() {
        try {
            this.collisionGroups.forEach(group => {
                group.group.clear(true, true);
            });
            this.collisionGroups.clear();
        } catch (error) {
            console.error('Error cleaning up CollisionManager:', error);
        }
    }
}