'use client';

import { Color } from '@/types';
import { PRESET_COLORS } from '@/constants/colors';
import { colorToHex, hexToColor } from '@/utils/colorUtils';

interface ColorPickerProps {
  selectedColor: Color;
  setSelectedColor: (color: Color) => void;
}

export function ColorPicker({ selectedColor, setSelectedColor }: ColorPickerProps) {
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedColor(hexToColor(e.target.value));
  };

  return (
    <div>
      <h3 style={{ fontSize: '10px', marginBottom: '12px', color: '#4ecdc4' }}>COLOR</h3>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <input
          type="color"
          value={colorToHex(selectedColor)}
          onChange={handleColorChange}
          style={{
            width: '48px',
            height: '48px',
            border: '3px solid #4a4a6a',
            cursor: 'pointer',
            background: 'none',
            borderRadius: '4px',
          }}
        />
        <div style={{
          width: '48px',
          height: '48px',
          background: colorToHex(selectedColor),
          border: '3px solid #4a4a6a',
          borderRadius: '4px',
        }} />
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
            style={{
              width: '28px',
              height: '28px',
              background: color,
              border: colorToHex(selectedColor) === color ? '3px solid #4ecdc4' : '2px solid #2a2a4a',
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
