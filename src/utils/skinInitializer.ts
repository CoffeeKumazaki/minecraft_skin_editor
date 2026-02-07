import { SKIN_WIDTH, SKIN_HEIGHT } from '@/constants/skin';
import { BODY_PARTS } from '@/constants/bodyParts';

type Color = { r: number; g: number; b: number };

function fillRegion(
  data: Uint8ClampedArray,
  uvX: number,
  uvY: number,
  w: number,
  h: number,
  color: Color
): void {
  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const x = uvX + px;
      const y = uvY + py;
      const idx = (y * SKIN_WIDTH + x) * 4;
      data[idx] = color.r;
      data[idx + 1] = color.g;
      data[idx + 2] = color.b;
      data[idx + 3] = 255;
    }
  }
}

export function createDefaultSkin(): Uint8ClampedArray {
  const data = new Uint8ClampedArray(SKIN_WIDTH * SKIN_HEIGHT * 4);
  const skinColor = { r: 200, g: 150, b: 110 };
  const shirtColor = { r: 0, g: 170, b: 170 };
  const pantsColor = { r: 60, g: 60, b: 180 };
  const hairColor = { r: 70, g: 50, b: 30 };

  // Head - use UV coordinates from BODY_PARTS
  BODY_PARTS.head.layout.regions.forEach(region => {
    const color = region.name === 'Top' ? hairColor : skinColor;
    fillRegion(data, region.uvX, region.uvY, region.w, region.h, color);
  });

  // Body
  BODY_PARTS.body.layout.regions.forEach(region => {
    fillRegion(data, region.uvX, region.uvY, region.w, region.h, shirtColor);
  });

  // Right Arm
  BODY_PARTS.rightArm.layout.regions.forEach(region => {
    fillRegion(data, region.uvX, region.uvY, region.w, region.h, skinColor);
  });

  // Left Arm
  BODY_PARTS.leftArm.layout.regions.forEach(region => {
    fillRegion(data, region.uvX, region.uvY, region.w, region.h, skinColor);
  });

  // Right Leg
  BODY_PARTS.rightLeg.layout.regions.forEach(region => {
    fillRegion(data, region.uvX, region.uvY, region.w, region.h, pantsColor);
  });

  // Left Leg
  BODY_PARTS.leftLeg.layout.regions.forEach(region => {
    fillRegion(data, region.uvX, region.uvY, region.w, region.h, pantsColor);
  });

  return data;
}
