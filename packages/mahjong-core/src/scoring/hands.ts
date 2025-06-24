
// 役判定ロジック

import type { Hand, HandType, Wait, WinningSituation } from './types';
import type { Meld } from './meld';
import type { Side, Tile } from '../tiles/tile.js';
import { WinningOptions, LimitTypes } from './types';
import { Sides, Tiles, windToTile } from '../tiles/tile.js';
import { getAllHandTiles, getTruncatedHandTiles } from './utils';

// 手牌の統計情報
interface HandStatistics {
  dragonWhiteCount: number;          // 白の枚数
  dragonGreenCount: number;          // 發の枚数
  dragonRedCount: number;            // 中の枚数
  dragonCount: number;               // 三元牌の合計枚数
  windCount: number;                 // 風牌の合計枚数
  roundWindCount: number;            // 場風牌の枚数
  seatWindCount: number;             // 自風牌の枚数
  winningTileCount: number;          // 和了牌の枚数
  terminalCount: number;             // 老頭牌の枚数
  honorCount: number;                // 字牌の枚数
  orphanCount: number;               // 么九牌の枚数
  greenTileCount: number;            // 緑一色構成牌の枚数
  largestDuplicationCount: number;   // 最大同一牌枚数
  tileDistinctCount: number;         // 牌種数
  suitTypeCount: number;             // 数牌の種類数（萬筒索）
  upperPrisedTileCount: number;            // 表ドラの枚数
  lowerPrisedTileCount: number;            // 裏ドラの枚数
  redPrisedTileCount: number;              // 赤ドラの枚数
  quadCount: number;                 // 槓子の数
  callCount: number;                 // 副露の数
}

/**
 * 手牌の統計情報を計算します
 * @param hand 手牌情報
 * @param situation 和了状況
 * @returns 手牌の統計情報
 */
function calculateHandStatistics(hand: Hand, situation: WinningSituation): HandStatistics {
  // 14枚の手牌（和了牌含む、槓子は3枚で計算）
  const hand14: Tile[] = getTruncatedHandTiles(hand);
  
  // 18枚の手牌（和了牌含む、槓子は4枚で計算）
  const hand18: Tile[] = getAllHandTiles(hand);
  
  const roundWindTile = windToTile(situation.roundWind);
  const seatWindTile = windToTile(situation.seatWind);
  
  let dragonWhiteCount = 0;
  let dragonGreenCount = 0;
  let dragonRedCount = 0;
  let dragonCount = 0;
  let windCount = 0;
  let roundWindCount = 0;
  let seatWindCount = 0;
  let winningTileCount = 0;
  let terminalCount = 0;
  let honorCount = 0;
  let orphanCount = 0;
  let greenTileCount = 0;
  
  // 14枚での統計計算
  for (const tile of hand14) {
    if (tile === Tiles.DW) dragonWhiteCount++;
    if (tile === Tiles.DG) dragonGreenCount++;
    if (tile === Tiles.DR) dragonRedCount++;
    if (tile.isDragon()) dragonCount++;
    if (tile.isWind()) windCount++;
    if (tile.equalsIgnoreRed(roundWindTile)) roundWindCount++;
    if (tile.equalsIgnoreRed(seatWindTile)) seatWindCount++;
    if (tile.equalsIgnoreRed(hand.winningTile)) winningTileCount++;
    if (tile.isTerminal()) terminalCount++;
    if (tile.isHonor()) honorCount++;
    if (tile.isOrphan()) orphanCount++;
    if (tile.isGreen()) greenTileCount++;
  }
  
  // 最大同一牌枚数の計算
  const tileCountMap = new Map<number, number>();
  for (const tile of hand14) {
    tileCountMap.set(tile.tileNumber, (tileCountMap.get(tile.tileNumber) || 0) + 1);
  }
  const largestDuplicationCount = Math.max(...tileCountMap.values());
  
  // 牌種数の計算（18枚ベース）
  const distinctTiles = new Set<number>();
  for (const tile of hand18) {
    distinctTiles.add(tile.tileNumber);
  }
  const tileDistinctCount = distinctTiles.size;
  
  // 数牌の種類数
  const suitTypes = new Set<string>();
  for (const tile of hand18) {
    if (!tile.isHonor()) {
      suitTypes.add(tile.tileType);
    }
  }
  const suitTypeCount = suitTypes.size;
  
  // 表ドラの計算
  let upperPrisedTileCount = 0;
  for (const indicator of situation.upperIndicators) {
    const dora = indicator.indicates();
    upperPrisedTileCount += hand18.filter(tile => tile.equalsIgnoreRed(dora)).length;
  }
  
  // 裏ドラの計算（立直時のみ）
  let lowerPrisedTileCount = 0;
  const isReady = situation.options.includes(WinningOptions.READY);
  if (isReady) {
    for (const indicator of situation.lowerIndicators) {
      const doraTile = indicator.indicates();
      lowerPrisedTileCount += hand18.filter(tile => tile.equalsIgnoreRed(doraTile)).length;
    }
  }
  
  // 赤ドラの計算
  const redPrisedTileCount = hand18.filter(tile => tile.isRed).length;

  // 槓子の数
  const quadCount = hand18.length - 14;
  
  // 副露の数（暗槓を除く）
  const callCount = hand.openMelds.filter(meld => !meld.isConcealed()).length;
  
  return {
    dragonWhiteCount,
    dragonGreenCount,
    dragonRedCount,
    dragonCount,
    windCount,
    roundWindCount,
    seatWindCount,
    winningTileCount,
    terminalCount,
    honorCount,
    orphanCount,
    greenTileCount,
    largestDuplicationCount,
    tileDistinctCount,
    suitTypeCount,
    upperPrisedTileCount,
    lowerPrisedTileCount,
    redPrisedTileCount,
    quadCount,
    callCount
  };
}

