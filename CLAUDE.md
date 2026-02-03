# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Minecraft skin editor web application built with Next.js, React, and Three.js. Users paint on 2D UV maps (展開図) for each body part, with real-time reflection on a 3D model preview.

## Development Commands

```bash
# All commands run from src/ directory
cd src

npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

**Core Technologies:**
- Next.js 16 (App Router)
- React 19 with TypeScript
- Three.js for 3D rendering
- HTML5 Canvas for 2D pixel editing

**Project Structure (src/):**
```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout with Press Start 2P font
│   ├── page.tsx            # Entry point (dynamic import, ssr: false)
│   └── globals.css         # Pixel-art styles
├── components/editor/      # Editor components
│   ├── MinecraftSkinEditor.tsx   # Main orchestrating component
│   ├── SkinPreview3D.tsx         # Three.js 3D preview
│   ├── ConnectedUVEditor.tsx     # Canvas 2D UV editor
│   ├── ToolPanel.tsx             # Brush/Eraser selection
│   ├── ColorPicker.tsx           # Color picker + presets
│   └── BodyPartSelector.tsx      # Body part buttons
├── constants/              # Data constants
│   ├── bodyParts.ts        # BODY_PARTS UV mapping definitions
│   ├── colors.ts           # Preset colors
│   └── skin.ts             # SKIN_WIDTH=64, SKIN_HEIGHT=64
├── types/                  # TypeScript types
│   └── index.ts            # Color, Region, BodyPart, Tool types
└── utils/                  # Utility functions
    ├── colorUtils.ts       # Hex<->RGB conversion
    ├── skinInitializer.ts  # Default skin generation
    └── exportSkin.ts       # PNG download
```

**Key Data Structures:**
- `BODY_PARTS` object defines UV layout mappings for head, body, arms, and legs
- Skin data stored as 64x64 RGBA `Uint8ClampedArray` (Minecraft skin format)
- UV coordinates map 2D editor positions to actual skin texture positions

**UV Mapping System:**
- Each body part region has `x, y, w, h` (editor position) and `uvX, uvY` (skin texture position)
- Editor displays connected faces in a logical layout (Top, Right, Front, Left, Back, Bottom)
- Painting on editor updates skinData array, which triggers texture update on 3D model

## Three.js in Next.js Notes

- All Three.js components use `'use client'` directive
- Page uses dynamic import with `{ ssr: false }` to avoid SSR issues
- All Three.js code runs inside useEffect (client-side only)
- Proper cleanup in useEffect return: `renderer.dispose()`, `cancelAnimationFrame()`
