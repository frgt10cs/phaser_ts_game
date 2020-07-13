import { Player } from "./player";
import { Enemy } from "./enemy";
import { Path } from "./path";
import { PlayerInterface } from "./playerInterface";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: "Game"
}

export class GameScene extends Phaser.Scene {

  private player: Player;
  private enemies: Enemy[];
  private enemyGroup: Phaser.Physics.Arcade.Group;

  controlKeys: Phaser.Input.Keyboard.Key[];

  constructor() {
    super(sceneConfig);
  }

  public restart() {
    this.scene.restart();
  }

  public create() {

    this.input.keyboard.on('keydown_R', this.restart, this);
    this.controlKeys = [];
    this.controlKeys["W"] = this.input.keyboard.addKey("W");
    this.controlKeys["S"] = this.input.keyboard.addKey("S");
    this.controlKeys["A"] = this.input.keyboard.addKey("A");
    this.controlKeys["D"] = this.input.keyboard.addKey("D");
    this.controlKeys["Enter"] = this.input.keyboard.addKey("ENTER");
    this.controlKeys["Shift"] = this.input.keyboard.addKey("SHIFT");
    this.controlKeys["Space"] = this.input.keyboard.addKey("SPACE");

    // platforms
    let platforms = this.physics.add.staticGroup();
    platforms.create(600, 520, "platform").setScale(0.5).refreshBody();
    platforms.create(200, 600, "platform").setScale(0.5).refreshBody();

    // aids
    let firstAids = this.physics.add.group();
    firstAids.create(300, 300, "firstAid");
    this.physics.add.collider(firstAids, platforms);

    // damage
    let damageItems = this.physics.add.group();
    damageItems.create(600, 300, "damageItem");
    this.physics.add.collider(damageItems, platforms);

    // player
    this.player = this.createPlayer();
    this.physics.add.collider(this.player.sprite, platforms);

    // enemies
    this.enemyGroup = this.physics.add.group();
    this.physics.add.collider(this.enemyGroup, platforms);
    this.enemies = [];
    this.createEnemyAnims();
    let enemySpawnInterval = setInterval(() => {
      if (!this.player.isDead) {
        this.createEnemy(600, 300);
      }
      else {
        clearInterval(enemySpawnInterval);
      }
    }, 10000);

    this.physics.add.overlap(this.player.sprite, firstAids,
      (playerSprite, firstAid: Phaser.Physics.Arcade.Sprite) => { this.player.heal(10); firstAid.disableBody(true, true) }, null, this);

    this.physics.add.overlap(this.player.sprite, damageItems,
      (playerSprite, damageItem: Phaser.Physics.Arcade.Sprite) => { setTimeout(() => { this.player.hurt(10); }, 1000); damageItem.disableBody(true, true) }, null, this);
  }

  public update() {

    if (this.player.isAble)
      this.player.handleControl(this.controlKeys, this.game.input.activePointer, this.enemies);
    this.enemies.forEach((enemy: Enemy) => {
      if (enemy.isAble)
        enemy.autoControl(this.player);
    })
  }

  public preload() {
    this.load.image("platform", Path.getImagePath("hotpng.com.png"));
    this.load.image("firstAid", Path.getImagePath("first_aid.svg"));
    this.load.image("damageItem", Path.getImagePath("damage_item.svg"));
    this.load.image("healthBar", Path.getImagePath("healthBar.png"));
    this.load.image("healthPoint", Path.getImagePath("healthPoint.png"));

    this.load.image("player", Path.getImagePath("player/player.png"));

    this.load.image("enemy", Path.getImagePath("enemy/enemy.png"));

    this.load.spritesheet("playerAnim",
      Path.getImagePath("player/player_anim_spritesheet.png"),
      { frameWidth: 48, frameHeight: 48, margin: 0, spacing: 0 });

    this.load.spritesheet("enemyAnim",
      Path.getImagePath("enemy/enemy_anim_spritesheet.png"),
      { frameWidth: 48, frameHeight: 48, margin: 0, spacing: 0 });
  }

  private createEnemy(x: number, y: number): void {
    let enemySprite = this.physics.add.sprite(x, y, "enemy");
    let enemy = new Enemy(enemySprite);
    this.enemyGroup.add(enemySprite);
    this.enemies.push(enemy);
  }

  private createPlayer(): Player {
    let playerSprite = this.physics.add.sprite(100, 300, "player");
    this.player = new Player(playerSprite);
    this.createPlayerAnims();
    let playerInterface: PlayerInterface = new PlayerInterface(this, this.player);
    return this.player;
  }

