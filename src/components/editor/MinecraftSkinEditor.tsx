'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Download } from 'lucide-react';
import { getBodyParts } from '@/constants/bodyParts';
import { SKIN_WIDTH } from '@/constants/skin';
import { createDefaultSkin } from '@/utils/skinInitializer';
import { downloadSkin } from '@/utils/exportSkin';
import { Color, BodyPartKey, Tool, Layer, ModelType } from '@/types';
import { useHistory } from '@/hooks/useHistory';
import { useColorHistory } from '@/hooks/useColorHistory';
import { ConnectedUVEditor } from './ConnectedUVEditor';
import { SkinPreview3D } from './SkinPreview3D';
import { ToolPanel } from './ToolPanel';
import { ColorPickerVertical } from './ColorPickerVertical';
import { BodyPartSelector } from './BodyPartSelector';
import { LayerToggle } from './LayerToggle';
import { ModelTypeSelector } from './ModelTypeSelector';

export function MinecraftSkinEditor() {
  const initialSkin = useRef<Uint8ClampedArray>(createDefaultSkin());
  const {
    state: committedSkinData,
    set: commitToHistory,
    undo,
    redo,
  } = useHistory<Uint8ClampedArray>(initialSkin.current, { maxHistory: 50 });

  const [skinData, setSkinData] = useState<Uint8ClampedArray>(initialSkin.current);
  const [selectedColor, setSelectedColor] = useState<Color>({ r: 0, g: 0, b: 0, a: 255 });
  const [secondaryColor, setSecondaryColor] = useState<Color>({ r: 255, g: 255, b: 255, a: 255 });
  const [tool, setTool] = useState<Tool>('brush');
  const [selectedPart, setSelectedPart] = useState<BodyPartKey>('head');
  const [selectedLayer, setSelectedLayer] = useState<Layer>('inner');
  const [autoRotate, setAutoRotate] = useState(false);
  const [modelType, setModelType] = useState<ModelType>('steve');
  const { history: colorHistory, addColor: addToColorHistory } = useColorHistory();

  const bodyParts = useMemo(() => getBodyParts(modelType), [modelType]);

  // Sync display state when undo/redo changes committed state
  useEffect(() => {
    setSkinData(committedSkinData);
  }, [committedSkinData]);

  const handlePaint = useCallback((x: number, y: number, color: Color) => {
    if (color.a > 0) {
      addToColorHistory(color);
    }
    setSkinData(prev => {
      const newData = new Uint8ClampedArray(prev);
      const idx = (y * SKIN_WIDTH + x) * 4;
      newData[idx] = color.r;
      newData[idx + 1] = color.g;
      newData[idx + 2] = color.b;
      newData[idx + 3] = color.a;
      return newData;
    });
  }, [addToColorHistory]);

  const handleStrokeEnd = useCallback(() => {
    setSkinData(current => {
      commitToHistory(current);
      return current;
    });
  }, [commitToHistory]);

  const handleBatchPaint = useCallback((pixels: Array<{ x: number; y: number }>, color: Color) => {
    if (color.a > 0) {
      addToColorHistory(color);
    }
    setSkinData(prev => {
      const newData = new Uint8ClampedArray(prev);
      for (const { x, y } of pixels) {
        const idx = (y * SKIN_WIDTH + x) * 4;
        newData[idx] = color.r;
        newData[idx + 1] = color.g;
        newData[idx + 2] = color.b;
        newData[idx + 3] = color.a;
      }
      commitToHistory(newData);
      return newData;
    });
  }, [commitToHistory, addToColorHistory]);

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
    const layout = bodyParts[part].layout;
    const maxWidth = 560;
    return Math.floor(maxWidth / layout.width);
  };

  return (
    <div className="editor-container">
      {/* Left Toolbar: Tools + Colors (Piskel-style) */}
      <div className="left-toolbar">
        {/* Tools Section */}
        <div className="left-toolbar-section">
          <ToolPanel tool={tool} setTool={setTool} />
        </div>

        {/* Colors Section */}
        <div className="left-toolbar-section">
          <ColorPickerVertical
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            secondaryColor={secondaryColor}
            setSecondaryColor={setSecondaryColor}
            colorHistory={colorHistory}
          />
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="canvas-area">
        <div className="canvas-header">
          <span className="canvas-title">
            {bodyParts[selectedPart].name.toUpperCase()} - {selectedLayer.toUpperCase()} LAYER
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
            layer={selectedLayer}
            skinData={skinData}
            onPaint={handlePaint}
            onBatchPaint={handleBatchPaint}
            onStrokeEnd={handleStrokeEnd}
            onColorPicked={handleColorPicked}
            scale={getScale(selectedPart)}
            selectedColor={selectedColor}
            secondaryColor={secondaryColor}
            tool={tool}
            bodyParts={bodyParts}
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
            modelType={modelType}
          />
        </div>

        {/* Model Type */}
        <div className="sidebar-section">
          <div className="sidebar-title">Model</div>
          <ModelTypeSelector modelType={modelType} setModelType={setModelType} />
        </div>

        {/* Layer Toggle */}
        <div className="sidebar-section">
          <div className="sidebar-title">Layer</div>
          <LayerToggle selectedLayer={selectedLayer} setSelectedLayer={setSelectedLayer} />
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
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <Download size={14} />
          Download PNG
        </button>
      </div>

    </div>
  );
}
