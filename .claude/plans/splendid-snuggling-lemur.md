# 塗りつぶし（バケツ）機能の実装計画

## 概要

マインクラフトスキンエディタに塗りつぶし（フラッドフィル）ツールを追加する。クリックしたピクセルと同じ色の連結領域を選択色で塗りつぶす。

## 設計方針

- **色の一致判定**: 完全一致（RGBA全て一致）- ピクセルアート向け
- **境界**: 各リージョン（顔の面）内に限定
- **操作**: 左クリック=プライマリ色、右クリック=セカンダリ色
- **Undo/Redo**: 1回の塗りつぶし = 1つの履歴エントリ

## 変更ファイル

### 1. [src/types/index.ts](src/types/index.ts#L32) - Tool型に追加

```typescript
export type Tool = 'brush' | 'eraser' | 'eyedropper' | 'bucket';
```

### 2. [src/components/editor/ToolPanel.tsx](src/components/editor/ToolPanel.tsx#L10-L14) - ツールボタン追加

TOOLS配列にbucketを追加:
```typescript
{ id: 'bucket', icon: '🪣', label: 'Fill' },
```

### 3. [src/utils/floodFill.ts](src/utils/) - 新規作成

フラッドフィルアルゴリズム（BFS）:
- 開始位置の色を取得
- リージョン境界内で同色ピクセルを探索
- 塗りつぶすピクセル座標の配列を返す

```typescript
export function floodFill(
  skinData: Uint8ClampedArray,
  startSkinX: number,
  startSkinY: number,
  region: Region,
  targetColor: Color
): Array<{ x: number; y: number }>
```

### 4. [src/components/editor/ConnectedUVEditor.tsx](src/components/editor/ConnectedUVEditor.tsx) - バケツ処理追加

**Props追加** (L8-19):
```typescript
onBatchPaint?: (pixels: Array<{ x: number; y: number }>, color: Color) => void;
```

**getPixelFromEvent変更** (L116-136):
- regionも返すように修正

**paint関数変更** (L138-160):
- tool === 'bucket' の場合、floodFillを呼びonBatchPaintを実行

**handleMouseMove変更** (L169-173):
- bucketツール時はドラッグで描画しない

**カーソル追加** (L183-189):
- bucketCursor SVGを定義
- getCursor()にbucket分岐追加

### 5. [src/components/editor/MinecraftSkinEditor.tsx](src/components/editor/MinecraftSkinEditor.tsx) - バッチ更新追加

**handleBatchPaint追加** (L51付近):
```typescript
const handleBatchPaint = useCallback((pixels: Array<{ x: number; y: number }>, color: Color) => {
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
}, [commitToHistory]);
```

**ConnectedUVEditorにprop追加** (L115-126):
```typescript
onBatchPaint={handleBatchPaint}
```

## 検証手順

1. `npm run dev` で開発サーバー起動
2. ツールパネルにバケツアイコン（🪣）が表示されることを確認
3. バケツツールを選択し、キャンバス上でカーソルがバケツに変わることを確認
4. 同色領域をクリックして塗りつぶされることを確認
5. 右クリックでセカンダリ色で塗りつぶされることを確認
6. リージョン境界を超えて塗りつぶされないことを確認
7. Ctrl+Z (Cmd+Z) で塗りつぶしが1操作として元に戻ることを確認
8. `npm run build` でビルドエラーがないことを確認
