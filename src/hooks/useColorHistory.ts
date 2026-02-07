import { useState, useCallback } from 'react';
import { Color } from '@/types';
import { colorsEqual } from '@/utils/colorUtils';

const MAX_HISTORY = 8;

export function useColorHistory(initialColors: Color[] = []) {
  const [history, setHistory] = useState<Color[]>(initialColors);

  const addColor = useCallback((color: Color) => {
    // Skip transparent colors
    if (color.a === 0) return;

    setHistory((prev) => {
      // Remove duplicate if exists
      const filtered = prev.filter((c) => !colorsEqual(c, color));
      // Add to front, limit to MAX_HISTORY
      return [color, ...filtered].slice(0, MAX_HISTORY);
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return { history, addColor, clearHistory };
}
