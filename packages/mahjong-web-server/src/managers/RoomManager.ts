import { Room, WebPlayer, ChatMessage } from '@mahjong/web-types';

export class RoomManager {
  private rooms: Map<string, Room> = new Map();

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
      chatMessages: []
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
    
    // Delete room if no players remain OR if only bots remain
    const realPlayers = room.players.filter(p => !p.isBot);
    if (room.players.length === 0 || realPlayers.length === 0) {
      this.rooms.delete(roomId);
      console.log(`Room ${roomId} deleted - no real players remaining`);
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

  updatePlayerSocketId(userId: string, newSocketId: string): boolean {
    for (const room of this.rooms.values()) {
      const player = room.players.find(p => p.userId === userId);
      if (player) {
        player.socketId = newSocketId;
        return true;
      }
    }
    return false;
  }

  addChatMessage(roomId: string, message: ChatMessage): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    
    room.chatMessages.push(message);
    return true;
  }

  getChatMessages(roomId: string): ChatMessage[] {
    const room = this.rooms.get(roomId);
    return room ? room.chatMessages : [];
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
}