// 待ちパターン関連の型定義
import { PointType, PointTypes } from './point';

/**
 * 待ちクラス
 */
export class Wait {
  readonly name: string;

  private static values: Record<string, Wait> = {};
  static setValues(values: Record<string, Wait>): void {
    this.values = values;
  }

  constructor(name: string) {
    this.name = name;
  }

  /**
   * 待ちに対応する符の種類を取得します
   * @returns 符の種類
   */
  getPointType(): PointType {
    switch (this) {
      case Wait.values.DOUBLE_SIDE_STRAIGHT:
        return PointTypes.DOUBLE_SIDE_STRAIGHT_WAIT;
      case Wait.values.SINGLE_SIDE_STRAIGHT:
        return PointTypes.SINGLE_SIDE_STRAIGHT_WAIT;
      case Wait.values.MIDDLE_STRAIGHT:
        return PointTypes.MIDDLE_STRAIGHT_WAIT;
      case Wait.values.EITHER_HEAD:
        return PointTypes.EITHER_HEAD_WAIT;
      case Wait.values.SINGLE_HEAD:
        return PointTypes.SINGLE_HEAD_WAIT;
      default:
        throw new Error(`Unknown wait type: ${this.name}`);
    }
  }

  /**
   * 待ちに対応する符の点数を取得します
   * @returns 符の点数
   */
  getPoint(): number {
    return this.getPointType().points;
  }
}

// 待ちの定義
export const Waits = {
  DOUBLE_SIDE_STRAIGHT: new Wait('両面待ち'),
  SINGLE_SIDE_STRAIGHT: new Wait('辺張待ち'),
  MIDDLE_STRAIGHT: new Wait('嵌張待ち'),
  EITHER_HEAD: new Wait('双碰待ち'),
  SINGLE_HEAD: new Wait('単騎待ち')
} as const;

Wait.setValues(Waits);
