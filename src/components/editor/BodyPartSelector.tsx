'use client';

import { BODY_PARTS } from '@/constants/bodyParts';
import { BodyPartKey } from '@/types';

interface BodyPartSelectorProps {
  selectedPart: BodyPartKey;
  setSelectedPart: (part: BodyPartKey) => void;
}

export function BodyPartSelector({ selectedPart, setSelectedPart }: BodyPartSelectorProps) {
  return (
    <div>
      <h3 style={{ fontSize: '10px', marginBottom: '12px', color: '#4ecdc4' }}>BODY PARTS</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {(Object.entries(BODY_PARTS) as [BodyPartKey, typeof BODY_PARTS[BodyPartKey]][]).map(([key, part]) => (
          <button
            key={key}
            className={`part-btn ${selectedPart === key ? 'active' : ''}`}
            onClick={() => setSelectedPart(key)}
          >
            {part.name}
          </button>
        ))}
      </div>
    </div>
  );
}
