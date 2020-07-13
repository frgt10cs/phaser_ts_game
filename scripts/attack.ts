import { GameEntity } from "./gameEntity";

export class Attack{
    public damage:number;
    public cooldown:number;
    public currentTargets:GameEntity[];
    public isAttacking:boolean;
}