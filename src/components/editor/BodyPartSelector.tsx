'use client';

import { BODY_PARTS } from '@/constants/bodyParts';
import { BodyPartKey } from '@/types';

interface BodyPartSelectorProps {
  selectedPart: BodyPartKey;
  setSelectedPart: (part: BodyPartKey) => void;
}

// Three columns: head / arms / legs read top-to-bottom
const PART_TAGS: { key: BodyPartKey; label: string }[] = [
  { key: 'head', label: 'head' },
  { key: 'rightArm', label: 'r.arm' },
  { key: 'rightLeg', label: 'r.leg' },
  { key: 'body', label: 'body' },
  { key: 'leftArm', label: 'l.arm' },
  { key: 'leftLeg', label: 'l.leg' },
];

export function BodyPartSelector({ selectedPart, setSelectedPart }: BodyPartSelectorProps) {
  return (
    <div className="part-tags">
      {PART_TAGS.map(({ key, label }) => (
        <button
          key={key}
          className={`part-tag ${selectedPart === key ? 'active' : ''}`}
          onClick={() => setSelectedPart(key)}
          title={BODY_PARTS[key].name}
          aria-pressed={selectedPart === key}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
