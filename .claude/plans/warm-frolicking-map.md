# カラーピッカーをHSVピッカーに統一

## 概要

カラースウォッチクリック時とパレットボタンクリック時で異なるピッカーが表示される問題を修正。HSVピッカーのみに統一する。

## 現状の問題

- カラースウォッチ（色の四角）クリック → ブラウザのネイティブカラーピッカー
- パレットボタンクリック → カスタムHSVピッカー

## 目標

- カラースウォッチクリック → HSVピッカーを開く
- パレットボタン → 削除

## 変更対象ファイル

- `src/components/editor/ColorPickerVertical.tsx`
- `src/app/globals.css`

## 実装手順

### Step 1: ColorPickerVertical.tsx の変更

1. `<input type="color">` を `<button>` に変更（クリックでHSVピッカーを開く）
2. パレットボタン（Palette アイコン）を削除
3. Primary/Secondary どちらをクリックしたかを state で管理
4. HSVピッカーで選択した色を適切なカラー（primary or secondary）に反映

```tsx
// 変更前
<input type="color" ... className="color-swatch-primary" />
<button className="tool-btn">...</button> // パレットボタン

// 変更後
<button
  className="color-swatch-primary"
  style={{ background: colorToHex(selectedColor) }}
  onClick={() => { setEditingColor('primary'); setShowHSV(true); }}
/>
// パレットボタンは削除
```

### Step 2: HSVピッカーにPrimary/Secondary切り替えを追加

HSVピッカー内で編集対象（primary/secondary）を切り替えられるようにする。

```tsx
const [editingColor, setEditingColor] = useState<'primary' | 'secondary'>('primary');

// HSVピッカーのonChangeで適切なsetterを呼ぶ
const handleColorChange = (color: Color) => {
  if (editingColor === 'primary') {
    setSelectedColor(color);
  } else {
    setSecondaryColor(color);
  }
};
```

### Step 3: CSSの調整

カラースウォッチがボタンになるためスタイル調整。

```css
.color-swatch-primary,
.color-swatch-secondary {
  /* input[type="color"] から button に変更 */
  appearance: none;
  -webkit-appearance: none;
}
```

## 検証方法

1. `npm run dev` で開発サーバー起動
2. 以下を確認:
   - Primaryカラースウォッチクリック → HSVピッカーが開く（Primary編集）
   - Secondaryカラースウォッチクリック → HSVピッカーが開く（Secondary編集）
   - パレットボタンが表示されない
   - HSVピッカーで色を変更するとスウォッチに反映される
   - 外クリックでHSVピッカーが閉じる
