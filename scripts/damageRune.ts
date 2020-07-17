import { Rune } from "./rune";
import { GameEntity } from "./gameEntity";
export class DamageRune extends Rune {
    constructor(name: string, sprite: Phaser.GameObjects.Sprite, emitterManager: Phaser.GameObjects.Particles.ParticleEmitterManager) {
        super(name, sprite, emitterManager);
        this.duration = 20000;                        
    }
    onActivate(entity: GameEntity): void {
        entity.damage *= 2;
    }
    onOver(entity: GameEntity): void {
        entity.damage /= 2;
    }
}
