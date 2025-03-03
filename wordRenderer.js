/* Last modified: 2025-03-03 03:09:25 UTC */
/* Author: sophieso827 */

class WordRenderer {
    constructor(scene) {
        this.scene = scene;
        this.words = [];
        this.currentLevel = 1;
        this.wordPool = new Map();
        this.activeWords = new Set();
        this.lastSpawnTime = 0;
        this.spawnDelay = WORD_CONFIG.SPAWN_RATES.EASY;
    }

    initialize() {
        try {
            // Initialize word pools for different difficulty levels
            this.initializeWordPools();
            
            // Set up spawn timer
            this.scene.time.addEvent({
                delay: 100,
                callback: this.update,
                callbackScope: this,
                loop: true
            });
        } catch (error) {
            console.error('Error initializing WordRenderer:', error);
        }
    }

    initializeWordPools() {
        // Sample word pools - In a real game, these would be loaded from a database or file
        this.wordPool.set('EASY', [
            { chinese: '我', pinyin: 'wǒ', english: 'I/me' },
            { chinese: '你', pinyin: 'nǐ', english: 'you' },
            { chinese: '好', pinyin: 'hǎo', english: 'good' },
            { chinese: '是', pinyin: 'shì', english: 'is/am/are' }
        ]);

        this.wordPool.set('MEDIUM', [
            { chinese: '学习', pinyin: 'xué xí', english: 'study' },
            { chinese: '工作', pinyin: 'gōng zuò', english: 'work' },
            { chinese: '朋友', pinyin: 'péng you', english: 'friend' }
        ]);

        this.wordPool.set('HARD', [
            { chinese: '学习中文', pinyin: 'xué xí zhōng wén', english: 'study Chinese' },
            { chinese: '很高兴认识你', pinyin: 'hěn gāo xìng rèn shi nǐ', english: 'nice to meet you' }
        ]);
    }

    createWordSprite(wordData, x, y) {
        try {
            const container = this.scene.add.container(x, y);
            
            // Chinese character
            const chineseText = this.scene.add.text(0, 0, wordData.chinese, {
                fontSize: '32px',
                fill: '#ffffff',
                fontFamily: ASSETS.FONTS.CHINESE
            });
            chineseText.setOrigin(0.5);

            // Pinyin
            const pinyinText = this.scene.add.text(0, 35, wordData.pinyin, {
                fontSize: '16px',
                fill: '#ffff00',
                fontFamily: ASSETS.FONTS.MAIN
            });
            pinyinText.setOrigin(0.5);

            container.add([chineseText, pinyinText]);
            container.wordData = wordData;

            // Enable physics for the word container
            this.scene.physics.world.enable(container);
            container.body.setVelocityY(WORD_CONFIG.FALL_SPEEDS.EASY);
            container.body.setCollideWorldBounds(true);

            return container;
        } catch (error) {
            console.error('Error creating word sprite:', error);
            return null;
        }
    }

    spawnWord() {
        try {
            const difficulty = this.getDifficultyForLevel();
            const wordPool = this.wordPool.get(difficulty);
            
            if (!wordPool || wordPool.length === 0) {
                console.warn('No words available for difficulty:', difficulty);
                return;
            }

            const randomWord = wordPool[Math.floor(Math.random() * wordPool.length)];
            const x = Phaser.Math.Between(50, GAME_CONFIG.WIDTH - 50);
            const y = 0;
            const wordSprite = this.createWordSprite(randomWord, x, y);

            if (wordSprite) {
                this.activeWords.add(wordSprite);
            }
        } catch (error) {
            console.error('Error spawning word:', error);
        }
    }

    spawnWordAt(x, y) {
        try {
            const difficulty = this.getDifficultyForLevel();
            const wordPool = this.wordPool.get(difficulty);
            
            if (!wordPool || wordPool.length === 0) {
                console.warn('No words available for difficulty:', difficulty);
                return;
            }

            const randomWord = wordPool[Math.floor(Math.random() * wordPool.length)];
            const wordSprite = this.createWordSprite(randomWord, x, y);

            if (wordSprite) {
                this.activeWords.add(wordSprite);
            }
        } catch (error) {
            console.error('Error spawning word at position:', error);
        }
    }

    getDifficultyForLevel() {
        if (this.currentLevel <= 3) {
            return 'EASY';
        } else if (this.currentLevel <= 6) {
            return 'MEDIUM';
        } else {
            return 'HARD';
        }
    }

    update() {
        try {
            const currentTime = this.scene.time.now;

            if (currentTime >= this.lastSpawnTime + this.spawnDelay) {
                this.spawnWord();
                this.lastSpawnTime = currentTime;
                this.spawnDelay = Math.max(
                    WORD_CONFIG.SPAWN_RATES.HARD,
                    this.spawnDelay * GAME_CONFIG.DIFFICULTY_SCALING.SPAWN_RATE_DECREASE
                );
            }

            this.activeWords.forEach(word => {
                if (word.y > GAME_CONFIG.HEIGHT) {
                    this.activeWords.delete(word);
                    word.destroy();
                    this.scene.gameState.decrementLives();
                }
            });
        } catch (error) {
            console.error('Error updating WordRenderer:', error);
        }
    }

    destroyWord(word) {
        try {
            this.activeWords.delete(word);
            word.destroy();
        } catch (error) {
            console.error('Error destroying word:', error);
        }
    }

    cleanup() {
        try {
            this.activeWords.forEach(word => word.destroy());
            this.activeWords.clear();
        } catch (error) {
            console.error('Error cleaning up WordRenderer:', error);
        }
    }
}