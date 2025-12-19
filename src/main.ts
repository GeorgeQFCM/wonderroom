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
    }
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
  ]
};

// 初始化游戏
new Phaser.Game(config);
