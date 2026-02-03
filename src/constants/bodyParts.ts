import { BodyPart, BodyPartKey } from '@/types';

export const BODY_PARTS: Record<BodyPartKey, BodyPart> = {
  head: {
    name: 'Head',
    layout: {
      width: 32,
      height: 24,
      regions: [
        { name: 'Top', x: 8, y: 0, w: 8, h: 8, uvX: 8, uvY: 0 },
        { name: 'Right', x: 0, y: 8, w: 8, h: 8, uvX: 0, uvY: 8 },
        { name: 'Front', x: 8, y: 8, w: 8, h: 8, uvX: 8, uvY: 8 },
        { name: 'Left', x: 16, y: 8, w: 8, h: 8, uvX: 16, uvY: 8 },
        { name: 'Back', x: 24, y: 8, w: 8, h: 8, uvX: 24, uvY: 8 },
        { name: 'Bottom', x: 8, y: 16, w: 8, h: 8, uvX: 16, uvY: 0 },
      ]
    }
  },
  body: {
    name: 'Body',
    layout: {
      width: 24,
      height: 20,
      regions: [
        { name: 'Top', x: 4, y: 0, w: 8, h: 4, uvX: 20, uvY: 16 },
        { name: 'Right', x: 0, y: 4, w: 4, h: 12, uvX: 16, uvY: 20 },
        { name: 'Front', x: 4, y: 4, w: 8, h: 12, uvX: 20, uvY: 20 },
        { name: 'Left', x: 12, y: 4, w: 4, h: 12, uvX: 28, uvY: 20 },
        { name: 'Back', x: 16, y: 4, w: 8, h: 12, uvX: 32, uvY: 20 },
        { name: 'Bottom', x: 4, y: 16, w: 8, h: 4, uvX: 28, uvY: 16 },
      ]
    }
  },
  rightArm: {
    name: 'Right Arm',
    layout: {
      width: 16,
      height: 20,
      regions: [
        { name: 'Top', x: 4, y: 0, w: 4, h: 4, uvX: 44, uvY: 16 },
        { name: 'Right', x: 0, y: 4, w: 4, h: 12, uvX: 40, uvY: 20 },
        { name: 'Front', x: 4, y: 4, w: 4, h: 12, uvX: 44, uvY: 20 },
        { name: 'Left', x: 8, y: 4, w: 4, h: 12, uvX: 48, uvY: 20 },
        { name: 'Back', x: 12, y: 4, w: 4, h: 12, uvX: 52, uvY: 20 },
        { name: 'Bottom', x: 4, y: 16, w: 4, h: 4, uvX: 48, uvY: 16 },
      ]
    }
  },
  leftArm: {
    name: 'Left Arm',
    layout: {
      width: 16,
      height: 20,
      regions: [
        { name: 'Top', x: 4, y: 0, w: 4, h: 4, uvX: 36, uvY: 48 },
        { name: 'Right', x: 0, y: 4, w: 4, h: 12, uvX: 32, uvY: 52 },
        { name: 'Front', x: 4, y: 4, w: 4, h: 12, uvX: 36, uvY: 52 },
        { name: 'Left', x: 8, y: 4, w: 4, h: 12, uvX: 40, uvY: 52 },
        { name: 'Back', x: 12, y: 4, w: 4, h: 12, uvX: 44, uvY: 52 },
        { name: 'Bottom', x: 4, y: 16, w: 4, h: 4, uvX: 40, uvY: 48 },
      ]
    }
  },
  rightLeg: {
    name: 'Right Leg',
    layout: {
      width: 16,
      height: 20,
      regions: [
        { name: 'Top', x: 4, y: 0, w: 4, h: 4, uvX: 4, uvY: 16 },
        { name: 'Right', x: 0, y: 4, w: 4, h: 12, uvX: 0, uvY: 20 },
        { name: 'Front', x: 4, y: 4, w: 4, h: 12, uvX: 4, uvY: 20 },
        { name: 'Left', x: 8, y: 4, w: 4, h: 12, uvX: 8, uvY: 20 },
        { name: 'Back', x: 12, y: 4, w: 4, h: 12, uvX: 12, uvY: 20 },
        { name: 'Bottom', x: 4, y: 16, w: 4, h: 4, uvX: 8, uvY: 16 },
      ]
    }
  },
  leftLeg: {
    name: 'Left Leg',
    layout: {
      width: 16,
      height: 20,
      regions: [
        { name: 'Top', x: 4, y: 0, w: 4, h: 4, uvX: 20, uvY: 48 },
        { name: 'Right', x: 0, y: 4, w: 4, h: 12, uvX: 16, uvY: 52 },
        { name: 'Front', x: 4, y: 4, w: 4, h: 12, uvX: 20, uvY: 52 },
        { name: 'Left', x: 8, y: 4, w: 4, h: 12, uvX: 24, uvY: 52 },
        { name: 'Back', x: 12, y: 4, w: 4, h: 12, uvX: 28, uvY: 52 },
        { name: 'Bottom', x: 4, y: 16, w: 4, h: 4, uvX: 24, uvY: 48 },
      ]
    }
  }
};
