import type { Tile, Wind } from "../tiles";
import { Sides, Winds, WindInfo, nextWind, sideFrom, windOf, getOtherWinds, WIND_VALUES } from "../tiles";
import { Wall, ArrayWall } from "./wall";
import { GamePlayer, Rankable, rankingOf } from "./game";
import { ForwardingPlayer } from "./player";
import { calculate, createAddQuad, createCallQuad, createCallStraight, createCallTriple, createSelfQuad, Hand, HandScore, hasScore, isNineTiles, isThirteenOrphansComplated, Meld, readyQuadTilesOf, readyTilesOf, removeEach, riverLimitHandScoreOf, selectableQuadBasesOf, selectableStraightBasesOf, selectableTripleBasesOf, waitingTilesOf, WinningOption, WinningSituation, winningTilesOf } from "../scoring";
import { isWind, equalsIgnoreRed, compareTiles, isOrphan } from "../tiles";
import { AbortiveDrawType, AbsoluteHandReadyResult, AbsolutePaymentResult, AbsoluteSeatStatus, ActionSelector, CallAction, GameEventNotifier, GameObserver, RiverWinningResult, TurnAction, WinningResult, sortCallActions, sortTurnActions } from "./event";
import { mediateCallActions, SignedCallAction } from "./mediator";
import _ from "lodash";

/**
 * 局の結果
 */
export type RoundResult = 
 { type: "Winning", winnerWinds: Wind[] } |
 { type: "Draw", advantageWinds: Wind[], depositCount: number };

type TurnState = "DRAW_TURN" | "QUAD_TURN" | "CALL_TURN";

abstract class RoundAccessor extends GameEventNotifier{
  abstract getRoundWind(): Wind;
  abstract isLastTurn(): boolean;
  abstract isLastAround(): boolean;
  abstract isFirstAround(): boolean;
  abstract fourQuadsExist(): boolean;
  abstract isSevenConcequtiveWinning(wind: Wind): boolean;
  abstract getUpperIndicators(): Tile[];
  abstract getLowerIndicators(): Tile[];
  abstract getSeats(): AbsoluteSeatStatus[];
}

interface RoundParams {
  roundWind: Wind;
  roundCount: number;
  continueCount: number;
  depositCount: number;
  lastRound: boolean;
  sevenStreak: boolean;
}

/**
 * 麻雀の局
 */
export class Round extends RoundAccessor {
  private readonly roundWind: Wind;
  private readonly roundCount: number;
  private readonly continueCount: number;
  private readonly depositCount: number;
  private readonly lastRound: boolean;
  private readonly sevenStreak: boolean = false;
  private readonly players: Map<Wind, RoundPlayer>;
  private readonly wallGenerator: (dice1: number, dice2: number) => Wall;
  private wall: Wall | null = null;
  private turnWind: Wind = Winds.EAST;
  private turnState: TurnState = "DRAW_TURN";
  private firstAround: boolean = true;
  private firstAroundDiscards: Tile[] = [];
  private quadPlayerWinds: Wind[] = [];
  private totalReadyCount: number = 0;

  constructor(
    players: GamePlayer[],
    params: RoundParams,
    wallGenerator: (dice1: number, dice2: number) => Wall = (dice1, dice2) => new ArrayWall(dice1 + dice2),
  ) {
    super();
    this.players = new Map<Wind, RoundPlayer>();
    this.players.set(Winds.EAST, new RoundPlayer(Winds.EAST, players[0], this));
    this.players.set(Winds.SOUTH, new RoundPlayer(Winds.SOUTH, players[1], this));
    this.players.set(Winds.WEST, new RoundPlayer(Winds.WEST, players[2], this));
    this.players.set(Winds.NORTH, new RoundPlayer(Winds.NORTH, players[3], this));
    this.roundWind = params.roundWind;
    this.roundCount = params.roundCount;
    this.continueCount = params.continueCount;
    this.depositCount = params.depositCount;
    this.lastRound = params.lastRound;
    this.sevenStreak = params.sevenStreak;
    this.wallGenerator = wallGenerator;
  }

