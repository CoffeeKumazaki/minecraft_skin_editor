import { SKIN_WIDTH, SKIN_HEIGHT } from '@/constants/skin';

export function downloadSkin(skinData: Uint8ClampedArray): void {
  const canvas = document.createElement('canvas');
  canvas.width = SKIN_WIDTH;
  canvas.height = SKIN_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const imageData = ctx.createImageData(SKIN_WIDTH, SKIN_HEIGHT);
  for (let i = 0; i < skinData.length; i++) {
    imageData.data[i] = skinData[i];
  }
  ctx.putImageData(imageData, 0, 0);

  const link = document.createElement('a');
  link.download = 'minecraft-skin.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}
