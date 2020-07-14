import { SoundManager } from "./soundManager";

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
    const playBtn = this.add.text(100, 100, "Play", { fill: "#0f0" })
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.scene.start("Game"))
      .on('pointerover', () => this.enterButtonHoverState(playBtn))
      .on('pointerout', () => this.enterButtonRestState(playBtn))
      .on('pointerdown', () => this.enterButtonActiveState(playBtn));

    const soundBtn = this.add.text(100, 200, "Music: off", { fill: "#0f0" })
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => { 
        if(SoundManager.isEnabled){
          soundBtn.setText("Music: off");          
        }
        else{
          soundBtn.setText("Music: on");           
        }
        SoundManager.isEnabled = !SoundManager.isEnabled;
      })
      .on('pointerover', () => this.enterButtonHoverState(soundBtn))
      .on('pointerout', () => this.enterButtonRestState(soundBtn))
      .on('pointerdown', () => this.enterButtonActiveState(soundBtn));    
  }

  update(): void {

  }

  preload(): void {
    
  }

  enterButtonHoverState(button) {
    button.setStyle({ fill: '#ff0' });
  }

  enterButtonRestState(button) {
    button.setStyle({ fill: '#0f0' });
  }

  enterButtonActiveState(button) {
    button.setStyle({ fill: '#0ff' });
  }
}