  /**
   * 局を開始する
   * @returns 局の結果
   */
  async start(): Promise<RoundResult> {
    console.log("ROUND STARTED: " + WindInfo[this.roundWind].code + " " + this.roundCount);
    this.notifyRoundStarted(this.roundWind, this.roundCount, this.continueCount, this.depositCount, this.lastRound);
    this.notifySeatUpdated(this.getSeats());
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;

    this.notifyDiceRolled(dice1, dice2);
    this.wall = this.wallGenerator(dice1, dice2);
    this.wall.revealIndicatorImmediately();

    // 配牌
    for (let i = 0; i<3; i++) {
      for (const wind of WIND_VALUES) {
        const distributions = this.wall.takeFourTiles()
        const tiles = distributions.map(t => t.tile);
        const index = distributions.map(t => t.index);
        this.roundPlayerAt(wind).drawDistributedTiles(tiles);
        this.notifyTileDistributed(wind, tiles.length, index, this.wall.getDrawableTileCount());
      }
    }
    for (const wind of WIND_VALUES) {
      const { tile, index } = this.wall.takeTile();
      this.roundPlayerAt(wind).drawDistributedTiles([tile]);
      this.notifyTileDistributed(wind, 1, [index], this.wall.getDrawableTileCount());
    }
    // 摸打
    while(this.wall.hasDrawableTile()) {
      const result = await this.next();
      if (result) {
        console.log("ROUND: SETTLED " + JSON.stringify(result));
        return result;
      }
    }
    // 流局
    return this.exhaustiveDraw();
  }

  private async next(): Promise<RoundResult | null> {
    console.log("NEXT TURN");
    const turnPlayer = this.roundPlayerAt(this.turnWind);
    switch (this.turnState) {
      case "DRAW_TURN": {
        const { tile , index } = this.wall!.takeTile();
        turnPlayer.draw(tile);
        this.notifyTileDrawn(this.turnWind, index, this.wall!.getDrawableTileCount());
        break;
      }
      case "QUAD_TURN": {
        const { tile, index } = this.wall!.takeQuadTile();
        turnPlayer.draw(tile);
        this.notifyTileDrawn(this.turnWind, index, this.wall!.getDrawableTileCount());
        break;

      }
    }
    const turnAction = await turnPlayer.moveTurn(this.turnState);
    console.log("TURN ACTION: " + JSON.stringify(turnAction));
    switch (turnAction.type) {
      case "Tsumo" : {
        return this.tsumo(this.turnState === "QUAD_TURN");
      }
      case "NineTiles": {
        // 九種九牌
        turnPlayer.declareNineOrphans();
        this.notifyRoundFinishedInDraw(AbortiveDrawType.NINE_TILES);
        const depositCount = this.depositCount + this.totalReadyCount;
        return { type: "Draw", advantageWinds: [this.turnWind], depositCount };
      }
      case "Kan": {
        turnPlayer.declareTurnKan(turnAction.tile);
        WIND_VALUES.forEach(wind => this.roundPlayerAt(wind).turnInterrupted(this.turnWind, true));
        if (turnAction.selfQuad) {
          this.wall!.revealIndicatorImmediately();
        }
        const callActions = await this.askTurnQuadCallActions(this.turnWind, turnAction.tile, turnAction.selfQuad);
        if (callActions.length > 0) {
          // ロン
          const winnerWinds = callActions.map(a => a.wind);
          return this.ron(winnerWinds, turnAction.tile, true);
        }
        this.quadPlayerWinds.push(this.turnWind);
        this.turnState = "QUAD_TURN";;
        break;
      }
      case "Ready":
      case "Discard": {
        const discardedTile = turnAction.tile;
        turnPlayer.discard(turnAction.tile, turnAction.type === "Ready");
        const callActions = await this.askDiscardCallActions(turnAction.tile, this.turnWind);
        if (callActions.length === 0) {
          // 副露ナシ
          WIND_VALUES.forEach(wind => this.roundPlayerAt(wind).turnSettled(this.turnWind, turnAction.tile, false));
          this.turnState = "DRAW_TURN";
          this.turnWind = nextWind(this.turnWind);
          if (this.firstAround) {
            this.firstAroundDiscards.push(turnAction.tile);
            if (this.firstAroundDiscards.length === 4) {
              this.firstAround = false;
              if (isWind(this.firstAroundDiscards[0]) && 
                  this.firstAroundDiscards.every(tile => equalsIgnoreRed(tile, this.firstAroundDiscards[0]))) {
                // 四風連打
                this.notifyRoundFinishedInDraw(AbortiveDrawType.FOUR_WINDS);
                const depositCount = this.depositCount + this.totalReadyCount;
                return { type: "Draw", advantageWinds: [], depositCount };
              }
            }
          }
        } else {
          // 副露発生
          if (callActions.some(a => a.action.type === "Ron")) {
            // ロン
            const winnerWinds = callActions.map(a => a.wind);
            return this.ron(winnerWinds, discardedTile, false);
          }
          const { wind: callerWind, action: callAction } = callActions[0];
          const callPlayer = this.roundPlayerAt(callerWind);
          switch (callAction.type) {
            case "Kan": {
              callPlayer.declareKan(discardedTile, this.turnWind);
              this.quadPlayerWinds.push(callerWind);
              break;
            }
            case "Pon": {
              callPlayer.declarePon(callAction.baseTiles, discardedTile, this.turnWind);
              break;
            }
            case "Chi": {
              callPlayer.declareChi(callAction.baseTiles, discardedTile);
              break;
            }
          }
          WIND_VALUES.forEach(wind => this.roundPlayerAt(wind).turnInterrupted(this.turnWind, false));
          WIND_VALUES.forEach(wind => this.roundPlayerAt(wind).turnSettled(this.turnWind, turnAction.tile, true));
          this.turnState = callAction.type === "Kan" ? "QUAD_TURN" : "CALL_TURN";
          this.turnWind = callerWind;
          this.firstAround = false;
        }
        if (turnAction.type === "Ready") {
          if (++this.totalReadyCount === 4) {
            // 四家立直
            this.notifyRoundFinishedInDraw(AbortiveDrawType.ALL_READY);
            const depositCount = this.depositCount + this.totalReadyCount;
            return { type: "Draw", advantageWinds: [], depositCount };
          }
        }
        if (this.quadPlayerWinds.length === 4 && _.uniq(this.quadPlayerWinds).length >= 2) {
          // 四槓散了
          this.notifyRoundFinishedInDraw(AbortiveDrawType.FOUR_QUADS);
          const depositCount = this.depositCount + this.totalReadyCount;
          return { type: "Draw", advantageWinds: [], depositCount };
        }
        this.wall!.revealIndicatorsIfPresent();
      }
    }
    return null;
  }

