'use client';

import { Tool } from '@/types';

interface ToolPanelProps {
  tool: Tool;
  setTool: (tool: Tool) => void;
}

export function ToolPanel({ tool, setTool }: ToolPanelProps) {
  return (
    <div>
      <h3 style={{ fontSize: '10px', marginBottom: '12px', color: '#4ecdc4' }}>TOOLS</h3>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          className={`pixel-btn ${tool === 'brush' ? 'active' : ''}`}
          onClick={() => setTool('brush')}
        >
          Brush
        </button>
        <button
          className={`pixel-btn ${tool === 'eraser' ? 'active' : ''}`}
          onClick={() => setTool('eraser')}
        >
          Eraser
        </button>
      </div>
    </div>
  );
}
