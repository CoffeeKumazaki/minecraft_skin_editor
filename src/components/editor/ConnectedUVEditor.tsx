'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { SKIN_WIDTH } from '@/constants/skin';
import { Color, BodyPartKey, Tool, Layer, Region, BodyPart } from '@/types';
import { floodFill } from '@/utils/floodFill';

export interface HoverInfo {
  face: string;
  x: number;
  y: number;
  uvX: number;
  uvY: number;
}

export const FACE_KEYS: Record<string, string> = {
  Top: 'T',
  Bottom: 'B',
  Front: 'F',
  Back: 'K',
  Right: 'R',
  Left: 'L',
};

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
  showGrid?: boolean;
  onHoverChange?: (info: HoverInfo | null) => void;
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
  showGrid = true,
  onHoverChange,
}: ConnectedUVEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverCell, setHoverCell] = useState<{ x: number; y: number } | null>(null);
  const isDrawing = useRef(false);
  const activeButton = useRef<number>(0);
  // Tool at stroke start: the whole stroke (painting + history commit) uses it,
  // even if the tool is switched by shortcut mid-stroke
  const strokeTool = useRef<Tool>(tool);
  const [fontsReady, setFontsReady] = useState(false);
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each region (checkerboard behind transparent pixels)
    layout.regions.forEach(region => {
      for (let py = 0; py < region.h; py++) {
        for (let px = 0; px < region.w; px++) {
          const skinX = region.uvX + px;
          const skinY = region.uvY + py;
          const idx = (skinY * SKIN_WIDTH + skinX) * 4;
          const cellX = (region.x + px) * scale;
          const cellY = (region.y + py) * scale;

          ctx.fillStyle = (px + py) % 2 === 0 ? '#f4f1e9' : '#e9e4d8';
          ctx.fillRect(cellX, cellY, scale, scale);

          const a = skinData[idx + 3];
          if (a > 0) {
            ctx.fillStyle = `rgba(${skinData[idx]},${skinData[idx + 1]},${skinData[idx + 2]},${a / 255})`;
            ctx.fillRect(cellX, cellY, scale, scale);
          }
        }
      }
    });

    // Draw pixel grid inside each region
    if (showGrid) {
      ctx.strokeStyle = 'rgba(0,0,0,0.13)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      layout.regions.forEach(region => {
        for (let x = 1; x < region.w; x++) {
          const lx = (region.x + x) * scale + 0.5;
          ctx.moveTo(lx, region.y * scale);
          ctx.lineTo(lx, (region.y + region.h) * scale);
        }
        for (let y = 1; y < region.h; y++) {
          const ly = (region.y + y) * scale + 0.5;
          ctx.moveTo(region.x * scale, ly);
          ctx.lineTo((region.x + region.w) * scale, ly);
        }
      });
      ctx.stroke();

      // Outline each face (inset so adjacent faces show a 2px seam and outer edges aren't clipped)
      ctx.lineWidth = 1;
      layout.regions.forEach(region => {
        ctx.strokeStyle = region.name === 'Front' ? '#ff5a1f' : '#141414';
        ctx.strokeRect(
          region.x * scale + 0.5,
          region.y * scale + 0.5,
          region.w * scale - 1,
          region.h * scale - 1
        );
      });
    }

    // Draw face badges (top-left corner of each region)
    const pixelFont = getComputedStyle(document.body).getPropertyValue('--font-silkscreen').trim() || 'monospace';
    ctx.font = `10px ${pixelFont}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    layout.regions.forEach(region => {
      const bx = region.x * scale;
      const by = region.y * scale;
      const isFront = region.name === 'Front';
      ctx.fillStyle = isFront ? 'rgba(255, 90, 31, 0.9)' : 'rgba(20, 20, 20, 0.85)';
      ctx.fillRect(bx, by, 16, 16);
      ctx.fillStyle = isFront ? '#141414' : '#ffffff';
      ctx.fillText(FACE_KEYS[region.name] ?? region.name[0], bx + 8, by + 8.5);
    });

    // Draw hovered pixel outline
    if (hoverCell) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#000';
      ctx.strokeRect(hoverCell.x * scale - 1, hoverCell.y * scale - 1, scale + 2, scale + 2);
      ctx.strokeStyle = '#fff';
      ctx.strokeRect(hoverCell.x * scale + 1, hoverCell.y * scale + 1, scale - 2, scale - 2);
    }
  }, [layout, skinData, scale, showGrid, hoverCell]);

  // Redraw once webfonts are ready so badges use the pixel font
  useEffect(() => {
    document.fonts?.ready.then(() => setFontsReady(true));
  }, []);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas, fontsReady]);

  const getPixelFromEvent = (e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number; skinX: number; skinY: number; region: Region } | null => {
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
          x,
          y,
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
      const activeTool = strokeTool.current;
      const isRightClick = (button ?? activeButton.current) === 2;

      if (activeTool === 'eyedropper') {
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

      if (activeTool === 'bucket') {
        const fillColor = isRightClick ? secondaryColor : selectedColor;
        const pixels = floodFill(skinData, pixel.skinX, pixel.skinY, pixel.region, fillColor);
        if (pixels.length > 0) {
          onBatchPaint?.(pixels, fillColor);
        }
        return;
      }

      const color = activeTool === 'eraser'
        ? { r: 0, g: 0, b: 0, a: 0 }
        : isRightClick ? secondaryColor : selectedColor;
      onPaint(pixel.skinX, pixel.skinY, color);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1) return; // Ignore middle button
    isDrawing.current = true;
    activeButton.current = e.button;
    strokeTool.current = tool;
    paint(e, e.button);
  };

  const updateHover = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pixel = getPixelFromEvent(e);
    if (!pixel) {
      if (hoverCell) {
        setHoverCell(null);
        onHoverChange?.(null);
      }
      return;
    }
    if (hoverCell?.x === pixel.x && hoverCell?.y === pixel.y) return;
    setHoverCell({ x: pixel.x, y: pixel.y });
    onHoverChange?.({
      face: pixel.region.name,
      x: pixel.x - pixel.region.x,
      y: pixel.y - pixel.region.y,
      uvX: pixel.skinX,
      uvY: pixel.skinY,
    });
  };

  const handleMouseLeave = () => {
    handleMouseUp();
    setHoverCell(null);
    onHoverChange?.(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    updateHover(e);
    // Bucket tool doesn't support drag painting
    if (isDrawing.current && strokeTool.current !== 'bucket') {
      paint(e);
    }
  };

  const handleMouseUp = () => {
    if (isDrawing.current) {
      isDrawing.current = false;
      activeButton.current = 0;
      // Bucket tool commits history in onBatchPaint, skip onStrokeEnd
      if (strokeTool.current !== 'bucket') {
        onStrokeEnd?.();
      }
    }
  };

  const penCursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234ecdc4' stroke-width='2'%3E%3Cpath d='M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z'/%3E%3C/svg%3E") 0 24, crosshair`;
  const eraserCursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234ecdc4' stroke-width='2'%3E%3Cpath d='m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21'/%3E%3Cpath d='M22 21H7'/%3E%3Cpath d='m5 11 9 9'/%3E%3C/svg%3E") 0 24, crosshair`;
  const eyedropperCursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234ecdc4' stroke-width='2'%3E%3Cpath d='m2 22 1-1h3l9-9'/%3E%3Cpath d='M3 21v-3l9-9'/%3E%3Cpath d='m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z'/%3E%3C/svg%3E") 0 24, crosshair`;
  const bucketCursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234ecdc4' stroke-width='2'%3E%3Cpath d='m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z'/%3E%3Cpath d='m5 2 5 5'/%3E%3Cpath d='M2 13h12'/%3E%3Cpath d='M22 21a2 2 0 0 1-2-2c0-1.1.9-2 1.5-2.8l.5-.7.5.7c.6.8 1.5 1.7 1.5 2.8a2 2 0 0 1-2 2z'/%3E%3C/svg%3E") 22 21, crosshair`;

  const getCursor = () => {
    if (tool === 'eraser') return eraserCursor;
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
      onMouseLeave={handleMouseLeave}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        cursor: getCursor(),
        imageRendering: 'pixelated',
      }}
    />
  );
}
