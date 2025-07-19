import type { WinningSituation } from './situation.js';
import { type Head, createHandMeld, createHead, createHandMeldWithClaimed, Meld, Wait, Waits } from './meld.js';
import type { Side, Tile, Wind } from '../tiles/index.js';
import { Sides, sorted, Tiles, windToTile, equalsIgnoreRed, isDragon, isWind, isTerminal, isHonor, isOrphan, TileInfo, getIndicatedTile, isPrisedRed } from '../tiles/index.js';
import { arrange, combinations, isSevenPairsCompleted, removeEach } from '../functions/index.js';
import { createHandScoreOf, createHandScoreOfHandLimit, createHandScoreOfRiverLimit, HandScore, HandType, LimitTypes, PointType, PointTypes } from './score.js';
import _ from 'lodash';

export interface Hand {
  handTiles: Tile[]; // 手牌
  winningTile: Tile; // 和了牌
  openMelds: Meld[]; // 公開面子
}

/**
 * 手牌が完成形の場合、役が存在するかどうかを判定します。
 * @param hand 手牌、和了牌、公開面子
 * @param situation 和了状況
 * @returns true 役が存在する場合
 */
export function hasScore(hand: Hand, situation: WinningSituation): boolean {
  const statistics = calculateHandStatistics(hand, situation);
  if (Object.values(LimitHandTypes).some(type => type.test(statistics, situation))) {
    return true;
  }
  if (Object.values(MeldInsensitiveNormalHandTypes).some(type => type.test(statistics, situation))) {
    return true;
  }
  if (isSevenPairsCompleted(hand.handTiles, hand.winningTile)) {
    return true;
  }
  return format(hand, situation.isTsumo()).some(formattedHand => 
      Object.values(MeldSensitiveNormalHandTypes).some(type => type.test(formattedHand, statistics, situation)));
}

/**
 * 完成形の手牌の点数を計算します。
 * @param hand 手牌、和了牌、公開面子
 * @param situation 和了状況
 * @throws Error 完成形の手牌でない場合
 * @returns 点数オブジェクト
 */
