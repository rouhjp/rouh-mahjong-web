import _ from "lodash";
import { generateTileSet, Tile, Wind, Winds } from "../tiles";
import { WallIndex } from "./event";

export interface TileAndIndex {
  tile: Tile;
  index: WallIndex;
}

export interface TilesAndIndex {
  tiles: Tile[];
  index: WallIndex;
}

/**
 * 山牌インターフェース
 */
export interface Wall {
  // 牌の取得
  takeFourTiles(): TilesAndIndex;
  takeTile(): TileAndIndex;
  takeQuadTile(): TileAndIndex;
  
  // 牌数情報
  getDrawableTileCount(): number;
  getQuadCount(): number;
  hasDrawableTile(): boolean;
  
  // ドラ表示牌関連
  revealIndicatorImmediately(): TileAndIndex[];
  revealIndicatorsIfPresent(): TileAndIndex[];
  getUpperIndicators(): Tile[];
  getLowerIndicators(): Tile[];
}

/**
 * 配列ベースの山牌実装
 */
export class ArrayWall implements Wall {
  private static readonly QUAD_TILE_OFFSETS = [134, 135, 132, 133];
  private static readonly UPPER_INDICATOR_OFFSETS = [130, 128, 126, 124, 122];
  private static readonly LOWER_INDICATOR_OFFSETS = [131, 129, 127, 125, 123];
  private readonly tiles: Tile[];
  private readonly firstIndex: number;
  private drawCount: number = 0;
  private quadCount: number = 0;
  private revealCount: number = 0;

  constructor(diceSum: number, tiles: Tile[] = generateTileSet()) {
    this.tiles = tiles;
    this.firstIndex = ((3 - diceSum%4)*34 + diceSum*2)%136;
  }

  getDrawableTileCount(): number {
    return 122 - this.drawCount - this.quadCount;
  }

  getQuadCount(): number {
    return this.quadCount;
  }

  hasDrawableTile(): boolean {
    return this.getDrawableTileCount() >= 1;
  }

  takeFourTiles(): TilesAndIndex {
    const results = Array.from({ length: 4 }, () => this.takeTile());
    return { tiles: results.map(r => r.tile), index: results[0].index };
  }

  takeTile(): { tile: Tile, index: WallIndex } {
    if (!this.hasDrawableTile()) {
      throw new Error("No drawable tiles left in the wall.");
    }
    const takeOffset = this.drawCount++;
    const takenTile = this.tileAt(takeOffset);
    const wind = this.windOf(takeOffset);
    const rowIndex = this.rowIndexOf(takeOffset);
    const levelIndex = this.levelIndexOf(takeOffset);
    return { tile: takenTile, index: { wind, row: rowIndex, level: levelIndex } };
  }

  takeQuadTile(): TileAndIndex {
    if (this.quadCount === 4) {
      throw new Error("Can't draw 5th quad tile");
    }
    const takeOffset = ArrayWall.QUAD_TILE_OFFSETS[this.quadCount++];
    const takenTile = this.tileAt(takeOffset);
    const wind = this.windOf(takeOffset);
    const rowIndex = this.rowIndexOf(takeOffset);
    const levelIndex = this.levelIndexOf(takeOffset);
    return { tile: takenTile, index: { wind, row: rowIndex, level: levelIndex } };
  }

  revealIndicatorImmediately(): TileAndIndex[] {
    return [...this.revealIndicatorsIfPresent(), this.revealIndicator()];
  }

  revealIndicatorsIfPresent(): TileAndIndex[] {
    const result: TileAndIndex[] = [];
    while (this.revealCount - 1 < this.quadCount) {
      result.push(this.revealIndicator());
    }
    return result;
  }

  private revealIndicator(): TileAndIndex {
    if (this.revealCount === 5) {
      throw new Error("Can't reveal 6th indicator");
    }
    const revealOffset = ArrayWall.UPPER_INDICATOR_OFFSETS[this.revealCount++];
    const revealedTile = this.tileAt(revealOffset);
    const wind = this.windOf(revealOffset);
    const rowIndex = this.rowIndexOf(revealOffset);
    return { tile: revealedTile, index: { wind, row: rowIndex, level: 0 } };
  }

  getUpperIndicators(): Tile[] {
    return ArrayWall.UPPER_INDICATOR_OFFSETS
      .slice(0, this.revealCount)
      .map(offset => this.tileAt(offset));
  }

  getLowerIndicators(): Tile[] {
    return ArrayWall.LOWER_INDICATOR_OFFSETS
      .slice(0, this.revealCount)
      .map(offset => this.tileAt(offset));
  }

  private tileAt(offset: number): Tile {
    return this.tiles[this.indexOf(offset)];
  }

  private indexOf(offset: number): number {
      return (this.firstIndex + offset)%136;
  }

  private windOf(offset: number): Wind {
      return _.values(Winds)[Math.floor(this.indexOf(offset)/34)];
  }

  private rowIndexOf(offset: number): number {
      return Math.floor((this.indexOf(offset)%34)/2);
  }

  private levelIndexOf(offset: number): number {
      return (this.indexOf(offset) + 1)%2;
  }
}
