import _, { get } from "lodash";
import { Wind, Winds } from "../tiles";
import { ActionSelector, CallAction, GameEvent, GameEventNotifier, GameObserver, GameResultInfo, TurnAction } from "./event";
import { Round } from "./round";

/**
 * プレイヤー処理を実装するためのインターフェース
 */
interface Player extends ActionSelector, GameObserver{

  getName(): string;
}

export abstract class FowardingPlayer implements Player {
  private readonly delegated: Player;

  constructor(delegated: Player) {
    this.delegated = delegated;
  }
  
  notify(event: GameEvent): void {
    this.delegated.notify(event);
  }

  selectTurnAction(choices: TurnAction[]): Promise<TurnAction> {
    return this.delegated.selectTurnAction(choices);
  }

  selectCallAction(choices: CallAction[]): Promise<CallAction> {
    return this.delegated.selectCallAction(choices);
  }

  getName(): string {
    return this.delegated.getName();
  }
}

export class GameSpan {
  private readonly lastRoundWind: Wind;
  private readonly extended: boolean;
  
  constructor(lastRoundWind: Wind, extended: boolean = false) {
    this.lastRoundWind = lastRoundWind;
    this.extended = extended;
  }

  extend(): GameSpan {
    return new GameSpan(this.lastRoundWind.next(), true);
  }

  isLastRound(roundWind: Wind, roundCount: number): boolean {
    return this.lastRoundWind === roundWind && roundCount === 4;
  }

  isExtended(): boolean {
    return this.extended;
  }
}

export const GameSpans = {
  EAST_GAME: new GameSpan(Winds.EAST),
  HALF_GAME: new GameSpan(Winds.SOUTH),
  FULL_GAME: new GameSpan(Winds.NORTH),
}

interface GameAccessor {
  getRanking(): Wind[];
  getDefaultScore(): number;
}

// 配給原点
const DEFAULT_SCORE = 25000;
// 返し原点
const RETURN_SCORE = 30000;
// ウマ
const RANK_SCORES = [10000, 5000, -5000, -10000];
// オカ
const TOP_SCORE = (RETURN_SCORE - DEFAULT_SCORE)*4;

export class Game implements GameAccessor {
  private readonly players: GamePlayer[];
  private span: GameSpan;

  constructor(players: Player[], span: GameSpan) {
    this.players = [
      new GamePlayer(players[0], Winds.EAST, this),
      new GamePlayer(players[1], Winds.SOUTH, this),
      new GamePlayer(players[2], Winds.WEST, this),
      new GamePlayer(players[3], Winds.NORTH, this)
    ];
    this.span = span;
  }

