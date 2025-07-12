import { Direction, isAddQuad, isQuad, isSelfQuad, isSideways, leftOf, Meld, rightOf } from "../type";
import { TILE_DEPTH, TILE_HEIGHT, TILE_WIDTH, TABLE_WIDTH, TABLE_HEIGHT, getScaledResultSize, getScaledDrawResultSize, getScaledRiverResultSize, getScaledPaymentResultSize, getScaledRoundInfoSize, getScaledGameResultSize } from "./constants";

export interface Point {
  x: number;
  y: number;
}

const CENTER: Point = { x: 580/2, y: 580/2 };

/**
 * 河の牌の座標を取得します。
 * @param dir 河の場所(自家であれば bottom)
 * @param index 何枚目の牌か
 * @param tiltIndex リーチ宣言牌は何枚目か
 * @returns 座標
 */
export const getRiverTilePoint = (dir: Direction, index: number, tiltIndex = -1): Point => {
  const row = Math.floor(index / 6);
  const col = index % 6;
  const tiltRow = tiltIndex === -1 ? -1 : Math.floor(tiltIndex / 6);
  const onTilt = tiltIndex !== -1 && index === tiltIndex;
  const afterTilt = row === tiltRow && tiltIndex < index;
  const tiltDir = onTilt ? rightOf(dir) : dir;
  const width = isSideways(tiltDir) ? TILE_HEIGHT : TILE_WIDTH;
  const height = (isSideways(tiltDir) ? TILE_WIDTH : TILE_HEIGHT) + TILE_DEPTH;
  return new Pointer(CENTER)
    .move(dir, 75 + row * 30)
    .move(rightOf(dir), 50)
    .move(leftOf(dir), col * 20 + (onTilt ? 5 : 0) + (afterTilt ? 10 : 0))
    .getLeftTop(width, height);
}

/**
 * 山牌の座標を取得します。
 * @param dir 山の場所(自家付近の山であれば bottom)
 * @param col 左から何列目か
 * @param floor 上から何段目か (0: 下段, 1: 上段)
 * @returns 牌の座標
 */
export const getWallTilePoint = (dir: Direction, col: number, floor: number): Point => {
  const width = isSideways(dir) ? TILE_HEIGHT : TILE_WIDTH;
  const height = (isSideways(dir) ? TILE_WIDTH : TILE_HEIGHT) + TILE_DEPTH;
  return new Pointer(CENTER)
    .move(dir, 205)
    .move(rightOf(dir), 160)
    .move(leftOf(dir), col * 20)
    .move("top", floor * 10)
    .getLeftTop(width, height);
}

/**
 * 自家の手牌の座標を取得します。
 * @param index 手牌の何番目か
 * @param isolated ツモ牌として孤立しているか
 * @returns 座標
 */
export const getHandTilePoint = (dir: Direction, index: number, isolated: boolean): Point => {
  const width = isSideways(dir) ? TILE_DEPTH : TILE_WIDTH;
  const height = isSideways(dir) ? (TILE_WIDTH + TILE_HEIGHT) : (TILE_HEIGHT + TILE_DEPTH);
  return new Pointer(CENTER)
    .move(dir, 260)
    .move(rightOf(dir), 220)
    .move(leftOf(dir), index * 20 + (isolated ? 10 : 0))
      .getLeftTop(width, height);
}

export const getMeldOffset = (meldsBefore: Meld[]): number => {
  const gap = TILE_DEPTH;
  return meldsBefore.map(meld => getMeldWidth(meld) + gap).reduce((a, b) => a + b, 0);
}

export const getMeldWidth = (meld: Meld) => {
  if (isSelfQuad(meld)) {
    return TILE_WIDTH * 4;
  }
  if (isAddQuad(meld)) {
    return TILE_WIDTH * 2 + TILE_HEIGHT;
  }
  if (isQuad(meld)) {
    return TILE_WIDTH * 3 + TILE_HEIGHT;
  }
  return TILE_WIDTH * 2 + TILE_HEIGHT;
}

export const getMeldTilePoint = (dir: Direction, meldOffset: number, tileOffset: number, tilt: boolean, shift: boolean): Point => {
  const sideways = isSideways(tilt ? rightOf(dir) : dir);
  const width = sideways ? TILE_HEIGHT : TILE_WIDTH;
  const height = (sideways ? TILE_WIDTH : TILE_HEIGHT) + TILE_DEPTH;
  return new Pointer(CENTER)
    .move(dir, 260 + (tilt ? 5 : 0) + (shift ? -20 : 0))
    .move(leftOf(dir), 230)
    .move(rightOf(dir), tilt ? -5: 0)
    .move(rightOf(dir), meldOffset)
    .move(leftOf(dir), tileOffset)
    .getLeftTop(width, height);
}

