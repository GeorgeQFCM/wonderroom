import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../utils/constants';
import { createParticleTexture, createStarTexture } from '../utils/helpers';

/**
 * 预加载场景
 * 加载所有游戏资源并显示进度
 */
export class PreloadScene extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2;

    // 创建进度条背景
    this.createProgressBar(centerX, centerY);

    // 监听加载进度
    this.load.on('progress', (value: number) => {
      this.updateProgress(value);
    });

    this.load.on('complete', () => {
      this.onLoadComplete();
    });

    // 创建游戏中需要的纹理
    this.createGameTextures();

    // 加载动物图片资源
    this.load.image('animal_rabbit', 'assets/animals/rabbit.png');
    this.load.image('animal_cat', 'assets/animals/cat.png');
    this.load.image('animal_bear', 'assets/animals/bear.png');
    this.load.image('animal_dog', 'assets/animals/dog.png');
    this.load.image('animal_monkey', 'assets/animals/monkey.png');
    this.load.image('animal_pig', 'assets/animals/pig.png');
    this.load.image('animal_cow', 'assets/animals/cow.png');
    this.load.image('animal_dragon', 'assets/animals/dragon.png');
    this.load.image('animal_rat', 'assets/animals/rat.png');
    this.load.image('animal_teddy', 'assets/animals/teddy.png');

    // 加载鱼类图片资源
    this.load.image('fish_blue', 'assets/animals/fish_blue.png');
    this.load.image('fish_orange', 'assets/animals/fish_orange.png');
    this.load.image('fish_pink', 'assets/animals/fish_pink.png');
    this.load.image('fish_green', 'assets/animals/fish_green.png');
    this.load.image('fish_red', 'assets/animals/fish_red.png');

    // 加载UI元素
    this.load.image('btn_round', 'assets/ui/button_round_depth_gradient.png');
    this.load.image('btn_rect', 'assets/ui/button_rectangle_depth_gradient.png');
    this.load.image('star', 'assets/ui/star.png');
    this.load.image('arrow_left', 'assets/ui/arrow_basic_w.png');
    this.load.image('arrow_right', 'assets/ui/arrow_basic_e.png');
    this.load.image('checkmark', 'assets/ui/icon_checkmark.png');
  }

  create(): void {
    // 创建粒子和星星纹理
    createParticleTexture(this);
    createStarTexture(this);
  }

  private createProgressBar(x: number, y: number): void {
    const barWidth = 400;
    const barHeight = 40;

    // 背景
    const bg = this.add.graphics();
    bg.fillGradientStyle(COLORS.purple, COLORS.purple, COLORS.primary, COLORS.primary, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // 装饰性圆形
    bg.fillStyle(0xffffff, 0.05);
    for (let i = 0; i < 20; i++) {
      const px = Phaser.Math.Between(0, GAME_WIDTH);
      const py = Phaser.Math.Between(0, GAME_HEIGHT);
      const radius = Phaser.Math.Between(30, 100);
      bg.fillCircle(px, py, radius);
    }

    // 进度条外框
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x222222, 0.8);
    this.progressBox.fillRoundedRect(x - barWidth / 2 - 10, y - barHeight / 2 - 10, barWidth + 20, barHeight + 20, 20);

    // 进度条
    this.progressBar = this.add.graphics();

    // 加载中的动画装饰
    const loadingDots = this.add.container(x, y + 60);
    for (let i = 0; i < 3; i++) {
      const dot = this.add.graphics();
      dot.fillStyle(COLORS.yellow, 1);
      dot.fillCircle(i * 30 - 30, 0, 10);
      loadingDots.add(dot);

      this.tweens.add({
        targets: dot,
        alpha: 0.3,
        duration: 500,
        delay: i * 200,
        yoyo: true,
        repeat: -1
      });
    }
  }

  private updateProgress(value: number): void {
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2;
    const barWidth = 400;
    const barHeight = 40;

    this.progressBar.clear();

    // 渐变进度条
    this.progressBar.fillStyle(COLORS.secondary, 1);
    this.progressBar.fillRoundedRect(
      centerX - barWidth / 2,
      centerY - barHeight / 2,
      barWidth * value,
      barHeight,
      barHeight / 2
    );
  }

  private createGameTextures(): void {
    // 这些纹理将在 create 中生成
  }

  private onLoadComplete(): void {
    this.time.delayedCall(500, () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('RoomScene');
      });
    });
  }
}
