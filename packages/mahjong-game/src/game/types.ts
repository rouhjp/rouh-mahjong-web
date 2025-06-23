import { Tile } from '@mahjong/core';
import { PlayerHand, PlayerPosition } from '../player/types.js';

// ゲームアクション
export enum GameAction {
  DISCARD = 'DISCARD',   // 打牌
  PON = 'PON',           // ポン
  CHI = 'CHI',           // チー
  KAN = 'KAN',           // カン
  RIICHI = 'RIICHI',     // リーチ
  RON = 'RON',           // ロン
  TSUMO = 'TSUMO',       // ツモ
  PASS = 'PASS'          // パス
}

// ゲーム状態
export interface GameState {
  players: PlayerHand[];           // 4人のプレイヤー状態
  currentPlayer: PlayerPosition;   // 現在のプレイヤー
  wallTiles: Tile[];               // 王牌（ドラ表示牌など）
  remainingTiles: number;          // 残り牌数
  doraIndicators: Tile[];          // ドラ表示牌
  round: number;                   // 局数
  wind: PlayerPosition;            // 場風
  isGameOver: boolean;             // ゲーム終了フラグ
}