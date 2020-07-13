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
    protected damage: number;
    protected attackDistance: number;
    protected attackCooldown: number;
    protected _isDead;
    get isDead():boolean{
        return this._isDead;
    }

    sprite: Phaser.Physics.Arcade.Sprite;
    anims: Phaser.Types.Animations.Animation[];

    constructor(sprite: Phaser.Physics.Arcade.Sprite) {
        this.sprite = sprite;
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setGravityY(300);

        this.isInAction = false;
        this.isAnimBlocked = false;
        this.currentAnimation = "idle";
        this._isAble = true;
        this.blockingAnims = [];
        this.isAttacking = false;
        this.attackDistance = 15;
        this.attackCooldown;
        this._isDead = false;

        this.sprite.on("animationcomplete", (animation, frame) => {
            if (this.blockingAnims.indexOf(animation.key.split("|")[1]) != -1) this.isAnimBlocked = false;
        }, this);
    }

    hurt(damage: number): void {
        this.health -= damage;
        if (this.health <= 0)
            this.onDeath();        
    }

    heal(hp: number) {
        this.health += hp;
    }

    attack(entity: GameEntity): void {
        if (entity._isDead) return;
        if (Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, entity.sprite.x, entity.sprite.y) <= this.attackDistance && !this.isAttacking) {
            entity.hurt(this.damage);
            this.isAttacking = true;
            setTimeout(() => {
                this.isAttacking = false;
            }, this.attackCooldown)
        }
    }

    refresh(): void {
        this.currentSpeed = 0;
        this.isInAction = false;
        this.currentAnimation = "idle";
    }

    onDeath(): void {
        this._isDead = true;
        this._isAble = false;
        this.playAnim("death");
        this.sprite.setVelocityX(0);
        console.log("KIlled!");
    }

    playAnim(animName: string, startFrame: number = 0): void {
        this.sprite.anims.play(this.entityName + "|" + animName + "|" + direction[this.direction], true, startFrame);
        if (this.blockingAnims.indexOf(animName) != -1) {
            this.isAnimBlocked = true;
        }
    }
}