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

// 故事图片资源配置 - 定义哪些步骤使用图片渲染
const STORY_IMAGES: Record<string, Record<string, string>> = {
  // ===== 优先级1: 生物变态 =====
  butterfly: {
    caterpillar: 'story_butterfly_caterpillar',
    cocoon: 'story_butterfly_cocoon',
    butterfly: 'story_butterfly_butterfly'
  },
  chicken: {
    egg: 'story_chicken_egg',
    chick: 'story_chicken_chick',
    chicken: 'story_chicken_chicken'
  },
  frog: {
    tadpole_egg: 'story_frog_tadpole_egg',
    tadpole: 'story_frog_tadpole',
    frog: 'story_frog_frog'
  },
  caterpillar_full: {
    egg2: 'story_caterpillar_egg',
    tiny_cat: 'story_caterpillar_tiny',
    big_cat: 'story_caterpillar_big',
    pupa: 'story_caterpillar_pupa',
    moth: 'story_caterpillar_moth'
  },
  // ===== 优先级2: 食物制作 =====
  cake: {
    ingredients: 'story_cake_ingredients',
    baking: 'story_cake_baking',
    cake: 'story_cake_cake'
  },
  bread: {
    wheat: 'story_bread_wheat',
    flour: 'story_bread_flour',
    dough: 'story_bread_dough',
    bread: 'story_bread_bread'
  },
  ice_cream: {
    milk: 'story_icecream_milk',
    mixing: 'story_icecream_mixing',
    freezing: 'story_icecream_freezing',
    cone: 'story_icecream_cone',
    sundae: 'story_icecream_sundae'
  },
  // ===== 优先级3-4: 其他 =====
  apple: {
    blossom: 'story_apple_blossom',
    small_apple: 'story_apple_small',
    green_apple: 'story_apple_green',
    red_apple: 'story_apple_red'
  },
  seasons: {
    spring: 'story_seasons_spring',
    summer: 'story_seasons_summer',
    autumn: 'story_seasons_autumn',
    winter: 'story_seasons_winter',
    spring2: 'story_seasons_spring2'
  },
  rocket: {
    blueprint: 'story_rocket_blueprint',
    building: 'story_rocket_building',
    launch: 'story_rocket_launch',
    space: 'story_rocket_space',
    planet: 'story_rocket_planet'
  },
  // ===== 额外主题 =====
  flower: {
    seed: 'story_flower_seed',
    sprout: 'story_flower_sprout',
    flower: 'story_flower_flower'
  },
  day: {
    sunrise: 'story_day_sunrise',
    sun: 'story_day_sun',
    sunset: 'story_day_sunset'
  },
  rain: {
    cloud: 'story_rain_cloud',
    rain: 'story_rain_rain',
    rainbow: 'story_rain_rainbow'
  },
  tree: {
    seed2: 'story_tree_seed',
    sapling: 'story_tree_sapling',
    small_tree: 'story_tree_small',
    big_tree: 'story_tree_big'
  },
  snowman: {
    snow: 'story_snowman_snow',
    ball1: 'story_snowman_ball1',
    ball2: 'story_snowman_ball2',
    snowman: 'story_snowman_snowman'
  },
  house: {
    foundation: 'story_house_foundation',
    walls: 'story_house_walls',
    roof: 'story_house_roof',
    house: 'story_house_house'
  },
  moon: {
    new_moon: 'story_moon_new',
    crescent: 'story_moon_crescent',
    half: 'story_moon_half',
    full_moon: 'story_moon_full'
  },
  painting: {
    canvas: 'story_painting_canvas',
    sketch: 'story_painting_sketch',
    color: 'story_painting_color',
    art: 'story_painting_art'
  },
  star_life: {
    nebula: 'story_star_nebula',
    protostar: 'story_star_protostar',
    star: 'story_star_star',
    red_giant: 'story_star_red_giant',
    supernova: 'story_star_supernova'
  },
  water_cycle: {
    ocean: 'story_water_ocean',
    evaporate: 'story_water_evaporate',
    cloud2: 'story_water_cloud',
    rain2: 'story_water_rain',
    river: 'story_water_river'
  }
};

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
    this.drawCardContent(content, type, color, cardWidth, container);

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

  private drawCardContent(graphics: Phaser.GameObjects.Graphics, type: string, color: number, cardWidth: number, container?: Phaser.GameObjects.Container): void {
    const scale = cardWidth / 160;
    const contentY = -15 * scale; // 向上偏移，为标签留空间

    // 绘制图案区域背景
    graphics.fillStyle(color, 0.15);
    graphics.fillRoundedRect(-cardWidth / 2 + 10, -cardWidth * 0.625 + 10, cardWidth - 20, cardWidth - 30, 12);

    // 检查是否有对应的图片资源
    const themeName = this.currentTheme.name;
    const imageKey = STORY_IMAGES[themeName]?.[type];

    if (imageKey && this.textures.exists(imageKey) && container) {
      // 使用图片渲染
      const imageSize = (cardWidth - 40) * 0.85;
      const image = this.add.image(0, contentY, imageKey);
      image.setDisplaySize(imageSize, imageSize);
      container.add(image);
      return; // 使用图片后直接返回，不执行代码绘制
    }

    // 以下是代码绘制逻辑（当没有图片资源时使用）
    switch (type) {
      // ===== 花朵生长 =====
      case 'seed':
        // 花盆
        graphics.fillStyle(0xCD853F, 1);
        graphics.fillRect(-30 * scale, 18 * scale + contentY, 60 * scale, 22 * scale);
        graphics.fillStyle(0xA0522D, 1);
        graphics.fillRect(-35 * scale, 14 * scale + contentY, 70 * scale, 8 * scale);
        // 土壤
        graphics.fillStyle(0x5D4037, 1);
        graphics.fillRect(-28 * scale, 18 * scale + contentY, 56 * scale, 10 * scale);
        // 可爱的种子 - 带眼睛
        graphics.fillStyle(color, 1);
        graphics.fillEllipse(0, -5 * scale + contentY, 24 * scale, 32 * scale);
        // 种子高光
        graphics.fillStyle(0xFFFFFF, 0.3);
        graphics.fillEllipse(-6 * scale, -12 * scale + contentY, 8 * scale, 10 * scale);
        // 种子眼睛 - 闭眼睡觉
        graphics.lineStyle(2 * scale, 0x5a3825, 1);
        graphics.beginPath();
        graphics.arc(-5 * scale, -5 * scale + contentY, 4 * scale, 0.2, Math.PI - 0.2);
        graphics.strokePath();
        graphics.beginPath();
        graphics.arc(5 * scale, -5 * scale + contentY, 4 * scale, 0.2, Math.PI - 0.2);
        graphics.strokePath();
        // 腮红
        graphics.fillStyle(0xFFB6C1, 0.5);
        graphics.fillCircle(-10 * scale, 2 * scale + contentY, 5 * scale);
        graphics.fillCircle(10 * scale, 2 * scale + contentY, 5 * scale);
        break;

      case 'sprout':
        // 花盆
        graphics.fillStyle(0xCD853F, 1);
        graphics.fillRect(-30 * scale, 22 * scale + contentY, 60 * scale, 18 * scale);
        graphics.fillStyle(0xA0522D, 1);
        graphics.fillRect(-35 * scale, 18 * scale + contentY, 70 * scale, 8 * scale);
        // 土壤
        graphics.fillStyle(0x5D4037, 1);
        graphics.fillRect(-28 * scale, 22 * scale + contentY, 56 * scale, 8 * scale);
        // 茎 - 弯曲的
        graphics.fillStyle(0x4CAF50, 1);
        graphics.fillRect(-2 * scale, -5 * scale + contentY, 4 * scale, 30 * scale);
        // 可爱的嫩叶
        graphics.fillStyle(color, 1);
        graphics.fillEllipse(-15 * scale, -15 * scale + contentY, 20 * scale, 12 * scale);
        graphics.fillEllipse(15 * scale, -10 * scale + contentY, 20 * scale, 12 * scale);
        // 叶脉
        graphics.lineStyle(1.5 * scale, 0x2E7D32, 0.6);
        graphics.lineBetween(-22 * scale, -15 * scale + contentY, -8 * scale, -15 * scale + contentY);
        graphics.lineBetween(8 * scale, -10 * scale + contentY, 22 * scale, -10 * scale + contentY);
        // 叶子高光
        graphics.fillStyle(0xFFFFFF, 0.25);
        graphics.fillEllipse(-15 * scale, -18 * scale + contentY, 10 * scale, 5 * scale);
        graphics.fillEllipse(15 * scale, -13 * scale + contentY, 10 * scale, 5 * scale);
        // 嫩芽顶部的小叶
        graphics.fillStyle(0x81C784, 1);
        graphics.fillEllipse(0, -28 * scale + contentY, 8 * scale, 12 * scale);
        break;

      case 'flower':
        // 花盆
        graphics.fillStyle(0xCD853F, 1);
        graphics.fillRect(-25 * scale, 28 * scale + contentY, 50 * scale, 15 * scale);
        graphics.fillStyle(0xA0522D, 1);
        graphics.fillRect(-30 * scale, 24 * scale + contentY, 60 * scale, 8 * scale);
        // 茎
        graphics.fillStyle(0x4CAF50, 1);
        graphics.fillRect(-3 * scale, 0 + contentY, 6 * scale, 28 * scale);
        // 叶子
        graphics.fillStyle(0x66BB6A, 1);
        graphics.fillEllipse(-18 * scale, 15 * scale + contentY, 20 * scale, 10 * scale);
        graphics.fillEllipse(18 * scale, 10 * scale + contentY, 20 * scale, 10 * scale);
        // 美丽的花瓣 - 双层
        graphics.fillStyle(color, 0.7);
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
          const px = Math.cos(angle) * 26 * scale;
          const py = Math.sin(angle) * 26 * scale - 18 * scale + contentY;
          graphics.fillEllipse(px, py, 14 * scale, 10 * scale);
        }
        graphics.fillStyle(color, 1);
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
          const px = Math.cos(angle) * 20 * scale;
          const py = Math.sin(angle) * 20 * scale - 18 * scale + contentY;
          graphics.fillEllipse(px, py, 15 * scale, 11 * scale);
        }
        // 花蕊 - 多层
        graphics.fillStyle(0xFFEB3B, 1);
        graphics.fillCircle(0, -18 * scale + contentY, 14 * scale);
        graphics.fillStyle(0xFFC107, 1);
        graphics.fillCircle(0, -18 * scale + contentY, 10 * scale);
        graphics.fillStyle(0xFF9800, 1);
        graphics.fillCircle(0, -18 * scale + contentY, 5 * scale);
        // 花蕊高光
        graphics.fillStyle(0xFFFFFF, 0.4);
        graphics.fillCircle(-4 * scale, -22 * scale + contentY, 4 * scale);
        break;

      // ===== 蝴蝶变态 =====
      case 'caterpillar':
        // 树叶背景
        graphics.fillStyle(0x81C784, 1);
        graphics.fillEllipse(0, 15 * scale + contentY, 65 * scale, 35 * scale);
        graphics.fillStyle(0x4CAF50, 1);
        graphics.fillEllipse(0, 15 * scale + contentY, 55 * scale, 28 * scale);
        // 叶脉
        graphics.lineStyle(2 * scale, 0x2E7D32, 0.5);
        graphics.lineBetween(-25 * scale, 15 * scale + contentY, 25 * scale, 15 * scale + contentY);
        // 可爱的毛毛虫身体 - 圆滚滚的
        graphics.fillStyle(color, 1);
        for (let i = 0; i < 5; i++) {
          const segY = contentY + 5 * scale;
          const segSize = i === 0 ? 12 * scale : 10 * scale;
          graphics.fillCircle(-24 * scale + i * 12 * scale, segY, segSize);
        }
        // 身体花纹
        graphics.fillStyle(0xFFEB3B, 0.5);
        for (let i = 1; i < 5; i++) {
          graphics.fillCircle(-24 * scale + i * 12 * scale, 3 * scale + contentY, 4 * scale);
        }
        // 可爱的大眼睛
        graphics.fillStyle(0xFFFFFF, 1);
        graphics.fillCircle(-26 * scale, 0 + contentY, 6 * scale);
        graphics.fillCircle(-18 * scale, 0 + contentY, 6 * scale);
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(-25 * scale, 1 * scale + contentY, 3 * scale);
        graphics.fillCircle(-17 * scale, 1 * scale + contentY, 3 * scale);
        // 眼睛高光
        graphics.fillStyle(0xFFFFFF, 1);
        graphics.fillCircle(-26 * scale, -1 * scale + contentY, 1.5 * scale);
        graphics.fillCircle(-18 * scale, -1 * scale + contentY, 1.5 * scale);
        // 可爱的触角
        graphics.lineStyle(2 * scale, 0x5D4037, 1);
        graphics.lineBetween(-28 * scale, -6 * scale + contentY, -32 * scale, -18 * scale + contentY);
        graphics.lineBetween(-18 * scale, -6 * scale + contentY, -14 * scale, -18 * scale + contentY);
        graphics.fillStyle(0xFF5722, 1);
        graphics.fillCircle(-32 * scale, -18 * scale + contentY, 3 * scale);
        graphics.fillCircle(-14 * scale, -18 * scale + contentY, 3 * scale);
        // 微笑
        graphics.lineStyle(1.5 * scale, 0x5D4037, 1);
        graphics.beginPath();
        graphics.arc(-22 * scale, 6 * scale + contentY, 4 * scale, 0.3, Math.PI - 0.3);
        graphics.strokePath();
        break;

      case 'cocoon':
        // 树枝
        graphics.fillStyle(0x795548, 1);
        graphics.fillRoundedRect(-35 * scale, -35 * scale + contentY, 70 * scale, 10 * scale, 5);
        graphics.fillStyle(0x5D4037, 1);
        graphics.fillRect(-3 * scale, -35 * scale + contentY, 6 * scale, 18 * scale);
        // 丝线
        graphics.lineStyle(1.5 * scale, 0x9E9E9E, 0.6);
        graphics.lineBetween(0, -18 * scale + contentY, 0, -10 * scale + contentY);
        // 茧 - 更精致
        graphics.fillStyle(color, 1);
        graphics.fillEllipse(0, 8 * scale + contentY, 28 * scale, 42 * scale);
        // 茧的纹理
        graphics.lineStyle(1.5 * scale, 0x8D6E63, 0.4);
        for (let i = -15; i <= 15; i += 10) {
          graphics.beginPath();
          graphics.arc(0, 8 * scale + contentY, 12 * scale, Math.PI * 0.2, Math.PI * 0.8);
          graphics.strokePath();
        }
        graphics.lineBetween(-10 * scale, -8 * scale + contentY, 10 * scale, -8 * scale + contentY);
        graphics.lineBetween(-12 * scale, 5 * scale + contentY, 12 * scale, 5 * scale + contentY);
        graphics.lineBetween(-11 * scale, 18 * scale + contentY, 11 * scale, 18 * scale + contentY);
        // 茧的高光
        graphics.fillStyle(0xFFFFFF, 0.2);
        graphics.fillEllipse(-8 * scale, 0 + contentY, 8 * scale, 20 * scale);
        break;

      case 'butterfly':
        // 上翅膀 - 更华丽
        graphics.fillStyle(color, 1);
        graphics.fillEllipse(-24 * scale, -6 * scale + contentY, 30 * scale, 24 * scale);
        graphics.fillEllipse(24 * scale, -6 * scale + contentY, 30 * scale, 24 * scale);
        // 下翅膀
        graphics.fillEllipse(-20 * scale, 18 * scale + contentY, 22 * scale, 18 * scale);
        graphics.fillEllipse(20 * scale, 18 * scale + contentY, 22 * scale, 18 * scale);
        // 翅膀渐变装饰
        graphics.fillStyle(0xFFFFFF, 0.4);
        graphics.fillEllipse(-24 * scale, -10 * scale + contentY, 18 * scale, 12 * scale);
        graphics.fillEllipse(24 * scale, -10 * scale + contentY, 18 * scale, 12 * scale);
        // 翅膀圆点花纹
        graphics.fillStyle(0xFFEB3B, 0.8);
        graphics.fillCircle(-26 * scale, -6 * scale + contentY, 6 * scale);
        graphics.fillCircle(26 * scale, -6 * scale + contentY, 6 * scale);
        graphics.fillStyle(0x2196F3, 0.8);
        graphics.fillCircle(-18 * scale, 0 + contentY, 4 * scale);
        graphics.fillCircle(18 * scale, 0 + contentY, 4 * scale);
        graphics.fillCircle(-20 * scale, 18 * scale + contentY, 5 * scale);
        graphics.fillCircle(20 * scale, 18 * scale + contentY, 5 * scale);
        // 翅膀边缘
        graphics.lineStyle(2 * scale, 0x000000, 0.3);
        graphics.strokeEllipse(-24 * scale, -6 * scale + contentY, 30 * scale, 24 * scale);
        graphics.strokeEllipse(24 * scale, -6 * scale + contentY, 30 * scale, 24 * scale);
        // 身体
        graphics.fillStyle(0x5D4037, 1);
        graphics.fillEllipse(0, 5 * scale + contentY, 7 * scale, 32 * scale);
        // 头部
        graphics.fillCircle(0, -15 * scale + contentY, 6 * scale);
        // 眼睛
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(-3 * scale, -16 * scale + contentY, 2 * scale);
        graphics.fillCircle(3 * scale, -16 * scale + contentY, 2 * scale);
        // 触角 - 卷曲的
        graphics.lineStyle(2 * scale, 0x5D4037, 1);
        graphics.beginPath();
        graphics.moveTo(-4 * scale, -20 * scale + contentY);
        graphics.lineTo(-8 * scale, -35 * scale + contentY);
        graphics.strokePath();
        graphics.beginPath();
        graphics.moveTo(4 * scale, -20 * scale + contentY);
        graphics.lineTo(8 * scale, -35 * scale + contentY);
        graphics.strokePath();
        // 触角球
        graphics.fillStyle(0x5D4037, 1);
        graphics.fillCircle(-8 * scale, -35 * scale + contentY, 3 * scale);
        graphics.fillCircle(8 * scale, -35 * scale + contentY, 3 * scale);
        break;

      // ===== 小鸡孵化 =====
      case 'egg':
        // 精美的鸡窝
        graphics.fillStyle(0xD2B48C, 1);
        graphics.fillEllipse(0, 28 * scale + contentY, 55 * scale, 18 * scale);
        graphics.fillStyle(0xDEB887, 1);
        graphics.fillEllipse(0, 25 * scale + contentY, 50 * scale, 15 * scale);
        // 稻草纹理
        graphics.lineStyle(2 * scale, 0xBFA76F, 0.7);
        for (let i = 0; i < 7; i++) {
          const sx = -28 * scale + i * 9 * scale;
          graphics.lineBetween(sx, 20 * scale + contentY, sx + 5 * scale, 35 * scale + contentY);
        }
        // 可爱的蛋
        graphics.fillStyle(color, 1);
        graphics.fillEllipse(0, 0 + contentY, 35 * scale, 45 * scale);
        // 蛋的高光
        graphics.fillStyle(0xFFFFFF, 0.4);
        graphics.fillEllipse(-10 * scale, -12 * scale + contentY, 10 * scale, 15 * scale);
        // 蛋壳上的斑点装饰
        graphics.fillStyle(0xF5DEB3, 0.5);
        graphics.fillCircle(8 * scale, -5 * scale + contentY, 4 * scale);
        graphics.fillCircle(12 * scale, 8 * scale + contentY, 3 * scale);
        graphics.fillCircle(-5 * scale, 10 * scale + contentY, 3 * scale);
        break;

      case 'chick':
        // 蛋壳碎片
        graphics.fillStyle(0xFFFACD, 0.8);
        graphics.fillEllipse(-20 * scale, 28 * scale + contentY, 15 * scale, 12 * scale);
        graphics.fillEllipse(20 * scale, 30 * scale + contentY, 12 * scale, 10 * scale);
        // 可爱的小鸡身体
        graphics.fillStyle(color, 1);
        graphics.fillCircle(0, 12 * scale + contentY, 28 * scale);
        // 翅膀
        graphics.fillStyle(0xFFD54F, 1);
        graphics.fillEllipse(-25 * scale, 10 * scale + contentY, 14 * scale, 20 * scale);
        graphics.fillEllipse(25 * scale, 10 * scale + contentY, 14 * scale, 20 * scale);
        // 头
        graphics.fillStyle(color, 1);
        graphics.fillCircle(0, -16 * scale + contentY, 22 * scale);
        // 头顶的小毛
        graphics.fillStyle(0xFFB300, 1);
        graphics.fillEllipse(-3 * scale, -38 * scale + contentY, 4 * scale, 8 * scale);
        graphics.fillEllipse(3 * scale, -36 * scale + contentY, 3 * scale, 6 * scale);
        graphics.fillEllipse(0, -40 * scale + contentY, 3 * scale, 7 * scale);
        // 可爱的大眼睛
        graphics.fillStyle(0xFFFFFF, 1);
        graphics.fillCircle(-8 * scale, -18 * scale + contentY, 7 * scale);
        graphics.fillCircle(8 * scale, -18 * scale + contentY, 7 * scale);
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(-7 * scale, -17 * scale + contentY, 4 * scale);
        graphics.fillCircle(9 * scale, -17 * scale + contentY, 4 * scale);
        // 眼睛高光
        graphics.fillStyle(0xFFFFFF, 1);
        graphics.fillCircle(-9 * scale, -19 * scale + contentY, 2 * scale);
        graphics.fillCircle(7 * scale, -19 * scale + contentY, 2 * scale);
        // 橙色小嘴
        graphics.fillStyle(0xFF6D00, 1);
        graphics.fillTriangle(-6 * scale, -8 * scale + contentY, 6 * scale, -8 * scale + contentY, 0, 2 * scale + contentY);
        // 腮红
        graphics.fillStyle(0xFFCDD2, 0.6);
        graphics.fillCircle(-15 * scale, -10 * scale + contentY, 5 * scale);
        graphics.fillCircle(15 * scale, -10 * scale + contentY, 5 * scale);
        // 小脚
        graphics.fillStyle(0xFF6D00, 1);
        graphics.fillRect(-10 * scale, 35 * scale + contentY, 5 * scale, 10 * scale);
        graphics.fillRect(5 * scale, 35 * scale + contentY, 5 * scale, 10 * scale);
        break;

      case 'chicken':
        // 母鸡身体
        graphics.fillStyle(color, 1);
        graphics.fillEllipse(5 * scale, 15 * scale + contentY, 45 * scale, 32 * scale);
        // 尾巴羽毛
        graphics.fillStyle(0xE53935, 0.9);
        graphics.fillEllipse(-28 * scale, 5 * scale + contentY, 12 * scale, 25 * scale);
        graphics.fillEllipse(-32 * scale, 0 + contentY, 10 * scale, 22 * scale);
        graphics.fillStyle(0xEF5350, 0.8);
        graphics.fillEllipse(-25 * scale, 10 * scale + contentY, 10 * scale, 20 * scale);
        // 翅膀
        graphics.fillStyle(0xFFAB91, 1);
        graphics.fillEllipse(12 * scale, 15 * scale + contentY, 22 * scale, 18 * scale);
        // 翅膀纹理
        graphics.lineStyle(1.5 * scale, 0xFF7043, 0.4);
        graphics.beginPath();
        graphics.arc(12 * scale, 15 * scale + contentY, 12 * scale, -0.5, 0.8);
        graphics.strokePath();
        // 头
        graphics.fillStyle(color, 1);
        graphics.fillCircle(20 * scale, -12 * scale + contentY, 20 * scale);
        // 鸡冠
        graphics.fillStyle(0xD32F2F, 1);
        graphics.fillCircle(15 * scale, -32 * scale + contentY, 7 * scale);
        graphics.fillCircle(22 * scale, -30 * scale + contentY, 8 * scale);
        graphics.fillCircle(28 * scale, -28 * scale + contentY, 6 * scale);
        // 眼睛
        graphics.fillStyle(0xFFFFFF, 1);
        graphics.fillCircle(25 * scale, -14 * scale + contentY, 6 * scale);
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(26 * scale, -13 * scale + contentY, 3 * scale);
        graphics.fillStyle(0xFFFFFF, 1);
        graphics.fillCircle(24 * scale, -15 * scale + contentY, 1.5 * scale);
        // 嘴巴
        graphics.fillStyle(0xFF6D00, 1);
        graphics.fillTriangle(32 * scale, -10 * scale + contentY, 32 * scale, -4 * scale + contentY, 42 * scale, -7 * scale + contentY);
        // 肉垂
        graphics.fillStyle(0xEF5350, 1);
        graphics.fillEllipse(30 * scale, 0 + contentY, 6 * scale, 10 * scale);
        // 脚
        graphics.fillStyle(0xFF6D00, 1);
        graphics.fillRect(0 + contentY, 40 * scale + contentY, 5 * scale, 12 * scale);
        graphics.fillRect(12 * scale, 40 * scale + contentY, 5 * scale, 12 * scale);
        break;

      // ===== 青蛙生长 =====
      case 'tadpole_egg':
        // 池塘水
        graphics.fillStyle(0x81D4FA, 1);
        graphics.fillRoundedRect(-38 * scale, -28 * scale + contentY, 76 * scale, 60 * scale, 12);
        // 水波纹
        graphics.lineStyle(1.5 * scale, 0x4FC3F7, 0.4);
        graphics.beginPath();
        graphics.arc(0, -10 * scale + contentY, 30 * scale, 0, Math.PI * 0.4);
        graphics.strokePath();
        // 透明的卵块
        graphics.fillStyle(0xE0F7FA, 0.8);
        graphics.fillCircle(0, 5 * scale + contentY, 28 * scale);
        // 可爱的青蛙卵
        graphics.fillStyle(color, 0.9);
        graphics.fillCircle(-10 * scale, -2 * scale + contentY, 10 * scale);
        graphics.fillCircle(10 * scale, 0 + contentY, 9 * scale);
        graphics.fillCircle(0, 12 * scale + contentY, 11 * scale);
        graphics.fillCircle(-8 * scale, 10 * scale + contentY, 8 * scale);
        graphics.fillCircle(12 * scale, 12 * scale + contentY, 7 * scale);
        // 卵核 - 小眼睛样式
        graphics.fillStyle(0x37474F, 1);
        graphics.fillCircle(-10 * scale, -2 * scale + contentY, 5 * scale);
        graphics.fillCircle(10 * scale, 0 + contentY, 4 * scale);
        graphics.fillCircle(0, 12 * scale + contentY, 5 * scale);
        // 高光
        graphics.fillStyle(0xFFFFFF, 0.5);
        graphics.fillCircle(-13 * scale, -5 * scale + contentY, 3 * scale);
        graphics.fillCircle(7 * scale, -3 * scale + contentY, 2 * scale);
        break;

      case 'tadpole':
        // 池塘水
        graphics.fillStyle(0x81D4FA, 1);
        graphics.fillRoundedRect(-38 * scale, -28 * scale + contentY, 76 * scale, 60 * scale, 12);
        // 水草
        graphics.fillStyle(0x66BB6A, 1);
        graphics.fillRect(25 * scale, 0 + contentY, 4 * scale, 35 * scale);
        graphics.fillEllipse(28 * scale, -8 * scale + contentY, 10 * scale, 18 * scale);
        // 可爱的蝌蚪 - 大头
        graphics.fillStyle(color, 1);
        graphics.fillCircle(-8 * scale, 5 * scale + contentY, 18 * scale);
        // 蝌蚪尾巴 - 波浪形
        graphics.lineStyle(8 * scale, color, 1);
        graphics.beginPath();
        graphics.moveTo(8 * scale, 5 * scale + contentY);
        graphics.lineTo(28 * scale, 5 * scale + contentY);
        graphics.strokePath();
        graphics.lineStyle(5 * scale, color, 1);
        graphics.beginPath();
        graphics.moveTo(28 * scale, 5 * scale + contentY);
        graphics.lineTo(35 * scale, 5 * scale + contentY);
        graphics.strokePath();
        // 可爱的大眼睛
        graphics.fillStyle(0xFFFFFF, 1);
        graphics.fillCircle(-12 * scale, 0 + contentY, 7 * scale);
        graphics.fillCircle(-2 * scale, 0 + contentY, 7 * scale);
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(-11 * scale, 1 * scale + contentY, 4 * scale);
        graphics.fillCircle(-1 * scale, 1 * scale + contentY, 4 * scale);
        // 眼睛高光
        graphics.fillStyle(0xFFFFFF, 1);
        graphics.fillCircle(-13 * scale, -1 * scale + contentY, 2 * scale);
        graphics.fillCircle(-3 * scale, -1 * scale + contentY, 2 * scale);
        // 微笑
        graphics.lineStyle(1.5 * scale, 0x2E7D32, 1);
        graphics.beginPath();
        graphics.arc(-7 * scale, 8 * scale + contentY, 5 * scale, 0.3, Math.PI - 0.3);
        graphics.strokePath();
        break;

      case 'frog':
        // 荷叶
        graphics.fillStyle(0x4CAF50, 1);
        graphics.fillCircle(0, 25 * scale + contentY, 35 * scale);
        graphics.fillStyle(0x66BB6A, 1);
        graphics.fillCircle(0, 25 * scale + contentY, 30 * scale);
        // 荷叶缺口
        graphics.fillStyle(0x81D4FA, 1);
        graphics.fillTriangle(0, 25 * scale + contentY, 15 * scale, 45 * scale + contentY, -15 * scale, 45 * scale + contentY);
        // 可爱的青蛙身体
        graphics.fillStyle(color, 1);
        graphics.fillEllipse(0, 10 * scale + contentY, 45 * scale, 32 * scale);
        // 肚皮
        graphics.fillStyle(0xC8E6C9, 1);
        graphics.fillEllipse(0, 15 * scale + contentY, 30 * scale, 20 * scale);
        // 头
        graphics.fillStyle(color, 1);
        graphics.fillEllipse(0, -10 * scale + contentY, 40 * scale, 28 * scale);
        // 大眼睛凸起
        graphics.fillStyle(color, 1);
        graphics.fillCircle(-14 * scale, -25 * scale + contentY, 14 * scale);
        graphics.fillCircle(14 * scale, -25 * scale + contentY, 14 * scale);
        // 眼白
        graphics.fillStyle(0xFFFFFF, 1);
        graphics.fillCircle(-14 * scale, -25 * scale + contentY, 10 * scale);
        graphics.fillCircle(14 * scale, -25 * scale + contentY, 10 * scale);
        // 瞳孔
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(-14 * scale, -24 * scale + contentY, 5 * scale);
        graphics.fillCircle(14 * scale, -24 * scale + contentY, 5 * scale);
        // 眼睛高光
        graphics.fillStyle(0xFFFFFF, 1);
        graphics.fillCircle(-16 * scale, -27 * scale + contentY, 3 * scale);
        graphics.fillCircle(12 * scale, -27 * scale + contentY, 3 * scale);
        // 腮红
        graphics.fillStyle(0xFFCDD2, 0.5);
        graphics.fillCircle(-22 * scale, -8 * scale + contentY, 6 * scale);
        graphics.fillCircle(22 * scale, -8 * scale + contentY, 6 * scale);
        // 可爱的微笑
        graphics.lineStyle(2 * scale, 0x2E7D32, 1);
        graphics.beginPath();
        graphics.arc(0, -5 * scale + contentY, 15 * scale, 0.2, Math.PI - 0.2);
        graphics.strokePath();
        // 前脚
        graphics.fillStyle(color, 1);
        graphics.fillEllipse(-28 * scale, 25 * scale + contentY, 12 * scale, 8 * scale);
        graphics.fillEllipse(28 * scale, 25 * scale + contentY, 12 * scale, 8 * scale);
        break;

      // ===== 日出日落 =====
      case 'sunrise':
        // 地平线 - 草地
        graphics.fillStyle(0x66BB6A, 1);
        graphics.fillRect(-40 * scale, 18 * scale + contentY, 80 * scale, 25 * scale);
        // 小花装饰
        graphics.fillStyle(0xFFEB3B, 1);
        graphics.fillCircle(-28 * scale, 22 * scale + contentY, 3 * scale);
        graphics.fillCircle(-15 * scale, 25 * scale + contentY, 2 * scale);
        graphics.fillCircle(20 * scale, 23 * scale + contentY, 3 * scale);
        // 天空渐变 - 粉红晨曦
        graphics.fillGradientStyle(0xFFE0B2, 0xFFE0B2, color, color, 1);
        graphics.fillRect(-40 * scale, -28 * scale + contentY, 80 * scale, 46 * scale);
        // 可爱的太阳 - 刚升起
        graphics.fillStyle(0xFFEB3B, 1);
        graphics.fillCircle(0, 18 * scale + contentY, 25 * scale);
        // 太阳高光
        graphics.fillStyle(0xFFF9C4, 0.6);
        graphics.fillCircle(-8 * scale, 12 * scale + contentY, 10 * scale);
        // 光芒
        graphics.fillStyle(0xFFD54F, 0.7);
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI - Math.PI;
          graphics.fillTriangle(
            Math.cos(angle) * 28 * scale, 18 * scale + Math.sin(angle) * 28 * scale + contentY,
            Math.cos(angle - 0.12) * 42 * scale, 18 * scale + Math.sin(angle - 0.12) * 42 * scale + contentY,
            Math.cos(angle + 0.12) * 42 * scale, 18 * scale + Math.sin(angle + 0.12) * 42 * scale + contentY
          );
        }
        // 小云朵
        graphics.fillStyle(0xFFFFFF, 0.8);
        graphics.fillCircle(-25 * scale, -12 * scale + contentY, 8 * scale);
        graphics.fillCircle(-18 * scale, -15 * scale + contentY, 6 * scale);
        break;

      case 'sun':
        // 天空
        graphics.fillStyle(0x64B5F6, 1);
        graphics.fillRect(-40 * scale, -28 * scale + contentY, 80 * scale, 70 * scale);
        // 白云
        graphics.fillStyle(0xFFFFFF, 0.9);
        graphics.fillCircle(-25 * scale, 15 * scale + contentY, 10 * scale);
        graphics.fillCircle(-15 * scale, 12 * scale + contentY, 12 * scale);
        graphics.fillCircle(-5 * scale, 15 * scale + contentY, 8 * scale);
        graphics.fillCircle(22 * scale, 20 * scale + contentY, 8 * scale);
        graphics.fillCircle(30 * scale, 18 * scale + contentY, 10 * scale);
        // 可爱的太阳
        graphics.fillStyle(color, 1);
        graphics.fillCircle(0, -5 * scale + contentY, 28 * scale);
        // 光芒 - 更精致
        graphics.fillStyle(0xFFB300, 1);
        for (let i = 0; i < 10; i++) {
          const angle = (i / 10) * Math.PI * 2;
          const outerR = 42 * scale;
          graphics.fillTriangle(
            0, -5 * scale + contentY,
            Math.cos(angle - 0.15) * outerR, Math.sin(angle - 0.15) * outerR - 5 * scale + contentY,
            Math.cos(angle + 0.15) * outerR, Math.sin(angle + 0.15) * outerR - 5 * scale + contentY
          );
        }
        // 太阳高光
        graphics.fillStyle(0xFFF9C4, 0.5);
        graphics.fillCircle(-10 * scale, -12 * scale + contentY, 12 * scale);
        // 笑脸
        graphics.fillStyle(0x5D4037, 1);
        graphics.fillCircle(-10 * scale, -10 * scale + contentY, 4 * scale);
        graphics.fillCircle(10 * scale, -10 * scale + contentY, 4 * scale);
        // 腮红
        graphics.fillStyle(0xFFCDD2, 0.6);
        graphics.fillCircle(-18 * scale, 0 + contentY, 5 * scale);
        graphics.fillCircle(18 * scale, 0 + contentY, 5 * scale);
        // 微笑
        graphics.lineStyle(2.5 * scale, 0x5D4037, 1);
        graphics.beginPath();
        graphics.arc(0, 2 * scale + contentY, 10 * scale, 0.3, Math.PI - 0.3);
        graphics.strokePath();
        break;

      case 'sunset':
        // 地面剪影
        graphics.fillStyle(0x37474F, 1);
        graphics.fillRect(-40 * scale, 20 * scale + contentY, 80 * scale, 22 * scale);
        // 小山剪影
        graphics.fillTriangle(-20 * scale, 20 * scale + contentY, 0, 5 * scale + contentY, 20 * scale, 20 * scale + contentY);
        // 天空 - 橙红渐变
        graphics.fillGradientStyle(0xFFCC80, 0xFFCC80, color, color, 1);
        graphics.fillRect(-40 * scale, -28 * scale + contentY, 80 * scale, 48 * scale);
        // 落日
        graphics.fillStyle(0xFFAB40, 1);
        graphics.fillCircle(0, 20 * scale + contentY, 22 * scale);
        graphics.fillStyle(color, 0.8);
        graphics.fillCircle(0, 20 * scale + contentY, 18 * scale);
        // 高光
        graphics.fillStyle(0xFFE0B2, 0.5);
        graphics.fillCircle(-6 * scale, 14 * scale + contentY, 8 * scale);
        // 晚霞云彩
        graphics.fillStyle(0xFF8A65, 0.7);
        graphics.fillEllipse(-20 * scale, -10 * scale + contentY, 25 * scale, 8 * scale);
        graphics.fillEllipse(18 * scale, -5 * scale + contentY, 20 * scale, 6 * scale);
        // 树的剪影
        graphics.fillStyle(0x263238, 1);
        graphics.fillRect(28 * scale, 5 * scale + contentY, 4 * scale, 18 * scale);
        graphics.fillTriangle(22 * scale, 8 * scale + contentY, 30 * scale, -10 * scale + contentY, 38 * scale, 8 * scale + contentY);
        break;

      // ===== 房子建造 =====
      case 'foundation':
        // 天空
        graphics.fillStyle(0x87CEEB, 1);
        graphics.fillRect(-40 * scale, -30 * scale + contentY, 80 * scale, 55 * scale);
        // 地面
        graphics.fillStyle(0x90EE90, 1);
        graphics.fillRect(-40 * scale, 20 * scale + contentY, 80 * scale, 25 * scale);
        // 地基坑
        graphics.fillStyle(0x654321, 1);
        graphics.fillRect(-32 * scale, 15 * scale + contentY, 64 * scale, 15 * scale);
        // 水泥地基
        graphics.fillStyle(color, 1);
        graphics.fillRect(-30 * scale, 10 * scale + contentY, 60 * scale, 12 * scale);
        // 地基纹理
        graphics.lineStyle(2 * scale, 0x606060, 0.5);
        graphics.lineBetween(-30 * scale, 16 * scale + contentY, 30 * scale, 16 * scale + contentY);
        // 砖块堆
        graphics.fillStyle(0xCD853F, 1);
        graphics.fillRect(-35 * scale, -5 * scale + contentY, 20 * scale, 15 * scale);
        graphics.fillStyle(0xD2691E, 1);
        graphics.fillRect(-33 * scale, -3 * scale + contentY, 8 * scale, 6 * scale);
        graphics.fillRect(-23 * scale, -3 * scale + contentY, 8 * scale, 6 * scale);
        graphics.fillRect(-28 * scale, 5 * scale + contentY, 8 * scale, 6 * scale);
        // 铲子
        graphics.fillStyle(0x8B4513, 1);
        graphics.fillRect(25 * scale, -20 * scale + contentY, 4 * scale, 35 * scale);
        graphics.fillStyle(0x696969, 1);
        graphics.fillRoundedRect(20 * scale, 10 * scale + contentY, 14 * scale, 12 * scale, 3);
        break;

      case 'walls':
        // 天空
        graphics.fillStyle(0x87CEEB, 1);
        graphics.fillRect(-40 * scale, -30 * scale + contentY, 80 * scale, 55 * scale);
        // 地面
        graphics.fillStyle(0x90EE90, 1);
        graphics.fillRect(-40 * scale, 22 * scale + contentY, 80 * scale, 23 * scale);
        // 地基
        graphics.fillStyle(0x808080, 1);
        graphics.fillRect(-32 * scale, 18 * scale + contentY, 64 * scale, 8 * scale);
        // 砖墙
        graphics.fillStyle(color, 1);
        graphics.fillRect(-28 * scale, -15 * scale + contentY, 56 * scale, 35 * scale);
        // 砖缝
        graphics.lineStyle(1.5 * scale, 0x8B4513, 0.6);
        for (let row = 0; row < 5; row++) {
          const y = -12 + row * 7;
          graphics.lineBetween(-28 * scale, y * scale + contentY, 28 * scale, y * scale + contentY);
          for (let col = 0; col < 8; col++) {
            const x = -28 + col * 7 + (row % 2) * 3.5;
            graphics.lineBetween(x * scale, (y - 7) * scale + contentY, x * scale, y * scale + contentY);
          }
        }
        // 窗户框
        graphics.fillStyle(0x4169E1, 0.5);
        graphics.fillRect(-18 * scale, -8 * scale + contentY, 16 * scale, 14 * scale);
        graphics.fillRect(2 * scale, -8 * scale + contentY, 16 * scale, 14 * scale);
        // 窗框
        graphics.lineStyle(2 * scale, 0xFFFFFF, 1);
        graphics.strokeRect(-18 * scale, -8 * scale + contentY, 16 * scale, 14 * scale);
        graphics.strokeRect(2 * scale, -8 * scale + contentY, 16 * scale, 14 * scale);
        break;

      case 'roof':
        // 天空
        graphics.fillStyle(0x87CEEB, 1);
        graphics.fillRect(-40 * scale, -35 * scale + contentY, 80 * scale, 55 * scale);
        // 地面
        graphics.fillStyle(0x90EE90, 1);
        graphics.fillRect(-40 * scale, 18 * scale + contentY, 80 * scale, 27 * scale);
        // 墙壁（简化）
        graphics.fillStyle(0xCD853F, 1);
        graphics.fillRect(-28 * scale, -5 * scale + contentY, 56 * scale, 25 * scale);
        // 红瓦屋顶
        graphics.fillStyle(color, 1);
        graphics.fillTriangle(-35 * scale, -5 * scale + contentY, 0, -35 * scale + contentY, 35 * scale, -5 * scale + contentY);
        // 屋顶瓦片纹理
        graphics.lineStyle(2 * scale, 0x8B0000, 0.5);
        for (let i = 0; i < 4; i++) {
          const y = -30 + i * 7;
          graphics.beginPath();
          graphics.moveTo((-25 + i * 8) * scale, y * scale + contentY);
          graphics.lineTo((25 - i * 8) * scale, y * scale + contentY);
          graphics.strokePath();
        }
        // 窗户
        graphics.fillStyle(0x87CEEB, 1);
        graphics.fillRect(-12 * scale, 0 + contentY, 10 * scale, 12 * scale);
        graphics.fillRect(2 * scale, 0 + contentY, 10 * scale, 12 * scale);
        // 起重机
        graphics.fillStyle(0xFFD700, 1);
        graphics.fillRect(30 * scale, -30 * scale + contentY, 4 * scale, 50 * scale);
        graphics.fillRect(20 * scale, -30 * scale + contentY, 20 * scale, 4 * scale);
        break;

      case 'house':
        // 蓝天白云
        graphics.fillStyle(0x87CEEB, 1);
        graphics.fillRect(-40 * scale, -35 * scale + contentY, 80 * scale, 55 * scale);
        // 云朵
        graphics.fillStyle(0xFFFFFF, 0.9);
        graphics.fillCircle(-28 * scale, -28 * scale + contentY, 8 * scale);
        graphics.fillCircle(-20 * scale, -30 * scale + contentY, 10 * scale);
        graphics.fillCircle(-12 * scale, -28 * scale + contentY, 7 * scale);
        // 草地
        graphics.fillStyle(0x90EE90, 1);
        graphics.fillRect(-40 * scale, 18 * scale + contentY, 80 * scale, 27 * scale);
        // 房子主体
        graphics.fillStyle(0xFFE4B5, 1);
        graphics.fillRect(-25 * scale, -5 * scale + contentY, 50 * scale, 25 * scale);
        // 红瓦屋顶
        graphics.fillStyle(color, 1);
        graphics.fillTriangle(-32 * scale, -5 * scale + contentY, 0, -32 * scale + contentY, 32 * scale, -5 * scale + contentY);
        // 烟囱
        graphics.fillStyle(0xCD853F, 1);
        graphics.fillRect(15 * scale, -28 * scale + contentY, 10 * scale, 15 * scale);
        // 烟
        graphics.fillStyle(0xE0E0E0, 0.7);
        graphics.fillCircle(20 * scale, -32 * scale + contentY, 5 * scale);
        graphics.fillCircle(22 * scale, -38 * scale + contentY, 4 * scale);
        graphics.fillCircle(20 * scale, -43 * scale + contentY, 3 * scale);
        // 门
        graphics.fillStyle(0x8B4513, 1);
        graphics.fillRoundedRect(-8 * scale, 2 * scale + contentY, 16 * scale, 20 * scale, 3);
        // 门把手
        graphics.fillStyle(0xFFD700, 1);
        graphics.fillCircle(5 * scale, 12 * scale + contentY, 2 * scale);
        // 窗户
        graphics.fillStyle(0x87CEEB, 1);
        graphics.fillRect(-22 * scale, 0 + contentY, 10 * scale, 10 * scale);
        graphics.fillRect(12 * scale, 0 + contentY, 10 * scale, 10 * scale);
        // 窗框
        graphics.lineStyle(2 * scale, 0xFFFFFF, 1);
        graphics.strokeRect(-22 * scale, 0 + contentY, 10 * scale, 10 * scale);
        graphics.strokeRect(12 * scale, 0 + contentY, 10 * scale, 10 * scale);
        graphics.lineBetween(-17 * scale, 0 + contentY, -17 * scale, 10 * scale + contentY);
        graphics.lineBetween(17 * scale, 0 + contentY, 17 * scale, 10 * scale + contentY);
        // 小花
        graphics.fillStyle(0xFF69B4, 1);
        graphics.fillCircle(-30 * scale, 22 * scale + contentY, 4 * scale);
        graphics.fillCircle(30 * scale, 24 * scale + contentY, 3 * scale);
        break;

      // ===== 月相变化 =====
      case 'new_moon':
        // 深蓝夜空
        graphics.fillStyle(0x0a1628, 1);
        graphics.fillRect(-40 * scale, -35 * scale + contentY, 80 * scale, 80 * scale);
        // 星星
        graphics.fillStyle(0xFFFFFF, 1);
        const starPos1 = [[-30, -25], [-20, -10], [-10, -28], [5, -20], [15, -30], [25, -15], [30, -25], [-25, 5], [20, 10]];
        for (const [sx, sy] of starPos1) {
          graphics.fillCircle(sx * scale, sy * scale + contentY, 2 * scale);
        }
        // 新月 - 几乎看不见
        graphics.fillStyle(0x1a2638, 1);
        graphics.fillCircle(0, 0 + contentY, 28 * scale);
        // 月亮轮廓微光
        graphics.lineStyle(2 * scale, 0x333344, 0.5);
        graphics.strokeCircle(0, 0 + contentY, 28 * scale);
        break;

      case 'crescent':
        // 深蓝夜空
        graphics.fillStyle(0x0a1628, 1);
        graphics.fillRect(-40 * scale, -35 * scale + contentY, 80 * scale, 80 * scale);
        // 星星
        graphics.fillStyle(0xFFFFFF, 1);
        const starPos2 = [[-30, -25], [-20, 15], [-15, -15], [25, -28], [30, 5], [35, -15]];
        for (const [sx, sy] of starPos2) {
          graphics.fillCircle(sx * scale, sy * scale + contentY, 2 * scale);
        }
        // 月牙
        graphics.fillStyle(color, 1);
        graphics.fillCircle(0, 0 + contentY, 26 * scale);
        // 用深色圆遮盖形成月牙
        graphics.fillStyle(0x0a1628, 1);
        graphics.fillCircle(12 * scale, 0 + contentY, 24 * scale);
        // 月亮高光
        graphics.fillStyle(0xFFFFFF, 0.2);
        graphics.fillCircle(-15 * scale, -8 * scale + contentY, 8 * scale);
        // 可爱的睡眼
        graphics.fillStyle(0x555555, 0.7);
        graphics.lineStyle(2 * scale, 0x444444, 1);
        graphics.beginPath();
        graphics.arc(-8 * scale, -5 * scale + contentY, 4 * scale, 0.2, Math.PI - 0.2);
        graphics.strokePath();
        break;

      case 'half':
        // 深蓝夜空
        graphics.fillStyle(0x0a1628, 1);
        graphics.fillRect(-40 * scale, -35 * scale + contentY, 80 * scale, 80 * scale);
        // 星星
        graphics.fillStyle(0xFFFFFF, 1);
        const starPos3 = [[-35, -20], [-28, 10], [30, -25], [35, 5], [25, 20]];
        for (const [sx, sy] of starPos3) {
          graphics.fillCircle(sx * scale, sy * scale + contentY, 2 * scale);
        }
        // 半月
        graphics.fillStyle(color, 1);
        graphics.fillCircle(0, 0 + contentY, 26 * scale);
        // 用深色遮盖右半边
        graphics.fillStyle(0x0a1628, 1);
        graphics.fillRect(0, -28 * scale + contentY, 30 * scale, 56 * scale);
        // 月亮高光
        graphics.fillStyle(0xFFFFFF, 0.2);
        graphics.fillCircle(-12 * scale, -10 * scale + contentY, 10 * scale);
        // 月球环形山
        graphics.fillStyle(0x999999, 0.3);
        graphics.fillCircle(-8 * scale, 8 * scale + contentY, 5 * scale);
        graphics.fillCircle(-18 * scale, -2 * scale + contentY, 4 * scale);
        break;

      case 'full_moon':
        // 深蓝夜空
        graphics.fillStyle(0x0a1628, 1);
        graphics.fillRect(-40 * scale, -35 * scale + contentY, 80 * scale, 80 * scale);
        // 星星
        graphics.fillStyle(0xFFFFFF, 1);
        const starPos4 = [[-35, -28], [-30, 15], [-20, -20], [28, -25], [35, 10], [30, 25], [-35, 25]];
        for (const [sx, sy] of starPos4) {
          graphics.fillCircle(sx * scale, sy * scale + contentY, 2 * scale);
        }
        // 满月
        graphics.fillStyle(color, 1);
        graphics.fillCircle(0, 0 + contentY, 30 * scale);
        // 月亮高光
        graphics.fillStyle(0xFFFFFF, 0.3);
        graphics.fillCircle(-10 * scale, -10 * scale + contentY, 12 * scale);
        // 月球环形山
        graphics.fillStyle(0xC0C0C0, 0.4);
        graphics.fillCircle(-5 * scale, 10 * scale + contentY, 6 * scale);
        graphics.fillCircle(12 * scale, -5 * scale + contentY, 5 * scale);
        graphics.fillCircle(-15 * scale, 0 + contentY, 4 * scale);
        graphics.fillCircle(5 * scale, -12 * scale + contentY, 3 * scale);
        // 兔子剪影
        graphics.fillStyle(0xAAAAAA, 0.3);
        graphics.fillEllipse(5 * scale, 5 * scale + contentY, 12 * scale, 10 * scale);
        graphics.fillCircle(0, -2 * scale + contentY, 6 * scale);
        graphics.fillEllipse(-2 * scale, -12 * scale + contentY, 3 * scale, 8 * scale);
        graphics.fillEllipse(4 * scale, -10 * scale + contentY, 3 * scale, 7 * scale);
        break;

      // ===== 蛋糕制作 =====
      case 'ingredients':
        // 桌面背景
        graphics.fillStyle(0xDEB887, 1);
        graphics.fillRect(-40 * scale, 20 * scale + contentY, 80 * scale, 25 * scale);
        // 可爱的碗
        graphics.fillStyle(0x87CEEB, 1);
        graphics.fillEllipse(0, 15 * scale + contentY, 50 * scale, 25 * scale);
        graphics.fillStyle(0xADD8E6, 1);
        graphics.fillEllipse(0, 10 * scale + contentY, 42 * scale, 18 * scale);
        // 碗里的面粉
        graphics.fillStyle(0xFFFAF0, 1);
        graphics.fillEllipse(0, 8 * scale + contentY, 36 * scale, 12 * scale);
        // 鸡蛋
        graphics.fillStyle(0xFFFACD, 1);
        graphics.fillEllipse(-25 * scale, -15 * scale + contentY, 18 * scale, 22 * scale);
        graphics.fillStyle(0xFFFFFF, 0.4);
        graphics.fillEllipse(-28 * scale, -20 * scale + contentY, 6 * scale, 8 * scale);
        // 黄油块
        graphics.fillStyle(0xFFD700, 1);
        graphics.fillRoundedRect(15 * scale, -25 * scale + contentY, 22 * scale, 18 * scale, 4);
        graphics.fillStyle(0xFFF8DC, 1);
        graphics.fillRoundedRect(17 * scale, -23 * scale + contentY, 18 * scale, 6 * scale, 2);
        // 牛奶瓶
        graphics.fillStyle(0xFFFFFF, 1);
        graphics.fillRoundedRect(-8 * scale, -35 * scale + contentY, 16 * scale, 25 * scale, 4);
        graphics.fillStyle(0x87CEEB, 1);
        graphics.fillRoundedRect(-6 * scale, -38 * scale + contentY, 12 * scale, 6 * scale, 3);
        break;

      case 'baking':
        // 烤箱外框
        graphics.fillStyle(0x696969, 1);
        graphics.fillRoundedRect(-38 * scale, -30 * scale + contentY, 76 * scale, 65 * scale, 8);
        // 烤箱玻璃门
        graphics.fillStyle(0x4A4A4A, 1);
        graphics.fillRoundedRect(-32 * scale, -24 * scale + contentY, 64 * scale, 45 * scale, 5);
        // 烤箱内部 - 橙红色发光
        graphics.fillStyle(0xFF6B35, 0.8);
        graphics.fillRoundedRect(-28 * scale, -20 * scale + contentY, 56 * scale, 37 * scale, 4);
        // 烤箱里的蛋糕模具
        graphics.fillStyle(0xCD853F, 1);
        graphics.fillEllipse(0, 5 * scale + contentY, 35 * scale, 15 * scale);
        // 膨胀的蛋糕
        graphics.fillStyle(color, 1);
        graphics.fillEllipse(0, -5 * scale + contentY, 30 * scale, 18 * scale);
        // 蛋糕高光
        graphics.fillStyle(0xFFFFFF, 0.3);
        graphics.fillEllipse(-8 * scale, -10 * scale + contentY, 12 * scale, 8 * scale);
        // 温度指示灯
        graphics.fillStyle(0xFF0000, 1);
        graphics.fillCircle(28 * scale, -28 * scale + contentY, 5 * scale);
        // 热气
        graphics.lineStyle(2 * scale, 0xFFFFFF, 0.5);
        for (let i = 0; i < 3; i++) {
          graphics.beginPath();
          graphics.moveTo((-15 + i * 15) * scale, -35 * scale + contentY);
          graphics.lineTo((-15 + i * 15) * scale, -48 * scale + contentY);
          graphics.strokePath();
        }
        break;

      case 'cake':
        // 蛋糕盘子
        graphics.fillStyle(0xFFFFFF, 1);
        graphics.fillEllipse(0, 32 * scale + contentY, 55 * scale, 12 * scale);
        // 第一层蛋糕
        graphics.fillStyle(0xFFB6C1, 1);
        graphics.fillRoundedRect(-30 * scale, 10 * scale + contentY, 60 * scale, 25 * scale, 5);
        // 第二层蛋糕
        graphics.fillStyle(color, 1);
        graphics.fillRoundedRect(-22 * scale, -12 * scale + contentY, 44 * scale, 25 * scale, 5);
        // 奶油装饰 - 波浪边
        graphics.fillStyle(0xFFFFFF, 1);
        for (let i = 0; i < 7; i++) {
          graphics.fillCircle((-28 + i * 10) * scale, 10 * scale + contentY, 6 * scale);
        }
        for (let i = 0; i < 5; i++) {
          graphics.fillCircle((-20 + i * 10) * scale, -12 * scale + contentY, 5 * scale);
        }
        // 蜡烛
        graphics.fillStyle(0xFF69B4, 1);
        graphics.fillRect(-3 * scale, -35 * scale + contentY, 6 * scale, 25 * scale);
        // 火焰
        graphics.fillStyle(0xFFD700, 1);
        graphics.fillEllipse(0, -42 * scale + contentY, 8 * scale, 12 * scale);
        graphics.fillStyle(0xFF4500, 1);
        graphics.fillEllipse(0, -40 * scale + contentY, 4 * scale, 8 * scale);
        // 樱桃装饰
        graphics.fillStyle(0xFF0000, 1);
        graphics.fillCircle(-15 * scale, -5 * scale + contentY, 6 * scale);
        graphics.fillCircle(15 * scale, -5 * scale + contentY, 6 * scale);
        graphics.fillCircle(0, 15 * scale + contentY, 6 * scale);
        // 樱桃高光
        graphics.fillStyle(0xFFFFFF, 0.5);
        graphics.fillCircle(-17 * scale, -7 * scale + contentY, 2 * scale);
        graphics.fillCircle(13 * scale, -7 * scale + contentY, 2 * scale);
        break;

      // ===== 树木生长 =====
      case 'seed2':
        // 地面/土壤
        graphics.fillStyle(0x8B4513, 1);
        graphics.fillRect(-40 * scale, 15 * scale + contentY, 80 * scale, 30 * scale);
        graphics.fillStyle(0x654321, 1);
        graphics.fillRect(-40 * scale, 15 * scale + contentY, 80 * scale, 8 * scale);
        // 土壤纹理
        graphics.fillStyle(0x5D3A1A, 0.5);
        for (let i = 0; i < 6; i++) {
          graphics.fillCircle((-30 + i * 12) * scale, 28 * scale + contentY, 4 * scale);
        }
        // 可爱的种子 - 在土里
        graphics.fillStyle(color, 1);
        graphics.fillEllipse(0, 5 * scale + contentY, 20 * scale, 28 * scale);
        // 种子高光
        graphics.fillStyle(0xFFFFFF, 0.3);
        graphics.fillEllipse(-5 * scale, -2 * scale + contentY, 6 * scale, 10 * scale);
        // 种子闭眼
        graphics.lineStyle(2 * scale, 0x5a3825, 1);
        graphics.beginPath();
        graphics.arc(-4 * scale, 2 * scale + contentY, 3 * scale, 0.2, Math.PI - 0.2);
        graphics.strokePath();
        graphics.beginPath();
        graphics.arc(4 * scale, 2 * scale + contentY, 3 * scale, 0.2, Math.PI - 0.2);
        graphics.strokePath();
        // 太阳
        graphics.fillStyle(0xFFD700, 1);
        graphics.fillCircle(28 * scale, -28 * scale + contentY, 15 * scale);
        // 水滴
        graphics.fillStyle(0x4FC3F7, 1);
        graphics.fillCircle(-25 * scale, -20 * scale + contentY, 6 * scale);
        graphics.fillTriangle(-31 * scale, -20 * scale + contentY, -19 * scale, -20 * scale + contentY, -25 * scale, -30 * scale + contentY);
        break;

      case 'sapling':
        // 地面
        graphics.fillStyle(0x8B4513, 1);
        graphics.fillRect(-40 * scale, 22 * scale + contentY, 80 * scale, 25 * scale);
        // 土堆
        graphics.fillStyle(0x654321, 1);
        graphics.fillEllipse(0, 25 * scale + contentY, 40 * scale, 15 * scale);
        // 茎
        graphics.fillStyle(0x7CB342, 1);
        graphics.fillRect(-3 * scale, -5 * scale + contentY, 6 * scale, 35 * scale);
        // 两片嫩叶
        graphics.fillStyle(color, 1);
        graphics.fillEllipse(-18 * scale, -15 * scale + contentY, 22 * scale, 14 * scale);
        graphics.fillEllipse(18 * scale, -10 * scale + contentY, 22 * scale, 14 * scale);
        // 叶脉
        graphics.lineStyle(1.5 * scale, 0x558B2F, 0.6);
        graphics.lineBetween(-26 * scale, -15 * scale + contentY, -10 * scale, -15 * scale + contentY);
        graphics.lineBetween(10 * scale, -10 * scale + contentY, 26 * scale, -10 * scale + contentY);
        // 顶芽
        graphics.fillStyle(0xAED581, 1);
        graphics.fillEllipse(0, -28 * scale + contentY, 10 * scale, 16 * scale);
        // 叶子高光
        graphics.fillStyle(0xFFFFFF, 0.25);
        graphics.fillEllipse(-18 * scale, -18 * scale + contentY, 10 * scale, 5 * scale);
        graphics.fillEllipse(18 * scale, -13 * scale + contentY, 10 * scale, 5 * scale);
        break;

      case 'small_tree':
        // 草地
        graphics.fillStyle(0x81C784, 1);
        graphics.fillRect(-40 * scale, 25 * scale + contentY, 80 * scale, 20 * scale);
        // 树干
        graphics.fillStyle(0x795548, 1);
        graphics.fillRect(-6 * scale, 0 + contentY, 12 * scale, 30 * scale);
        // 树干纹理
        graphics.lineStyle(1.5 * scale, 0x5D4037, 0.5);
        graphics.lineBetween(-4 * scale, 5 * scale + contentY, -2 * scale, 25 * scale + contentY);
        graphics.lineBetween(3 * scale, 8 * scale + contentY, 4 * scale, 22 * scale + contentY);
        // 小树冠
        graphics.fillStyle(color, 1);
        graphics.fillCircle(0, -18 * scale + contentY, 30 * scale);
        // 树冠层次
        graphics.fillStyle(0x4CAF50, 1);
        graphics.fillCircle(-12 * scale, -10 * scale + contentY, 18 * scale);
        graphics.fillCircle(12 * scale, -12 * scale + contentY, 16 * scale);
        // 树叶高光
        graphics.fillStyle(0xA5D6A7, 0.5);
        graphics.fillCircle(-8 * scale, -25 * scale + contentY, 10 * scale);
        // 小苹果
        graphics.fillStyle(0xFF6B6B, 1);
        graphics.fillCircle(15 * scale, -8 * scale + contentY, 6 * scale);
        break;

      case 'big_tree':
        // 草地
        graphics.fillStyle(0x81C784, 1);
        graphics.fillRect(-40 * scale, 28 * scale + contentY, 80 * scale, 18 * scale);
        // 粗树干
        graphics.fillStyle(0x795548, 1);
        graphics.fillRect(-10 * scale, 0 + contentY, 20 * scale, 35 * scale);
        // 树枝
        graphics.fillStyle(0x6D4C41, 1);
        graphics.fillRect(-30 * scale, -5 * scale + contentY, 25 * scale, 6 * scale);
        graphics.fillRect(5 * scale, -8 * scale + contentY, 28 * scale, 6 * scale);
        // 树干纹理
        graphics.lineStyle(2 * scale, 0x5D4037, 0.5);
        graphics.lineBetween(-6 * scale, 5 * scale + contentY, -4 * scale, 30 * scale + contentY);
        graphics.lineBetween(5 * scale, 8 * scale + contentY, 6 * scale, 28 * scale + contentY);
        // 大树冠
        graphics.fillStyle(color, 1);
        graphics.fillCircle(0, -22 * scale + contentY, 38 * scale);
        graphics.fillCircle(-22 * scale, -12 * scale + contentY, 22 * scale);
        graphics.fillCircle(22 * scale, -15 * scale + contentY, 24 * scale);
        // 树冠层次
        graphics.fillStyle(0x2E7D32, 1);
        graphics.fillCircle(-15 * scale, -28 * scale + contentY, 18 * scale);
        graphics.fillCircle(12 * scale, -30 * scale + contentY, 16 * scale);
        // 苹果
        graphics.fillStyle(0xFF0000, 1);
        graphics.fillCircle(-20 * scale, -15 * scale + contentY, 6 * scale);
        graphics.fillCircle(18 * scale, -20 * scale + contentY, 6 * scale);
        graphics.fillCircle(5 * scale, -8 * scale + contentY, 5 * scale);
        // 鸟巢
        graphics.fillStyle(0xA1887F, 1);
        graphics.fillEllipse(-25 * scale, -5 * scale + contentY, 14 * scale, 8 * scale);
        // 小鸟
        graphics.fillStyle(0xFFEB3B, 1);
        graphics.fillCircle(-25 * scale, -12 * scale + contentY, 6 * scale);
        graphics.fillStyle(0xFF9800, 1);
        graphics.fillTriangle(-20 * scale, -12 * scale + contentY, -17 * scale, -10 * scale + contentY, -20 * scale, -10 * scale + contentY);
        break;

      // ===== 雪人 =====
      case 'snow':
        // 冬天蓝天
        graphics.fillStyle(0x87CEEB, 1);
        graphics.fillRect(-40 * scale, -30 * scale + contentY, 80 * scale, 75 * scale);
        // 雪地
        graphics.fillStyle(0xFFFFFF, 1);
        graphics.fillRect(-40 * scale, 25 * scale + contentY, 80 * scale, 20 * scale);
        graphics.fillStyle(0xE8E8E8, 1);
        graphics.fillEllipse(-20 * scale, 28 * scale + contentY, 25 * scale, 10 * scale);
        graphics.fillEllipse(20 * scale, 30 * scale + contentY, 20 * scale, 8 * scale);
        // 飘落的雪花 - 六角形
        graphics.fillStyle(color, 1);
        for (let i = 0; i < 8; i++) {
          const sx = (-35 + i * 10) * scale;
          const sy = (-25 + (i % 3) * 18) * scale + contentY;
          const size = (4 + i % 3) * scale;
          graphics.fillCircle(sx, sy, size);
          // 雪花装饰线
          graphics.lineStyle(1 * scale, color, 0.8);
          for (let j = 0; j < 6; j++) {
            const angle = (j / 6) * Math.PI * 2;
            graphics.lineBetween(sx, sy, sx + Math.cos(angle) * size * 1.5, sy + Math.sin(angle) * size * 1.5);
          }
        }
        // 白云
        graphics.fillStyle(0xFFFFFF, 0.8);
        graphics.fillCircle(-25 * scale, -25 * scale + contentY, 12 * scale);
        graphics.fillCircle(-12 * scale, -28 * scale + contentY, 10 * scale);
        graphics.fillCircle(25 * scale, -22 * scale + contentY, 14 * scale);
        break;

      case 'ball1':
        // 蓝天
        graphics.fillStyle(0x87CEEB, 1);
        graphics.fillRect(-40 * scale, -30 * scale + contentY, 80 * scale, 75 * scale);
        // 雪地
        graphics.fillStyle(0xFFFFFF, 1);
        graphics.fillRect(-40 * scale, 20 * scale + contentY, 80 * scale, 25 * scale);
        // 雪球
        graphics.fillStyle(color, 1);
        graphics.fillCircle(15 * scale, 12 * scale + contentY, 22 * scale);
        // 雪球阴影
        graphics.fillStyle(0xD0D0D0, 0.5);
        graphics.fillEllipse(15 * scale, 28 * scale + contentY, 25 * scale, 8 * scale);
        // 雪球高光
        graphics.fillStyle(0xFFFFFF, 0.6);
        graphics.fillCircle(8 * scale, 4 * scale + contentY, 8 * scale);
        // 可爱小朋友的手（简化）
        graphics.fillStyle(0xFFB6C1, 1);
        graphics.fillCircle(-12 * scale, 8 * scale + contentY, 10 * scale);
        graphics.fillStyle(0xFF69B4, 1);
        graphics.fillRoundedRect(-22 * scale, 0 + contentY, 15 * scale, 25 * scale, 5);
        // 飘落雪花
        graphics.fillStyle(0xFFFFFF, 0.8);
        graphics.fillCircle(-30 * scale, -15 * scale + contentY, 4 * scale);
        graphics.fillCircle(-5 * scale, -22 * scale + contentY, 3 * scale);
        graphics.fillCircle(28 * scale, -18 * scale + contentY, 5 * scale);
        break;

      case 'ball2':
        // 蓝天
        graphics.fillStyle(0x87CEEB, 1);
        graphics.fillRect(-40 * scale, -30 * scale + contentY, 80 * scale, 75 * scale);
        // 雪地
        graphics.fillStyle(0xFFFFFF, 1);
        graphics.fillRect(-40 * scale, 28 * scale + contentY, 80 * scale, 18 * scale);
        // 底部大雪球
        graphics.fillStyle(color, 1);
        graphics.fillCircle(0, 18 * scale + contentY, 25 * scale);
        // 顶部小雪球
        graphics.fillStyle(0xF5F5F5, 1);
        graphics.fillCircle(0, -12 * scale + contentY, 20 * scale);
        // 雪球高光
        graphics.fillStyle(0xFFFFFF, 0.6);
        graphics.fillCircle(-8 * scale, 10 * scale + contentY, 8 * scale);
        graphics.fillCircle(-6 * scale, -18 * scale + contentY, 6 * scale);
        // 阴影
        graphics.fillStyle(0xD0D0D0, 0.4);
        graphics.fillEllipse(0, 38 * scale + contentY, 30 * scale, 8 * scale);
        // 飘落雪花
        graphics.fillStyle(0xFFFFFF, 0.8);
        graphics.fillCircle(-32 * scale, -10 * scale + contentY, 4 * scale);
        graphics.fillCircle(28 * scale, -20 * scale + contentY, 3 * scale);
        break;

      case 'snowman':
        // 蓝天
        graphics.fillStyle(color, 1);
        graphics.fillRect(-40 * scale, -35 * scale + contentY, 80 * scale, 80 * scale);
        // 雪地
        graphics.fillStyle(0xFFFFFF, 1);
        graphics.fillRect(-40 * scale, 30 * scale + contentY, 80 * scale, 15 * scale);
        // 底部大雪球
        graphics.fillStyle(0xFFFFFF, 1);
        graphics.fillCircle(0, 22 * scale + contentY, 22 * scale);
        // 中间雪球
        graphics.fillStyle(0xFAFAFA, 1);
        graphics.fillCircle(0, -2 * scale + contentY, 17 * scale);
        // 顶部小雪球 - 头
        graphics.fillStyle(0xFFFFFF, 1);
        graphics.fillCircle(0, -22 * scale + contentY, 14 * scale);
        // 雪球高光
        graphics.fillStyle(0xFFFFFF, 0.8);
        graphics.fillCircle(-6 * scale, 15 * scale + contentY, 6 * scale);
        graphics.fillCircle(-5 * scale, -6 * scale + contentY, 5 * scale);
        graphics.fillCircle(-4 * scale, -26 * scale + contentY, 4 * scale);
        // 帽子
        graphics.fillStyle(0x2F4F4F, 1);
        graphics.fillRect(-12 * scale, -42 * scale + contentY, 24 * scale, 14 * scale);
        graphics.fillRect(-16 * scale, -30 * scale + contentY, 32 * scale, 5 * scale);
        // 眼睛
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(-5 * scale, -24 * scale + contentY, 3 * scale);
        graphics.fillCircle(5 * scale, -24 * scale + contentY, 3 * scale);
        // 胡萝卜鼻子
        graphics.fillStyle(0xFF6B00, 1);
        graphics.fillTriangle(0, -20 * scale + contentY, 0, -16 * scale + contentY, 12 * scale, -18 * scale + contentY);
        // 微笑
        graphics.lineStyle(2 * scale, 0x000000, 1);
        graphics.beginPath();
        graphics.arc(0, -16 * scale + contentY, 6 * scale, 0.3, Math.PI - 0.3);
        graphics.strokePath();
        // 围巾
        graphics.fillStyle(0xFF0000, 1);
        graphics.fillRect(-18 * scale, -10 * scale + contentY, 36 * scale, 6 * scale);
        graphics.fillRect(15 * scale, -10 * scale + contentY, 8 * scale, 20 * scale);
        // 纽扣
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(0, 2 * scale + contentY, 3 * scale);
        graphics.fillCircle(0, 12 * scale + contentY, 3 * scale);
        // 树枝手臂
        graphics.fillStyle(0x5D4037, 1);
        graphics.fillRect(-35 * scale, -5 * scale + contentY, 20 * scale, 4 * scale);
        graphics.fillRect(15 * scale, -3 * scale + contentY, 22 * scale, 4 * scale);
        break;

      // ===== 下雨彩虹 =====
      case 'cloud':
        // 深色天空
        graphics.fillStyle(0x546E7A, 1);
        graphics.fillRect(-40 * scale, -28 * scale + contentY, 80 * scale, 70 * scale);
        // 乌云 - 层次感
        graphics.fillStyle(0x455A64, 1);
        graphics.fillCircle(-18 * scale, -5 * scale + contentY, 22 * scale);
        graphics.fillCircle(18 * scale, -3 * scale + contentY, 24 * scale);
        graphics.fillCircle(0, -15 * scale + contentY, 28 * scale);
        graphics.fillStyle(color, 1);
        graphics.fillCircle(-28 * scale, 2 * scale + contentY, 16 * scale);
        graphics.fillCircle(28 * scale, 0 + contentY, 18 * scale);
        graphics.fillCircle(0, -8 * scale + contentY, 22 * scale);
        // 闪电
        graphics.fillStyle(0xFFEB3B, 1);
        graphics.beginPath();
        graphics.moveTo(-2 * scale, 12 * scale + contentY);
        graphics.lineTo(-10 * scale, 25 * scale + contentY);
        graphics.lineTo(-2 * scale, 22 * scale + contentY);
        graphics.lineTo(-8 * scale, 38 * scale + contentY);
        graphics.lineTo(4 * scale, 20 * scale + contentY);
        graphics.lineTo(-2 * scale, 24 * scale + contentY);
        graphics.lineTo(6 * scale, 12 * scale + contentY);
        graphics.closePath();
        graphics.fillPath();
        // 闪电高光
        graphics.fillStyle(0xFFF9C4, 0.6);
        graphics.fillTriangle(-4 * scale, 15 * scale + contentY, -6 * scale, 22 * scale + contentY, 0, 18 * scale + contentY);
        break;

      case 'rain':
        // 灰色天空
        graphics.fillStyle(0x78909C, 1);
        graphics.fillRect(-40 * scale, -28 * scale + contentY, 80 * scale, 70 * scale);
        // 雨云
        graphics.fillStyle(0x607D8B, 1);
        graphics.fillCircle(-15 * scale, -18 * scale + contentY, 20 * scale);
        graphics.fillCircle(15 * scale, -16 * scale + contentY, 22 * scale);
        graphics.fillCircle(0, -25 * scale + contentY, 24 * scale);
        graphics.fillCircle(-28 * scale, -12 * scale + contentY, 14 * scale);
        graphics.fillCircle(28 * scale, -10 * scale + contentY, 15 * scale);
        // 雨滴 - 可爱的水滴形状
        graphics.fillStyle(color, 1);
        for (let i = 0; i < 6; i++) {
          const rx = -28 * scale + i * 11 * scale;
          const ry = 5 * scale + (i % 2) * 15 * scale + contentY;
          // 水滴形状
          graphics.fillCircle(rx, ry + 4 * scale, 5 * scale);
          graphics.fillTriangle(rx - 5 * scale, ry + 4 * scale, rx + 5 * scale, ry + 4 * scale, rx, ry - 6 * scale);
        }
        // 水花
        graphics.fillStyle(0x90CAF9, 0.6);
        graphics.fillCircle(-20 * scale, 32 * scale + contentY, 4 * scale);
        graphics.fillCircle(15 * scale, 35 * scale + contentY, 3 * scale);
        break;

      case 'rainbow':
        // 蓝天
        graphics.fillStyle(0x64B5F6, 1);
        graphics.fillRect(-40 * scale, -28 * scale + contentY, 80 * scale, 70 * scale);
        // 草地
        graphics.fillStyle(0x81C784, 1);
        graphics.fillRect(-40 * scale, 30 * scale + contentY, 80 * scale, 15 * scale);
        // 彩虹 - 更精致
        const rainbowColors = [0xF44336, 0xFF9800, 0xFFEB3B, 0x4CAF50, 0x2196F3, 0x9C27B0];
        for (let i = 0; i < rainbowColors.length; i++) {
          graphics.lineStyle(5 * scale, rainbowColors[i], 0.9);
          graphics.beginPath();
          graphics.arc(0, 35 * scale + contentY, (38 - i * 5) * scale, Math.PI, 0);
          graphics.strokePath();
        }
        // 可爱的太阳
        graphics.fillStyle(0xFFEB3B, 1);
        graphics.fillCircle(28 * scale, -15 * scale + contentY, 14 * scale);
        // 太阳光芒
        graphics.fillStyle(0xFFD54F, 0.7);
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          graphics.fillTriangle(
            28 * scale, -15 * scale + contentY,
            28 * scale + Math.cos(angle) * 20 * scale, -15 * scale + Math.sin(angle) * 20 * scale + contentY,
            28 * scale + Math.cos(angle + 0.3) * 20 * scale, -15 * scale + Math.sin(angle + 0.3) * 20 * scale + contentY
          );
        }
        // 小花
        graphics.fillStyle(0xFFEB3B, 1);
        graphics.fillCircle(-30 * scale, 35 * scale + contentY, 4 * scale);
        graphics.fillStyle(0xFF69B4, 1);
        graphics.fillCircle(-18 * scale, 38 * scale + contentY, 3 * scale);
        graphics.fillCircle(25 * scale, 36 * scale + contentY, 4 * scale);
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
