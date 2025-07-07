
export type Direction = 'bottom' | 'right' | 'top' | 'left';

const DIRECTIONS: Direction[] = ['bottom', 'right', 'top', 'left'];

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

const SIDE_VALUES = ["SELF", "RIGHT", "ACROSS", "LEFT"];
const WIND_VALUES = ["EAST", "SOUTH", "WEST", "NORTH"];
export const TILE_VALUES = [
  "M1", "M2", "M3", "M4", "M5", "M5R", "M6", "M7", "M8", "M9",
  "P1", "P2", "P3", "P4", "P5", "P5R", "P6", "P7", "P8", "P9",
  "S1", "S2", "S3", "S4", "S5", "S5R", "S6", "S7", "S8", "S9",
  "WE", "WS", "WW", "WN", "DW", "DG", "DR"
];

export type Side = typeof SIDE_VALUES[number];
export type Wind = typeof WIND_VALUES[number];
export type Tile = typeof TILE_VALUES[number];

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

export const isSide = (value: string): value is Side => {
  return SIDE_VALUES.includes(value)
}

export const isWind = (value: string): value is Wind => {
  return WIND_VALUES.includes(value)
}

export const isTile = (value: string): value is Tile => {
  return TILE_VALUES.includes(value);
}

export type Slot = Tile | "back" | null;

export const getDummyTiles = (size: number): Tile[] => {
  const tiles: Tile[] = [];
  for (let i = 0; i < size; i++) {
    tiles.push(TILE_VALUES[Math.floor(Math.random() * TILE_VALUES.length)]);
  }
  return tiles;
}


