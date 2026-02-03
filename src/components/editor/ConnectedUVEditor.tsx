'use client';

import { useRef, useEffect, useCallback } from 'react';
import { BODY_PARTS } from '@/constants/bodyParts';
import { SKIN_WIDTH } from '@/constants/skin';
import { Color, BodyPartKey, Tool } from '@/types';

interface ConnectedUVEditorProps {
  part: BodyPartKey;
  skinData: Uint8ClampedArray;
  onPaint: (x: number, y: number, color: Color) => void;
  scale: number;
  selectedColor: Color;
  secondaryColor: Color;
  tool: Tool;
}

export function ConnectedUVEditor({
  part,
  skinData,
  onPaint,
  scale,
  selectedColor,
  secondaryColor,
  tool,
}: ConnectedUVEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const activeButton = useRef<number>(0);
  const { layout } = BODY_PARTS[part];

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

  const getPixelFromEvent = (e: React.MouseEvent<HTMLCanvasElement>) => {
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
          skinY: region.uvY + localY
        };
      }
    }
    return null;
  };

  const paint = (e: React.MouseEvent<HTMLCanvasElement>, button?: number) => {
    const pixel = getPixelFromEvent(e);
    if (pixel) {
      const isRightClick = (button ?? activeButton.current) === 2;
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
    if (isDrawing.current) {
      paint(e);
    }
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    activeButton.current = 0;
  };

  const penCursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234ecdc4' stroke-width='2'%3E%3Cpath d='M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z'/%3E%3C/svg%3E") 0 24, crosshair`;

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
        cursor: penCursor,
        imageRendering: 'pixelated',
        borderRadius: '4px',
      }}
    />
  );
}
