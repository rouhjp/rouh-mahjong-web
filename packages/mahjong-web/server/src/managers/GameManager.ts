import { Server } from 'socket.io';
import { Game, GameSpans } from '@mahjong/core';
import type { WebPlayer } from '../types';
import { WebSocketPlayer } from './WebSocketPlayer';

export class GameManager {
  private games = new Map<string, Game>();
  private gamePlayers = new Map<string, WebSocketPlayer[]>();
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  async startGame(roomId: string, players: WebPlayer[], connectedUsers: Map<string, { userId: string; displayName: string }>): Promise<void> {
    if (players.length !== 4) {
      throw new Error('麻雀は4人のプレイヤーが必要です');
    }

    // Create WebSocketPlayer instances
    const webSocketPlayers: WebSocketPlayer[] = [];
    for (const player of players) {
      const socket = this.io.sockets.sockets.get(player.socketId);
      if (!socket) {
        throw new Error(`プレイヤー ${player.displayName} のSocket接続が見つかりません`);
      }
      
      const userInfo = connectedUsers.get(player.socketId);
      if (!userInfo) {
        throw new Error(`プレイヤー ${player.displayName} のユーザー情報が見つかりません`);
      }

      const webSocketPlayer = new WebSocketPlayer(socket, userInfo.displayName);
      webSocketPlayers.push(webSocketPlayer);
    }

    // Create and start the actual Game
    const game = new Game(webSocketPlayers, GameSpans.HALF_GAME);
    this.games.set(roomId, game);
    this.gamePlayers.set(roomId, webSocketPlayers);

    // Notify all players that the game is starting
    this.io.to(roomId).emit('game-event', {
      type: 'GameStarting',
      message: '麻雀ゲームを開始します！プレイヤー: ' + players.map(p => p.displayName).join(', '),
      eventData: null
    });

    try {
      // Start the actual mahjong game using Game class
      console.log(`Starting mahjong game in room ${roomId} with players: ${webSocketPlayers.map(p => p.getName()).join(', ')}`);
      await game.start();
      
      // Game finished
      this.io.to(roomId).emit('game-event', {
        type: 'GameCompleted',
        message: 'ゲームが終了しました',
        eventData: null
      });

    } catch (error) {
      console.error(`Game error in room ${roomId}:`, error);
      this.io.to(roomId).emit('game-event', {
        type: 'GameError',
        message: `ゲームエラー: ${error instanceof Error ? error.message : '不明なエラー'}`,
        eventData: null
      });
    } finally {
      // Clean up
      this.games.delete(roomId);
      this.gamePlayers.delete(roomId);
    }
  }

  isGameActive(roomId: string): boolean {
    return this.games.has(roomId);
  }

  getGame(roomId: string): Game | undefined {
    return this.games.get(roomId);
  }

  handlePlayerDisconnect(roomId: string, socketId: string): void {
    const game = this.games.get(roomId);
    if (game) {
      // In a real implementation, you might want to pause the game
      // or allow reconnection. For now, we'll just log it.
      console.log(`Player disconnected from active game in room ${roomId}`);
      
      this.io.to(roomId).emit('game-event', {
        type: 'PlayerDisconnected',
        message: 'プレイヤーが切断されました。ゲームは一時停止中です。',
        eventData: { socketId }
      });
    }
  }
}