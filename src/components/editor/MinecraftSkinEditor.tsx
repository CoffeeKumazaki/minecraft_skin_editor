'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Download, Upload, Undo2, Redo2, Grid3x3 } from 'lucide-react';
import { getBodyParts } from '@/constants/bodyParts';
import { SKIN_WIDTH } from '@/constants/skin';
import { createDefaultSkin } from '@/utils/skinInitializer';
import { colorToHex } from '@/utils/colorUtils';
import { downloadSkin } from '@/utils/exportSkin';
import { importSkin } from '@/utils/importSkin';
import { Color, BodyPartKey, Tool, Layer, ModelType } from '@/types';
import { useHistory } from '@/hooks/useHistory';
import { useColorHistory } from '@/hooks/useColorHistory';
import { ConnectedUVEditor, HoverInfo, FACE_KEYS } from './ConnectedUVEditor';
import { SkinPreview3D } from './SkinPreview3D';
import { ToolPanel, TOOLS } from './ToolPanel';
import { ColorCard } from './ColorCard';
import { BodyPartSelector } from './BodyPartSelector';
import { LayerToggle } from './LayerToggle';
import { ModelTypeSelector } from './ModelTypeSelector';

// Fallback fit area before the stage has been measured
const DEFAULT_STAGE = { width: 700, height: 560 };
// Space kept free around the board inside the stage
// (Y includes the board's 44px top padding for the handwritten note)
const STAGE_MARGIN_X = 16;
const STAGE_MARGIN_Y = 60;
const MIN_SCALE = 4;
const MAX_SCALE = 48;
const ZOOM_STEP = 2;

const LEGEND = ['Top', 'Bottom', 'Front', 'Back', 'Right', 'Left'];