/**
 * 立直状態かどうか判定
 * @param situation 和了状況
 * @returns true 立直中、false 立直していない
 */
export function isReady(situation: WinningSituation): boolean {
  return situation.options.includes(WinningOptions.READY) || 
         situation.options.includes(WinningOptions.FIRST_AROUND_READY);
}

/**
 * ダブル立直かどうか判定
 * @param situation 和了状況
 * @returns true ダブル立直、false ダブル立直でない
 */
export function isFirstAroundReady(situation: WinningSituation): boolean {
  return situation.options.includes(WinningOptions.FIRST_AROUND_READY);
}

/**
 * 一発状態かどうか判定
 * @param situation 和了状況
 * @returns true 一発中、false 一発でない
 */
export function isReadyAroundWin(situation: WinningSituation): boolean {
  return situation.options.includes(WinningOptions.READY_AROUND_WIN);
}

/**
 * 第一巡ツモ（天和・地和）かどうか判定
 * @param situation 和了状況
 * @returns true 第一巡ツモ、false 第一巡ツモでない
 */
export function isFirstAroundTsumo(situation: WinningSituation): boolean {
  return situation.options.includes(WinningOptions.FIRST_AROUND_TSUMO);
}

/**
 * 海底摸月かどうか判定
 * @param situation 和了状況
 * @returns true 海底摸月、false 海底摸月でない
 */
export function isLastTileTsumo(situation: WinningSituation): boolean {
  return situation.options.includes(WinningOptions.LAST_TILE_TSUMO);
}

/**
 * 河底撈魚かどうか判定
 * @param situation 和了状況
 * @returns true 河底撈魚、false 河底撈魚でない
 */
export function isLastTileRon(situation: WinningSituation): boolean {
  return situation.options.includes(WinningOptions.LAST_TILE_RON);
}

/**
 * 嶺上開花かどうか判定
 * @param situation 和了状況
 * @returns true 嶺上開花、false 嶺上開花でない
 */
export function isQuadTurnTsumo(situation: WinningSituation): boolean {
  return situation.options.includes(WinningOptions.QUAD_TURN_TSUMO);
}

