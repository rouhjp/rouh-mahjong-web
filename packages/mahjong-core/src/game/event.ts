import _ from "lodash";
import { Side, Sides, Tile, Wind, Winds } from "../tiles";

export enum Declaration {
  CHI = "チー",
  PON = "ポン", 
  KAN = "カン",
  RON = "ロン",
  TSUMO = "ツモ",
  NINE_TILES = "九種九牌",
  READY = "リーチ"
}

export enum DrawType {
  EXHAUSTED = "流局", //荒牌平局
  NINE_TILES = "九種九牌",
  FOUR_QUADS = "四槓散了",
  FOUR_WINDS = "四風連打",
  ALL_READY = "四家立直",
  ALL_RON = "三家和",
}

export type TurnAction = 
  {type: "Tsumo"} |
  {type: "NineTiles"} |
  {type: "AddQuad", tile: Tile} |
  {type: "SelfQuad", tile: Tile} |
  {type: "Discard", tile: Tile, discardDrawn: boolean, ready: boolean}

export type CallAction = 
  {type: "Ron"} |
  {type: "Chi", baseTiles: Tile[]} |
  {type: "Pon", baseTiles: Tile[]} |
  {type: "Kan"} |
  {type: "Pass"};

/**
 * プレイヤーの行動を実装するためのインターフェース
 * ボットであればロジックを実装し、
 * ユーザであればクライアント上での操作を実装します。
 */
export interface ActionSelector {

  /**
   * プレイヤーのターン中の行動の実装
   * @param choices 選択肢
   * @return 選択された行動(選択肢のいずれか)
   */
  selectTurnAction(choices: TurnAction[]): Promise<TurnAction>;

  /**
   * プレイヤーの鳴き中の行動の実装
   * @param choices 選択肢
   * @return 選択された行動(選択肢のいずれか)
   */
  selectCallAction(choices: CallAction[]): Promise<CallAction>;
}

/**
 * ゲームの状態変化を通知するためのインターフェース
 */
export interface GameObserver {

  /**
   * イベントが発生したことを通知します。
   * @param event イベント
   */
  notify(event: GameEvent): void;
}

export type GameEvent = 
  SeatUpdatedEvent |
  HandUpdatedEvent |
  OtherHandUpdatedEvent |
  HandRevealedEvent |
  RiverTileAddedEvent |
  RiverTileTakenEvent |
  MeldAddedEvent |
  MeldTileAddedEvent |
  WallTileTakenEvent |
  WallTileRevealedEvent |
  ReadyStickAddedEvent |
  DeclaredEvent |
  HandStatusUpdatedEvent |
  DiceRolledEvent |
  RoundStartedEvent |
  RoundFinishedInDrawEvent |
  RoundFinishedInWinningEvent |
  RoundFinishedInRiverWinningEvent |
  ScoreChangedEvent |
  GameFinishedEvent;

export interface SeatInfo {
  seatWind: Wind;
  name: string;
  score: number;
  rank: number;
}

export interface ScoreInfo {
  seatWind: Wind;
  scoreBefore: number;
  scoreApplied: number;
  scoreAfter: number;
  rankBefore: number;
  rankAfter: number;
}

export interface GameResultInfo {
  name: string;
  rank: number;
  score: number;
  resultPoint: number;
}

interface SeatUpdatedEvent {
  type: "SeatUpdated";
  seats: Map<Side, SeatInfo>;
}

interface HandUpdatedEvent {
  type: "HandUpdated";
  handTiles: Tile[];
  drawnTile?: Tile;
}

interface OtherHandUpdatedEvent {
  type: "OtherHandUpdated";
  side: Side;
  size: number;
  hasDrawnTile: boolean;
}

interface HandRevealedEvent {
  type: "HandRevealed";
  side: Side;
  handTiles: Tile[];
  drawnTile?: Tile;
}

interface RiverTileAddedEvent {
  type: "RiverTileAdded";
  side: Side;
  tile: Tile;
  tilt?: boolean;
}

interface RiverTileTakenEvent {
  type: "RiverTileTaken";
  side: Side;
}

interface MeldAddedEvent {
  type: "MeldAdded";
  side: Side;
  tiles: Tile[];
  from: Side;
}

