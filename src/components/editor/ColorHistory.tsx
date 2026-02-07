'use client';

import { Color } from '@/types';
import { colorToHex } from '@/utils/colorUtils';

interface ColorHistoryProps {
  history: Color[];
  selectedColor: Color;
  secondaryColor: Color;
  onSelectPrimary: (color: Color) => void;
  onSelectSecondary: (color: Color) => void;
}

export function ColorHistory({
  history,
  selectedColor,
  secondaryColor,
  onSelectPrimary,
  onSelectSecondary,
}: ColorHistoryProps) {
  if (history.length === 0) return null;

  return (
    <div className="color-history">
      <span className="color-history-label">RECENT</span>
      <div className="color-history-swatches">
        {history.map((color, i) => {
          const hex = colorToHex(color);
          const isSelectedPrimary = colorToHex(selectedColor) === hex;
          const isSelectedSecondary = colorToHex(secondaryColor) === hex;

          return (
            <button
              key={`${hex}-${i}`}
              onClick={() => onSelectPrimary(color)}
              onContextMenu={(e) => {
                e.preventDefault();
                onSelectSecondary(color);
              }}
              className={`color-preset ${isSelectedPrimary ? 'selected-primary' : ''} ${isSelectedSecondary ? 'selected-secondary' : ''}`}
              style={{ background: hex }}
              title="Left: Primary, Right: Secondary"
            />
          );
        })}
      </div>
    </div>
  );
}
