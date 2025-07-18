import _ from "lodash";
import type { Side, Tile, Wind } from "../tiles";
import { WIND_VALUES, sideFrom } from "../tiles";

export type TurnAction = 
  {type: "Tsumo"} |
  {type: "NineTiles"} |
  {type: "Kan", tile: Tile, selfQuad: boolean} |
  {type: "Ready", tile: Tile, discardDrawn: boolean } |
  {type: "Discard", tile: Tile, discardDrawn: boolean }

export type CallAction = 
  {type: "Ron"} |
  {type: "Chi", baseTiles: Tile[]} |
  {type: "Pon", baseTiles: Tile[]} |
  {type: "Kan"} |
  {type: "Pass"};

export interface DiscardGuide {
  discardingTile: Tile;
  winnings: { tile: Tile; noScore: boolean; }[];
  disqualified: boolean;
}

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
  selectTurnAction(choices: TurnAction[], guides?: DiscardGuide[]): Promise<TurnAction>;

  /**
   * プレイヤーの鳴き中の行動の実装
   * @param choices 選択肢
   * @return 選択された行動(選択肢のいずれか)
   */
  selectCallAction(choices: CallAction[]): Promise<CallAction>;

  /**
   * 局結果の確認
   * プレイヤーがOKボタンを押すまで待機
   * @return 確認完了の Promise
   */
  acknowledge(): Promise<void>;
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

export interface MeldData {
  tiles: Tile[];
  from: Side;
  added: boolean;
  concealed: boolean;
}

export type CallMeldDeclaration = "pon" | "chi" | "kan";

export type FinishingDeclaration = "tsumo" | "ron" | "nine-orphans";

export type GameEvent = 
  | HandStatusUpdated
  | HandUpdated
  | DiceRolled
  | IndicatorRevealed
  | SeatUpdated
  | TileDrawn
  | TileDistributed
  | QuadTileAdded
  | ConcealedQuadAdded
  | TileDiscarded
  | CallMeldAdded
  | RoundStarted
  | RoundFinished
  | GameFinished;

/**
 * 手牌の状況が更新された時のイベント
 * 手牌の持ち主にのみ通知される
 * @param winningTiles 和了可能な牌のリスト
 * @param disqualified フリテンかどうか
 */
interface HandStatusUpdated {
  type: "hand-status-updated";
  winningTiles: Tile[];
  disqualified: boolean;
}

/**
 * 手牌が更新された時のイベント
 * 手牌の持ち主にのみ通知される
 * @param handTiles 手牌
 * @param drawnTile ツモ牌(optional)
 */
interface HandUpdated {
  type: "hand-updated";
  handTiles: Tile[];
  drawnTile?: Tile;
}

/**
 * サイコロが振られた時のイベント
 * @param dice1 サイコロ1の目
 * @param dice2 サイコロ2の目
 */
interface DiceRolled {
  type: "dice-rolled";
  dice1: number;
  dice2: number;
}

/**
 * 山の位置を表すインターフェース
 * @param side 山のどの側か
 * @param row 中央から見て左から何列目か
 * @param level 上段は0、下段は1
 */
export interface RelativeWallIndex {
  side: Side;
  row: number;
  level: number;
}

export interface WallIndex {
  wind: Wind;
  row: number;
  level: number;
}

/**
 * ドラ表示牌がめくられた時のイベント
 * 2枚同時にめくられた場合は2回イベントが発生する
 * @param indicator ドラ表示牌
 * @param wallIndex ドラ表示牌の山の位置
 */
interface IndicatorRevealed {
  type: "indicator-revealed";
  indicator: Tile;
  wallIndex: RelativeWallIndex;
}

/**
 * 座席情報が更新された時のイベント
 * 局開始時のほかに、立直成立時に通知されます。
 * @param seats 座席情報のリスト
 */
interface SeatUpdated {
  type: "seat-updated";
  seats: SeatStatus[];
}

/**
 * 座席の状態
 * @param side 座席の相対方向
 * @param seatWind 座席の自風
 * @param name プレイヤー名
 * @param score 点数
 * @param rank 順位
 * @param ready 立直済みかどうか
 */