export function calculate(hand: Hand, situation: WinningSituation): HandScore {
  const statistics = calculateHandStatistics(hand, situation);
  // 大明槓責任払いであれば supplier を更新
  let supplierSide = situation.supplierSide;
  if (situation.isQuadTurnTsumo()) {
    supplierSide = hand.openMelds[hand.openMelds.length - 1].side;
  }
  let limitHandTypes = Object.values(LimitHandTypes).filter(type => type.test(statistics, situation));
  if (limitHandTypes.includes(LimitHandTypes.BLESSING_OF_HEAVEN)) {
    // 親の初手14枚は全て配牌扱いのため、全牌がツモの場合の和了を考える必要がある
    // このため国士無双は十三面待ち、九蓮宝燈は純正、四暗刻は単騎待ちが適用される
    limitHandTypes = limitHandTypes.map(type => {
      if (type === LimitHandTypes.THIRTEEN_ORPHANS) return LimitHandTypes.THIRTEEN_ORPHANS_13_WAIT;
      if (type === LimitHandTypes.NINE_GATES) return LimitHandTypes.NINE_GATES_9_WAIT;
      if (type === LimitHandTypes.FOUR_CONCEALED_TRIPLES) return LimitHandTypes.FOUR_CONCEALED_TRIPLES_1_WAIT;
      return type;
    })
  }
  if (limitHandTypes.length > 0) {
    // 包が発生しているかチェック
    const completerSides = new Map<HandType, Side>();
    for (const type of limitHandTypes) {
      if (type.getCompleterSide) {
        const completerSide = type.getCompleterSide(hand.openMelds);
        if (completerSide !== Sides.SELF) {
          completerSides.set(type, completerSide);
        }
      }
    }
    // 八連荘判定(役無しでは成立しないため、あとから判定)
    const handTypes: HandType[] = [...limitHandTypes];
    if (situation.isEightConsecutiveWin()) {
      handTypes.push(EIGHT_CONSECUTIVE_WIN);
    }
    return createHandScoreOfHandLimit(handTypes, situation.seatWind, supplierSide, completerSides);
  }
  const meldInsensitiveHandTypes = Object.values(MeldInsensitiveNormalHandTypes).filter(type => type.test(statistics, situation));
  const prisedTileHandTypes = getPrisedTileHandTypes(statistics);
  const handScores: HandScore[] = [];
  // 七対子特殊形
  if (isSevenPairsCompleted(hand.handTiles, hand.winningTile)) {
    // 八連荘判定
    if (situation.isEightConsecutiveWin()) {
      return createHandScoreOfHandLimit([EIGHT_CONSECUTIVE_WIN], situation.seatWind, supplierSide, new Map());
    }
    const pointTypes = [PointTypes.SEVEN_PAIR_BASE];
    const handTypes = [...meldInsensitiveHandTypes, SEVEN_PAIRS, ...prisedTileHandTypes];
    const handScore = createHandScoreOf(pointTypes, handTypes, situation.seatWind, situation.supplierSide);
    handScores.push(handScore);
  }
  for (const formattedHand of format(hand, situation.isTsumo())) {
    const pointTypes = pointTypesOf(formattedHand, statistics, situation);
    const meldSensitiveHandTypes = Object.values(MeldSensitiveNormalHandTypes).filter(type => type.test(formattedHand, statistics, situation));
    const handTypes: HandType[] = [...meldInsensitiveHandTypes, ...meldSensitiveHandTypes];
    if (handTypes.length > 0) {
      // 役があれば八連荘、ドラを判定
      if (situation.isEightConsecutiveWin()) {
        return createHandScoreOfHandLimit([EIGHT_CONSECUTIVE_WIN], situation.seatWind, supplierSide, new Map());
      }
      handTypes.push(...prisedTileHandTypes);
    }
    const handScore = createHandScoreOf(pointTypes, handTypes, situation.seatWind, supplierSide);
    handScores.push(handScore);
  }
  if (handScores.length === 0) {
    throw new Error("hand not completed");
  }
  const highestHandScore = [...handScores].sort((a, b) => b.compareTo(a))[0];
  return highestHandScore;
}

/**
 * 流し満貫の点数を計算します。
 */
export function riverLimitHandScoreOf(winnerWind: Wind): HandScore {
  return createHandScoreOfRiverLimit(RIVER_LIMIT, LimitTypes.LIMIT, winnerWind);
}

interface FormattedHand {
  head: Head;    // 雀頭
  melds: Meld[]; // 面子
  wait: Wait;    // 待ち
}

function format(hand: Hand, isTsumo: boolean): FormattedHand[] {
  const formattedHands: FormattedHand[] = [];
  for(const arranged of arrange(hand.handTiles, hand.winningTile)) {
    const head = createHead(arranged[0]);
    const tail = arranged.slice(1);
    if (head.tiles.some(tile => equalsIgnoreRed(tile, hand.winningTile))) {
      const wait = Waits.SINGLE_HEAD;
      const melds: Meld[] = [...tail.map(tiles => createHandMeld(tiles)), ...hand.openMelds];
      formattedHands.push({ head, melds, wait });
    }
    for (let i = 0; i < tail.length; i++) {
      const winningTile = tail[i].find(tile => equalsIgnoreRed(tile, hand.winningTile));
      if (winningTile) {
        const winningMeld: Meld = isTsumo ? createHandMeld(tail[i]) :
          createHandMeldWithClaimed(removeEach(tail[i], [winningTile]), winningTile);
        const otherMelds: Meld[] = tail.filter((_, index) => index !== i).map(tiles => createHandMeld(tiles));
        const melds = [...otherMelds, winningMeld, ...hand.openMelds];
        const wait = winningMeld.getWait(winningTile);
        formattedHands.push({ head, melds, wait });
      }
    }
  }
  return formattedHands;
}

