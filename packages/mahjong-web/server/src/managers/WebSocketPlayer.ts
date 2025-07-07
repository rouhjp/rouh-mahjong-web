import { Socket } from 'socket.io';
import type { Player, ActionSelector, GameObserver, GameEvent, TurnAction, CallAction } from '@mahjong/core';

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
    const type = (action as any).type;
    return ['Tsumo', 'NineTiles', 'AddQuad', 'SelfQuad', 'Discard'].includes(type);
  }

  private isCallAction(action: TurnAction | CallAction): action is CallAction {
    const type = (action as any).type;
    return ['Ron', 'Chi', 'Pon', 'Kan', 'Pass'].includes(type);
  }

  getName(): string {
    return this.displayName;
  }

  notify(event: GameEvent): void {
    // Convert game events to chat messages for display
    const message = this.formatGameEvent(event);
    if (message) {
      this.socket.emit('game-event', { 
        type: event.type,
        message,
        eventData: event 
      });
    }
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

  private formatGameEvent(event: GameEvent): string | null {
    switch (event.type) {
      case 'RoundStarted':
        return `${event.roundWind.name}${event.roundCount}局が開始されました`;
      case 'HandUpdated':
        return `手牌が更新されました（${event.handTiles.length}枚）`;
      case 'RiverTileAdded':
        return `${(event.side as any).name}が${(event.tile as any).toString()}を切りました`;
      case 'Declared':
        return `${event.side.name}が「${event.declaration}」と宣言しました`;
      case 'RoundFinishedInWinning':
        return `和了！ ${event.handTypes.join('、')} ${event.scoreExpression}`;
      case 'RoundFinishedInDraw':
        return `流局: ${event.drawType}`;
      case 'GameFinished':
        return `ゲーム終了！最終結果: ${event.results.map(r => `${r.name}: ${r.rank}位 ${r.score}点`).join(', ')}`;
      case 'ScoreChanged':
        return `点数変動がありました`;
      default:
        return null;
    }
  }

  private formatTurnAction(action: TurnAction): string {
    switch ((action as any).type) {
      case 'Tsumo':
        return 'ツモ';
      case 'NineTiles':
        return '九種九牌';
      case 'AddQuad':
        return `加カン(${(action as any).tile.toString()})`;
      case 'SelfQuad':
        return `暗カン(${(action as any).tile.toString()})`;
      case 'Discard':
        return `切る(${(action as any).tile.toString()})${(action as any).ready ? ' リーチ' : ''}`;
      default:
        return (action as any).type;
    }
  }

  private formatCallAction(action: CallAction): string {
    switch ((action as any).type) {
      case 'Ron':
        return 'ロン';
      case 'Chi':
        return `チー(${(action as any).baseTiles.map((t: any) => t.toString()).join('')})`;
      case 'Pon':
        return `ポン(${(action as any).baseTiles.map((t: any) => t.toString()).join('')})`;
      case 'Kan':
        return 'カン';
      case 'Pass':
        return 'パス';
      default:
        return (action as any).type;
    }
  }
}