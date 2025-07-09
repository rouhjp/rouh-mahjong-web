import type { Player, ActionSelector, GameObserver, GameEvent, TurnAction, CallAction } from '@mahjong/core';

export class BotPlayer implements Player, ActionSelector, GameObserver {
  private displayName: string;

  constructor(displayName: string) {
    this.displayName = displayName;
  }

  getName(): string {
    return this.displayName;
  }

  notify(event: GameEvent): void {
    // No-op for bots - they don't need game event notifications
    console.log(`Bot ${this.displayName} received event: ${event.type}`);
  }

  async selectTurnAction(choices: TurnAction[]): Promise<TurnAction> {
    // Bot logic: Always discard drawn tiles (ツモ切り)
    console.log(`Bot ${this.displayName} selecting turn action from:`, choices.map(c => c.type));
    
    // Look for discard actions first (prefer discarding drawn tile)
    const discardActions = choices.filter(c => c.type === 'Discard');
    if (discardActions.length > 0) {
      const action = discardActions[0]; // Choose first discard option
      console.log(`Bot ${this.displayName} chose discard action:`, action);
      return action;
    }

    // If no discard available, choose first available action
    const action = choices[0];
    console.log(`Bot ${this.displayName} chose action:`, action);
    return action;
  }

  async selectCallAction(choices: CallAction[]): Promise<CallAction> {
    // Bot logic: Always pass on call actions
    console.log(`Bot ${this.displayName} selecting call action from:`, choices.map(c => c.type));
    
    // Look for pass action
    const passAction = choices.find(c => c.type === 'Pass');
    if (passAction) {
      console.log(`Bot ${this.displayName} chose pass action`);
      return passAction;
    }

    // If no pass action available, choose first available action
    const action = choices[0];
    console.log(`Bot ${this.displayName} chose action:`, action);
    return action;
  }
}