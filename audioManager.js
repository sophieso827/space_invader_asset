/* Last modified: 2025-03-02 09:42:09 UTC */
/* Author: sophieso827 */

class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.sounds = new Map();
        this.isMuted = false;
        this.currentMusic = null;
        this.soundVolumes = new Map();
    }

    initialize() {
        try {
            // Initialize all audio assets
            Object.entries(ASSETS.AUDIO).forEach(([key, config]) => {
                if (this.scene.cache.audio.exists(key.toLowerCase())) {
                    const sound = this.scene.sound.add(key.toLowerCase(), {
                        volume: config.volume,
                        loop: config.loop || false
                    });
                    this.sounds.set(key.toLowerCase(), sound);
                    this.soundVolumes.set(key.toLowerCase(), config.volume);
                } else {
                    console.warn(`Audio asset not found: ${key}`);
                }
            });
        } catch (error) {
            console.error('Error initializing audio:', error);
        }
    }

    play(key, options = {}) {
        try {
            const sound = this.sounds.get(key.toLowerCase());
            if (sound && !this.isMuted) {
                if (options.loop) {
                    if (this.currentMusic) {
                        this.currentMusic.stop();
                    }
                    this.currentMusic = sound;
                }
                
                sound.play({
                    volume: options.volume || this.soundVolumes.get(key.toLowerCase()),
                    loop: options.loop || false
                });
            }
        } catch (error) {
            console.error(`Error playing sound ${key}:`, error);
        }
    }

    stop(key) {
        try {
            const sound = this.sounds.get(key.toLowerCase());
            if (sound) {
                sound.stop();
                if (this.currentMusic === sound) {
                    this.currentMusic = null;
                }
            }
        } catch (error) {
            console.error(`Error stopping sound ${key}:`, error);
        }
    }

    pauseAll() {
        try {
            this.sounds.forEach(sound => {
                if (sound.isPlaying) {
                    sound.pause();
                }
            });
        } catch (error) {
            console.error('Error pausing all sounds:', error);
        }
    }

    resumeAll() {
        try {
            if (!this.isMuted) {
                this.sounds.forEach(sound => {
                    if (sound.isPaused) {
                        sound.resume();
                    }
                });
            }
        } catch (error) {
            console.error('Error resuming all sounds:', error);
        }
    }

    toggleMute() {
        try {
            this.isMuted = !this.isMuted;
            if (this.isMuted) {
                this.pauseAll();
            } else {
                this.resumeAll();
            }
            return this.isMuted;
        } catch (error) {
            console.error('Error toggling mute:', error);
            return false;
        }
    }

    setVolume(key, volume) {
        try {
            const sound = this.sounds.get(key.toLowerCase());
            if (sound) {
                sound.setVolume(Math.max(0, Math.min(1, volume)));
                this.soundVolumes.set(key.toLowerCase(), volume);
            }
        } catch (error) {
            console.error(`Error setting volume for ${key}:`, error);
        }
    }

    cleanup() {
        try {
            this.sounds.forEach(sound => {
                sound.stop();
                sound.destroy();
            });
            this.sounds.clear();
            this.soundVolumes.clear();
            this.currentMusic = null;
        } catch (error) {
            console.error('Error cleaning up audio:', error);
        }
    }
}