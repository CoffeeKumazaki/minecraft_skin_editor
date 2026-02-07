# Steve/Alex Model Switching Implementation Plan

## Overview
Alexモデル（3pxの細い腕）とSteveモデル（4pxの腕）を切り替えられるようにする。

## Key Difference: Steve vs Alex
| Aspect | Steve | Alex |
|--------|-------|------|
| Arm Width | 4px | 3px |
| Arm Depth | 4px | 4px (same) |
| UV Face Width | Front/Back/Top/Bottom: 4px | Front/Back/Top/Bottom: 3px |
| Side Faces | 4px | 4px (depth is same) |

## Implementation Steps

### Step 1: Add ModelType Type
**File:** [types/index.ts](src/types/index.ts)

Add:
```typescript
export type ModelType = 'steve' | 'alex';
```

### Step 2: Create getBodyParts Function
**File:** [bodyParts.ts](src/constants/bodyParts.ts)

Refactor to support both models:
- Extract shared parts (head, body, legs) - these are identical
- Create Steve arm definitions (current, w=4)
- Create Alex arm definitions (w=3 for front/back/top/bottom faces)
- Export `getBodyParts(modelType: ModelType)` function
- Keep `BODY_PARTS` as default export for backward compatibility

Alex arm layout differences:
- `layout.width`: 14 (vs 16 for Steve)
- Front/Back/Top/Bottom regions: `w: 3` (vs 4)
- Right/Left (depth) regions: `w: 4` (unchanged, depth is same)

### Step 3: Create ModelTypeSelector Component
**File:** `src/components/editor/ModelTypeSelector.tsx` (new)

Follow [LayerToggle.tsx](src/components/editor/LayerToggle.tsx) pattern:
```typescript
'use client';
import { User } from 'lucide-react';
import { ModelType } from '@/types';

interface ModelTypeSelectorProps {
  modelType: ModelType;
  setModelType: (type: ModelType) => void;
}

export function ModelTypeSelector({ modelType, setModelType }: ModelTypeSelectorProps) {
  return (
    <div className="layer-toggle">
      <button
        className={`layer-btn ${modelType === 'steve' ? 'active' : ''}`}
        onClick={() => setModelType('steve')}
        title="Steve (4px arms)"
      >
        Steve
      </button>
      <button
        className={`layer-btn ${modelType === 'alex' ? 'active' : ''}`}
        onClick={() => setModelType('alex')}
        title="Alex (3px arms)"
      >
        Alex
      </button>
    </div>
  );
}
```

### Step 4: Update MinecraftSkinEditor
**File:** [MinecraftSkinEditor.tsx](src/components/editor/MinecraftSkinEditor.tsx)

Changes:
1. Import `ModelType`, `getBodyParts`, `ModelTypeSelector`
2. Add state: `const [modelType, setModelType] = useState<ModelType>('steve')`
3. Compute bodyParts: `const bodyParts = useMemo(() => getBodyParts(modelType), [modelType])`
4. Update `getScale` to use computed `bodyParts`
5. Pass `modelType` to `SkinPreview3D`
6. Pass `bodyParts` to `ConnectedUVEditor`
7. Add ModelTypeSelector UI in right sidebar (above Layer section)

### Step 5: Update ConnectedUVEditor
**File:** [ConnectedUVEditor.tsx](src/components/editor/ConnectedUVEditor.tsx)

Changes:
1. Accept `bodyParts` as prop instead of importing `BODY_PARTS`
2. Use `bodyParts[part]` instead of `BODY_PARTS[part]`

### Step 6: Update SkinPreview3D (Most Complex)
**File:** [SkinPreview3D.tsx](src/components/editor/SkinPreview3D.tsx)

Changes:
1. Accept `modelType` as prop
2. Add `modelType` to useEffect dependency array
3. Create arm geometry dynamically:

```typescript
const armWidth = modelType === 'alex' ? 3 : 4;
const armXOffset = modelType === 'alex' ? 5.5 : 6;

// Right Arm - conditional UVs
const rightArmUVs = modelType === 'alex' ? [
  createUVs(47, 20, 4, 12),  // Left side (depth=4)
  createUVs(40, 20, 4, 12),  // Right side (depth=4)
  createUVs(44, 16, 3, 4),   // Top (3px)
  createUVs(47, 16, 3, 4),   // Bottom (3px)
  createUVs(44, 20, 3, 12),  // Front (3px)
  createUVs(50, 20, 3, 12),  // Back (3px)
] : [/* current Steve UVs */];

group.add(createBodyPart(armWidth, 12, 4, rightArmUVs, [-armXOffset, 4, 0]));
```

Similar updates for:
- Left Arm inner
- Right Arm outer
- Left Arm outer

## Files to Modify

