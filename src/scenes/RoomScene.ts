import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../utils/constants';
import { playBounceAnimation } from '../utils/helpers';

/**
 * 主菜单场景 - 拟物化房间
 * 点击不同物品进入不同游戏
 */
export class RoomScene extends Phaser.Scene {
  private toyBox!: Phaser.GameObjects.Container;
  private bookshelf!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'RoomScene' });
  }

  create(): void {
    this.cameras.main.fadeIn(500);

    // 绘制房间背景
    this.drawRoom();

    // 创建可交互物品
    this.createToyBox();
    this.createBookshelf();

    // 添加装饰物
    this.addDecorations();

    // 添加手势引导动画
    this.showHandGuide();
  }

  private drawRoom(): void {
    const graphics = this.add.graphics();

    // 墙壁背景 - 使用渐变效果
    graphics.fillGradientStyle(0xffe4c4, 0xffe4c4, 0xf5deb3, 0xf5deb3, 1);
    graphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT * 0.65);

    // 墙壁装饰 - 壁纸图案
    const wallPattern = this.add.graphics();
    wallPattern.fillStyle(0xffffff, 0.1);
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 20; col++) {
        if ((row + col) % 2 === 0) {
          wallPattern.fillCircle(col * 70 + 35, row * 60 + 30, 8);
        }
      }
    }

    // 地板 - 木地板效果
    graphics.fillGradientStyle(0xcd853f, 0xcd853f, 0xb8860b, 0xb8860b, 1);
    graphics.fillRect(0, GAME_HEIGHT * 0.65, GAME_WIDTH, GAME_HEIGHT * 0.35);

    // 地板纹理
    const floorTexture = this.add.graphics();
    for (let i = 0; i < 20; i++) {
      const boardY = GAME_HEIGHT * 0.65 + (i * 15);
      floorTexture.fillStyle(i % 2 === 0 ? 0xdeb887 : 0xcd9b5a, 0.3);
      floorTexture.fillRect(0, boardY, GAME_WIDTH, 12);
    }

    // 踢脚线
    graphics.fillStyle(0x8b4513, 1);
    graphics.fillRect(0, GAME_HEIGHT * 0.65 - 8, GAME_WIDTH, 16);

    // 添加阴影效果
    graphics.fillStyle(0x000000, 0.05);
    graphics.fillRect(0, GAME_HEIGHT * 0.65, GAME_WIDTH, 50);

    // 窗户
    this.drawWindow(GAME_WIDTH / 2, 180);
  }

  private drawWindow(x: number, y: number): void {
    const graphics = this.add.graphics();
    const width = 220;
    const height = 280;

    // 窗户阴影
    graphics.fillStyle(0x000000, 0.2);
    graphics.fillRoundedRect(x - width / 2 - 10, y - height / 2 - 5, width + 30, height + 35, 8);

    // 窗框外圈
    graphics.fillStyle(0x5a3d2b, 1);
    graphics.fillRoundedRect(x - width / 2 - 18, y - height / 2 - 18, width + 36, height + 36, 12);

    // 窗框内圈
    graphics.fillStyle(0x8b5a3c, 1);
    graphics.fillRoundedRect(x - width / 2 - 12, y - height / 2 - 12, width + 24, height + 24, 8);

    // 天空背景 - 渐变
    graphics.fillGradientStyle(0x87ceeb, 0x87ceeb, 0xb0e0e6, 0xb0e0e6, 1);
    graphics.fillRect(x - width / 2, y - height / 2, width, height);

    // 云朵 - 更蓬松
    graphics.fillStyle(0xffffff, 0.95);
    graphics.fillCircle(x - 45, y - 65, 28);
    graphics.fillCircle(x - 20, y - 75, 35);
    graphics.fillCircle(x + 15, y - 60, 25);
    graphics.fillCircle(x + 5, y - 65, 22);

    // 第二朵云
    graphics.fillStyle(0xffffff, 0.8);
    graphics.fillCircle(x + 55, y - 30, 18);
    graphics.fillCircle(x + 75, y - 35, 22);
    graphics.fillCircle(x + 90, y - 28, 16);

    // 太阳 - 带光晕
    graphics.fillStyle(0xfff8dc, 0.4);
    graphics.fillCircle(x + 65, y - 85, 45);
    graphics.fillStyle(0xffd700, 0.8);
    graphics.fillCircle(x + 65, y - 85, 35);
    graphics.fillStyle(0xffdf00, 1);
    graphics.fillCircle(x + 65, y - 85, 28);

    // 草地（窗外）
    graphics.fillStyle(0x90ee90, 1);
    graphics.fillRect(x - width / 2, y + height / 2 - 50, width, 50);
    graphics.fillStyle(0x228b22, 0.8);
    for (let i = 0; i < width; i += 15) {
      const grassHeight = Phaser.Math.Between(10, 25);
      graphics.fillTriangle(
        x - width / 2 + i, y + height / 2 - 50,
        x - width / 2 + i + 7, y + height / 2 - 50 - grassHeight,
        x - width / 2 + i + 14, y + height / 2 - 50
      );
    }

    // 窗户分隔线
    graphics.lineStyle(10, 0x8b5a3c, 1);
    graphics.lineBetween(x, y - height / 2, x, y + height / 2);
    graphics.lineBetween(x - width / 2, y, x + width / 2, y);

    // 窗户高光
    graphics.lineStyle(2, 0xffffff, 0.3);
    graphics.lineBetween(x - width / 2 + 5, y - height / 2 + 5, x - width / 2 + 5, y - 5);
    graphics.lineBetween(x + 5, y - height / 2 + 5, x + 5, y - 5);
  }

  private createToyBox(): void {
    // 调整位置到左侧
    const x = GAME_WIDTH / 2 - 280;
    const y = GAME_HEIGHT - 160;

    this.toyBox = this.add.container(x, y);

    // 玩具箱阴影
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.15);
    shadow.fillEllipse(0, 70, 220, 40);

    // 玩具箱主体 - 渐变效果
    const boxBody = this.add.graphics();
    boxBody.fillGradientStyle(0xff85a2, 0xff85a2, 0xff6b8a, 0xff6b8a, 1);
    boxBody.fillRoundedRect(-100, -70, 200, 140, 18);

    // 玩具箱高光
    boxBody.fillGradientStyle(0xffb6c1, 0xffb6c1, 0xff85a2, 0xff85a2, 0.5);
    boxBody.fillRoundedRect(-95, -65, 190, 50, 15);

    // 玩具箱边框
    boxBody.lineStyle(5, 0xd63384, 1);
    boxBody.strokeRoundedRect(-100, -70, 200, 140, 18);

    // 玩具箱盖子
    const lid = this.add.graphics();
    lid.fillGradientStyle(0xffaac0, 0xffaac0, 0xff85a2, 0xff85a2, 1);
    lid.fillRoundedRect(-110, -100, 220, 40, { tl: 18, tr: 18, bl: 0, br: 0 });
    lid.lineStyle(4, 0xd63384, 1);
    lid.strokeRoundedRect(-110, -100, 220, 40, { tl: 18, tr: 18, bl: 0, br: 0 });

    // 盖子手柄
    lid.fillStyle(0xffd700, 1);
    lid.fillRoundedRect(-25, -95, 50, 12, 6);
    lid.lineStyle(2, 0xdaa520, 1);
    lid.strokeRoundedRect(-25, -95, 50, 12, 6);

    // 玩具露出来的部分 - 可爱的小熊
    const bear = this.add.graphics();
    // 熊身体
    bear.fillStyle(0xdeb887, 1);
    bear.fillCircle(-40, -115, 25);
    bear.fillCircle(40, -112, 22);
    // 熊耳朵
    bear.fillStyle(0xcd853f, 1);
    bear.fillCircle(-55, -130, 12);
    bear.fillCircle(-25, -132, 12);
    bear.fillCircle(25, -127, 11);
    bear.fillCircle(55, -129, 11);
    // 熊脸
    bear.fillStyle(0xf5deb3, 1);
    bear.fillCircle(-40, -110, 12);
    bear.fillCircle(40, -107, 11);
    // 熊眼睛
    bear.fillStyle(0x000000, 1);
    bear.fillCircle(-45, -118, 4);
    bear.fillCircle(-35, -118, 4);
    bear.fillCircle(35, -115, 4);
    bear.fillCircle(45, -115, 4);

    // 星星装饰 - 使用图片或自绘
    let starDeco: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics;
    if (this.textures.exists('star')) {
      starDeco = this.add.image(0, 5, 'star');
      starDeco.setScale(0.5);
      starDeco.setTint(0xffd700);
    } else {
      starDeco = this.createStarGraphic(0, 5, 25);
    }

    // 影子图案提示 - 更精致
    const shadowHint = this.add.graphics();
    shadowHint.fillStyle(0x000000, 0.25);
    shadowHint.fillRoundedRect(-70, 20, 40, 35, 8);
    shadowHint.fillRoundedRect(30, 18, 35, 32, 8);
    // 问号提示
    shadowHint.fillStyle(0xffffff, 0.5);
    shadowHint.fillCircle(-50, 35, 8);
    shadowHint.fillCircle(47, 33, 7);

    this.toyBox.add([shadow, boxBody, lid, bear, starDeco, shadowHint]);

    // 添加轻微的浮动动画
    this.tweens.add({
      targets: this.toyBox,
      y: y - 5,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 设置交互
    const hitArea = new Phaser.Geom.Rectangle(-120, -140, 240, 220);
    this.toyBox.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    this.setupItemInteraction(this.toyBox, 'ShadowScene');
  }

  private createBookshelf(): void {
    // 调整位置到右侧
    const x = GAME_WIDTH / 2 + 280;
    const y = GAME_HEIGHT - 180;

    this.bookshelf = this.add.container(x, y);

    // 书架阴影
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.15);
    shadow.fillEllipse(0, 125, 240, 40);

    // 书架主体 - 木纹效果
    const shelf = this.add.graphics();
    shelf.fillGradientStyle(0x8b5a3c, 0x8b5a3c, 0x6b4226, 0x6b4226, 1);
    shelf.fillRect(-115, -120, 230, 245);

    // 书架边框和装饰
    shelf.lineStyle(5, 0x5a3d2b, 1);
    shelf.strokeRect(-115, -120, 230, 245);

    // 顶部装饰
    shelf.fillStyle(0x5a3d2b, 1);
    shelf.fillRoundedRect(-120, -130, 240, 18, { tl: 8, tr: 8, bl: 0, br: 0 });

    // 隔板 - 带厚度感
    shelf.fillGradientStyle(0x6b4226, 0x6b4226, 0x5a3d2b, 0x5a3d2b, 1);
    shelf.fillRect(-115, -18, 230, 12);
    shelf.fillRect(-115, 82, 230, 12);

    // 书本 - 更丰富的细节
    const books = this.add.graphics();

    // 第一排书 - 带脊线装饰
    const row1Books = [
      { color: 0xff69b4, x: -105, w: 32, h: 85 },
      { color: 0x4169e1, x: -70, w: 38, h: 80 },
      { color: 0xffd700, x: -28, w: 28, h: 85 },
      { color: 0x9370db, x: 3, w: 35, h: 82 },
      { color: 0x32cd32, x: 42, w: 30, h: 80 },
      { color: 0xff6347, x: 76, w: 32, h: 85 }
    ];

    row1Books.forEach(book => {
      // 书本主体
      books.fillStyle(book.color, 1);
      books.fillRect(book.x, -115, book.w, book.h);
      // 书脊
      books.fillStyle(0x000000, 0.2);
      books.fillRect(book.x + 2, -115, 4, book.h);
      // 高光
      books.fillStyle(0xffffff, 0.15);
      books.fillRect(book.x + book.w - 5, -115, 3, book.h);
    });

    // 第二排书
    const row2Books = [
      { color: 0xff8c00, x: -105, w: 38, h: 88 },
      { color: 0x6495ed, x: -63, w: 32, h: 82 },
      { color: 0xff6b6b, x: -28, w: 42, h: 88 },
      { color: 0x20b2aa, x: 18, w: 35, h: 85 },
      { color: 0xda70d6, x: 57, w: 30, h: 82 },
      { color: 0x98fb98, x: 90, w: 18, h: 78 }
    ];

    row2Books.forEach(book => {
      books.fillStyle(book.color, 1);
      books.fillRect(book.x, -15, book.w, book.h);
      books.fillStyle(0x000000, 0.2);
      books.fillRect(book.x + 2, -15, 4, book.h);
      books.fillStyle(0xffffff, 0.15);
      books.fillRect(book.x + book.w - 5, -15, 3, book.h);
    });

    // 小装饰品 - 相框
    const frame = this.add.graphics();
    frame.fillStyle(0x8b4513, 1);
    frame.fillRect(-90, 98, 45, 55);
    frame.fillStyle(0xffffff, 1);
    frame.fillRect(-85, 103, 35, 45);
    // 相框内的小画
    frame.fillStyle(0x87ceeb, 1);
    frame.fillRect(-83, 105, 31, 25);
    frame.fillStyle(0x228b22, 1);
    frame.fillRect(-83, 130, 31, 15);
    frame.fillStyle(0xffd700, 1);
    frame.fillCircle(-68, 115, 8);

    // 故事书 - 更精致
    const storyBook = this.add.graphics();
    storyBook.fillStyle(0xffd700, 1);
    storyBook.fillRoundedRect(20, 95, 65, 50, 5);
    storyBook.lineStyle(2, 0xdaa520, 1);
    storyBook.strokeRoundedRect(20, 95, 65, 50, 5);
    // 书页效果
    storyBook.fillStyle(0xfffef0, 1);
    storyBook.fillRect(25, 100, 55, 40);
    // 文字线
    storyBook.lineStyle(1.5, 0x000000, 0.25);
    storyBook.lineBetween(30, 108, 75, 108);
    storyBook.lineBetween(30, 118, 75, 118);
    storyBook.lineBetween(30, 128, 60, 128);
    // 小星星装饰
    storyBook.fillStyle(0xffd700, 1);
    storyBook.fillCircle(72, 132, 5);

    // 小盆栽装饰
    const plant = this.add.graphics();
    plant.fillStyle(0xcd853f, 1);
    plant.fillRoundedRect(-35, 110, 30, 28, 5);
    plant.fillStyle(0x228b22, 1);
    plant.fillCircle(-20, 100, 15);
    plant.fillCircle(-28, 105, 12);
    plant.fillCircle(-12, 103, 13);

    this.bookshelf.add([shadow, shelf, books, frame, storyBook, plant]);

    // 添加轻微的浮动动画（与玩具箱错开）
    this.tweens.add({
      targets: this.bookshelf,
      y: y - 5,
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 500
    });

    // 设置交互
    const hitArea = new Phaser.Geom.Rectangle(-120, -135, 250, 270);
    this.bookshelf.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    this.setupItemInteraction(this.bookshelf, 'StoryScene');
  }

  private createStarGraphic(x: number, y: number, size: number): Phaser.GameObjects.Graphics {
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

  private addDecorations(): void {
    // 地毯 - 更精美的椭圆地毯
    const carpet = this.add.graphics();

    // 地毯阴影
    carpet.fillStyle(0x000000, 0.1);
    carpet.fillEllipse(GAME_WIDTH / 2 + 5, GAME_HEIGHT - 75, 620, 130);

    // 地毯主体
    carpet.fillGradientStyle(0x9370db, 0x9370db, 0x8b008b, 0x8b008b, 0.8);
    carpet.fillEllipse(GAME_WIDTH / 2, GAME_HEIGHT - 80, 600, 120);

    // 地毯边框
    carpet.lineStyle(6, 0xff69b4, 0.9);
    carpet.strokeEllipse(GAME_WIDTH / 2, GAME_HEIGHT - 80, 600, 120);

    // 内圈装饰
    carpet.lineStyle(3, 0xffd700, 0.7);
    carpet.strokeEllipse(GAME_WIDTH / 2, GAME_HEIGHT - 80, 540, 100);

    // 地毯图案 - 小花
    const flowerColors = [0xff69b4, 0xffd700, 0x87ceeb, 0x98fb98];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const fx = GAME_WIDTH / 2 + Math.cos(angle) * 220;
      const fy = GAME_HEIGHT - 80 + Math.sin(angle) * 40;
      carpet.fillStyle(flowerColors[i % 4], 0.8);
      carpet.fillCircle(fx, fy, 8);
      carpet.fillStyle(0xffffff, 0.6);
      carpet.fillCircle(fx, fy, 4);
    }

    // 墙上的装饰画
    this.addWallArt(200, 250);
    this.addWallArt(GAME_WIDTH - 200, 230);

    // 悬挂的星星装饰
    this.addHangingStars();
  }

  private addWallArt(x: number, y: number): void {
    const frame = this.add.graphics();

    // 画框阴影
    frame.fillStyle(0x000000, 0.15);
    frame.fillRoundedRect(x - 48, y - 38, 106, 86, 5);

    // 画框
    frame.fillStyle(0x8b4513, 1);
    frame.fillRoundedRect(x - 52, y - 42, 104, 84, 6);
    frame.fillStyle(0xdeb887, 1);
    frame.fillRoundedRect(x - 46, y - 36, 92, 72, 4);

    // 画内容
    frame.fillStyle(0x87ceeb, 1);
    frame.fillRect(x - 42, y - 32, 84, 64);

    // 简单的风景画
    frame.fillStyle(0x90ee90, 1);
    frame.fillRect(x - 42, y + 5, 84, 27);

    // 小山
    frame.fillStyle(0x228b22, 1);
    frame.fillTriangle(x - 30, y + 32, x, y - 5, x + 30, y + 32);
    frame.fillTriangle(x + 10, y + 32, x + 35, y + 5, x + 42, y + 32);

    // 太阳
    frame.fillStyle(0xffd700, 1);
    frame.fillCircle(x + 25, y - 15, 12);
  }

  private addHangingStars(): void {
    const starPositions = [
      { x: 120, y: 100, size: 15, delay: 0 },
      { x: 180, y: 130, size: 12, delay: 200 },
      { x: GAME_WIDTH - 120, y: 90, size: 14, delay: 400 },
      { x: GAME_WIDTH - 170, y: 120, size: 11, delay: 600 }
    ];

    starPositions.forEach(pos => {
      // 绳子
      const rope = this.add.graphics();
      rope.lineStyle(2, 0x8b4513, 0.5);
      rope.lineBetween(pos.x, 0, pos.x, pos.y - pos.size);

      // 星星
      const star = this.add.graphics();
      star.fillStyle(0xffd700, 1);

      const spikes = 5;
      const outerRadius = pos.size;
      const innerRadius = pos.size / 2;

      star.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / spikes - Math.PI / 2;
        const px = pos.x + Math.cos(angle) * radius;
        const py = pos.y + Math.sin(angle) * radius;
        if (i === 0) {
          star.moveTo(px, py);
        } else {
          star.lineTo(px, py);
        }
      }
      star.closePath();
      star.fillPath();

      // 星星闪烁动画
      this.tweens.add({
        targets: star,
        alpha: 0.6,
        duration: 800,
        yoyo: true,
        repeat: -1,
        delay: pos.delay,
        ease: 'Sine.easeInOut'
      });
    });
  }

  private setupItemInteraction(item: Phaser.GameObjects.Container, targetScene: string): void {
    item.on('pointerover', () => {
      this.tweens.add({
        targets: item,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200
      });
    });

    item.on('pointerout', () => {
      this.tweens.add({
        targets: item,
        scaleX: 1,
        scaleY: 1,
        duration: 200
      });
    });

    item.on('pointerdown', () => {
      playBounceAnimation(this, item);

      this.time.delayedCall(300, () => {
        this.cameras.main.fadeOut(400);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start(targetScene);
        });
      });
    });
  }

  private showHandGuide(): void {
    // 创建引导手势 - 指向玩具箱
    const hand = this.add.graphics();
    hand.fillStyle(COLORS.secondary, 0.9);

    // 手掌
    hand.fillCircle(0, 0, 25);

    // 手指
    hand.fillRoundedRect(-8, -60, 16, 45, 8);

    const handContainer = this.add.container(GAME_WIDTH / 2 - 180, GAME_HEIGHT - 250, [hand]);
    handContainer.setAlpha(0);

    // 引导动画
    this.tweens.add({
      targets: handContainer,
      alpha: 1,
      duration: 500,
      delay: 1000,
      onComplete: () => {
        // 上下摆动动画
        this.tweens.add({
          targets: handContainer,
          y: GAME_HEIGHT - 200,
          duration: 600,
          yoyo: true,
          repeat: 2,
          ease: 'Sine.easeInOut',
          onComplete: () => {
            this.tweens.add({
              targets: handContainer,
              alpha: 0,
              duration: 500,
              onComplete: () => handContainer.destroy()
            });
          }
        });
      }
    });
  }
}
