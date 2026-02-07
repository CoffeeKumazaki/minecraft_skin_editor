'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeftRight } from 'lucide-react';
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
  const [editingColor, setEditingColor] = useState<'primary' | 'secondary'>('primary');
  const hsvPopupRef = useRef<HTMLDivElement>(null);
  const swatchPairRef = useRef<HTMLDivElement>(null);

  // Close HSV popup when clicking outside
  useEffect(() => {
    if (!showHSV) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        hsvPopupRef.current &&
        !hsvPopupRef.current.contains(target) &&
        swatchPairRef.current &&
        !swatchPairRef.current.contains(target)
      ) {
        setShowHSV(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showHSV]);

  const swapColors = () => {
    const temp = selectedColor;
    setSelectedColor(secondaryColor);
    setSecondaryColor(temp);
  };

  const handleSwatchClick = (which: 'primary' | 'secondary') => {
    setEditingColor(which);
    setShowHSV(true);
  };

  const handleColorChange = (color: Color) => {
    if (editingColor === 'primary') {
      setSelectedColor(color);
    } else {
      setSecondaryColor(color);
    }
  };

  const currentEditingColor = editingColor === 'primary' ? selectedColor : secondaryColor;

  return (
    <>
      {/* Primary/Secondary Swatches (Piskel-style overlapping) */}
      <div ref={swatchPairRef} className="color-swatch-pair">
        <button
          className={`color-swatch-primary ${showHSV && editingColor === 'primary' ? 'editing' : ''}`}
          style={{ background: colorToHex(selectedColor) }}
          onClick={() => handleSwatchClick('primary')}
          title="Primary (L-Click)"
        />
        <button
          className={`color-swatch-secondary ${showHSV && editingColor === 'secondary' ? 'editing' : ''}`}
          style={{ background: colorToHex(secondaryColor) }}
          onClick={() => handleSwatchClick('secondary')}
          title="Secondary (R-Click)"
        />
        <button className="swap-btn-small" onClick={swapColors} title="Swap (X)">
          <ArrowLeftRight size={10} />
        </button>
      </div>

      {/* HSV Picker Popup */}
      {showHSV && (
        <div ref={hsvPopupRef} className="hsv-picker-popup-left">
          <HSVColorPicker color={currentEditingColor} onChange={handleColorChange} />
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
