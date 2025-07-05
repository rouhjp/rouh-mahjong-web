import _ from "lodash";
import { generateTileSet, Tile, Wind, Winds } from "../tiles";

export interface WallObserver {
  // 牌が取られた時の処理
  tileTaken: (wind: Wind, rowIndex: number, levelIndex: number) => void;

  // ドラ表示牌がめくられた時の処理
  tileRevealed: (wind: Wind, rowIndex: number, tile: Tile) => void;
}

export class Wall {
  private static readonly QUAD_TILE_OFFSETS = [134, 135, 132, 133];
  private static readonly UPPER_INDICATOR_OFFSETS = [130, 128, 126, 124, 122];
  private static readonly LOWER_INDICATOR_OFFSETS = [131, 129, 127, 125, 123];
  private readonly observers: WallObserver[] = [];
  private readonly tiles: Tile[] = generateTileSet();
  private readonly firstIndex: number;
  private drawCount: number = 0;
  private quadCount: number = 0;
  private revealCount: number = 0;

  constructor(diceSum: number, tiles: Tile[] = generateTileSet()) {
    this.tiles = tiles;
    this.firstIndex = ((3 - diceSum%4)*34 + diceSum*2)%136;
  }

  setObserver(observer: WallObserver) {
    this.observers.push(observer);
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

  takeFourTiles(): Tile[] {
    return Array.from({ length: 4 }, () => this.takeTile());
  }

  takeTile(): Tile {
    if (!this.hasDrawableTile()) {
      throw new Error("No drawable tiles left in the wall.");
    }
    const takeOffset = this.drawCount++;
    const takenTile = this.tileAt(takeOffset);
    const wind = this.windOf(takeOffset);
    const rowIndex = this.rowIndexOf(takeOffset);
    const levelIndex = this.levelIndexOf(takeOffset);
    this.observers.forEach(o => o.tileTaken(wind, rowIndex, levelIndex));
    return takenTile;
  }

  takeQuadTile(): Tile {
    if (this.quadCount === 4) {
      throw new Error("Can't draw 5th quad tile");
    }
    const takeOffset = Wall.QUAD_TILE_OFFSETS[this.quadCount++];
    const takenTile = this.tileAt(takeOffset);
    const wind = this.windOf(takeOffset);
    const rowIndex = this.rowIndexOf(takeOffset);
    const levelIndex = this.levelIndexOf(takeOffset);
    this.observers.forEach(o => o.tileTaken(wind, rowIndex, levelIndex));
    return takenTile;
  }

  revealIndicatorImmediately(): void {
    if (this.revealCount === 5) {
      throw new Error("Can't reveal 6th indicator");
    }
    const revealOffset = Wall.UPPER_INDICATOR_OFFSETS[this.revealCount++];
    const revealedTile = this.tileAt(revealOffset);
    const wind = this.windOf(revealOffset);
    const rowIndex = this.rowIndexOf(revealOffset);
    this.observers.forEach(o => o.tileRevealed(wind, rowIndex, revealedTile));
  }

  revealIndicatorsIfPresent(): void {
    while (this.revealCount - 1 < this.quadCount) {
      this.revealIndicatorImmediately();
    }
  }

  getUpperIndicators(): Tile[] {
    return Wall.UPPER_INDICATOR_OFFSETS
      .slice(0, this.revealCount)
      .map(offset => this.tileAt(offset));
  }

  getLowerIndicators(): Tile[] {
    return Wall.LOWER_INDICATOR_OFFSETS
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