  private exhaustiveDraw(): RoundResult {
    // 流し満貫
    const riverLimitWinds = WIND_VALUES.filter(w => this.roundPlayerAt(w).isRiverLimit());
    if (riverLimitWinds.length === 3) {
      // 流し満貫・三家和
      this.notifyRoundFinishedInDraw(AbortiveDrawType.ALL_RON);
      const depositCount = this.depositCount + this.totalReadyCount;
      return { type: "Draw", advantageWinds: [], depositCount };
    }
    if (riverLimitWinds.length > 0) {
      const results: RiverWinningResult[] = [];
      const totalPayments = new Map<Wind, number>();
      let secondaryWinning = false;
      for (const wind of riverLimitWinds) {
        const score = riverLimitHandScoreOf(wind);
        const totalDepositCount = secondaryWinning ? 0 : this.depositCount + this.totalReadyCount;
        const continueCount = secondaryWinning ? 0 : this.continueCount;
        const payments = score.getPayments(totalDepositCount, continueCount);
        for (const [w, payment] of payments) {
          totalPayments.set(w, (totalPayments.get(w) || 0) + payment);
        }
        secondaryWinning = true;

        results.push({ wind, name: score.handTypes[0].name, scoreExpression: score.getScoreExpression() });
      }

      this.notifyRiverWinningResult(results);
      this.applyPayments(totalPayments);
      return { type: "Winning", winnerWinds: riverLimitWinds };
    }
    // 荒牌平局
    const handReadyWinds = WIND_VALUES.filter(w => this.roundPlayerAt(w).isHandReady());
    const payments = new Map<Wind, number>();
    if (handReadyWinds.length % 4 !== 0) {
      const winnerScore = 3000 / handReadyWinds.length;
      const loswerScore = - (3000 / (4 - handReadyWinds.length));
      for (const wind of WIND_VALUES) {
        payments.set(wind, handReadyWinds.includes(wind) ? winnerScore : loswerScore);
      }
    }

    this.notifyExhaustiveDrawResult(handReadyWinds.map(w => this.roundPlayerAt(w).getDrawHand()));
    this.applyPayments(payments);
    const depositCount = this.depositCount + this.totalReadyCount;
    return { type: "Draw", advantageWinds: handReadyWinds, depositCount };
  }

  private tsumo(quadTileTsumo: boolean): RoundResult {
    const turnPlayer = this.roundPlayerAt(this.turnWind);
    const { score, result } = turnPlayer.declareTsumo(quadTileTsumo);
    const payments = score.getPayments(this.depositCount + this.totalReadyCount, this.continueCount);

    this.notifyWinningResult([result]);
    this.applyPayments(payments);
    return { type: "Winning", winnerWinds: [this.turnWind] };
  }

  private ron(winnerWinds: Wind[], winningTile: Tile, quadTileRon: boolean): RoundResult {
    if (winnerWinds.length === 3) {
      // 三家和
      this.notifyRoundFinishedInDraw(AbortiveDrawType.ALL_RON);
      return { type: "Draw", advantageWinds: [], depositCount: this.depositCount };
    }
    let secondaryWinning = false;

    const results: WinningResult[] = [];
    const totalPayments = new Map<Wind, number>();
    for (const side of [Sides.RIGHT, Sides.ACROSS, Sides.LEFT]) {
      if (winnerWinds.some(w => w === windOf(side, this.turnWind))) {
        const winningPlayer = this.roundPlayerAt(windOf(side, this.turnWind));
        const { score, result } = winningPlayer.declareRon(winningTile, this.turnWind, quadTileRon);
        results.push(result);

        const totalDepositCount = secondaryWinning ? 0 : this.depositCount + this.totalReadyCount;
        const continueCount = secondaryWinning ? 0 : this.continueCount;
        const payments = score.getPayments(totalDepositCount, continueCount);
        for (const [wind, payment] of payments) {
          totalPayments.set(wind, (totalPayments.get(wind) || 0) + payment);
        } 
        secondaryWinning = true;
      }
    }

    this.notifyWinningResult(results);
    this.applyPayments(totalPayments);
    return { type: "Winning", winnerWinds: winnerWinds };
  }

