// 点数計算関連の型定義 - 将来実装予定

// 役の定義
export interface Yaku {
  name: string;
  han: number;
  isMenzen: boolean; // 門前役かどうか
}

// 点数計算結果
export interface ScoreResult {
  han: number;
  fu: number;
  points: number;
  yakuList: Yaku[];
}