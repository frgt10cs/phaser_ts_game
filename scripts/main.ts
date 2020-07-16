import 'phaser';
import { MenuScene } from './menu';
import { GameScene } from './game';
import { PauseScene } from './pause';

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Sample',

  type: Phaser.AUTO,
  width: 1280,
  height: 720,

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },

  audio: {
    disableWebAudio: true
  },

  scene: [MenuScene, GameScene, PauseScene],

  parent: 'game',
  backgroundColor: '#FFFFFF',
};

export const game = new Phaser.Game(gameConfig);
game.input.keyboard.onKeyDown = function(){

}