  private applyPayments(payments: Map<Wind, number>) {
    const oldRanking: RoundPlayer[] = rankingOf<RoundPlayer>(Object.values(this.players.values()));
    const oldScoreMap: Map<Wind, number> = this.getScoreMap();
    // 点数更新
    WIND_VALUES.forEach(w => this.roundPlayerAt(w).applyScore(payments.get(w) || 0));
    const newRanking: RoundPlayer[] = rankingOf<RoundPlayer>(Object.values(this.players.values()));
    const newScoreMap: Map<Wind, number> = this.getScoreMap();
    
    const results: AbsolutePaymentResult[] = [];
    for (const wind of WIND_VALUES) {
      results.push({
        wind: wind,
        scoreBefore: oldScoreMap.get(wind) || 0,
        scoreApplied: payments.get(wind) || 0,
        scoreAfter: newScoreMap.get(wind) || 0,
        rankBefore: oldRanking.findIndex(p => p.getSeatWind() === wind) + 1,
        rankAfter: newRanking.findIndex(p => p.getSeatWind() === wind) + 1,
      })
    }

    this.notifyPaymentResult(results);
  }

  private async askDiscardCallActions(discardedTile: Tile, discarderWind: Wind): Promise<SignedCallAction[]> {
    const players = new Map<Wind, ActionSelector>();
    const choices = new Map<Wind, CallAction[]>();
    for (const wind of getOtherWinds(this.turnWind)) {
      players.set(wind, this.roundPlayerAt(wind));
      choices.set(wind, this.roundPlayerAt(wind).getSelectableCallActionsForDiscard(discardedTile, discarderWind));
    }
    return await mediateCallActions(players, choices);
  }

  private async askTurnQuadCallActions(turnWind: Wind, tile: Tile, selfQuad: boolean): Promise<SignedCallAction[]> {
    const players = new Map<Wind, ActionSelector>();
    const choices = new Map<Wind, CallAction[]>();
    for (const wind of getOtherWinds(turnWind)) {
      players.set(wind, this.roundPlayerAt(wind));
      choices.set(wind, this.roundPlayerAt(wind).getSelectableCallActionsForTurnQuad(tile, selfQuad));
    }
    return await mediateCallActions(players, choices);
  }

  playerAt(wind: Wind): GameObserver {
    return this.players.get(wind)!;
  }

  roundPlayerAt(wind: Wind): RoundPlayer {
    return this.players.get(wind)!;
  }

  private getScoreMap(): Map<Wind, number> {
    const map = new Map<Wind, number>();
    for (const wind of WIND_VALUES) {
      map.set(wind, this.roundPlayerAt(wind).getScore());
    }
    return map;
  }

  private getRanking(): Wind[] {
    return Object.values(this.players.values())
      .sort((a, b) => b.getRank() - a.getRank());
  }

  // RoundAccessor implementation
  isLastTurn(): boolean {
    return !!this.wall && this.wall.getDrawableTileCount() === 0;
  }

  // RoundAccessor implementation
  isLastAround(): boolean {
    return !!this.wall && this.wall.getDrawableTileCount() < 4;
  }

  // RoundAccessor implementation
  isFirstAround(): boolean {
    return this.firstAround;
  }

  // RoundAccessor implementation
  fourQuadsExist(): boolean {
    return !!this.wall && this.wall.getQuadCount() === 4;
  }

  // RoundAccessor implementation
  isSevenConcequtiveWinning(wind: Wind): boolean {
    // 八連荘は必ず東家の七連荘
    return wind === Winds.EAST && this.sevenStreak;
  }

  // RoundAccessor implementation
  getRoundWind(): Wind {
    return this.roundWind;
  }

  // RoundAccessor implementation
  getUpperIndicators(): Tile[] {
    return this.wall?.getUpperIndicators() || [];
  }

  // RoundAccessor implementation
  getLowerIndicators(): Tile[] {
    return this.wall?.getLowerIndicators() || [];
  }

