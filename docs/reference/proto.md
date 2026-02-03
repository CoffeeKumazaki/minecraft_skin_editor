
## 初期開発
minecraftのスキンエディターを作りたい
基本的なペイントツールだけで、各パーツは展開図でペイント、３Dモデルにはリアルタイムに反映するようなデザインにしたい

```
import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';

const SKIN_WIDTH = 64;
const SKIN_HEIGHT = 64;

// Body part definitions with connected UV layout
const BODY_PARTS = {
  head: {
    name: 'Head',
    //      [Top]
    // [R] [Front] [L] [Back]
    //      [Bot]
    layout: {
      width: 32,
      height: 24,
      regions: [
        { name: 'Top', x: 8, y: 0, w: 8, h: 8, uvX: 8, uvY: 0 },
        { name: 'Right', x: 0, y: 8, w: 8, h: 8, uvX: 0, uvY: 8 },
        { name: 'Front', x: 8, y: 8, w: 8, h: 8, uvX: 8, uvY: 8 },
        { name: 'Left', x: 16, y: 8, w: 8, h: 8, uvX: 16, uvY: 8 },
        { name: 'Back', x: 24, y: 8, w: 8, h: 8, uvX: 24, uvY: 8 },
        { name: 'Bottom', x: 8, y: 16, w: 8, h: 8, uvX: 16, uvY: 0 },
      ]
    }
  },
  body: {
    name: 'Body',
    layout: {
      width: 24,
      height: 20,
      regions: [
        { name: 'Top', x: 4, y: 0, w: 8, h: 4, uvX: 20, uvY: 16 },
        { name: 'Right', x: 0, y: 4, w: 4, h: 12, uvX: 16, uvY: 20 },
        { name: 'Front', x: 4, y: 4, w: 8, h: 12, uvX: 20, uvY: 20 },
        { name: 'Left', x: 12, y: 4, w: 4, h: 12, uvX: 28, uvY: 20 },
        { name: 'Back', x: 16, y: 4, w: 8, h: 12, uvX: 32, uvY: 20 },
        { name: 'Bottom', x: 4, y: 16, w: 8, h: 4, uvX: 28, uvY: 16 },
      ]
    }
  },
  rightArm: {
    name: 'Right Arm',
    layout: {
      width: 16,
      height: 20,
      regions: [
        { name: 'Top', x: 4, y: 0, w: 4, h: 4, uvX: 44, uvY: 16 },
        { name: 'Right', x: 0, y: 4, w: 4, h: 12, uvX: 40, uvY: 20 },
        { name: 'Front', x: 4, y: 4, w: 4, h: 12, uvX: 44, uvY: 20 },
        { name: 'Left', x: 8, y: 4, w: 4, h: 12, uvX: 48, uvY: 20 },
        { name: 'Back', x: 12, y: 4, w: 4, h: 12, uvX: 52, uvY: 20 },
        { name: 'Bottom', x: 4, y: 16, w: 4, h: 4, uvX: 48, uvY: 16 },
      ]
    }
  },
  leftArm: {
    name: 'Left Arm',
    layout: {
      width: 16,
      height: 20,
      regions: [
        { name: 'Top', x: 4, y: 0, w: 4, h: 4, uvX: 36, uvY: 48 },
        { name: 'Right', x: 0, y: 4, w: 4, h: 12, uvX: 32, uvY: 52 },
        { name: 'Front', x: 4, y: 4, w: 4, h: 12, uvX: 36, uvY: 52 },
        { name: 'Left', x: 8, y: 4, w: 4, h: 12, uvX: 40, uvY: 52 },
        { name: 'Back', x: 12, y: 4, w: 4, h: 12, uvX: 44, uvY: 52 },
        { name: 'Bottom', x: 4, y: 16, w: 4, h: 4, uvX: 40, uvY: 48 },
      ]
    }
  },
  rightLeg: {
    name: 'Right Leg',
    layout: {
      width: 16,
      height: 20,
      regions: [
        { name: 'Top', x: 4, y: 0, w: 4, h: 4, uvX: 4, uvY: 16 },
        { name: 'Right', x: 0, y: 4, w: 4, h: 12, uvX: 0, uvY: 20 },
        { name: 'Front', x: 4, y: 4, w: 4, h: 12, uvX: 4, uvY: 20 },
        { name: 'Left', x: 8, y: 4, w: 4, h: 12, uvX: 8, uvY: 20 },
        { name: 'Back', x: 12, y: 4, w: 4, h: 12, uvX: 12, uvY: 20 },
        { name: 'Bottom', x: 4, y: 16, w: 4, h: 4, uvX: 8, uvY: 16 },
      ]
    }
  },
  leftLeg: {
    name: 'Left Leg',
    layout: {
      width: 16,
      height: 20,
      regions: [
        { name: 'Top', x: 4, y: 0, w: 4, h: 4, uvX: 20, uvY: 48 },
        { name: 'Right', x: 0, y: 4, w: 4, h: 12, uvX: 16, uvY: 52 },
        { name: 'Front', x: 4, y: 4, w: 4, h: 12, uvX: 20, uvY: 52 },
        { name: 'Left', x: 8, y: 4, w: 4, h: 12, uvX: 24, uvY: 52 },
        { name: 'Back', x: 12, y: 4, w: 4, h: 12, uvX: 28, uvY: 52 },
        { name: 'Bottom', x: 4, y: 16, w: 4, h: 4, uvX: 24, uvY: 48 },
      ]
    }
  }
};

// 3D Model component
const SkinPreview3D = ({ skinData, autoRotate, setAutoRotate }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const textureRef = useRef(null);
  const rotationRef = useRef({ x: 0.2, y: 0 });
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    
    const camera = new THREE.PerspectiveCamera(45, 300 / 400, 0.1, 1000);
    camera.position.z = 40;
    camera.position.y = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(300, 400);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    const canvas = document.createElement('canvas');
    canvas.width = SKIN_WIDTH;
    canvas.height = SKIN_HEIGHT;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(SKIN_WIDTH, SKIN_HEIGHT);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    textureRef.current = { texture, canvas, ctx, imageData };

    const material = new THREE.MeshLambertMaterial({ 
      map: texture,
      transparent: true,
      alphaTest: 0.1
    });

    const group = new THREE.Group();

    const createUVs = (x, y, w, h) => {
      const u1 = x / SKIN_WIDTH;
      const v1 = 1 - (y + h) / SKIN_HEIGHT;
      const u2 = (x + w) / SKIN_WIDTH;
      const v2 = 1 - y / SKIN_HEIGHT;
      return [u1, v2, u2, v2, u1, v1, u2, v1];
    };

    const createBodyPart = (width, height, depth, uvData, position) => {
      const geometry = new THREE.BoxGeometry(width, height, depth);
      const uvAttribute = geometry.attributes.uv;
      const uvs = uvAttribute.array;
      
      let uvIndex = 0;
      for (let face = 0; face < 6; face++) {
        const faceUVs = uvData[face];
        for (let i = 0; i < 4; i++) {
          uvs[uvIndex++] = faceUVs[i * 2];
          uvs[uvIndex++] = faceUVs[i * 2 + 1];
        }
      }
      uvAttribute.needsUpdate = true;
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...position);
      return mesh;
    };

    // Head
    const headUVs = [
      createUVs(0, 8, 8, 8),
      createUVs(16, 8, 8, 8),
      createUVs(8, 0, 8, 8),
      createUVs(16, 0, 8, 8),
      createUVs(8, 8, 8, 8),
      createUVs(24, 8, 8, 8),
    ];
    group.add(createBodyPart(8, 8, 8, headUVs, [0, 14, 0]));

    // Body
    const bodyUVs = [
      createUVs(16, 20, 4, 12),
      createUVs(28, 20, 4, 12),
      createUVs(20, 16, 8, 4),
      createUVs(28, 16, 8, 4),
      createUVs(20, 20, 8, 12),
      createUVs(32, 20, 8, 12),
    ];
    group.add(createBodyPart(8, 12, 4, bodyUVs, [0, 4, 0]));

    // Right Arm
    const rightArmUVs = [
      createUVs(40, 20, 4, 12),
      createUVs(48, 20, 4, 12),
      createUVs(44, 16, 4, 4),
      createUVs(48, 16, 4, 4),
      createUVs(44, 20, 4, 12),
      createUVs(52, 20, 4, 12),
    ];
    group.add(createBodyPart(4, 12, 4, rightArmUVs, [-6, 4, 0]));

    // Left Arm
    const leftArmUVs = [
      createUVs(32, 52, 4, 12),
      createUVs(40, 52, 4, 12),
      createUVs(36, 48, 4, 4),
      createUVs(40, 48, 4, 4),
      createUVs(36, 52, 4, 12),
      createUVs(44, 52, 4, 12),
    ];
    group.add(createBodyPart(4, 12, 4, leftArmUVs, [6, 4, 0]));

    // Right Leg
    const rightLegUVs = [
      createUVs(0, 20, 4, 12),
      createUVs(8, 20, 4, 12),
      createUVs(4, 16, 4, 4),
      createUVs(8, 16, 4, 4),
      createUVs(4, 20, 4, 12),
      createUVs(12, 20, 4, 12),
    ];
    group.add(createBodyPart(4, 12, 4, rightLegUVs, [-2, -8, 0]));

    // Left Leg
    const leftLegUVs = [
      createUVs(16, 52, 4, 12),
      createUVs(24, 52, 4, 12),
      createUVs(20, 48, 4, 4),
      createUVs(24, 48, 4, 4),
      createUVs(20, 52, 4, 12),
      createUVs(28, 52, 4, 12),
    ];
    group.add(createBodyPart(4, 12, 4, leftLegUVs, [2, -8, 0]));

    scene.add(group);
    sceneRef.current = { scene, camera, group };

    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (autoRotate && !isDragging.current) {
        rotationRef.current.y += 0.01;
      }
      group.rotation.y = rotationRef.current.y;
      group.rotation.x = rotationRef.current.x;
      renderer.render(scene, camera);
    };
    animate();

    const handleMouseDown = (e) => {
      isDragging.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - lastMousePos.current.x;
      const deltaY = e.clientY - lastMousePos.current.y;
      rotationRef.current = {
        x: Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationRef.current.x + deltaY * 0.01)),
        y: rotationRef.current.y + deltaX * 0.01
      };
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      cancelAnimationFrame(animationId);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [autoRotate]);

  useEffect(() => {
    if (!textureRef.current) return;
    const { texture, canvas, ctx, imageData } = textureRef.current;
    
    for (let i = 0; i < skinData.length; i++) {
      imageData.data[i] = skinData[i];
    }
    ctx.putImageData(imageData, 0, 0);
    texture.needsUpdate = true;
  }, [skinData]);

  return (
    <div>
      <div ref={containerRef} style={{ cursor: 'grab' }} />
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'center' }}>
        <button 
          className={`pixel-btn ${autoRotate ? 'active' : ''}`}
          onClick={() => setAutoRotate(!autoRotate)}
        >
          {autoRotate ? '⏸️ Stop' : '▶️ Rotate'}
        </button>
      </div>
    </div>
  );
};

// Connected UV Map Editor
const ConnectedUVEditor = ({ part, skinData, onPaint, scale, selectedColor, tool }) => {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const { layout } = BODY_PARTS[part];

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw each region
    layout.regions.forEach(region => {
      for (let py = 0; py < region.h; py++) {
        for (let px = 0; px < region.w; px++) {
          const skinX = region.uvX + px;
          const skinY = region.uvY + py;
          const idx = (skinY * SKIN_WIDTH + skinX) * 4;
          
          const r = skinData[idx];
          const g = skinData[idx + 1];
          const b = skinData[idx + 2];
          const a = skinData[idx + 3];
          
          if (a > 0) {
            ctx.fillStyle = `rgba(${r},${g},${b},${a / 255})`;
            ctx.fillRect((region.x + px) * scale, (region.y + py) * scale, scale, scale);
          }
        }
      }
    });

    // Draw grid
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= layout.width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * scale, 0);
      ctx.lineTo(x * scale, layout.height * scale);
      ctx.stroke();
    }
    for (let y = 0; y <= layout.height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * scale);
      ctx.lineTo(layout.width * scale, y * scale);
      ctx.stroke();
    }

    // Draw region borders and labels
    ctx.strokeStyle = 'rgba(78, 205, 196, 0.5)';
    ctx.lineWidth = 2;
    ctx.font = `${Math.max(8, scale * 0.8)}px "Press Start 2P", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    layout.regions.forEach(region => {
      ctx.strokeRect(
        region.x * scale, 
        region.y * scale, 
        region.w * scale, 
        region.h * scale
      );
      
      // Draw label
      ctx.fillStyle = 'rgba(78, 205, 196, 0.7)';
      const labelX = (region.x + region.w / 2) * scale;
      const labelY = (region.y + region.h / 2) * scale;
      ctx.fillText(region.name[0], labelX, labelY);
    });
  }, [layout, skinData, scale]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const getPixelFromEvent = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / scale);
    const y = Math.floor((e.clientY - rect.top) / scale);
    
    // Find which region this pixel belongs to
    for (const region of layout.regions) {
      if (x >= region.x && x < region.x + region.w &&
          y >= region.y && y < region.y + region.h) {
        const localX = x - region.x;
        const localY = y - region.y;
        return {
          skinX: region.uvX + localX,
          skinY: region.uvY + localY
        };
      }
    }
    return null;
  };

  const paint = (e) => {
    const pixel = getPixelFromEvent(e);
    if (pixel) {
      onPaint(
        pixel.skinX, 
        pixel.skinY, 
        tool === 'eraser' ? { r: 0, g: 0, b: 0, a: 0 } : selectedColor
      );
    }
  };

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    paint(e);
  };

  const handleMouseMove = (e) => {
    if (isDrawing.current) {
      paint(e);
    }
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  return (
    <canvas
      ref={canvasRef}
      width={layout.width * scale}
      height={layout.height * scale}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        cursor: 'crosshair',
        imageRendering: 'pixelated',
        borderRadius: '4px',
      }}
    />
  );
};

