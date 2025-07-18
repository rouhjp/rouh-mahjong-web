import { Socket } from 'socket.io';
import type { Player, ActionSelector, GameObserver, GameEvent, TurnAction, CallAction, DiscardGuide } from '@mahjong/core';
import { isTurnAction, isCallAction } from '@mahjong/core';

export class WebSocketPlayer implements Player, ActionSelector, GameObserver {
  private socket: Socket;
  private displayName: string;
  private pendingTurnActionResolve: ((action: TurnAction) => void) | null = null;
  private pendingCallActionResolve: ((action: CallAction) => void) | null = null;
  private pendingAcknowledgeResolve: (() => void) | null = null;

  constructor(socket: Socket, displayName: string) {
    this.socket = socket;
    this.displayName = displayName;
    
    this.socket.on('game-action', (data: { action: TurnAction | CallAction }) => {
      console.log(`Received game action from ${this.displayName}:`, data.action);
      if (this.pendingTurnActionResolve && isTurnAction(data.action)) {
        this.pendingTurnActionResolve(data.action as TurnAction);
        this.pendingTurnActionResolve = null;
      } else if (this.pendingCallActionResolve && isCallAction(data.action)) {
        this.pendingCallActionResolve(data.action as CallAction);
        this.pendingCallActionResolve = null;
      }
    });

    this.socket.on('game-acknowledge', () => {
      console.log(`Received acknowledge from ${this.displayName}`);
      if (this.pendingAcknowledgeResolve) {
        this.pendingAcknowledgeResolve();
        this.pendingAcknowledgeResolve = null;
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

  async selectTurnAction(choices: TurnAction[], guides?: DiscardGuide[]): Promise<TurnAction> {
    return new Promise((resolve) => {
      this.pendingTurnActionResolve = resolve;
      this.socket.emit('turn-action-request', { choices, guides });
    });
  }

  async selectCallAction(choices: CallAction[]): Promise<CallAction> {
    return new Promise((resolve) => {
      this.pendingCallActionResolve = resolve;
      this.socket.emit('call-action-request', { choices });
    });
  }

  async acknowledge(): Promise<void> {
    return new Promise((resolve) => {
      this.pendingAcknowledgeResolve = resolve;
      this.socket.emit('acknowledge-request');
    });
  }

}