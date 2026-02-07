# Plan: カーソル改善（消しゴム＆バケツホットスポット）

## 概要
2つのカーソル関連の改善を実装する。

## 変更内容

### 1. 消しゴムツールのカーソルを消しゴムアイコンに変更

**問題**: 現在、消しゴムツールはブラシと同じペンカーソルを使用している（`getCursor()`のデフォルト）

**解決策**: `eraserCursor`を追加し、消しゴムツール選択時に表示

**ファイル**: [ConnectedUVEditor.tsx](src/components/editor/ConnectedUVEditor.tsx#L201-L209)

```typescript
// 追加: 消しゴムカーソル（Lucide Eraserアイコンベース）
const eraserCursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234ecdc4' stroke-width='2'%3E%3Cpath d='m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21'/%3E%3Cpath d='M22 21H7'/%3E%3Cpath d='m5 11 9 9'/%3E%3C/svg%3E") 0 24, crosshair`;

// getCursor()を更新
const getCursor = () => {
  if (tool === 'eyedropper') return eyedropperCursor;
  if (tool === 'bucket') return bucketCursor;
  if (tool === 'eraser') return eraserCursor;  // 追加
  return penCursor;
};
```

### 2. バケツツールのホットスポットを液だれ位置に調整

**問題**: バケツカーソルのホットスポットが`0 24`（左下）にあるが、ユーザーは液だれ部分（右下）で塗りつぶしたい

**解決策**: ホットスポットを`22 21`（液だれの位置）に変更

**ファイル**: [ConnectedUVEditor.tsx](src/components/editor/ConnectedUVEditor.tsx#L203)

```typescript
// 変更前
const bucketCursor = `url("...") 0 24, crosshair`;

// 変更後（ホットスポットを22 21に）
const bucketCursor = `url("...") 22 21, crosshair`;
```

## 対象ファイル
- `src/components/editor/ConnectedUVEditor.tsx` (1ファイルのみ)

## 検証方法
1. `npm run dev`で開発サーバー起動
2. 消しゴムツールを選択 → カーソルが消しゴムアイコンに変わることを確認
3. バケツツールを選択 → 液だれ部分をピクセルに合わせてクリックし、正しく塗りつぶされることを確認
