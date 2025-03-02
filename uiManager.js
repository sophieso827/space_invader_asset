class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.elements = new Map();
        this.currentScreen = null;
        this.inputEnabled = true;
        this.isTyping = false;
        this.currentInput = '';
        this.lives = GAME_CONFIG.INITIAL_LIVES;
        this.livesContainer = document.getElementById('lives');
        this.background = null;
    }

    initialize() {
        try {
            this.loadBackground();
            this.createMainUI();
            this.setupInputHandlers();
            this.createMenuScreens();
            this.initializeHearts();
        } catch (error) {
            console.error('Error initializing UIManager:', error);
        }
    }

    loadBackground() {
        try {
            // Create background with correct positioning and scaling
            this.background = this.scene.add.image(0, 0, 'background');
            
            // Set origin to top-left corner
            this.background.setOrigin(0, 0);
            
            // Calculate scale to cover the game area
            const scaleX = GAME_CONFIG.WIDTH / this.background.width;
            const scaleY = GAME_CONFIG.HEIGHT / this.background.height;
            const scale = Math.max(scaleX, scaleY);
            
            this.background.setScale(scale);
            
            // Ensure background is at the bottom layer
            this.background.setDepth(-1);
        } catch (error) {
            console.error('Error loading background:', error);
        }
    }

    initializeHearts() {
        try {
            this.livesContainer.innerHTML = '';
            for (let i = 0; i < GAME_CONFIG.INITIAL_LIVES; i++) {
                const heart = document.createElement('img');
                heart.src = ASSETS.SPRITES.HEART.path;
                heart.className = 'heart-icon';
                this.livesContainer.appendChild(heart);
            }
        } catch (error) {
            console.error('Error initializing hearts:', error);
        }
    }

    updateLives(lives) {
        try {
            this.lives = lives;
            const hearts = this.livesContainer.getElementsByClassName('heart-icon');
            for (let i = 0; i < hearts.length; i++) {
                hearts[i].style.visibility = i < lives ? 'visible' : 'hidden';
            }
        } catch (error) {
            console.error('Error updating lives display:', error);
        }
    }

    cleanup() {
        try {
            this.elements.forEach(element => {
                if (element.destroy) {
                    element.destroy();
                }
            });
            if (this.background && this.background.destroy) {
                this.background.destroy();
            }
            this.elements.clear();
            this.currentScreen = null;
            this.inputEnabled = false;
            this.isTyping = false;
            this.currentInput = '';
            this.lives = GAME_CONFIG.INITIAL_LIVES;
            if (this.livesContainer) {
                this.livesContainer.innerHTML = '';
            }
        } catch (error) {
            console.error('Error cleaning up UIManager:', error);
        }
    }
}