interface MeldTileAddedEvent {
  type: "MeldTileAdded";
  side: Side;
  meldIndex: number;
  tile: Tile;
}

interface WallTileTakenEvent {
  type: "WallTileTaken";
  side: Side;
  rowIndex: number;
  levelIndex: number;
}

interface WallTileRevealedEvent {
  type: "WallTileRevealed";
  side: Side;
  rowIndex: number;
  tile: Tile;
}

interface ReadyStickAddedEvent {
  type: "ReadyStickAdded";
  side: Side;
}

interface DeclaredEvent {
  type: "Declared";
  side: Side;
  declaration: Declaration;
}

interface HandStatusUpdatedEvent {
  type: "HandStatusUpdated";
  side: Side;
  disqualified: boolean;
}

interface DiceRolledEvent {
  type: "DiceRolled";
  side: Side;
  dice1: number;
  dice2: number;
}

interface RoundStartedEvent {
  type: "RoundStarted";
  roundWind: Wind;
  roundCount: number;
  continueCount: number;
  depositCount: number;
  isLastRound: boolean;
}

interface RoundFinishedInDrawEvent {
  type: "RoundFinishedInDraw";
  drawType: DrawType;
}

interface RoundFinishedInWinningEvent {
  type: "RoundFinishedInWinning";
  handTiles: Tile[];
  winningTile: Tile;
  openMeldTiles: Tile[][];
  upperIndicators: Tile[];
  lowerIndicators: Tile[];
  handTypes: string[];
  handTypeDoubles: number[];
  scoreExpression: string;
}

interface RoundFinishedInRiverWinningEvent {
  type: "RoundFinishedInRiverWinning";
  handType: string;
  scoreExpression: string;
}

interface ScoreChangedEvent {
  type: "ScoreChanged";
  scores: Map<Side, ScoreInfo>;
}

interface GameFinishedEvent {
  type: "GameFinished";
  results: GameResultInfo[];
}

export abstract class GameEventNotifier {
  abstract playerAt(wind: Wind): GameObserver;

  notifySeatUpdated(seats: SeatInfo[]): void {
    for (const eachWind of _.values(Winds)) {
      this.playerAt(eachWind).notify({
        type: "SeatUpdated",
        seats: new Map(seats.map(seat => [seat.seatWind.from(eachWind), seat]))
      });
    }
  }

  notifyHandUpdated(wind: Wind, handTiles: Tile[], drawnTile?: Tile): void {
    for (const eachWind of _.values(Winds)) {
      const side = eachWind.from(wind);
      if (eachWind === wind) {
        // 自家の手牌の更新
        this.playerAt(eachWind).notify({
          type: "HandUpdated",
          handTiles: handTiles,
          drawnTile: drawnTile
        });
      } else {
        // 他家の手牌の更新
        this.playerAt(eachWind).notify({
          type: "OtherHandUpdated",
          side: side,
          size: handTiles.length,
          hasDrawnTile: drawnTile !== undefined
        })
      }
    }
  }

  notifyHandStatusUpdated(wind: Wind, disqualified: boolean): void {
    this.playerAt(wind).notify({
      type: "HandStatusUpdated",
      side: Sides.SELF,
      disqualified: disqualified
    });
  }

  notifyHandRevealed(wind: Wind, handTiles: Tile[], drawnTile?: Tile): void {
    for (const eachWind of _.values(Winds)) {
      const side = eachWind.from(wind);
      this.playerAt(eachWind).notify({
        type: "HandRevealed",
        side: side,
        handTiles: handTiles,
        drawnTile: drawnTile
      });
    }
  }

  notifyWallTileTaken(wind: Wind, rowIndex: number, levelIndex: number): void {
    for (const eachWind of _.values(Winds)) {
      const side = eachWind.from(wind);
      this.playerAt(eachWind).notify({
        type: "WallTileTaken",
        side: side,
        rowIndex: rowIndex,
        levelIndex: levelIndex
      });
    }
  }

  notifyWallTileRevealed(wind: Wind, rowIndex: number, tile: Tile): void {
    for (const eachWind of _.values(Winds)) {
      const side = eachWind.from(wind);
      this.playerAt(eachWind).notify({
        type: "WallTileRevealed",
        side: side,
        rowIndex: rowIndex,
        tile: tile
      });
    }
  }

