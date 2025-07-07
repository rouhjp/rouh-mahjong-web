import { Direction, isAddQuad, isQuad, isSelfQuad, isSideways, leftOf, Meld, rightOf } from "../type";
import { TILE_DEPTH, TILE_HEIGHT, TILE_WIDTH } from "./constants";

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
  const width = isSideways(dir) ? TILE_HEIGHT : TILE_WIDTH;
  const height = (isSideways(dir) ? TILE_WIDTH : TILE_HEIGHT) + TILE_DEPTH;
  return new Pointer(CENTER)
    .move(dir, 75 + row * 30)
    .move(rightOf(dir), 50)
    .move(leftOf(dir), col * 20 + (onTilt ? 5 : 0) + (afterTilt ? 10 : 0))
    .getLeftTop(width, height);
}

/**
 * 山牌の座標を取得します。
 * @param dir 山の場所(自家付近の山であれば bottom)
 * @param index 左から上段・下段と数えた時に何番目か
 * @returns 牌の座標
 */
export const getWallTilePoint = (dir: Direction, index: number): Point => {
  const col = Math.floor(index / 2);
  const floor = index % 2;
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

