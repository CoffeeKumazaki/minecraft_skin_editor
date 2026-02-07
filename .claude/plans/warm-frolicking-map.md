# レイアウトをPiskel風に変更する計画

## 概要

Minecraft Skin EditorのレイアウトをPiskelスタイルに近づける。主な変更はカラーピッカーを下部から左サイドバーに移動すること。

## 現在のレイアウト

```
+------------+------------------+------------+
|   Tools    |                  |  3D Preview|
|   (56px)   |     Canvas       |  Model     |
|            |      Area        |  Layer     |
|            |                  |  Parts     |
+------------+------------------+  Download  |
|        Bottom Color Bar (64px)             |
+--------------------------------------------+
```

## 目標レイアウト

```
+--------+------------------------+------------+
| Tools  |                        | 3D Preview |
| ----   |                        | Layer      |
| Colors |      Canvas Area       | Parts      |
| Swap   |                        | Model      |
| Hist   |                        | Download   |
| Preset |                        |            |
| (80px) |                        |  (220px)   |
+--------+------------------------+------------+
```

## 変更対象ファイル

1. **globals.css** - CSSグリッドとスタイル変更
2. **MinecraftSkinEditor.tsx** - レイアウト構造変更
3. **ColorPickerVertical.tsx** - 新規作成（縦型カラーピッカー）
4. **ColorPicker.tsx** - 削除または非使用に

## 実装手順

### Step 1: CSS変数とグリッドの更新

**globals.css**

```css
:root {
  --left-toolbar-width: 80px;  /* 56px から拡大 */
  --sidebar-width: 220px;
  /* --colorbar-height: 64px; を削除 */
}

.editor-container {
  display: grid;
  grid-template-rows: 1fr;  /* ボトムバー削除 */
  grid-template-columns: var(--left-toolbar-width) 1fr var(--sidebar-width);
  grid-template-areas: "toolbar canvas sidebar";
  height: 100vh;
}
```

### Step 2: 左ツールバースタイル追加

**globals.css**

```css
.left-toolbar {
  grid-area: toolbar;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  gap: 12px;
  background: var(--bg-primary);
  border-right: 2px solid var(--border-color);
  overflow-y: auto;
}

.left-toolbar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.left-toolbar-section:last-child {
  border-bottom: none;
}
```

### Step 3: 縦型カラーピッカースタイル追加

**globals.css**

```css
/* Piskel風の重なるカラースウォッチ */
.color-swatch-pair {
  position: relative;
  width: 48px;
  height: 48px;
}

.color-swatch-primary {
  position: absolute;
  top: 0;
  left: 0;
  width: 32px;
  height: 32px;
  border: 2px solid var(--accent-color);
  border-radius: 4px;
  cursor: pointer;
  z-index: 2;
}

.color-swatch-secondary {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  border: 2px solid var(--accent-secondary);
  border-radius: 4px;
  cursor: pointer;
  z-index: 1;
}

.swap-btn-small {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  z-index: 3;
}

/* 縦型カラー履歴 */
.color-history-vertical {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
  max-width: 64px;
}

/* 縦型プリセット */
.color-presets-vertical {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3px;
  width: 100%;
}

.color-presets-vertical .color-preset {
  width: 18px;
  height: 18px;
}

/* HSVピッカー（左ツールバーから右に表示） */
.hsv-picker-popup-left {
  position: fixed;
  left: calc(var(--left-toolbar-width) + 8px);
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
}
```

### Step 4: ColorPickerVertical.tsx 新規作成

**components/editor/ColorPickerVertical.tsx**

