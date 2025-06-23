import { Tile, MeldType } from '@mahjong/core';

// プレイヤーの位置
export enum PlayerPosition {
  EAST = 'EAST',   // 東家
  SOUTH = 'SOUTH', // 南家 
  WEST = 'WEST',   // 西家
  NORTH = 'NORTH'  // 北家
}

// 副露（鳴き）
export interface Meld {
  type: MeldType;
  tiles: Tile[];           // 副露した牌
  calledTile?: Tile;       // 鳴いた牌（ポン・チーの場合）
  fromPlayer?: PlayerPosition; // 鳴き元のプレイヤー
}

// プレイヤーの手牌状態
export interface PlayerHand {
  position: PlayerPosition;
  concealedTiles: Tile[];      // 手牌（門前牌）
  melds: Meld[];               // 副露
  discardedTiles: Tile[];      // 河（捨て牌）
  isRiichi: boolean;           // リーチ宣言済み
  points: number;              // 持ち点
}