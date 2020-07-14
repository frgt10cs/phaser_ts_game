import { GameEntity, direction } from "./gameEntity"
import { GameEntityInterface } from "./gameEntityInterface";

export class Enemy extends GameEntity {

    constructor(sprite: Phaser.Physics.Arcade.Sprite, enemyInterface: GameEntityInterface) {
        super(sprite, enemyInterface);
        this.speed = 80;
        this.entityName = "enemy";
        this.damage = 1;
        this.maxHealth = this.health = 40;
        this.attackCooldown = 500;
        this.entityInetrface.generateHealthBar(this.sprite.x, this.sprite.y - 30, this.maxHealth, 0.2);
    }

    autoControl(player: GameEntity): void {
        this.refresh();
        if (this._isAble && !player.isDead) {
            if (!this.isAttacking) {
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
                    if(this.sprite.body.touching.down)
                        this.currentAnimation = "walk";
                    else
                        this.currentAnimation = "fall";
                }
                else {
                    this.currentAnimation = "attack";
                    this.attack([player]);
                }
            }
        }
        this.sprite.setVelocityX(this.currentSpeed);
        this.playAnim(this.currentAnimation);
        this.entityInetrface.moveHealthBar(this.sprite.x, this.sprite.y - 30);
    }

    onDeath(): void {
        super.onDeath();
        setTimeout(() => {
            this.sprite.destroy();
        }, 4000);
    }
}