export interface SeatStatus {
  side: Side;
  seatWind: Wind;
  name: string;
  score: number;
  rank: number;
  ready: boolean;
}

export type AbsoluteSeatStatus = Omit<SeatStatus, "side">;

/**
 * 牌ツモ時(配牌、槓ツモを含む)のイベント
 * 牌の内容は、手牌の更新イベントで別途通知される
 * @param side ツモ者の相対方向
 * @param wallIndex ツモ牌の山の位置
 * @param drawableTileCount 残りツモ可能な牌の枚数
 */
interface TileDrawn {
  type: "tile-drawn";
  side: Side;
  wallIndex: RelativeWallIndex;
  drawableTileCount: number;
}

/**
 * 配牌時のイベント
 * @param side 配牌を受け取るプレイヤーの相対方向
 * @param size 配牌の枚数
 * @param wallIndices 配牌の山の位置
 * @param drawableTileCount 残りツモ可能な牌の枚数
 */
interface TileDistributed {
  type: "tile-distributed";
  side: Side;
  size: number;
  wallIndices: RelativeWallIndex[];
  drawableTileCount: number;
}

/**
 * 加槓が発生した時のイベント
 * @param side 加槓宣言者の相対方向
 * @param meldIndex 加槓された面子の番目
 * @param addedTile 追加された牌
 */
interface QuadTileAdded {
  type: "quad-tile-added";
  side: Side;
  meldIndex: number;
  addedTile: Tile;
}

/**
 * 暗槓が発生した時のイベント
 * @param side 暗槓宣言者の相対方向
 * @param quadTiles 暗槓構成牌
 */
interface ConcealedQuadAdded {
  type: "concealed-quad-added";
  side: Side;
  quadTiles: Tile[];
}

/**
 * 打牌された時のイベント
 * @param side 打牌者の相対方向
 * @param discardedTile 打牌された牌
 * @param readyDeclared 立直が宣言されたかどうか
 * @param readyTilt 立直宣言牌として牌を倒すかどうか
 */
interface TileDiscarded {
  type: "tile-discarded";
  side: Side;
  discardedTile: Tile;
  readyDeclared: boolean;
  readyTilt: boolean;
}

/**
 * 副露によって面子が追加された時のイベント
 * @param side 副露者の相対方向
 * @param declaration 副露の種類(ポン、チー、カン)
 * @param meldTiles 副露によって追加された面子の牌
 * @param from 副露元
 */
interface CallMeldAdded {
  type: "call-meld-added";
  side: Side;
  declaration: CallMeldDeclaration;
  meldTiles: Tile[];
  from: Side;
}

/**
 * 局が開始された時のイベント
 * @param roundWind 場風
 * @param roundCount 局数
 * @param continueCount 本場数
 * @param depositCount 供託数
 * @param last オーラスかどうか
 */
interface RoundStarted {
  type: "round-started";
  roundWind: Wind;
  roundCount: number;
  continueCount: number;
  depositCount: number;
  last: boolean;
}

/**
 * 役の情報
 * @param name 役の名前
 * @param doubles 翻数。役満の場合は省略される
 */
export interface HandTypeRow {
  name: string;
  doubles?: number;
}

/**
 * 和了結果
 * @param wind 和了者の自風
 * @param handTiles 和了者の手牌
 * @param winningTile 和了牌
 * @param openMelds 面子構
 * @param upperIndicators ドラ表示牌
 * @param lowerIndicators 裏ドラ表示牌(参照されない場合は空配列)
 * @param handTypes 役のリスト
 * @param scoreExpression 点数表現
 * @param tsumo ツモ和了かどうか
 */
export interface WinningResult {
  wind: Wind;
  handTiles: Tile[];
  winningTile: Tile;
  openMelds: MeldData[];
  upperIndicators: Tile[];
  lowerIndicators: Tile[];
  handTypes: HandTypeRow[];
  scoreExpression: string;
  tsumo: boolean;
}

/**
 * 流し満貫結果
 * @param side 流し満貫和了者の相対方向
 * @param wind 流し満貫和了者の自風
 * @param name 役の表示名
 * @param scoreExpression 点数表現
 * @param handTiles 手牌
 * @param upperIndicators ドラ表示牌
 */
