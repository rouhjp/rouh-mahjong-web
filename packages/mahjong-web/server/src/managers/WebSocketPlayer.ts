import { Socket } from 'socket.io';
import type { Player, ActionSelector, GameObserver, GameEvent, TurnAction, CallAction } from '@mahjong/core';
import { WindInfo, SideInfo, TileInfo } from '@mahjong/core';

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
      if (this.pendingTurnActionResolve && this.isTurnAction(data.action)) {
        this.pendingTurnActionResolve(data.action as TurnAction);
        this.pendingTurnActionResolve = null;
      } else if (this.pendingCallActionResolve && this.isCallAction(data.action)) {
        this.pendingCallActionResolve(data.action as CallAction);
        this.pendingCallActionResolve = null;
      }
    });
  }

  private isTurnAction(action: TurnAction | CallAction): action is TurnAction {
    const type = action.type;
    return ['Tsumo', 'NineTiles', 'AddQuad', 'SelfQuad', 'Discard'].includes(type);
  }

  private isCallAction(action: TurnAction | CallAction): action is CallAction {
    const type = action.type;
    return ['Ron', 'Chi', 'Pon', 'Kan', 'Pass'].includes(type);
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
      this.socket.emit('action-request', {
        type: 'turn',
        choices,
        message: `アクションを選択してください: ${choices.map(c => this.formatTurnAction(c)).join(', ')}`
      });
    });
  }

  async selectCallAction(choices: CallAction[]): Promise<CallAction> {
    return new Promise((resolve) => {
      this.pendingCallActionResolve = resolve;
      this.socket.emit('action-request', {
        type: 'call',
        choices,
        message: `鳴きアクションを選択してください: ${choices.map(c => this.formatCallAction(c)).join(', ')}`
      });
    });
  }

  private formatTurnAction(action: TurnAction): string {
    switch (action.type) {
      case 'Tsumo':
        return 'ツモ';
      case 'NineTiles':
        return '九種九牌';
      case 'AddQuad':
        return `加カン(${TileInfo[action.tile].code})`;
      case 'SelfQuad':
        return `暗カン(${TileInfo[action.tile].code})`;
      case 'Ready':
        return `リーチ(${TileInfo[action.tile].code})`;
      case 'Discard':
        return `切る(${TileInfo[action.tile].code})`;
      default:
        return 'アクション';
    }
  }

  private formatCallAction(action: CallAction): string {
    switch (action.type) {
      case 'Ron':
        return 'ロン';
      case 'Chi':
        return `チー(${action.baseTiles.map(t => TileInfo[t].code).join('')})`;
      case 'Pon':
        return `ポン(${action.baseTiles.map(t => TileInfo[t].code).join('')})`;
      case 'Kan':
        return 'カン';
      case 'Pass':
        return 'パス';
      default:
        return 'アクション';
    }
  }
}