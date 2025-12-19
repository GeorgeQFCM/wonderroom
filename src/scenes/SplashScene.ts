import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, MIN_HIT_AREA } from '../utils/constants';

/**
 * 启动页场景
 * 目的：通过用户点击解锁浏览器的 AudioContext
 */
export class SplashScene extends Phaser.Scene {
  private startButton!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'SplashScene' });
  }

  create(): void {
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2;

    // 背景渐变
    this.createBackground();

    // 标题装饰 - 可爱的星星
    this.createDecorations();

    // 创建巨大的开始按钮
    this.createStartButton(centerX, centerY);

    // 添加呼吸动画提示点击
    this.addPulseAnimation();
  }

  private createBackground(): void {
    const graphics = this.add.graphics();

    // 渐变背景
    graphics.fillGradientStyle(
      COLORS.purple,
      COLORS.purple,
      COLORS.primary,
      COLORS.primary,
      1
    );
    graphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // 添加一些装饰性圆形
    graphics.fillStyle(0xffffff, 0.1);
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(0, GAME_HEIGHT);
      const radius = Phaser.Math.Between(20, 80);
      graphics.fillCircle(x, y, radius);
    }
  }

  private createDecorations(): void {
    // 创建闪烁的星星装饰
    const starPositions = [
      { x: 200, y: 150 },
      { x: 1080, y: 180 },
      { x: 150, y: 520 },
      { x: 1130, y: 550 },
      { x: 640, y: 100 }
    ];

    starPositions.forEach((pos, index) => {
      const star = this.createStar(pos.x, pos.y, 30);
      this.tweens.add({
        targets: star,
        alpha: 0.3,
        duration: 1000 + index * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });
  }

  private createStar(x: number, y: number, size: number): Phaser.GameObjects.Graphics {
    const graphics = this.add.graphics();
    graphics.fillStyle(COLORS.yellow, 1);

    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size / 2;

    graphics.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / spikes - Math.PI / 2;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      if (i === 0) {
        graphics.moveTo(px, py);
      } else {
        graphics.lineTo(px, py);
      }
    }
    graphics.closePath();
    graphics.fillPath();

    return graphics;
  }

  private createStartButton(x: number, y: number): void {
    // 按钮尺寸 - 确保大于75px的最小触摸区域
    const buttonWidth = 300;

    // 创建按钮容器
    this.startButton = this.add.container(x, y);

    // 按钮外圈光晕
    const glow = this.add.graphics();
    glow.fillStyle(COLORS.yellow, 0.3);
    glow.fillCircle(0, 0, buttonWidth / 2 + 30);

    // 按钮主体 - 大圆形
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(COLORS.secondary, 1);
    buttonBg.fillCircle(0, 0, buttonWidth / 2);

    // 按钮内圈
    const buttonInner = this.add.graphics();
    buttonInner.fillStyle(COLORS.orange, 1);
    buttonInner.fillCircle(0, 0, buttonWidth / 2 - 20);

    // 播放图标 (三角形)
    const playIcon = this.add.graphics();
    playIcon.fillStyle(COLORS.white, 1);
    playIcon.beginPath();
    playIcon.moveTo(-30, -50);
    playIcon.lineTo(-30, 50);
    playIcon.lineTo(50, 0);
    playIcon.closePath();
    playIcon.fillPath();

    // 组装按钮
    this.startButton.add([glow, buttonBg, buttonInner, playIcon]);

    // 设置交互区域 - 确保足够大
    const hitArea = new Phaser.Geom.Circle(0, 0, Math.max(buttonWidth / 2, MIN_HIT_AREA));
    this.startButton.setInteractive(hitArea, Phaser.Geom.Circle.Contains);

    // 点击事件
    this.startButton.on('pointerdown', () => {
      this.onStartClick();
    });

    // 悬停效果
    this.startButton.on('pointerover', () => {
      this.tweens.add({
        targets: this.startButton,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200
      });
    });

    this.startButton.on('pointerout', () => {
      this.tweens.add({
        targets: this.startButton,
        scaleX: 1,
        scaleY: 1,
        duration: 200
      });
    });
  }

  private addPulseAnimation(): void {
    // 呼吸动画
    this.tweens.add({
      targets: this.startButton,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private onStartClick(): void {
    // 停止呼吸动画
    this.tweens.killTweensOf(this.startButton);

    // 按钮点击反馈
    this.tweens.add({
      targets: this.startButton,
      scaleX: 0.9,
      scaleY: 0.9,
      duration: 100,
      yoyo: true,
      onComplete: () => {
        // 解锁音频上下文
        const sound = this.sound as Phaser.Sound.WebAudioSoundManager;
        if (sound.context && sound.context.state === 'suspended') {
          sound.context.resume();
        }

        // 淡出过渡到预加载场景
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('PreloadScene');
        });
      }
    });
  }
}
