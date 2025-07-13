import { Server } from 'socket.io';
import { Game, GameSpans } from '@mahjong/core';
import type { WebPlayer } from '../types';
import { WebSocketPlayer } from './WebSocketPlayer';
import { BotPlayer } from './BotPlayer';
import { RoomManager } from './RoomManager';

export class GameManager {
  private games = new Map<string, Game>();
  private gamePlayers = new Map<string, (WebSocketPlayer | BotPlayer)[]>();
  private io: Server;
  private roomManager: RoomManager;

  constructor(io: Server, roomManager: RoomManager) {
    this.io = io;
    this.roomManager = roomManager;
  }

  async startGame(roomId: string, players: WebPlayer[], connectedUsers: Map<string, { userId: string; displayName: string }>): Promise<void> {
    if (players.length !== 4) {
      throw new Error('麻雀は4人のプレイヤーが必要です');
    }

    // Create player instances (both real players and bots)
    const gamePlayers: (WebSocketPlayer | BotPlayer)[] = [];
    for (const player of players) {
      if (player.isBot) {
        // Create bot player
        const botPlayer = new BotPlayer(player.displayName);
        gamePlayers.push(botPlayer);
        console.log(`Created bot player: ${player.displayName}`);
      } else {
        // Create real player with socket connection
        const socket = this.io.sockets.sockets.get(player.socketId);
        if (!socket) {
          throw new Error(`プレイヤー ${player.displayName} のSocket接続が見つかりません`);
        }
        
        const userInfo = connectedUsers.get(player.socketId);
        if (!userInfo) {
          throw new Error(`プレイヤー ${player.displayName} のユーザー情報が見つかりません`);
        }

        const webSocketPlayer = new WebSocketPlayer(socket, userInfo.displayName);
        gamePlayers.push(webSocketPlayer);
        console.log(`Created real player: ${player.displayName}`);
      }
    }

    // Create and start the actual Game
    const game = new Game(gamePlayers, GameSpans.EAST_GAME);
    this.games.set(roomId, game);
    this.gamePlayers.set(roomId, gamePlayers);

    // Notify all players that the game is starting
    this.io.to(roomId).emit('game-event', {
      type: 'GameStarting',
      message: '麻雀ゲームを開始します！プレイヤー: ' + players.map(p => p.displayName).join(', '),
      eventData: null
    });

    try {
      // Start the actual mahjong game using Game class
      console.log(`Starting mahjong game in room ${roomId} with players: ${gamePlayers.map(p => p.getName()).join(', ')}`);
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
      // Clean up game state
      this.games.delete(roomId);
      this.gamePlayers.delete(roomId);
      
      // Reset room state and notify players
      const success = this.roomManager.resetRoomAfterGame(roomId);
      if (success) {
        const updatedRoom = this.roomManager.getRoom(roomId);
        if (updatedRoom) {
          this.io.to(roomId).emit('room-update', { room: updatedRoom });
          console.log(`Room ${roomId} automatically reset after game completion`);
        }
      }
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