import { Color, Region } from '@/types';
import { SKIN_WIDTH } from '@/constants/skin';

/**
 * Performs flood fill within a region boundary using BFS
 * Returns array of skin coordinates that should be filled
 */
export function floodFill(
  skinData: Uint8ClampedArray,
  startSkinX: number,
  startSkinY: number,
  region: Region,
  targetColor: Color
): Array<{ x: number; y: number }> {
  const pixels: Array<{ x: number; y: number }> = [];

  // Get the color at the starting position
  const startIdx = (startSkinY * SKIN_WIDTH + startSkinX) * 4;
  const startColor: Color = {
    r: skinData[startIdx],
    g: skinData[startIdx + 1],
    b: skinData[startIdx + 2],
    a: skinData[startIdx + 3],
  };

  // If starting color matches target color, no fill needed
  if (colorsEqual(startColor, targetColor)) {
    return [];
  }

  // Calculate local coordinates within the region
  const startLocalX = startSkinX - region.uvX;
  const startLocalY = startSkinY - region.uvY;

  // Use a Set to track visited local coordinates
  const visited = new Set<string>();
  const queue: Array<{ localX: number; localY: number }> = [
    { localX: startLocalX, localY: startLocalY }
  ];

  while (queue.length > 0) {
    const { localX, localY } = queue.shift()!;
    const key = `${localX},${localY}`;

    // Skip if already visited
    if (visited.has(key)) continue;

    // Check region boundaries (0 to w-1, 0 to h-1)
    if (localX < 0 || localX >= region.w || localY < 0 || localY >= region.h) {
      continue;
    }

    // Convert to skin coordinates
    const skinX = region.uvX + localX;
    const skinY = region.uvY + localY;
    const idx = (skinY * SKIN_WIDTH + skinX) * 4;

    // Get current pixel color
    const currentColor: Color = {
      r: skinData[idx],
      g: skinData[idx + 1],
      b: skinData[idx + 2],
      a: skinData[idx + 3],
    };

    // Check if color matches start color
    if (!colorsEqual(currentColor, startColor)) {
      continue;
    }

    // Mark as visited and add to result
    visited.add(key);
    pixels.push({ x: skinX, y: skinY });

    // Add 4-connected neighbors to queue
    queue.push(
      { localX: localX + 1, localY },
      { localX: localX - 1, localY },
      { localX, localY: localY + 1 },
      { localX, localY: localY - 1 }
    );
  }

  return pixels;
}

function colorsEqual(c1: Color, c2: Color): boolean {
  return c1.r === c2.r && c1.g === c2.g && c1.b === c2.b && c1.a === c2.a;
}
