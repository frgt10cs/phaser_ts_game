import { GameItem } from "./gameItem";
import { GameEntity } from "./gameEntity";
export class FirstAid extends GameItem {
    hpHeal: number;

    constructor(hpHeal: number = 10) {
        super();
        this.hpHeal = hpHeal;
    }

    onTake(entity: GameEntity): void {
        entity.heal(this.hpHeal);
    }
}