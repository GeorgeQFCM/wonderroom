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

    // ===== 故事卡片图片资源 =====
    // 蝴蝶变态
    this.load.image('story_butterfly_caterpillar', 'assets/story/butterfly/caterpillar.png');
    this.load.image('story_butterfly_cocoon', 'assets/story/butterfly/cocoon.png');
    this.load.image('story_butterfly_butterfly', 'assets/story/butterfly/butterfly.png');

    // 小鸡孵化
    this.load.image('story_chicken_egg', 'assets/story/chicken/egg.png');
    this.load.image('story_chicken_chick', 'assets/story/chicken/chick.png');
    this.load.image('story_chicken_chicken', 'assets/story/chicken/chicken.png');

    // 青蛙生长
    this.load.image('story_frog_tadpole_egg', 'assets/story/frog/tadpole_egg.png');
    this.load.image('story_frog_tadpole', 'assets/story/frog/tadpole.png');
    this.load.image('story_frog_frog', 'assets/story/frog/frog.png');

    // 飞蛾变态
    this.load.image('story_caterpillar_egg', 'assets/story/caterpillar_full/egg.png');
    this.load.image('story_caterpillar_tiny', 'assets/story/caterpillar_full/tiny_cat.png');
    this.load.image('story_caterpillar_big', 'assets/story/caterpillar_full/big_cat.png');
    this.load.image('story_caterpillar_pupa', 'assets/story/caterpillar_full/pupa.png');
    this.load.image('story_caterpillar_moth', 'assets/story/caterpillar_full/moth.png');

    // 蛋糕制作
    this.load.image('story_cake_ingredients', 'assets/story/cake/ingredients.png');
    this.load.image('story_cake_baking', 'assets/story/cake/baking.png');
    this.load.image('story_cake_cake', 'assets/story/cake/cake.png');

    // 面包制作
    this.load.image('story_bread_wheat', 'assets/story/bread/wheat.png');
    this.load.image('story_bread_flour', 'assets/story/bread/flour.png');
    this.load.image('story_bread_dough', 'assets/story/bread/dough.png');
    this.load.image('story_bread_bread', 'assets/story/bread/bread.png');

    // 冰淇淋制作
    this.load.image('story_icecream_milk', 'assets/story/ice_cream/milk.png');
    this.load.image('story_icecream_mixing', 'assets/story/ice_cream/mixing.png');
    this.load.image('story_icecream_freezing', 'assets/story/ice_cream/freezing.png');
    this.load.image('story_icecream_cone', 'assets/story/ice_cream/cone.png');
    this.load.image('story_icecream_sundae', 'assets/story/ice_cream/sundae.png');

    // 苹果生长
    this.load.image('story_apple_blossom', 'assets/story/apple/blossom.png');
    this.load.image('story_apple_small', 'assets/story/apple/small_apple.png');
    this.load.image('story_apple_green', 'assets/story/apple/green_apple.png');
    this.load.image('story_apple_red', 'assets/story/apple/red_apple.png');

    // 四季变换
    this.load.image('story_seasons_spring', 'assets/story/seasons/spring.png');
    this.load.image('story_seasons_summer', 'assets/story/seasons/summer.png');
    this.load.image('story_seasons_autumn', 'assets/story/seasons/autumn.png');
    this.load.image('story_seasons_winter', 'assets/story/seasons/winter.png');
    this.load.image('story_seasons_spring2', 'assets/story/seasons/spring2.png');

    // 火箭发射
    this.load.image('story_rocket_blueprint', 'assets/story/rocket/blueprint.png');
    this.load.image('story_rocket_building', 'assets/story/rocket/building.png');
    this.load.image('story_rocket_launch', 'assets/story/rocket/launch.png');
    this.load.image('story_rocket_space', 'assets/story/rocket/space.png');
    this.load.image('story_rocket_planet', 'assets/story/rocket/planet.png');

    // ===== 额外主题图片资源 =====
    // 花朵生长
    this.load.image('story_flower_seed', 'assets/story/flower/seed.png');
    this.load.image('story_flower_sprout', 'assets/story/flower/sprout.png');
    this.load.image('story_flower_flower', 'assets/story/flower/flower.png');

    // 日出日落
    this.load.image('story_day_sunrise', 'assets/story/day/sunrise.png');
    this.load.image('story_day_sun', 'assets/story/day/sun.png');
    this.load.image('story_day_sunset', 'assets/story/day/sunset.png');

    // 下雨彩虹
    this.load.image('story_rain_cloud', 'assets/story/rain/cloud.png');
    this.load.image('story_rain_rain', 'assets/story/rain/rain.png');
    this.load.image('story_rain_rainbow', 'assets/story/rain/rainbow.png');

    // 树木生长
    this.load.image('story_tree_seed', 'assets/story/tree/seed.png');
    this.load.image('story_tree_sapling', 'assets/story/tree/sapling.png');
    this.load.image('story_tree_small', 'assets/story/tree/small_tree.png');
    this.load.image('story_tree_big', 'assets/story/tree/big_tree.png');

    // 雪人
    this.load.image('story_snowman_snow', 'assets/story/snowman/snow.png');
    this.load.image('story_snowman_ball1', 'assets/story/snowman/ball1.png');
    this.load.image('story_snowman_ball2', 'assets/story/snowman/ball2.png');
    this.load.image('story_snowman_snowman', 'assets/story/snowman/snowman.png');

    // 房屋建造
    this.load.image('story_house_foundation', 'assets/story/house/foundation.png');
    this.load.image('story_house_walls', 'assets/story/house/walls.png');
    this.load.image('story_house_roof', 'assets/story/house/roof.png');
    this.load.image('story_house_house', 'assets/story/house/house.png');

    // 月相变化
    this.load.image('story_moon_new', 'assets/story/moon/new_moon.png');
    this.load.image('story_moon_crescent', 'assets/story/moon/crescent.png');
    this.load.image('story_moon_half', 'assets/story/moon/half.png');
    this.load.image('story_moon_full', 'assets/story/moon/full_moon.png');

    // 画画
    this.load.image('story_painting_canvas', 'assets/story/painting/canvas.png');
    this.load.image('story_painting_sketch', 'assets/story/painting/sketch.png');
    this.load.image('story_painting_color', 'assets/story/painting/color.png');
    this.load.image('story_painting_art', 'assets/story/painting/art.png');

    // 恒星生命
    this.load.image('story_star_nebula', 'assets/story/star_life/nebula.png');
    this.load.image('story_star_protostar', 'assets/story/star_life/protostar.png');
    this.load.image('story_star_star', 'assets/story/star_life/star.png');
    this.load.image('story_star_red_giant', 'assets/story/star_life/red_giant.png');
    this.load.image('story_star_supernova', 'assets/story/star_life/supernova.png');

    // 水循环
    this.load.image('story_water_ocean', 'assets/story/water_cycle/ocean.png');
    this.load.image('story_water_evaporate', 'assets/story/water_cycle/evaporate.png');
    this.load.image('story_water_cloud', 'assets/story/water_cycle/cloud.png');
    this.load.image('story_water_rain', 'assets/story/water_cycle/rain.png');
    this.load.image('story_water_river', 'assets/story/water_cycle/river.png');
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