/**
 * 槍槓かどうか判定
 * @param situation 和了状況
 * @returns true 槍槓、false 槍槓でない
 */
export function isQuadTileRon(situation: WinningSituation): boolean {
  return situation.options.includes(WinningOptions.QUAD_TILE_RON);
}

/**
 * ツモ和了かどうか判定
 * @param situation 和了状況
 * @returns true ツモ和了、false ロン和了
 */
export function isTsumo(situation: WinningSituation): boolean {
  return situation.supplierSide === Sides.SELF;
}

/**
 * ロン和了かどうか判定
 * @param situation 和了状況
 * @returns true ロン和了、false ツモ和了
 */
export function isRon(situation: WinningSituation): boolean {
  return situation.supplierSide !== Sides.SELF;
}

interface FormattedHand {
  headTiles: Tile[];
  melds: Meld[];
  wait: Wait;
}

export interface MeldInsensitiveHandType extends HandType {
  test: (statistics: HandStatistics, situation: WinningSituation) => boolean;
  getCompleterSide?: (openMelds: Meld[]) => Side;
}

export interface MeldSensitiveHandType extends HandType {
  test: (hand: FormattedHand, situation: WinningSituation) => boolean;
}

/**
 * 親かどうか判定
 * @param situation 和了状況
 * @returns true 親、false 子
 */
export function isDealer(situation: WinningSituation): boolean {
  return situation.seatWind === situation.roundWind;
}

/**
 * 第一巡和了かどうか判定
 * @param situation 和了状況
 * @returns true 第一巡和了、false 第一巡和了でない
 */
export function isFirstAroundWin(situation: WinningSituation): boolean {
  return situation.options.includes(WinningOptions.FIRST_AROUND_TSUMO);
}

