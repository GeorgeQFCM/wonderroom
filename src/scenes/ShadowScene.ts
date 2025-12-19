import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, SNAP_DISTANCE, DURATIONS, MIN_HIT_AREA } from '../utils/constants';
import { getDistance, createParticleTexture, playBounceAnimation } from '../utils/helpers';

interface DraggableItem {
  container: Phaser.GameObjects.Container;
  originalX: number;
  originalY: number;
  shadowId: string;
  matched: boolean;
}

interface ShadowTarget {
  container: Phaser.GameObjects.Container;
  id: string;
  x: number;
  y: number;
}

interface LevelConfig {
  items: Array<{
    type: string;
    shadowX: number;
    shadowY: number;
    itemX: number;
    itemY: number;
  }>;
  distractors: Array<{
    type: string;
    x: number;
    y: number;
  }>;
}

// 可用动物类型 - 对应已下载的图片资源
const ANIMAL_TYPES = [
  'rabbit', 'cat', 'bear', 'dog', 'monkey',
  'pig', 'cow', 'dragon', 'rat', 'teddy'
];

/**
 * 影子侦探游戏
 * 核心玩法：拖拽匹配 + 磁吸附机制
 * 20个关卡，难度递增
 */
export class ShadowScene extends Phaser.Scene {
  private draggables: DraggableItem[] = [];
  private shadows: ShadowTarget[] = [];
  private currentLevel: number = 1;
  private maxLevel: number = 20;
  private matchedCount: number = 0;
  private totalItems: number = 0;
  private backButton!: Phaser.GameObjects.Container;
  private levelText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'ShadowScene' });
  }

  create(): void {
    this.cameras.main.fadeIn(500);

    // 重置状态
    this.draggables = [];
    this.shadows = [];
    this.matchedCount = 0;
    this.currentLevel = 1;

    createParticleTexture(this);

    // 绘制背景
    this.drawBackground();

    // 创建返回按钮
    this.createBackButton();

    // 创建关卡显示
    this.createLevelDisplay();

    // 加载关卡
    this.loadLevel(this.currentLevel);

    // 显示手势引导
    this.showDragGuide();
  }

  private drawBackground(): void {
    const graphics = this.add.graphics();

    // 森林背景渐变
    graphics.fillGradientStyle(0x2d5a27, 0x2d5a27, 0x1a3d16, 0x1a3d16, 1);
    graphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // 添加树木剪影
    this.drawTreeSilhouettes(graphics);

    // 地面
    graphics.fillStyle(0x3d2914, 1);
    graphics.fillRect(0, GAME_HEIGHT - 100, GAME_WIDTH, 100);

    // 草地
    graphics.fillStyle(0x228b22, 0.8);
    for (let i = 0; i < GAME_WIDTH; i += 30) {
      const height = Phaser.Math.Between(15, 35);
      graphics.fillTriangle(
        i, GAME_HEIGHT - 100,
        i + 15, GAME_HEIGHT - 100 - height,
        i + 30, GAME_HEIGHT - 100
      );
    }
  }

  private drawTreeSilhouettes(graphics: Phaser.GameObjects.Graphics): void {
    graphics.fillStyle(0x1a3d16, 0.8);

    // 左边的大树
    graphics.fillTriangle(0, GAME_HEIGHT - 100, 100, 150, 200, GAME_HEIGHT - 100);
    graphics.fillTriangle(30, GAME_HEIGHT - 100, 100, 80, 170, GAME_HEIGHT - 100);

    // 右边的树
    graphics.fillTriangle(GAME_WIDTH - 200, GAME_HEIGHT - 100, GAME_WIDTH - 100, 100, GAME_WIDTH, GAME_HEIGHT - 100);
    graphics.fillTriangle(GAME_WIDTH - 170, GAME_HEIGHT - 100, GAME_WIDTH - 100, 50, GAME_WIDTH - 30, GAME_HEIGHT - 100);
  }

  private createBackButton(): void {
    this.backButton = this.add.container(70, 50);

    const bg = this.add.graphics();
    bg.fillStyle(COLORS.secondary, 1);
    bg.fillCircle(0, 0, 35);

    const arrow = this.add.graphics();
    arrow.lineStyle(6, COLORS.white, 1);
    arrow.beginPath();
    arrow.moveTo(10, 0);
    arrow.lineTo(-10, 0);
    arrow.moveTo(-10, 0);
    arrow.lineTo(0, -10);
    arrow.moveTo(-10, 0);
    arrow.lineTo(0, 10);
    arrow.strokePath();

    this.backButton.add([bg, arrow]);

    const hitArea = new Phaser.Geom.Circle(0, 0, Math.max(35, MIN_HIT_AREA / 2));
    this.backButton.setInteractive(hitArea, Phaser.Geom.Circle.Contains);

    this.backButton.on('pointerdown', () => {
      playBounceAnimation(this, this.backButton);
      this.time.delayedCall(200, () => {
        this.cameras.main.fadeOut(400);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('RoomScene');
        });
      });
    });
  }

  private createLevelDisplay(): void {
    // 关卡背景
    const levelBg = this.add.graphics();
    levelBg.fillStyle(COLORS.primary, 0.8);
    levelBg.fillRoundedRect(GAME_WIDTH / 2 - 60, 20, 120, 50, 25);

    // 关卡文字
    this.levelText = this.add.text(GAME_WIDTH / 2, 45, `${this.currentLevel}/${this.maxLevel}`, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.levelText.setOrigin(0.5);
  }

  private generateLevelConfig(level: number): LevelConfig {
    // 根据关卡生成配置
    // Level 1-5: 1个物体，0-1个干扰项
    // Level 6-10: 2个物体，1-2个干扰项
    // Level 11-15: 3个物体，2-3个干扰项
    // Level 16-20: 4个物体，3-4个干扰项

    let itemCount: number;
    let distractorCount: number;

    if (level <= 5) {
      itemCount = 1;
      distractorCount = level <= 2 ? 0 : 1;
    } else if (level <= 10) {
      itemCount = 2;
      distractorCount = level <= 8 ? 1 : 2;
    } else if (level <= 15) {
      itemCount = 3;
      distractorCount = level <= 13 ? 2 : 3;
    } else {
      itemCount = 4;
      distractorCount = level <= 18 ? 3 : 4;
    }

    // 随机选择动物类型
    const shuffledTypes = Phaser.Utils.Array.Shuffle([...ANIMAL_TYPES]);
    const selectedTypes = shuffledTypes.slice(0, itemCount + distractorCount);

    // 计算位置
    const items: LevelConfig['items'] = [];
    const distractors: LevelConfig['distractors'] = [];

    // 阴影区域
    const shadowStartX = 200;
    const shadowEndX = GAME_WIDTH - 200;
    const shadowY = 280;
    const shadowSpacing = (shadowEndX - shadowStartX) / (itemCount + distractorCount - 1 || 1);

    // 物品起始区域
    const itemY = GAME_HEIGHT - 180;
    const itemStartX = 200;
    const itemEndX = GAME_WIDTH - 200;
    const itemSpacing = (itemEndX - itemStartX) / (itemCount - 1 || 1);

    // 分配位置
    let shadowPositions: number[] = [];
    for (let i = 0; i < itemCount + distractorCount; i++) {
      shadowPositions.push(shadowStartX + i * shadowSpacing);
    }
    shadowPositions = Phaser.Utils.Array.Shuffle(shadowPositions);

    for (let i = 0; i < itemCount; i++) {
      items.push({
        type: selectedTypes[i],
        shadowX: shadowPositions[i],
        shadowY: shadowY,
        itemX: itemStartX + i * itemSpacing,
        itemY: itemY
      });
    }

    for (let i = 0; i < distractorCount; i++) {
      distractors.push({
        type: selectedTypes[itemCount + i],
        x: shadowPositions[itemCount + i],
        y: shadowY
      });
    }

    return { items, distractors };
  }

  private loadLevel(level: number): void {
    // 清除现有物品
    this.draggables.forEach(item => item.container.destroy());
    this.shadows.forEach(item => item.container.destroy());
    this.draggables = [];
    this.shadows = [];
    this.matchedCount = 0;

    // 更新关卡显示
    if (this.levelText) {
      this.levelText.setText(`${level}/${this.maxLevel}`);
    }

    // 获取关卡配置
    const config = this.generateLevelConfig(level);
    this.totalItems = config.items.length;

    // 创建物品和阴影
    config.items.forEach(item => {
      const shadow = this.createShadow(item.type, item.shadowX, item.shadowY);
      this.shadows.push(shadow);

      const draggable = this.createDraggableAnimal(item.type, item.itemX, item.itemY, item.type);
      this.draggables.push(draggable);
    });

    // 创建干扰阴影
    config.distractors.forEach(d => {
      const shadow = this.createShadow(d.type, d.x, d.y);
      this.shadows.push(shadow);
    });
  }

  private createShadow(type: string, x: number, y: number): ShadowTarget {
    const container = this.add.container(x, y);

    // 使用图片创建阴影效果
    const textureKey = `animal_${type}`;
    if (this.textures.exists(textureKey)) {
      const shadow = this.add.image(0, 0, textureKey);
      shadow.setScale(0.6);
      shadow.setTint(0x000000);
      shadow.setAlpha(0.5);
      container.add(shadow);
    } else {
      // 回退到图形方式
      const graphics = this.add.graphics();
      graphics.fillStyle(COLORS.shadow, 0.6);
      this.drawAnimalShape(graphics, 0, 0, type, true);
      container.add(graphics);
    }

    // 添加微妙的脉冲动画
    this.tweens.add({
      targets: container,
      scaleX: 1.03,
      scaleY: 1.03,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    return { container, id: type, x, y };
  }

  private createDraggableAnimal(
    type: string,
    x: number,
    y: number,
    shadowId: string
  ): DraggableItem {
    const container = this.add.container(x, y);

    // 使用图片创建动物
    const textureKey = `animal_${type}`;
    if (this.textures.exists(textureKey)) {
      const animal = this.add.image(0, 0, textureKey);
      animal.setScale(0.6);
      container.add(animal);

      // 添加可爱的边框/光晕效果
      const glow = this.add.graphics();
      glow.lineStyle(4, COLORS.white, 0.5);
      glow.strokeCircle(0, 0, 50);
      container.add(glow);
      container.sendToBack(glow);
    } else {
      // 回退到图形方式
      const graphics = this.add.graphics();
      this.drawAnimalShape(graphics, 0, 0, type, false);
      container.add(graphics);
    }

    // 设置交互 - 使用更大的点击区域
    const hitArea = new Phaser.Geom.Circle(0, 0, 70);
    container.setInteractive(hitArea, Phaser.Geom.Circle.Contains);
    this.input.setDraggable(container);

    const item: DraggableItem = {
      container,
      originalX: x,
      originalY: y,
      shadowId,
      matched: false
    };

    // 拖拽事件
    container.on('dragstart', () => {
      if (item.matched) return;
      container.setDepth(100);
      this.tweens.add({
        targets: container,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 100
      });
    });

    container.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      if (item.matched) return;
      container.x = dragX;
      container.y = dragY;
    });

    container.on('dragend', () => {
      if (item.matched) return;
      container.setDepth(1);
      this.checkSnapToShadow(item);
    });

    return item;
  }

  private drawAnimalShape(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    type: string,
    isShadow: boolean
  ): void {
    switch (type) {
      case 'rabbit':
        this.drawRabbit(graphics, x, y, isShadow);
        break;
      case 'cat':
        this.drawCat(graphics, x, y, isShadow);
        break;
      case 'bird':
        this.drawBird(graphics, x, y, isShadow);
        break;
      case 'bear':
        this.drawBear(graphics, x, y, isShadow);
        break;
      case 'dog':
        this.drawDog(graphics, x, y, isShadow);
        break;
      case 'fish':
        this.drawFish(graphics, x, y, isShadow);
        break;
      case 'butterfly':
        this.drawButterfly(graphics, x, y, isShadow);
        break;
      case 'elephant':
        this.drawElephant(graphics, x, y, isShadow);
        break;
      case 'lion':
        this.drawLion(graphics, x, y, isShadow);
        break;
      case 'frog':
        this.drawFrog(graphics, x, y, isShadow);
        break;
    }
  }

  // 动物绘制方法
  private drawRabbit(g: Phaser.GameObjects.Graphics, x: number, y: number, isShadow: boolean): void {
    const color = isShadow ? COLORS.shadow : 0xffc0cb;
    g.fillStyle(color, isShadow ? 0.6 : 1);
    g.fillEllipse(x, y + 20, 80, 60);
    g.fillCircle(x, y - 30, 35);
    g.fillEllipse(x - 20, y - 80, 15, 40);
    g.fillEllipse(x + 20, y - 80, 15, 40);
    if (!isShadow) {
      g.fillStyle(0xffb6c1, 1);
      g.fillEllipse(x - 20, y - 80, 8, 25);
      g.fillEllipse(x + 20, y - 80, 8, 25);
      g.fillStyle(0x000000, 1);
      g.fillCircle(x - 12, y - 35, 5);
      g.fillCircle(x + 12, y - 35, 5);
      g.fillStyle(0xff69b4, 1);
      g.fillCircle(x, y - 20, 5);
    }
  }

  private drawCat(g: Phaser.GameObjects.Graphics, x: number, y: number, isShadow: boolean): void {
    const color = isShadow ? COLORS.shadow : 0xffa500;
    g.fillStyle(color, isShadow ? 0.6 : 1);
    g.fillEllipse(x, y + 20, 70, 50);
    g.fillCircle(x, y - 25, 35);
    g.fillTriangle(x - 35, y - 35, x - 20, y - 70, x - 5, y - 35);
    g.fillTriangle(x + 5, y - 35, x + 20, y - 70, x + 35, y - 35);
    if (!isShadow) {
      g.fillStyle(0x00ff00, 1);
      g.fillCircle(x - 12, y - 30, 8);
      g.fillCircle(x + 12, y - 30, 8);
      g.fillStyle(0x000000, 1);
      g.fillCircle(x - 12, y - 30, 4);
      g.fillCircle(x + 12, y - 30, 4);
    }
  }

  private drawBird(g: Phaser.GameObjects.Graphics, x: number, y: number, isShadow: boolean): void {
    const color = isShadow ? COLORS.shadow : 0x4169e1;
    g.fillStyle(color, isShadow ? 0.6 : 1);
    g.fillEllipse(x, y, 50, 40);
    g.fillCircle(x + 30, y - 10, 25);
    g.fillEllipse(x - 10, y - 15, 35, 20);
    g.fillTriangle(x - 50, y - 10, x - 30, y, x - 50, y + 10);
    if (!isShadow) {
      g.fillStyle(0xffffff, 1);
      g.fillCircle(x + 35, y - 15, 8);
      g.fillStyle(0x000000, 1);
      g.fillCircle(x + 37, y - 15, 4);
      g.fillStyle(0xffa500, 1);
      g.fillTriangle(x + 50, y - 10, x + 70, y - 5, x + 50, y);
    }
  }

  private drawBear(g: Phaser.GameObjects.Graphics, x: number, y: number, isShadow: boolean): void {
    const color = isShadow ? COLORS.shadow : 0x8b4513;
    g.fillStyle(color, isShadow ? 0.6 : 1);
    g.fillEllipse(x, y + 25, 70, 55);
    g.fillCircle(x, y - 25, 40);
    g.fillCircle(x - 30, y - 55, 18);
    g.fillCircle(x + 30, y - 55, 18);
    if (!isShadow) {
      g.fillStyle(0xdeb887, 1);
      g.fillCircle(x, y - 15, 22);
      g.fillStyle(0x000000, 1);
      g.fillCircle(x - 15, y - 35, 6);
      g.fillCircle(x + 15, y - 35, 6);
      g.fillCircle(x, y - 15, 8);
    }
  }

  private drawDog(g: Phaser.GameObjects.Graphics, x: number, y: number, isShadow: boolean): void {
    const color = isShadow ? COLORS.shadow : 0xd2691e;
    g.fillStyle(color, isShadow ? 0.6 : 1);
    g.fillEllipse(x, y + 20, 75, 50);
    g.fillCircle(x, y - 25, 38);
    g.fillEllipse(x - 35, y - 45, 18, 30);
    g.fillEllipse(x + 35, y - 45, 18, 30);
    if (!isShadow) {
      g.fillStyle(0xffffff, 1);
      g.fillCircle(x - 12, y - 30, 10);
      g.fillCircle(x + 12, y - 30, 10);
      g.fillStyle(0x000000, 1);
      g.fillCircle(x - 12, y - 30, 5);
      g.fillCircle(x + 12, y - 30, 5);
      g.fillCircle(x, y - 10, 10);
      g.fillStyle(0xff69b4, 1);
      g.fillEllipse(x, y + 5, 15, 8);
    }
  }

  private drawFish(g: Phaser.GameObjects.Graphics, x: number, y: number, isShadow: boolean): void {
    const color = isShadow ? COLORS.shadow : 0xff6347;
    g.fillStyle(color, isShadow ? 0.6 : 1);
    g.fillEllipse(x, y, 70, 45);
    g.fillTriangle(x - 55, y, x - 35, y - 25, x - 35, y + 25);
    if (!isShadow) {
      g.fillStyle(0xffd700, 1);
      g.fillEllipse(x + 10, y - 10, 20, 12);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(x + 25, y - 8, 8);
      g.fillStyle(0x000000, 1);
      g.fillCircle(x + 27, y - 8, 4);
    }
  }

  private drawButterfly(g: Phaser.GameObjects.Graphics, x: number, y: number, isShadow: boolean): void {
    const color = isShadow ? COLORS.shadow : 0xff69b4;
    g.fillStyle(color, isShadow ? 0.6 : 1);
    g.fillEllipse(x - 35, y - 20, 40, 35);
    g.fillEllipse(x + 35, y - 20, 40, 35);
    g.fillEllipse(x - 30, y + 25, 30, 25);
    g.fillEllipse(x + 30, y + 25, 30, 25);
    g.fillStyle(isShadow ? COLORS.shadow : 0x000000, isShadow ? 0.6 : 1);
    g.fillEllipse(x, y, 12, 50);
    if (!isShadow) {
      g.fillStyle(0xffffff, 0.5);
      g.fillCircle(x - 35, y - 20, 12);
      g.fillCircle(x + 35, y - 20, 12);
    }
  }

  private drawElephant(g: Phaser.GameObjects.Graphics, x: number, y: number, isShadow: boolean): void {
    const color = isShadow ? COLORS.shadow : 0x808080;
    g.fillStyle(color, isShadow ? 0.6 : 1);
    g.fillEllipse(x, y + 15, 80, 55);
    g.fillCircle(x - 30, y - 30, 35);
    g.fillEllipse(x - 55, y - 50, 25, 35);
    g.fillEllipse(x - 5, y - 50, 25, 35);
    // 象鼻
    g.fillRoundedRect(x - 50, y - 25, 20, 55, 10);
    if (!isShadow) {
      g.fillStyle(0xffffff, 1);
      g.fillCircle(x - 40, y - 40, 8);
      g.fillStyle(0x000000, 1);
      g.fillCircle(x - 40, y - 40, 4);
    }
  }

  private drawLion(g: Phaser.GameObjects.Graphics, x: number, y: number, isShadow: boolean): void {
    const color = isShadow ? COLORS.shadow : 0xffa500;
    const maneColor = isShadow ? COLORS.shadow : 0xcd853f;
    // 鬃毛
    g.fillStyle(maneColor, isShadow ? 0.6 : 1);
    g.fillCircle(x, y - 25, 50);
    // 身体
    g.fillStyle(color, isShadow ? 0.6 : 1);
    g.fillEllipse(x, y + 25, 70, 50);
    g.fillCircle(x, y - 25, 35);
    if (!isShadow) {
      g.fillStyle(0xffffff, 1);
      g.fillCircle(x - 12, y - 30, 8);
      g.fillCircle(x + 12, y - 30, 8);
      g.fillStyle(0x000000, 1);
      g.fillCircle(x - 12, y - 30, 4);
      g.fillCircle(x + 12, y - 30, 4);
      g.fillCircle(x, y - 15, 6);
    }
  }

  private drawFrog(g: Phaser.GameObjects.Graphics, x: number, y: number, isShadow: boolean): void {
    const color = isShadow ? COLORS.shadow : 0x32cd32;
    g.fillStyle(color, isShadow ? 0.6 : 1);
    g.fillEllipse(x, y + 15, 75, 45);
    g.fillEllipse(x, y - 25, 60, 40);
    // 眼睛凸起
    g.fillCircle(x - 25, y - 45, 18);
    g.fillCircle(x + 25, y - 45, 18);
    if (!isShadow) {
      g.fillStyle(0xffffff, 1);
      g.fillCircle(x - 25, y - 45, 12);
      g.fillCircle(x + 25, y - 45, 12);
      g.fillStyle(0x000000, 1);
      g.fillCircle(x - 25, y - 45, 6);
      g.fillCircle(x + 25, y - 45, 6);
      g.fillStyle(0xff6347, 1);
      g.fillEllipse(x, y - 10, 20, 8);
    }
  }

  private checkSnapToShadow(item: DraggableItem): void {
    const container = item.container;

    // 找到匹配的阴影
    const matchingShadow = this.shadows.find(s => s.id === item.shadowId);

    if (!matchingShadow) {
      this.returnToOriginal(item);
      return;
    }

    const distance = getDistance(container.x, container.y, matchingShadow.x, matchingShadow.y);

    if (distance <= SNAP_DISTANCE) {
      this.snapToTarget(item, matchingShadow);
    } else {
      this.returnToOriginal(item);
    }
  }

  private snapToTarget(item: DraggableItem, shadow: ShadowTarget): void {
    item.matched = true;
    this.matchedCount++;

    this.tweens.add({
      targets: item.container,
      x: shadow.x,
      y: shadow.y,
      scaleX: 1,
      scaleY: 1,
      duration: DURATIONS.snapTween,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.playSuccessEffect(shadow.x, shadow.y);
        this.time.delayedCall(500, () => {
          this.checkLevelComplete();
        });
      }
    });
  }

  private returnToOriginal(item: DraggableItem): void {
    this.tweens.add({
      targets: item.container,
      x: item.originalX,
      y: item.originalY,
      scaleX: 1,
      scaleY: 1,
      duration: DURATIONS.bounceTween,
      ease: 'Bounce.easeOut'
    });
  }

  private playSuccessEffect(x: number, y: number): void {
    const particles = this.add.particles(x, y, 'particle', {
      speed: { min: 100, max: 250 },
      scale: { start: 0.8, end: 0 },
      lifespan: 800,
      blendMode: Phaser.BlendModes.ADD,
      tint: [COLORS.yellow, COLORS.pink, COLORS.green, COLORS.blue],
      emitting: false
    });

    particles.explode(30);

    // 星星效果
    for (let i = 0; i < 5; i++) {
      const star = this.add.graphics();
      star.fillStyle(COLORS.yellow, 1);

      const size = 20;
      const spikes = 5;
      const outerRadius = size;
      const innerRadius = size / 2;

      star.beginPath();
      for (let j = 0; j < spikes * 2; j++) {
        const radius = j % 2 === 0 ? outerRadius : innerRadius;
        const angle = (j * Math.PI) / spikes - Math.PI / 2;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        if (j === 0) {
          star.moveTo(px, py);
        } else {
          star.lineTo(px, py);
        }
      }
      star.closePath();
      star.fillPath();

      star.setPosition(x, y);
      star.setAlpha(0);

      const starAngle = (i / 5) * Math.PI * 2;
      const distance = 80;

      this.tweens.add({
        targets: star,
        x: x + Math.cos(starAngle) * distance,
        y: y + Math.sin(starAngle) * distance,
        alpha: 1,
        scaleX: 1.5,
        scaleY: 1.5,
        duration: 300,
        delay: i * 50,
        onComplete: () => {
          this.tweens.add({
            targets: star,
            alpha: 0,
            scaleX: 0,
            scaleY: 0,
            duration: 300,
            onComplete: () => star.destroy()
          });
        }
      });
    }

    this.time.delayedCall(1000, () => {
      particles.destroy();
    });
  }

  private checkLevelComplete(): void {
    if (this.matchedCount >= this.totalItems) {
      if (this.currentLevel < this.maxLevel) {
        this.currentLevel++;
        this.showLevelTransition();
      } else {
        this.showGameComplete();
      }
    }
  }

  private showLevelTransition(): void {
    // 星星庆祝
    const bigStar = this.add.graphics();
    bigStar.fillStyle(COLORS.yellow, 1);

    const size = 80;
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size / 2;

    bigStar.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / spikes - Math.PI / 2;
      const px = GAME_WIDTH / 2 + Math.cos(angle) * radius;
      const py = GAME_HEIGHT / 2 + Math.sin(angle) * radius;
      if (i === 0) {
        bigStar.moveTo(px, py);
      } else {
        bigStar.lineTo(px, py);
      }
    }
    bigStar.closePath();
    bigStar.fillPath();

    bigStar.setAlpha(0);
    bigStar.setScale(0);

    this.tweens.add({
      targets: bigStar,
      alpha: 1,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: bigStar,
          rotation: Math.PI * 2,
          duration: 500,
          onComplete: () => {
            this.tweens.add({
              targets: bigStar,
              alpha: 0,
              scaleX: 3,
              scaleY: 3,
              duration: 400,
              onComplete: () => {
                bigStar.destroy();
                this.loadLevel(this.currentLevel);
              }
            });
          }
        });
      }
    });
  }

  private showGameComplete(): void {
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.5);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // 多个星星
    for (let i = 0; i < 10; i++) {
      this.time.delayedCall(i * 100, () => {
        const x = Phaser.Math.Between(200, GAME_WIDTH - 200);
        const y = Phaser.Math.Between(150, GAME_HEIGHT - 150);
        this.playSuccessEffect(x, y);
      });
    }

    // 大星星庆祝
    this.time.delayedCall(500, () => {
      const trophy = this.add.graphics();
      trophy.fillStyle(COLORS.yellow, 1);

      const size = 100;
      const spikes = 5;

      trophy.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? size : size / 2;
        const angle = (i * Math.PI) / spikes - Math.PI / 2;
        const px = GAME_WIDTH / 2 + Math.cos(angle) * radius;
        const py = GAME_HEIGHT / 2 + Math.sin(angle) * radius;
        if (i === 0) {
          trophy.moveTo(px, py);
        } else {
          trophy.lineTo(px, py);
        }
      }
      trophy.closePath();
      trophy.fillPath();

      trophy.setScale(0);

      this.tweens.add({
        targets: trophy,
        scaleX: 1,
        scaleY: 1,
        duration: 800,
        ease: 'Bounce.easeOut'
      });
    });

    // 返回按钮变大
    this.tweens.add({
      targets: this.backButton,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 500,
      delay: 2000,
      yoyo: true,
      repeat: 2
    });
  }

  private showDragGuide(): void {
    const hand = this.add.graphics();
    hand.fillStyle(COLORS.secondary, 0.9);
    hand.fillCircle(0, 0, 20);
    hand.fillRoundedRect(-6, -45, 12, 35, 6);

    const handContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT - 150, [hand]);
    handContainer.setAlpha(0);

    this.time.delayedCall(1000, () => {
      this.tweens.add({
        targets: handContainer,
        alpha: 1,
        duration: 300,
        onComplete: () => {
          this.tweens.add({
            targets: handContainer,
            y: 320,
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: 1,
            onComplete: () => {
              this.tweens.add({
                targets: handContainer,
                alpha: 0,
                duration: 300,
                onComplete: () => handContainer.destroy()
              });
            }
          });
        }
      });
    });
  }
}
