'use client';

import { Pencil, Eraser, Pipette, PaintBucket } from 'lucide-react';
import { Tool } from '@/types';

interface ToolPanelProps {
  tool: Tool;
  setTool: (tool: Tool) => void;
}

const TOOLS: { id: Tool; icon: React.ReactNode; label: string }[] = [
  { id: 'brush', icon: <Pencil size={18} />, label: 'Brush' },
  { id: 'eraser', icon: <Eraser size={18} />, label: 'Eraser' },
  { id: 'eyedropper', icon: <Pipette size={18} />, label: 'Picker' },
  { id: 'bucket', icon: <PaintBucket size={18} />, label: 'Fill' },
];

export function ToolPanel({ tool, setTool }: ToolPanelProps) {
  return (
    <>
      {TOOLS.map(({ id, icon, label }) => (
        <button
          key={id}
          className={`tool-btn ${tool === id ? 'active' : ''}`}
          onClick={() => setTool(id)}
          data-tooltip={label}
          title={label}
        >
          {icon}
        </button>
      ))}
    </>
  );
}
