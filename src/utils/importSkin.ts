import { SKIN_WIDTH, SKIN_HEIGHT } from '@/constants/skin';

const LEGACY_HEIGHT = 32;

// Legacy 64x32 skins have no left arm/leg. Minecraft builds them by mirroring
// the right limb: each face is flipped horizontally and the side faces swap.
// [srcX, srcY, dstX, dstY, w, h] relative to the limb origin.
const LIMB_MIRROR_FACES: [number, number, number, number, number, number][] = [
  [4, 0, 4, 0, 4, 4],   // top
  [8, 0, 8, 0, 4, 4],   // bottom
  [0, 4, 8, 4, 4, 12],  // right -> left
  [4, 4, 4, 4, 4, 12],  // front
  [8, 4, 0, 4, 4, 12],  // left -> right
  [12, 4, 12, 4, 4, 12], // back
];

// [srcOriginX, srcOriginY, dstOriginX, dstOriginY]
const LEGACY_LIMBS: [number, number, number, number][] = [
  [0, 16, 16, 48],  // right leg -> left leg
  [40, 16, 32, 48], // right arm -> left arm
];

function convertLegacySkin(data: Uint8ClampedArray): void {
  for (const [ox, oy, tx, ty] of LEGACY_LIMBS) {
    for (const [sx, sy, dx, dy, w, h] of LIMB_MIRROR_FACES) {
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const src = ((oy + sy + y) * SKIN_WIDTH + (ox + sx + x)) * 4;
          const dst = ((ty + dy + y) * SKIN_WIDTH + (tx + dx + (w - 1 - x))) * 4;
          for (let c = 0; c < 4; c++) {
            data[dst + c] = data[src + c];
          }
        }
      }
    }
  }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read the image file.'));
    };
    img.src = url;
  });
}

/**
 * Read a skin PNG into 64x64 RGBA data.
 * Accepts 64x64 skins and legacy 64x32 skins (converted to 64x64).
 */
export async function importSkin(file: File): Promise<Uint8ClampedArray> {
  const img = await loadImage(file);
  const isLegacy = img.width === SKIN_WIDTH && img.height === LEGACY_HEIGHT;
  if (img.width !== SKIN_WIDTH || (img.height !== SKIN_HEIGHT && !isLegacy)) {
    throw new Error(`Skin must be 64×64 or 64×32 (this image is ${img.width}×${img.height}).`);
  }

  const canvas = document.createElement('canvas');
  canvas.width = SKIN_WIDTH;
  canvas.height = SKIN_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available.');

  ctx.drawImage(img, 0, 0);
  const data = new Uint8ClampedArray(ctx.getImageData(0, 0, SKIN_WIDTH, SKIN_HEIGHT).data);
  if (isLegacy) {
    convertLegacySkin(data);
  }
  return data;
}
