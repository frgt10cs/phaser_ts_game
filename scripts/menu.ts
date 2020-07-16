import { SoundManager } from "./soundManager";
import { Path } from "./path";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: "Scene"
}

export class MenuScene extends Phaser.Scene {
  constructor() {
    super(sceneConfig);
  }

  create(): void {
    let bg = this.add.image(640, 360, "menuBackground");

    const btnStyle = { fill: "#00FF1E", fontSize: "30px", stroke: "#00B715", strokeThickness: 3 };
    const playBtn = this.add.text(1000, 300, "Play", btnStyle)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.scene.start("Game"));                

    const soundBtn = this.add.text(1000, 350, "Music: off", btnStyle)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        if (SoundManager.isEnabled) {
          soundBtn.setText("Music: off");
        }
        else {
          soundBtn.setText("Music: on");
        }
        SoundManager.isEnabled = !SoundManager.isEnabled;
      });
  }

  update(): void {

  }

  preload(): void {
    this.load.image("menuBackground", Path.getImagePath("environment/menu_background.png"));
  }
}