export interface RiverWinningResult {
  wind: Wind;
  name: string;
  scoreExpression: string;
  handTiles: Tile[];
  upperIndicators: Tile[];
}

/**
 * 支払い結果
 * @param side 対象者の相対方向
 * @param wind 対象者の自風
 * @param name プレイヤー名
 * @param scoreBefore 更新前の点数
 * @param scoreAfter 更新後の点数
 * @param scoreApplied 変動した点数(支払う場合は負の数)
 * @param rankBefore 更新前の順位
 * @param rankAfter 更新後の順位
 */
export interface PaymentResult {
  side: Side;
  wind: Wind;
  name: string;
  scoreBefore: number;
  scoreAfter: number;
  scoreApplied: number;
  rankBefore: number;
  rankAfter: number;
}

export type AbsolutePaymentResult = Omit<PaymentResult, "side">;

export interface RevealedHand {
  side: Side;
  wind: Wind;
  handTiles: Tile[];
  drawnTile?: Tile;
  winningTiles?: Tile[];
}

export type AbsoluteRevealedHand = Omit<RevealedHand, "side">;

export type FinishType = 
  "tsumo" | "ron" | "river-winning" | "exhauted" | "nine-orphans" |
  "four-quads" | "four-winds" | "four-players-ready" | "three-players-ron" ;

/**
 * 局が終了したときのイベント
 * @param finishType 終了の種類
 * @param revealedHands 倒された手牌のリスト(ツモ、ロン、九種九牌、荒牌平局)
 * @param winningResults 和了結果のリスト(ツモ、ロン)
 * @param riverWinningResults 流し満貫結果のリスト(流し満貫)
 * @param paymentResults 支払い結果のリスト(ツモ、ロン、流し満貫、荒牌平局)
 */
export interface RoundFinished {
  type: "round-finished";
  finishType: FinishType;
  revealedHands?: RevealedHand[];
  winningResults?: WinningResult[];
  riverWinningResults?: RiverWinningResult[];
  paymentResults?: PaymentResult[];
}

interface GameFinished {
  type: "game-finished";
  gameResults: GameResult[];
}

export interface GameResult {
  rank: number;
  name: string;
  score: number;
  resultPoint: number;
}

export abstract class GameEventNotifier {
  abstract playerAt(wind: Wind): GameObserver;

  notifyHandStatusUpdated(wind: Wind, winningTiles: Tile[], disqualified: boolean) {
    this.playerAt(wind).notify({
      type: "hand-status-updated",
      winningTiles,
      disqualified
    });
  }

  notifyHandUpdated(wind: Wind, handTiles: Tile[], drawnTile?: Tile) {
    this.playerAt(wind).notify({
      type: "hand-updated",
      handTiles,
      drawnTile,
    });
  }

  notifyDiceRolled(dice1: number, dice2: number) {
    for (const eachWind of WIND_VALUES) {
      this.playerAt(eachWind).notify({
        type: "dice-rolled",
        dice1,
        dice2
      });
    }
  }

  notifyIndicatorRevealed(indicator: Tile, wallIndex: WallIndex) {
    for (const eachWind of WIND_VALUES) {
      this.playerAt(eachWind).notify({
        type: "indicator-revealed",
        indicator,
        wallIndex: { 
          side: sideFrom(wallIndex.wind, eachWind),
          row: wallIndex.row,
          level: wallIndex.level
        }
      });
    }
  }

  notifySeatUpdated(seats: AbsoluteSeatStatus[]) {
    for (const eachWind of WIND_VALUES) {
      this.playerAt(eachWind).notify({
        type: "seat-updated",
        seats: seats.map(seat => ({
          side: sideFrom(seat.seatWind, eachWind),
          seatWind: seat.seatWind,
          name: seat.name,
          score: seat.score,
          rank: seat.rank,
          ready: seat.ready
        }))
      });
    }
  }

