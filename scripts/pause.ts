import { GameScene } from "./game";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: "Pause"
  }

export class PauseScene extends Phaser.Scene{

    constructor(){
        super(sceneConfig);
    }

    preload(){

    }

    create(){
        this.input.keyboard.on('keydown_P', () => {     
            this.scene.resume("Game");             
            this.scene.stop();   
        }, this);
    }

    update(){

    }
}