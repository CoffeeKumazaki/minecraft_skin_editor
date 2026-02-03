'use client';

import { BODY_PARTS } from '@/constants/bodyParts';
import { BodyPartKey } from '@/types';

interface BodyPartSelectorProps {
  selectedPart: BodyPartKey;
  setSelectedPart: (part: BodyPartKey) => void;
}

export function BodyPartSelector({ selectedPart, setSelectedPart }: BodyPartSelectorProps) {
  return (
    <div className="part-grid">
      {(Object.entries(BODY_PARTS) as [BodyPartKey, typeof BODY_PARTS[BodyPartKey]][]).map(([key, part]) => (
        <button
          key={key}
          className={`part-btn-sidebar ${selectedPart === key ? 'active' : ''}`}
          onClick={() => setSelectedPart(key)}
        >
          {part.name}
        </button>
      ))}
    </div>
  );
}