export const getWindIndicatorPoint = (dir: Direction): Point => {
  return new Pointer(CENTER)
    .move(dir, 45)
    .move(rightOf(dir), 45)
    .getPoint();
}

class Pointer {
  x: number;
  y: number;

  constructor(p: Point) {
    this.x = p.x;
    this.y = p.y;
  }

  move(direction: Direction, distance: number): Pointer {
    switch (direction) {
      case "top":
        this.y -= distance;
        break;
      case "bottom":
        this.y += distance;
        break;
      case "left":
        this.x -= distance;
        break;
      case "right":
        this.x += distance;
        break;
    }
    return this;
  }

  multiply(weight: number): Pointer{
    this.x *= weight;
    this.y *= weight;
    return this;
  }

  getLeftTop(width: number, height: number): Point {
    return { x: this.x - width / 2, y: this.y - height / 2 };
  }

  getPoint(): Point {
    return { x: this.x, y: this.y };
  }
}

/**
 * 立直棒の座標を取得します。
 * @param facing 立直棒の向き（どのプレイヤーか）
 * @returns 立直棒の座標
 */
export const getReadyStickPoint = (facing: Direction): Point => {
  const distance = 50; // 中央からの距離
  return new Pointer(CENTER)
    .move(facing, distance)
    .getPoint();
};

/**
 * ResultView をテーブルの中心に配置するための座標を取得します。
 * @param scale スケール（デフォルト: 1）
 * @returns ResultView の左上角の座標
 */
export const getResultCenterPoint = (scale: number = 1): Point => {
  const resultSize = getScaledResultSize(scale);
  return {
    x: (TABLE_WIDTH - resultSize.width) / 2,
    y: (TABLE_HEIGHT - resultSize.height) / 2
  };
};

/**
 * DrawView をテーブルの中心に配置するための座標を取得します。
 * @param scale スケール（デフォルト: 1）
 * @returns DrawView の左上角の座標
 */
export const getDrawResultCenterPoint = (scale: number = 1): Point => {
  const drawResultSize = getScaledDrawResultSize(scale);
  return {
    x: (TABLE_WIDTH - drawResultSize.width) / 2,
    y: (TABLE_HEIGHT - drawResultSize.height) / 2
  };
};

/**
 * RiverWinningResultView をテーブルの中心に配置するための座標を取得します。
 * @param scale スケール（デフォルト: 1）
 * @returns RiverWinningResultView の左上角の座標
 */
export const getRiverResultCenterPoint = (scale: number = 1): Point => {
  const riverResultSize = getScaledRiverResultSize(scale);
  return {
    x: (TABLE_WIDTH - riverResultSize.width) / 2,
    y: (TABLE_HEIGHT - riverResultSize.height) / 2
  };
};

/**
 * PaymentResultView をテーブルの中心に配置するための座標を取得します。
 * @param scale スケール（デフォルト: 1）
 * @returns PaymentResultView の左上角の座標
 */
export const getPaymentResultCenterPoint = (scale: number = 1): Point => {
  const paymentResultSize = getScaledPaymentResultSize(scale);
  return {
    x: (TABLE_WIDTH - paymentResultSize.width) / 2,
    y: (TABLE_HEIGHT - paymentResultSize.height) / 2
  };
};

/**
 * RoundInfoView をテーブルの中心に配置するための座標を取得します。
 * @param scale スケール（デフォルト: 1）
 * @returns RoundInfoView の左上角の座標
 */
export const getRoundInfoCenterPoint = (scale: number = 1): Point => {
  const roundInfoSize = getScaledRoundInfoSize(scale);
  return {
    x: (TABLE_WIDTH - roundInfoSize.width) / 2,
    y: (TABLE_HEIGHT - roundInfoSize.height) / 2
  };
};

/**
 * GameResultView をテーブルの中心に配置するための座標を取得します。
 * @param scale スケール（デフォルト: 1）
 * @returns GameResultView の左上角の座標
 */
export const getGameResultCenterPoint = (scale: number = 1): Point => {
  const gameResultSize = getScaledGameResultSize(scale);
  return {
    x: (TABLE_WIDTH - gameResultSize.width) / 2,
    y: (TABLE_HEIGHT - gameResultSize.height) / 2
  };
};
