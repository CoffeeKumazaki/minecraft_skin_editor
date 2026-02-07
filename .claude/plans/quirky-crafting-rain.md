# lucide-react アイコン導入計画

## 概要
Minecraft skin editorの各UIコンポーネントにlucide-reactアイコンを導入する。

## 実装手順

### 1. lucide-reactインストール
```bash
cd src && npm install lucide-react
```

### 2. ToolPanel.tsx - ツールアイコン更新
**ファイル**: `src/components/editor/ToolPanel.tsx`

絵文字から lucide-react アイコンに変更：
| ツール | 現在 | 変更後 |
|--------|------|--------|
| Brush | ✏ | `<Pencil />` |
| Eraser | ◻ | `<Eraser />` |
| Picker | 💧 | `<Pipette />` |
| Fill | 🪣 | `<PaintBucket />` |

### 3. ColorPicker.tsx - スワップボタン
**ファイル**: `src/components/editor/ColorPicker.tsx`

- `&#8644;` → `<ArrowRightLeft />` または `<Repeat2 />`

### 4. LayerToggle.tsx - レイヤー切替
**ファイル**: `src/components/editor/LayerToggle.tsx`

- Inner/Outer テキストにアイコン追加（オプション）
- `<Layers />` や `<Square />` / `<Layers2 />` を検討

### 5. SkinPreview3D.tsx - 回転コントロール
**ファイル**: `src/components/editor/SkinPreview3D.tsx`

- "Stop" → `<Pause />` または `<Square />`
- "Rotate" → `<RotateCw />` または `<Play />`

### 6. MinecraftSkinEditor.tsx - ダウンロードボタン
**ファイル**: `src/components/editor/MinecraftSkinEditor.tsx`

- "Download PNG" → `<Download />` + テキスト

## 対象ファイル一覧
- `src/package.json` (依存関係追加)
- `src/components/editor/ToolPanel.tsx`
- `src/components/editor/ColorPicker.tsx`
- `src/components/editor/LayerToggle.tsx`
- `src/components/editor/SkinPreview3D.tsx`
- `src/components/editor/MinecraftSkinEditor.tsx`

## 検証方法
1. `npm run dev` で開発サーバー起動
2. 各コンポーネントでアイコンが正しく表示されることを確認
3. ツール選択、色スワップ、レイヤー切替、回転、ダウンロードの動作確認