| File | Change Type |
|------|-------------|
| [src/types/index.ts](src/types/index.ts) | Add ModelType |
| [src/constants/bodyParts.ts](src/constants/bodyParts.ts) | Add getBodyParts function |
| `src/components/editor/ModelTypeSelector.tsx` | New file |
| [src/components/editor/MinecraftSkinEditor.tsx](src/components/editor/MinecraftSkinEditor.tsx) | Add state, integrate |
| [src/components/editor/ConnectedUVEditor.tsx](src/components/editor/ConnectedUVEditor.tsx) | Accept bodyParts prop |
| [src/components/editor/SkinPreview3D.tsx](src/components/editor/SkinPreview3D.tsx) | Dynamic arm geometry |

## Design Decisions

1. **Function vs Separate Constants:** Use `getBodyParts(modelType)` function to avoid duplicating shared parts (head, body, legs are identical)

2. **Skin Data Preservation:** When switching models, existing skin data is preserved. The 64x64 texture format is the same - only the arm regions are interpreted differently.

3. **UI Placement:** Model selector placed above Layer toggle in right sidebar for visibility

## Bug Fix: 3D Model Disappears When Switching Models

### Root Cause (Updated)
React's cleanup function runs AFTER the new effect sets up. When modelType changes:
1. New useEffect runs → creates NEW scene, texture, renderer
2. Refs are updated (textureRef.current = new texture)
3. OLD cleanup runs → disposes what it thinks is "old" but is actually the NEW texture/renderer

The cleanup closure references the OLD variables, but those are already replaced by new ones. The issue is the `renderer.dispose()` and `texture.dispose()` calls.

### Solution
Store the renderer/texture in a local ref that we can check before disposing. Only dispose if the current ref still matches what we created.

**In [SkinPreview3D.tsx](src/components/editor/SkinPreview3D.tsx):**

1. At the start of useEffect, save a reference to this specific renderer instance:
```typescript
useEffect(() => {
  if (!containerRef.current) return;

  // Clear old content
  while (containerRef.current.firstChild) {
    containerRef.current.removeChild(containerRef.current.firstChild);
  }

  const scene = new THREE.Scene();
  // ... existing code ...

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  // Save THIS renderer to check in cleanup
  const currentRenderer = renderer;
  rendererRef.current = renderer;
```

2. In cleanup, check if this renderer is still the current one before disposing:
```typescript
return () => {
  cancelAnimationFrame(animationId);
  renderer.domElement.removeEventListener('mousedown', handleMouseDown);
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('mouseup', handleMouseUp);

  // Only dispose if this renderer is still the current one
  // (If a new effect has run, rendererRef.current will be different)
  if (rendererRef.current === currentRenderer) {
    group.children.forEach(child => {
      if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
        child.geometry.dispose();
      }
    });
    material.dispose();
    outerMaterial.dispose();
    texture.dispose();
    outlineMaterial.dispose();
    arrowMaterial.dispose();
    arrowGeometry.dispose();
    outlineMeshesRef.current = [];
    renderer.dispose();
  }
};
```

This ensures:
- When modelType changes, new effect runs and sets rendererRef.current to NEW renderer
- When old cleanup runs, `rendererRef.current !== currentRenderer` so it skips disposal
- Old renderer DOM element is already removed by container clearing at start of new effect

### Additional Fix: Initial Texture Population

**Root Cause of blank 3D:** When modelType changes, a NEW texture is created but it's EMPTY. The skinData useEffect only runs when `skinData` changes, not when modelType changes. So the existing skin data is never copied to the new texture until the user paints something.

**Solution:** After creating the new texture in the main useEffect, immediately populate it with the current skinData:

```typescript
// After line 88 (textureRef.current = { texture, canvas, ctx, imageData };)
// Add: Copy current skinData to the new texture immediately
for (let i = 0; i < skinData.length; i++) {
  imageData.data[i] = skinData[i];
}
ctx.putImageData(imageData, 0, 0);
texture.needsUpdate = true;
```

**Important:** Do NOT add `skinData` to the dependency array - that would recreate the scene on every pixel paint. Instead, just initialize the texture once when the scene is created. The existing skinData useEffect will handle subsequent updates.

### Additional Fix: Outline Visibility After Model Switch

**Problem:** When modelType changes, new outline meshes are created with `visible: false`. The selectedPart useEffect doesn't run because selectedPart hasn't changed, so the outline for the selected part remains invisible.

**Solution:** After creating the outline meshes in the main useEffect, set the correct visibility based on the current selectedPart:

```typescript
// After outlineMeshesRef.current = outlineMeshes; (around line 365)
// Add: Set initial visibility based on current selectedPart
const selectedIndex = PART_TO_INDEX[selectedPart];
outlineMeshes.forEach((mesh, index) => {
  mesh.visible = index === selectedIndex;
});
```

## Verification

1. Start dev server: `cd src && npm run dev`
2. Open http://localhost:3000
3. Test:
   - Switch between Steve and Alex models
   - Verify 3D preview shows correct arm width
   - Verify UV editor shows correct arm layout
   - Paint on arm faces and confirm updates in 3D
   - Switch layers (inner/outer) for both models
   - Download PNG and verify format
