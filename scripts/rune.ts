import { GameEntity } from "./gameEntity";
export abstract class Rune {
    sprite: Phaser.GameObjects.Sprite;
    name: string;
    emitterConfig: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig;
    emitterManager: Phaser.GameObjects.Particles.ParticleEmitterManager;
    duration: number;        

    constructor(name: string, sprite: Phaser.GameObjects.Sprite, emitterManager: Phaser.GameObjects.Particles.ParticleEmitterManager) {
        this.name = name;
        this.sprite = sprite;
        this.emitterManager = emitterManager;

        this.emitterConfig = {
            lifespan: 2000,
            speedY: -25,
            scale: { start: 0.4, end: 0 },
            quantity: 4,
            blendMode: 'ADD'
        };
    }

    action(entity: GameEntity) {
        this.onActivate(entity);
        setTimeout(() => {
            this.onOver(entity);
        }, this.duration);
    }

    getEmitter() {
        return this.emitterManager.createEmitter(this.emitterConfig);
    }

    abstract onActivate(entity: GameEntity): void;
    abstract onOver(entity: GameEntity): void;
}