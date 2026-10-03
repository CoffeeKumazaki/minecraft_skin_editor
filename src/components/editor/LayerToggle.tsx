'use client';

import { Layer } from '@/types';

interface LayerToggleProps {
  selectedLayer: Layer;
  setSelectedLayer: (layer: Layer) => void;
}

const LAYERS: { id: Layer; label: string; title: string }[] = [
  { id: 'inner', label: 'inner', title: 'Inner layer (base skin)' },
  { id: 'outer', label: 'outer', title: 'Outer layer (hat / jacket)' },
];

export function LayerToggle({ selectedLayer, setSelectedLayer }: LayerToggleProps) {
  return (
    <div className="segmented">
      {LAYERS.map(({ id, label, title }) => (
        <button
          key={id}
          className={`segment ${selectedLayer === id ? 'active' : ''}`}
          onClick={() => setSelectedLayer(id)}
          title={title}
          aria-pressed={selectedLayer === id}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
