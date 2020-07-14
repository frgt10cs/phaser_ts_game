import { Player } from "./player";
import { Enemy } from "./enemy";
import { Path } from "./path";
import { GameEntityInterface } from "./gameEntityInterface";
import { Rune, DamageRune, HealingRune } from "./rune";
import { SoundManager, SoundState } from "./soundManager";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: "Game"
}

export class GameScene extends Phaser.Scene {

  private player: Player;
  private enemies: Enemy[];
  private enemyGroup: Phaser.Physics.Arcade.Group;
  private currentRune: Rune;
  private groundLevel: number;
  private wave: number;
  private waveInterval: number;
  private readonly maxWaveDamage:number;
  private readonly maxWaveInterval:number;
  private enemyCount: number;

  controlKeys: Phaser.Input.Keyboard.Key[];

  constructor() {
    super(sceneConfig);
    this.groundLevel = 400;
    this.controlKeys = [];
    this.enemies = [];
    this.wave = 0;
    this.waveInterval = 10000;
    this.maxWaveDamage = 4;
    this.maxWaveInterval = 3000;
  }

  public restart() {
    this.scene.restart();
  }

  public create() {

    this.input.keyboard.on('keydown_R', this.restart, this);
    this.input.keyboard.on('keydown_M', () => {
      if (SoundManager.isEnabled) {
        if (SoundManager.soundState == SoundState.paused)
          SoundManager.resume();
        else SoundManager.pause();
      }
    }, this);

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
    this.physics.add.collider(firstAids, platforms);
    setInterval(() => {
      let randomInt = Math.floor(50 + Math.random() * 750);
      firstAids.create(randomInt, this.groundLevel, "firstAid");
    }, 25000);

    // damage
    let damageItems = this.physics.add.group();
    this.physics.add.collider(damageItems, platforms);
    setInterval(() => {
      let randomInt = Math.floor(50 + Math.random() * 750);
      damageItems.create(randomInt, this.groundLevel, "damageItem");
    }, 45000);

    // runes
    let runeGroup = this.physics.add.group();
    let runeSpawner = this.physics.add.sprite(100, 400, "runeSpawner");
    this.physics.add.collider(runeGroup, platforms);
    this.physics.add.collider(runeSpawner, platforms);
    this.physics.add.collider(runeSpawner, runeGroup);
    let runeSprite;
    let maxRunesCount = 2;
    setInterval(() => {
      if (this.currentRune != null)
        this.currentRune.sprite.destroy();
      let randomInt = Math.floor(Math.random() * maxRunesCount);
      switch (randomInt) {
        case 0:
          runeSprite = this.add.sprite(runeSpawner.x, runeSpawner.y - 10, "damageRune");
          this.currentRune = new DamageRune(runeSprite);
          break;
        case 1:
          runeSprite = this.add.sprite(runeSpawner.x, runeSpawner.y - 10, "attackSpeedRune");
          this.currentRune = new HealingRune(runeSprite);
          break;
      }
      runeGroup.add(runeSprite);
    }, 40000);

    // player
    this.player = this.createPlayer();
    this.physics.add.collider(this.player.sprite, platforms);

    // enemies
    this.enemyGroup = this.physics.add.group();
    this.physics.add.collider(this.enemyGroup, platforms);
    this.createEnemyAnims();
    let enemySpawnInterval = setInterval(() => {
      if (!this.player.isDead) {
        this.createEnemy(600, 300);
      }
      else {
        clearInterval(enemySpawnInterval);
      }
    }, this.waveInterval);

    this.physics.add.overlap(this.player.sprite, firstAids,
      (playerSprite, aid: Phaser.Physics.Arcade.Sprite) => { this.player.heal(4); aid.destroy(); }, null, this);

    this.physics.add.overlap(this.player.sprite, damageItems,
      (playerSprite, damageItem: Phaser.Physics.Arcade.Sprite) => { this.player.hurt(2); damageItem.destroy(); }, null, this);

    this.physics.add.overlap(this.player.sprite, runeGroup,
      (playerSprite, rune: Phaser.Physics.Arcade.Sprite) => { this.currentRune.action(this.player); this.currentRune = null; rune.destroy(); }, null, this);

      this.add.text(200, 100, "Killed: ");

    if (SoundManager.isEnabled) {
      let playlist: Phaser.Sound.BaseSound[] = [];
      playlist.push(this.sound.add("slipknot"));
      playlist.push(this.sound.add("while_she_sleeps"));
      playlist.push(this.sound.add("powerman_5000"));
      SoundManager.init(playlist);
      SoundManager.play();
    }
  }