  notifyTileDrawn(wind: Wind, wallIndex: WallIndex, drawableTileCount: number) {
    for (const eachWind of WIND_VALUES) {
      this.playerAt(eachWind).notify({
        type: "tile-drawn",
        side: sideFrom(wind, eachWind),
        wallIndex: {
          side: sideFrom(wallIndex.wind, eachWind),
          row: wallIndex.row,
          level: wallIndex.level
        },
        drawableTileCount
      });
    }
  }

  notifyTileDistributed(wind: Wind, size: number, wallIndices: WallIndex[], drawableTileCount: number) {
    for (const eachWind of WIND_VALUES) {
      this.playerAt(eachWind).notify({
        type: "tile-distributed",
        side: sideFrom(wind, eachWind),
        size,
        wallIndices: wallIndices.map(wallIndex => ({
          side: sideFrom(wallIndex.wind, eachWind),
          row: wallIndex.row,
          level: wallIndex.level
        })),
        drawableTileCount
      });
    }
  }

  notifyQuadTileAdded(wind: Wind, meldIndex: number, addedTile: Tile) {
    for (const eachWind of WIND_VALUES) {
      this.playerAt(eachWind).notify({
        type: "quad-tile-added",
        side: sideFrom(wind, eachWind),
        meldIndex,
        addedTile
      });
    }
  }

  notifyConcealedQuadAdded(wind: Wind, quadTiles: Tile[]) {
    for (const eachWind of WIND_VALUES) {
      this.playerAt(eachWind).notify({
        type: "concealed-quad-added",
        side: sideFrom(wind, eachWind),
        quadTiles
      });
    }
  }

  notifyTileDiscarded(wind: Wind, discardedTile: Tile, readyDeclared: boolean, readyTilt: boolean) {
    for (const eachWind of WIND_VALUES) {
      this.playerAt(eachWind).notify({
        type: "tile-discarded",
        side: sideFrom(wind, eachWind),
        discardedTile,
        readyDeclared,
        readyTilt
      });
    }
  }

  notifyCallMeldAdded(wind: Wind, declaration: CallMeldDeclaration, meldTiles: Tile[], from: Wind) {
    for (const eachWind of WIND_VALUES) {
      this.playerAt(eachWind).notify({
        type: "call-meld-added",
        side: sideFrom(wind, eachWind),
        declaration,
        meldTiles,
        from: sideFrom(from, wind)
      });
    }
  }

  notifyRoundStarted(roundWind: Wind, roundCount: number, continueCount: number, depositCount: number, last: boolean) {
    for (const eachWind of WIND_VALUES) {
      this.playerAt(eachWind).notify({
        type: "round-started",
        roundWind,
        roundCount,
        continueCount,
        depositCount,
        last
      });
    }
  }

  notifyRon(winningResults: WinningResult[], paymentResults: AbsolutePaymentResult[], revealHands: AbsoluteRevealedHand[]) {
    this.notifyRoundFinished("ron", revealHands, winningResults, undefined, paymentResults);
  }

  notifyTsumo(winningResult: WinningResult, paymentResults: AbsolutePaymentResult[], revealedHand: AbsoluteRevealedHand) {
    this.notifyRoundFinished("tsumo", [revealedHand], [winningResult], undefined, paymentResults);
  }

  notifyExhaustiveDraw(revealedHands: AbsoluteRevealedHand[], payments: AbsolutePaymentResult[]) {
    this.notifyRoundFinished("exhauted", revealedHands, undefined, undefined, payments);
  }

  notifyRiverWinning(results: RiverWinningResult[], payments: AbsolutePaymentResult[]) {
    this.notifyRoundFinished("river-winning", undefined, undefined, results, payments);
  }

  notifyAbortiveDraw(drawType: "four-quads" | "four-winds" | "four-players-ready" | "three-players-ron") {
    this.notifyRoundFinished(drawType);
  }

  notifyNineOrphansDraw(wind: Wind, handTiles: Tile[], drawnTile: Tile) {
    this.notifyRoundFinished("nine-orphans", [
     {wind: wind, handTiles, drawnTile, winningTiles: [drawnTile] } 
    ])
  }

