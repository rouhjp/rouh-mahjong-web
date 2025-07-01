import _ from "lodash";
import { Side, Sides, Wind, Winds } from "../tiles";

export function createHandScoreOfRiverLimit(handType: HandType, limitType: LimitType, winnerWind: Wind): HandScore {
  return new HandScore(0, 0, limitType, [], [handType], winnerWind, Sides.SELF, new Map());
}

export function createHandScoreOfHandLimit(handTypes: HandType[], winnerWind: Wind, supplierSide: Side, completerSides: Map<HandType, Side>): HandScore {
  const multiplier = handTypes.reduce((sum, type) => sum + type.limitType.multiplier, 0);
  const limitType = handLimitTypeOf(multiplier);
  return new HandScore(0, 0, limitType, [], handTypes, winnerWind, supplierSide, completerSides);
}

export function createHandScoreOf(pointTypes: PointType[], handTypes: HandType[], winnerWind: Wind, supplierSide: Side): HandScore {
  const rawPoint = pointTypes.reduce((sum, type) => sum + type.points, 0);
  const point = rawPoint === 25 ? 25 : Math.ceil(rawPoint / 10) * 10; // 七対子25符以外は10の倍数に切り上げ
  const doubles = handTypes.reduce((sum, type) => sum + type.doubles, 0);
  const limitType = limitTypeOf(point, doubles);
  return new HandScore(point, doubles, limitType, pointTypes, handTypes, winnerWind, supplierSide, new Map());
}

export class HandScore {
  readonly point: number;                // 符
  readonly doubles: number;              // 翻数
  readonly limit: LimitType;             // 点数区分
  readonly pointTypes: PointType[];      // 符の詳細リスト
  readonly handTypes: HandType[];        // 役のリスト
  readonly winnerWind: Wind;             // 和了者
  readonly supplierSide: Side;             // 放銃者もしくは責任払い
  readonly completerSides: Map<HandType, Side>;       // 包

  constructor(
    point: number,
    doubles: number,
    limit: LimitType,
    pointTypes: PointType[],
    handTypes: HandType[],
    winnerWind: Wind,
    supplierSide: Side,
    completerSides: Map<HandType, Side>
  ) {
    this.point = point;
    this.doubles = doubles;
    this.limit = limit;
    this.pointTypes = pointTypes;
    this.handTypes = handTypes;
    this.winnerWind = winnerWind;
    this.supplierSide = supplierSide;
    this.completerSides = completerSides;
  }

  /**
   * 役ナシかどうか判定します
   * @returns 判定結果
   */
  isEmpty(): boolean {
    return this.handTypes.length === 0;
  }

  /**
   * 役満かどうか判定します
   * 数え役満は除外します
   * @returns 判定結果
   */
  isHandLimit(): boolean {
    return this.handTypes.some(type => type.isLimit);
  }

  hasLimit(): boolean {
    return this.limit !== LimitTypes.EMPTY;
  }

  getScoreExpression(): string {
    return _.compact([
      this.point > 0 ? `${this.point}符${this.doubles}翻` : null,
      this.hasLimit() ? this.limit.name : null,
      `${this.getScore()}点`
    ]).join(' ');
  }

  /**
   * 基本点を計算して取得します
   * @returns 基本点
   */
  getBaseScore(): number {
    if (this.hasLimit()) {
      return this.limit.baseScore;
    }
    const calculatedBaseScore = this.point * Math.pow(2, this.doubles + 2);
    const limitBaseScore = LimitTypes.LIMIT.baseScore;
    return Math.min(limitBaseScore, calculatedBaseScore);
  }

  /**
   * 点数を計算して取得します
   * @returns 点数
   */
  getScore(): number {
    const baseScore = this.getBaseScore();
    const multiplier = this.winnerWind === Winds.EAST ? 6 : 4;
    return Math.ceil((multiplier * baseScore) / 100) * 100;
  }

  /**
   * 支払いベースの点数を計算して取得します。
   * @returns 支払いベースの点数
   */
  getPaymentScore(): number {
    return this.getPayments(0, 0).get(this.winnerWind) || 0;
  }