  // RoundAccessor implementation
  getSeats(): AbsoluteSeatStatus[] {
    const ranking = this.getRanking();
    const seats: AbsoluteSeatStatus[] = [];
    for (const wind of WIND_VALUES) {
      const score = this.roundPlayerAt(wind).getScore();
      seats.push({
        seatWind: wind,
        name: this.roundPlayerAt(wind).getName(),
        score: score,
        rank: ranking.indexOf(wind) + 1,
        ready: this.roundPlayerAt(wind).isReady(),
      });
    }
    return seats;
  }
}


/**
 * 局中のプレイヤー
 */
class RoundPlayer extends ForwardingPlayer implements Rankable, ActionSelector, GameObserver {
  private readonly seatWind: Wind;
  private readonly player: GamePlayer;
  private readonly round: RoundAccessor;

  private handTiles: Tile[] = []; // 純手牌
  private openMelds: Meld[] = []; // 副露面子
  private drawnTile: Tile | null = null; // 自摸牌

  private discardedTiles: Tile[] = []; // 河(流し満貫/フリテン判定用)
  private winningTargets: Tile[] = []; // 和了牌(打牌時更新)
  private undiscardableTargets: Tile[] = []; // 食い替え牌(副露時更新)
  private readyQuadTargets: Tile[] = []; // 立直後槓可能牌(立直時更新)

  private firstAroundReady: boolean = false; // ダブル立直
  private readyTilt: boolean = false; // 横向きに打牌(鳴かれたら次巡まで持ち越し)
  private readyPrepared: boolean = false; // 立直宣言後～成立するまで
  private ready: boolean = false; // 立直成立済み
  private readyAround: boolean = false; // 立直後一巡(一発成立要件)

  private riverLock: boolean = false; // フリテン
  private aroundLock: boolean = false; // 同順フリテン
  private everCalled: boolean = false; // 鳴かれたかどうか(流し満願成立要件)

  constructor(seatWind: Wind, player: GamePlayer, round: RoundAccessor) {
    super(player);
    this.seatWind = seatWind;
    this.player = player;
    this.round = round;
  }

  drawDistributedTiles(tiles: Tile[]): void {
    this.handTiles.push(...tiles);
    this.handTiles.sort((a, b) => compareTiles(a, b));
    if (this.handTiles.length === 13) {
      this.winningTargets = winningTilesOf(this.handTiles);

      this.round.notifyHandStatusUpdated(this.seatWind, this.winningTargets, false);
    }

    this.round.notifyHandUpdated(this.seatWind, this.handTiles);
  }

  draw(tile: Tile): void {
    this.requireOutOfTurn();
    this.drawnTile = tile;
    this.aroundLock = false;

    this.round.notifyHandUpdated(this.seatWind, this.handTiles, tile);
  }

  discard(tile: Tile, ready: boolean): void {
    this.requireInTurn();
    const handChanged = this.drawnTile ? equalsIgnoreRed(this.drawnTile, tile) : true;
    if (this.drawnTile) {
      this.handTiles = [...this.handTiles, this.drawnTile];
      this.drawnTile = null;
    }
    this.handTiles = removeEach(this.handTiles, [tile]);
    this.handTiles.sort((a, b) => compareTiles(a, b));
    if (handChanged) {
      this.winningTargets = winningTilesOf(this.handTiles);
      this.riverLock = this.winningTargets.some(tile => this.discardedTiles.some(t => equalsIgnoreRed(tile, t)));

      this.round.notifyHandStatusUpdated(this.seatWind, this.winningTargets, this.riverLock);
    }
    this.discardedTiles.push(tile);
    this.undiscardableTargets = [];
    if (ready) {
      this.readyPrepared = true;
      this.readyTilt = true;
    }

    this.round.notifyHandUpdated(this.seatWind, this.handTiles);
    this.round.notifyTileDiscarded(this.seatWind, tile, ready, this.readyTilt);
  }

  turnInterrupted(turnWind: Wind, turnQuad: boolean): void {
    this.readyAround = false;
    if (!turnQuad && turnWind === this.seatWind) {
      this.everCalled = true;
    }
  }

  turnSettled(discarderWind: Wind, discardedTile: Tile, called: boolean): void {
    if (discarderWind === this.seatWind) {
      this.readyAround = false;
      if (this.readyTilt && !called) {
        this.readyTilt = false;
      }
      if (this.readyPrepared) {
        this.player.applyScore(-1000);
        this.readyPrepared = false;
        this.ready = true;
        this.readyAround = true;
        if (this.round.isFirstAround()) {
          this.firstAroundReady = true;
        }
        this.readyQuadTargets = readyQuadTilesOf(this.handTiles);

        this.round.notifySeatUpdated(this.round.getSeats());
      }
    } else {
      if (this.winningTargets.some(t => equalsIgnoreRed(t, discardedTile))) {
        this.aroundLock = true;

        this.round.notifyHandStatusUpdated(this.seatWind, this.winningTargets, true);
      }
    }
  }

