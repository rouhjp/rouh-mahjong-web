import { describe, it, expect, beforeEach } from 'vitest';
import { Game, GameSpans, GamePlayer } from './game';
import { Player, ForwardingPlayer } from './player';
import type { TurnAction, CallAction, GameEvent } from './event';
import { Winds } from '../tiles';

/**
 * 循環参照問題を検知するためのシンプルなテストプレイヤー
 */
class TestPlayer implements Player {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  getName(): string {
    return this.name;
  }

  async selectTurnAction(choices: TurnAction[]): Promise<TurnAction> {
    if (choices.length === 0) {
      throw new Error('No turn action choices available');
    }
    
    // 優先順位: Pass > Discard > その他
    const passAction = choices.find(choice => (choice as any).type === 'Pass');
    if (passAction) return passAction;
    
    const discardAction = choices.find(choice => (choice as any).type === 'Discard');
    if (discardAction) return discardAction;
    
    // 最初の選択肢を返す
    return choices[0];
  }

  async selectCallAction(choices: CallAction[]): Promise<CallAction> {
    // 常にPassを選ぶ
    const passAction = choices.find(choice => (choice as any).type === 'Pass');
    return passAction || choices[0];
  }

  notify(event: GameEvent): void {
    // テスト用なので何もしない
    if (this.name === 'Player1') {
      if (event.type === "WallTileTaken" || event.type === "OtherHandUpdated") {
        return;
      }
      console.log(`${this.name} received event: ${JSON.stringify(event)}`);
    }
  }
}

describe('Game flow', () => {
  describe('complete game execution', () => {
    it('should start game and complete successfully', async () => {
      const players: Player[] = [
        new TestPlayer('Player1'),
        new TestPlayer('Player2'),
        new TestPlayer('Player3'),
        new TestPlayer('Player4')
      ];

      const game = new Game(players, GameSpans.EAST_GAME);
      
      // ゲームは正常に開始・完了するべき
      await game.start();
    }, 30000);

    it('should handle game events properly during execution', async () => {
      let roundStartedEvents = 0;
      let gameFinishedEvents = 0;

      class EventTrackingPlayer extends TestPlayer {
        notify(event: GameEvent): void {
          super.notify(event);
          
          switch (event.type) {
            case 'RoundStarted':
              roundStartedEvents++;
              break;
            case 'GameFinished':
              gameFinishedEvents++;
              break;
          }
        }
      }

      const players: Player[] = [
        new EventTrackingPlayer('Player1'),
        new EventTrackingPlayer('Player2'),
        new EventTrackingPlayer('Player3'),
        new EventTrackingPlayer('Player4')
      ];

      const game = new Game(players, GameSpans.EAST_GAME);
      
      await game.start();
      
      // イベントが適切に発生することを確認
      expect(roundStartedEvents).toBeGreaterThan(0);
      expect(gameFinishedEvents).toBe(4); // 全プレイヤーがGameFinishedイベントを受信
    }, 30000);

    it('should maintain correct score totals throughout game', async () => {
      let finalScores: number[] = [];

      class ScoreTrackingPlayer extends TestPlayer {
        notify(event: GameEvent): void {
          super.notify(event);
          
          if (event.type === 'GameFinished') {
            finalScores = event.results.map(r => r.score);
          }
        }
      }

      const players: Player[] = [
        new ScoreTrackingPlayer('Player1'),
        new ScoreTrackingPlayer('Player2'),
        new ScoreTrackingPlayer('Player3'),
        new ScoreTrackingPlayer('Player4')
      ];

      const game = new Game(players, GameSpans.EAST_GAME);
      
      await game.start();
      
      // 点数の保存性を確認（合計100,000点）
      const totalScore = finalScores.reduce((sum, score) => sum + score, 0);
      expect(totalScore).toBe(100000);
      
      // 全プレイヤーが有効な点数を持つことを確認
      expect(finalScores).toHaveLength(4);
      finalScores.forEach(score => {
        expect(typeof score).toBe('number');
        expect(score).not.toBeNaN();
      });
    }, 30000);

    it('should complete different game spans successfully', async () => {
      const testSpans = [GameSpans.EAST_GAME, GameSpans.HALF_GAME];
      
      for (const span of testSpans) {
        const players: Player[] = [
          new TestPlayer('Player1'),
          new TestPlayer('Player2'),
          new TestPlayer('Player3'),
          new TestPlayer('Player4')
        ];

        const game = new Game(players, span);
        
        // 異なるゲームスパンでも正常に完了するべき
        await game.start();
      }
    }, 60000);

    it('should properly initialize and start rounds', async () => {
      let roundStarted = false;
      let handUpdated = false;
      let wallTileTaken = false;
      
      class EventTrackingPlayer extends TestPlayer {
        notify(event: GameEvent): void {
          super.notify(event);
          
          if (event.type === 'RoundStarted') {
            roundStarted = true;
          }
          if (event.type === 'HandUpdated') {
            handUpdated = true;
          }
          if (event.type === 'WallTileTaken') {
            wallTileTaken = true;
          }
        }
      }

      const players: Player[] = [
        new EventTrackingPlayer('Player1'),
        new EventTrackingPlayer('Player2'),
        new EventTrackingPlayer('Player3'),
        new EventTrackingPlayer('Player4')
      ];

      const game = new Game(players, GameSpans.EAST_GAME);
      
      await game.start();
      
      // ゲームが適切に開始されることを確認
      expect(roundStarted).toBe(true);
      expect(handUpdated).toBe(true);
      expect(wallTileTaken).toBe(true);
    }, 30000);
  });
});