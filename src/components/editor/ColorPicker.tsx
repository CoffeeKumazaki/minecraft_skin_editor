'use client';

import { useState } from 'react';
import { ArrowLeftRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Color } from '@/types';
import { PRESET_COLORS } from '@/constants/colors';
import { colorToHex, hexToColor } from '@/utils/colorUtils';
import { HSVColorPicker } from './HSVColorPicker';
import { ColorHistory } from './ColorHistory';

interface ColorPickerProps {
  selectedColor: Color;
  setSelectedColor: (color: Color) => void;
  secondaryColor: Color;
  setSecondaryColor: (color: Color) => void;
  colorHistory: Color[];
}

export function ColorPicker({
  selectedColor,
  setSelectedColor,
  secondaryColor,
  setSecondaryColor,
  colorHistory,
}: ColorPickerProps) {
  const [showHSVPicker, setShowHSVPicker] = useState(false);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedColor(hexToColor(e.target.value));
  };

  const handleSecondaryColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecondaryColor(hexToColor(e.target.value));
  };

  const swapColors = () => {
    const temp = selectedColor;
    setSelectedColor(secondaryColor);
    setSecondaryColor(temp);
  };

  return (
    <>
      {/* HSV Picker Popup */}
      {showHSVPicker && (
        <div className="hsv-picker-popup">
          <HSVColorPicker color={selectedColor} onChange={setSelectedColor} />
        </div>
      )}

      {/* Color Picker Section */}
      <div className="color-picker-section">
        {/* Primary color */}
        <div className="color-input-wrapper">
          <span className="color-input-label">L-CLICK</span>
          <div style={{ position: 'relative' }}>
            <input
              type="color"
              value={colorToHex(selectedColor)}
              onChange={handleColorChange}
              className="color-input primary"
            />
            <button
              className="hsv-toggle"
              onClick={() => setShowHSVPicker(!showHSVPicker)}
              title="Toggle HSV Picker"
            >
              {showHSVPicker ? <ChevronDown size={10} /> : <ChevronUp size={10} />}
            </button>
          </div>
        </div>

        {/* Swap button */}
        <button onClick={swapColors} className="swap-btn" title="Swap colors">
          <ArrowLeftRight size={16} />
        </button>

        {/* Secondary color */}
        <div className="color-input-wrapper">
          <span className="color-input-label">R-CLICK</span>
          <input
            type="color"
            value={colorToHex(secondaryColor)}
            onChange={handleSecondaryColorChange}
            className="color-input secondary"
          />
        </div>
      </div>

      {/* Separator */}
      <div style={{ width: '1px', height: '40px', background: 'var(--border-color)' }} />

      {/* Color History */}
      <ColorHistory
        history={colorHistory}
        selectedColor={selectedColor}
        secondaryColor={secondaryColor}
        onSelectPrimary={setSelectedColor}
        onSelectSecondary={setSecondaryColor}
      />

      {/* Separator (only if history exists) */}
      {colorHistory.length > 0 && (
        <div style={{ width: '1px', height: '40px', background: 'var(--border-color)' }} />
      )}

      {/* Preset Colors */}
      <div className="color-presets">
        {PRESET_COLORS.map((color, i) => {
          const isSelectedPrimary = colorToHex(selectedColor) === color;
          const isSelectedSecondary = colorToHex(secondaryColor) === color;
          return (
            <button
              key={i}
              onClick={() => setSelectedColor(hexToColor(color))}
              onContextMenu={(e) => {
                e.preventDefault();
                setSecondaryColor(hexToColor(color));
              }}
              className={`color-preset ${isSelectedPrimary ? 'selected-primary' : ''} ${isSelectedSecondary ? 'selected-secondary' : ''}`}
              style={{ background: color }}
              title={`Left click: Primary, Right click: Secondary`}
            />
          );
        })}
      </div>
    </>
  );
}
