'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { Color } from '@/types';
import { rgbToHsv, hsvToRgb, colorToHex, hexToColor, HSV } from '@/utils/colorUtils';

interface HSVColorPickerProps {
  color: Color;
  onChange: (color: Color) => void;
}

const SV_WIDTH = 180;
const SV_HEIGHT = 120;
const HUE_WIDTH = 180;
const HUE_HEIGHT = 16;
const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;

export function HSVColorPicker({ color, onChange }: HSVColorPickerProps) {
  const svCanvasRef = useRef<HTMLCanvasElement>(null);
  const hueCanvasRef = useRef<HTMLCanvasElement>(null);

  const [hsv, setHsv] = useState<HSV>(() => rgbToHsv(color));
  const [isDraggingSV, setIsDraggingSV] = useState(false);
  const [isDraggingHue, setIsDraggingHue] = useState(false);
  const [hexInput, setHexInput] = useState(colorToHex(color));
  const [copied, setCopied] = useState(false);

  // Sync HSV and hex input when external color changes
  useEffect(() => {
    const newHsv = rgbToHsv(color);
    setHsv(newHsv);
    setHexInput(colorToHex(color));
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
    ctx.arc(cursorX, cursorY, 6, 0, Math.PI * 2);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cursorX, cursorY, 7, 0, Math.PI * 2);
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

      const rect = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, SV_WIDTH));
      const y = Math.max(0, Math.min(e.clientY - rect.top, SV_HEIGHT));

      const s = Math.round((x / SV_WIDTH) * 100);
      const v = Math.round((1 - y / SV_HEIGHT) * 100);

      const newHsv = { ...hsv, s, v };
      setHsv(newHsv);
      const newColor = hsvToRgb(newHsv);
      setHexInput(colorToHex(newColor));
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
      const x = Math.max(0, Math.min(e.clientX - rect.left, HUE_WIDTH));

      const h = Math.round((x / HUE_WIDTH) * 360);

      const newHsv = { ...hsv, h };
      setHsv(newHsv);
      const newColor = hsvToRgb(newHsv);
      setHexInput(colorToHex(newColor));
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

  // Handle HEX input
  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHexInput(value);
    if (HEX_REGEX.test(value)) {
      const newColor = hexToColor(value);
      setHsv(rgbToHsv(newColor));
      onChange(newColor);
    }
  };

  const handleHexFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(colorToHex(color).toUpperCase());
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="hsv-picker">
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
      <div className="hex-input-wrapper">
        <input
          type="text"
          value={hexInput}
          onChange={handleHexInputChange}
          onFocus={handleHexFocus}
          className="hex-input"
          maxLength={7}
          placeholder="#RRGGBB"
        />
        <button
          className="copy-btn"
          onClick={copyToClipboard}
          title="Copy HEX code"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
      </div>
    </div>
  );
}