  async start() {
    const streakByInitialWind = new Map<Wind, number>();
    let roundWind = Winds.EAST;
    let roundCount = 1;
    let depositCount = 0;
    let continueCount = 0;
    while (true) {
      const last = this.span.isLastRound(roundWind, roundCount);
      const players: GamePlayer[] = [
        this.players[roundWind.ordinal],
        this.players[(roundWind.ordinal + 1)%4],
        this.players[(roundWind.ordinal + 2)%4],
        this.players[(roundWind.ordinal + 3)%4]
      ];
      const sevenStreak = Object.values(streakByInitialWind.values()).some(streak => streak === 7);
      const round = new Round(players, roundWind, roundCount, continueCount, depositCount, last, sevenStreak);
      const result = await round.start();
      // 連荘判定のため streakByInitialWind を更新
      const winnerInitialWinds = (result.type === "Winning" ? result.winnerWinds : []).map(w => this.players[w.ordinal].getInitialSeatWind());
      for (const wind of _.values(Winds)) {
        streakByInitialWind.set(wind, winnerInitialWinds.includes(wind) ? (streakByInitialWind.get(wind) || 0) + 1 : 0);
      }
      // 延長の場合、30000点を超えたプレイヤーがいた場合は終了
      if (this.span.isExtended()) {
        if (players.some(p => p.getScore() >= 30000)) {
          break;
        }
      }
      // 飛びによる終了
      if (players.some(p => p.getScore() < 0)) {
        break;
      }
      const dealerAdvantage = (result.type === "Winning" ? result.winnerWinds : result.advantageWinds).includes(Winds.EAST);
      const nonDealerVictory = result.type === "Winning" && !result.winnerWinds.some(w => w === Winds.EAST);
      if (last) {
        if (dealerAdvantage) {
          const dealer = this.players[0];
          if (dealer.getRank() === 1 && dealer.getScore() >= 30000) {
            // オーラスの和了止めにより終了
            break;
          }
        } else {
          if (players.some(p => p.getScore() < 30000)) {
            // 南入西入して継続
            this.span = this.span.extend();
          } else {
            // オーラス流局終了
            break;
          }
        }
      }

      if (!dealerAdvantage) {
        // 親流れ
        roundWind = roundCount === 4 ? roundWind.next() : roundWind;
        roundCount = (roundCount + 1)%4;
      }
      // 場棒積み棒の更新
      continueCount = nonDealerVictory ? 0 : continueCount + 1;
      depositCount += result.type === "Draw" ? result.depositCount : 0;

      // 点数チェック
      if(100000 != players.map(p => p.getScore()).reduce((ac, c) => ac + c, 0) + depositCount * 1000) {
        throw new Error("点数の合計に誤差があります。");
      }
    }
    // 流局で終了した場合、トップのプレイヤーに場棒を加算
    const topPlayer = this.players.find(p => p.getRank() === 1)!;
    topPlayer.applyScore(depositCount * 1000);

    // 成績を計算
    const results = getResult(this.players);
    this.players.forEach(player => player.notify({ type: "GameFinished", results }))

    // 点数チェック
    if (results.map(r => r.score).reduce((ac, c) => ac + c, 0) !== 100000) {
      throw new Error("点数の合計に誤差があります。");
    }
    if (results.map(r => r.resultPoint).reduce((ac, c) => ac + c, 0) !== 0) {
      throw new Error("成績の合計に誤差があります。");
    }
  }

  getRanking(): Wind[] {
    const winds = _.values(Winds);
    winds.sort((a, b) => {
      const scoreA = this.players[a.ordinal].getScore();
      const scoreB = this.players[b.ordinal].getScore();
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }
      // 同点の場合は最初の席順
      return a.ordinal - b.ordinal;
    });
    return winds;
  }

  getDefaultScore(): number {
    return DEFAULT_SCORE;
  }
}

export function getResult(players: GamePlayer[]): GameResultInfo[] {
  return [...players].sort((a, b) => a.getRank() - b.getRank()).map(player => {
    const rank = player.getRank();
    const score = player.getScore();
    // ウマ
    const rankScore = RANK_SCORES[rank - 1];
    // オカ
    const topScore = rank === 1 ? TOP_SCORE : 0;
    const gameScore = (score + rankScore + topScore - RETURN_SCORE);
    // 小数点ありで計算
    const resultPoint = gameScore / 1000;
    return {
      name: player.getName(),
      rank: rank,
      score: score,
      resultPoint: resultPoint
    };
  });
}

/**
 * ゲーム中のプレイヤーの状態を管理するクラス
 */
export class GamePlayer extends FowardingPlayer{
  private readonly initialSeatWind: Wind;
  private readonly game: GameAccessor;
  private score: number;

  constructor(player: Player, initialSeatWind: Wind, game: GameAccessor) {
    super(player);
    this.initialSeatWind = initialSeatWind;
    this.game = game;
    this.score = game.getDefaultScore();
  }

  getInitialSeatWind(): Wind {
    return this.initialSeatWind;
  }

  getScore(): number {
    return this.score;
  }

  setScore(score: number): void {
    this.score = score;
  }

  applyScore(points: number): void {
    this.score += points;
  }

  getRank(): number {
    return this.game.getRanking().indexOf(this.initialSeatWind) + 1;
  }
}
