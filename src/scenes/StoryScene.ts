import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, SNAP_DISTANCE, DURATIONS, MIN_HIT_AREA } from '../utils/constants';
import { getDistance, createParticleTexture, playBounceAnimation } from '../utils/helpers';

interface StoryCard {
  container: Phaser.GameObjects.Container;
  originalX: number;
  originalY: number;
  order: number;
  currentSlot: number | null;
}

interface Slot {
  container: Phaser.GameObjects.Container;
  x: number;
  y: number;
  index: number;
  occupied: boolean;
  cardOrder: number | null;
}

interface StoryTheme {
  name: string;
  steps: string[];
  labels: string[];  // 中文标签
  colors: number[];
}

// 故事主题库 - 20个不同的故事序列
const STORY_THEMES: StoryTheme[] = [
  // 3卡片故事 (Level 1-7)
  {
    name: 'flower',
    steps: ['seed', 'sprout', 'flower'],
    labels: ['种子', '发芽', '开花'],
    colors: [0x8B4513, 0x32CD32, 0xFF69B4]
  },
  {
    name: 'butterfly',
    steps: ['caterpillar', 'cocoon', 'butterfly'],
    labels: ['毛毛虫', '茧', '蝴蝶'],
    colors: [0x32CD32, 0xCD853F, 0xFF69B4]
  },
  {
    name: 'chicken',
    steps: ['egg', 'chick', 'chicken'],
    labels: ['鸡蛋', '小鸡', '母鸡'],
    colors: [0xFFFACD, 0xFFD700, 0xFF6347]
  },
  {
    name: 'frog',
    steps: ['tadpole_egg', 'tadpole', 'frog'],
    labels: ['卵', '蝌蚪', '青蛙'],
    colors: [0x87CEEB, 0x90EE90, 0x32CD32]
  },
  {
    name: 'day',
    steps: ['sunrise', 'sun', 'sunset'],
    labels: ['日出', '正午', '日落'],
    colors: [0xFFB6C1, 0xFFD700, 0xFF6347]
  },
  {
    name: 'rain',
    steps: ['cloud', 'rain', 'rainbow'],
    labels: ['乌云', '下雨', '彩虹'],
    colors: [0x808080, 0x4169E1, 0xFF69B4]
  },
  {
    name: 'cake',
    steps: ['ingredients', 'baking', 'cake'],
    labels: ['材料', '烘烤', '蛋糕'],
    colors: [0xDEB887, 0xFFD700, 0xFF69B4]
  },

  // 4卡片故事 (Level 8-14)
  {
    name: 'tree',
    steps: ['seed2', 'sapling', 'small_tree', 'big_tree'],
    labels: ['种子', '幼苗', '小树', '大树'],
    colors: [0x8B4513, 0x90EE90, 0x32CD32, 0x228B22]
  },
  {
    name: 'snowman',
    steps: ['snow', 'ball1', 'ball2', 'snowman'],
    labels: ['雪花', '雪球', '叠起来', '雪人'],
    colors: [0xE0E0E0, 0xF0F0F0, 0xFFFFFF, 0x87CEEB]
  },
  {
    name: 'house',
    steps: ['foundation', 'walls', 'roof', 'house'],
    labels: ['地基', '墙壁', '屋顶', '房子'],
    colors: [0x808080, 0xCD853F, 0x8B0000, 0xFFD700]
  },
  {
    name: 'moon',
    steps: ['new_moon', 'crescent', 'half', 'full_moon'],
    labels: ['新月', '月牙', '半月', '满月'],
    colors: [0x2F4F4F, 0x696969, 0xC0C0C0, 0xFFFFE0]
  },
  {
    name: 'apple',
    steps: ['blossom', 'small_apple', 'green_apple', 'red_apple'],
    labels: ['开花', '小果', '青苹果', '红苹果'],
    colors: [0xFFB6C1, 0x90EE90, 0x32CD32, 0xFF0000]
  },
  {
    name: 'bread',
    steps: ['wheat', 'flour', 'dough', 'bread'],
    labels: ['麦子', '面粉', '面团', '面包'],
    colors: [0xDAA520, 0xFFFACD, 0xF5DEB3, 0xCD853F]
  },
  {
    name: 'painting',
    steps: ['canvas', 'sketch', 'color', 'art'],
    labels: ['画布', '草稿', '上色', '作品'],
    colors: [0xFFFFFF, 0x808080, 0x4169E1, 0xFF69B4]
  },

  // 5卡片故事 (Level 15-20)
  {
    name: 'star_life',
    steps: ['nebula', 'protostar', 'star', 'red_giant', 'supernova'],
    labels: ['星云', '原恒星', '恒星', '红巨星', '超新星'],
    colors: [0x9370DB, 0xFFD700, 0xFFFF00, 0xFF4500, 0x00BFFF]
  },
  {
    name: 'water_cycle',
    steps: ['ocean', 'evaporate', 'cloud2', 'rain2', 'river'],
    labels: ['大海', '蒸发', '云朵', '降雨', '河流'],
    colors: [0x4169E1, 0x87CEEB, 0xE0E0E0, 0x1E90FF, 0x00CED1]
  },
  {
    name: 'caterpillar_full',
    steps: ['egg2', 'tiny_cat', 'big_cat', 'pupa', 'moth'],
    labels: ['虫卵', '幼虫', '长大', '蛹', '飞蛾'],
    colors: [0xFFFFE0, 0x90EE90, 0x32CD32, 0x8B4513, 0xDDA0DD]
  },
  {
    name: 'seasons',
    steps: ['spring', 'summer', 'autumn', 'winter', 'spring2'],
    labels: ['春天', '夏天', '秋天', '冬天', '又是春天'],
    colors: [0xFF69B4, 0x32CD32, 0xFF8C00, 0x87CEEB, 0xFFB6C1]
  },
  {
    name: 'rocket',
    steps: ['blueprint', 'building', 'launch', 'space', 'planet'],
    labels: ['设计图', '建造', '发射', '太空', '星球'],
    colors: [0x4169E1, 0x808080, 0xFF4500, 0x000080, 0xFF6347]
  },
  {
    name: 'ice_cream',
    steps: ['milk', 'mixing', 'freezing', 'cone', 'sundae'],
    labels: ['牛奶', '搅拌', '冷冻', '蛋筒', '冰淇淋'],
    colors: [0xFFFFFF, 0xFFE4B5, 0x87CEEB, 0xDEB887, 0xFF69B4]
  }
];