  declareChi(baseTiles: Tile[], calledTile: Tile) {
    this.requireOutOfTurn();
    const turnWind = windOf(Sides.LEFT, this.seatWind);
    const meld = createCallStraight(baseTiles, calledTile);
    this.openMelds.push(meld);
    this.handTiles = removeEach(this.handTiles, baseTiles);
    this.undiscardableTargets = waitingTilesOf(baseTiles);

    this.round.notifyHandUpdated(this.seatWind, this.handTiles);
    this.round.notifyCallMeldAdded(this.seatWind, "chi", meld.getFormedTiles(), turnWind);
  }

  declarePon(baseTiles: Tile[], calledTile: Tile, turnWind: Wind): void {
    this.requireOutOfTurn();
    const meld = createCallTriple(baseTiles, calledTile, sideFrom(turnWind, this.seatWind));
    this.openMelds.push(meld);
    this.handTiles = removeEach(this.handTiles, baseTiles);
    this.undiscardableTargets = waitingTilesOf(baseTiles);

    this.round.notifyHandUpdated(this.seatWind, this.handTiles);
    this.round.notifyCallMeldAdded(this.seatWind, "pon", meld.getFormedTiles(), turnWind);
  }

  declareKan(calledTile: Tile, turnWind: Wind) {
    this.requireOutOfTurn();
    const baseTiles = this.handTiles.filter(t => equalsIgnoreRed(t, calledTile));
    const meld = createCallQuad(baseTiles, calledTile, sideFrom(turnWind, this.seatWind));
    this.openMelds.push(meld);
    this.handTiles = removeEach(this.handTiles, baseTiles);

    this.round.notifyHandUpdated(this.seatWind, this.handTiles);
    this.round.notifyCallMeldAdded(this.seatWind, "kan", meld.getFormedTiles(), turnWind);
  }

  declareTurnKan(tile: Tile) {
    this.requireInDrawTurn();
    this.handTiles = [...this.handTiles, this.drawnTile!];
    this.drawnTile = null;
    const quadTiles = this.handTiles.filter(t => equalsIgnoreRed(t, tile));
    if (quadTiles.length === 4) {
      // 暗槓
      this.handTiles = removeEach(this.handTiles, quadTiles);
      this.openMelds.push(createSelfQuad(quadTiles));
      this.winningTargets = winningTilesOf(this.handTiles);

      this.round.notifyHandUpdated(this.seatWind, this.handTiles);
      this.round.notifyConcealedQuadAdded(this.seatWind, quadTiles);
      this.round.notifyHandStatusUpdated(this.seatWind, this.winningTargets, false);
    } else {
      // 加槓
      this.handTiles = removeEach(this.handTiles, [tile]);
      const meldIndex = this.openMelds.findIndex(m => m.isTriple() && equalsIgnoreRed(m.getFirst(), tile));
      this.openMelds[meldIndex] = createAddQuad(this.openMelds[meldIndex], tile);

      this.round.notifyHandUpdated(this.seatWind, this.handTiles);
      this.round.notifyQuadTileAdded(this.seatWind, meldIndex, tile);
    }
  }

  declareNineOrphans() {
    this.requireInDrawTurn();

    this.round.notifyHandRevealed(this.seatWind, "nine-orphans", this.handTiles, this.drawnTile!);
  }

  declareTsumo(quadTurn: boolean): { score: HandScore, result: WinningResult } {
    this.requireInDrawTurn();
    const hand = this.getHand(this.drawnTile!);
    const situation = this.getWinningSituation(this.seatWind, quadTurn, false);
    const score = calculate(hand, situation);

    this.round.notifyHandRevealed(this.seatWind, "tsumo", this.handTiles, this.drawnTile!);
    
    const result: WinningResult = {
      wind: this.seatWind,
      handTiles: this.handTiles,
      winningTile: this.drawnTile!,
      openMeldTiles: this.openMelds.map(meld => meld.getSortedTiles()),
      upperIndicators: this.round.getUpperIndicators(),
      lowerIndicators: this.ready ? this.round.getLowerIndicators() : [],
      handTypes: score.handTypes.map(t => ({ name: t.name, doubles: t.doubles? t.doubles : undefined})),
      scoreExpression: score.getScoreExpression(),
    }
    return { score, result };
  }

  declareRon(calledTile: Tile, supplierWind: Wind, quadTileRon: boolean): { score: HandScore, result: WinningResult } {
    this.requireOutOfTurn();
    const hand = this.getHand(calledTile);
    const situation = this.getWinningSituation(supplierWind, false, quadTileRon);
    const score = calculate(hand, situation);

    const result: WinningResult = {
      wind: this.seatWind,
      handTiles: this.handTiles,
      winningTile: calledTile,
      openMeldTiles: this.openMelds.map(meld => meld.getSortedTiles()),
      upperIndicators: this.round.getUpperIndicators(),
      lowerIndicators: this.ready ? this.round.getLowerIndicators() : [],
      handTypes: score.handTypes.map(t => ({ name: t.name, doubles: t.doubles? t.doubles : undefined})),
      scoreExpression: score.getScoreExpression(),
    };

    return { score, result };
  }

