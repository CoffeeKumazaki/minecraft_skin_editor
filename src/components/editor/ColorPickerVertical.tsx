'use client';

import { useState } from 'react';
import { ArrowLeftRight, Palette } from 'lucide-react';
import { Color } from '@/types';
import { PRESET_COLORS } from '@/constants/colors';
import { colorToHex, hexToColor } from '@/utils/colorUtils';
import { HSVColorPicker } from './HSVColorPicker';

interface ColorPickerVerticalProps {
  selectedColor: Color;
  setSelectedColor: (color: Color) => void;
  secondaryColor: Color;
  setSecondaryColor: (color: Color) => void;
  colorHistory: Color[];
}

export function ColorPickerVertical({
  selectedColor,
  setSelectedColor,
  secondaryColor,
  setSecondaryColor,
  colorHistory,
}: ColorPickerVerticalProps) {
  const [showHSV, setShowHSV] = useState(false);

  const swapColors = () => {
    const temp = selectedColor;
    setSelectedColor(secondaryColor);
    setSecondaryColor(temp);
  };

  return (
    <>
      {/* Primary/Secondary Swatches (Piskel-style overlapping) */}
      <div className="color-swatch-pair">
        <input
          type="color"
          value={colorToHex(selectedColor)}
          onChange={(e) => setSelectedColor(hexToColor(e.target.value))}
          className="color-swatch-primary"
          title="Primary (L-Click)"
        />
        <input
          type="color"
          value={colorToHex(secondaryColor)}
          onChange={(e) => setSecondaryColor(hexToColor(e.target.value))}
          className="color-swatch-secondary"
          title="Secondary (R-Click)"
        />
        <button className="swap-btn-small" onClick={swapColors} title="Swap (X)">
          <ArrowLeftRight size={10} />
        </button>
      </div>

      {/* HSV Toggle Button */}
      <button
        className={`tool-btn ${showHSV ? 'active' : ''}`}
        onClick={() => setShowHSV(!showHSV)}
        title="HSV Picker"
        style={{ width: '40px', height: '32px' }}
      >
        <Palette size={16} />
      </button>

      {/* HSV Picker Popup */}
      {showHSV && (
        <div className="hsv-picker-popup-left">
          <HSVColorPicker color={selectedColor} onChange={setSelectedColor} />
        </div>
      )}

      {/* Color History */}
      {colorHistory.length > 0 && (
        <div className="color-history-vertical">
          {colorHistory.slice(0, 6).map((color, i) => (
            <button
              key={i}
              onClick={() => setSelectedColor(color)}
              onContextMenu={(e) => {
                e.preventDefault();
                setSecondaryColor(color);
              }}
              className="color-preset"
              style={{ background: colorToHex(color) }}
              title="L: Primary, R: Secondary"
            />
          ))}
        </div>
      )}

      {/* Color Presets */}
      <div className="color-presets-vertical">
        {PRESET_COLORS.slice(0, 18).map((hex, i) => {
          const isSelectedPrimary = colorToHex(selectedColor) === hex;
          const isSelectedSecondary = colorToHex(secondaryColor) === hex;
          return (
            <button
              key={i}
              onClick={() => setSelectedColor(hexToColor(hex))}
              onContextMenu={(e) => {
                e.preventDefault();
                setSecondaryColor(hexToColor(hex));
              }}
              className={`color-preset ${isSelectedPrimary ? 'selected-primary' : ''} ${isSelectedSecondary ? 'selected-secondary' : ''}`}
              style={{ background: hex }}
              title="L: Primary, R: Secondary"
            />
          );
        })}
      </div>
    </>
  );
}
