import { GameEntityInterface } from "./gameEntityInterface";

export enum direction {
    left, right
}

export abstract class GameEntity {
    protected entityName: string;

    protected health: number;
    protected maxHealth: number;

    public damage: number;

    protected speed: number;
    protected runCoeff: number;
    protected currentSpeed: number;
    protected direction: direction;

    protected isInAction: boolean;
    private isAnimBlocked: boolean;
    protected currentAnimation: string;
    protected blockingAnims: string[];

    protected _isAble: boolean;
    get isAble(): boolean {
        return this._isAble;
    }
    protected _isDead;
    get isDead(): boolean {
        return this._isDead;
    }

    protected isAttacking;
    protected attackDistance: number;
    protected attackCooldown: number;
    protected attackTargets: GameEntity[];

    private sounds: Phaser.Sound.BaseSound[];
    
    protected entityInetrface: GameEntityInterface;
    protected emitters: Phaser.GameObjects.Particles.ParticleEmitter[];

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
        this.emitters = [];

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
        else this.playSound("pain");
        return isKilled;
    }

    heal(hp: number) {
        this.health += hp;
        if (this.health > this.maxHealth)
            this.health = this.maxHealth;
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

    refreshMovingState(): void {
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

    addEmitter(emitter: Phaser.GameObjects.Particles.ParticleEmitter, timeout: number): void {
        this.emitters.push(emitter);
        setTimeout(() => {
            let index = this.emitters.indexOf(emitter);
            if (index > -1)
                this.emitters.splice(index, 1);
            emitter.remove();
        }, timeout);
    }

    syncEffectsPosition(): void {
        let minX: number;
        let maxX: number;
        if (this.direction == direction.right) {
            minX = this.sprite.x - 20;
            maxX = this.sprite.x + 5;
        }
        else {
            minX = this.sprite.x - 5;
            maxX = this.sprite.x + 20;
        }
        this.emitters.forEach((emitter) => {
            emitter.setPosition({ min: minX, max: maxX },
                { min: this.sprite.y - 10, max: this.sprite.y + 10 });
        });
    }
}