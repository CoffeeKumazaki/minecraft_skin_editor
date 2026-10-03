'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Color } from '@/types';
import { rgbToHsv, hsvToRgb, HSV } from '@/utils/colorUtils';

interface HSVColorPickerProps {
  color: Color;
  onChange: (color: Color) => void;
  /** Rendered to the right of the SV panel (e.g. color swatches) */
  aside?: React.ReactNode;
}

// Sized for the 350px sidebar color card (canvas sizes exclude the 2px CSS border)
const SV_WIDTH = 150;
const SV_HEIGHT = 90;
const HUE_WIDTH = 304;
const HUE_HEIGHT = 12;

export function HSVColorPicker({ color, onChange, aside }: HSVColorPickerProps) {
  const svCanvasRef = useRef<HTMLCanvasElement>(null);
  const hueCanvasRef = useRef<HTMLCanvasElement>(null);

  const [hsv, setHsv] = useState<HSV>(() => rgbToHsv(color));
  const [isDraggingSV, setIsDraggingSV] = useState(false);
  const [isDraggingHue, setIsDraggingHue] = useState(false);

  // Sync HSV when external color changes
  useEffect(() => {
    setHsv(rgbToHsv(color));
  }, [color]);

  // Draw SV panel
  const drawSVPanel = useCallback(() => {
    const canvas = svCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;

    // Create base hue color
    const hueColor = hsvToRgb({ h: hsv.h, s: 100, v: 100 });

    // Horizontal gradient: white -> hue color
    const hGrad = ctx.createLinearGradient(0, 0, width, 0);
    hGrad.addColorStop(0, '#fff');
    hGrad.addColorStop(1, `rgb(${hueColor.r},${hueColor.g},${hueColor.b})`);
    ctx.fillStyle = hGrad;
    ctx.fillRect(0, 0, width, height);

    // Vertical gradient: transparent -> black
    const vGrad = ctx.createLinearGradient(0, 0, 0, height);
    vGrad.addColorStop(0, 'rgba(0,0,0,0)');
    vGrad.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = vGrad;
    ctx.fillRect(0, 0, width, height);

    // Draw cursor
    const cursorX = (hsv.s / 100) * width;
    const cursorY = (1 - hsv.v / 100) * height;

    ctx.beginPath();
    ctx.arc(cursorX, cursorY, 5, 0, Math.PI * 2);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cursorX, cursorY, 6, 0, Math.PI * 2);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [hsv.h, hsv.s, hsv.v]);

  // Draw Hue slider
  const drawHueSlider = useCallback(() => {
    const canvas = hueCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;

    // Rainbow gradient
    const grad = ctx.createLinearGradient(0, 0, width, 0);
    for (let i = 0; i <= 6; i++) {
      const hue = (i / 6) * 360;
      const rgb = hsvToRgb({ h: hue, s: 100, v: 100 });
      grad.addColorStop(i / 6, `rgb(${rgb.r},${rgb.g},${rgb.b})`);
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Draw cursor
    const cursorX = (hsv.h / 360) * width;

    ctx.beginPath();
    ctx.moveTo(cursorX, 0);
    ctx.lineTo(cursorX, height);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cursorX - 1, 0);
    ctx.lineTo(cursorX - 1, height);
    ctx.moveTo(cursorX + 1, 0);
    ctx.lineTo(cursorX + 1, height);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [hsv.h]);

  // Redraw canvases when HSV changes
  useEffect(() => {
    drawSVPanel();
  }, [drawSVPanel]);

  useEffect(() => {
    drawHueSlider();
  }, [drawHueSlider]);

  // Handle SV panel interaction
  const handleSVInteraction = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = svCanvasRef.current;
      if (!canvas) return;

      // Exclude the CSS border so coordinates match the drawn area
      const rect = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left - canvas.clientLeft, SV_WIDTH));
      const y = Math.max(0, Math.min(e.clientY - rect.top - canvas.clientTop, SV_HEIGHT));

      const s = Math.round((x / SV_WIDTH) * 100);
      const v = Math.round((1 - y / SV_HEIGHT) * 100);

      const newHsv = { ...hsv, s, v };
      setHsv(newHsv);
      const newColor = hsvToRgb(newHsv);
      onChange(newColor);
    },
    [hsv, onChange]
  );

  // Handle Hue slider interaction
  const handleHueInteraction = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = hueCanvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left - canvas.clientLeft, HUE_WIDTH));

      const h = Math.round((x / HUE_WIDTH) * 360);

      const newHsv = { ...hsv, h };
      setHsv(newHsv);
      const newColor = hsvToRgb(newHsv);
      onChange(newColor);
    },
    [hsv, onChange]
  );

  // Mouse event handlers for SV panel
  const handleSVMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDraggingSV(true);
    handleSVInteraction(e);
  };

  const handleSVMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingSV) {
      handleSVInteraction(e);
    }
  };

  const handleSVMouseUp = () => {
    setIsDraggingSV(false);
  };

  // Mouse event handlers for Hue slider
  const handleHueMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDraggingHue(true);
    handleHueInteraction(e);
  };

  const handleHueMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingHue) {
      handleHueInteraction(e);
    }
  };

  const handleHueMouseUp = () => {
    setIsDraggingHue(false);
  };

  // Global mouse up to handle drag release outside canvas
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDraggingSV(false);
      setIsDraggingHue(false);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div className="hsv-picker">
      <div className="hsv-row">
        <canvas
          ref={svCanvasRef}
          width={SV_WIDTH}
          height={SV_HEIGHT}
          className="hsv-sv-canvas"
          onMouseDown={handleSVMouseDown}
          onMouseMove={handleSVMouseMove}
          onMouseUp={handleSVMouseUp}
          onMouseLeave={handleSVMouseUp}
        />
        {aside}
      </div>
      <canvas
        ref={hueCanvasRef}
        width={HUE_WIDTH}
        height={HUE_HEIGHT}
        className="hsv-hue-canvas"
        onMouseDown={handleHueMouseDown}
        onMouseMove={handleHueMouseMove}
        onMouseUp={handleHueMouseUp}
        onMouseLeave={handleHueMouseUp}
      />
    </div>
  );
}
