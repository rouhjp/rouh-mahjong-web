import { Socket } from 'socket.io';
import type { Player, ActionSelector, GameObserver, GameEvent, TurnAction, CallAction } from '@mahjong/core';
import { isTurnAction, isCallAction } from '@mahjong/core';

export class WebSocketPlayer implements Player, ActionSelector, GameObserver {
  private socket: Socket;
  private displayName: string;
  private pendingTurnActionResolve: ((action: TurnAction) => void) | null = null;
  private pendingCallActionResolve: ((action: CallAction) => void) | null = null;

  constructor(socket: Socket, displayName: string) {
    this.socket = socket;
    this.displayName = displayName;
    
    // Listen for game actions from client
    this.socket.on('game-action', (data: { action: TurnAction | CallAction }) => {
      console.log(`Received game action from ${this.displayName}:`, data.action);
      
      // Determine if it's a turn action or call action and resolve accordingly
      if (this.pendingTurnActionResolve && isTurnAction(data.action)) {
        this.pendingTurnActionResolve(data.action as TurnAction);
        this.pendingTurnActionResolve = null;
      } else if (this.pendingCallActionResolve && isCallAction(data.action)) {
        this.pendingCallActionResolve(data.action as CallAction);
        this.pendingCallActionResolve = null;
      }
    });
  }


  getName(): string {
    return this.displayName;
  }

  notify(event: GameEvent): void {
    this.socket.emit('game-event', { 
      type: event.type,
      eventData: event 
    });
  }

  async selectTurnAction(choices: TurnAction[]): Promise<TurnAction> {
    return new Promise((resolve) => {
      this.pendingTurnActionResolve = resolve;
      this.socket.emit('turn-action-request', choices);
    });
  }

  async selectCallAction(choices: CallAction[]): Promise<CallAction> {
    return new Promise((resolve) => {
      this.pendingCallActionResolve = resolve;
      this.socket.emit('call-action-request', choices);
    });
  }

}