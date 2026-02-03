import { SKIN_WIDTH, SKIN_HEIGHT } from '@/constants/skin';

export function createDefaultSkin(): Uint8ClampedArray {
  const data = new Uint8ClampedArray(SKIN_WIDTH * SKIN_HEIGHT * 4);
  const skinColor = { r: 200, g: 150, b: 110 };
  const shirtColor = { r: 0, g: 170, b: 170 };
  const pantsColor = { r: 60, g: 60, b: 180 };
  const hairColor = { r: 70, g: 50, b: 30 };

  // Head - skin
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 32; x++) {
      const idx = (y * SKIN_WIDTH + x) * 4;
      if (y < 8) {
        // Top of head - hair
        data[idx] = hairColor.r;
        data[idx + 1] = hairColor.g;
        data[idx + 2] = hairColor.b;
      } else {
        data[idx] = skinColor.r;
        data[idx + 1] = skinColor.g;
        data[idx + 2] = skinColor.b;
      }
      data[idx + 3] = 255;
    }
  }

  // Body - shirt
  for (let y = 16; y < 32; y++) {
    for (let x = 16; x < 40; x++) {
      const idx = (y * SKIN_WIDTH + x) * 4;
      data[idx] = shirtColor.r;
      data[idx + 1] = shirtColor.g;
      data[idx + 2] = shirtColor.b;
      data[idx + 3] = 255;
    }
  }

  // Right arm
  for (let y = 16; y < 32; y++) {
    for (let x = 40; x < 56; x++) {
      const idx = (y * SKIN_WIDTH + x) * 4;
      data[idx] = skinColor.r;
      data[idx + 1] = skinColor.g;
      data[idx + 2] = skinColor.b;
      data[idx + 3] = 255;
    }
  }

  // Left arm
  for (let y = 48; y < 64; y++) {
    for (let x = 32; x < 48; x++) {
      const idx = (y * SKIN_WIDTH + x) * 4;
      data[idx] = skinColor.r;
      data[idx + 1] = skinColor.g;
      data[idx + 2] = skinColor.b;
      data[idx + 3] = 255;
    }
  }

  // Right leg
  for (let y = 16; y < 32; y++) {
    for (let x = 0; x < 16; x++) {
      const idx = (y * SKIN_WIDTH + x) * 4;
      data[idx] = pantsColor.r;
      data[idx + 1] = pantsColor.g;
      data[idx + 2] = pantsColor.b;
      data[idx + 3] = 255;
    }
  }

  // Left leg
  for (let y = 48; y < 64; y++) {
    for (let x = 16; x < 32; x++) {
      const idx = (y * SKIN_WIDTH + x) * 4;
      data[idx] = pantsColor.r;
      data[idx + 1] = pantsColor.g;
      data[idx + 2] = pantsColor.b;
      data[idx + 3] = 255;
    }
  }

  return data;
}