export function MinecraftSkinEditor() {
  const initialSkin = useRef<Uint8ClampedArray>(createDefaultSkin());
  const {
    state: committedSkinData,
    set: commitToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<Uint8ClampedArray>(initialSkin.current, { maxHistory: 50 });

  const [skinData, setSkinData] = useState<Uint8ClampedArray>(initialSkin.current);
  const [selectedColor, setSelectedColor] = useState<Color>({ r: 0, g: 0, b: 0, a: 255 });
  const [secondaryColor, setSecondaryColor] = useState<Color>({ r: 255, g: 255, b: 255, a: 255 });
  const [tool, setTool] = useState<Tool>('brush');
  const [selectedPart, setSelectedPart] = useState<BodyPartKey>('head');
  const [selectedLayer, setSelectedLayer] = useState<Layer>('inner');
  const [autoRotate, setAutoRotate] = useState(false);
  const [modelType, setModelType] = useState<ModelType>('steve');
  const [showGrid, setShowGrid] = useState(true);
  const [zoomOffset, setZoomOffset] = useState(0);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const [fileName, setFileName] = useState('minecraft-skin.png');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState(DEFAULT_STAGE);
  const { history: colorHistory, addColor: addToColorHistory } = useColorHistory();

  const bodyParts = useMemo(() => getBodyParts(modelType), [modelType]);

  // Latest working skin (may include an uncommitted in-progress stroke)
  const skinDataRef = useRef(skinData);
  useEffect(() => {
    skinDataRef.current = skinData;
  }, [skinData]);

  // Fit the UV board to the available sheet area
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setStageSize({ width, height });
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

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
    // Build outside a state updater so the history commit runs exactly once
    const newData = new Uint8ClampedArray(skinData);
    for (const { x, y } of pixels) {
      const idx = (y * SKIN_WIDTH + x) * 4;
      newData[idx] = color.r;
      newData[idx + 1] = color.g;
      newData[idx + 2] = color.b;
      newData[idx + 3] = color.a;
    }
    setSkinData(newData);
    commitToHistory(newData);
  }, [skinData, commitToHistory, addToColorHistory]);

  const swapColors = useCallback(() => {
    setSelectedColor(secondaryColor);
    setSecondaryColor(selectedColor);
  }, [selectedColor, secondaryColor]);

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
      } else if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        // Tool shortcuts (ignored while typing in inputs)
        if (e.target instanceof HTMLInputElement) return;
        if (e.key.toLowerCase() === 'x') {
          swapColors();
          return;
        }
        const match = TOOLS.find(t => t.shortcut.toLowerCase() === e.key.toLowerCase());
        if (match) setTool(match.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, swapColors]);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data = await importSkin(file);
      // Commit any in-progress edits first so undoing the import restores them
      commitToHistory(skinDataRef.current);
      commitToHistory(data);
      setFileName(file.name);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Failed to import skin.');
    }
  };

  const layout = selectedLayer === 'outer' && bodyParts[selectedPart].outerLayout
    ? bodyParts[selectedPart].outerLayout!
    : bodyParts[selectedPart].layout;
  const fitScale = Math.floor(Math.min(
    (stageSize.width - STAGE_MARGIN_X) / layout.width,
    (stageSize.height - STAGE_MARGIN_Y) / layout.height,
  ));
  const scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, fitScale + zoomOffset));
  // Step from the displayed scale so the offset never drifts outside the clamp range
  const zoomBy = (step: number) => {
    const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale + step));
    setZoomOffset(next - fitScale);
  };

  return (
    <div className="editor-container">
      {/* Header */}
      <header className="top-bar">
        <div className="brand">
          <span className="brand-title">skincraft</span>
          <span className="brand-file">{fileName}</span>
        </div>
        <div className="top-actions">
          <button className="text-link" onClick={undo} disabled={!canUndo} title="Undo (⌘Z)">
            <Undo2 size={16} />
            undo
          </button>
          <button className="text-link" onClick={redo} disabled={!canRedo} title="Redo (⇧⌘Z)">
            <Redo2 size={16} />
            redo
          </button>
          <button
            className="ink-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Import PNG (64×64 / 64×32)"
          >
            <Upload size={16} />
            Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png"
            onChange={handleImport}
            hidden
          />
          <button className="ink-btn primary" onClick={() => downloadSkin(skinData, fileName)}>
            <Download size={16} />
            Export PNG
          </button>
        </div>
      </header>

      <div className="editor-body">
        {/* Tool Rail */}
        <aside className="tool-rail">
          <ToolPanel tool={tool} setTool={setTool} />
          <div className="rail-sep" />
          <button
            className="rail-swatch primary"
            onClick={swapColors}
            title="Primary color (click or X to swap)"
            aria-label="Swap colors"
          >
            <span style={{ background: colorToHex(selectedColor) }} />
          </button>
          <button
            className="rail-swatch"
            onClick={swapColors}
            title="Secondary color (click or X to swap)"
            aria-label="Swap colors"
          >
            <span style={{ background: colorToHex(secondaryColor) }} />
          </button>
        </aside>

        {/* Canvas */}
        <main className="canvas-column">
          <div className="sheet">
            <div className="sheet-header">
              <div className="sheet-title-group">
                <h1 className="sheet-title">{bodyParts[selectedPart].name}</h1>
                <span className="layer-tag">{selectedLayer.toUpperCase()} LAYER</span>
                <span className="sheet-dims">{layout.width} × {layout.height} px</span>
              </div>
              <div className="view-controls">
                <button
                  className={`view-toggle ${showGrid ? 'active' : ''}`}
                  onClick={() => setShowGrid(v => !v)}
                  aria-pressed={showGrid}
                >
                  <Grid3x3 size={14} />
                  {showGrid ? 'grid on' : 'grid off'}
                </button>
                <div className="zoom-control">
                  <button onClick={() => zoomBy(-ZOOM_STEP)} disabled={scale <= MIN_SCALE} aria-label="Zoom out">
                    −
                  </button>
                  <span className="zoom-value">{scale}×</span>
                  <button onClick={() => zoomBy(ZOOM_STEP)} disabled={scale >= MAX_SCALE} aria-label="Zoom in">
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="canvas-stage" ref={stageRef}>
              <div className="uv-board">
                <span className="board-note" aria-hidden>
                  {selectedPart === 'head' ? 'front = the face ↘' : 'paint on the faces ↘'}
                </span>
                <ConnectedUVEditor
                  part={selectedPart}
                  layer={selectedLayer}
                  skinData={skinData}
                  onPaint={handlePaint}
                  onBatchPaint={handleBatchPaint}
                  onStrokeEnd={handleStrokeEnd}
                  onColorPicked={handleColorPicked}
                  scale={scale}
                  selectedColor={selectedColor}
                  secondaryColor={secondaryColor}
                  tool={tool}
                  bodyParts={bodyParts}
                  showGrid={showGrid}
                  onHoverChange={setHoverInfo}
                />
              </div>
            </div>
          </div>

          <div className="status-bar">
            <div className="legend">
              {LEGEND.map(face => (
                <div key={face} className="legend-item">
                  <span className={`legend-key ${face === 'Front' ? 'front' : ''}`}>{FACE_KEYS[face]}</span>
                  {face.toLowerCase()}
                </div>
              ))}
            </div>
            <span className="cursor-info">
              {hoverInfo
                ? `${hoverInfo.face.toLowerCase()} · x${hoverInfo.x} y${hoverInfo.y} → uv(${hoverInfo.uvX},${hoverInfo.uvY})`
                : 'right-click paints the 2nd color'}
            </span>
          </div>
        </main>

        {/* Right Column */}
        <aside className="right-sidebar">
          <SkinPreview3D
            skinData={skinData}
            autoRotate={autoRotate}
            setAutoRotate={setAutoRotate}
            selectedPart={selectedPart}
            modelType={modelType}
          />

          <ColorCard
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            secondaryColor={secondaryColor}
            setSecondaryColor={setSecondaryColor}
            onSwap={swapColors}
            colorHistory={colorHistory}
          />

          <div className="toggle-row">
            <div className="toggle-group">
              <span className="toggle-label">model</span>
              <ModelTypeSelector modelType={modelType} setModelType={setModelType} />
            </div>
            <div className="toggle-group">
              <span className="toggle-label">layer</span>
              <LayerToggle selectedLayer={selectedLayer} setSelectedLayer={setSelectedLayer} />
            </div>
          </div>

          <section className="card">
            <div className="card-header">
              <span className="card-title">Body part</span>
              <span className="card-meta">click to edit</span>
            </div>
            <BodyPartSelector selectedPart={selectedPart} setSelectedPart={setSelectedPart} />
          </section>
        </aside>
      </div>
    </div>
  );
}
