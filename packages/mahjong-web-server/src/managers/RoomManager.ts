import { Room, WebPlayer } from '@mahjong/web-types';

interface DisconnectedPlayer {
  player: WebPlayer;
  disconnectedAt: number;
  timeoutId: NodeJS.Timeout;
}

export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private disconnectedPlayers: Map<string, DisconnectedPlayer[]> = new Map();
  private readonly RECONNECT_TIMEOUT = 5 * 60 * 1000; // 5分

  generateRoomId(): string {
    let roomId: string;
    do {
      roomId = Math.floor(100000 + Math.random() * 900000).toString();
    } while (this.rooms.has(roomId));
    return roomId;
  }

  createRoom(): Room {
    const roomId = this.generateRoomId();
    const room: Room = {
      roomId,
      players: [],
      maxPlayers: 4,
      createdAt: Date.now(),
      gameStarted: false,
    };
    this.rooms.set(roomId, room);
    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  addPlayerToRoom(roomId: string, player: WebPlayer): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.players.length >= room.maxPlayers) {
      return false;
    }
    
    // First player becomes the host
    if (room.players.length === 0) {
      player.isHost = true;
    }
    
    room.players.push(player);
    return true;
  }

  removePlayerFromRoom(roomId: string, userId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const initialLength = room.players.length;
    const removedPlayer = room.players.find(p => p.userId === userId);
    room.players = room.players.filter(p => p.userId !== userId);
    
    // If host left and there are still players, make the first remaining non-bot player the new host
    if (removedPlayer?.isHost && room.players.length > 0) {
      const nextHost = room.players.find(p => !p.isBot) || room.players[0];
      nextHost.isHost = true;
    }
    
    // Delete room if no active or disconnected real players remain
    if (!this.hasActiveOrDisconnectedRealPlayers(roomId)) {
      this.rooms.delete(roomId);
      this.disconnectedPlayers.delete(roomId);
      console.log(`Room ${roomId} deleted - no active or disconnected real players remaining`);
    }
    
    return room.players.length < initialLength;
  }

  updatePlayerReady(roomId: string, userId: string, isReady: boolean): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const player = room.players.find(p => p.userId === userId);
    if (!player) return false;

    player.isReady = isReady;
    return true;
  }

  areAllPlayersReady(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.players.length < 4) return false;
    return room.players.every(p => p.isReady);
  }

  getRoomBySocketId(socketId: string): Room | undefined {
    for (const room of this.rooms.values()) {
      if (room.players.some(p => p.socketId === socketId)) {
        return room;
      }
    }
    return undefined;
  }

  updatePlayerSocketId(roomId: string, userId: string, newSocketId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    
    const player = room.players.find(p => p.userId === userId);
    if (player) {
      player.socketId = newSocketId;
      return true;
    }
    return false;
  }

  getRoomByUserId(userId: string): Room | undefined {
    for (const room of this.rooms.values()) {
      if (room.players.some(p => p.userId === userId)) {
        return room;
      }
    }
    return undefined;
  }


  hasRealPlayers(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    return room.players.some(p => !p.isBot);
  }

  resetRoomAfterGame(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    // Reset game state
    room.gameStarted = false;
    
    // Reset player ready states - bots remain ready, real players reset to not ready
    room.players.forEach(player => {
      if (player.isBot) {
        player.isReady = true; // ボットは常に準備完了状態を維持
      } else {
        player.isReady = false; // 実際のプレイヤーは準備状態をリセット
      }
    });

    console.log(`Room ${roomId} reset after game completion`);
    return true;
  }

  markPlayerAsDisconnected(roomId: string, userId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const player = room.players.find(p => p.userId === userId);
    if (!player || player.isBot) return false;

    // すでに切断リストにいるかチェック
    const disconnectedList = this.disconnectedPlayers.get(roomId) || [];
    const existingDisconnection = disconnectedList.find(d => d.player.userId === userId);
    if (existingDisconnection) {
      // 既存のタイムアウトをクリア
      clearTimeout(existingDisconnection.timeoutId);
    }

    // 新しいタイムアウトを設定
    const timeoutId = setTimeout(() => {
      this.removeDisconnectedPlayer(roomId, userId);
    }, this.RECONNECT_TIMEOUT);

    const disconnectedPlayer: DisconnectedPlayer = {
      player: { ...player },
      disconnectedAt: Date.now(),
      timeoutId
    };

    // 切断リストを更新
    const updatedList = disconnectedList.filter(d => d.player.userId !== userId);
    updatedList.push(disconnectedPlayer);
    this.disconnectedPlayers.set(roomId, updatedList);

    // ルームからプレイヤーを一時的に削除（ボットは削除しない）
    room.players = room.players.filter(p => p.userId !== userId);

    console.log(`Player ${player.displayName} marked as disconnected in room ${roomId} (${this.RECONNECT_TIMEOUT / 1000}s timeout)`);
    return true;
  }

  reconnectPlayer(roomId: string, userId: string, newSocketId: string): WebPlayer | null {
    const room = this.rooms.get(roomId);
    const disconnectedList = this.disconnectedPlayers.get(roomId) || [];
    
    const disconnectedPlayer = disconnectedList.find(d => d.player.userId === userId);
    if (!room || !disconnectedPlayer) return null;

    // タイムアウトをクリア
    clearTimeout(disconnectedPlayer.timeoutId);

    // プレイヤーを復元
    const restoredPlayer: WebPlayer = {
      ...disconnectedPlayer.player,
      socketId: newSocketId
    };

    // ルームにプレイヤーを戻す
    room.players.push(restoredPlayer);

    // 切断リストから削除
    const updatedList = disconnectedList.filter(d => d.player.userId !== userId);
    this.disconnectedPlayers.set(roomId, updatedList);

    console.log(`Player ${restoredPlayer.displayName} reconnected to room ${roomId}`);
    return restoredPlayer;
  }

  private removeDisconnectedPlayer(roomId: string, userId: string): void {
    const disconnectedList = this.disconnectedPlayers.get(roomId) || [];
    const updatedList = disconnectedList.filter(d => d.player.userId !== userId);
    this.disconnectedPlayers.set(roomId, updatedList);

    console.log(`Disconnected player ${userId} permanently removed from room ${roomId} due to timeout`);

    // ルームに実プレイヤーがいなければルームを削除
    const room = this.rooms.get(roomId);
    if (room && !this.hasActiveOrDisconnectedRealPlayers(roomId)) {
      this.rooms.delete(roomId);
      this.disconnectedPlayers.delete(roomId);
      console.log(`Room ${roomId} deleted - no active or disconnected real players remaining`);
    }
  }

  hasActiveOrDisconnectedRealPlayers(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    // アクティブな実プレイヤーをチェック
    const activeRealPlayers = room.players.filter(p => !p.isBot);
    if (activeRealPlayers.length > 0) return true;

    // 切断中の実プレイヤーをチェック
    const disconnectedList = this.disconnectedPlayers.get(roomId) || [];
    const disconnectedRealPlayers = disconnectedList.filter(d => !d.player.isBot);
    return disconnectedRealPlayers.length > 0;
  }

  getDisconnectedPlayers(roomId: string): DisconnectedPlayer[] {
    return this.disconnectedPlayers.get(roomId) || [];
  }

  cleanupExpiredDisconnections(roomId: string): void {
    const disconnectedList = this.disconnectedPlayers.get(roomId) || [];
    const now = Date.now();
    
    disconnectedList.forEach(disconnected => {
      if (now - disconnected.disconnectedAt > this.RECONNECT_TIMEOUT) {
        this.removeDisconnectedPlayer(roomId, disconnected.player.userId);
      }
    });
  }

  findDisconnectedPlayerRoom(userId: string): string | null {
    for (const [roomId, disconnectedList] of this.disconnectedPlayers.entries()) {
      const found = disconnectedList.find(d => d.player.userId === userId);
      if (found) {
        return roomId;
      }
    }
    return null;
  }
}