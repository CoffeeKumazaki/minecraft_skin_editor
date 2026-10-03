'use client';

import { useState } from 'react';
import { Color } from '@/types';
import { PRESET_COLORS } from '@/constants/colors';
import { colorToHex, hexToColor } from '@/utils/colorUtils';
import { HSVColorPicker } from './HSVColorPicker';

interface ColorCardProps {
  selectedColor: Color;
  setSelectedColor: (color: Color) => void;
  secondaryColor: Color;
  setSecondaryColor: (color: Color) => void;
  onSwap: () => void;
  colorHistory: Color[];
}

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;
const PALETTE = PRESET_COLORS.slice(0, 12);

interface HexInputProps {
  value: string;
  onCommit: (color: Color) => void;
}

// Keeps the typed draft while it matches the committed color; external changes reset it.
// (Adjusting state during render instead of remounting, so focus is never lost.)
function HexInput({ value, onCommit }: HexInputProps) {
  const [draft, setDraft] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    if (draft.toUpperCase() !== value) setDraft(value);
  }
  return (
    <input
      type="text"
      value={draft}
      onChange={(e) => {
        setDraft(e.target.value);
        if (HEX_REGEX.test(e.target.value)) onCommit(hexToColor(e.target.value));
      }}
      onFocus={(e) => e.target.select()}
      className="hex-input"
      maxLength={7}
      placeholder="#RRGGBB"
      aria-label="HEX color"
    />
  );
}

export function ColorCard({
  selectedColor,
  setSelectedColor,
  secondaryColor,
  setSecondaryColor,
  onSwap,
  colorHistory,
}: ColorCardProps) {
  const [editingColor, setEditingColor] = useState<'primary' | 'secondary'>('primary');

  const editing = editingColor === 'primary' ? selectedColor : secondaryColor;
  const setEditing = editingColor === 'primary' ? setSelectedColor : setSecondaryColor;
  const editingHex = colorToHex(editing).toUpperCase();
  const selectedHex = colorToHex(selectedColor).toUpperCase();

  const chip = (hex: string, key: string | number, color: Color) => (
    <button
      key={key}
      onClick={() => setSelectedColor(color)}
      onContextMenu={(e) => {
        e.preventDefault();
        setSecondaryColor(color);
      }}
      className={`color-chip ${selectedHex === hex.toUpperCase() ? 'selected' : ''}`}
      style={{ background: hex }}
      title="L: Primary, R: Secondary"
    />
  );

  return (
    <section className="card">
      <div className="card-header">
        <span className="card-title">Color</span>
        <HexInput key={editingColor} value={editingHex} onCommit={setEditing} />
      </div>

      <HSVColorPicker
        color={editing}
        onChange={setEditing}
        aside={
          <div className="swatch-pair-col">
            <div className="color-swatch-pair">
              <button
                className={`color-swatch-primary ${editingColor === 'primary' ? 'editing' : ''}`}
                style={{ background: colorToHex(selectedColor) }}
                onClick={() => setEditingColor('primary')}
                aria-pressed={editingColor === 'primary'}
                title="Primary (L-Click) - click to edit"
              />
              <button
                className={`color-swatch-secondary ${editingColor === 'secondary' ? 'editing' : ''}`}
                style={{ background: colorToHex(secondaryColor) }}
                onClick={() => setEditingColor('secondary')}
                aria-pressed={editingColor === 'secondary'}
                title="Secondary (R-Click) - click to edit"
              />
            </div>
            <button className="swap-hint" onClick={onSwap}>x = swap</button>
          </div>
        }
      />

      <div className="chip-row">
        {PALETTE.map((hex, i) => chip(hex, i, hexToColor(hex)))}
      </div>

      {colorHistory.length > 0 && (
        <div>
          <span className="chip-row-label">recent</span>
          <div className="chip-row">
            {colorHistory.slice(0, 8).map((color, i) => chip(colorToHex(color), i, color))}
          </div>
        </div>
      )}
    </section>
  );
}
