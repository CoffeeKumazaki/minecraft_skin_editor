# Fix: Left/Right UV Mapping Reversal in 3D Preview

## Problem
3Dプレビューで、各ボディパーツの左右(L/R)テクスチャが逆になっている。
例: 顔のR(右)側テクスチャが、3Dモデルの左側に表示される。

## Root Cause
Three.jsのBoxGeometryのUV面順序:
- Index 0: +X face
- Index 1: -X face

カメラがz=40から原点を見る構成で:
- +X方向 = 視聴者の右側
- -X方向 = 視聴者の左側

Minecraftの慣例:
- キャラの右側 → 視聴者の左側 (−X face)
- キャラの左側 → 視聴者の右側 (+X face)

現在のコードでは、Rightテクスチャを+X face(視聴者の右)に割り当てているため逆。

## Solution
[SkinPreview3D.tsx](src/components/editor/SkinPreview3D.tsx) のUV配列で、Index 0と1を入れ替える。

### Changes Required

#### Head (Lines 190-197)
```typescript
// Before
const headUVs = [
  createUVs(0, 8, 8, 8),    // Right → +X
  createUVs(16, 8, 8, 8),   // Left → -X
  ...
];

// After
const headUVs = [
  createUVs(16, 8, 8, 8),   // Left → +X (viewer's right)
  createUVs(0, 8, 8, 8),    // Right → -X (viewer's left)
  ...
];
```

#### Body (Lines 201-208)
Index 0と1を入れ替え

#### Right Arm (Lines 212-219)
Index 0と1を入れ替え

#### Left Arm (Lines 223-230)
Index 0と1を入れ替え

#### Right Leg (Lines 234-241)
Index 0と1を入れ替え

#### Left Leg (Lines 245-252)
Index 0と1を入れ替え

#### Outer Layers (Lines 258-321)
同様に、各outerレイヤーのIndex 0と1を入れ替え:
- Head Outer
- Body Outer
- Right Arm Outer
- Left Arm Outer
- Right Leg Outer
- Left Leg Outer

## Files to Modify
- `src/components/editor/SkinPreview3D.tsx`

## Verification
1. `npm run dev` でサーバー起動
2. 各ボディパーツを選択し、R(Right)面にペイント
3. 3Dプレビューで、ペイントがキャラクターの右側(視聴者から見て左側)に表示されることを確認
4. L(Left)面も同様に確認