  private createPlayerAnims() {
    this.anims.create({
      key: 'player|walk|right',
      frames: this.anims.generateFrameNumbers('playerAnim', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'player|walk|left',
      frames: this.anims.generateFrameNumbers('playerAnim', { start: 6, end: 11 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'player|run|right',
      frames: this.anims.generateFrameNumbers('playerAnim', { start: 36, end: 41 }),
      frameRate: 10,
      repeat: -1
    })

    this.anims.create({
      key: 'player|run|left',
      frames: this.anims.generateFrameNumbers('playerAnim', { start: 42, end: 47 }),
      frameRate: 10,
      repeat: -1
    }),

      this.anims.create({
        key: 'player|idle|right',
        frames: this.anims.generateFrameNumbers('playerAnim', { start: 12, end: 15 }),
        frameRate: 5,
        repeat: -1
      });

    this.anims.create({
      key: 'player|idle|left',
      frames: this.anims.generateFrameNumbers('playerAnim', { start: 18, end: 21 }),
      frameRate: 5,
      repeat: -1
    });

    this.anims.create({
      key: 'player|jump|right',
      frames: this.anims.generateFrameNumbers('playerAnim', { start: 16, end: 17 }),
      frameRate: 1,
      repeat: -1
    });

    this.anims.create({
      key: 'player|jump|left',
      frames: this.anims.generateFrameNumbers('playerAnim', { start: 22, end: 23 }),
      frameRate: 1,
      repeat: -1
    });

    this.anims.create({
      key: 'player|fall|right',
      frames: this.anims.generateFrameNumbers('playerAnim', { start: 48, end: 48 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'player|fall|left',
      frames: this.anims.generateFrameNumbers('playerAnim', { start: 49, end: 49 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'player|attack_walk|right',
      frames: this.anims.generateFrameNumbers('playerAnim', { start: 24, end: 29 }),
      frameRate: 10,
      repeat: 0
    });

    this.anims.create({
      key: 'player|attack_walk|left',
      frames: this.anims.generateFrameNumbers('playerAnim', { start: 30, end: 35 }),
      frameRate: 10,
      repeat: 0
    });

    this.anims.create({
      key: 'player|death|right',
      frames: this.anims.generateFrameNumbers('playerAnim', { start: 54, end: 59 }),
      frameRate: 3,
      repeat: 0
    });

    this.anims.create({
      key: 'player|death|left',
      frames: this.anims.generateFrameNumbers('playerAnim', { start: 60, end: 65 }),
      frameRate: 3,
      repeat: 0
    });

    this.anims.create({
      key: 'player|attack|right',
      frames: this.anims.generateFrameNumbers('playerAnim', { start: 66, end: 71 }),
      frameRate: 15,
      repeat: 0
    });

    this.anims.create({
      key: 'player|attack|left',
      frames: this.anims.generateFrameNumbers('playerAnim', { start: 72, end: 77 }),
      frameRate: 15,
      repeat: 0
    });    
  }

  private createEnemyAnims() {
    this.anims.create({
      key: 'enemy|walk|right',
      frames: this.anims.generateFrameNumbers('enemyAnim', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'enemy|walk|left',
      frames: this.anims.generateFrameNumbers('enemyAnim', { start: 6, end: 11 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'enemy|attack|right',
      frames: this.anims.generateFrameNumbers('enemyAnim', { start: 12, end: 17 }),
      frameRate: 10,
      repeat: 0
    });

    this.anims.create({
      key: 'enemy|attack|left',
      frames: this.anims.generateFrameNumbers('enemyAnim', { start: 18, end: 23 }),
      frameRate: 10,
      repeat: 0
    });

    this.anims.create({
      key: 'enemy|death|right',
      frames: this.anims.generateFrameNumbers('enemyAnim', { start: 24, end: 29 }),
      frameRate: 3,
      repeat: 0
    });

    this.anims.create({
      key: 'enemy|death|left',
      frames: this.anims.generateFrameNumbers('enemyAnim', { start: 30, end: 35 }),
      frameRate: 3,
      repeat: 0
    });

    this.anims.create({
      key: 'enemy|idle|right',
      frames: this.anims.generateFrameNumbers('enemyAnim', { start: 36, end: 39 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'enemy|idle|left',
      frames: this.anims.generateFrameNumbers('enemyAnim', { start: 42, end: 45 }),
      frameRate: 10,
      repeat: -1
    });    
  }
}