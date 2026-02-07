'use client';

import { Tool } from '@/types';

interface ToolPanelProps {
  tool: Tool;
  setTool: (tool: Tool) => void;
}

const TOOLS: { id: Tool; icon: string; label: string }[] = [
  { id: 'brush', icon: '✏', label: 'Brush' },
  { id: 'eraser', icon: '◻', label: 'Eraser' },
  { id: 'eyedropper', icon: '💧', label: 'Picker' },
  { id: 'bucket', icon: '🪣', label: 'Fill' },
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
