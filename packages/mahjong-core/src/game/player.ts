import type { ActionSelector, CallAction, GameEvent, GameObserver, TurnAction } from "./event";

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