/* Last modified: 2025-02-28 12:53:44 UTC */
/* Author: sophieso827 */

class GameStateManager {
    constructor(scene) {
        this.scene = scene;
        this.score = 0;
        this.lives = GAME_CONFIG.INITIAL_LIVES;
        this.level = 1;
        this.gameTime = GAME_CONFIG.GAME_TIME;
        this.isGameOver = false;
        this.isPaused = false;
        this.powerups = new Set();
        this.activeMultiplier = 1;
        this.highScores = [];
        
        // UI elements
        this.scoreText = null;
        this.livesText = null;
        this.levelText = null;
        this.timerText = null;
    }

    initialize() {
        try {
            this.loadHighScores();
            this.setupTimer();
            this.updateUI();
            
            // Setup keyboard controls for pause
            this.scene.input.keyboard.on('keydown-ESC', () => {
                this.togglePause();
            });
        } catch (error) {
            console.error('Error initializing GameStateManager:', error);
        }
    }

    setupTimer() {
        try {
            this.timeEvent = this.scene.time.addEvent({
                delay: 1000,
                callback: this.updateTimer,
                callbackScope: this,
                loop: true
            });
        } catch (error) {
            console.error('Error setting up timer:', error);
        }
    }

    updateTimer() {
        try {
            if (this.isPaused) return;
            
            this.gameTime--;
            this.updateTimerDisplay();

            if (this.gameTime <= 0) {
                this.endGame('timeUp');
            }
        } catch (error) {
            console.error('Error updating timer:', error);
        }
    }

    addScore(points) {
        try {
            const basePoints = points * this.activeMultiplier;
            const levelMultiplier = Math.pow(GAME_CONFIG.DIFFICULTY_SCALING.POINTS_MULTIPLIER, this.level - 1);
            this.score += Math.floor(basePoints * levelMultiplier);
            this.updateScoreDisplay();
            this.checkLevelProgress();
        } catch (error) {
            console.error('Error adding score:', error);
        }
    }

    decrementLives() {
        try {
            this.lives--;
            this.updateLivesDisplay();

            if (this.lives <= 0) {
                this.endGame('noLives');
            } else {
                // Play hurt animation/sound
                this.scene.audioManager.play('EXPLODE');
                this.scene.cameras.main.shake(200, 0.005);
            }
        } catch (error) {
            console.error('Error decrementing lives:', error);
        }
    }

    addLife() {
        try {
            if (this.lives < GAME_CONFIG.INITIAL_LIVES) {
                this.lives++;
                this.updateLivesDisplay();
                this.scene.audioManager.play('POWERUP');
                
                // Create floating text effect
                this.scene.particleManager.createTextEffect(
                    GAME_CONFIG.WIDTH / 2,
                    GAME_CONFIG.HEIGHT / 2,
                    '+1 LIFE',
                    { color: '#00ff00', duration: 1500 }
                );
            }
        } catch (error) {
            console.error('Error adding life:', error);
        }
    }

    checkLevelProgress() {
        try {
            const scoreThreshold = 1000 * this.level;
            if (this.score >= scoreThreshold) {
                this.levelUp();
            }
        } catch (error) {
            console.error('Error checking level progress:', error);
        }
    }

    levelUp() {
        try {
            this.level++;
            this.updateLevelDisplay();
            
            // Play level up effects
            this.scene.audioManager.play('POWERUP');
            this.scene.cameras.main.flash(500, 0, 255, 0);
            
            // Create level up text effect
            this.scene.particleManager.createTextEffect(
                GAME_CONFIG.WIDTH / 2,
                GAME_CONFIG.HEIGHT / 2,
                `LEVEL ${this.level}`,
                { fontSize: '48px', color: '#00ff00', duration: 2000 }
            );

            // Update difficulty
            this.scene.wordRenderer.setLevel(this.level);
        } catch (error) {
            console.error('Error during level up:', error);
        }
    }

    togglePause() {
        try {
            this.isPaused = !this.isPaused;
            if (this.isPaused) {
                this.scene.physics.pause();
                this.timeEvent.paused = true;
                this.scene.audioManager.pauseAll();
                this.showPauseMenu();
            } else {
                this.scene.physics.resume();
                this.timeEvent.paused = false;
                this.scene.audioManager.resumeAll();
                this.hidePauseMenu();
            }
        } catch (error) {
            console.error('Error toggling pause:', error);
        }
    }

    endGame(reason) {
        try {
            this.isGameOver = true;
            this.scene.physics.pause();
            this.timeEvent.remove();
            
            // Play game over sound
            this.scene.audioManager.play('GAMEOVER');
            
            // Save high score if applicable
            this.updateHighScores();
            
            // Show game over screen
            this.showGameOverScreen(reason);
        } catch (error) {
            console.error('Error ending game:', error);
        }
    }

    updateHighScores() {
        try {
            this.highScores.push({
                score: this.score,
                level: this.level,
                date: new Date().toISOString()
            });
            
            // Sort and keep only top 10
            this.highScores.sort((a, b) => b.score - a.score);
            this.highScores = this.highScores.slice(0, 10);
            
            // Save to local storage
            localStorage.setItem('highScores', JSON.stringify(this.highScores));
        } catch (error) {
            console.error('Error updating high scores:', error);
        }
    }

    loadHighScores() {
        try {
            const savedScores = localStorage.getItem('highScores');
            if (savedScores) {
                this.highScores = JSON.parse(savedScores);
            }
        } catch (error) {
            console.error('Error loading high scores:', error);
            this.highScores = [];
        }
    }

    updateUI() {
        this.updateScoreDisplay();
        this.updateLivesDisplay();
        this.updateLevelDisplay();
        this.updateTimerDisplay();
    }

    updateScoreDisplay() {
        document.getElementById('score').textContent = `Score: ${this.score}`;
    }

    updateLivesDisplay() {
        document.getElementById('lives').textContent = `Lives: ${this.lives}`;
    }

    updateLevelDisplay() {
        document.getElementById('level').textContent = `Level: ${this.level}`;
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = this.gameTime % 60;
        document.getElementById('timer').textContent = 
            `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    showPauseMenu() {
        // Implementation for pause menu UI
    }

    hidePauseMenu() {
        // Implementation for hiding pause menu UI
    }

    showGameOverScreen(reason) {
        // Implementation for game over screen UI
    }

    cleanup() {
        try {
            if (this.timeEvent) {
                this.timeEvent.remove();
            }
            this.powerups.clear();
        } catch (error) {
            console.error('Error cleaning up GameStateManager:', error);
        }
    }
}