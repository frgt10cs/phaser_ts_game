import { game } from "./main";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: "Scene"
}

export class MenuScene extends Phaser.Scene{
    constructor(){
        super(sceneConfig);
    }

    create():void{
        const playBtn = this.add.text(100,100,"Play", {fill: "#0f0"})
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => this.scene.start("Game"))
        .on('pointerover', () => this.enterButtonHoverState(playBtn))
        .on('pointerout', () => this.enterButtonRestState(playBtn))
        .on('pointerdown', () => this.enterButtonActiveState(playBtn));
    }

    update():void{

    }

    preload():void{

    }

    enterButtonHoverState(button) {
        button.setStyle({ fill: '#ff0'});
      }
    
      enterButtonRestState(button) {
        button.setStyle({ fill: '#0f0' });
      }
    
      enterButtonActiveState(button) {
        button.setStyle({ fill: '#0ff' });
      }
}