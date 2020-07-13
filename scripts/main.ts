import 'phaser';
import { MenuScene } from './menu';
import { GameScene } from './game';

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Sample',

  type: Phaser.AUTO,
  width: 800,
  height: 600,

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },

  scene: [MenuScene, GameScene],

  parent: 'game',
  backgroundColor: '#FFFFFF',
};

export const game = new Phaser.Game(gameConfig);