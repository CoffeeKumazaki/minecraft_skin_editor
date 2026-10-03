'use client';

import { ModelType } from '@/types';

interface ModelTypeSelectorProps {
  modelType: ModelType;
  setModelType: (type: ModelType) => void;
}

const MODELS: { id: ModelType; label: string; title: string }[] = [
  { id: 'steve', label: 'steve', title: 'Steve (4px arms)' },
  { id: 'alex', label: 'alex', title: 'Alex (3px arms)' },
];

export function ModelTypeSelector({ modelType, setModelType }: ModelTypeSelectorProps) {
  return (
    <div className="segmented">
      {MODELS.map(({ id, label, title }) => (
        <button
          key={id}
          className={`segment ${modelType === id ? 'active' : ''}`}
          onClick={() => setModelType(id)}
          title={title}
          aria-pressed={modelType === id}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
