'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { BODY_PARTS } from '@/constants/bodyParts';
import { SKIN_WIDTH } from '@/constants/skin';
import { createDefaultSkin } from '@/utils/skinInitializer';
import { downloadSkin } from '@/utils/exportSkin';
import { Color, BodyPartKey, Tool } from '@/types';
import { useHistory } from '@/hooks/useHistory';
import { ConnectedUVEditor } from './ConnectedUVEditor';
import { SkinPreview3D } from './SkinPreview3D';
import { ToolPanel } from './ToolPanel';
import { ColorPicker } from './ColorPicker';
import { BodyPartSelector } from './BodyPartSelector';

export function MinecraftSkinEditor() {
  const initialSkin = useRef<Uint8ClampedArray>(createDefaultSkin());
  const {
    state: committedSkinData,
    set: commitToHistory,
    undo,
    redo,
  } = useHistory<Uint8ClampedArray>(initialSkin.current, { maxHistory: 50 });

  const [skinData, setSkinData] = useState<Uint8ClampedArray>(initialSkin.current);
  const [selectedColor, setSelectedColor] = useState<Color>({ r: 255, g: 100, b: 100, a: 255 });
  const [secondaryColor, setSecondaryColor] = useState<Color>({ r: 255, g: 255, b: 255, a: 255 });
  const [tool, setTool] = useState<Tool>('brush');
  const [selectedPart, setSelectedPart] = useState<BodyPartKey>('head');
  const [autoRotate, setAutoRotate] = useState(true);

  // Sync display state when undo/redo changes committed state
  useEffect(() => {
    setSkinData(committedSkinData);
  }, [committedSkinData]);

  const handlePaint = useCallback((x: number, y: number, color: Color) => {
    setSkinData(prev => {
      const newData = new Uint8ClampedArray(prev);
      const idx = (y * SKIN_WIDTH + x) * 4;
      newData[idx] = color.r;
      newData[idx + 1] = color.g;
      newData[idx + 2] = color.b;
      newData[idx + 3] = color.a;
      return newData;
    });
  }, []);

  const handleStrokeEnd = useCallback(() => {
    setSkinData(current => {
      commitToHistory(current);
      return current;
    });
  }, [commitToHistory]);

  const handleColorPicked = useCallback((color: Color, isSecondary: boolean) => {
    if (isSecondary) {
      setSecondaryColor(color);
    } else {
      setSelectedColor(color);
    }
  }, []);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (modifier && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      } else if (!isMac && e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const getScale = (part: BodyPartKey) => {
    const layout = BODY_PARTS[part].layout;
    const maxWidth = 560;
    return Math.floor(maxWidth / layout.width);
  };

  return (
    <div className="editor-container">
      {/* Left Toolbar */}
      <div className="left-toolbar">
        <ToolPanel tool={tool} setTool={setTool} />
      </div>

      {/* Main Canvas Area */}
      <div className="canvas-area">
        <div className="canvas-header">
          <span className="canvas-title">
            {BODY_PARTS[selectedPart].name.toUpperCase()} - UV MAP
          </span>
        </div>

        <div style={{
          background: 'rgba(20, 20, 40, 0.8)',
          padding: '16px',
          borderRadius: '8px',
          border: '2px solid var(--border-color)',
        }}>
          <ConnectedUVEditor
            part={selectedPart}
            skinData={skinData}
            onPaint={handlePaint}
            onStrokeEnd={handleStrokeEnd}
            onColorPicked={handleColorPicked}
            scale={getScale(selectedPart)}
            selectedColor={selectedColor}
            secondaryColor={secondaryColor}
            tool={tool}
          />
        </div>

        <div className="legend" style={{ marginTop: '12px' }}>
          <div className="legend-item"><div className="legend-dot">T</div> Top</div>
          <div className="legend-item"><div className="legend-dot">B</div> Bottom</div>
          <div className="legend-item"><div className="legend-dot">F</div> Front</div>
          <div className="legend-item"><div className="legend-dot">K</div> Back</div>
          <div className="legend-item"><div className="legend-dot">R</div> Right</div>
          <div className="legend-item"><div className="legend-dot">L</div> Left</div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="right-sidebar">
        {/* 3D Preview */}
        <div className="sidebar-section">
          <div className="sidebar-title">3D Preview</div>
          <SkinPreview3D
            skinData={skinData}
            autoRotate={autoRotate}
            setAutoRotate={setAutoRotate}
            selectedPart={selectedPart}
          />
        </div>

        {/* Body Parts */}
        <div className="sidebar-section">
          <div className="sidebar-title">Body Parts</div>
          <BodyPartSelector selectedPart={selectedPart} setSelectedPart={setSelectedPart} />
        </div>

        {/* Legend (compact) */}
        <div className="sidebar-section">
          <div className="sidebar-title">UV Legend</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '6px', color: '#6a6a8a' }}>
            <div>T - Top</div>
            <div>B - Bottom</div>
            <div>F - Front</div>
            <div>K - Back</div>
            <div>R - Right</div>
            <div>L - Left</div>
          </div>
        </div>

        {/* Download */}
        <button
          className="download-btn"
          onClick={() => downloadSkin(skinData)}
        >
          Download PNG
        </button>
      </div>

      {/* Bottom Color Bar */}
      <div className="color-bar">
        <ColorPicker
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          secondaryColor={secondaryColor}
          setSecondaryColor={setSecondaryColor}
        />
      </div>
    </div>
  );
}