const LimitHandTypes: MeldInsensitiveHandType[] = [
  // 天和
  {
    name: '天和',
    isLimit: true,
    doubles: 0,
    limitType: LimitTypes.HAND_LIMIT,
    test: (_, situation: WinningSituation) => {
      return isFirstAroundWin(situation) && isDealer(situation) && isTsumo(situation);
    }
  },
  
  // 地和
  {
    name: '地和',
    isLimit: true,
    doubles: 0,
    limitType: LimitTypes.HAND_LIMIT,
    test: (_, situation: WinningSituation) => {
      return isFirstAroundWin(situation) && !isDealer(situation) && isTsumo(situation);
    }
  },
  
  // 国士無双
  {
    name: '国士無双',
    isLimit: true,
    doubles: 0,
    limitType: LimitTypes.HAND_LIMIT,
    test: (statistics: HandStatistics, _) => {
      return statistics.callCount === 0 && statistics.tileDistinctCount === 13 &&
             statistics.orphanCount === 14 && statistics.winningTileCount === 1;
    }
  },
  
  // 国士無双十三面待ち
  {
    name: '国士無双十三面',
    isLimit: true,
    doubles: 0,
    limitType: LimitTypes.DOUBLE_HAND_LIMIT,
    test: (statistics: HandStatistics, _) => {
      return statistics.callCount === 0 && statistics.tileDistinctCount === 13 &&
             statistics.orphanCount === 14 && statistics.winningTileCount === 2;
    }
  },
  
  // 九蓮宝燈
  {
    name: '九蓮宝燈',
    isLimit: true,
    doubles: 0,
    limitType: LimitTypes.HAND_LIMIT,
    test: (statistics: HandStatistics, _) => {
      return statistics.callCount === 0 && statistics.quadCount === 0 &&
             statistics.suitTypeCount === 1 && statistics.tileDistinctCount === 9 &&
             statistics.honorCount === 0 &&
             statistics.terminalCount === (statistics.largestDuplicationCount === 4 ? 7 : 6) &&
             statistics.winningTileCount % 2 === 1;
    }
  },
  
  // 純正九蓮宝燈
  {
    name: '純正九蓮宝燈',
    isLimit: true,
    doubles: 0,
    limitType: LimitTypes.DOUBLE_HAND_LIMIT,
    test: (statistics: HandStatistics, _) => {
      return statistics.callCount === 0 && statistics.quadCount === 0 &&
             statistics.suitTypeCount === 1 && statistics.tileDistinctCount === 9 &&
             statistics.honorCount === 0 &&
             statistics.terminalCount === (statistics.largestDuplicationCount === 4 ? 7 : 6) &&
             statistics.winningTileCount % 2 === 0;
    }
  },
  
  // 四槓子
  {
    name: '四槓子',
    isLimit: true,
    doubles: 0,
    limitType: LimitTypes.DOUBLE_HAND_LIMIT,
    test: (statistics: HandStatistics, _) => {
      return statistics.quadCount === 4;
    },
  },
  
  // 大三元
  {
    name: '大三元',
    isLimit: true,
    doubles: 0,
    limitType: LimitTypes.HAND_LIMIT,
    test: (statistics: HandStatistics, _) => {
      return statistics.dragonCount === 9;
    },
  },
  
  // 小四喜
  {
    name: '小四喜',
    isLimit: true,
    doubles: 0,
    limitType: LimitTypes.HAND_LIMIT,
    test: (statistics: HandStatistics, _) => {
      return statistics.windCount === 11;
    }
  },
  
  // 大四喜
  {
    name: '大四喜',
    isLimit: true,
    doubles: 0,
    limitType: LimitTypes.DOUBLE_HAND_LIMIT,
    test: (statistics: HandStatistics, _) => {
      return statistics.windCount === 12;
    },
  },
  
  // 字一色
  {
    name: '字一色',
    isLimit: true,
    doubles: 0,
    limitType: LimitTypes.HAND_LIMIT,
    test: (statistics: HandStatistics, _) => {
      return statistics.honorCount === 14;
    }
  },
  
  // 清老頭
  {
    name: '清老頭',
    isLimit: true,
    doubles: 0,
    limitType: LimitTypes.HAND_LIMIT,
    test: (statistics: HandStatistics, _) => {
      return statistics.terminalCount === 14;
    }
  },
  
  // 緑一色
  {
    name: '緑一色',
    isLimit: true,
    doubles: 0,
    limitType: LimitTypes.HAND_LIMIT,
    test: (statistics: HandStatistics, _) => {
      return statistics.greenTileCount === 14;
    }
  },
  
  // 四暗刻
  {
    name: '四暗刻',
    isLimit: true,
    doubles: 0,
    limitType: LimitTypes.HAND_LIMIT,
    test: (statistics: HandStatistics, situation: WinningSituation) => {
      return statistics.callCount === 0 &&
             statistics.tileDistinctCount === 5 &&
             statistics.largestDuplicationCount === 3 &&
             statistics.winningTileCount === 3 &&
             isTsumo(situation);
    }
  },
  
  // 四暗刻単騎待ち
  {
    name: '四暗刻単騎',
    isLimit: true,
    doubles: 0,
    limitType: LimitTypes.DOUBLE_HAND_LIMIT,
    test: (statistics: HandStatistics, situation: WinningSituation) => {
      return statistics.callCount === 0 &&
             statistics.tileDistinctCount === 5 &&
             statistics.largestDuplicationCount === 3 &&
             statistics.winningTileCount === 2;
    }
  }
];

/**
 * 海底牌和了かどうか判定
 * @param situation 和了状況
 * @returns true 海底牌和了、false 海底牌和了でない
 */
export function isLastTileWin(situation: WinningSituation): boolean {
  return situation.options.includes(WinningOptions.LAST_TILE_TSUMO) ||
         situation.options.includes(WinningOptions.LAST_TILE_RON);
}

/**
 * 嶺上開花かどうか判定
 * @param situation 和了状況
 * @returns true 嶺上開花、false 嶺上開花でない
 */
export function isQuadTurnWin(situation: WinningSituation): boolean {
  return situation.options.includes(WinningOptions.QUAD_TURN_TSUMO);
}

