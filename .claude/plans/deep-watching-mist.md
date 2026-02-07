# skinInitializer UV領域修正計画

## 問題
デフォルトスキン生成時に、未使用領域も含めて塗りつぶしているため、出力PNGがテンプレートと異なる。

例: Head Top の uvX=8 なのに、(0,0) にも色が出力されている。

## 原因
`skinInitializer.ts` が各パーツの正しいUV領域ではなく、単純な矩形で塗りつぶしている。

現在のコード:
```typescript
// Head - x=0から32まで全体を塗りつぶし
for (let y = 0; y < 16; y++) {
  for (let x = 0; x < 32; x++) { ... }
}
```

実際のMinecraftスキンでは:
- (0-7, 0-7) は**未使用領域**
- (24-31, 0-7) は**未使用領域**

## 修正対象ファイル
- [src/utils/skinInitializer.ts](src/utils/skinInitializer.ts)

## 修正方針
`bodyParts.ts` の UV座標定義を使って、正しい領域にのみ描画する。

### 修正内容
skinInitializer.ts を修正して、BODY_PARTS の regions を参照し、各 uvX, uvY, w, h に基づいて描画する。

```typescript
import { BODY_PARTS } from '@/constants/bodyParts';

// Head の各面を正しいUV位置に描画
BODY_PARTS.head.layout.regions.forEach(region => {
  for (let py = 0; py < region.h; py++) {
    for (let px = 0; px < region.w; px++) {
      const x = region.uvX + px;
      const y = region.uvY + py;
      const idx = (y * SKIN_WIDTH + x) * 4;
      // 色を設定
    }
  }
});
```

## 検証方法
1. `npm run dev` でエディターを起動
2. 何も描かずにPNGをダウンロード
3. テンプレート (mc_skin_template.png) と比較
4. 未使用領域 (0-7, 0-7) が透明であることを確認
