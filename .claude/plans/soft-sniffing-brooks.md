# Minecraft Skin Editor: Outer Layer Support

## Overview
Add outer layer (overlay) support to the Minecraft skin editor. The 64x64 skin texture contains both inner and outer layers, with outer layers rendering slightly larger for accessories like hats, jackets, sleeves, and pants overlays.

## Minecraft Skin Format
Inner layer UV positions (currently implemented):
- Head: (0,0) region
- Body: (16,16) region
- Right Arm: (40,16) region
- Left Arm: (32,48) region
- Right Leg: (0,16) region
- Left Leg: (16,48) region

Outer layer UV positions (to be added):
- Head (Hat): (32,0) region
- Body (Jacket): (16,32) region
- Right Arm (Sleeve): (40,32) region
- Left Arm (Sleeve): (48,48) region
- Right Leg (Pants): (0,32) region
- Left Leg (Pants): (0,48) region

## Implementation Steps

### 1. Type System Updates
**File:** [types/index.ts](src/types/index.ts)

- Add `Layer` type: `'inner' | 'outer'`
- Add optional `outerLayout` property to `BodyPart` interface

### 2. Body Parts Constants
**File:** [constants/bodyParts.ts](src/constants/bodyParts.ts)

Add `outerLayout` with outer layer UV coordinates for each body part. The editor layout (x, y, w, h) stays the same; only UV coordinates (uvX, uvY) change.

Example for head:
```typescript
outerLayout: {
  width: 32,
  height: 24,
  regions: [
    { name: 'Top', x: 8, y: 0, w: 8, h: 8, uvX: 40, uvY: 0 },
    { name: 'Right', x: 0, y: 8, w: 8, h: 8, uvX: 32, uvY: 8 },
    // ... etc
  ]
}
```

### 3. Layer Toggle Component
**New File:** `src/components/editor/LayerToggle.tsx`

Simple toggle with two buttons: "Inner" and "Outer"

### 4. CSS Updates
**File:** [app/globals.css](src/app/globals.css)

Add `.layer-toggle` and `.layer-btn` styles (following existing button patterns)

### 5. Main Editor State
**File:** [components/editor/MinecraftSkinEditor.tsx](src/components/editor/MinecraftSkinEditor.tsx)

- Add `selectedLayer` state (`'inner' | 'outer'`)
- Import and render `LayerToggle` component
- Pass `selectedLayer` to `ConnectedUVEditor`

### 6. UV Editor Layer Support
**File:** [components/editor/ConnectedUVEditor.tsx](src/components/editor/ConnectedUVEditor.tsx)

- Add `layer` prop
- Select layout based on layer: `layer === 'outer' ? outerLayout : layout`
- Painting uses correct UV coordinates automatically

### 7. 3D Preview with Outer Layers
**File:** [components/editor/SkinPreview3D.tsx](src/components/editor/SkinPreview3D.tsx)

This is the most complex change:

1. Create outer layer meshes alongside inner meshes
2. Apply scale offset for outer layer (approx +0.5 per side for ~1.125x scale)
3. Add outer layer UV data arrays
4. Handle transparency and render order
5. Update outline system to track 12 meshes (6 inner + 6 outer)

Key considerations:
- Use `renderOrder` to ensure proper transparency rendering
- Outer material needs `transparent: true, alphaTest: 0.1`
- Both layers share the same texture

## Critical Files
1. [src/types/index.ts](src/types/index.ts) - Add Layer type
2. [src/constants/bodyParts.ts](src/constants/bodyParts.ts) - Add outerLayout UV mappings
3. [src/components/editor/SkinPreview3D.tsx](src/components/editor/SkinPreview3D.tsx) - Render outer layer meshes
4. [src/components/editor/ConnectedUVEditor.tsx](src/components/editor/ConnectedUVEditor.tsx) - Layer-aware UV mapping
5. [src/components/editor/MinecraftSkinEditor.tsx](src/components/editor/MinecraftSkinEditor.tsx) - Layer state management
6. `src/components/editor/LayerToggle.tsx` (new) - UI toggle component

## Verification
1. Run `npm run dev` and open http://localhost:3000
2. Verify layer toggle appears in UI
3. Switch to outer layer and paint on any body part
4. Confirm 3D preview shows outer layer mesh (slightly larger)
5. Verify inner layer content is preserved when switching layers
6. Export PNG and verify both layers are correctly saved in 64x64 format
7. Test undo/redo works across both layers
