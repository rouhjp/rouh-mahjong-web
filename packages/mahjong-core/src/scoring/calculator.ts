import { Tile } from '../tiles/index.js';
import { Hand, HandScore, Wait, WinningSituation } from './types.js';
import type { Meld } from './meld.js';

// 点数計算 - 将来実装予定
export function calculateScore(hand: Hand, situation: WinningSituation): HandScore {
  // TODO: 実装
  throw new Error('点数計算は未実装です。');
}