// Main App
export default function MinecraftSkinEditor() {
  const [skinData, setSkinData] = useState(() => {
    const data = new Uint8ClampedArray(SKIN_WIDTH * SKIN_HEIGHT * 4);
    const skinColor = { r: 200, g: 150, b: 110 };
    const shirtColor = { r: 0, g: 170, b: 170 };
    const pantsColor = { r: 60, g: 60, b: 180 };
    const hairColor = { r: 70, g: 50, b: 30 };
    
    // Head - skin
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 32; x++) {
        const idx = (y * SKIN_WIDTH + x) * 4;
        if (y < 8) {
          // Top of head - hair
          data[idx] = hairColor.r;
          data[idx + 1] = hairColor.g;
          data[idx + 2] = hairColor.b;
        } else {
          data[idx] = skinColor.r;
          data[idx + 1] = skinColor.g;
          data[idx + 2] = skinColor.b;
        }
        data[idx + 3] = 255;
      }
    }
    
    // Body - shirt
    for (let y = 16; y < 32; y++) {
      for (let x = 16; x < 40; x++) {
        const idx = (y * SKIN_WIDTH + x) * 4;
        data[idx] = shirtColor.r;
        data[idx + 1] = shirtColor.g;
        data[idx + 2] = shirtColor.b;
        data[idx + 3] = 255;
      }
    }
    
    // Right arm
    for (let y = 16; y < 32; y++) {
      for (let x = 40; x < 56; x++) {
        const idx = (y * SKIN_WIDTH + x) * 4;
        data[idx] = skinColor.r;
        data[idx + 1] = skinColor.g;
        data[idx + 2] = skinColor.b;
        data[idx + 3] = 255;
      }
    }
    
    // Left arm
    for (let y = 48; y < 64; y++) {
      for (let x = 32; x < 48; x++) {
        const idx = (y * SKIN_WIDTH + x) * 4;
        data[idx] = skinColor.r;
        data[idx + 1] = skinColor.g;
        data[idx + 2] = skinColor.b;
        data[idx + 3] = 255;
      }
    }
    
    // Right leg
    for (let y = 16; y < 32; y++) {
      for (let x = 0; x < 16; x++) {
        const idx = (y * SKIN_WIDTH + x) * 4;
        data[idx] = pantsColor.r;
        data[idx + 1] = pantsColor.g;
        data[idx + 2] = pantsColor.b;
        data[idx + 3] = 255;
      }
    }
    
    // Left leg
    for (let y = 48; y < 64; y++) {
      for (let x = 16; x < 32; x++) {
        const idx = (y * SKIN_WIDTH + x) * 4;
        data[idx] = pantsColor.r;
        data[idx + 1] = pantsColor.g;
        data[idx + 2] = pantsColor.b;
        data[idx + 3] = 255;
      }
    }
    
    return data;
  });

  const [selectedColor, setSelectedColor] = useState({ r: 255, g: 100, b: 100, a: 255 });
  const [tool, setTool] = useState('brush');
  const [selectedPart, setSelectedPart] = useState('head');
  const [autoRotate, setAutoRotate] = useState(true);

  const handlePaint = useCallback((x, y, color) => {
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

  const handleColorChange = (e) => {
    const hex = e.target.value;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    setSelectedColor({ r, g, b, a: 255 });
  };

  const colorToHex = (color) => {
    return `#${color.r.toString(16).padStart(2, '0')}${color.g.toString(16).padStart(2, '0')}${color.b.toString(16).padStart(2, '0')}`;
  };

  const downloadSkin = () => {
    const canvas = document.createElement('canvas');
    canvas.width = SKIN_WIDTH;
    canvas.height = SKIN_HEIGHT;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(SKIN_WIDTH, SKIN_HEIGHT);
    for (let i = 0; i < skinData.length; i++) {
      imageData.data[i] = skinData[i];
    }
    ctx.putImageData(imageData, 0, 0);
    
    const link = document.createElement('a');
    link.download = 'minecraft-skin.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const presetColors = [
    '#FFD93D', '#FF6B6B', '#4ECDC4', '#45B7D1', 
    '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8B500',
    '#2C3E50', '#E74C3C', '#3498DB', '#1ABC9C',
    '#F39C12', '#9B59B6', '#34495E', '#FFFFFF',
    '#000000', '#808080', '#C0C0C0', '#8B4513',
  ];

  // Calculate scale based on part
  const getScale = (part) => {
    const layout = BODY_PARTS[part].layout;
    const maxWidth = 320;
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        * { box-sizing: border-box; }
        
        .pixel-border {
          border: 4px solid #4a4a6a;
          box-shadow: 
            inset 2px 2px 0 #6a6a8a,
            inset -2px -2px 0 #2a2a4a,
            4px 4px 0 #0a0a1a;
        }
        
        .pixel-btn {
          background: linear-gradient(180deg, #5a5a7a 0%, #3a3a5a 100%);
          border: 3px solid #6a6a8a;
          box-shadow: 
            inset 1px 1px 0 #7a7a9a,
            inset -1px -1px 0 #2a2a4a,
            2px 2px 0 #0a0a1a;
          color: #fff;
          padding: 8px 16px;
          font-family: inherit;
          font-size: 10px;
          cursor: pointer;
          transition: all 0.1s;
        }
        
        .pixel-btn:hover {
          background: linear-gradient(180deg, #6a6a8a 0%, #4a4a6a 100%);
          transform: translate(-1px, -1px);
        }
        
        .pixel-btn:active {
          transform: translate(1px, 1px);
          box-shadow: none;
        }
        
        .pixel-btn.active {
          background: linear-gradient(180deg, #4ecdc4 0%, #26a69a 100%);
          border-color: #80deea;
        }
        
        .part-btn {
          background: linear-gradient(180deg, #2a2a4a 0%, #1a1a3a 100%);
          border: 2px solid #3a3a5a;
          color: #8a8aaa;
          padding: 8px 12px;
          font-family: inherit;
          font-size: 9px;
          cursor: pointer;
          transition: all 0.15s;
          margin: 3px;
          border-radius: 4px;
        }
        
        .part-btn:hover {
          background: linear-gradient(180deg, #3a3a5a 0%, #2a2a4a 100%);
          color: #fff;
          transform: translateY(-2px);
        }
        
        .part-btn.active {
          background: linear-gradient(180deg, #4ecdc4 0%, #26a69a 100%);
          border-color: #80deea;
          color: #fff;
          box-shadow: 0 0 10px rgba(78, 205, 196, 0.5);
        }
        
        .legend {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
          justify-content: center;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 7px;
          color: #6a6a8a;
        }
        
        .legend-dot {
          width: 12px;
          height: 12px;
          background: rgba(78, 205, 196, 0.3);
          border: 1px solid rgba(78, 205, 196, 0.7);
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          color: rgba(78, 205, 196, 0.9);
        }
      `}</style>

      <h1 style={{
        textAlign: 'center',
        fontSize: '18px',
        marginBottom: '24px',
        textShadow: '2px 2px 0 #000, 4px 4px 0 #4ecdc4',
        letterSpacing: '2px',
      }}>
        ⛏️ MINECRAFT SKIN EDITOR ⛏️
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
          <h3 style={{ fontSize: '10px', marginBottom: '12px', color: '#4ecdc4' }}>🎨 TOOLS</h3>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button 
              className={`pixel-btn ${tool === 'brush' ? 'active' : ''}`}
              onClick={() => setTool('brush')}
            >
              🖌️ Brush
            </button>
            <button 
              className={`pixel-btn ${tool === 'eraser' ? 'active' : ''}`}
              onClick={() => setTool('eraser')}
            >
              🧽 Eraser
            </button>
          </div>

          <h3 style={{ fontSize: '10px', marginBottom: '12px', color: '#4ecdc4' }}>🎨 COLOR</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <input 
              type="color" 
              value={colorToHex(selectedColor)}
              onChange={handleColorChange}
              style={{
                width: '48px',
                height: '48px',
                border: '3px solid #4a4a6a',
                cursor: 'pointer',
                background: 'none',
                borderRadius: '4px',
              }}
            />
            <div style={{
              width: '48px',
              height: '48px',
              background: colorToHex(selectedColor),
              border: '3px solid #4a4a6a',
              borderRadius: '4px',
            }} />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '4px',
            marginBottom: '20px',
          }}>
            {presetColors.map((color, i) => (
              <button
                key={i}
                onClick={() => {
                  const r = parseInt(color.slice(1, 3), 16);
                  const g = parseInt(color.slice(3, 5), 16);
                  const b = parseInt(color.slice(5, 7), 16);
                  setSelectedColor({ r, g, b, a: 255 });
                }}
                style={{
                  width: '28px',
                  height: '28px',
                  background: color,
                  border: colorToHex(selectedColor) === color ? '3px solid #4ecdc4' : '2px solid #2a2a4a',
                  cursor: 'pointer',
                  borderRadius: '2px',
                  transition: 'transform 0.1s',
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              />
            ))}
          </div>

          <h3 style={{ fontSize: '10px', marginBottom: '12px', color: '#4ecdc4' }}>📦 BODY PARTS</h3>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
            {Object.entries(BODY_PARTS).map(([key, part]) => (
              <button
                key={key}
                className={`part-btn ${selectedPart === key ? 'active' : ''}`}
                onClick={() => setSelectedPart(key)}
              >
                {part.name}
              </button>
            ))}
          </div>

          <button 
            className="pixel-btn"
            onClick={downloadSkin}
            style={{ width: '100%', marginTop: '20px', padding: '12px' }}
          >
            💾 Download PNG
          </button>
        </div>

        {/* Center Panel - UV Editor */}
        <div className="pixel-border" style={{
          background: 'rgba(20, 20, 40, 0.95)',
          padding: '20px',
          borderRadius: '8px',
        }}>
          <h3 style={{ fontSize: '12px', marginBottom: '16px', color: '#4ecdc4', textAlign: 'center' }}>
            📐 {BODY_PARTS[selectedPart].name.toUpperCase()} - UV MAP
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

        {/* Right Panel - 3D Preview */}
        <div className="pixel-border" style={{
          background: 'rgba(20, 20, 40, 0.95)',
          padding: '20px',
          borderRadius: '8px',
        }}>
          <h3 style={{ fontSize: '12px', marginBottom: '16px', color: '#4ecdc4', textAlign: 'center' }}>
            🎮 3D PREVIEW
          </h3>
          <div style={{ fontSize: '8px', color: '#6a6a8a', marginBottom: '8px', textAlign: 'center' }}>
            Drag to rotate manually
          </div>
          <SkinPreview3D 
            skinData={skinData} 
            autoRotate={autoRotate}
            setAutoRotate={setAutoRotate}
          />
        </div>
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
```