  isRiverLimit(): boolean {
    return !this.everCalled && this.discardedTiles.every(tile => isOrphan(tile));
  }

  isHandReady(): boolean {
    return this.winningTargets.length > 0;
  }

  getDrawHand(): AbsoluteHandReadyResult {
    return {
      wind: this.seatWind,
      handTiles: this.handTiles,
      winningTiles: this.winningTargets,
    }
  }

  isReady(): boolean {
    return this.ready;
  }

  getScore(): number {
    return this.player.getScore();
  }

  applyScore(score: number) {
    this.player.applyScore(score);
  }

  getSeatOrdinal(): number {
    return WindInfo[this.getInitialSeatWind()].ordinal;
  }

  async moveTurn(turnState: TurnState): Promise<TurnAction> {
    const actions = this.getSelectableTurnActions(turnState);
    const action = await this.selectTurnAction(actions);
    console.log("ACTION: " + JSON.stringify(action));
    if (!actions.some(a => _.isEqual(a, action))) {
      throw new Error(`選択されたアクションが選択肢にありません: ${JSON.stringify(action)} / ${JSON.stringify(actions)}`);
    }
    return action;
  }

  getSelectableCallActionsForDiscard(discardedTile: Tile, discarderWind: Wind): CallAction[] {
    const side = sideFrom(discarderWind, this.seatWind);
    const actions: CallAction[] = [{ type: "Pass" }];
    if (this.ready) {
      if (this.winningTargets.some(t => equalsIgnoreRed(t, discardedTile)) && !this.riverLock && !this.aroundLock) {
        actions.push({ type: "Ron" });
      }
      return sortCallActions(actions);
    }
    if (this.winningTargets.some(t => equalsIgnoreRed(t, discardedTile)) && !this.riverLock && !this.aroundLock && 
      hasScore(this.getHand(discardedTile), this.getWinningSituation(this.seatWind, false, false))) {
      actions.push({ type: "Ron" });
    }
    const canCall = !this.round.isLastTurn();
    const canQuad = canCall && !this.round.fourQuadsExist();
    if (canQuad) {
      const kanActions: CallAction[] = selectableQuadBasesOf(this.handTiles, discardedTile)
        .map(baseTiles => ({ type: "Kan", baseTiles }));
      actions.push(...kanActions);
    }
    if (canCall) {
      const ponActions: CallAction[] =  selectableTripleBasesOf(this.handTiles, discardedTile)
        .map(baseTiles => ({ type: "Pon", baseTiles }));
      actions.push(...ponActions);
    }
    if (canCall && side === Sides.LEFT) {
      const chiActions: CallAction[] = selectableStraightBasesOf(this.handTiles, discardedTile)
        .map(baseTiles => ({ type: "Chi", baseTiles }));
      actions.push(...chiActions);
    }
    return sortCallActions(actions);
  }

  getSelectableCallActionsForTurnQuad(quadTile: Tile, selfQuad: boolean): CallAction[] {
    this.requireOutOfTurn();
    const actions: CallAction[] = [{ type: "Pass" }];
    // 加槓に対して槍槓ロンができるか検査
    if (!selfQuad && this.winningTargets.some(t => equalsIgnoreRed(t, quadTile))) {
      actions.push({ type: "Ron" });
    }
    // 国士無双の場合は暗槓に対してもロン可能
    if (selfQuad && isThirteenOrphansComplated(this.handTiles, quadTile)) {
      actions.push({ type: "Ron" });
    }
    return sortCallActions(actions);
  }

