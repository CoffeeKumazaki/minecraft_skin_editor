# スポイト機能（Eyedropper Tool）実装計画

## 概要
キャンバス上のピクセルをクリックして色を取得するスポイト機能を追加する。
- 左クリック: メインカラーを設定
- 右クリック: セカンダリカラーを設定

## 変更対象ファイル

### 1. [types/index.ts](src/types/index.ts)
- `Tool` 型に `'eyedropper'` を追加

### 2. [ToolPanel.tsx](src/components/editor/ToolPanel.tsx)
- スポイトボタンを追加（Brush、Eraserと同じパターン）

### 3. [ConnectedUVEditor.tsx](src/components/editor/ConnectedUVEditor.tsx)
- `onColorPicked` プロップを追加
- `tool === 'eyedropper'` の場合、ペイントせずに色を読み取る
- 左クリック/右クリックに応じてコールバックを呼び出す
- スポイトモード時のカーソルを変更（crosshair）

### 4. [MinecraftSkinEditor.tsx](src/components/editor/MinecraftSkinEditor.tsx)
- `handleColorPicked` コールバックを実装
- 右クリックならセカンダリ、左クリックならメインカラーを更新
- ConnectedUVEditorに `onColorPicked` を渡す

## 実装詳細

### 色の読み取りロジック
```typescript
// skinDataから色を読み取る
const idx = (skinY * SKIN_WIDTH + skinX) * 4;
const color: Color = {
  r: skinData[idx],
  g: skinData[idx + 1],
  b: skinData[idx + 2],
  a: skinData[idx + 3]
};
```

### ボタンUI
既存のBrush/Eraserボタンと同じスタイルで「Eyedropper」ボタンを追加

## 検証方法
1. `npm run dev` で開発サーバー起動
2. Eyedropperツールを選択
3. キャンバス上の色付きピクセルを左クリック → メインカラーが変わることを確認
4. 右クリック → セカンダリカラーが変わることを確認
5. 透明ピクセルを選択した場合も正しく動作することを確認
