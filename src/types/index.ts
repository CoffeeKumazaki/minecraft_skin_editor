export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Region {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  uvX: number;
  uvY: number;
}

export interface BodyPartLayout {
  width: number;
  height: number;
  regions: Region[];
}

export interface BodyPart {
  name: string;
  layout: BodyPartLayout;
}

export type BodyPartKey = 'head' | 'body' | 'rightArm' | 'leftArm' | 'rightLeg' | 'leftLeg';
export type Tool = 'brush' | 'eraser' | 'eyedropper';
