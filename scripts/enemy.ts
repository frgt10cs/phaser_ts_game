import { GameEntity, direction } from "./gameEntity"

export class Enemy extends GameEntity {

    constructor(sprite: Phaser.Physics.Arcade.Sprite) {
        super(sprite);
        this.speed = 80;
        this.entityName = "enemy";
        this.damage = 1;
        this.maxHealth = this.health = 40;
        this.attackCooldown = 500;
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
                    this.currentAnimation = "walk";
                }
                else {
                    this.currentAnimation = "attack";
                    this.attack([player]);
                }
            }
        }
        this.sprite.setVelocityX(this.currentSpeed);        
        this.playAnim(this.currentAnimation);
    }

    onDeath(): void {
        super.onDeath();
        setTimeout(() => {
            this.sprite.destroy();
        }, 4000);
    }
}