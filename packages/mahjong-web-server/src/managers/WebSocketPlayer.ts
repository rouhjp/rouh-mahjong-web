import { Socket } from 'socket.io';
import type { Player, ActionSelector, GameObserver, GameEvent, TurnAction, CallAction, DiscardGuide } from '@mahjong/core';
import { isTurnAction, isCallAction } from '@mahjong/core';

interface TurnActionRequest {
  type: 'turn-action';
  choices: TurnAction[];
  guides?: DiscardGuide[];
  requestedAt: number;
}

interface CallActionRequest {
  type: 'call-action';
  choices: CallAction[];
  requestedAt: number;
}

interface AcknowledgeRequest {
  type: 'acknowledge';
  requestedAt: number;
}

type ActionRequest = TurnActionRequest | CallActionRequest | AcknowledgeRequest;

export class WebSocketPlayer implements Player, ActionSelector, GameObserver {
  private socket: Socket;
  private displayName: string;
  private userId?: string;
  private gameEventHistory: GameEvent[] = [];
  private maxEventHistorySize: number = 1000; // メモリ使用量制限
  private pendingTurnActionResolve: ((_action: TurnAction) => void) | null = null;
  private pendingCallActionResolve: ((_action: CallAction) => void) | null = null;
  private pendingAcknowledgeResolve: (() => void) | null = null;
  private currentActionRequest: ActionRequest | null = null; // 現在のアクション要求を保存

  constructor(socket: Socket, displayName: string, userId?: string) {
    this.socket = socket;
    this.displayName = displayName;
    this.userId = userId;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.socket.on('game-action', (data: { action: TurnAction | CallAction }) => {
      console.log(`Received game action from ${this.displayName}:`, data.action);
      if (this.pendingTurnActionResolve && isTurnAction(data.action)) {
        this.pendingTurnActionResolve(data.action as TurnAction);
        this.pendingTurnActionResolve = null;
        this.currentActionRequest = null; // アクション要求をクリア
      } else if (this.pendingCallActionResolve && isCallAction(data.action)) {
        this.pendingCallActionResolve(data.action as CallAction);
        this.pendingCallActionResolve = null;
        this.currentActionRequest = null; // アクション要求をクリア
      }
    });

    this.socket.on('game-acknowledge', () => {
      console.log(`Received acknowledge from ${this.displayName}`);
      if (this.pendingAcknowledgeResolve) {
        this.pendingAcknowledgeResolve();
        this.pendingAcknowledgeResolve = null;
        this.currentActionRequest = null; // アクション要求をクリア
      }
    });
  }

  updateSocket(newSocket: Socket): void {
    // 古いsocketのイベントリスナーを削除
    this.socket.removeAllListeners('game-action');
    this.socket.removeAllListeners('game-acknowledge');
    
    // 新しいsocketに切り替え
    this.socket = newSocket;
    
    // 新しいsocketにイベントリスナーを設定
    this.setupEventListeners();
    
    // pending状態があれば復元（Promiseは再作成しない、既存のresolveを保持）
    if (this.currentActionRequest) {
      console.log(`Restoring pending action request: ${this.currentActionRequest.type} for ${this.displayName}`);
    }
    
    console.log(`Socket updated for ${this.displayName}`);
  }