  private notifyRoundFinished(
    finishType: FinishType,
    revealedHands?: AbsoluteRevealedHand[],
    winningResults?: WinningResult[],
    riverWinningResults?: RiverWinningResult[],
    paymentResults?: AbsolutePaymentResult[]
  ) {
    for (const eachWind of WIND_VALUES) {
      this.playerAt(eachWind).notify({
        type: "round-finished",
        finishType,
        revealedHands: revealedHands?.map(revealedHand => ({
          side: sideFrom(revealedHand.wind, eachWind),
          wind: revealedHand.wind,
          handTiles: revealedHand.handTiles,
          drawnTile: revealedHand.drawnTile,
          winningTiles: revealedHand.winningTiles
        })),
        winningResults: winningResults?.map(result => ({
          wind: result.wind,
          handTiles: result.handTiles,
          winningTile: result.winningTile,
          openMelds: result.openMelds,
          upperIndicators: result.upperIndicators,
          lowerIndicators: result.lowerIndicators,
          handTypes: result.handTypes,
          scoreExpression: result.scoreExpression,
          tsumo: result.tsumo
        })),
        riverWinningResults: riverWinningResults?.map(result => ({
          wind: result.wind,
          name: result.name,
          scoreExpression: result.scoreExpression,
          handTiles: result.handTiles,
          upperIndicators: result.upperIndicators
        })),
        paymentResults: paymentResults?.map(paymentResult => ({
          side: sideFrom(paymentResult.wind, eachWind),
          wind: paymentResult.wind,
          name: paymentResult.name,
          scoreBefore: paymentResult.scoreBefore,
          scoreAfter: paymentResult.scoreAfter,
          scoreApplied: paymentResult.scoreApplied,
          rankBefore: paymentResult.rankBefore,
          rankAfter: paymentResult.rankAfter
        }))
      });
    }
  }
}

// アクションソート用の定義順序
const TURN_ACTION_ORDER = ['Tsumo', 'NineTiles', 'AddQuad', 'SelfQuad', 'Ready', 'Discard'] as const;
const CALL_ACTION_ORDER = ['Ron', 'Chi', 'Pon', 'Kan', 'Pass'] as const;

/**
 * TurnActionをevent.tsの定義順序でソートする
 */
export function sortTurnActions(actions: TurnAction[]): TurnAction[] {
  return [...actions].sort((a, b) => {
    const indexA = TURN_ACTION_ORDER.indexOf(a.type as any);
    const indexB = TURN_ACTION_ORDER.indexOf(b.type as any);
    return indexA - indexB;
  });
}

/**
 * CallActionをevent.tsの定義順序でソートする
 */
export function sortCallActions(actions: CallAction[]): CallAction[] {
  return [...actions].sort((a, b) => {
    const indexA = CALL_ACTION_ORDER.indexOf(a.type as any);
    const indexB = CALL_ACTION_ORDER.indexOf(b.type as any);
    return indexA - indexB;
  });
}

/**
 * アクションがTurnActionかどうかを判定する
 */
export function isTurnAction(action: any): action is TurnAction {
  if (!action || typeof action !== 'object' || typeof action.type !== 'string') {
    return false;
  }

  const type = action.type;
  
  switch (type) {
    case 'Tsumo':
    case 'NineTiles':
      // パラメータなし
      return true;
    case 'Kan':
      // tile: Tile, selfQuad: boolean が必要
      return action.tile != null && typeof action.selfQuad === 'boolean';
    case 'Ready':
    case 'Discard':
      // tile: Tile, discardDrawn: boolean が必要
      return action.tile != null && typeof action.discardDrawn === 'boolean';
    default:
      return false;
  }
}

/**
 * アクションがCallActionかどうかを判定する
 */
export function isCallAction(action: any): action is CallAction {
  if (!action || typeof action !== 'object' || typeof action.type !== 'string') {
    return false;
  }

  const type = action.type;
  
  switch (type) {
    case 'Ron':
    case 'Kan':
    case 'Pass':
      // パラメータなし
      return true;
    case 'Chi':
    case 'Pon':
      // baseTiles: Tile[] が必要
      return Array.isArray(action.baseTiles);
    default:
      return false;
  }
}
