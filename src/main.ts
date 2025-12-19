import Phaser from 'phaser';
import { SplashScene } from './scenes/SplashScene';
import { PreloadScene } from './scenes/PreloadScene';
import { RoomScene } from './scenes/RoomScene';
import { ShadowScene } from './scenes/ShadowScene';
import { StoryScene } from './scenes/StoryScene';

// 游戏配置
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720,
    min: {
      width: 640,
      height: 360
    },
    max: {
      width: 1920,
      height: 1080
    },
    expandParent: true,
    fullscreenTarget: 'game-container'
  },
  input: {
    activePointers: 3
  },
  scene: [
    SplashScene,
    PreloadScene,
    RoomScene,
    ShadowScene,
    StoryScene
  ],
  render: {
    pixelArt: false,
    antialias: true,
    roundPixels: true
  }
};

// 初始化游戏
const game = new Phaser.Game(config);

// 监听屏幕方向变化，重新调整尺寸
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    game.scale.refresh();
  }, 100);
});

// 监听窗口大小变化
window.addEventListener('resize', () => {
  game.scale.refresh();
});

// 尝试锁定横屏（部分浏览器支持）
const orientation = screen.orientation as { lock?: (orientation: string) => Promise<void> };
if (orientation && orientation.lock) {
  orientation.lock('landscape').catch(() => {
    // 如果锁定失败，忽略错误（大多数浏览器不支持）
  });
}
