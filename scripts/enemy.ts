import { GameEntity, direction } from "./gameEntity"
import { Player } from "./player";

export class Enemy extends GameEntity {

    constructor(sprite: Phaser.Physics.Arcade.Sprite) {
        super(sprite);
        this.speed = 80;
        this.entityName = "enemy";
        this.damage = 1;
        this.maxHealth = this.health = 40;
        this.attackCooldown = 500;
    }    

    autoControl(player: Player): void {
        if(!this._isAble) return;
        this.refresh();
        let diff = player.sprite.x - this.sprite.x;
        if (Math.abs(diff) >= this.attackDistance && this._isAble) {
            if (diff > 0) {
                this.direction = direction.right;
                this.currentSpeed = this.speed;
            }
            else {
                this.direction = direction.left;
                this.currentSpeed = -this.speed;
            }            
            this.currentAnimation = "walk";
        }
        else {
            this.currentSpeed = 0;
            this.currentAnimation = "attack";
            this.attack(player);
        }
        this.sprite.setVelocityX(this.currentSpeed);
        this.playAnim(this.currentAnimation);
    }
}