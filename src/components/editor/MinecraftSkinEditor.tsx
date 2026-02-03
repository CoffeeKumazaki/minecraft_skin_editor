'use client';

import { useState, useCallback } from 'react';
import { BODY_PARTS } from '@/constants/bodyParts';
import { SKIN_WIDTH } from '@/constants/skin';
import { createDefaultSkin } from '@/utils/skinInitializer';
import { downloadSkin } from '@/utils/exportSkin';
import { Color, BodyPartKey, Tool } from '@/types';
import { ConnectedUVEditor } from './ConnectedUVEditor';
import { SkinPreview3D } from './SkinPreview3D';
import { ToolPanel } from './ToolPanel';
import { ColorPicker } from './ColorPicker';
import { BodyPartSelector } from './BodyPartSelector';

export function MinecraftSkinEditor() {
  const [skinData, setSkinData] = useState<Uint8ClampedArray>(() => createDefaultSkin());
  const [selectedColor, setSelectedColor] = useState<Color>({ r: 255, g: 100, b: 100, a: 255 });
  const [secondaryColor, setSecondaryColor] = useState<Color>({ r: 255, g: 255, b: 255, a: 255 });
  const [tool, setTool] = useState<Tool>('brush');
  const [selectedPart, setSelectedPart] = useState<BodyPartKey>('head');
  const [autoRotate, setAutoRotate] = useState(true);

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

  const getScale = (part: BodyPartKey) => {
    const layout = BODY_PARTS[part].layout;
    const maxWidth = 480;
    return Math.floor(maxWidth / layout.width);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      fontFamily: '"Press Start 2P", "Courier New", monospace',
      color: '#fff',
      padding: '20px',
    }}>
      <h1 style={{
        textAlign: 'center',
        fontSize: '18px',
        marginBottom: '24px',
        textShadow: '2px 2px 0 #000, 4px 4px 0 #4ecdc4',
        letterSpacing: '2px',
      }}>
        MINECRAFT SKIN EDITOR
      </h1>

      <div style={{
        display: 'flex',
        gap: '20px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
      }}>
        {/* Left Panel - Tools */}
        <div className="pixel-border" style={{
          background: 'rgba(20, 20, 40, 0.95)',
          padding: '16px',
          borderRadius: '8px',
          width: '220px',
        }}>
          <ToolPanel tool={tool} setTool={setTool} />
          <ColorPicker
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            secondaryColor={secondaryColor}
            setSecondaryColor={setSecondaryColor}
          />
          <BodyPartSelector selectedPart={selectedPart} setSelectedPart={setSelectedPart} />

          <button
            className="pixel-btn"
            onClick={() => downloadSkin(skinData)}
            style={{ width: '100%', marginTop: '20px', padding: '12px' }}
          >
            Download PNG
          </button>
        </div>

        {/* Center Panel - UV Editor */}
        <div className="pixel-border" style={{
          background: 'rgba(20, 20, 40, 0.95)',
          padding: '20px',
          borderRadius: '8px',
        }}>
          <h3 style={{ fontSize: '12px', marginBottom: '16px', color: '#4ecdc4', textAlign: 'center' }}>
            {BODY_PARTS[selectedPart].name.toUpperCase()} - UV MAP
          </h3>

          <div style={{
            background: '#0a0a1a',
            padding: '16px',
            borderRadius: '8px',
            display: 'inline-block',
          }}>
            <ConnectedUVEditor
              part={selectedPart}
              skinData={skinData}
              onPaint={handlePaint}
              scale={getScale(selectedPart)}
              selectedColor={selectedColor}
              secondaryColor={secondaryColor}
              tool={tool}
            />
          </div>

          <div className="legend">
            <div className="legend-item"><div className="legend-dot">T</div> Top</div>
            <div className="legend-item"><div className="legend-dot">B</div> Bottom</div>
            <div className="legend-item"><div className="legend-dot">F</div> Front</div>
            <div className="legend-item"><div className="legend-dot">K</div> Back</div>
            <div className="legend-item"><div className="legend-dot">R</div> Right</div>
            <div className="legend-item"><div className="legend-dot">L</div> Left</div>
          </div>
        </div>

      </div>

      {/* Floating 3D Preview - Top Right Overlay */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 100,
        background: 'rgba(20, 20, 40, 0.9)',
        padding: '8px',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
      }}>
        <SkinPreview3D
          skinData={skinData}
          autoRotate={autoRotate}
          setAutoRotate={setAutoRotate}
          selectedPart={selectedPart}
        />
      </div>

      <div style={{
        textAlign: 'center',
        marginTop: '24px',
        fontSize: '8px',
        color: '#4a4a6a',
      }}>
        Paint on UV map → Real-time 3D update → Download as 64x64 PNG
      </div>
    </div>
  );
}
