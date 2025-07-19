import { describe, it } from 'vitest';
import { Game, GameSpans } from './game.js';
import { Player } from './player.js';
import type { TurnAction, CallAction, GameEvent } from './event.js';

class SimpleTestPlayer implements Player {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  getName(): string {
    return this.name;
  }

  async selectTurnAction(choices: TurnAction[]): Promise<TurnAction> {
    console.log(`${this.name} selectTurnAction: ${choices.length} choices`);
    return choices[0];
  }

  async selectCallAction(choices: CallAction[]): Promise<CallAction> {
    console.log(`${this.name} selectCallAction: ${choices.length} choices`);
    return choices[0];
  }

  async acknowledge(): Promise<void> {
    console.log(`${this.name} acknowledged`);
    return Promise.resolve();
  }

  notify(event: GameEvent): void {
    // Minimal logging
    if (event.type === 'round-started') {
      console.log(`${this.name}: Round started`);
    }
  }
}

describe('Game flow', () => {
  describe('simple test', () => {
    it('should pass', () => {
      console.log('Simple test running');
    });

    it('should create game instance', async () => {
      console.log('Creating game instance test');
      const players: Player[] = [
        new SimpleTestPlayer('P1'),
        new SimpleTestPlayer('P2'),
        new SimpleTestPlayer('P3'),
        new SimpleTestPlayer('P4')
      ];

      console.log("hello");

      const game = new Game(players, GameSpans.EAST_GAME);
      console.log('hello2');

      await game.start().then(() => console.log("end"));

    });
  });
});