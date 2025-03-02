/* Last modified: 2025-02-28 12:58:27 UTC */
/* Author: sophieso827 */

class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.elements = new Map();
        this.currentScreen = null;
        this.inputEnabled = true;
        this.isTyping = false;
        this.currentInput = '';
    }

    initialize() {
        try {
            this.createMainUI();
            this.setupInputHandlers();
            this.createMenuScreens();
        } catch (error) {
            console.error('Error initializing UIManager:', error);
        }
    }

    createMainUI() {
        try {
            // Create UI container
            const uiContainer = this.scene.add.container(0, 0);
            uiContainer.setDepth(1000);

            // Create input text box
            this.createInputBox();

            // Create hint text
            this.createHintText();

            this.elements.set('mainUI', uiContainer);
        } catch (error) {
            console.error('Error creating main UI:', error);
        }
    }

    createInputBox() {
        try {
            const inputBox = this.scene.add.container(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT - 50);
            
            // Background
            const bg = this.scene.add.rectangle(0, 0, 400, 40, 0x000000, 0.7);
            bg.setStrokeStyle(2, 0x00ff00);
            
            // Text input display
            const inputText = this.scene.add.text(0, 0, '', {
                fontSize: '24px',
                fill: '#ffffff',
                fontFamily: ASSETS.FONTS.MAIN
            });
            inputText.setOrigin(0.5);
            
            inputBox.add([bg, inputText]);
            this.elements.set('inputBox', inputBox);
            this.elements.set('inputText', inputText);
        } catch (error) {
            console.error('Error creating input box:', error);
        }
    }

    createHintText() {
        try {
            const hintText = this.scene.add.text(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT - 90, 
                'Type the Chinese characters or pinyin to shoot', {
                fontSize: '16px',
                fill: '#ffff00',
                fontFamily: ASSETS.FONTS.MAIN
            });
            hintText.setOrigin(0.5);
            this.elements.set('hintText', hintText);
        } catch (error) {
            console.error('Error creating hint text:', error);
        }
    }

    createMenuScreens() {
        try {
            // Create pause menu
            this.createPauseMenu();
            
            // Create game over screen
            this.createGameOverScreen();
            
            // Create help screen
            this.createHelpScreen();
        } catch (error) {
            console.error('Error creating menu screens:', error);
        }
    }

    createPauseMenu() {
        try {
            const pauseContainer = this.scene.add.container(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2);
            pauseContainer.setDepth(2000);
            pauseContainer.visible = false;

            // Background overlay
            const overlay = this.scene.add.rectangle(
                0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT,
                0x000000, 0.7
            );
            overlay.setOrigin(0.5);

            // Pause menu text and buttons
            const pauseText = this.scene.add.text(0, -100, 'GAME PAUSED', {
                fontSize: '48px',
                fill: '#ffffff',
                fontFamily: ASSETS.FONTS.MAIN
            });
            pauseText.setOrigin(0.5);

            const resumeButton = this.createButton(0, 0, 'Resume Game', () => {
                this.scene.gameState.togglePause();
            });

            const helpButton = this.createButton(0, 60, 'Help', () => {
                this.showScreen('help');
            });

            const quitButton = this.createButton(0, 120, 'Quit to Menu', () => {
                this.scene.scene.start('MainMenu');
            });

            pauseContainer.add([overlay, pauseText, resumeButton, helpButton, quitButton]);
            this.elements.set('pauseMenu', pauseContainer);
        } catch (error) {
            console.error('Error creating pause menu:', error);
        }
    }

    createGameOverScreen() {
        try {
            const gameOverContainer = this.scene.add.container(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2);
            gameOverContainer.setDepth(2000);
            gameOverContainer.visible = false;

            // Background overlay
            const overlay = this.scene.add.rectangle(
                0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT,
                0x000000, 0.8
            );
            overlay.setOrigin(0.5);

            // Game over text and stats
            const gameOverText = this.scene.add.text(0, -150, 'GAME OVER', {
                fontSize: '64px',
                fill: '#ff0000',
                fontFamily: ASSETS.FONTS.MAIN
            });
            gameOverText.setOrigin(0.5);

            const statsText = this.scene.add.text(0, -50, '', {
                fontSize: '24px',
                fill: '#ffffff',
                fontFamily: ASSETS.FONTS.MAIN,
                align: 'center'
            });
            statsText.setOrigin(0.5);

            const restartButton = this.createButton(0, 50, 'Play Again', () => {
                this.scene.scene.restart();
            });

            const menuButton = this.createButton(0, 110, 'Main Menu', () => {
                this.scene.scene.start('MainMenu');
            });

            gameOverContainer.add([overlay, gameOverText, statsText, restartButton, menuButton]);
            this.elements.set('gameOverScreen', gameOverContainer);
            this.elements.set('gameOverStats', statsText);
        } catch (error) {
            console.error('Error creating game over screen:', error);
        }
    }

    createButton(x, y, text, callback) {
        try {
            const button = this.scene.add.container(x, y);
            
            const bg = this.scene.add.rectangle(0, 0, 200, 40, 0x333333);
            bg.setStrokeStyle(2, 0x00ff00);
            
            const buttonText = this.scene.add.text(0, 0, text, {
                fontSize: '20px',
                fill: '#ffffff',
                fontFamily: ASSETS.FONTS.MAIN
            });
            buttonText.setOrigin(0.5);
            
            button.add([bg, buttonText]);
            
            button.setInteractive(new Phaser.Geom.Rectangle(-100, -20, 200, 40), 
                Phaser.Geom.Rectangle.Contains);
            
            button.on('pointerover', () => {
                bg.setFillStyle(0x666666);
            });
            
            button.on('pointerout', () => {
                bg.setFillStyle(0x333333);
            });
            
            button.on('pointerdown', callback);
            
            return button;
        } catch (error) {
            console.error('Error creating button:', error);
            return null;
        }
    }

    setupInputHandlers() {
        try {
            this.scene.input.keyboard.on('keydown', this.handleKeydown, this);
            this.scene.input.keyboard.on('keyup', this.handleKeyup, this);
        } catch (error) {
            console.error('Error setting up input handlers:', error);
        }
    }

    handleKeydown(event) {
        try {
            if (!this.inputEnabled) return;

            if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.ENTER) {
                this.submitInput();
            } else if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.BACKSPACE) {
                this.currentInput = this.currentInput.slice(0, -1);
            } else if (event.key.length === 1) {
                this.currentInput += event.key;
            }

            this.updateInputDisplay();
        } catch (error) {
            console.error('Error handling keydown:', error);
        }
    }

    handleKeyup(event) {
        // Handle key release events if needed
    }

    submitInput() {
        try {
            if (this.currentInput.length > 0) {
                // Trigger word matching and shooting
                this.scene.gameState.checkWordMatch(this.currentInput);
                this.currentInput = '';
                this.updateInputDisplay();
            }
        } catch (error) {
            console.error('Error submitting input:', error);
        }
    }

    updateInputDisplay() {
        try {
            const inputText = this.elements.get('inputText');
            if (inputText) {
                inputText.setText(this.currentInput);
            }
        } catch (error) {
            console.error('Error updating input display:', error);
        }
    }

    showScreen(screenName) {
        try {
            // Hide current screen if any
            if (this.currentScreen) {
                this.elements.get(this.currentScreen).visible = false;
            }

            // Show requested screen
            const screen = this.elements.get(screenName);
            if (screen) {
                screen.visible = true;
                this.currentScreen = screenName;
            }
        } catch (error) {
            console.error('Error showing screen:', error);
        }
    }

    hideScreen(screenName) {
        try {
            const screen = this.elements.get(screenName);
            if (screen) {
                screen.visible = false;
                if (this.currentScreen === screenName) {
                    this.currentScreen = null;
                }
            }
        } catch (error) {
            console.error('Error hiding screen:', error);
        }
    }

    updateGameOverStats(stats) {
        try {
            const statsText = this.elements.get('gameOverStats');
            if (statsText) {
                statsText.setText(
                    `Final Score: ${stats.score}\n` +
                    `Level Reached: ${stats.level}\n` +
                    `Words Matched: ${stats.wordsMatched}\n` +
                    `Accuracy: ${stats.accuracy}%`
                );
            }
        } catch (error) {
            console.error('Error updating game over stats:', error);
        }
    }

    cleanup() {
        try {
            this.elements.forEach(element => {
                if (element.destroy) {
                    element.destroy();
                }
            });
            this.elements.clear();
            this.currentScreen = null;
            this.inputEnabled = false;
            this.isTyping = false;
            this.currentInput = '';
        } catch (error) {
            console.error('Error cleaning up UIManager:', error);
        }
    }
}