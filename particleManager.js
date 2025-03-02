/* Last modified: 2025-03-02 09:42:09 UTC */
/* Author: sophieso827 */

class ParticleManager {
    constructor(scene) {
        this.scene = scene;
        this.emitters = new Map();
        this.activeEffects = new Set();
    }

    createExplosion(x, y, color = 0xffffff) {
        try {
            // Main explosion particles
            const particles = this.scene.add.particles(0, 0, 'bullet', {
                x: x,
                y: y,
                speed: { min: 200, max: 400 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.6, end: 0 },
                blendMode: 'ADD',
                lifespan: 1000,
                quantity: 20,
                tint: color
            });

            // Sparkle effect
            const sparkles = this.scene.add.particles(0, 0, 'bullet', {
                x: x,
                y: y,
                speed: { min: 100, max: 200 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.4, end: 0 },
                blendMode: 'ADD',
                lifespan: 800,
                quantity: 15,
                tint: 0xffffff
            });

            // Cleanup after animation
            this.scene.time.delayedCall(1000, () => {
                particles.destroy();
                sparkles.destroy();
            });
        } catch (error) {
            console.error('Error creating explosion:', error);
        }
    }

    createTrail(gameObject, config = {}) {
        try {
            const defaultConfig = {
                color: 0x00ff00,
                scale: { start: 0.4, end: 0 },
                alpha: { start: 0.6, end: 0 },
                speed: 20,
                lifespan: 200,
                blendMode: 'ADD'
            };

            const finalConfig = { ...defaultConfig, ...config };

            const emitter = this.scene.add.particles(0, 0, 'bullet', {
                follow: gameObject,
                scale: finalConfig.scale,
                alpha: finalConfig.alpha,
                speed: finalConfig.speed,
                lifespan: finalConfig.lifespan,
                blendMode: finalConfig.blendMode,
                tint: finalConfig.color
            });

            this.emitters.set(gameObject, emitter);
            return emitter;
        } catch (error) {
            console.error('Error creating trail:', error);
            return null;
        }
    }

    createPowerupEffect(gameObject, color) {
        try {
            const effectKey = `powerup_${gameObject.name}_${Date.now()}`;
            
            const emitter = this.scene.add.particles(0, 0, 'bullet', {
                follow: gameObject,
                scale: { start: 0.5, end: 0 },
                alpha: { start: 0.7, end: 0 },
                speed: 50,
                lifespan: 500,
                blendMode: 'ADD',
                tint: color,
                frequency: 50,
                quantity: 2
            });

            this.activeEffects.add(effectKey);
            this.emitters.set(effectKey, emitter);

            return {
                key: effectKey,
                emitter: emitter
            };
        } catch (error) {
            console.error('Error creating powerup effect:', error);
            return null;
        }
    }

    removeEffect(key) {
        try {
            const emitter = this.emitters.get(key);
            if (emitter) {
                emitter.destroy();
                this.emitters.delete(key);
                this.activeEffects.delete(key);
            }
        } catch (error) {
            console.error('Error removing effect:', error);
        }
    }

    removeTrail(gameObject) {
        try {
            const emitter = this.emitters.get(gameObject);
            if (emitter) {
                emitter.destroy();
                this.emitters.delete(gameObject);
            }
        } catch (error) {
            console.error('Error removing trail:', error);
        }
    }

    createTextEffect(x, y, text, config = {}) {
        try {
            const defaultConfig = {
                fontSize: '24px',
                color: '#ffffff',
                duration: 1000,
                rise: 100,
                fade: true
            };

            const finalConfig = { ...defaultConfig, ...config };

            const textObject = this.scene.add.text(x, y, text, {
                fontSize: finalConfig.fontSize,
                fill: finalConfig.color,
                fontFamily: ASSETS.FONTS.MAIN
            });
            textObject.setOrigin(0.5);

            this.scene.tweens.add({
                targets: textObject,
                y: y - finalConfig.rise,
                alpha: finalConfig.fade ? 0 : 1,
                duration: finalConfig.duration,
                ease: 'Power2',
                onComplete: () => {
                    textObject.destroy();
                }
            });

            return textObject;
        } catch (error) {
            console.error('Error creating text effect:', error);
            return null;
        }
    }

    cleanup() {
        try {
            this.emitters.forEach(emitter => {
                emitter.destroy();
            });
            this.emitters.clear();
            this.activeEffects.clear();
        } catch (error) {
            console.error('Error cleaning up particle effects:', error);
        }
    }
}