```tsx
'use client';

import { useState } from 'react';
import { ArrowLeftRight, Palette } from 'lucide-react';
import { Color } from '@/types';
import { PRESET_COLORS } from '@/constants/colors';
import { colorToHex, hexToColor } from '@/utils/colorUtils';
import { HSVColorPicker } from './HSVColorPicker';

interface ColorPickerVerticalProps {
  selectedColor: Color;
  setSelectedColor: (color: Color) => void;
  secondaryColor: Color;
  setSecondaryColor: (color: Color) => void;
  colorHistory: Color[];
}

export function ColorPickerVertical({
  selectedColor,
  setSelectedColor,
  secondaryColor,
  setSecondaryColor,
  colorHistory,
}: ColorPickerVerticalProps) {
  const [showHSV, setShowHSV] = useState(false);

  const swapColors = () => {
    const temp = selectedColor;
    setSelectedColor(secondaryColor);
    setSecondaryColor(temp);
  };

  return (
    <>
      {/* Primary/Secondary スウォッチ */}
      <div className="color-swatch-pair">
        <input
          type="color"
          value={colorToHex(selectedColor)}
          onChange={(e) => setSelectedColor(hexToColor(e.target.value))}
          className="color-swatch-primary"
          title="Primary (L-Click)"
        />
        <input
          type="color"
          value={colorToHex(secondaryColor)}
          onChange={(e) => setSecondaryColor(hexToColor(e.target.value))}
          className="color-swatch-secondary"
          title="Secondary (R-Click)"
        />
        <button className="swap-btn-small" onClick={swapColors} title="Swap (X)">
          <ArrowLeftRight size={10} />
        </button>
      </div>

      {/* HSV toggle */}
      <button
        className={`tool-btn ${showHSV ? 'active' : ''}`}
        onClick={() => setShowHSV(!showHSV)}
        title="HSV Picker"
      >
        <Palette size={16} />
      </button>

      {/* HSV Picker popup */}
      {showHSV && (
        <div className="hsv-picker-popup-left">
          <HSVColorPicker color={selectedColor} onChange={setSelectedColor} />
        </div>
      )}

      {/* Color History */}
      {colorHistory.length > 0 && (
        <div className="color-history-vertical">
          {colorHistory.slice(0, 6).map((color, i) => (
            <button
              key={i}
              onClick={() => setSelectedColor(color)}
              onContextMenu={(e) => {
                e.preventDefault();
                setSecondaryColor(color);
              }}
              className="color-preset"
              style={{ background: colorToHex(color) }}
            />
          ))}
        </div>
      )}

      {/* Color Presets */}
      <div className="color-presets-vertical">
        {PRESET_COLORS.slice(0, 18).map((hex, i) => (
          <button
            key={i}
            onClick={() => setSelectedColor(hexToColor(hex))}
            onContextMenu={(e) => {
              e.preventDefault();
              setSecondaryColor(hexToColor(hex));
            }}
            className="color-preset"
            style={{ background: hex }}
          />
        ))}
      </div>
    </>
  );
}
```

### Step 5: MinecraftSkinEditor.tsx の更新

**左ツールバー部分の変更:**

```tsx
{/* Left Toolbar: Tools + Colors */}
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
```

**ボトムバー削除:**
- `<div className="color-bar">` を削除
- `ColorPicker` コンポーネントのインポートを削除

### Step 6: 不要なCSS削除

**globals.css から削除/コメントアウト:**

```css
/* 削除: .color-bar 関連のスタイル */
/* 削除: 横型カラーピッカー関連のスタイル */
```

## 検証方法

1. `npm run dev` で開発サーバー起動
2. 以下を確認:
   - 左サイドバーにツールとカラーピッカーが縦に並ぶ
   - ボトムバーが表示されない
   - Primary/Secondary カラーが Piskel風に重なって表示
   - カラー履歴とプリセットが縦に並ぶ
   - HSVピッカーが左ツールバーの右側にポップアップ表示
   - 3Dプレビューは右サイドバーで現状サイズ維持
   - キャンバスエリアが広くなっている

## 注意事項

- HSVピッカーの位置が左ツールバーの右側になるよう調整
- 左ツールバーの幅を56px→80pxに拡大してカラー要素を収める
- カラー履歴は最新6色に制限（スペース節約）
- プリセットは18色に制限（6x3グリッド）
