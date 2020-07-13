import { GameItem } from "./gameItem";
import { GameEntity } from "./gameEntity";

export class DamageItem extends GameItem {
    damage: number;
    constructor(damage: number = 10) {
        super();
        this.damage = damage;
    }

    onTake(entity: GameEntity): void {
        entity.hurt(this.damage);
    }
}