  sendStoredEvents(): void {
    const hasEvents = this.gameEventHistory.length > 0;
    const hasActionRequest = this.currentActionRequest !== null;
    
    if (!hasEvents && !hasActionRequest) {
      console.log(`No stored events or action requests to send for ${this.displayName}`);
      return;
    }

    if (!this.socket.connected) {
      console.warn(`Cannot send stored events to ${this.displayName}: socket not connected`);
      return;
    }

    console.log(`Sending ${this.gameEventHistory.length} stored events and ${hasActionRequest ? '1' : '0'} action request to ${this.displayName}`);
    
    try {
      let delayOffset = 0;
      
      // 保存されたイベントを順番に送信
      this.gameEventHistory.forEach((event, index) => {
        // 少し遅延を入れて順次送信（WebSocketの順序保証）
        setTimeout(() => {
          try {
            if (this.socket.connected) {
              this.socket.emit('game-event', { 
                type: event.type,
                eventData: event 
              });
              console.log(`Sent stored event ${index + 1}/${this.gameEventHistory.length}: ${event.type} to ${this.displayName}`);
            } else {
              console.warn(`Socket disconnected during event sending for ${this.displayName}`);
            }
          } catch (error) {
            console.error(`Error sending stored event ${event.type} to ${this.displayName}:`, error);
          }
        }, index * 10); // 10ms間隔で送信
        delayOffset = (index + 1) * 10;
      });
      
      // アクション要求がある場合は最後に送信
      if (this.currentActionRequest) {
        setTimeout(() => {
          try {
            if (this.socket.connected) {
              this.sendActionRequest(this.currentActionRequest!);
              console.log(`Sent stored action request: ${this.currentActionRequest!.type} to ${this.displayName}`);
            } else {
              console.warn(`Socket disconnected during action request sending for ${this.displayName}`);
            }
          } catch (error) {
            console.error(`Error sending stored action request to ${this.displayName}:`, error);
          }
        }, delayOffset + 50); // イベント送信後に少し間隔を開けて送信
      }
      
      console.log(`All stored events and action requests queued for ${this.displayName}`);
    } catch (error) {
      console.error(`Error in sendStoredEvents for ${this.displayName}:`, error);
    }
  }

  private sendActionRequest(actionRequest: ActionRequest): void {
    switch (actionRequest.type) {
      case 'turn-action':
        this.socket.emit('turn-action-request', { 
          choices: actionRequest.choices, 
          guides: actionRequest.guides 
        });
        break;
      case 'call-action':
        this.socket.emit('call-action-request', { 
          choices: actionRequest.choices 
        });
        break;
      case 'acknowledge':
        this.socket.emit('acknowledge-request');
        break;
    }
  }


  getName(): string {
    return this.displayName;
  }

  getUserId(): string | undefined {
    return this.userId;
  }

  getEventHistoryCount(): number {
    return this.gameEventHistory.length;
  }

  clearEventHistory(): void {
    this.gameEventHistory = [];
    console.log(`GameEvent history manually cleared for ${this.displayName}`);
  }

  notify(event: GameEvent): void {
    // round-startedイベントの場合、過去の履歴をクリア
    if (event.type === 'round-started') {
      this.gameEventHistory = [];
      console.log(`GameEvent history cleared for ${this.displayName} due to round-started`);
    }
    
    // イベントを履歴に保存
    this.gameEventHistory.push(event);
    
    // 履歴サイズ制限を適用
    if (this.gameEventHistory.length > this.maxEventHistorySize) {
      this.gameEventHistory = this.gameEventHistory.slice(-this.maxEventHistorySize);
      console.log(`GameEvent history trimmed for ${this.displayName} to ${this.maxEventHistorySize} events`);
    }
    
    // クライアントにイベントを送信
    this.socket.emit('game-event', { 
      type: event.type,
      eventData: event 
    });
    
    console.log(`GameEvent ${event.type} sent and stored for ${this.displayName} (history: ${this.gameEventHistory.length} events)`);
  }

  async selectTurnAction(choices: TurnAction[], guides?: DiscardGuide[]): Promise<TurnAction> {
    return new Promise((resolve) => {
      this.pendingTurnActionResolve = resolve;
      
      // ActionRequestを保存
      this.currentActionRequest = {
        type: 'turn-action',
        choices,
        guides,
        requestedAt: Date.now()
      };
      
      this.socket.emit('turn-action-request', { choices, guides });
      console.log(`Turn action request sent and stored for ${this.displayName}`);
    });
  }

  async selectCallAction(choices: CallAction[]): Promise<CallAction> {
    return new Promise((resolve) => {
      this.pendingCallActionResolve = resolve;
      
      // ActionRequestを保存
      this.currentActionRequest = {
        type: 'call-action',
        choices,
        requestedAt: Date.now()
      };
      
      this.socket.emit('call-action-request', { choices });
      console.log(`Call action request sent and stored for ${this.displayName}`);
    });
  }

  async acknowledge(): Promise<void> {
    return new Promise((resolve) => {
      this.pendingAcknowledgeResolve = resolve;
      
      // ActionRequestを保存
      this.currentActionRequest = {
        type: 'acknowledge',
        requestedAt: Date.now()
      };
      
      this.socket.emit('acknowledge-request');
      console.log(`Acknowledge request sent and stored for ${this.displayName}`);
    });
  }

}