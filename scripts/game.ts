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
  private _waveNumber: number;
  set waveNumber(value: number) {
    this.waveNumberText.setText("Wave: " + value);
    this._waveNumber = value;
    this.waveDamage = this._waveNumber > this.maxWaveDamage ? this.maxWaveDamage : this._waveNumber;
    this.waveInterval -= this.waveInterval <= this.maxWaveInterval ? 0 : this.enemySpawnIntervalReduce;
  }
  get waveNumber(): number {
    return this._waveNumber;
  }
  private waveInterval: number;
  private readonly maxWaveDamage: number;
  private readonly maxWaveInterval: number;
  private readonly enemySpawnIntervalReduce: number;
  private enemyCount: number;
  private intervals;
  private waveNumberText: Phaser.GameObjects.Text;
  private static playerSounds: Phaser.Sound.BaseSound[];
  private static enemySounds: Phaser.Sound.BaseSound[];
  private waveDamage: number;
  private currentRuneParticleEmmiter: Phaser.GameObjects.Particles.ParticleEmitter;

  controlKeys: Phaser.Input.Keyboard.Key[];

  constructor() {
    super(sceneConfig);
    this.groundLevel = 685;
    this.controlKeys = [];
    this.maxWaveDamage = 4;
    this.maxWaveInterval = 3000;
    this.enemySpawnIntervalReduce = 1000;
  }

  public restart() {
    this.intervals.forEach(clearInterval);
    this.scene.restart();
  }

  public create() {

    this.intervals = [];

    this.input.keyboard.on('keydown_R', this.restart, this);
    this.input.keyboard.on('keydown_M', () => {
      if (SoundManager.isEnabled) {
        if (SoundManager.soundState == SoundState.paused)
          SoundManager.resume();
        else SoundManager.pause();
      }
    }, this);
    this.input.keyboard.on('keydown_P', () => {      
      this.scene.launch("Pause");
      this.scene.pause();      
    }, this);

    this.controlKeys["W"] = this.input.keyboard.addKey("W");
    this.controlKeys["S"] = this.input.keyboard.addKey("S");
    this.controlKeys["A"] = this.input.keyboard.addKey("A");
    this.controlKeys["D"] = this.input.keyboard.addKey("D");
    this.controlKeys["Enter"] = this.input.keyboard.addKey("ENTER");
    this.controlKeys["Shift"] = this.input.keyboard.addKey("SHIFT");
    this.controlKeys["Space"] = this.input.keyboard.addKey("SPACE");

    // invisible platforms
    let platforms = this.physics.add.staticGroup();
    let ground = this.add.sprite(640, 715, "");
    ground.displayWidth = 1280;
    ground.displayHeight = 40;
    platforms.add(ground);
    platforms.refresh();

    // bg 
    let bg = this.add.image(640, 360, "background");

    // labels
    this.waveNumberText = this.add.text(1160, 20, "Wave: ");
    this.add.text(170, 23, "Control: WASD - move, SHIFT - run, SPACE - jump, ENTER - attack.");
    this.add.text(170, 43, "         M -  mute/unmute music, R - restart, P - pause/resume.");

    // aids
    let firstAids = this.physics.add.group();
    this.physics.add.collider(firstAids, platforms);
    let aidsInterval = setInterval(() => {
      if(this.scene.isPaused()) return;
      if (!this.player.isDead) {
        let aid = this.createDestroyableItem("firstAid", 10000);
        firstAids.add(aid);
      }
      else {
        clearInterval(aidsInterval);
      }
    }, 25000);
    this.intervals.push(aidsInterval);

    // damage
    let damageItems = this.physics.add.group();
    this.physics.add.collider(damageItems, platforms);
    let damageItemsInterval = setInterval(() => {
      if(this.scene.isPaused()) return;
      if (!this.player.isDead) {
        let damageItem = this.createDestroyableItem("damageItem", 20000);
        damageItems.add(damageItem);
      }
      else clearInterval(damageItemsInterval);
    }, 45000);
    this.intervals.push(damageItemsInterval);

    // runes
    let ddParticle = this.add.particles("ddParticle");
    let regenParticle = this.add.particles("regenParticle");

    let runeEmitterConfig = {
      lifespan: 2000,
      speedY: -50,
      scale: { start: 0.4, end: 0 },
      quantity: 4,
      blendMode: 'ADD'
    };

    let runeGroup = this.physics.add.group();
    let runeSpawner = this.physics.add.sprite(100, this.groundLevel, "runeSpawner");
    this.physics.add.collider(runeGroup, platforms);
    this.physics.add.collider(runeSpawner, platforms);
    this.physics.add.collider(runeSpawner, runeGroup);
    let runeSprite;
    let maxRunesCount = 2;
    let runeInterval = setInterval(() => {
      if(this.scene.isPaused()) return;
      if (this.currentRune != null) {
        this.currentRune.sprite.destroy();
      }
      let randomInt = Math.floor(Math.random() * maxRunesCount);
      switch (randomInt) {
        case 0:
          runeSprite = this.add.sprite(runeSpawner.x, runeSpawner.y - 20, "damageRune");
          this.currentRune = new DamageRune("doubleDamage", runeSprite, ddParticle);
          break;
        case 1:
          runeSprite = this.add.sprite(runeSpawner.x, runeSpawner.y - 20, "healingRune");
          this.currentRune = new HealingRune("regeneration", runeSprite, regenParticle);
          break;
      }
      runeGroup.add(runeSprite);
    }, 40000);
    this.intervals.push(runeInterval);

    // player
    GameScene.playerSounds = [
      this.sound.add("player|doubleDamage"),
      this.sound.add("player|regeneration"),
      this.sound.add("player|pain"),
      this.sound.add("player|heal"),
      this.sound.add("player|death")
    ];
    this.player = this.createPlayer();
    this.physics.add.collider(this.player.sprite, platforms);

    // enemies
    this.waveNumber = 1;
    this.waveInterval = 10000;
    this.enemies = [];
    this.enemyCount = 0;
    GameScene.enemySounds = [
      this.sound.add("enemy|kill"),
      this.sound.add("enemy|death"),
      this.sound.add("enemy|spawn"),
      this.sound.add("enemy|pain")
    ];
    this.enemyGroup = this.physics.add.group();
    this.physics.add.collider(this.enemyGroup, platforms);
    this.createEnemyAnims();
    let enemySpawnInterval = setInterval(() => {
      if(this.scene.isPaused()) return;
      if (!this.player.isDead) {
        this.createEnemy(this.getRandomX(), -100);
      }
      else {
        clearInterval(enemySpawnInterval);
      }
    }, this.waveInterval);
    this.intervals.push(enemySpawnInterval);

    this.physics.add.overlap(this.player.sprite, firstAids,
      (playerSprite, aid: Phaser.Physics.Arcade.Sprite) => { this.player.playSound("heal"); this.player.heal(4); aid.destroy(); }, null, this);

    this.physics.add.overlap(this.player.sprite, damageItems,
      (playerSprite, damageItem: Phaser.Physics.Arcade.Sprite) => { this.player.hurt(2); damageItem.destroy(); }, null, this);

    this.physics.add.overlap(this.player.sprite, runeGroup,
      (playerSprite, rune: Phaser.Physics.Arcade.Sprite) => { this.player.playSound(this.currentRune.name); this.currentRune.action(this.player); this.player.addEmitter(this.currentRune.getEmitter(), this.currentRune.duration); this.currentRune = null; rune.destroy(); }, null, this);

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
    this.load.image("background", Path.getImagePath("environment/background.jpg"));
    this.load.image("firstAid", Path.getImagePath("environment/first_aid.svg"));
    this.load.image("damageItem", Path.getImagePath("environment/damage_item.svg"));
    this.load.image("healthBar", Path.getImagePath("ui/healthBar.png"));
    this.load.image("healthPoint", Path.getImagePath("ui/healthPoint.png"));
    this.load.image("damageRune", Path.getImagePath("environment/damage_rune.png"));
    this.load.image("healingRune", Path.getImagePath("environment/healing_rune.png"));
    this.load.image("runeSpawner", Path.getImagePath("environment/rune_spawner.png"));

    this.load.image("player", Path.getImagePath("player/player.png"));

    this.load.image("enemy", Path.getImagePath("enemy/enemy.png"));

    this.load.spritesheet("playerAnim",
      Path.getImagePath("player/player_anim_spritesheet.png"),
      { frameWidth: 48, frameHeight: 48, margin: 0, spacing: 0 });

    this.load.spritesheet("enemyAnim",
      Path.getImagePath("enemy/enemy_anim_spritesheet.png"),
      { frameWidth: 48, frameHeight: 48, margin: 0, spacing: 0 });

    this.load.audio("player|doubleDamage", Path.getAudioPath("player/double_damage.mp3"));
    this.load.audio("player|regeneration", Path.getAudioPath("player/regeneration.mp3"));
    this.load.audio("player|pain", Path.getAudioPath("player/pain.mp3"));
    this.load.audio("player|heal", Path.getAudioPath("player/heal.mp3"));
    this.load.audio("player|death", Path.getAudioPath("player/death.mp3"));

    this.load.audio("enemy|kill", Path.getAudioPath("enemy/kill.mp3"));
    this.load.audio("enemy|death", Path.getAudioPath("enemy/death.mp3"));
    this.load.audio("enemy|spawn", Path.getAudioPath("enemy/spawn.mp3"));
    this.load.audio("enemy|pain", Path.getAudioPath("enemy/pain.mp3"));

    this.load.image("ddParticle", Path.getImagePath("environment/dd_particle.png"));
    this.load.image("regenParticle", Path.getImagePath("environment/regen_particle.png"));

    if (SoundManager.isEnabled) {
      this.load.audio("slipknot", Path.getAudioPath("music/slipknot.mp3"));
      this.load.audio("while_she_sleeps", Path.getAudioPath("music/while_she_sleeps.mp3"));
      this.load.audio("powerman_5000", Path.getAudioPath("music/powerman_5000.mp3"));
    }
  }

  private createEnemy(x: number, y: number): void {
    let enemySprite = this.physics.add.sprite(x, y, "enemy");
    let enemyInterface = new GameEntityInterface(this);
    let enemy = new Enemy(this.waveDamage, enemySprite, enemyInterface, GameScene.enemySounds);
    enemy.playSound("spawn");
    this.enemyCount++;
    if (this.enemyCount % 5 == 0) {
      this.waveNumber++;
    }
    this.enemyGroup.add(enemySprite);
    this.enemies.push(enemy);
  }

  private createPlayer(): Player {
    let playerSprite = this.physics.add.sprite(100, 300, "player");
    this.player = new Player(playerSprite, new GameEntityInterface(this), GameScene.playerSounds);
    this.player.playSound("spawn");
    this.createPlayerAnims();
    return this.player;
  }

  private createDestroyableItem(key: string, timeout: number, x: number = this.getRandomX(),
    y: number = this.groundLevel): Phaser.Physics.Arcade.Sprite {
    let item = this.physics.add.sprite(x, y, key);
    setTimeout(() => {
      if (item != null)
        item.destroy();
    }, timeout);
    return item;
  }

  private getRandomX(): number {
    return Math.floor(200 + Math.random() * 750);
  }

  private getRandomY(): Number {
    return Math.floor(0 + Math.random() * this.groundLevel + 20);
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