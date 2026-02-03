# 選択中のボディパーツを視覚的に示す機能の実装計画

## 概要
3Dプレビューで現在編集中のボディパーツをハイライト表示する機能を追加する。

## 現状の問題
- BodyPartSelectorのボタンには選択状態が表示される（activeクラス）
- UVエディタには「HEAD - UV MAP」のようなテキストがある
- **3Dプレビューには選択中のパーツを示す視覚的な表現がない**

## 実装アプローチ: ワイヤーフレームアウトライン

選択中のパーツにシアン色のワイヤーフレームアウトラインを表示する。

**選定理由:**
- Minecraftのピクセルアート風デザインにマッチ
- テクスチャを隠さず、明確に選択状態がわかる
- パフォーマンスへの影響が最小限

## 修正ファイル

### 1. SkinPreview3D.tsx
`src/components/editor/SkinPreview3D.tsx`

**変更内容:**
1. Props に `selectedPart: BodyPartKey` を追加
2. BodyPartKey から mesh index へのマッピング定数を追加
3. 各ボディパーツにアウトライン用メッシュを作成
4. `selectedPart` の変更に応じてアウトラインの表示/非表示を切り替える useEffect を追加

```typescript
// Props インターフェース
interface SkinPreview3DProps {
  skinData: Uint8ClampedArray;
  autoRotate: boolean;
  setAutoRotate: (value: boolean) => void;
  selectedPart: BodyPartKey;  // 追加
}

// マッピング定数
const PART_TO_INDEX: Record<BodyPartKey, number> = {
  head: 0,
  body: 1,
  rightArm: 2,
  leftArm: 3,
  rightLeg: 4,
  leftLeg: 5,
};

// アウトラインマテリアル（シアン色、UIテーマに合わせる）
const outlineMaterial = new THREE.MeshBasicMaterial({
  color: 0x4ecdc4,
  wireframe: true,
  transparent: true,
  opacity: 0.9,
});
```

### 2. MinecraftSkinEditor.tsx
`src/components/editor/MinecraftSkinEditor.tsx`

**変更内容:**
- SkinPreview3D に `selectedPart` prop を渡す

```typescript
<SkinPreview3D
  skinData={skinData}
  autoRotate={autoRotate}
  setAutoRotate={setAutoRotate}
  selectedPart={selectedPart}  // 追加
/>
```

## 実装手順

1. **SkinPreview3D.tsx の Props 更新**
   - `BodyPartKey` 型をインポート
   - Props インターフェースに `selectedPart` を追加

2. **アウトラインメッシュの作成**
   - 初期化 useEffect 内で、各ボディパーツのアウトラインメッシュを作成
   - アウトラインは元のメッシュより少し大きく（+0.15）して z-fighting を回避
   - アウトラインメッシュを ref で保持

3. **選択状態の反映**
   - `selectedPart` の変更を監視する useEffect を追加
   - 選択されたパーツのアウトラインのみ `visible = true` に設定

4. **MinecraftSkinEditor.tsx の更新**
   - SkinPreview3D コンポーネントに `selectedPart` を渡す

## 検証方法

1. `npm run dev` で開発サーバーを起動
2. 各ボディパーツボタンをクリックして、3Dプレビューで対応するパーツにシアン色のワイヤーフレームが表示されることを確認
3. 3Dモデルを回転させて、アウトラインが正しく追従することを確認
4. パーツを切り替えた際に、アウトラインが即座に更新されることを確認
