import { Path } from "./path";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: "Scene"
}

export class MenuScene extends Phaser.Scene {
  menuMusic: Phaser.Sound.BaseSound;
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

    const soundBtn = this.add.text(100, 200, "Sound: on", { fill: "#0f0" })
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => { 
        if(soundBtn.text == "Sound: on"){
          soundBtn.setText("Sound: off"); 
          this.menuMusic.pause();
        }
        else{
          soundBtn.setText("Sound: on"); 
          this.menuMusic.resume();
        }})
      .on('pointerover', () => this.enterButtonHoverState(soundBtn))
      .on('pointerout', () => this.enterButtonRestState(soundBtn))
      .on('pointerdown', () => this.enterButtonActiveState(soundBtn));

    
    this.menuMusic = this.sound.add("menuAuido");
    setTimeout(()=>{
      this.menuMusic.play();
    }, 500);    
  }

  update(): void {

  }

  preload(): void {
    this.load.audio("menuAuido", Path.getAudioPath("menu.mp3"));
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