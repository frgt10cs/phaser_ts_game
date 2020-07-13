import { GameEntity } from "./gameEntity";

export abstract class GameItem{
    abstract onTake(entity:GameEntity):void;
}