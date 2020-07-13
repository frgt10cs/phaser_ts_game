import { GameEntityInterface } from "./gameEntityInterface";
import { GameEntity } from "./gameEntity";

export class PlayerInterface extends GameEntityInterface {

    pointsText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, entity: GameEntity) {
        super(scene, entity, 10);
        this.init();
    }

    init(): void {
        this.pointsText = this.scene.add.text(16, 16, "points: 0", { fontsize: "32px", fill: "#000" });
        let healthBarSource = this.scene.textures.get("healthBar").getSourceImage();
        this.generateHealthBar(10 + healthBarSource.width / 2, 10 + healthBarSource.height / 2);
    }

    setPoints(pointsCount): void {
        this.pointsText.setText("points: " + pointsCount);
    }
}