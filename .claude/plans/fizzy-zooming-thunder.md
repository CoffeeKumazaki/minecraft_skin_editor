# Plan: カーソル変更 & 右クリックでサブカラー塗り

## 概要
1. エディターのカーソルを「+」(crosshair)からペンアイコンに変更
2. 右クリックのコンテキストメニューを無効化
3. 右クリックでセカンダリカラーで塗れるようにする

---

## 変更ファイル

### 1. ConnectedUVEditor.tsx
- カーソルをSVGペンアイコン（data URL）に変更
- `onContextMenu={(e) => e.preventDefault()}` 追加
- マウスボタン判定を追加（`e.button`: 0=左, 2=右）
- `secondaryColor` propを追加
- 右クリック時はセカンダリカラーで塗る

### 2. ColorPicker.tsx
- プライマリ/セカンダリの2色表示UI
- 色の入れ替えボタン追加
- プリセットカラー：左クリック=プライマリ、右クリック=セカンダリ

### 3. MinecraftSkinEditor.tsx
- `secondaryColor` stateを追加（デフォルト: 白）
- ColorPickerとConnectedUVEditorに両カラーを渡す

---

## 実装詳細

### ConnectedUVEditor.tsx

```tsx
// Props追加
interface ConnectedUVEditorProps {
  // ...既存
  secondaryColor: Color;  // 追加
}

// ボタン追跡用ref追加
const activeButton = useRef<number>(0);

// paint関数を修正
const paint = (e: React.MouseEvent<HTMLCanvasElement>, button?: number) => {
  const pixel = getPixelFromEvent(e);
  if (pixel) {
    const isRightClick = (button ?? activeButton.current) === 2;
    const color = tool === 'eraser'
      ? { r: 0, g: 0, b: 0, a: 0 }
      : isRightClick ? secondaryColor : selectedColor;
    onPaint(pixel.skinX, pixel.skinY, color);
  }
};

// handleMouseDownを修正
const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
  if (e.button === 1) return; // 中ボタン無視
  isDrawing.current = true;
  activeButton.current = e.button;
  paint(e, e.button);
};

// カスタムペンカーソル（SVG data URL）
const penCursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234ecdc4' stroke-width='2'%3E%3Cpath d='M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z'/%3E%3C/svg%3E") 0 24, crosshair`;

// canvasにonContextMenu追加、cursor変更
<canvas
  onContextMenu={(e) => e.preventDefault()}
  style={{ cursor: penCursor, ... }}
/>
```

### ColorPicker.tsx

```tsx
// Props追加
interface ColorPickerProps {
  selectedColor: Color;
  setSelectedColor: (color: Color) => void;
  secondaryColor: Color;
  setSecondaryColor: (color: Color) => void;
}

// UI: 2つのカラーピッカー + スワップボタン
// プリセット: 左クリック=プライマリ、右クリック=セカンダリ
```

### MinecraftSkinEditor.tsx

```tsx
// State追加
const [secondaryColor, setSecondaryColor] = useState<Color>({ r: 255, g: 255, b: 255, a: 255 });

// Props渡し
<ColorPicker
  selectedColor={selectedColor}
  setSelectedColor={setSelectedColor}
  secondaryColor={secondaryColor}
  setSecondaryColor={setSecondaryColor}
/>

<ConnectedUVEditor
  // ...既存
  secondaryColor={secondaryColor}
/>
```

---

## 検証方法
1. `npm run dev` で開発サーバー起動
2. カーソルがペンアイコンになっていることを確認
3. 右クリックでコンテキストメニューが出ないことを確認
4. 左クリックでプライマリカラー、右クリックでセカンダリカラーで塗れることを確認
5. カラーピッカーで両色が表示され、入れ替えできることを確認
6. プリセットカラーの左/右クリック=プライマリ/セカンダリが正しく動作することを確認
