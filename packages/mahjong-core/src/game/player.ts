import type { ActionSelector, CallAction, DiscardGuide, GameEvent, GameObserver, TurnAction } from "./event.js";

/**
 * プレイヤー処理を実装するためのインターフェース
 */
export interface Player extends ActionSelector, GameObserver{
  getName(): string;
}

export abstract class ForwardingPlayer implements Player {
  private readonly delegated: Player;

  constructor(delegated: Player) {
    this.delegated = delegated;
  }
  
  notify(event: GameEvent): void {
    this.delegated.notify(event);
  }

  selectTurnAction(choices: TurnAction[], guides?: DiscardGuide[]): Promise<TurnAction> {
    return this.delegated.selectTurnAction(choices, guides);
  }

  selectCallAction(choices: CallAction[]): Promise<CallAction> {
    return this.delegated.selectCallAction(choices);
  }

  acknowledge(): Promise<void> {
    return this.delegated.acknowledge();
  }

  getName(): string {
    return this.delegated.getName();
  }
}