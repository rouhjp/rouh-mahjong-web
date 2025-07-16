
export type Direction = 'bottom' | 'right' | 'top' | 'left';

const DIRECTIONS: Direction[] = ['bottom', 'right', 'top', 'left'];

export const toDirection = (side: Side): Direction => {
  switch (side) {
    case 'SELF':
      return 'bottom';
    case 'RIGHT':
      return 'right';
    case 'ACROSS':
      return 'top';
    case 'LEFT':
      return 'left';
    default:
      throw new Error(`Unknown side: ${side}`);
  }
}

export const leftOf = (direction: Direction): Direction => {
  return DIRECTIONS[(DIRECTIONS.indexOf(direction) + 1) % 4];
}

export const oppositeOf = (direction: Direction): Direction => {
  return DIRECTIONS[(DIRECTIONS.indexOf(direction) + 2) % 4];
}

export const rightOf = (direction: Direction): Direction => {
  return DIRECTIONS[(DIRECTIONS.indexOf(direction) + 3) % 4];
}

export const isSideways = (direction: Direction): boolean => {
  return direction === 'left' || direction === 'right';
}

export const getAngle = (direction: Direction): number => {
  switch (direction) {
    case 'top':
      return 0;
    case 'bottom':
      return 180;
    case 'left':
      return 270;
    case 'right':
      return 90;
    default:
      return 0;
  }
}

// mahjong-coreから基本型をインポート
import { type Side, type Wind, type Tile, Tiles } from '@mahjong/core';

export type Meld = {
  tiles: Tile[];
  tiltIndex?: number;
  addedTile?: Tile;
}

export const isAddQuad = (meld: Meld): boolean => {
  return !!meld.addedTile;
}

export const isSelfQuad = (meld: Meld): boolean => {
  return meld.tiltIndex === undefined;
}

export const isQuad = (meld: Meld): boolean => {
  return meld.tiles.length + (meld.addedTile ? 1 : 0) === 4;
}

// ユーティリティ関数（独自実装）
const SIDE_VALUES = ["SELF", "RIGHT", "ACROSS", "LEFT"];
const WIND_VALUES = ["EAST", "SOUTH", "WEST", "NORTH"];

export const isSide = (value: string): value is Side => {
  return SIDE_VALUES.includes(value)
}

export const isWind = (value: string): value is Wind => {
  return WIND_VALUES.includes(value)
}

export const isTile = (value: string): value is Tile => {
  return Object.values(Tiles).includes(value as Tile);
}

export type Slot = Tile | "back" | null;

export const getDummyTiles = (size: number): Tile[] => {
  const tiles: Tile[] = [];
  for (let i = 0; i < size; i++) {
    tiles.push(Object.values(Tiles)[Math.floor(Math.random() * Object.values(Tiles).length)]);
  }
  return tiles;
}


