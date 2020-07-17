import { Rune } from "./rune";
import { GameEntity } from "./gameEntity";

export class HealingRune extends Rune {
    healInterval;
    constructor(name: string, sprite: Phaser.GameObjects.Sprite, emitterManager: Phaser.GameObjects.Particles.ParticleEmitterManager) {
        super(name, sprite, emitterManager);
        this.duration = 11000;
    }
    onActivate(entity: GameEntity): void {
        this.healInterval = setInterval(() => {
            entity.heal(1);
        }, 1000);
    }
    onOver(entity: GameEntity): void {
        clearInterval(this.healInterval);
    }
}