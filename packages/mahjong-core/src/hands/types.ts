import { Tile } from '../tiles/index.js';

// 面子の種類
export enum MeldType {
  PON = 'PON',           // ポン（刻子）
  CHI = 'CHI',           // チー（順子）
  OPEN_KAN = 'OPEN_KAN', // 明カン
  CLOSED_KAN = 'CLOSED_KAN', // 暗カン
  ADDED_KAN = 'ADDED_KAN'    // 加カン
}

// 面子
export interface Meld {
  type: MeldType;
  tiles: Tile[];
}

// 和了形の構成
export interface WinningHand {
  melds: Meld[];     // 面子
  pair: Tile[];      // 雀頭
  isComplete: boolean;
}