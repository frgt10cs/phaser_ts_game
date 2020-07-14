import { GameEntity } from "./gameEntity";
import { GameScene } from "./game";

export class GameEntityInterface {
    protected scene: Phaser.Scene;
    private lastHealthPointIndex: number;
    protected healthBar: Phaser.GameObjects.Image;
    protected healthPoints: Phaser.GameObjects.Image[];
    protected healthBarBorderWidth: number;

    constructor(scene: Phaser.Scene, healthBarBorderWidth: number = 10) {
        this.scene = scene;
        this.healthBarBorderWidth = healthBarBorderWidth;
        this.healthPoints = [];
    }

    moveHealthBar(x: number, y: number): void {
        this.healthBar.x = x;
        this.healthBar.y = y;
        let startPosition = this.healthBar.x - this.healthBar.displayWidth / 2 + this.healthBarBorderWidth;
        for (let i = 0; i < this.healthPoints.length; i++) {
            this.healthPoints[i].x = startPosition + i * this.healthBarBorderWidth;
            this.healthPoints[i].y = y;
        }
    }

    addHealthPoints(count: number = 1): void {
        for (let i = 0; i < count && this.lastHealthPointIndex < this.healthPoints.length - 1; i++) {
            this.lastHealthPointIndex++;
            this.healthPoints[this.lastHealthPointIndex].visible = true;
        }
    }

    removeHealthPoints(count: number = 1): void {
        for (let i = 0; i < count && this.lastHealthPointIndex >= 0; i++) {            
            this.healthPoints[this.lastHealthPointIndex].visible = false;
            this.lastHealthPointIndex--;
        }
    }

    generateHealthBar(x: number, y: number, maxHealth: number, scale: number = 1): void {
        this.healthBar = this.scene.add.image(x, y, "healthBar");
        this.healthBar.setScale(scale);
        let healthPointWidth = this.scene.textures.get("healthPoint").getSourceImage().width * scale;
        this.healthBarBorderWidth *= scale;
        this.healthBar.displayWidth = maxHealth * healthPointWidth + this.healthBarBorderWidth;        
        let startPosition = this.healthBar.x - this.healthBar.displayWidth / 2 + this.healthBarBorderWidth;
        for (let i = 0; i < maxHealth; i++) {
            this.healthPoints[i] = this.scene.add.image(startPosition + i * this.healthBarBorderWidth, y, "healthPoint");
            this.healthPoints[i].setScale(scale);
        }
        this.lastHealthPointIndex = maxHealth - 1;
    }

    destroyHealthBar(): void {
        this.healthBar.destroy();
        this.healthPoints.forEach((hp) => hp.destroy());
    }
}