  private getSelectableTurnActions(turnState: TurnState): TurnAction[] {
    this.requireInTurn();
    if (turnState === "CALL_TURN") {
      const actions: TurnAction[] = _.uniq(this.handTiles)
        .filter(tile => !this.undiscardableTargets.some(t => equalsIgnoreRed(t, tile)))
        .map(tile => ({ type: "Discard", tile, discardDrawn: false }));
      return sortTurnActions(actions);
    }
    this.requireInDrawTurn();
    const actions: TurnAction[] = [];
    const canQuad = !this.round.isLastTurn() && !this.round.fourQuadsExist();
    actions.push({ type: "Discard" , tile: this.drawnTile!, discardDrawn: true });
    if (this.ready) {
      if (this.winningTargets.some(t => equalsIgnoreRed(t, this.drawnTile!))) {
        actions.push({ type: "Tsumo" });
      }
      if (canQuad && this.readyQuadTargets.some(t => equalsIgnoreRed(t, this.drawnTile!))) {
        actions.push({type: "Kan", tile: this.drawnTile!, selfQuad: true})
      }
      return sortTurnActions(actions);
    }
    const discardActions: TurnAction[] = _.uniq(this.handTiles)
      .map(tile => ({ type: "Discard", tile, discardDrawn: false }));
    actions.push(...discardActions);
    if (this.round.isFirstAround() && isNineTiles(this.handTiles, this.drawnTile!)) {
      actions.push({ type: "NineTiles" });
    }
    if (this.winningTargets.some(t => equalsIgnoreRed(t, this.drawnTile!))) {
      if (hasScore(this.getHand(this.drawnTile!), this.getWinningSituation(this.seatWind, turnState === "QUAD_TURN", false))) {
        actions.push({ type: "Tsumo" });
      }
    }
    if (canQuad) {
      const allTiles = [...this.handTiles, this.drawnTile!];
      const addQuadActions: TurnAction[] = _.uniq(allTiles)
        .filter(tile => this.openMelds.some(meld => meld.isTriple() && equalsIgnoreRed(meld.getFirst(), tile)))
        .map(tile => ({ type: "Kan", tile , selfQuad: false }));
      const selfQuadActions: TurnAction[] = _.uniq(allTiles)
        .filter(tile => allTiles.filter(t => equalsIgnoreRed(t, tile)).length === 4)
        .map(tile => ({ type: "Kan", tile, selfQuad: true }));
      actions.push(...addQuadActions, ...selfQuadActions);
    }
    const concealed = this.openMelds.every(meld => meld.isConcealed());
    const canReady = concealed && !this.round.isLastAround() && this.player.getScore() >= 1000;
    if (canReady) {
      for (const tile of readyTilesOf(this.handTiles, this.drawnTile!)) {
        if (tile === this.drawnTile) {
          actions.push({ type: "Ready", tile, discardDrawn: true });
        }
        if (this.handTiles.some(t => _.isEqual(t, tile))) {
          actions.push({ type: "Ready", tile, discardDrawn: false });
        }
      }
    }
    return sortTurnActions(actions);
  }

  private getHand(winningTile: Tile): Hand {
    return {
      handTiles: this.handTiles,
      winningTile,
      openMelds: this.openMelds
    };
  }

  private getWinningSituation(supplierWind: Wind, quadTileTsumo: boolean, quadTileRon: boolean): WinningSituation {
    return new WinningSituation(
      this.round.getRoundWind(),
      this.seatWind,
      sideFrom(supplierWind, this.seatWind),
      this.round.getUpperIndicators(),
      this.round.getLowerIndicators(),
      this.getWinningOptions(quadTileTsumo, quadTileRon)
    );
  }

  private getWinningOptions(quadTileTsumo: boolean, quadTileRon: boolean): WinningOption[] {
    const options: WinningOption[] = [];
    if (this.ready) {
      options.push("READY");
    }
    if (this.firstAroundReady) {
      options.push("FIRST_AROUND_READY");
    }
    if (this.round.isFirstAround()) {
      options.push("FIRST_AROUND_TSUMO");
    }
    if (this.readyAround) {
      options.push("READY_AROUND_WIN");
    }
    if (this.round.isLastTurn() && this.drawnTile) {
      options.push("LAST_TILE_TSUMO");
    }
    if (this.round.isLastTurn() && !this.drawnTile) {
      options.push("LAST_TILE_RON");
    }
    if (quadTileTsumo) {
      options.push("QUAD_TILE_TSUMO");
    }
    if (quadTileRon) {
      options.push("QUAD_TILE_RON");
    }
    if (this.round.isSevenConcequtiveWinning(this.seatWind)) {
      options.push("EIGHT_CONSEQUTIVE_WIN");
    }
    return options;
  }

  getSeatWind(): Wind {
    return this.seatWind;
  }

  getInitialSeatWind(): Wind {
    return this.player.getInitialSeatWind();
  }

  private requireInDrawTurn(): void {
    const inDrawTurn = this.drawnTile && this.getTileCount() === 14
    if (!inDrawTurn) {
      throw new Error("Invalid player state");
    }
  }

  private requireInTurn(): void {
    const inTurn = this.getTileCount() === 14;
    if (!inTurn) {
      throw new Error(`Invalid player state: ${this.handTiles} ${this.drawnTile} ${this.openMelds}`);
    }
  }

  private requireOutOfTurn(): void {
    const outOfTurn = !this.drawnTile && this.getTileCount() === 13;
    if (!outOfTurn) {
      throw new Error("Invalid player state");
    }
  }

  private getTileCount(): number {
    return this.handTiles.length + this.openMelds.length * 3 + (this.drawnTile ? 1 : 0);
  }
}
