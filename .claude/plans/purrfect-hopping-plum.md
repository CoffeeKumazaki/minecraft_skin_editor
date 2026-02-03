# Piskel風レイアウトへの変更プラン

## 概要

MinecraftスキンエディターのレイアウトをPiskel風に変更する。Piskelの特徴的なレイアウト構造を参考に、左側にツールバー、中央にキャンバス、右側にプレビュー・設定パネル、下部にカラーパレットを配置する。

## 現在のレイアウト → Piskel風レイアウト

```
【現在】                          【Piskel風】
+-------+--------+-------+        +----+------------------+--------+
| Tools | UV Map | Float |        |Tool|                  |        |
| Color |        | 3D    |   →    |Bar |    UV Editor     | 3D     |
| Parts |        | Prev  |        |    |    (Center)      | Parts  |
+-------+--------+-------+        +----+------------------+--------+
                                  |  Color Palette (Bottom Bar)    |
                                  +---------------------------------+
```

## Piskelレイアウトの特徴（参照: piskel source）

1. **左サイドバー** (`.left-sticky-section`) - 56px幅、縦並びツールアイコン
2. **中央エリア** (`.column-wrapper`) - フレキシブル、メインキャンバス
3. **右サイドバー** (`.right-column`) - プレビュー、レイヤー、変形ツール
4. **下部なし** - Piskelはカラーを左に配置

→ このエディターでは下部にカラーバーを配置（Piskelの左サイドバーが狭いため）

## 実装プラン

### Phase 1: CSS Grid レイアウト基盤

**ファイル: [globals.css](src/app/globals.css)**

```css
.editor-container {
  display: grid;
  grid-template-rows: 1fr 56px;          /* main + bottom bar */
  grid-template-columns: 56px 1fr 220px; /* toolbar + canvas + sidebar */
  grid-template-areas:
    "toolbar canvas  sidebar"
    "colorbar colorbar colorbar";
  height: 100vh;
}
```

### Phase 2: コンポーネント配置変更

**ファイル: [MinecraftSkinEditor.tsx](src/components/editor/MinecraftSkinEditor.tsx)**

現在の構造:
```
<div> (flex wrap)
  <LeftPanel> Tools, Color, Parts, Download </LeftPanel>
  <CenterPanel> UV Editor </CenterPanel>
  <FloatingOverlay> 3D Preview </FloatingOverlay>
</div>
```

変更後:
```
<div className="editor-container"> (CSS Grid)
  <VerticalToolbar />     /* grid-area: toolbar */
  <MainCanvas />          /* grid-area: canvas */
  <RightSidebar />        /* grid-area: sidebar */
  <BottomColorBar />      /* grid-area: colorbar */
</div>
```

### Phase 3: 各コンポーネントの詳細変更

#### 3.1 左ツールバー（56px幅・縦並び）

**ファイル: [ToolPanel.tsx](src/components/editor/ToolPanel.tsx)**

- 横並び → 縦並びに変更
- テキストラベル削除、アイコンのみ
- ツールチップ追加（ホバー時に名前表示）
- ボタンサイズ: 40x40px

```
+------+
| [B]  |  Brush
| [E]  |  Eraser
| [P]  |  Picker
+------+
```

#### 3.2 中央キャンバスエリア

**ファイル: [MinecraftSkinEditor.tsx](src/components/editor/MinecraftSkinEditor.tsx)**

- UVエディターを中央に大きく表示
- スケール計算を調整して大きく表示
- 背景にチェッカーボードパターン（透明部分の視認性向上）
- ヘッダー部分にundo/redo、ズームコントロール

#### 3.3 右サイドバー（220px幅）

**ファイル: [MinecraftSkinEditor.tsx](src/components/editor/MinecraftSkinEditor.tsx)**

上から順に:
1. **3Dプレビュー** (200x267px) - 現在のFloatingから移動
2. **回転コントロール**
3. **ボディパーツセレクター** - 2列グリッド
4. **UVレジェンド** - コンパクト表示
5. **ダウンロードボタン**

#### 3.4 下部カラーバー（56px高さ）

**ファイル: [ColorPicker.tsx](src/components/editor/ColorPicker.tsx)**

- 縦並び → 横並びに変更
- 左側: Primary/Secondary カラーピッカー + スワップボタン
- 右側: プリセットカラーを横一列（またはスクロール可能）

```
+----------------------------------------------------------------+
| [Pri] <> [Sec] |  [##][##][##][##][##][##][##][##][##]...      |
+----------------------------------------------------------------+
```

### Phase 4: スタイル調整

**ファイル: [globals.css](src/app/globals.css)**

- CSS変数の追加
- ボーダースタイルをPiskel風に（2px solid）
- ホバー・アクティブ状態の調整
- レスポンシブ対応（タブレット・モバイル）

## 修正対象ファイル

| ファイル | 変更内容 |
|---------|---------|
| [src/app/globals.css](src/app/globals.css) | CSS Grid レイアウト、変数、新スタイル追加 |
| [src/components/editor/MinecraftSkinEditor.tsx](src/components/editor/MinecraftSkinEditor.tsx) | レイアウト構造の大幅変更、コンポーネント配置変更 |
| [src/components/editor/ToolPanel.tsx](src/components/editor/ToolPanel.tsx) | 縦並びアイコンのみに変更 |
| [src/components/editor/ColorPicker.tsx](src/components/editor/ColorPicker.tsx) | 横並びバー形式に変更 |
| [src/components/editor/BodyPartSelector.tsx](src/components/editor/BodyPartSelector.tsx) | サイドバー用の2列グリッドに調整 |
| [src/components/editor/SkinPreview3D.tsx](src/components/editor/SkinPreview3D.tsx) | サイズ調整（サイドバーに収まるよう） |

## 新規追加要素（オプション）

- undo/redo ボタン（ヘッダー部分）- 既存のhook活用
- ズームコントロール（将来的に）

## 検証方法

1. `npm run dev` で開発サーバー起動
2. http://localhost:3000 でレイアウト確認
3. 各パーツの表示確認:
   - 左ツールバーが縦並びで表示されるか
   - UVエディターが中央に大きく表示されるか
   - 3Dプレビューが右サイドバーに配置されるか
   - カラーバーが下部に横並びで表示されるか
4. 機能テスト:
   - ブラシ/消しゴム/スポイトツールが動作するか
   - カラー選択が動作するか
   - ボディパーツ切り替えが動作するか
   - 3Dプレビューへのリアルタイム反映
   - PNGダウンロードが動作するか
5. `npm run build` でビルドエラーがないか確認

## 視覚的イメージ（ASCII）

```
+------------------------------------------------------------------+
|[B]|                                              |   +-------+   |
|[E]|                                              |   |  3D   |   |
|[P]|          +-------------------+               |   | PREV  |   |
|   |          |                   |               |   +-------+   |
|   |          |    UV EDITOR      |               |   [Rot/Stop]  |
|   |          |    (HEAD)         |               |               |
|   |          |                   |               |   BODY PARTS  |
|   |          +-------------------+               |   [Hd] [Bd]   |
|   |                                              |   [RA] [LA]   |
|   |                                              |   [RL] [LL]   |
|   |                                              |               |
|   |                                              |   LEGEND      |
|   |                                              |   [Download]  |
+---+----------------------------------------------+---------------+
| [P][S] |  [##][##][##][##][##][##][##][##][##][##][##][##]       |
+------------------------------------------------------------------+
```
