import { GameEntityInterface } from "./gameEntityInterface";

export enum direction {
    left, right
}

export abstract class GameEntity {
    protected health: number;
    public maxHealth: number;
    protected speed: number;
    protected runCoeff: number;
    public currentSpeed: number;
    public direction: direction;
    public isInAction: boolean;
    public isAnimBlocked: boolean;
    public currentAnimation: string;
    protected _isAble: boolean;
    get isAble(): boolean {
        return this._isAble;
    }
    public blockingAnims: string[];
    protected entityName: string;
    public isAttacking;
    public damage: number;
    protected attackDistance: number;
    public attackCooldown: number;
    protected _isDead;
    get isDead(): boolean {
        return this._isDead;
    }
    private sounds: Phaser.Sound.BaseSound[];

    protected attackTargets: GameEntity[];
    protected entityInetrface: GameEntityInterface;

    sprite: Phaser.Physics.Arcade.Sprite;
    anims: Phaser.Types.Animations.Animation[];

    constructor(sprite: Phaser.Physics.Arcade.Sprite, entityInetrface: GameEntityInterface, sounds: Phaser.Sound.BaseSound[] = []) {
        this.sprite = sprite;
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setGravityY(300);

        this.entityInetrface = entityInetrface;
        this.direction = direction.right;
        this.isInAction = false;
        this.isAnimBlocked = false;
        this.currentAnimation = "idle";
        this._isAble = true;
        this.blockingAnims = [];
        this.isAttacking = false;
        this.attackDistance = 15;
        this.attackCooldown;
        this._isDead = false;
        this.attackTargets = [];
        this.blockingAnims = ["attack", "attack_walk", "death"];
        this.sounds = sounds;

        this.sprite.on("animationcomplete", (animation, frame) => {
            if (this.blockingAnims.indexOf(animation.key.split("|")[1]) != -1)
                this.isAnimBlocked = false;
            if (animation.key.includes("attack")) {
                this.attackTargets.forEach((target) => {
                    if (!target._isDead && Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, target.sprite.x, target.sprite.y) <= this.attackDistance) {
                        if (target.hurt(this.damage)) {
                            this.playSound("kill");
                        }
                    }
                });
            }
        }, this);
    }

    hurt(damage: number): boolean {
        if (this._isDead) return false;
        let isKilled = false;
        this.health -= damage;
        this.entityInetrface.removeHealthPoints(damage);
        if (this.health <= 0) {
            this.entityInetrface.destroyHealthBar();
            this.onDeath();
            isKilled = true;
        }
        return isKilled;
    }

    heal(hp: number) {
        this.health += hp;
        this.entityInetrface.addHealthPoints(hp);
    }

    attack(entities: GameEntity[]): void {
        this.isAttacking = true;
        this.attackTargets = entities;
        setTimeout(() => {
            this.isAttacking = false;
            this.attackTargets = [];
        }, this.attackCooldown);
    }

    refresh(): void {
        this.currentSpeed = 0;
        this.isInAction = false;
        this.currentAnimation = "idle";
    }

    onDeath(): void {
        this._isDead = true;
        this._isAble = false;
        this.playAnim("death", true);
        this.sprite.setVelocityX(0);
        this.playSound("death");
    }

    playAnim(animName: string, force: boolean = false, startFrame: number = 0): void {
        if (this.isAnimBlocked && !force) return;
        this.sprite.anims.play(this.entityName + "|" + animName + "|" + direction[this.direction], true, startFrame);
        if (this.blockingAnims.indexOf(animName) != -1) {
            this.isAnimBlocked = true;
        }
    }

    playSound(key: string): void {
        key = this.entityName + "|" + key;
        for (let i = 0; i < this.sounds.length; i++) {
            if (this.sounds[i].key == key) {
                this.sounds[i].play();
                break;
            }
        }
    }
}