import { Tile } from '../tiles/index.js';
import { ScoreResult } from './types.js';

// 点数計算 - 将来実装予定
export function calculateScore(hand: Tile[], winningTile: Tile): ScoreResult {
  // TODO: 実装
  return {
    han: 0,
    fu: 0,
    points: 0,
    yakuList: []
  };
}