# カラーピッカー機能拡張

## 概要
既存のColorPickerコンポーネントに以下の機能を追加する：
1. ~~**HSVカラーピッカー** - 色相スライダーと彩度・明度の2Dパネル~~ ✅ 完了
2. ~~**色履歴** - 使用した色を自動保存（最大8色）~~ ✅ 完了
3. **カラーコード直接入力** - HEXコードを直接入力できるテキストフィールド
4. **コピー機能** - 現在の色のHEXコードをクリップボードにコピー

## 修正ファイル

### 1. `src/utils/colorUtils.ts`
HSV⇔RGB変換関数を追加
- `HSV`インターフェース（h: 0-360, s: 0-100, v: 0-100）
- `rgbToHsv(color: Color): HSV`
- `hsvToRgb(hsv: HSV): Color`
- `colorsEqual(a: Color, b: Color): boolean`

### 2. `src/hooks/useColorHistory.ts` (新規)
色履歴を管理するカスタムフック
```typescript
export function useColorHistory() {
  // history: Color[] - 最大8色
  // addColor(color) - 色を追加（重複除外、透明色は無視）
  // clearHistory() - 履歴クリア
}
```

### 3. `src/components/editor/HSVColorPicker.tsx` (新規)
Canvas描画のHSVピッカー
- 彩度・明度パネル（180x120px）- 2Dグラデーション
- 色相スライダー（180x16px）- 虹色グラデーション
- マウスドラッグで色選択

### 4. `src/components/editor/ColorHistory.tsx` (新規)
色履歴表示コンポーネント
- 「RECENT」ラベル + 色スウォッチ（最大8個）
- 左クリック: プライマリ色に設定
- 右クリック: セカンダリ色に設定

### 5. `src/components/editor/ColorPicker.tsx`
新コンポーネントを統合
- プライマリ色入力の下にHSVトグルボタン追加
- HSVピッカーをポップアップ表示（色バーの上）
- ColorHistoryをプリセット色の前に配置
- Props追加: `colorHistory: Color[]`

### 6. `src/components/editor/MinecraftSkinEditor.tsx`
色履歴フックを追加
- `useColorHistory`をインポート
- `handlePaint`で色をaddToColorHistoryに追加
- ColorPickerにcolorHistory propを渡す

### 7. `src/app/globals.css`
新しいスタイルを追加
- `.hsv-toggle` - トグルボタン
- `.hsv-picker-popup` - ポップアップコンテナ
- `.hsv-sv-canvas`, `.hsv-hue-canvas` - Canvasスタイル
- `.color-history`, `.color-history-label`, `.color-history-swatches`

## UI配置

```
┌─────────────────────────────────────────────────────────────────────┐
│ [L-CLICK]  [↔]  [R-CLICK]  │  RECENT: [■][■][■]  │  PRESETS: [■]... │
│  ▼ HSV                     │                     │                   │
└─────────────────────────────────────────────────────────────────────┘
       ↑
  ┌────────────┐
  │ SV Panel   │  ← HSVピッカーポップアップ（トグル時に表示）
  │ 180x120    │
  ├────────────┤
  │ Hue Slider │
  │ 180x16     │
  └────────────┘
```

## 実装順序

1. colorUtils.tsにHSV変換関数を追加
2. useColorHistoryフックを作成
3. ColorHistoryコンポーネントを作成
4. HSVColorPickerコンポーネントを作成（Canvas描画）
5. ColorPicker.tsxを修正して統合
6. MinecraftSkinEditor.tsxを修正
7. globals.cssにスタイル追加

## 追加機能: カラーコード入力 & コピー

### 修正ファイル

#### `src/components/editor/HSVColorPicker.tsx`
- HSVピッカーの下部にHEXコード入力フィールドを追加
- コピーボタン（Copyアイコン）を追加
- 入力時のバリデーション（有効なHEX形式かチェック）

```
カラーバー:
[L-CLICK] [色] [▲] [↔] [R-CLICK] [色]  ← 変更なし

HSVピッカーポップアップ内:
┌────────────────────┐
│ SV Panel (180x120) │
├────────────────────┤
│ Hue Slider (180x16)│
├────────────────────┤
│ [#FF6464] [📋]     │  ← HEX入力 + コピーボタン
└────────────────────┘
```

### 実装内容

1. **HEX入力フィールド**
   - テキストインプット（幅70px程度）
   - 入力中はリアルタイムで色を更新
   - 無効な入力は無視（正規表現で検証: `/^#[0-9A-Fa-f]{6}$/`）
   - フォーカス時に全選択

2. **コピーボタン**
   - lucide-reactの`Copy`アイコン使用
   - クリックで`navigator.clipboard.writeText()`
   - コピー成功時に一瞬`Check`アイコンに変更（フィードバック）

#### `src/app/globals.css`
- `.hex-input` - HEXコード入力フィールドのスタイル
- `.copy-btn` - コピーボタンのスタイル

## 検証方法

1. `npm run dev`で開発サーバー起動
2. HSVピッカーのトグルボタンをクリック → ポップアップ表示確認
3. SVパネルとHueスライダーをドラッグ → プライマリ色が変わる確認
4. キャンバスに描画 → 色履歴に追加される確認
5. 色履歴の色をクリック → 色が選択される確認
6. 消しゴムツール使用時 → 履歴に追加されない確認
7. **HEX入力フィールドに`#00FF00`と入力 → 色が緑に変わる確認**
8. **コピーボタンをクリック → クリップボードにHEXコードがコピーされる確認**
