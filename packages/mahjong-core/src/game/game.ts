import _ from "lodash";
import { Wind, Winds, nextWind, WindInfo, WIND_VALUES } from "../tiles";
import { Round } from "./round";
import { Player, ForwardingPlayer } from "./player";
import { GameResult, ActionSelector } from "./event";
import { mediateAcknowledge } from "./mediator";

export class GameSpan {
  private readonly lastRoundWind: Wind;
  private readonly extended: boolean;
  
  constructor(lastRoundWind: Wind, extended: boolean = false) {
    this.lastRoundWind = lastRoundWind;
    this.extended = extended;
  }

  extend(): GameSpan {
    return new GameSpan(nextWind(this.lastRoundWind), true);
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

// 配給原点
const DEFAULT_SCORE = 25000;
// 返し原点
const RETURN_SCORE = 30000;
// ウマ
const RANK_SCORES = [10000, 5000, -5000, -10000];
// オカ
const TOP_SCORE = (RETURN_SCORE - DEFAULT_SCORE)*4;

/**
 * 麻雀ゲーム
 */
export class Game {
  private readonly players: GamePlayer[];
  private span: GameSpan;

  /**
   * 麻雀ゲームを作成します
   * @param players 参加プレイヤー(起家から順に)
   * @param span 
   */
  constructor(players: Player[], span: GameSpan) {
    this.players = [
      new GamePlayer(players[0], Winds.EAST, DEFAULT_SCORE),
      new GamePlayer(players[1], Winds.SOUTH, DEFAULT_SCORE),
      new GamePlayer(players[2], Winds.WEST, DEFAULT_SCORE),
      new GamePlayer(players[3], Winds.NORTH, DEFAULT_SCORE)
    ];
    this.span = span;
  }

  /**
   * 全プレイヤーの ActionSelector を取得
   */
  private getActionSelectors(): Map<Wind, ActionSelector> {
    const selectors = new Map<Wind, ActionSelector>();
    for (let i = 0; i < 4; i++) {
      const wind = WIND_VALUES[i];
      selectors.set(wind, this.players[i].getActionSelector());
    }
    return selectors;
  }

  /**
   * ゲームを開始します。
   */
  async start() {
    const streakByInitialWind = new Map<Wind, number>();
    let roundWind: Wind = Winds.EAST;
    let roundCount = 1;
    let depositCount = 0;
    let continueCount = 0;
    while (true) {
      const last = this.span.isLastRound(roundWind, roundCount);
      const players: GamePlayer[] = [
        this.players[roundCount],
        this.players[(roundCount + 1)%4],
        this.players[(roundCount + 2)%4],
        this.players[(roundCount + 3)%4]
      ];
      const sevenStreak = Object.values(streakByInitialWind.values()).some(streak => streak === 7);
      const params = {
        roundWind: roundWind,
        roundCount: roundCount,
        continueCount: continueCount,
        depositCount: depositCount,
        lastRound: last,
        sevenStreak: sevenStreak
      };
      const round = new Round(players, params);
      const result = await round.start();
      
      // 局終了時に全プレイヤーの acknowledge を待機
      await mediateAcknowledge(this.getActionSelectors());

      let finished = false;
      const dealerAdvantage = (result.type === "Winning" ? result.winnerWinds : result.advantageWinds).includes(Winds.EAST);
      const nonDealerVictory = result.type === "Winning" && !result.winnerWinds.some(w => w === Winds.EAST);
      const winnerInitialWinds = (result.type === "Winning" ? result.winnerWinds : []).map(w => this.players[WindInfo[w].ordinal].getInitialSeatWind());
      for (const wind of _.values(Winds)) {
        // 連荘判定のため streakByInitialWind を更新
        streakByInitialWind.set(wind, winnerInitialWinds.includes(wind) ? (streakByInitialWind.get(wind) || 0) + 1 : 0);
      }
      if (this.span.isExtended() && players.some(p => p.getScore() >= 30000)) {
        // 延長の場合、30000点を超えたプレイヤーがいた場合は終了
        finished = true;
      } else if (players.some(p => p.getScore() < 0)) {
      // 飛びによる終了
        finished = true;
      } else if (last) {
        if (dealerAdvantage) {
          const dealer = this.players[0];
          const top = rankingOf(this.players)[0] === dealer;
          if (top && dealer.getScore() >= 30000) {
            // オーラスの和了止めにより終了
            finished = true;
          }
        } else {
          if (players.some(p => p.getScore() < 30000)) {
            if (this.span.isExtended()) {
              // 延長は1回まで
              finished = true;
            }
            // 南入西入して継続
            this.span = this.span.extend();
          } else {
            // オーラス流局終了
            finished = true;
          }
        }
      }

      // 場棒積み棒の更新
      continueCount = nonDealerVictory ? 0 : continueCount + 1;
      depositCount = result.type === "Draw" ? result.depositCount : 0;

      // 点数チェック
      if(100000 != players.map(p => p.getScore()).reduce((ac, c) => ac + c, 0) + depositCount * 1000) {
        console.log(players.map(p => p.getScore()));
        console.log("deposits: " + depositCount * 1000);
        throw new Error("点数の合計に誤差があります。");
      }

      if (finished) {
        // ゲーム終了
        break;
      }

      if (!dealerAdvantage) {
        // 親流れ
        roundWind = roundCount === 4 ? nextWind(roundWind) : roundWind;
        roundCount = roundCount === 4 ? 1 : roundCount + 1;
      }
    }
    // 流局で終了した場合、トップのプレイヤーに場棒を加算
    const topPlayer = rankingOf(this.players)[0];
    topPlayer.applyScore(depositCount * 1000);

    // 成績を計算
    const gameResults = getResult(this.players);
    this.players.forEach(player => player.notify({ type: "game-finished", gameResults }))

    // 成績チェック(小数点の精度があるため10倍して計算)
    if (gameResults.map(r => r.resultPoint * 10).reduce((ac, c) => ac + c, 0) != 0) {
      console.log(JSON.stringify(gameResults));
      throw new Error("成績の合計に誤差があります。");
    }
  }

  getDefaultScore(): number {
    return DEFAULT_SCORE;
  }
}

/**
 * ゲームの結果データを作成します。
 * @param players ゲームプレイヤー
 * @returns 結果
 */
export function getResult(players: GamePlayer[]): GameResult[] {
  return rankingOf(players).map((player, index) => {
    const rank = index + 1;
    const score = player.getScore();
    // ウマ
    const rankScore = RANK_SCORES[index];
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
export class GamePlayer extends ForwardingPlayer implements Rankable {
  private readonly initialSeatWind: Wind;
  private score: number;

  constructor(player: Player, initialSeatWind: Wind, defaultScore: number = 25000) {
    super(player);
    this.initialSeatWind = initialSeatWind;
    this.score = defaultScore;
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

  getSeatOrdinal(): number {
    return WindInfo[this.initialSeatWind].ordinal;
  }

  getActionSelector(): ActionSelector {
    return this;
  }
}

export interface Rankable {
  getScore(): number;
  getSeatOrdinal(): number;
}

export function rankingOf<T extends Rankable>(players: T[]): T[] {
  return [...players].sort((a, b) => {
    const scoreA = a.getScore();
    const scoreB = b.getScore();
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }
    // 同点の場合は最初の席順
    return a.getSeatOrdinal() - b.getSeatOrdinal();
  });
}