  /**
   * 移動する点数を計算し、自風と点数のマップとして返します。
   * 放銃などで支払いがある場合は負の値、和了で受け取りがある場合は正の値が格納されます。
   * @param depositCount 供託(リーチ棒)の数
   * @param streakCount 積み棒の数
   * @param streakScore 積み符の点数(デフォルトは300点)
   * @returns 自風と点数のマップ
   */
  getPayments(depositCount: number, streakCount: number, streakScore = 300): Map<Wind, number> {
    // 包が発生する場合は、発生した役満の点数のみ責任払いとする
    // 複数役満が成立している場合は、役ごとに点数を分割して支払い点数を計算する
    const subScores: { score:number, completerWind: Wind | null }[] = [];
    if (this.isHandLimit()) {
      // 役満の場合
      for (const handType of this.handTypes) {
        const completerWind = this.completerSides.get(handType)?.of(this.winnerWind) || null;
        const multiplier = this.winnerWind === Winds.EAST ? 6 : 4;
        const score = Math.ceil((multiplier * handType.limitType.baseScore) / 100) * 100;
        subScores.push({ score, completerWind });
      }
    } else {
      // 通常役の場合
      subScores.push({ score: this.getScore(), completerWind: null });
    }

    const payments = new Map<Wind, number>([
      [Winds.EAST, 0],
      [Winds.SOUTH, 0],
      [Winds.WEST, 0],
      [Winds.NORTH, 0]
    ]);
    const supplierWind = this.supplierSide === Sides.SELF ? null : this.supplierSide.of(this.winnerWind);
    for (const { score, completerWind } of subScores) {
      if (completerWind) {
        if (supplierWind) {
          // 放銃(ロン or 大明槓責任払いツモ) with 包
          if (supplierWind === completerWind) {
            // (放銃 and 包):他:他 = 100:0:0
            payments.set(supplierWind, (payments.get(supplierWind) || 0) - score);
            payments.set(this.winnerWind, (payments.get(this.winnerWind) || 0) + score);
          } else {
            // 放銃:包:他 = 50:50:0
            const halfScore = Math.ceil(score / 2 / 100) * 100;
            payments.set(supplierWind, (payments.get(supplierWind) || 0) - halfScore);
            payments.set(completerWind, (payments.get(completerWind) || 0) - halfScore);
            payments.set(this.winnerWind, (payments.get(this.winnerWind) || 0) + halfScore * 2);
          }
        } else {
          // ツモ with 包
          // 包:他:他 = 100:0:0
          payments.set(completerWind, (payments.get(completerWind) || 0) - score);
          payments.set(this.winnerWind, (payments.get(this.winnerWind) || 0) + score);
        }
      } else {
        if (supplierWind) {
          // 放銃(ロン or 大明槓責任払いツモ)
          // 放銃:他:他 = 100:0:0
          payments.set(supplierWind, (payments.get(supplierWind) || 0) - score);
          payments.set(this.winnerWind, (payments.get(this.winnerWind) || 0) + score);
        } else {
          // ツモ
          if (this.winnerWind === Winds.EAST) {
            // 子:子:子 = 33:33:33
            const oneThirdScore = Math.ceil(score / 3 / 100) * 100;
            for (const side of Sides.SELF.others()) {
              const wind = side.of(this.winnerWind);
              payments.set(wind, (payments.get(wind) || 0) - oneThirdScore);
              payments.set(this.winnerWind, (payments.get(this.winnerWind) || 0) + oneThirdScore);
            }
          } else {
            // 親:子:子 = 50:25:25
            const halfScore = Math.ceil(score / 2 / 100) * 100;
            const oneFourthScore = Math.ceil(score / 4 / 100) * 100;
            for (const side of Sides.SELF.others()) {
              const wind = side.of(this.winnerWind);
              if (wind === Winds.EAST) {
                payments.set(wind, (payments.get(wind) || 0) - halfScore);
                payments.set(this.winnerWind, (payments.get(this.winnerWind) || 0) + halfScore);
              } else {
                payments.set(wind, (payments.get(wind) || 0) - oneFourthScore);
                payments.set(this.winnerWind, (payments.get(this.winnerWind) || 0) + oneFourthScore);
              }
            }
          }
        }
      }
    }

    // 供託を和了者に加算
    const totalDepositScore = depositCount * 1000;
    payments.set(this.winnerWind, (payments.get(this.winnerWind) || 0) + totalDepositScore);

    // 積み棒の支払い
    // いろいろな算出方法があるが、ここでは支払いが発生するすべてのプレイヤーで分割して支払う(100点各自切り上げ)方式とする
    // その他主流の方式は、四槓子包を認めず包重複が発生しないようにし、積み棒の支払い責任は包>放銃者とする方式がある
    const totalStreakScore = streakCount * streakScore;
    const loserWinds = [...payments.entries()].filter(([_, score]) => score < 0).map(([wind, _]) => wind);
    const eachScore = Math.ceil(totalStreakScore / loserWinds.length / 100) * 100;
    for (const loswerWind of loserWinds) {
      payments.set(loswerWind, (payments.get(loswerWind) || 0) - eachScore);
      payments.set(this.winnerWind, (payments.get(this.winnerWind) || 0) + eachScore);
    }

    return payments;
  }