/**
 * 槍槓かどうか判定
 * @param situation 和了状況
 * @returns true 槍槓、false 槍槓でない
 */
export function isQuadTileWin(situation: WinningSituation): boolean {
  return situation.options.includes(WinningOptions.QUAD_TILE_RON);
}

const MeldInsensitiveNormalHandTypes: MeldInsensitiveHandType[] = [
  // 立直
  {
    name: '立直',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (_, situation: WinningSituation) => {
      return isReady(situation) && !isFirstAroundReady(situation);
    }
  },

  // 両立直（ダブル立直）
  {
    name: '両立直',
    isLimit: false,
    doubles: 2,
    limitType: LimitTypes.EMPTY,
    test: (_, situation: WinningSituation) => {
      return isFirstAroundReady(situation);
    }
  },

  // 一発
  {
    name: '一発',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (_, situation: WinningSituation) => {
      return isReadyAroundWin(situation);
    }
  },

  // 門前清自摸和
  {
    name: '門前清自摸和',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (statistics: HandStatistics, situation: WinningSituation) => {
      return statistics.callCount === 0 && isTsumo(situation);
    }
  },

  // 海底摸月
  {
    name: '海底摸月',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (_, situation: WinningSituation) => {
      return isLastTileWin(situation) && isTsumo(situation);
    }
  },

  // 河底撈魚
  {
    name: '河底撈魚',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (_, situation: WinningSituation) => {
      return isLastTileWin(situation) && !isTsumo(situation);
    }
  },

  // 嶺上開花
  {
    name: '嶺上開花',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (_, situation: WinningSituation) => {
      return isQuadTurnWin(situation);
    }
  },

  // 槍槓
  {
    name: '槍槓',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (_, situation: WinningSituation) => {
      return isQuadTileWin(situation);
    }
  },

  // 断么九
  {
    name: '断么九',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (statistics: HandStatistics, _) => {
      return statistics.orphanCount === 0;
    }
  },

  // 混一色（門前）
  {
    name: '混一色',
    isLimit: false,
    doubles: 3,
    limitType: LimitTypes.EMPTY,
    test: (statistics: HandStatistics, _) => {
      return statistics.callCount === 0 &&
             statistics.honorCount > 0 && statistics.suitTypeCount === 1;
    }
  },

  // 混一色（副露）
  {
    name: '混一色',
    isLimit: false,
    doubles: 2,
    limitType: LimitTypes.EMPTY,
    test: (statistics: HandStatistics, _) => {
      return statistics.callCount > 0 &&
             statistics.honorCount > 0 && statistics.suitTypeCount === 1;
    }
  },

  // 清一色（門前）
  {
    name: '清一色',
    isLimit: false,
    doubles: 6,
    limitType: LimitTypes.EMPTY,
    test: (statistics: HandStatistics, _) => {
      return statistics.callCount === 0 &&
             statistics.honorCount === 0 && statistics.suitTypeCount === 1;
    }
  },

  // 清一色（副露）
  {
    name: '清一色',
    isLimit: false,
    doubles: 5,
    limitType: LimitTypes.EMPTY,
    test: (statistics: HandStatistics, _) => {
      return statistics.callCount > 0 &&
             statistics.honorCount === 0 && statistics.suitTypeCount === 1;
    }
  },

  // 三槓子
  {
    name: '三槓子',
    isLimit: false,
    doubles: 2,
    limitType: LimitTypes.EMPTY,
    test: (statistics: HandStatistics, _) => {
      return statistics.quadCount === 3;
    }
  },

  // 小三元
  {
    name: '小三元',
    isLimit: false,
    doubles: 2,
    limitType: LimitTypes.EMPTY,
    test: (statistics: HandStatistics, _) => {
      return statistics.dragonCount === 8;
    }
  },

  // 混老頭
  {
    name: '混老頭',
    isLimit: false,
    doubles: 2,
    limitType: LimitTypes.EMPTY,
    test: (statistics: HandStatistics, _) => {
      return statistics.honorCount > 0 &&
             statistics.orphanCount === 14 &&
             statistics.tileDistinctCount <= 7;
    }
  },

  // 翻牌 白
  {
    name: '翻牌 白',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (statistics: HandStatistics, _) => {
      return statistics.dragonWhiteCount === 3;
    }
  },

  // 翻牌 發
  {
    name: '翻牌 發',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (statistics: HandStatistics, _) => {
      return statistics.dragonGreenCount === 3;
    }
  },

  // 翻牌 中
  {
    name: '翻牌 中',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (statistics: HandStatistics, _) => {
      return statistics.dragonRedCount === 3;
    }
  },

  // 自風牌
  {
    name: '自風牌',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (statistics: HandStatistics, _) => {
      return statistics.seatWindCount === 3;
    }
  },

  // 場風牌
  {
    name: '場風牌',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (statistics: HandStatistics, _) => {
      return statistics.roundWindCount === 3;
    }
  }
];

