'use client';

import { ModelType } from '@/types';

interface ModelTypeSelectorProps {
  modelType: ModelType;
  setModelType: (type: ModelType) => void;
}

export function ModelTypeSelector({ modelType, setModelType }: ModelTypeSelectorProps) {
  return (
    <div className="layer-toggle">
      <button
        className={`layer-btn ${modelType === 'steve' ? 'active' : ''}`}
        onClick={() => setModelType('steve')}
        title="Steve (4px arms)"
      >
        Steve
      </button>
      <button
        className={`layer-btn ${modelType === 'alex' ? 'active' : ''}`}
        onClick={() => setModelType('alex')}
        title="Alex (3px arms)"
      >
        Alex
      </button>
    </div>
  );
}
