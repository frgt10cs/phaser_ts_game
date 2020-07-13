import { GameEntity } from "./gameEntity";
import { GameScene } from "./game";

export abstract class GameEntityInterface {
    protected scene:Phaser.Scene;
    protected entity:GameEntity;
    private lastHealthPointIndex: number;
    protected healthBar: Phaser.GameObjects.Image;
    protected healthPoints: Phaser.GameObjects.Image[];
    protected healthBarBorderWidth: number;

    constructor(scene:Phaser.Scene, entity:GameEntity, healthBarBorderWidth: number = 10) {
        this.scene = scene;
        this.entity = entity;
        this.healthBarBorderWidth = healthBarBorderWidth;
        this.healthPoints = [];               
    }

    addHealthPoint(): void {
        this.lastHealthPointIndex++;
        this.healthPoints[this.lastHealthPointIndex].visible = true;
    }

    removeHealthPoint(): void {
        this.healthPoints[this.lastHealthPointIndex].visible = false;
        this.lastHealthPointIndex--;
    }

    generateHealthBar(x: number, y: number, scale: number = 1): void {
        this.healthBar = this.scene.add.image(x, y, "healthBar");
        let healthPointWidth = this.scene.textures.get("healthPoint").getSourceImage().width;
        let startPosition =  this.healthBar.x - this.healthBar.width/2 + this.healthBarBorderWidth;
        for (let i = 0; i < this.entity.maxHealth; i++) {
            this.healthPoints.push(this.scene.add.image(startPosition + i * healthPointWidth, y, "healthPoint"));
        }
        this.healthBar.displayWidth = this.entity.maxHealth * healthPointWidth + 10;
    }

    abstract init(scene: GameScene, entity: GameEntity): void;
}