function pointTypesOf(hand: FormattedHand, statistics: HandStatistics, situation: WinningSituation): PointType[] {
  const handPointTypes: PointType[] = [
    hand.wait.getPointType(),
    hand.head.getPointType(situation.roundWind, situation.seatWind),
    ...hand.melds.map(meld => meld.getPointType()),
  ].filter(type => type.points > 0);
  const concealed = statistics.callCount === 0;
  const tsumo = situation.isTsumo();
  const noPoint = handPointTypes.length === 0;
  if (concealed && tsumo && noPoint) {
    // 平和ツモ 固定20符
    return [PointTypes.BASE];
  }
  if (!concealed && noPoint) {
    // 喰い平和 固定30符
    return [PointTypes.BASE, PointTypes.CALLED_NO_POINT];
  }
  const pointTypes: PointType[] = [PointTypes.BASE, ...handPointTypes];
  if (tsumo){ 
    // ツモ符
    pointTypes.push(PointTypes.TSUMO);
  }
  if (concealed && !tsumo) {
    // 門前加符
    pointTypes.push(PointTypes.CONCEALED_RON);
  }
  return pointTypes;
}

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

function calculateHandStatistics(hand: Hand, situation: WinningSituation): HandStatistics {
  const hand14: Tile[] = sorted([
    hand.winningTile,
    ...hand.handTiles,
    ...hand.openMelds.flatMap(meld => meld.getTruncatedTiles())
  ]);
  const hand18: Tile[] = sorted([
    hand.winningTile,
    ...hand.handTiles,
    ...hand.openMelds.flatMap(meld => meld.getSortedTiles())
  ]);
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
  for (const tile of hand14) {
    if (tile === Tiles.DW) dragonWhiteCount++;
    if (tile === Tiles.DG) dragonGreenCount++;
    if (tile === Tiles.DR) dragonRedCount++;
    if (isDragon(tile)) dragonCount++;
    if (isWind(tile)) windCount++;
    if (equalsIgnoreRed(tile, roundWindTile)) roundWindCount++;
    if (equalsIgnoreRed(tile, seatWindTile)) seatWindCount++;
    if (equalsIgnoreRed(tile, hand.winningTile)) winningTileCount++;
    if (isTerminal(tile)) terminalCount++;
    if (isHonor(tile)) honorCount++;
    if (isOrphan(tile)) orphanCount++;
    if (tile === Tiles.S2 || tile === Tiles.S3 || tile === Tiles.S4 ||
        tile === Tiles.S6 || tile === Tiles.S8 || tile === Tiles.DG) greenTileCount++;
  }
  const largestDuplicationCount = _.max(Object.values(_.groupBy(hand14, t => TileInfo[t].tileNumber)).map(t => t.length)) || 0;
  const tileDistinctCount = _.uniqBy(hand18, t => TileInfo[t].tileNumber).length;
  const suitTypeCount = _.uniqBy(hand18.filter(t => !isHonor(t)), t => TileInfo[t].tileType).length;
  let upperPrisedTileCount = 0;
  for (const indicator of situation.upperIndicators) {
    const prisedTile = getIndicatedTile(indicator);
    upperPrisedTileCount += hand18.filter(tile => equalsIgnoreRed(tile, prisedTile)).length;
  }
  let lowerPrisedTileCount = 0;
  if (situation.isReady()) {
    for (const indicator of situation.lowerIndicators) {
      const prisedTile = getIndicatedTile(indicator);
      lowerPrisedTileCount += hand18.filter(tile => equalsIgnoreRed(tile, prisedTile)).length;
    }
  }
  const redPrisedTileCount = hand18.filter(tile => isPrisedRed(tile)).length;
  const quadCount = hand18.length - 14;
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

const SEVEN_PAIRS: HandType = {
  name: '七対子',
  isLimit: false,
  doubles: 2,
  limitType: LimitTypes.EMPTY
};

const RIVER_LIMIT: HandType = {
  name: '流し満貫',
  isLimit: true,
  doubles: 0,
  limitType: LimitTypes.LIMIT
};

const EIGHT_CONSECUTIVE_WIN: HandType = {
  name: '八連荘',
  isLimit: true,
  doubles: 0,
  limitType: LimitTypes.HAND_LIMIT,
};

function getPrisedTileHandTypes(statistics: HandStatistics): HandType[] {
  const handTypes: HandType[] = [];
  if (statistics.upperPrisedTileCount > 0) {
    handTypes.push(createHandTypeOfPrisedTile(statistics.upperPrisedTileCount));
  }
  if (statistics.lowerPrisedTileCount > 0) {
    handTypes.push(createHandTypeOfConcealedPrisedTile(statistics.lowerPrisedTileCount));
  }
  if (statistics.redPrisedTileCount > 0) {
    handTypes.push(createHandTypeOfPrisedRedTile(statistics.redPrisedTileCount));
  }
  return handTypes;
}

function createHandTypeOfPrisedTile(count: number): HandType {
  const countString = count === 1 ? "" : count.toString();
  return {
    name: "ドラ" + countString,
    isLimit: false,
    doubles: count,
    limitType: LimitTypes.EMPTY
  };
}

function createHandTypeOfConcealedPrisedTile(count: number): HandType {
  const countString = count === 1 ? "" : count.toString();
  return {
    name: "裏ドラ" + countString,
    isLimit: false,
    doubles: count,
    limitType: LimitTypes.EMPTY
  };
}

function createHandTypeOfPrisedRedTile(count: number): HandType {
  const countString = count === 1 ? "" : count.toString();
  return {
    name: "赤ドラ" + countString,
    isLimit: false,
    doubles: count,
    limitType: LimitTypes.EMPTY
  };
}

interface LimitHandTypeTester extends HandType {
  test: (_statistics: HandStatistics, _situation: WinningSituation) => boolean;
  // 包判定
  getCompleterSide?: (_openMelds: Meld[]) => Side;
}

interface MeldInsensitiveHandTypeTester extends HandType {
  test: (_statistics: HandStatistics, _situation: WinningSituation) => boolean;
}

interface MeldSensitiveHandTypeTester extends HandType {
  test: (_hand: FormattedHand, _statistics: HandStatistics, _situation: WinningSituation) => boolean;
}

const LimitHandTypes: Record<string, LimitHandTypeTester> = {
  // 天和
  BLESSING_OF_HEAVEN: {
    name: '天和',
    isLimit: true,
    doubles: 0,
    limitType: LimitTypes.HAND_LIMIT,
    test: (_, situation) => {
      return situation.isFirstAroundTsumo() && situation.isDealer();
    },
  },
  
  // 地和
  BLESSING_OF_EARTH: {
    name: '地和',
    isLimit: true,
    doubles: 0,
    limitType: LimitTypes.HAND_LIMIT,
    test: (_, situation) => {
      return situation.isFirstAroundTsumo() && !situation.isDealer();
    }
  },
  
  // 国士無双
  THIRTEEN_ORPHANS: {
    name: '国士無双',
    isLimit: true,
    doubles: 0,
    limitType: LimitTypes.HAND_LIMIT,
    test: (statistics, _) => {
      return statistics.callCount === 0 && statistics.tileDistinctCount === 13 &&
             statistics.orphanCount === 14 && statistics.winningTileCount === 1;
    }
  },
  
  // 国士無双十三面待ち
  THIRTEEN_ORPHANS_13_WAIT: {
    name: '国士無双十三面',
    isLimit: true,
    doubles: 0,
    limitType: LimitTypes.DOUBLE_HAND_LIMIT,
    test: (statistics, _) => {
      return statistics.callCount === 0 && statistics.tileDistinctCount === 13 &&
             statistics.orphanCount === 14 && statistics.winningTileCount === 2;
    }
  },
  
  // 九蓮宝燈
  NINE_GATES: {
    name: '九蓮宝燈',
    isLimit: true,
    doubles: 0,
    limitType: LimitTypes.HAND_LIMIT,
    test: (statistics, _) => {
      return statistics.callCount === 0 && statistics.quadCount === 0 &&
             statistics.suitTypeCount === 1 && statistics.tileDistinctCount === 9 &&
             statistics.honorCount === 0 &&
             statistics.terminalCount === (statistics.largestDuplicationCount === 4 ? 7 : 6) &&
             statistics.winningTileCount % 2 === 1;
    }
  },
  
  // 純正九蓮宝燈
  NINE_GATES_9_WAIT: {
    name: '純正九蓮宝燈',
    isLimit: true,
    doubles: 0,
    limitType: LimitTypes.DOUBLE_HAND_LIMIT,
    test: (statistics, _) => {
      return statistics.callCount === 0 && statistics.quadCount === 0 &&
             statistics.suitTypeCount === 1 && statistics.tileDistinctCount === 9 &&
             statistics.honorCount === 0 &&
             statistics.terminalCount === (statistics.largestDuplicationCount === 4 ? 7 : 6) &&
             statistics.winningTileCount % 2 === 0;
    }
  },
  
  // 四槓子
  FOUR_QUADS: {
    name: '四槓子',
    isLimit: true,
    doubles: 0,
    limitType: LimitTypes.DOUBLE_HAND_LIMIT,
    test: (statistics, _) => {
      return statistics.quadCount === 4;
    },

    getCompleterSide: (openMelds) => {
      const lastQuad = openMelds[3];
      return lastQuad.isCallQuad() ? lastQuad.side : Sides.SELF;
    }
  },
  
  // 大三元
  BIG_THREE: {
    name: '大三元',
    isLimit: true,
    doubles: 0,
    limitType: LimitTypes.HAND_LIMIT,
    test: (statistics, _) => {
      return statistics.dragonCount === 9;
    },

    getCompleterSide: (openMelds) => {
      const dragonMelds = openMelds.filter(meld => meld.isDragon());
      if (dragonMelds.length === 3) {
        return dragonMelds[2].side;
      }
      return Sides.SELF;
    }
  },
  
  // 小四喜
  SMALL_WIND: {
    name: '小四喜',
    isLimit: true,
    doubles: 0,
    limitType: LimitTypes.HAND_LIMIT,
    test: (statistics, _) => {
      return statistics.windCount === 11;
    }
  },
  
  // 大四喜
  BIG_WIND: {
    name: '大四喜',
    isLimit: true,
    doubles: 0,
    limitType: LimitTypes.DOUBLE_HAND_LIMIT,
    test: (statistics, _) => {
      return statistics.windCount === 12;
    },

    getCompleterSide: (openMelds) => {
      const windMelds = openMelds.filter(meld => meld.isWind());
      if (windMelds.length === 4) {
        return windMelds[3].side;
      }
      return Sides.SELF;
    }
  },
  
  // 字一色
  ALL_HONORS: {
    name: '字一色',
    isLimit: true,
    doubles: 0,
    limitType: LimitTypes.HAND_LIMIT,
    test: (statistics, _) => {
      return statistics.honorCount === 14;
    }
  },
  
  // 清老頭
  ALL_TERMINALS: {
    name: '清老頭',
    isLimit: true,
    doubles: 0,
    limitType: LimitTypes.HAND_LIMIT,
    test: (statistics, _) => {
      return statistics.terminalCount === 14;
    }
  },
  
  // 緑一色
  ALL_GREENS: {
    name: '緑一色',
    isLimit: true,
    doubles: 0,
    limitType: LimitTypes.HAND_LIMIT,
    test: (statistics, _) => {
      return statistics.greenTileCount === 14;
    }
  },
  
  // 四暗刻
  FOUR_CONCEALED_TRIPLES: {
    name: '四暗刻',
    isLimit: true,
    doubles: 0,
    limitType: LimitTypes.HAND_LIMIT,
    test: (statistics, situation) => {
      return statistics.callCount === 0 &&
             statistics.tileDistinctCount === 5 &&
             statistics.largestDuplicationCount === 3 &&
             statistics.winningTileCount === 3 &&
             situation.isTsumo();
    }
  },
  
  // 四暗刻単騎待ち
  FOUR_CONCEALED_TRIPLES_1_WAIT: {
    name: '四暗刻単騎',
    isLimit: true,
    doubles: 0,
    limitType: LimitTypes.DOUBLE_HAND_LIMIT,
    test: (statistics, _) => {
      return statistics.callCount === 0 &&
             statistics.tileDistinctCount === 5 &&
             statistics.largestDuplicationCount === 3 &&
             statistics.winningTileCount === 2;
    }
  }
};

const MeldInsensitiveNormalHandTypes: Record<string, MeldInsensitiveHandTypeTester> = {
  // 立直
  READY: {
    name: '立直',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (_, situation) => {
      return situation.isReady() && !situation.isFirstAroundReady();
    }
  },

  // 両立直（ダブル立直）
  DOUBLE_READY: {
    name: '両立直',
    isLimit: false,
    doubles: 2,
    limitType: LimitTypes.EMPTY,
    test: (_, situation) => {
      return situation.isFirstAroundReady();
    }
  },

  // 一発
  ONE_SHOT: {
    name: '一発',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (_, situation) => {
      return situation.isReadyAroundWin();
    }
  },

  // 門前清自摸和
  ALL_CONCEALED: {
    name: '門前清自摸和',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (statistics, situation) => {
      return statistics.callCount === 0 && situation.isTsumo();
    }
  },

  // 海底摸月
  LAST_TILE_DRAW: {
    name: '海底摸月',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (_, situation) => {
      return situation.isLastTileTsumo();
    }
  },

  // 河底撈魚
  LAST_TILE_GRAB: {
    name: '河底撈魚',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (_, situation) => {
      return situation.isLastTileRon();
    }
  },

  // 嶺上開花
  QUAD_TILE_DRAW: {
    name: '嶺上開花',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (_, situation) => {
      return situation.isQuadTurnTsumo();
    }
  },

  // 槍槓
  QUAD_TILE_GRAB: {
    name: '槍槓',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (_, situation) => {
      return situation.isQuadTileRon();
    }
  },

  // 断么九
  ALL_SIMPLE: {
    name: '断么九',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (statistics, _) => {
      return statistics.orphanCount === 0;
    }
  },

  // 混一色（門前）
  HALF_SINGLE_COLOR: {
    name: '混一色',
    isLimit: false,
    doubles: 3,
    limitType: LimitTypes.EMPTY,
    test: (statistics, _) => {
      return statistics.callCount === 0 &&
             statistics.honorCount > 0 && statistics.suitTypeCount === 1;
    }
  },

  // 混一色（副露）
  CALLED_HALF_SINGLE_COLOR: {
    name: '混一色',
    isLimit: false,
    doubles: 2,
    limitType: LimitTypes.EMPTY,
    test: (statistics, _) => {
      return statistics.callCount > 0 &&
             statistics.honorCount > 0 && statistics.suitTypeCount === 1;
    }
  },

  // 清一色（門前）
  FULL_SINGLE_COLOR: {
    name: '清一色',
    isLimit: false,
    doubles: 6,
    limitType: LimitTypes.EMPTY,
    test: (statistics, _) => {
      return statistics.callCount === 0 &&
             statistics.honorCount === 0 && statistics.suitTypeCount === 1;
    }
  },

  // 清一色（副露）
  CALLED_FULL_SINGLE_COLOR: {
    name: '清一色',
    isLimit: false,
    doubles: 5,
    limitType: LimitTypes.EMPTY,
    test: (statistics, _) => {
      return statistics.callCount > 0 &&
             statistics.honorCount === 0 && statistics.suitTypeCount === 1;
    }
  },

  // 三槓子
  THREE_QUADS: {
    name: '三槓子',
    isLimit: false,
    doubles: 2,
    limitType: LimitTypes.EMPTY,
    test: (statistics, _) => {
      return statistics.quadCount === 3;
    }
  },

  // 小三元
  SMALL_THREE: {
    name: '小三元',
    isLimit: false,
    doubles: 2,
    limitType: LimitTypes.EMPTY,
    test: (statistics, _) => {
      return statistics.dragonCount === 8;
    }
  },

  // 混老頭
  HALF_TERMINALS: {
    name: '混老頭',
    isLimit: false,
    doubles: 2,
    limitType: LimitTypes.EMPTY,
    test: (statistics, _) => {
      return statistics.honorCount > 0 &&
             statistics.orphanCount === 14 &&
             statistics.tileDistinctCount <= 7;
    }
  },

  // 翻牌 白
  DRAGON_WHITE: {
    name: '翻牌 白',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (statistics, _) => {
      return statistics.dragonWhiteCount === 3;
    }
  },

  // 翻牌 發
  DRAGON_GREEN: {
    name: '翻牌 發',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (statistics, _) => {
      return statistics.dragonGreenCount === 3;
    }
  },

  // 翻牌 中
  DRAGON_RED: {
    name: '翻牌 中',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (statistics, _) => {
      return statistics.dragonRedCount === 3;
    }
  },

  // 自風牌
  SEAT_WIND: {
    name: '自風牌',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (statistics, _) => {
      return statistics.seatWindCount === 3;
    }
  },

  // 場風牌
  ROUND_WIND: {
    name: '場風牌',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (statistics, _) => {
      return statistics.roundWindCount === 3;
    }
  }
};

const MeldSensitiveNormalHandTypes: Record<string, MeldSensitiveHandTypeTester> = {
  // 対々和
  ALL_TRIPLES: {
    name: '対々和',
    isLimit: false,
    doubles: 2,
    limitType: LimitTypes.EMPTY,
    test: (hand, _, __) => {
      return hand.melds.every(meld => !meld.isStraight());
    }
  },

  // 三暗刻
  THREE_CONCEALED_TRIPLES: {
    name: '三暗刻',
    isLimit: false,
    doubles: 2,
    limitType: LimitTypes.EMPTY,
    test: (hand, _, __) => {
      return hand.melds.filter(meld => meld.isConcealed() && !meld.isStraight()).length === 3;
    }
  },

  // 平和
  NO_POINTS: {
    name: '平和',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (hand, statistics, situation) => {
      return statistics.callCount === 0 && 
        hand.melds.every(meld => meld.getPoint() === 0) &&
        hand.head.getPoint(situation.roundWind, situation.seatWind) === 0 &&
        hand.wait.getPoint() === 0;
    }
  },

  // 混全帯么九（門前）
  HALF_TERMINAL_SETS: {
    name: '混全帯么九',
    isLimit: false,
    doubles: 2,
    limitType: LimitTypes.EMPTY,
    test: (hand, statistics, _) => {
      return statistics.callCount === 0 &&
        (hand.head.isOrphan() && hand.melds.every(meld => meld.isOrphan())) &&
        (hand.head.isHonor() || hand.melds.some(meld => meld.isHonor())) &&
        hand.melds.some(meld => meld.isStraight());
    }
  },

  // 混全帯么九（副露）
  CALLED_HALF_TERMINAL_SETS: {
    name: '混全帯么九',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (hand, statistics, _) => {
      return statistics.callCount !== 0 &&
        (hand.head.isOrphan() && hand.melds.every(meld => meld.isOrphan())) &&
        (hand.head.isHonor() || hand.melds.some(meld => meld.isHonor())) &&
        hand.melds.some(meld => meld.isStraight());
    }
  },

  // 純全帯么九（門前）
  FULL_TERMINAL_SETS: {
    name: '純全帯么九',
    isLimit: false,
    doubles: 3,
    limitType: LimitTypes.EMPTY,
    test: (hand, statistics, _) => {
      return statistics.callCount === 0 &&
        (hand.head.isTerminal() && hand.melds.every(meld => meld.isTerminal())) &&
        hand.melds.some(meld => meld.isStraight());
    }
  },

  // 純全帯么九（副露）
  CALLED_FULL_TERMINAL_SETS:{
    name: '純全帯么九',
    isLimit: false,
    doubles: 2,
    limitType: LimitTypes.EMPTY,
    test: (hand, statistics, _) => {
      return statistics.callCount !== 0 &&
        (hand.head.isTerminal() && hand.melds.every(meld => meld.isTerminal())) &&
        hand.melds.some(meld => meld.isStraight());
    }
  },

  // 一気通貫（門前）
  FULL_STRAIGHTS: {
    name: '一気通貫',
    isLimit: false,
    doubles: 2,
    limitType: LimitTypes.EMPTY,
    test: (hand, statistics, __) => {
      return statistics.callCount === 0 &&
        combinations(hand.melds, 3).some(melds => {
          const allTiles = melds.flatMap(meld => meld.getSortedTiles());
          return melds.every(meld => meld.isStraight()) &&
                  _.uniqBy(allTiles, t => TileInfo[t].tileType).length === 1 &&
                  _.uniqBy(allTiles, t => TileInfo[t].suitNumber).length === 9;
        });
    }
  },

  // 一気通貫（副露）
  CALLED_FULL_STRAIGHTS: {
    name: '一気通貫',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (hand, statistics, __) => {
      return statistics.callCount !== 0 &&
        combinations(hand.melds, 3).some(melds => {
          const allTiles = melds.flatMap(meld => meld.getSortedTiles());
          return melds.every(meld => meld.isStraight()) &&
                  _.uniqBy(allTiles, t => TileInfo[t].tileType).length === 1 &&
                  _.uniqBy(allTiles, t => TileInfo[t].suitNumber).length === 9;
        });
    }
  },

  // 三色同順（門前）
  THREE_COLOR_STRAIGHTS: {
    name: '三色同順',
    isLimit: false,
    doubles: 2,
    limitType: LimitTypes.EMPTY,
    test: (hand, statistics, __) => {
      return statistics.callCount === 0 &&
        combinations(hand.melds, 3).some(melds => {
          const allTiles = melds.flatMap(meld => meld.getSortedTiles());
          return melds.every(meld => meld.isStraight()) &&
                  _.uniqBy(allTiles, t => TileInfo[t].tileType).length === 3 &&
                  _.uniqBy(allTiles, t => TileInfo[t].suitNumber).length === 3;
        });
    }
  },

  // 三色同順（副露）
  CALLED_THREE_COLOR_STRAIGHTS: {
    name: '三色同順',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (hand, statistics, __) => {
      return statistics.callCount !== 0 &&
        combinations(hand.melds, 3).some(melds => {
          const allTiles = melds.flatMap(meld => meld.getSortedTiles());
          return melds.every(meld => meld.isStraight() && !meld.isHonor()) &&
                  _.uniqBy(allTiles, t => TileInfo[t].tileType).length === 3 &&
                  _.uniqBy(allTiles, t => TileInfo[t].suitNumber).length === 3;
        });
    }
  },

  // 三色同刻
  THREE_COLOR_TRIPLES: {
    name: '三色同刻',
    isLimit: false,
    doubles: 2,
    limitType: LimitTypes.EMPTY,
    test: (hand, statistics, __) => {
      return statistics.callCount !== 0 &&
        combinations(hand.melds, 3).some(melds => {
          const allTiles = melds.flatMap(meld => meld.getSortedTiles());
          return melds.every(meld => !meld.isStraight() && !meld.isHonor()) &&
                  _.uniqBy(allTiles, t => TileInfo[t].tileType).length === 3 &&
                  _.uniqBy(allTiles, t => TileInfo[t].suitNumber).length === 1;
        });
    }
  },

  // 一盃口
  DUAL_STRAIGHTS: {
    name: '一盃口',
    isLimit: false,
    doubles: 1,
    limitType: LimitTypes.EMPTY,
    test: (hand, statistics, __) => {
      const straights = hand.melds.filter(m => m.isStraight());
      return statistics.callCount === 0 &&
        combinations(straights, 2).some(melds => {
          const otherMelds = removeEach(straights, melds);
          return melds[0].equalsIgnoreSizeAndRed(melds[1]) && //二盃口ではない
            !(otherMelds.length === 2 && otherMelds[0].equalsIgnoreSizeAndRed(otherMelds[1]));
        });
    }
  },

  // 二盃口
  DOUBLE_DUAL_STRAIGHTS: {
    name: '二盃口',
    isLimit: false,
    doubles: 3,
    limitType: LimitTypes.EMPTY,
    test: (hand, statistics, __) => {
      const straights = hand.melds.filter(m => m.isStraight());
      return statistics.callCount === 0 && straights.length === 4 &&
        combinations(straights, 2).some(melds => {
          const otherMelds = removeEach(straights, melds);
          return melds[0].equalsIgnoreSizeAndRed(melds[1]) &&
            otherMelds[0].equalsIgnoreSizeAndRed(otherMelds[1]);
        });
    }
  }
};
