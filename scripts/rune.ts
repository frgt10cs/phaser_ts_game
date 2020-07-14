import { GameEntity } from "./gameEntity";

export abstract class Rune {
    sprite: Phaser.GameObjects.Sprite;
    constructor(sprite: Phaser.GameObjects.Sprite) {
        this.sprite = sprite;
    }
    abstract action(entity: GameEntity);
}

export class DamageRune extends Rune {
    action(entity: GameEntity) {
        entity.damage *= 2;
        setTimeout(() => {
            entity.damage /= 2;
        }, 25000);
    }
}

export class HealingRune extends Rune {
    action(entity: GameEntity) {        
        let healInterval = setInterval(()=>{
            entity.heal(1);                        
        }, 1000);       
        setTimeout(() => {
            clearInterval(healInterval);
        }, 11000);
    }
}