  public update() {
    if (this.player.isAble)
      this.player.handleControl(this.controlKeys, this.game.input.activePointer, this.enemies);
    this.enemies.forEach((enemy: Enemy) => {
      if (enemy.isAble)
        enemy.autoControl(this.player);
    });
  }

  public preload() {
    this.load.image("platform", Path.getImagePath("hotpng.com.png"));
    this.load.image("firstAid", Path.getImagePath("environment/first_aid.svg"));
    this.load.image("damageItem", Path.getImagePath("environment/damage_item.svg"));
    this.load.image("healthBar", Path.getImagePath("ui/healthBar.png"));
    this.load.image("healthPoint", Path.getImagePath("ui/healthPoint.png"));
    this.load.image("damageRune", Path.getImagePath("environment/damage_rune.png"));
    this.load.image("attackSpeedRune", Path.getImagePath("environment/attack_speed_rune.png"));
    this.load.image("runeSpawner", Path.getImagePath("environment/rune_spawner.png"));

    this.load.image("player", Path.getImagePath("player/player.png"));

    this.load.image("enemy", Path.getImagePath("enemy/enemy.png"));

    this.load.spritesheet("playerAnim",
      Path.getImagePath("player/player_anim_spritesheet.png"),
      { frameWidth: 48, frameHeight: 48, margin: 0, spacing: 0 });

    this.load.spritesheet("enemyAnim",
      Path.getImagePath("enemy/enemy_anim_spritesheet.png"),
      { frameWidth: 48, frameHeight: 48, margin: 0, spacing: 0 });

    if (SoundManager.isEnabled) {
      this.load.audio("slipknot", Path.getAudioPath("slipknot.mp3"));
      this.load.audio("while_she_sleeps", Path.getAudioPath("while_she_sleeps.mp3"));
      this.load.audio("powerman_5000", Path.getAudioPath("powerman_5000.mp3"));
    }
  }

  private createEnemy(x: number, y: number): void {
    let enemySprite = this.physics.add.sprite(x, y, "enemy");
    let enemyInterface = new GameEntityInterface(this);
    let enemy = new Enemy(enemySprite, enemyInterface);
    let waveDamage = this.wave + 1;
    enemy.damage = waveDamage >= this.maxWaveDamage ? this.maxWaveDamage : waveDamage;
    this.enemyCount++;
    if (this.enemyCount % 10 == 0) {
      this.wave++;
      this.waveInterval -= this.waveInterval <= this.maxWaveInterval ? 0 : 250;
    }
    this.enemyGroup.add(enemySprite);
    this.enemies.push(enemy);
  }

  private createPlayer(): Player {
    let playerSprite = this.physics.add.sprite(100, 300, "player");
    this.player = new Player(playerSprite, new GameEntityInterface(this));
    this.createPlayerAnims();
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

    this.anims.create({
      key: 'enemy|fall|right',
      frames: this.anims.generateFrameNumbers('enemyAnim', { start: 47, end: 47 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'enemy|fall|left',
      frames: this.anims.generateFrameNumbers('enemyAnim', { start: 41, end: 41 }),
      frameRate: 10,
      repeat: -1
    });
  }
}