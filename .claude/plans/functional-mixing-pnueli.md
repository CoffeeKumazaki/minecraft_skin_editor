# 3Dモデルの前方向インジケーター追加

## 概要
3Dプレビューにモデルの前方向がわかる視覚的なインジケーターを追加する。

## 実装アプローチ
**床グリッド + 前方向矢印**を追加する。

## 変更ファイル
- [SkinPreview3D.tsx](src/components/editor/SkinPreview3D.tsx) - 3Dシーンにグリッドと矢印を追加

## 実装内容

### 1. 床グリッドの追加
モデルの足元（y = -15）に小さなグリッドを配置：
```typescript
const gridHelper = new THREE.GridHelper(16, 4, 0x2a2a4a, 0x3a3a5a);
gridHelper.position.y = -15;
group.add(gridHelper);
```

### 2. 前方向矢印の追加
グリッド上にシアン色（アクセントカラー）の三角形矢印を配置し、前方向（+Z、カメラ側）を指す：
```typescript
const arrowShape = new THREE.Shape();
arrowShape.moveTo(0, 2);
arrowShape.lineTo(-1.5, -1);
arrowShape.lineTo(1.5, -1);
arrowShape.closePath();

const arrowGeometry = new THREE.ShapeGeometry(arrowShape);
const arrowMaterial = new THREE.MeshBasicMaterial({
  color: 0x4ecdc4,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.7
});
const frontArrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
frontArrow.rotation.x = -Math.PI / 2; // 床に寝かせる
frontArrow.position.set(0, -14.9, 10); // モデル前方、グリッド上
group.add(frontArrow);
```

### 3. クリーンアップ処理
useEffectのクリーンアップで新しいジオメトリとマテリアルをdispose。

## 視覚的効果
- グリッドが空間の基準を提供
- シアン色の矢印が前方向を明確に示す
- グループに追加するためモデルと一緒に回転する
- 既存のアクセントカラー（0x4ecdc4）と統一感のあるデザイン

## 検証方法
1. `cd src && npm run dev` で開発サーバー起動
2. http://localhost:3000 でエディターを開く
3. 3Dプレビューで以下を確認：
   - モデル下にグリッドが表示される
   - シアン色の矢印が前方向を指している
   - ドラッグ回転・自動回転時にグリッドと矢印がモデルと一緒に回転する
