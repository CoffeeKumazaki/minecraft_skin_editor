'use client';

import { Pencil, Eraser, Pipette, PaintBucket } from 'lucide-react';
import { Tool } from '@/types';

interface ToolPanelProps {
  tool: Tool;
  setTool: (tool: Tool) => void;
}

export const TOOLS: { id: Tool; icon: React.ReactNode; label: string; shortcut: string }[] = [
  { id: 'brush', icon: <Pencil size={22} />, label: 'Brush', shortcut: 'B' },
  { id: 'eraser', icon: <Eraser size={22} />, label: 'Eraser', shortcut: 'E' },
  { id: 'bucket', icon: <PaintBucket size={22} />, label: 'Fill', shortcut: 'G' },
  { id: 'eyedropper', icon: <Pipette size={22} />, label: 'Picker', shortcut: 'I' },
];

export function ToolPanel({ tool, setTool }: ToolPanelProps) {
  return (
    <div className="tool-grid">
      {TOOLS.map(({ id, icon, label, shortcut }) => (
        <button
          key={id}
          className={`tool-btn ${tool === id ? 'active' : ''}`}
          onClick={() => setTool(id)}
          data-tooltip={`${label} (${shortcut})`}
          aria-label={label}
          aria-pressed={tool === id}
        >
          {icon}
          <span className="tool-key">{shortcut}</span>
        </button>
      ))}
    </div>
  );
}
