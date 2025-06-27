import type { Hand, HandType } from './hand';
import type { Wait } from './wait';
import type { WinningSituation } from './game';
import type { Meld, Head } from './meld';
import type { Tile, TileType } from '../tiles/tile.js';
import { WinningOptions } from './game';
import { LimitTypes } from './limit';
import { Tiles } from '../tiles/tile.js';
import { windToTile } from '../tiles';

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
  upperPrisedTileCount: number;      // 表ドラの枚数
  lowerPrisedTileCount: number;      // 裏ドラの枚数
  redPrisedTileCount: number;        // 赤ドラの枚数
  quadCount: number;                 // 槓子の数
  callCount: number;                 // 副露の数
}

/**
 * 手牌の統計情報を計算します
 * @param hand 手牌情報
 * @param situation 和了状況
 * @returns 手牌の統計情報
 */
export function calculateHandStatistics(hand: Hand, situation: WinningSituation): HandStatistics {
  // 14枚の手牌（和了牌含む、槓子は3枚で計算）
  const hand14: Tile[] = hand.getTruncatedTiles();
  
  // 18枚の手牌（和了牌含む、槓子は4枚で計算）
  const hand18: Tile[] = hand.getAllTiles();
  
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
    if (tile === Tiles.S2 || tile === Tiles.S3 || tile === Tiles.S4 ||
        tile === Tiles.S6 || tile === Tiles.S8 || tile === Tiles.DG) greenTileCount++;
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
  const suitTypes = new Set<TileType>();
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

interface FormattedHand {
  head: Head;
  melds: Meld[];
  wait: Wait;
}

export interface MeldInsensitiveHandType extends HandType {
  test: (statistics: HandStatistics, situation: WinningSituation) => boolean;
}

export interface MeldSensitiveHandType extends HandType {
  test: (hand: FormattedHand, situation: WinningSituation) => boolean;
}

const LimitHandTypes: MeldInsensitiveHandType[] = [
  // 天和
  {
    name: '天和',
    isLimit: true,
    doubles: 0,
    limitType: LimitTypes.HAND_LIMIT,
    test: (_, situation: WinningSituation) => {
      return situation.isFirstAroundWin() && situation.isDealer() && situation.isTsumo();
    }
  },
  
  // 地和
  {
    name: '地和',
    isLimit: true,
    doubles: 0,
    limitType: LimitTypes.HAND_LIMIT,
    test: (_, situation: WinningSituation) => {
      return situation.isFirstAroundWin() && !situation.isDealer() && situation.isTsumo();
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
             situation.isTsumo();
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

const MeldInsensitiveNormalHandTypes: MeldInsensitiveHandType[] = [
  // 立直
  {
    name: '立直',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (_, situation: WinningSituation) => {
      return situation.isReady() && !situation.isFirstAroundReady();
    }
  },

  // 両立直（ダブル立直）
  {
    name: '両立直',
    isLimit: false,
    doubles: 2,
    limitType: LimitTypes.EMPTY,
    test: (_, situation: WinningSituation) => {
      return situation.isFirstAroundReady();
    }
  },

  // 一発
  {
    name: '一発',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (_, situation: WinningSituation) => {
      return situation.isReadyAroundWin();
    }
  },

  // 門前清自摸和
  {
    name: '門前清自摸和',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (statistics: HandStatistics, situation: WinningSituation) => {
      return statistics.callCount === 0 && situation.isTsumo();
    }
  },

  // 海底摸月
  {
    name: '海底摸月',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (_, situation: WinningSituation) => {
      return situation.isLastTileWin() && situation.isTsumo();
    }
  },

  // 河底撈魚
  {
    name: '河底撈魚',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (_, situation: WinningSituation) => {
      return situation.isLastTileWin() && !situation.isTsumo();
    }
  },

  // 嶺上開花
  {
    name: '嶺上開花',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (_, situation: WinningSituation) => {
      return situation.isQuadTurnTsumo();
    }
  },

  // 槍槓
  {
    name: '槍槓',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (_, situation: WinningSituation) => {
      return situation.isQuadTileRon();
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
      return hand.melds.every(meld => meld.getPoint() === 0) &&
              hand.head.getPoint(situation.roundWind, situation.seatWind) === 0 &&
              hand.wait.getPoint() === 0;
    }
  },

  // 混全帯么九（門前）
  {
    name: '混全帯么九',
    isLimit: false,
    doubles: 2,
    limitType: LimitTypes.EMPTY,
    test: (hand: FormattedHand, _) => {
      const allOrphan = hand.melds.every(meld => meld.isOrphan()) && hand.head.isOrphan();
      const hasHonor = hand.melds.some(meld => meld.isHonor()) || hand.head.isHonor();
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
      const allOrphan = hand.melds.every(meld => meld.isOrphan()) && hand.head.isOrphan();
      const hasHonor = hand.melds.some(meld => meld.isHonor()) || hand.head.isHonor();
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
      const allTerminal = hand.melds.every(meld => meld.isTerminal()) && hand.head.isTerminal();
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
      const allTerminal = hand.melds.every(meld => meld.isTerminal()) && hand.head.isTerminal();
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
        if (melds.some(meld => meld.isStraight() || meld.isHonor())) return false;
        
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