/**
 * 面子の組み合わせを生成（3つ選択）
 * @param melds 面子のリスト
 * @returns 3つの面子の組み合わせ
 */
function getCombinationsOf3(melds: Meld[]): Meld[][] {
  const combinations: Meld[][] = [];
  for (let i = 0; i < melds.length - 2; i++) {
    for (let j = i + 1; j < melds.length - 1; j++) {
      for (let k = j + 1; k < melds.length; k++) {
        combinations.push([melds[i], melds[j], melds[k]]);
      }
    }
  }
  return combinations;
}

/**
 * 面子の組み合わせを生成（2つ選択）
 * @param melds 面子のリスト
 * @returns 2つの面子の組み合わせ
 */
function getCombinationsOf2(melds: Meld[]): Meld[][] {
  const combinations: Meld[][] = [];
  for (let i = 0; i < melds.length - 1; i++) {
    for (let j = i + 1; j < melds.length; j++) {
      combinations.push([melds[i], melds[j]]);
    }
  }
  return combinations;
}

/**
 * 面子が字牌面子かどうか判定
 * @param meld 面子
 * @returns true 字牌面子、false 数牌面子
 */
function isHonorMeld(meld: Meld): boolean {
  const allTiles = meld.getAllTiles();
  return allTiles.some(tile => tile.isHonor());
}

/**
 * 面子が老頭牌面子かどうか判定
 * @param meld 面子
 * @returns true 老頭牌面子、false 老頭牌面子でない
 */
function isTerminalMeld(meld: Meld): boolean {
  return meld.isTerminalMeld();
}

/**
 * 面子が么九牌面子かどうか判定
 * @param meld 面子
 * @returns true 么九牌面子、false 么九牌面子でない
 */
function isOrphanMeld(meld: Meld): boolean {
  return meld.isOrphanMeld();
}

/**
 * 雀頭が么九牌かどうか判定
 * @param headTiles 雀頭の牌
 * @returns true 么九牌雀頭、false 么九牌雀頭でない
 */
function isOrphanHead(headTiles: Tile[]): boolean {
  return headTiles.some(tile => tile.isOrphan());
}

/**
 * 雀頭が字牌かどうか判定
 * @param headTiles 雀頭の牌
 * @returns true 字牌雀頭、false 字牌雀頭でない
 */
function isHonorHead(headTiles: Tile[]): boolean {
  return headTiles.some(tile => tile.isHonor());
}

/**
 * 雀頭が老頭牌かどうか判定
 * @param headTiles 雀頭の牌
 * @returns true 老頭牌雀頭、false 老頭牌雀頭でない
 */
function isTerminalHead(headTiles: Tile[]): boolean {
  return headTiles.some(tile => tile.isTerminal());
}