  compareTo(other: HandScore): number {
    const comparingBaseScore = this.getBaseScore() - other.getBaseScore();
    if (comparingBaseScore !== 0) {
      return comparingBaseScore;
    }

    const comparingDoubles = this.doubles - other.doubles;
    if (comparingDoubles !== 0) {
      return comparingDoubles;
    }

    const comparingPoint = this.point - other.point;
    if (comparingPoint !== 0) {
      return comparingPoint;
    }

    return this.handTypes.length - other.handTypes.length;
  }
}

export interface HandType {
  name: string;        // 役の名前
  isLimit: boolean;    // 役満もしくは流し満貫かどうか
  doubles: number;     // 翻数（通常役の場合は1〜、役満の場合は0）
  limitType: LimitType; // 点数区分（役満、ダブル役満、流し満貫の場合に指定、その他はEMPTY）
}

export interface PointType {
  name: string;   // 符の名前
  points: number; // 符の点数
}

export const PointTypes = {
  BASE: {
    name: '副底',
    points: 20
  },
  SEVEN_PAIR_BASE: {
    name: '七対子固定符',
    points: 25
  },
  HEAD_SUIT: {
    name: '雀頭(数牌)',
    points: 0
  },
  HEAD_OTHER_WIND: {
    name: '雀頭(客風牌)',
    points: 0
  },
  HEAD_DRAGON: {
    name: '雀頭(三元牌)',
    points: 2
  },
  HEAD_SEAT_WIND: {
    name: '雀頭(自風牌)',
    points: 2
  },
  HEAD_ROUND_WIND: {
    name: '雀頭(場風牌)',
    points: 2
  },
  DOUBLE_VALUABLE_HEAD: {
    name: '雀頭(連風牌)',
    points: 4
  },
  STRAIGHT: {
    name: '順子',
    points: 0
  },
  TRIPLE: {
    name: '明刻(中張牌)',
    points: 2
  },
  ORPHAN_TRIPLE: {
    name: '明刻(么九牌)',
    points: 4
  },
  CONCEALED_TRIPLE: {
    name: '暗刻(中張牌)',
    points: 4
  },
  ORPHAN_CONCEALED_TRIPLE: {
    name: '暗刻(么九牌)',
    points: 8
  },
  QUAD: {
    name: '明槓(中張牌)',
    points: 8
  },
  ORPHAN_QUAD: {
    name: '明槓(么九牌)',
    points: 16
  },
  CONCEALED_QUAD: {
    name: '暗槓(中張牌)',
    points: 16
  },
  ORPHAN_CONCEALED_QUAD: {
    name: '暗槓(么九牌)',
    points: 32
  },
  DOUBLE_SIDE_STRAIGHT_WAIT: {
    name: '待ち(両面)',
    points: 0
  },
  EITHER_HEAD_WAIT: {
    name: '待ち(双碰)',
    points: 0
  },
  SINGLE_HEAD_WAIT: {
    name: '待ち(単騎)',
    points: 2
  },
  MIDDLE_STRAIGHT_WAIT: {
    name: '待ち(嵌張)',
    points: 2
  },
  SINGLE_SIDE_STRAIGHT_WAIT: {
    name: '待ち(辺張)',
    points: 2
  },
  TSUMO: {
    name: '自摸符',
    points: 2
  },
  CONCEALED_RON: {
    name: '門前加符',
    points: 10
  },
  CALLED_NO_POINT: {
    name: '平和加符',
    points: 10
  }
} as const;

