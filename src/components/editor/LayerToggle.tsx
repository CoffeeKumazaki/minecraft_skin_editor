'use client';

import { Square, Layers } from 'lucide-react';
import { Layer } from '@/types';

interface LayerToggleProps {
  selectedLayer: Layer;
  setSelectedLayer: (layer: Layer) => void;
}

export function LayerToggle({ selectedLayer, setSelectedLayer }: LayerToggleProps) {
  return (
    <div className="layer-toggle">
      <button
        className={`layer-btn ${selectedLayer === 'inner' ? 'active' : ''}`}
        onClick={() => setSelectedLayer('inner')}
        title="Inner Layer"
      >
        <Square size={14} /> Inner
      </button>
      <button
        className={`layer-btn ${selectedLayer === 'outer' ? 'active' : ''}`}
        onClick={() => setSelectedLayer('outer')}
        title="Outer Layer"
      >
        <Layers size={14} /> Outer
      </button>
    </div>
  );
}