const MeldSensitiveNormalHandTypes: MeldSensitiveHandType[] = [
  // 対々和
  {
    name: '対々和',
    isLimit: false,
    doubles: 2,
    limitType: LimitTypes.EMPTY,
    test: (hand: FormattedHand, _) => {
      return hand.melds.every(meld => !meld.isStraight());
    }
  },

  // 三暗刻
  {
    name: '三暗刻',
    isLimit: false,
    doubles: 2,
    limitType: LimitTypes.EMPTY,
    test: (hand: FormattedHand, _) => {
      const concealedTriples = hand.melds.filter(meld => 
        meld.isConcealed() && !meld.isStraight()
      );
      return concealedTriples.length === 3;
    }
  },

  // 平和
  {
    name: '平和',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (hand: FormattedHand, situation: WinningSituation) => {
      // TODO: 符の計算を実装
      // 門前で全順子、役牌でない雀頭、両面待ち
      return hand.melds.every(meld => meld.isStraight()) &&
             // 雀頭が役牌でない && 両面待ち && 門前
             true; // 仮実装
    }
  },

  // 混全帯么九（門前）
  {
    name: '混全帯么九',
    isLimit: false,
    doubles: 2,
    limitType: LimitTypes.EMPTY,
    test: (hand: FormattedHand, _) => {
      const allOrphan = hand.melds.every(meld => isOrphanMeld(meld)) && isOrphanHead(hand.headTiles);
      const hasHonor = hand.melds.some(meld => isHonorMeld(meld)) || isHonorHead(hand.headTiles);
      const hasStraight = hand.melds.some(meld => meld.isStraight());
      return allOrphan && hasHonor && hasStraight;
    }
  },

  // 混全帯么九（副露）
  {
    name: '混全帯么九',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (hand: FormattedHand, _) => {
      const allOrphan = hand.melds.every(meld => isOrphanMeld(meld)) && isOrphanHead(hand.headTiles);
      const hasHonor = hand.melds.some(meld => isHonorMeld(meld)) || isHonorHead(hand.headTiles);
      const hasStraight = hand.melds.some(meld => meld.isStraight());
      const hasCalls = hand.melds.some(meld => !meld.isConcealed());
      return allOrphan && hasHonor && hasStraight && hasCalls;
    }
  },

  // 純全帯么九（門前）
  {
    name: '純全帯么九',
    isLimit: false,
    doubles: 3,
    limitType: LimitTypes.EMPTY,
    test: (hand: FormattedHand, _) => {
      const allTerminal = hand.melds.every(meld => isTerminalMeld(meld)) && isTerminalHead(hand.headTiles);
      const hasStraight = hand.melds.some(meld => meld.isStraight());
      const allConcealed = hand.melds.every(meld => meld.isConcealed());
      return allTerminal && hasStraight && allConcealed;
    }
  },

  // 純全帯么九（副露）
  {
    name: '純全帯么九',
    isLimit: false,
    doubles: 2,
    limitType: LimitTypes.EMPTY,
    test: (hand: FormattedHand, _) => {
      const allTerminal = hand.melds.every(meld => isTerminalMeld(meld)) && isTerminalHead(hand.headTiles);
      const hasStraight = hand.melds.some(meld => meld.isStraight());
      const hasCalls = hand.melds.some(meld => !meld.isConcealed());
      return allTerminal && hasStraight && hasCalls;
    }
  },

  // 一気通貫（門前）
  {
    name: '一気通貫',
    isLimit: false,
    doubles: 2,
    limitType: LimitTypes.EMPTY,
    test: (hand: FormattedHand, _) => {
      const allConcealed = hand.melds.every(meld => meld.isConcealed());
      if (!allConcealed) return false;

      const combinations = getCombinationsOf3(hand.melds);
      return combinations.some(melds => {
        const tileTypes = new Set(melds.map(meld => meld.getAllTiles()[0].tileType));
        if (tileTypes.size !== 1) return false;

        const numbers = new Set(melds.flatMap(meld => meld.getAllTiles().map(tile => tile.suitNumber)));
        return numbers.size === 9;
      });
    }
  },

  // 一気通貫（副露）
  {
    name: '一気通貫',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (hand: FormattedHand, _) => {
      const hasCalls = hand.melds.some(meld => !meld.isConcealed());
      if (!hasCalls) return false;

      const combinations = getCombinationsOf3(hand.melds);
      return combinations.some(melds => {
        const tileTypes = new Set(melds.map(meld => meld.getAllTiles()[0].tileType));
        if (tileTypes.size !== 1) return false;

        const numbers = new Set(melds.flatMap(meld => meld.getAllTiles().map(tile => tile.suitNumber)));
        return numbers.size === 9;
      });
    }
  },

  // 三色同順（門前）
  {
    name: '三色同順',
    isLimit: false,
    doubles: 2,
    limitType: LimitTypes.EMPTY,
    test: (hand: FormattedHand, _) => {
      const allConcealed = hand.melds.every(meld => meld.isConcealed());
      if (!allConcealed) return false;

      const combinations = getCombinationsOf3(hand.melds);
      return combinations.some(melds => {
        if (!melds.every(meld => meld.isStraight())) return false;
        
        const tileTypes = new Set(melds.map(meld => meld.getAllTiles()[0].tileType));
        const firstNumbers = new Set(melds.map(meld => meld.getAllTiles()[0].suitNumber));
        
        return tileTypes.size === 3 && firstNumbers.size === 1;
      });
    }
  },

  // 三色同順（副露）
  {
    name: '三色同順',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (hand: FormattedHand, _) => {
      const hasCalls = hand.melds.some(meld => !meld.isConcealed());
      if (!hasCalls) return false;

      const combinations = getCombinationsOf3(hand.melds);
      return combinations.some(melds => {
        if (!melds.every(meld => meld.isStraight())) return false;
        
        const tileTypes = new Set(melds.map(meld => meld.getAllTiles()[0].tileType));
        const firstNumbers = new Set(melds.map(meld => meld.getAllTiles()[0].suitNumber));
        
        return tileTypes.size === 3 && firstNumbers.size === 1;
      });
    }
  },

  // 三色同刻
  {
    name: '三色同刻',
    isLimit: false,
    doubles: 2,
    limitType: LimitTypes.EMPTY,
    test: (hand: FormattedHand, _) => {
      const combinations = getCombinationsOf3(hand.melds);
      return combinations.some(melds => {
        if (melds.some(meld => meld.isStraight() || isHonorMeld(meld))) return false;
        
        const tileTypes = new Set(melds.map(meld => meld.getAllTiles()[0].tileType));
        const firstNumbers = new Set(melds.map(meld => meld.getAllTiles()[0].suitNumber));
        
        return tileTypes.size === 3 && firstNumbers.size === 1;
      });
    }
  },

  // 一盃口
  {
    name: '一盃口',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (hand: FormattedHand, _) => {
      const allConcealed = hand.melds.every(meld => meld.isConcealed());
      if (!allConcealed) return false;

      const combinations = getCombinationsOf2(hand.melds);
      const duplicateCount = combinations.filter(melds => {
        if (!melds.every(meld => meld.isStraight())) return false;
        
        const firstTiles = melds.map(meld => meld.getAllTiles()[0]);
        return firstTiles[0].equalsIgnoreRed(firstTiles[1]);
      }).length;
      
      return duplicateCount === 1;
    }
  },

  // 二盃口
  {
    name: '二盃口',
    isLimit: false,
    doubles: 3,
    limitType: LimitTypes.EMPTY,
    test: (hand: FormattedHand, _) => {
      const allConcealed = hand.melds.every(meld => meld.isConcealed());
      if (!allConcealed || !hand.melds.every(meld => meld.isStraight())) return false;

      // 面子の最初の牌でグループ化
      const groupMap = new Map<number, number>();
      for (const meld of hand.melds) {
        const firstTile = meld.getAllTiles()[0];
        const count = groupMap.get(firstTile.tileNumber) || 0;
        groupMap.set(firstTile.tileNumber, count + 1);
      }
      
      // 全てのグループが2つずつかチェック
      return Array.from(groupMap.values()).every(count => count === 2);
    }
  }
];
