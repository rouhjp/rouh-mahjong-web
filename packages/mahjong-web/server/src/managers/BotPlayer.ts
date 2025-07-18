import type { Player, ActionSelector, GameObserver, GameEvent, TurnAction, CallAction, DiscardGuide } from '@mahjong/core';

export class BotPlayer implements Player, ActionSelector, GameObserver {
  private displayName: string;

  constructor(displayName: string) {
    this.displayName = displayName;
  }

  getName(): string {
    return this.displayName;
  }

  notify(_: GameEvent): void {
    // pass
  }

  async selectTurnAction(choices: TurnAction[], _?: DiscardGuide[]): Promise<TurnAction> {
    const action = choices.find(c => c.type === 'Discard' && c.discardDrawn) || choices[0];
    await new Promise(resolve => setTimeout(resolve, 200));
    return action;
  }

  async selectCallAction(choices: CallAction[]): Promise<CallAction> {
    return choices.find(c => c.type === 'Pass') || choices[0];
  }

  async acknowledge(): Promise<void> {
    return Promise.resolve();
  }
}
