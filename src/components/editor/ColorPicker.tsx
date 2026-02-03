'use client';

import { Color } from '@/types';
import { PRESET_COLORS } from '@/constants/colors';
import { colorToHex, hexToColor } from '@/utils/colorUtils';

interface ColorPickerProps {
  selectedColor: Color;
  setSelectedColor: (color: Color) => void;
  secondaryColor: Color;
  setSecondaryColor: (color: Color) => void;
}

export function ColorPicker({
  selectedColor,
  setSelectedColor,
  secondaryColor,
  setSecondaryColor,
}: ColorPickerProps) {
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
      {/* Color Picker Section */}
      <div className="color-picker-section">
        {/* Primary color */}
        <div className="color-input-wrapper">
          <span className="color-input-label">L-CLICK</span>
          <input
            type="color"
            value={colorToHex(selectedColor)}
            onChange={handleColorChange}
            className="color-input primary"
          />
        </div>

        {/* Swap button */}
        <button onClick={swapColors} className="swap-btn" title="Swap colors">
          &#8644;
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