  notifyRiverTileAdded(wind: Wind, tile: Tile, tilt?: boolean): void {
    for (const eachWind of _.values(Winds)) {
      const side = eachWind.from(wind);
      this.playerAt(eachWind).notify({
        type: "RiverTileAdded",
        side: side,
        tile: tile,
        tilt: tilt
      });
    }
  }

  notifyRiverTileTaken(wind: Wind): void {
    for (const eachWind of _.values(Winds)) {
      const side = eachWind.from(wind);
      this.playerAt(eachWind).notify({
        type: "RiverTileTaken",
        side: side,
      });
    }
  }

  notifyMeldAdded(wind: Wind, tiles: Tile[], from: Wind): void {
    for (const eachWind of _.values(Winds)) {
      const side = eachWind.from(wind);
      this.playerAt(eachWind).notify({
        type: "MeldAdded",
        side: side,
        tiles: tiles,
        from: eachWind.from(from)
      });
    }
  }

  notifyMeldTileAdded(wind: Wind, meldIndex: number, tile: Tile): void {
    for (const eachWind of _.values(Winds)) {
      const side = eachWind.from(wind);
      this.playerAt(eachWind).notify({
        type: "MeldTileAdded",
        side: side,
        meldIndex: meldIndex,
        tile: tile
      });
    }
  }

  notifyReadyStickAdded(wind: Wind): void {
    for (const eachWind of _.values(Winds)) {
      const side = eachWind.from(wind);
      this.playerAt(eachWind).notify({
        type: "ReadyStickAdded",
        side: side,
      });
    }
  }

  notifyDeclared(wind: Wind, declaration: Declaration): void {
    for (const eachWind of _.values(Winds)) {
      const side = eachWind.from(wind);
      this.playerAt(eachWind).notify({
        type: "Declared",
        side: side,
        declaration: declaration
      });
    }
  }

  notifyDiceRolled(dice1: number, dice2: number): void {
    for (const eachWind of _.values(Winds)) {
      this.playerAt(eachWind).notify({
        type: "DiceRolled",
        side: eachWind.from(Winds.EAST),
        dice1: dice1,
        dice2: dice2
      });
    }
  }

  notifyRoundStarted(roundWind: Wind, roundCount: number, continueCount: number, depositCount: number, isLastRound: boolean): void {
    for (const eachWind of _.values(Winds)) {
      this.playerAt(eachWind).notify({
        type: "RoundStarted",
        roundWind: roundWind,
        roundCount: roundCount,
        continueCount: continueCount,
        depositCount: depositCount,
        isLastRound: isLastRound
      });
    }
  }

  notifyRoundFinishedInDraw(drawType: DrawType): void {
    for (const eachWind of _.values(Winds)) {
      this.playerAt(eachWind).notify({
        type: "RoundFinishedInDraw",
        drawType: drawType
      });
    }
  }

  notifyRoundFinishedInWinning(
    handTiles: Tile[],
    winningTile: Tile,
    openMeldTiles: Tile[][],
    upperIndicators: Tile[],
    lowerIndicators: Tile[],
    handTypes: string[],
    handTypeDoubles: number[],
    scoreExpression: string,
  ): void {
    for (const eachWind of _.values(Winds)) {
      this.playerAt(eachWind).notify({
        type: "RoundFinishedInWinning",
        handTiles: handTiles,
        winningTile: winningTile,
        openMeldTiles: openMeldTiles,
        upperIndicators: upperIndicators,
        lowerIndicators: lowerIndicators,
        handTypes: handTypes,
        handTypeDoubles: handTypeDoubles,
        scoreExpression: scoreExpression,
      });
    }
  }

  notifyRoundFinishedInRiverWinning(
    handType: string,
    scoreExpression: string,
  ): void {
    for (const eachWind of _.values(Winds)) {
      this.playerAt(eachWind).notify({
        type: "RoundFinishedInRiverWinning",
        handType: handType,
        scoreExpression: scoreExpression,
      });
    }
  }

  notifyScoreChanged(scores: ScoreInfo[]): void {
    for (const eachWind of _.values(Winds)) {
      this.playerAt(eachWind).notify({
        type: "ScoreChanged",
        scores: new Map(scores.map(score => [score.seatWind.from(eachWind), score]))
      });
    }
  }
}
