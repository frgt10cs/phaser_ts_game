import 'phaser';
import { MenuScene } from './menu';
import { GameScene } from './game';

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

  scene: [MenuScene, GameScene],

  parent: 'game',
  backgroundColor: '#FFFFFF',
};

export const game = new Phaser.Game(gameConfig);