export interface LimitType {
  name: string;         // 点数区分の名前
  baseScore: number;    // 基本点数
  isHandLimit: boolean; // 役満かどうか
  multiplier: number;   // 役満倍数(数え役満は0)
}

export const LimitTypes: Record<string, LimitType> = {
  EMPTY: { 
    name: '', 
    baseScore: 0, 
    isHandLimit: false,
    multiplier: 0
  },
  LIMIT: { 
    name: '満貫', 
    baseScore: 2000, 
    isHandLimit: false,
    multiplier: 0
  },
  ONE_HALF_LIMIT: { 
    name: '跳満', 
    baseScore: 3000, 
    isHandLimit: false,
    multiplier: 0
  },
  DOUBLE_LIMIT: { 
    name: '倍満', 
    baseScore: 4000, 
    isHandLimit: false,
    multiplier: 0
  },
  TRIPLE_LIMIT: { 
    name: '三倍満', 
    baseScore: 6000, 
    isHandLimit: false,
    multiplier: 0
  },
  COUNT_HAND_LIMIT: { 
    name: '役満', 
    baseScore: 8000, 
    isHandLimit: false,
    multiplier: 0
  },
  HAND_LIMIT: { 
    name: '役満', 
    baseScore: 8000, 
    isHandLimit: true,
    multiplier: 1
  },
  DOUBLE_HAND_LIMIT: { 
    name: '二倍役満', 
    baseScore: 16000, 
    isHandLimit: true,
    multiplier: 2
  },
  TRIPLE_HAND_LIMIT: { 
    name: '三倍役満', 
    baseScore: 24000, 
    isHandLimit: true,
    multiplier: 3
  },
  QUADRUPLE_HAND_LIMIT: { 
    name: '四倍役満', 
    baseScore: 32000, 
    isHandLimit: true,
    multiplier: 4
  },
  QUINTUPLE_HAND_LIMIT: { 
    name: '五倍役満', 
    baseScore: 40000, 
    isHandLimit: true,
    multiplier: 5
  },
  SEXTUPLE_HAND_LIMIT: { 
    name: '六倍役満', 
    baseScore: 48000, 
    isHandLimit: true,
    multiplier: 6
  },
  SEPTUPLE_HAND_LIMIT: { 
    name: '七倍役満', 
    baseScore: 56000, 
    isHandLimit: true,
    multiplier: 7
  },
  OCTUPLE_HAND_LIMIT: { 
    name: '八倍役満', 
    baseScore: 64000, 
    isHandLimit: true,
    multiplier: 8
  }
} as const;

// 符と翻数から点数区分を取得する関数
export function limitTypeOf(points: number, doubles: number): LimitType {
  if (doubles >= 13) return LimitTypes.COUNT_HAND_LIMIT;
  if (doubles >= 11) return LimitTypes.TRIPLE_LIMIT;
  if (doubles >= 8) return LimitTypes.DOUBLE_LIMIT;
  if (doubles >= 6) return LimitTypes.ONE_HALF_LIMIT;
  if (doubles === 5) return LimitTypes.LIMIT;
  if (doubles === 4 && points >= 40) return LimitTypes.LIMIT;
  if (doubles >= 3 && points >= 70) return LimitTypes.LIMIT;
  return LimitTypes.EMPTY;
}

// 役満倍数から点数区分を取得する関数
export function handLimitTypeOf(multiplier: number): LimitType {
  switch (multiplier) {
    case 1: return LimitTypes.HAND_LIMIT;
    case 2: return LimitTypes.DOUBLE_HAND_LIMIT;
    case 3: return LimitTypes.TRIPLE_HAND_LIMIT;
    case 4: return LimitTypes.QUADRUPLE_HAND_LIMIT;
    case 5: return LimitTypes.QUINTUPLE_HAND_LIMIT;
    case 6: return LimitTypes.SEXTUPLE_HAND_LIMIT;
    case 7: return LimitTypes.SEPTUPLE_HAND_LIMIT;
    case 8: return LimitTypes.OCTUPLE_HAND_LIMIT;
    default: throw new Error(`Invalid limit multiplier: ${multiplier}`);
  }
}
