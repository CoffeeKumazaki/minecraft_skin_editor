# UV エディター拡大 & 3D プレビューのオーバーレイ改善

## 目標

1. テクスチャエディット画面（UVエディター）をもっと大きく
2. 3Dプレビューの枠を削除してオーバーレイ感を出す

## 実装計画

### 修正ファイル

- [MinecraftSkinEditor.tsx](src/components/editor/MinecraftSkinEditor.tsx)

### 変更内容

#### 1. UVエディターのサイズ拡大（34-38行目）

`getScale` 関数の `maxWidth` を `320` → `480` に変更:
```tsx
const getScale = (part: BodyPartKey) => {
  const layout = BODY_PARTS[part].layout;
  const maxWidth = 480;  // 320 → 480
  return Math.floor(maxWidth / layout.width);
};
```

#### 2. 3Dプレビューの枠を削除（123-132行目）

- `className="pixel-border"` を削除
- 代わりにシンプルなドロップシャドウを追加
- タイトルも削除してよりミニマルに

```tsx
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
```

### 検証方法

1. `cd src && npm run dev` で開発サーバー起動
2. http://localhost:3000 で確認:
   - UVエディターが大きく表示されている
   - 3Dプレビューが枠なしでオーバーレイ表示されている
