import Phaser from 'phaser';
import { COLORS } from './constants';

/**
 * 创建圆角矩形按钮
 */
export function createButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  color: number = COLORS.primary,
  radius: number = 20
): Phaser.GameObjects.Graphics {
  const graphics = scene.add.graphics();
  graphics.fillStyle(color, 1);
  graphics.fillRoundedRect(x - width / 2, y - height / 2, width, height, radius);
  return graphics;
}

/**
 * 创建成功粒子效果
 */
export function playSuccessParticles(
  scene: Phaser.Scene,
  x: number,
  y: number
): void {
  const particles = scene.add.particles(x, y, 'particle', {
    speed: { min: 100, max: 200 },
    scale: { start: 0.6, end: 0 },
    lifespan: 800,
    blendMode: Phaser.BlendModes.ADD,
    emitting: false
  });

  particles.explode(20);

  scene.time.delayedCall(1000, () => {
    particles.destroy();
  });
}

/**
 * 创建简单的粒子纹理
 */
export function createParticleTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists('particle')) return;

  const graphics = scene.make.graphics({ x: 0, y: 0 });
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('particle', 32, 32);
  graphics.destroy();
}

/**
 * 创建星星形状
 */
export function createStarTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists('star')) return;

  const graphics = scene.make.graphics({ x: 0, y: 0 });
  graphics.fillStyle(COLORS.yellow, 1);

  const cx = 32, cy = 32;
  const spikes = 5;
  const outerRadius = 30;
  const innerRadius = 15;

  graphics.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / spikes - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  graphics.closePath();
  graphics.fillPath();

  graphics.generateTexture('star', 64, 64);
  graphics.destroy();
}

/**
 * 播放缩放弹跳动画
 */
export function playBounceAnimation(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.GameObject,
  scale: number = 1.2
): void {
  scene.tweens.add({
    targets: target,
    scaleX: scale,
    scaleY: scale,
    duration: 100,
    yoyo: true,
    ease: 'Bounce.easeOut'
  });
}

/**
 * 计算两点之间的距离
 */
export function getDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}
