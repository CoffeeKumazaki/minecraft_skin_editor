'use client';

import { useRef, useEffect, useCallback } from 'react';
import { SKIN_WIDTH } from '@/constants/skin';
import { Color, BodyPartKey, Tool, Layer, Region, BodyPart } from '@/types';
import { floodFill } from '@/utils/floodFill';

interface ConnectedUVEditorProps {
  part: BodyPartKey;
  layer: Layer;
  skinData: Uint8ClampedArray;
  onPaint: (x: number, y: number, color: Color) => void;
  onBatchPaint?: (pixels: Array<{ x: number; y: number }>, color: Color) => void;
  onStrokeEnd?: () => void;
  onColorPicked?: (color: Color, isSecondary: boolean) => void;
  scale: number;
  selectedColor: Color;
  secondaryColor: Color;
  tool: Tool;
  bodyParts: Record<BodyPartKey, BodyPart>;
}

export function ConnectedUVEditor({
  part,
  layer,
  skinData,
  onPaint,
  onBatchPaint,
  onStrokeEnd,
  onColorPicked,
  scale,
  selectedColor,
  secondaryColor,
  tool,
  bodyParts,
}: ConnectedUVEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const activeButton = useRef<number>(0);
  const bodyPart = bodyParts[part];
  // Use outer layout if available and outer layer selected, fallback to inner
  const layout = layer === 'outer' && bodyPart.outerLayout
    ? bodyPart.outerLayout
    : bodyPart.layout;

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw each region
    layout.regions.forEach(region => {
      for (let py = 0; py < region.h; py++) {
        for (let px = 0; px < region.w; px++) {
          const skinX = region.uvX + px;
          const skinY = region.uvY + py;
          const idx = (skinY * SKIN_WIDTH + skinX) * 4;

          const r = skinData[idx];
          const g = skinData[idx + 1];
          const b = skinData[idx + 2];
          const a = skinData[idx + 3];

          if (a > 0) {
            ctx.fillStyle = `rgba(${r},${g},${b},${a / 255})`;
            ctx.fillRect((region.x + px) * scale, (region.y + py) * scale, scale, scale);
          }
        }
      }
    });

    // Draw grid
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= layout.width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * scale, 0);
      ctx.lineTo(x * scale, layout.height * scale);
      ctx.stroke();
    }
    for (let y = 0; y <= layout.height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * scale);
      ctx.lineTo(layout.width * scale, y * scale);
      ctx.stroke();
    }

    // Draw region borders and labels
    ctx.strokeStyle = 'rgba(78, 205, 196, 0.5)';
    ctx.lineWidth = 2;
    ctx.font = `${Math.max(8, scale * 0.8)}px "Press Start 2P", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    layout.regions.forEach(region => {
      ctx.strokeRect(
        region.x * scale,
        region.y * scale,
        region.w * scale,
        region.h * scale
      );

      // Draw label
      ctx.fillStyle = 'rgba(78, 205, 196, 0.7)';
      const labelX = (region.x + region.w / 2) * scale;
      const labelY = (region.y + region.h / 2) * scale;
      ctx.fillText(region.name[0], labelX, labelY);
    });
  }, [layout, skinData, scale]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const getPixelFromEvent = (e: React.MouseEvent<HTMLCanvasElement>): { skinX: number; skinY: number; region: Region } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / scale);
    const y = Math.floor((e.clientY - rect.top) / scale);

    // Find which region this pixel belongs to
    for (const region of layout.regions) {
      if (x >= region.x && x < region.x + region.w &&
          y >= region.y && y < region.y + region.h) {
        const localX = x - region.x;
        const localY = y - region.y;
        return {
          skinX: region.uvX + localX,
          skinY: region.uvY + localY,
          region
        };
      }
    }
    return null;
  };

  const paint = (e: React.MouseEvent<HTMLCanvasElement>, button?: number) => {
    const pixel = getPixelFromEvent(e);
    if (pixel) {
      const isRightClick = (button ?? activeButton.current) === 2;

      if (tool === 'eyedropper') {
        const idx = (pixel.skinY * SKIN_WIDTH + pixel.skinX) * 4;
        const pickedColor: Color = {
          r: skinData[idx],
          g: skinData[idx + 1],
          b: skinData[idx + 2],
          a: skinData[idx + 3],
        };
        onColorPicked?.(pickedColor, isRightClick);
        return;
      }

      if (tool === 'bucket') {
        const fillColor = isRightClick ? secondaryColor : selectedColor;
        const pixels = floodFill(skinData, pixel.skinX, pixel.skinY, pixel.region, fillColor);
        if (pixels.length > 0) {
          onBatchPaint?.(pixels, fillColor);
        }
        return;
      }

      const color = tool === 'eraser'
        ? { r: 0, g: 0, b: 0, a: 0 }
        : isRightClick ? secondaryColor : selectedColor;
      onPaint(pixel.skinX, pixel.skinY, color);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1) return; // Ignore middle button
    isDrawing.current = true;
    activeButton.current = e.button;
    paint(e, e.button);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Bucket tool doesn't support drag painting
    if (isDrawing.current && tool !== 'bucket') {
      paint(e);
    }
  };

  const handleMouseUp = () => {
    if (isDrawing.current) {
      isDrawing.current = false;
      activeButton.current = 0;
      // Bucket tool commits history in onBatchPaint, skip onStrokeEnd
      if (tool !== 'bucket') {
        onStrokeEnd?.();
      }
    }
  };

  const penCursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234ecdc4' stroke-width='2'%3E%3Cpath d='M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z'/%3E%3C/svg%3E") 0 24, crosshair`;
  const eyedropperCursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234ecdc4' stroke-width='2'%3E%3Cpath d='m2 22 1-1h3l9-9'/%3E%3Cpath d='M3 21v-3l9-9'/%3E%3Cpath d='m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z'/%3E%3C/svg%3E") 0 24, crosshair`;
  const bucketCursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234ecdc4' stroke-width='2'%3E%3Cpath d='m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z'/%3E%3Cpath d='m5 2 5 5'/%3E%3Cpath d='M2 13h12'/%3E%3Cpath d='M22 21a2 2 0 0 1-2-2c0-1.1.9-2 1.5-2.8l.5-.7.5.7c.6.8 1.5 1.7 1.5 2.8a2 2 0 0 1-2 2z'/%3E%3C/svg%3E") 0 24, crosshair`;

  const getCursor = () => {
    if (tool === 'eyedropper') return eyedropperCursor;
    if (tool === 'bucket') return bucketCursor;
    return penCursor;
  };

  return (
    <canvas
      ref={canvasRef}
      width={layout.width * scale}
      height={layout.height * scale}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        cursor: getCursor(),
        imageRendering: 'pixelated',
        borderRadius: '4px',
      }}
    />
  );
}
