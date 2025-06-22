# 麻雀ロジック仕様書

## 概要

4人対戦リーチ麻雀のゲームロジック実装仕様です。

## 基本ルール

### 採用ルール
- **リーチ麻雀**: 一般的な日本麻雀ルール
- **4人打ち**: 東南西北の4人
- **東風戦**: 東場のみ（簡単実装のため）
- **赤ドラあり**: 5萬・5筒・5索に各1枚
- **喰いタン・後付けあり**
- **一発・裏ドラあり**

### 牌構成
```
萬子: 1萬〜9萬 各4枚（但し5萬は3枚） (35枚)
筒子: 1筒〜9筒 各4枚（但し5筒は3枚） (35枚) 
索子: 1索〜9索 各4枚（但し5索は3枚） (35枚)
字牌: 東南西北白發中 各4枚 (28枚)
赤ドラ: 赤5萬・赤5筒・赤5索 各1枚 (3枚)
合計: 136枚（通常5は各3枚 + 赤5は各1枚 = 計136枚）
```

### ゲーム進行
1. **配牌**: 各プレイヤー13枚
2. **ツモ・切り**: 時計回りに進行
3. **鳴き**: ポン・チー・カン対応
4. **和了判定**: ロン・ツモ
5. **点数計算**: 基本点数のみ

## データ構造設計

### 牌（Tile）
```typescript
// 牌の種類
enum TileType {
  MAN = 'MAN',     // 萬子
  PIN = 'PIN',     // 筒子  
  SOU = 'SOU',     // 索子
  WIND = 'WIND',   // 風牌
  DRAGON = 'DRAGON' // 三元牌
}

// 牌のコード定義
enum TileCode {
  // 萬子 (M1-M9)
  M1 = 'M1', M2 = 'M2', M3 = 'M3', M4 = 'M4', M5 = 'M5',
  M6 = 'M6', M7 = 'M7', M8 = 'M8', M9 = 'M9',
  
  // 筒子 (P1-P9)
  P1 = 'P1', P2 = 'P2', P3 = 'P3', P4 = 'P4', P5 = 'P5',
  P6 = 'P6', P7 = 'P7', P8 = 'P8', P9 = 'P9',
  
  // 索子 (S1-S9)
  S1 = 'S1', S2 = 'S2', S3 = 'S3', S4 = 'S4', S5 = 'S5',
  S6 = 'S6', S7 = 'S7', S8 = 'S8', S9 = 'S9',
  
  // 風牌 (東南西北)
  WE = 'WE', // 東
  WS = 'WS', // 南
  WW = 'WW', // 西
  WN = 'WN', // 北
  
  // 三元牌 (白發中)
  DW = 'DW', // 白
  DG = 'DG', // 發
  DR = 'DR'  // 中
}

// 牌インターフェース
interface Tile {
  id: string;              // 一意識別子（例: "M5_0", "M5_red_0"）
  code: TileCode;          // 牌コード（M1, P5, WE, DR等）
  tileType: TileType;      // 牌の種類（萬子筒子索子風牌三元牌）
  suitNumber: number;      // 数牌1-9、字牌は0固定
  isPrisedRed: boolean;    // 赤ドラフラグ（M5・P5・S5のみ）
  isRevealed: boolean;     // 表示状態
}

// 牌構成例
// 通常M5: { code: TileCode.M5, isPrisedRed: false } (3枚)
// 赤M5:   { code: TileCode.M5, isPrisedRed: true }  (1枚)
// 総計:   M5は4枚（通常3枚 + 赤1枚）
```

### プレイヤー状態
```typescript
interface PlayerGameState {
  hand: Tile[];         // 手牌
  discards: Tile[];     // 捨て牌
  melds: Meld[];        // 鳴き
  isRiichi: boolean;    // リーチ状態
  score: number;        // 持ち点
}

interface Meld {
  type: 'pon' | 'chi' | 'kan';
  tiles: Tile[];
  from: number;         // 誰から鳴いたか
}
```

### ゲーム状態
```typescript
interface GameState {
  phase: GamePhase;
  currentPlayer: number;
  round: number;        // 局数
  honba: number;        // 本場
  kyotaku: number;      // 供託
  wall: Tile[];         // 牌山
  dora: Tile[];         // ドラ表示牌
  uraDora: Tile[];      // 裏ドラ
  lastAction: GameAction;
}

type GamePhase = 'dealing' | 'playing' | 'ended';
```

## 実装フェーズ

### Phase 1: 基本構造 🚧
- [x] 型定義（Enum方式に変更）
- [x] 牌構成定数（TILE_DEFINITIONS）
- [x] ヘルパー関数（getTileTypeFromCode等）
- [ ] 牌生成・シャッフルシステム
- [ ] 配牌システム
- [ ] 基本的なツモ・切り

### Phase 2: 鳴きシステム
- [ ] ポン・チー判定
- [ ] カン処理
- [ ] 鳴き後の手牌管理

### Phase 3: 和了判定
- [ ] 基本和了形判定
- [ ] 役判定
- [ ] 点数計算

### Phase 4: 特殊処理
- [ ] リーチ
- [ ] 一発・裏ドラ
- [ ] 流局処理

## アクション設計

### プレイヤーアクション
```typescript
type PlayerAction = 
  | { type: 'discard'; tile: Tile }
  | { type: 'pon'; tiles: Tile[]; from: number }
  | { type: 'chi'; tiles: Tile[]; from: number }
  | { type: 'kan'; tiles: Tile[]; from?: number }
  | { type: 'riichi'; discardTile: Tile }
  | { type: 'ron'; fromPlayer: number }
  | { type: 'tsumo' }
  | { type: 'pass' };
```

### ゲームイベント
```typescript
type GameEvent =
  | { type: 'game_started'; players: Player[] }
  | { type: 'hand_dealt'; hands: Tile[][] }
  | { type: 'tile_drawn'; player: number; tile?: Tile }
  | { type: 'tile_discarded'; player: number; tile: Tile }
  | { type: 'meld_called'; player: number; meld: Meld }
  | { type: 'riichi_declared'; player: number }
  | { type: 'win_declared'; winner: number; hand: WinHand }
  | { type: 'round_ended'; result: RoundResult };
```

## UI/UX考慮事項

### 牌の表示
- **手牌**: 下部に扇形配置
- **捨て牌**: 中央エリアに時系列表示
- **鳴き**: 手牌右側に横置き表示
- **牌山**: 上部に表示（残り枚数）

### インタラクション
- **ドラッグ&ドロップ**: 手牌から捨て牌エリアへ
- **クリック選択**: 鳴き牌の選択
- **ボタン操作**: ポン・チー・カン・ロン・ツモ
- **時間制限**: 各アクション30秒

### 情報表示
- **持ち点**: 各プレイヤー名の下
- **ドラ表示**: 上部中央
- **リーチ棒**: プレイヤー前に表示
- **場況**: 東1局・本場数・供託

## 技術的考慮事項

### パフォーマンス
- **牌画像**: スプライトシート使用
- **状態管理**: Immutable構造
- **ネットワーク**: 差分更新のみ送信

### セキュリティ
- **牌情報**: サーバーサイドで管理
- **アクション検証**: 不正操作防止
- **タイムアウト**: 無応答対策

### 拡張性
- **ルール設定**: 設定可能な項目
- **観戦機能**: 状態の読み取り専用アクセス
- **リプレイ**: ゲームログの保存・再生

---

**作成日:** 2025-06-22  
**ステータス:** Phase 1 設計中