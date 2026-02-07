'use client';

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
      >
        Inner
      </button>
      <button
        className={`layer-btn ${selectedLayer === 'outer' ? 'active' : ''}`}
        onClick={() => setSelectedLayer('outer')}
      >
        Outer
      </button>
    </div>
  );
}
