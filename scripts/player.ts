import 'phaser';
import { GameEntity, direction } from "./gameEntity";
import { Enemy } from './enemy';
import { GameEntityInterface } from './gameEntityInterface';

export class Player extends GameEntity {
  points: number;
  constructor(sprite: Phaser.Physics.Arcade.Sprite, entityInterface:GameEntityInterface) {
    super(sprite, entityInterface);
    this.maxHealth = this.health = 10;    
    this.speed = 160;
    this.runCoeff = 1.5;
    this.currentSpeed = 0;
    this.damage = 10;
    this.entityName = "player";
    this.attackCooldown = 500;
  }

  handleControl(controlKeys: Phaser.Input.Keyboard.Key[], activePointer: Phaser.Input.Pointer, enemies: Enemy[]): void {
    this.refresh();
    if (controlKeys["D"].isDown) {
      this.currentSpeed = 160;
      this.direction = direction.right;
    }
    else if (controlKeys["A"].isDown) {
      this.currentSpeed = -160;
      this.direction = direction.left;
    }

    if (this.currentSpeed != 0) {
      this.isInAction = true;
      if (controlKeys["Shift"].isDown) {
        this.currentSpeed *= 2;
        this.currentAnimation = "run";
      }
      else this.currentAnimation = "walk";
    }
    this.sprite.setVelocityX(this.currentSpeed);

    if (this.sprite.body.touching.down) {
      if ((controlKeys["W"].isDown || controlKeys["Space"].isDown)) {
        this.sprite.setVelocityY(-330);
        this.currentAnimation = "jump";
        this.isInAction = true;
      }

      if (activePointer.leftButtonDown() || controlKeys["Enter"].isDown) {
        if (this.currentAnimation == "walk")
          this.currentAnimation = "attack_walk";
        else if (this.currentAnimation == "idle") this.currentAnimation = "attack";
        this.isInAction = true;

        this.attack(enemies);
      }
    }
    else {
      if (this.sprite.body.velocity.y < 0) {
        this.currentAnimation = "jump";
      }
      else {
        this.currentAnimation = "fall";
      }
      this.isInAction = true;
    }

    this.playAnim(this.currentAnimation);
  }
}