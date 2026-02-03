# Undo/Redo機能 実装プラン

## 概要
Minecraft Skin Editorにundo/redo機能を追加する。スナップショットベースの履歴管理をカスタムフックで実装。

## アプローチ
- **方式**: カスタムフック `useHistory` でスナップショット管理
- **メモリ**: 16KB/スナップショット × 50履歴 = 800KB（許容範囲）
- **履歴タイミング**: ストローク終了時（mouseup）にのみ履歴保存

## 実装手順

### 1. `useHistory` フック作成
**新規ファイル**: `src/hooks/useHistory.ts`

```typescript
interface UseHistoryReturn<T> {
  state: T;
  set: (newState: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}
```

- `past[]`, `present`, `future[]` の3つのstateで管理
- `maxHistory: 50` で履歴数制限
- 新しいアクションで `future` をクリア

### 2. ConnectedUVEditor修正
**ファイル**: [ConnectedUVEditor.tsx](src/components/editor/ConnectedUVEditor.tsx)

- Props追加: `onStrokeEnd?: () => void`
- `handleMouseUp` と `handleMouseLeave` で `onStrokeEnd?.()` を呼び出し

### 3. MinecraftSkinEditor修正
**ファイル**: [MinecraftSkinEditor.tsx](src/components/editor/MinecraftSkinEditor.tsx)

- `useState` → `useHistory` に変更
- ストローク中のlive preview用に `pendingDataRef` と別state追加
- `handleStrokeEnd` でhistoryにcommit
- キーボードショートカット（Ctrl+Z / Ctrl+Y）追加

## 変更ファイル一覧

| ファイル | 操作 |
|---------|------|
| `src/hooks/useHistory.ts` | 新規作成（済） |
| `src/components/editor/ConnectedUVEditor.tsx` | 修正 |
| `src/components/editor/MinecraftSkinEditor.tsx` | 修正 |

## キーボードショートカット（UIボタンなし）
- **Undo**: Cmd+Z (Mac) / Ctrl+Z (Windows)
- **Redo**: Cmd+Shift+Z (Mac) / Ctrl+Y (Windows)

## 検証方法
1. `npm run dev` で開発サーバー起動
2. 以下をテスト:
   - 1クリック → Cmd+Zで元に戻る
   - ドラッグストローク → Cmd+Zで1回のストロークが戻る
   - 複数Undo → 連続して戻る
   - Cmd+Shift+Z → Undoした操作が復元される
   - 新しいペイント後 → Redoが無効になる
