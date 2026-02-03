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
    <div>
      <h3 style={{ fontSize: '10px', marginBottom: '12px', color: '#4ecdc4' }}>COLOR</h3>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        {/* Primary color (left click) */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '6px', marginBottom: '4px', color: '#888' }}>L-CLICK</div>
          <input
            type="color"
            value={colorToHex(selectedColor)}
            onChange={handleColorChange}
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid #4ecdc4',
              cursor: 'pointer',
              background: 'none',
              borderRadius: '4px',
            }}
          />
        </div>

        {/* Swap button */}
        <button
          onClick={swapColors}
          style={{
            background: 'transparent',
            border: '2px solid #4a4a6a',
            color: '#4ecdc4',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'inherit',
          }}
          title="Swap colors"
        >
          &#8644;
        </button>

        {/* Secondary color (right click) */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '6px', marginBottom: '4px', color: '#888' }}>R-CLICK</div>
          <input
            type="color"
            value={colorToHex(secondaryColor)}
            onChange={handleSecondaryColorChange}
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid #ff6b6b',
              cursor: 'pointer',
              background: 'none',
              borderRadius: '4px',
            }}
          />
        </div>
      </div>

      <div style={{ fontSize: '6px', marginBottom: '4px', color: '#666' }}>
        L-CLICK: PRIMARY | R-CLICK: SECONDARY
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '4px',
        marginBottom: '20px',
      }}>
        {PRESET_COLORS.map((color, i) => (
          <button
            key={i}
            onClick={() => setSelectedColor(hexToColor(color))}
            onContextMenu={(e) => {
              e.preventDefault();
              setSecondaryColor(hexToColor(color));
            }}
            style={{
              width: '28px',
              height: '28px',
              background: color,
              border: colorToHex(selectedColor) === color
                ? '3px solid #4ecdc4'
                : colorToHex(secondaryColor) === color
                  ? '3px solid #ff6b6b'
                  : '2px solid #2a2a4a',
              cursor: 'pointer',
              borderRadius: '2px',
              transition: 'transform 0.1s',
            }}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.transform = 'scale(1.1)'}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.transform = 'scale(1)'}
          />
        ))}
      </div>
    </div>
  );
}