/**
 * 小小导演游戏
 * 核心玩法：故事排序 + 状态机
 * 20个关卡，不同故事主题
 */
export class StoryScene extends Phaser.Scene {
  private backButton!: Phaser.GameObjects.Container;
  private cards: StoryCard[] = [];
  private slots: Slot[] = [];
  private checkButton!: Phaser.GameObjects.Container;
  private resultPlayed: boolean = false;
  private currentLevel: number = 1;
  private maxLevel: number = 20;
  private levelText!: Phaser.GameObjects.Text;
  private currentTheme!: StoryTheme;

  constructor() {
    super({ key: 'StoryScene' });
  }

  create(): void {
    this.cameras.main.fadeIn(500);

    // 重置状态
    this.cards = [];
    this.slots = [];
    this.resultPlayed = false;
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

    // 显示引导
    this.showDragGuide();
  }

  private drawBackground(): void {
    const graphics = this.add.graphics();

    // 温暖的房间背景 - 渐变效果
    graphics.fillGradientStyle(0xfff8f0, 0xfff8f0, 0xffe4c4, 0xffe4c4, 1);
    graphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // 墙壁装饰图案
    const wallPattern = this.add.graphics();
    wallPattern.fillStyle(0xffffff, 0.15);
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 25; col++) {
        if ((row + col) % 2 === 0) {
          wallPattern.fillCircle(col * 55 + 25, row * 70 + 35, 6);
        }
      }
    }

    // 木质桌面 - 带纹理
    graphics.fillGradientStyle(0xdeb887, 0xdeb887, 0xcd853f, 0xcd853f, 1);
    graphics.fillRect(0, GAME_HEIGHT - 200, GAME_WIDTH, 200);

    // 桌面木纹
    const woodGrain = this.add.graphics();
    for (let i = 0; i < 20; i++) {
      const y = GAME_HEIGHT - 200 + i * 10;
      woodGrain.fillStyle(i % 2 === 0 ? 0xd2b48c : 0xc4a668, 0.3);
      woodGrain.fillRect(0, y, GAME_WIDTH, 8);
    }

    // 桌面边缘 - 带厚度
    graphics.fillGradientStyle(0xa0522d, 0xa0522d, 0x8b4513, 0x8b4513, 1);
    graphics.fillRect(0, GAME_HEIGHT - 210, GAME_WIDTH, 15);
    graphics.fillStyle(0xcd853f, 1);
    graphics.fillRect(0, GAME_HEIGHT - 213, GAME_WIDTH, 5);

    // 装饰性元素 - 画框
    this.drawPictureFrame(150, 150, 120, 90);
    this.drawPictureFrame(GAME_WIDTH - 150, 150, 100, 80);

    // 悬挂的故事书装饰
    this.addStoryBookDecor();
  }

  private addStoryBookDecor(): void {
    // 左侧悬挂的书
    const book1 = this.add.graphics();
    book1.fillStyle(0xff69b4, 1);
    book1.fillRoundedRect(50, 80, 40, 50, 5);
    book1.fillStyle(0xffffff, 1);
    book1.fillRect(55, 85, 30, 40);
    book1.lineStyle(1, 0x000000, 0.2);
    book1.lineBetween(60, 95, 80, 95);
    book1.lineBetween(60, 105, 80, 105);

    // 右侧悬挂的书
    const book2 = this.add.graphics();
    book2.fillStyle(0x87ceeb, 1);
    book2.fillRoundedRect(GAME_WIDTH - 90, 70, 45, 55, 5);
    book2.fillStyle(0xffffff, 1);
    book2.fillRect(GAME_WIDTH - 85, 75, 35, 45);
    book2.fillStyle(0xffd700, 1);
    book2.fillCircle(GAME_WIDTH - 67, 95, 10);
  }

  private drawPictureFrame(x: number, y: number, width: number, height: number): void {
    const graphics = this.add.graphics();

    // 画框阴影
    graphics.fillStyle(0x000000, 0.15);
    graphics.fillRoundedRect(x - width / 2 - 6, y - height / 2 - 6, width + 22, height + 22, 6);

    // 画框外圈
    graphics.fillStyle(0x5a3d2b, 1);
    graphics.fillRoundedRect(x - width / 2 - 12, y - height / 2 - 12, width + 24, height + 24, 8);

    // 画框内圈
    graphics.fillStyle(0x8b4513, 1);
    graphics.fillRoundedRect(x - width / 2 - 8, y - height / 2 - 8, width + 16, height + 16, 5);

    // 画布
    graphics.fillGradientStyle(0x87ceeb, 0x87ceeb, 0xb0e0e6, 0xb0e0e6, 1);
    graphics.fillRect(x - width / 2, y - height / 2, width, height);

    // 草地
    graphics.fillStyle(0x90ee90, 1);
    graphics.fillRect(x - width / 2, y + height / 4, width, height / 4);

    // 小山
    graphics.fillStyle(0x228b22, 1);
    graphics.fillTriangle(
      x - width / 4, y + height / 2,
      x, y - height / 8,
      x + width / 4, y + height / 2
    );

    // 太阳
    graphics.fillStyle(0xffd700, 1);
    graphics.fillCircle(x + width / 3, y - height / 4, 15);

    // 高光效果
    graphics.fillStyle(0xffffff, 0.2);
    graphics.fillRect(x - width / 2, y - height / 2, width, height / 6);
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
    const levelBg = this.add.graphics();
    levelBg.fillStyle(COLORS.primary, 0.8);
    levelBg.fillRoundedRect(GAME_WIDTH / 2 - 60, 20, 120, 50, 25);

    this.levelText = this.add.text(GAME_WIDTH / 2, 45, `${this.currentLevel}/${this.maxLevel}`, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.levelText.setOrigin(0.5);
  }

  private loadLevel(level: number): void {
    // 清除现有元素
    this.cards.forEach(card => card.container.destroy());
    this.slots.forEach(slot => slot.container.destroy());
    this.cards = [];
    this.slots = [];
    this.resultPlayed = false;

    // 更新关卡显示
    if (this.levelText) {
      this.levelText.setText(`${level}/${this.maxLevel}`);
    }

    // 获取当前关卡的故事主题
    this.currentTheme = STORY_THEMES[level - 1];
    const cardCount = this.currentTheme.steps.length;

    // 创建槽位
    this.createSlots(cardCount);

    // 创建故事卡片
    this.createStoryCards(cardCount);

    // 创建检查按钮
    this.createCheckButton();
  }

  private createSlots(count: number): void {
    const slotWidth = count <= 3 ? 180 : (count === 4 ? 160 : 140);
    const slotHeight = count <= 3 ? 220 : (count === 4 ? 200 : 180);
    const slotSpacing = count <= 3 ? 50 : (count === 4 ? 30 : 20);
    const totalWidth = slotWidth * count + slotSpacing * (count - 1);
    const startX = (GAME_WIDTH - totalWidth) / 2 + slotWidth / 2;
    const y = 280;

    for (let i = 0; i < count; i++) {
      const x = startX + i * (slotWidth + slotSpacing);
      const container = this.add.container(x, y);

      const bg = this.add.graphics();
      bg.lineStyle(4, COLORS.primary, 0.6);
      bg.strokeRoundedRect(-slotWidth / 2, -slotHeight / 2, slotWidth, slotHeight, 15);
      bg.fillStyle(COLORS.purple, 0.1);
      bg.fillRoundedRect(-slotWidth / 2, -slotHeight / 2, slotWidth, slotHeight, 15);

      const numBg = this.add.graphics();
      numBg.fillStyle(COLORS.primary, 1);
      numBg.fillCircle(0, slotHeight / 2 + 25, 20);

      const numText = this.add.text(0, slotHeight / 2 + 25, `${i + 1}`, {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff'
      });
      numText.setOrigin(0.5);

      container.add([bg, numBg, numText]);

      this.slots.push({
        container,
        x,
        y,
        index: i,
        occupied: false,
        cardOrder: null
      });
    }
  }

  private createStoryCards(count: number): void {
    const cardData = this.currentTheme.steps.map((step, index) => ({
      order: index + 1,
      type: step,
      color: this.currentTheme.colors[index],
      label: this.currentTheme.labels[index]
    }));

    const shuffledData = Phaser.Utils.Array.Shuffle([...cardData]);

    const cardWidth = count <= 3 ? 160 : (count === 4 ? 140 : 120);
    const cardSpacing = count <= 3 ? 40 : (count === 4 ? 25 : 15);
    const totalWidth = cardWidth * count + cardSpacing * (count - 1);
    const startX = (GAME_WIDTH - totalWidth) / 2 + cardWidth / 2;
    const y = GAME_HEIGHT - 100;

    shuffledData.forEach((data, index) => {
      const x = startX + index * (cardWidth + cardSpacing);
      const card = this.createCard(x, y, data.order, data.type, data.color, cardWidth, data.label);
      this.cards.push(card);
    });
  }

  private createCard(
    x: number,
    y: number,
    order: number,
    type: string,
    color: number,
    cardWidth: number,
    label: string
  ): StoryCard {
    const cardHeight = cardWidth * 1.25;

    const container = this.add.container(x, y);

    // 卡片阴影 - 更柔和
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.15);
    shadow.fillRoundedRect(-cardWidth / 2 + 6, -cardHeight / 2 + 6, cardWidth, cardHeight, 18);

    // 卡片背景 - 带渐变
    const bg = this.add.graphics();
    bg.fillGradientStyle(0xfffef5, 0xfffef5, 0xfff8e7, 0xfff8e7, 1);
    bg.fillRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 18);

    // 卡片边框 - 双层效果
    bg.lineStyle(4, COLORS.secondary, 1);
    bg.strokeRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 18);
    bg.lineStyle(2, 0xffd700, 0.5);
    bg.strokeRoundedRect(-cardWidth / 2 + 4, -cardHeight / 2 + 4, cardWidth - 8, cardHeight - 8, 14);

    // 顶部装饰条
    const deco = this.add.graphics();
    deco.fillStyle(color, 0.8);
    deco.fillRoundedRect(-cardWidth / 2 + 8, -cardHeight / 2 + 8, cardWidth - 16, 12, 6);

    // 卡片内容
    const content = this.add.graphics();
    this.drawCardContent(content, type, color, cardWidth);

    // 中文标签背景
    const labelBg = this.add.graphics();
    labelBg.fillStyle(color, 0.9);
    labelBg.fillRoundedRect(-cardWidth / 2 + 10, cardHeight / 2 - 38, cardWidth - 20, 28, 8);
    // 标签高光
    labelBg.fillStyle(0xffffff, 0.3);
    labelBg.fillRoundedRect(-cardWidth / 2 + 12, cardHeight / 2 - 36, cardWidth - 24, 8, 4);

    // 中文标签文字
    const fontSize = cardWidth <= 120 ? '14px' : (cardWidth <= 140 ? '16px' : '18px');
    const labelText = this.add.text(0, cardHeight / 2 - 24, label, {
      fontSize: fontSize,
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 1
    });
    labelText.setOrigin(0.5);

    container.add([shadow, bg, deco, content, labelBg, labelText]);
    container.setDepth(1);

    const hitArea = new Phaser.Geom.Rectangle(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    this.input.setDraggable(container);

    const card: StoryCard = {
      container,
      originalX: x,
      originalY: y,
      order,
      currentSlot: null
    };

    container.on('dragstart', () => {
      container.setDepth(100);

      if (card.currentSlot !== null) {
        this.slots[card.currentSlot].occupied = false;
        this.slots[card.currentSlot].cardOrder = null;
        card.currentSlot = null;
        this.updateCheckButtonVisibility();
      }

      this.tweens.add({
        targets: container,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 100
      });
    });

    container.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      container.x = dragX;
      container.y = dragY;
    });

    container.on('dragend', () => {
      container.setDepth(1);
      this.checkDropOnSlot(card);
    });

    return card;
  }

  private drawCardContent(graphics: Phaser.GameObjects.Graphics, type: string, color: number, cardWidth: number): void {
    const scale = cardWidth / 160;
    const contentY = -15 * scale; // 向上偏移，为标签留空间

    // 绘制图案区域背景
    graphics.fillStyle(color, 0.2);
    graphics.fillRoundedRect(-cardWidth / 2 + 10, -cardWidth * 0.625 + 10, cardWidth - 20, cardWidth - 30, 10);

    switch (type) {
      // ===== 花朵生长 =====
      case 'seed':
        // 土壤
        graphics.fillStyle(0x8B4513, 0.6);
        graphics.fillRect(-35 * scale, 15 * scale + contentY, 70 * scale, 25 * scale);
        // 种子
        graphics.fillStyle(color, 1);
        graphics.fillEllipse(0, contentY, 22 * scale, 30 * scale);
        // 种子纹理
        graphics.lineStyle(2, 0x5a3825, 0.5);
        graphics.lineBetween(-5 * scale, -10 * scale + contentY, 5 * scale, 5 * scale + contentY);
        break;

      case 'sprout':
        // 土壤
        graphics.fillStyle(0x8B4513, 0.6);
        graphics.fillRect(-35 * scale, 20 * scale + contentY, 70 * scale, 20 * scale);
        // 茎
        graphics.fillStyle(0x228b22, 1);
        graphics.fillRect(-3 * scale, -15 * scale + contentY, 6 * scale, 40 * scale);
        // 叶子
        graphics.fillStyle(color, 1);
        graphics.fillEllipse(-18 * scale, -10 * scale + contentY, 22 * scale, 12 * scale);
        graphics.fillEllipse(18 * scale, -5 * scale + contentY, 22 * scale, 12 * scale);
        // 叶脉
        graphics.lineStyle(1, 0x1a6b1a, 0.5);
        graphics.lineBetween(-25 * scale, -10 * scale + contentY, -10 * scale, -10 * scale + contentY);
        graphics.lineBetween(10 * scale, -5 * scale + contentY, 25 * scale, -5 * scale + contentY);
        break;

      case 'flower':
        // 茎
        graphics.fillStyle(0x228b22, 1);
        graphics.fillRect(-3 * scale, 5 * scale + contentY, 6 * scale, 35 * scale);
        // 叶子
        graphics.fillEllipse(-15 * scale, 25 * scale + contentY, 18 * scale, 10 * scale);
        graphics.fillEllipse(15 * scale, 20 * scale + contentY, 18 * scale, 10 * scale);
        // 花瓣
        graphics.fillStyle(color, 1);
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
          const px = Math.cos(angle) * 22 * scale;
          const py = Math.sin(angle) * 22 * scale - 15 * scale + contentY;
          graphics.fillEllipse(px, py, 16 * scale, 10 * scale);
        }
        // 花蕊
        graphics.fillStyle(0xffd700, 1);
        graphics.fillCircle(0, -15 * scale + contentY, 12 * scale);
        graphics.fillStyle(0xffa500, 1);
        graphics.fillCircle(0, -15 * scale + contentY, 6 * scale);
        break;

      // ===== 蝴蝶变态 =====
      case 'caterpillar':
        // 树枝
        graphics.fillStyle(0x8b4513, 1);
        graphics.fillRect(-40 * scale, 20 * scale + contentY, 80 * scale, 8 * scale);
        // 身体
        graphics.fillStyle(color, 1);
        for (let i = 0; i < 5; i++) {
          const segY = contentY + 10 * scale;
          graphics.fillCircle(-28 * scale + i * 14 * scale, segY, 10 * scale);
        }
        // 眼睛
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(-28 * scale, 6 * scale + contentY, 3 * scale);
        // 触角
        graphics.lineStyle(2, 0x000000, 1);
        graphics.lineBetween(-32 * scale, 2 * scale + contentY, -38 * scale, -8 * scale + contentY);
        graphics.lineBetween(-24 * scale, 2 * scale + contentY, -18 * scale, -8 * scale + contentY);
        break;

      case 'cocoon':
        // 树枝
        graphics.fillStyle(0x8b4513, 1);
        graphics.fillRect(-5 * scale, -35 * scale + contentY, 10 * scale, 15 * scale);
        // 茧
        graphics.fillStyle(color, 1);
        graphics.fillEllipse(0, 5 * scale + contentY, 25 * scale, 40 * scale);
        // 纹理
        graphics.lineStyle(2, 0x6b3d1a, 0.5);
        graphics.lineBetween(-10 * scale, -10 * scale + contentY, 10 * scale, -10 * scale + contentY);
        graphics.lineBetween(-12 * scale, 5 * scale + contentY, 12 * scale, 5 * scale + contentY);
        graphics.lineBetween(-10 * scale, 20 * scale + contentY, 10 * scale, 20 * scale + contentY);
        break;

      case 'butterfly':
        // 上翅膀
        graphics.fillStyle(color, 1);
        graphics.fillEllipse(-22 * scale, -8 * scale + contentY, 28 * scale, 22 * scale);
        graphics.fillEllipse(22 * scale, -8 * scale + contentY, 28 * scale, 22 * scale);
        // 下翅膀
        graphics.fillEllipse(-18 * scale, 15 * scale + contentY, 20 * scale, 16 * scale);
        graphics.fillEllipse(18 * scale, 15 * scale + contentY, 20 * scale, 16 * scale);
        // 翅膀花纹
        graphics.fillStyle(0xffffff, 0.5);
        graphics.fillCircle(-22 * scale, -8 * scale + contentY, 8 * scale);
        graphics.fillCircle(22 * scale, -8 * scale + contentY, 8 * scale);
        // 身体
        graphics.fillStyle(0x000000, 1);
        graphics.fillEllipse(0, 5 * scale + contentY, 6 * scale, 35 * scale);
        // 触角
        graphics.lineStyle(2, 0x000000, 1);
        graphics.lineBetween(-5 * scale, -18 * scale + contentY, -12 * scale, -30 * scale + contentY);
        graphics.lineBetween(5 * scale, -18 * scale + contentY, 12 * scale, -30 * scale + contentY);
        break;

      // ===== 小鸡孵化 =====
      case 'egg':
        // 鸡窝
        graphics.fillStyle(0xdeb887, 0.8);
        graphics.fillEllipse(0, 25 * scale + contentY, 50 * scale, 20 * scale);
        graphics.lineStyle(2, 0x8b4513, 0.5);
        for (let i = 0; i < 5; i++) {
          graphics.lineBetween(-25 * scale + i * 12 * scale, 18 * scale + contentY, -20 * scale + i * 12 * scale, 32 * scale + contentY);
        }
        // 蛋
        graphics.fillStyle(color, 1);
        graphics.fillEllipse(0, contentY, 32 * scale, 42 * scale);
        // 高光
        graphics.fillStyle(0xffffff, 0.4);
        graphics.fillEllipse(-8 * scale, -12 * scale + contentY, 8 * scale, 12 * scale);
        break;

      case 'chick':
        // 身体
        graphics.fillStyle(color, 1);
        graphics.fillCircle(0, 8 * scale + contentY, 25 * scale);
        // 头
        graphics.fillCircle(0, -18 * scale + contentY, 18 * scale);
        // 翅膀
        graphics.fillEllipse(-22 * scale, 8 * scale + contentY, 12 * scale, 18 * scale);
        graphics.fillEllipse(22 * scale, 8 * scale + contentY, 12 * scale, 18 * scale);
        // 眼睛
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(-6 * scale, -20 * scale + contentY, 4 * scale);
        graphics.fillCircle(6 * scale, -20 * scale + contentY, 4 * scale);
        // 嘴巴
        graphics.fillStyle(0xff6600, 1);
        graphics.fillTriangle(-6 * scale, -12 * scale + contentY, 6 * scale, -12 * scale + contentY, 0, -5 * scale + contentY);
        // 脚
        graphics.fillStyle(0xff6600, 1);
        graphics.fillRect(-12 * scale, 30 * scale + contentY, 4 * scale, 12 * scale);
        graphics.fillRect(8 * scale, 30 * scale + contentY, 4 * scale, 12 * scale);
        break;

      case 'chicken':
        // 身体
        graphics.fillStyle(color, 1);
        graphics.fillEllipse(0, 12 * scale + contentY, 42 * scale, 32 * scale);
        // 头
        graphics.fillCircle(0, -20 * scale + contentY, 20 * scale);
        // 鸡冠
        graphics.fillStyle(0xff0000, 1);
        graphics.fillCircle(-5 * scale, -40 * scale + contentY, 6 * scale);
        graphics.fillCircle(5 * scale, -38 * scale + contentY, 7 * scale);
        graphics.fillCircle(0, -35 * scale + contentY, 5 * scale);
        // 眼睛
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(-7 * scale, -22 * scale + contentY, 4 * scale);
        graphics.fillCircle(7 * scale, -22 * scale + contentY, 4 * scale);
        // 嘴巴
        graphics.fillStyle(0xff6600, 1);
        graphics.fillTriangle(-5 * scale, -15 * scale + contentY, 5 * scale, -15 * scale + contentY, 0, -8 * scale + contentY);
        // 尾巴
        graphics.fillStyle(0xff6347, 0.8);
        graphics.fillEllipse(-30 * scale, 5 * scale + contentY, 15 * scale, 20 * scale);
        break;

      // ===== 青蛙生长 =====
      case 'tadpole_egg':
        // 水
        graphics.fillStyle(0x87ceeb, 0.4);
        graphics.fillRoundedRect(-35 * scale, -25 * scale + contentY, 70 * scale, 55 * scale, 10);
        // 卵
        graphics.fillStyle(color, 0.8);
        graphics.fillCircle(-12 * scale, -8 * scale + contentY, 12 * scale);
        graphics.fillCircle(12 * scale, -5 * scale + contentY, 11 * scale);
        graphics.fillCircle(0, 12 * scale + contentY, 13 * scale);
        // 卵核
        graphics.fillStyle(0x000000, 0.5);
        graphics.fillCircle(-12 * scale, -8 * scale + contentY, 5 * scale);
        graphics.fillCircle(12 * scale, -5 * scale + contentY, 4 * scale);
        graphics.fillCircle(0, 12 * scale + contentY, 5 * scale);
        break;

      case 'tadpole':
        // 水
        graphics.fillStyle(0x87ceeb, 0.4);
        graphics.fillRoundedRect(-35 * scale, -25 * scale + contentY, 70 * scale, 55 * scale, 10);
        // 头
        graphics.fillStyle(color, 1);
        graphics.fillCircle(-10 * scale, 5 * scale + contentY, 15 * scale);
        // 尾巴
        graphics.lineStyle(8 * scale, color, 1);
        graphics.beginPath();
        graphics.moveTo(5 * scale, 5 * scale + contentY);
        graphics.lineTo(25 * scale, 0 + contentY);
        graphics.lineTo(35 * scale, 10 * scale + contentY);
        graphics.strokePath();
        // 眼睛
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(-15 * scale, 2 * scale + contentY, 3 * scale);
        break;

      case 'frog':
        // 身体
        graphics.fillStyle(color, 1);
        graphics.fillEllipse(0, 12 * scale + contentY, 45 * scale, 30 * scale);
        // 头
        graphics.fillEllipse(0, -10 * scale + contentY, 35 * scale, 25 * scale);
        // 眼睛凸起
        graphics.fillCircle(-12 * scale, -25 * scale + contentY, 12 * scale);
        graphics.fillCircle(12 * scale, -25 * scale + contentY, 12 * scale);
        // 眼白
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(-12 * scale, -25 * scale + contentY, 8 * scale);
        graphics.fillCircle(12 * scale, -25 * scale + contentY, 8 * scale);
        // 瞳孔
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(-12 * scale, -25 * scale + contentY, 4 * scale);
        graphics.fillCircle(12 * scale, -25 * scale + contentY, 4 * scale);
        // 嘴巴
        graphics.lineStyle(2, 0x228b22, 1);
        graphics.beginPath();
        graphics.arc(0, -5 * scale + contentY, 12 * scale, 0.2, Math.PI - 0.2);
        graphics.strokePath();
        break;

      // ===== 日出日落 =====
      case 'sunrise':
        // 地平线
        graphics.fillStyle(0x228b22, 0.8);
        graphics.fillRect(-40 * scale, 15 * scale + contentY, 80 * scale, 25 * scale);
        // 天空渐变
        graphics.fillStyle(0xffb6c1, 0.5);
        graphics.fillRect(-40 * scale, -25 * scale + contentY, 80 * scale, 40 * scale);
        // 太阳
        graphics.fillStyle(color, 1);
        graphics.fillCircle(0, 15 * scale + contentY, 22 * scale);
        // 光芒
        graphics.fillStyle(0xffd700, 0.6);
        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * Math.PI - Math.PI;
          graphics.fillTriangle(
            Math.cos(angle) * 25 * scale, 15 * scale + Math.sin(angle) * 25 * scale + contentY,
            Math.cos(angle - 0.15) * 40 * scale, 15 * scale + Math.sin(angle - 0.15) * 40 * scale + contentY,
            Math.cos(angle + 0.15) * 40 * scale, 15 * scale + Math.sin(angle + 0.15) * 40 * scale + contentY
          );
        }
        break;

      case 'sun':
        // 天空
        graphics.fillStyle(0x87ceeb, 0.5);
        graphics.fillRect(-40 * scale, -25 * scale + contentY, 80 * scale, 65 * scale);
        // 太阳
        graphics.fillStyle(color, 1);
        graphics.fillCircle(0, contentY, 25 * scale);
        // 光芒
        graphics.fillStyle(0xffa500, 1);
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          graphics.fillTriangle(
            0, contentY,
            Math.cos(angle - 0.15) * 40 * scale, Math.sin(angle - 0.15) * 40 * scale + contentY,
            Math.cos(angle + 0.15) * 40 * scale, Math.sin(angle + 0.15) * 40 * scale + contentY
          );
        }
        // 笑脸
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(-8 * scale, -5 * scale + contentY, 3 * scale);
        graphics.fillCircle(8 * scale, -5 * scale + contentY, 3 * scale);
        graphics.lineStyle(2, 0x000000, 1);
        graphics.beginPath();
        graphics.arc(0, 5 * scale + contentY, 8 * scale, 0.3, Math.PI - 0.3);
        graphics.strokePath();
        break;

      case 'sunset':
        // 地平线
        graphics.fillStyle(0x2f4f4f, 0.8);
        graphics.fillRect(-40 * scale, 18 * scale + contentY, 80 * scale, 22 * scale);
        // 天空
        graphics.fillStyle(0xff6347, 0.6);
        graphics.fillRect(-40 * scale, -25 * scale + contentY, 80 * scale, 43 * scale);
        graphics.fillStyle(0xffa500, 0.4);
        graphics.fillRect(-40 * scale, 5 * scale + contentY, 80 * scale, 13 * scale);
        // 太阳
        graphics.fillStyle(color, 1);
        graphics.fillCircle(0, 18 * scale + contentY, 20 * scale);
        break;

      // ===== 下雨彩虹 =====
      case 'cloud':
        // 乌云
        graphics.fillStyle(color, 1);
        graphics.fillCircle(-15 * scale, contentY, 20 * scale);
        graphics.fillCircle(15 * scale, contentY, 22 * scale);
        graphics.fillCircle(0, -10 * scale + contentY, 25 * scale);
        graphics.fillCircle(-25 * scale, 5 * scale + contentY, 15 * scale);
        graphics.fillCircle(25 * scale, 3 * scale + contentY, 16 * scale);
        // 闪电
        graphics.fillStyle(0xffff00, 1);
        graphics.beginPath();
        graphics.moveTo(0, 15 * scale + contentY);
        graphics.lineTo(-8 * scale, 28 * scale + contentY);
        graphics.lineTo(0, 25 * scale + contentY);
        graphics.lineTo(-5 * scale, 40 * scale + contentY);
        graphics.lineTo(5 * scale, 22 * scale + contentY);
        graphics.lineTo(0, 26 * scale + contentY);
        graphics.lineTo(8 * scale, 15 * scale + contentY);
        graphics.closePath();
        graphics.fillPath();
        break;

      case 'rain':
        // 云
        graphics.fillStyle(0x808080, 1);
        graphics.fillCircle(-12 * scale, -15 * scale + contentY, 18 * scale);
        graphics.fillCircle(12 * scale, -15 * scale + contentY, 20 * scale);
        graphics.fillCircle(0, -22 * scale + contentY, 22 * scale);
        // 雨滴
        graphics.fillStyle(color, 1);
        for (let i = 0; i < 5; i++) {
          const rx = -25 * scale + i * 12 * scale;
          const ry = 8 * scale + (i % 2) * 12 * scale + contentY;
          graphics.fillEllipse(rx, ry, 4 * scale, 10 * scale);
        }
        break;

      case 'rainbow':
        // 天空
        graphics.fillStyle(0x87ceeb, 0.4);
        graphics.fillRect(-40 * scale, -25 * scale + contentY, 80 * scale, 65 * scale);
        // 彩虹
        const rainbowColors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x8b00ff];
        for (let i = 0; i < rainbowColors.length; i++) {
          graphics.lineStyle(5 * scale, rainbowColors[i], 0.8);
          graphics.beginPath();
          graphics.arc(0, 30 * scale + contentY, (35 - i * 5) * scale, Math.PI, 0);
          graphics.strokePath();
        }
        // 太阳
        graphics.fillStyle(0xffd700, 1);
        graphics.fillCircle(25 * scale, -15 * scale + contentY, 12 * scale);
        break;

      // ===== 默认图形 - 更美观 =====
      default:
        graphics.fillStyle(color, 1);
        // 根据类型名生成美观的图形
        const hash = type.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        const shapeType = hash % 5;

        switch (shapeType) {
          case 0: // 星星
            const spikes = 5;
            const outerR = 30 * scale;
            const innerR = 15 * scale;
            graphics.beginPath();
            for (let i = 0; i < spikes * 2; i++) {
              const r = i % 2 === 0 ? outerR : innerR;
              const angle = (i * Math.PI) / spikes - Math.PI / 2;
              const px = Math.cos(angle) * r;
              const py = Math.sin(angle) * r + contentY;
              if (i === 0) graphics.moveTo(px, py);
              else graphics.lineTo(px, py);
            }
            graphics.closePath();
            graphics.fillPath();
            break;
          case 1: // 心形
            graphics.fillCircle(-12 * scale, -8 * scale + contentY, 15 * scale);
            graphics.fillCircle(12 * scale, -8 * scale + contentY, 15 * scale);
            graphics.fillTriangle(-27 * scale, -3 * scale + contentY, 27 * scale, -3 * scale + contentY, 0, 30 * scale + contentY);
            break;
          case 2: // 钻石
            graphics.fillTriangle(0, -30 * scale + contentY, -25 * scale, contentY, 25 * scale, contentY);
            graphics.fillTriangle(-25 * scale, contentY, 25 * scale, contentY, 0, 30 * scale + contentY);
            graphics.fillStyle(0xffffff, 0.3);
            graphics.fillTriangle(0, -30 * scale + contentY, -15 * scale, -5 * scale + contentY, 0, -5 * scale + contentY);
            break;
          case 3: // 花朵
            for (let i = 0; i < 5; i++) {
              const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
              graphics.fillCircle(Math.cos(angle) * 20 * scale, Math.sin(angle) * 20 * scale + contentY, 12 * scale);
            }
            graphics.fillStyle(0xffd700, 1);
            graphics.fillCircle(0, contentY, 10 * scale);
            break;
          case 4: // 云朵
            graphics.fillCircle(-15 * scale, contentY, 18 * scale);
            graphics.fillCircle(15 * scale, contentY, 20 * scale);
            graphics.fillCircle(0, -10 * scale + contentY, 22 * scale);
            break;
        }
        break;
    }
  }

  private checkDropOnSlot(card: StoryCard): void {
    const container = card.container;
    let droppedSlot: Slot | null = null;

    for (const slot of this.slots) {
      if (slot.occupied) continue;

      const distance = getDistance(container.x, container.y, slot.x, slot.y);
      if (distance <= SNAP_DISTANCE + 50) {
        droppedSlot = slot;
        break;
      }
    }

    if (droppedSlot) {
      this.snapToSlot(card, droppedSlot);
    } else {
      this.returnToOriginal(card);
    }
  }

  private snapToSlot(card: StoryCard, slot: Slot): void {
    slot.occupied = true;
    slot.cardOrder = card.order;
    card.currentSlot = slot.index;

    this.tweens.add({
      targets: card.container,
      x: slot.x,
      y: slot.y,
      scaleX: 1,
      scaleY: 1,
      duration: DURATIONS.snapTween,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.updateCheckButtonVisibility();
      }
    });
  }

  private returnToOriginal(card: StoryCard): void {
    this.tweens.add({
      targets: card.container,
      x: card.originalX,
      y: card.originalY,
      scaleX: 1,
      scaleY: 1,
      duration: DURATIONS.bounceTween,
      ease: 'Bounce.easeOut'
    });
  }

  private createCheckButton(): void {
    if (this.checkButton) {
      this.checkButton.destroy();
    }

    this.checkButton = this.add.container(GAME_WIDTH / 2, 480);

    const bg = this.add.graphics();
    bg.fillStyle(COLORS.green, 1);
    bg.fillRoundedRect(-80, -35, 160, 70, 35);

    const checkMark = this.add.graphics();
    checkMark.lineStyle(8, COLORS.white, 1);
    checkMark.beginPath();
    checkMark.moveTo(-25, 0);
    checkMark.lineTo(-5, 20);
    checkMark.lineTo(30, -15);
    checkMark.strokePath();

    this.checkButton.add([bg, checkMark]);

    const hitArea = new Phaser.Geom.Rectangle(-80, -35, 160, 70);
    this.checkButton.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    this.checkButton.on('pointerdown', () => {
      if (!this.resultPlayed) {
        this.checkSequence();
      }
    });

    this.checkButton.on('pointerover', () => {
      this.tweens.add({ targets: this.checkButton, scaleX: 1.1, scaleY: 1.1, duration: 100 });
    });

    this.checkButton.on('pointerout', () => {
      this.tweens.add({ targets: this.checkButton, scaleX: 1, scaleY: 1, duration: 100 });
    });

    this.checkButton.setAlpha(0);
    this.checkButton.setVisible(false);
  }

  private updateCheckButtonVisibility(): void {
    const allFilled = this.slots.every(slot => slot.occupied);

    if (allFilled && !this.resultPlayed) {
      this.checkButton.setVisible(true);
      this.tweens.add({ targets: this.checkButton, alpha: 1, duration: 300 });
      this.tweens.add({
        targets: this.checkButton,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    } else {
      this.tweens.killTweensOf(this.checkButton);
      this.checkButton.setScale(1);
      this.tweens.add({
        targets: this.checkButton,
        alpha: 0,
        duration: 200,
        onComplete: () => { this.checkButton.setVisible(false); }
      });
    }
  }

  private checkSequence(): void {
    this.resultPlayed = true;
    this.tweens.killTweensOf(this.checkButton);

    const isCorrect = this.slots.every((slot, index) => slot.cardOrder === index + 1);

    if (isCorrect) {
      this.playSuccessAnimation();
    } else {
      this.playFailAnimation();
    }
  }

  private playSuccessAnimation(): void {
    this.tweens.add({ targets: this.checkButton, alpha: 0, duration: 200 });

    // 卡片依次发光
    this.cards.forEach((card, index) => {
      if (card.currentSlot !== null) {
        this.time.delayedCall(index * 200, () => {
          const glow = this.add.graphics();
          glow.fillStyle(COLORS.yellow, 0.5);
          glow.fillRoundedRect(-90, -110, 180, 220, 20);
          glow.setPosition(card.container.x, card.container.y);
          glow.setAlpha(0);

          this.tweens.add({
            targets: glow,
            alpha: 1,
            duration: 200,
            yoyo: true,
            onComplete: () => glow.destroy()
          });

          this.tweens.add({
            targets: card.container,
            y: card.container.y - 20,
            duration: 200,
            yoyo: true
          });
        });
      }
    });

    // 粒子庆祝
    this.time.delayedCall(800, () => {
      for (let i = 0; i < 5; i++) {
        this.time.delayedCall(i * 150, () => {
          const x = Phaser.Math.Between(200, GAME_WIDTH - 200);
          const y = Phaser.Math.Between(150, 350);

          const particles = this.add.particles(x, y, 'particle', {
            speed: { min: 100, max: 200 },
            scale: { start: 0.8, end: 0 },
            lifespan: 800,
            blendMode: Phaser.BlendModes.ADD,
            tint: [COLORS.yellow, COLORS.pink, COLORS.green],
            emitting: false
          });

          particles.explode(20);
          this.time.delayedCall(1000, () => { particles.destroy(); });
        });
      }
    });

    // 进入下一关或完成
    this.time.delayedCall(2000, () => {
      if (this.currentLevel < this.maxLevel) {
        this.currentLevel++;
        this.showLevelTransition();
      } else {
        this.showGameComplete();
      }
    });
  }

  private playFailAnimation(): void {
    this.cards.forEach(card => {
      if (card.currentSlot !== null) {
        this.tweens.add({
          targets: card.container,
          angle: 10,
          duration: 100,
          yoyo: true,
          repeat: 3,
          ease: 'Sine.easeInOut',
          onComplete: () => { card.container.angle = 0; }
        });
      }
    });

    this.time.delayedCall(800, () => {
      this.resultPlayed = false;
      this.updateCheckButtonVisibility();
    });
  }

  private showLevelTransition(): void {
    const bigStar = this.add.graphics();
    bigStar.fillStyle(COLORS.yellow, 1);

    const size = 80;
    const spikes = 5;

    bigStar.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? size : size / 2;
      const angle = (i * Math.PI) / spikes - Math.PI / 2;
      const px = GAME_WIDTH / 2 + Math.cos(angle) * radius;
      const py = GAME_HEIGHT / 2 + Math.sin(angle) * radius;
      if (i === 0) { bigStar.moveTo(px, py); } else { bigStar.lineTo(px, py); }
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

    for (let i = 0; i < 10; i++) {
      this.time.delayedCall(i * 100, () => {
        const x = Phaser.Math.Between(200, GAME_WIDTH - 200);
        const y = Phaser.Math.Between(150, GAME_HEIGHT - 150);

        const particles = this.add.particles(x, y, 'particle', {
          speed: { min: 100, max: 200 },
          scale: { start: 0.8, end: 0 },
          lifespan: 800,
          blendMode: Phaser.BlendModes.ADD,
          tint: [COLORS.yellow, COLORS.pink, COLORS.green, COLORS.blue],
          emitting: false
        });

        particles.explode(25);
        this.time.delayedCall(1000, () => { particles.destroy(); });
      });
    }

    // 大星星
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
        if (i === 0) { trophy.moveTo(px, py); } else { trophy.lineTo(px, py); }
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
    if (this.cards.length === 0) return;

    const firstCard = this.cards[0];
    const firstSlot = this.slots[0];

    const hand = this.add.graphics();
    hand.fillStyle(COLORS.secondary, 0.9);
    hand.fillCircle(0, 0, 20);
    hand.fillRoundedRect(-6, -45, 12, 35, 6);

    const handContainer = this.add.container(firstCard.originalX, firstCard.originalY - 50, [hand]);
    handContainer.setAlpha(0);

    this.time.delayedCall(1000, () => {
      this.tweens.add({
        targets: handContainer,
        alpha: 1,
        duration: 300,
        onComplete: () => {
          this.tweens.add({
            targets: handContainer,
            x: firstSlot.x,
            y: firstSlot.y - 50,
            duration: 1000,
            ease: 'Sine.easeInOut',
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
