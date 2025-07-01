import { Room, Player, ChatMessage } from '../types';
import { v4 as uuidv4 } from 'uuid';

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

  addPlayerToRoom(roomId: string, player: Player): boolean {
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
    
    // If host left and there are still players, make the first remaining player the new host
    if (removedPlayer?.isHost && room.players.length > 0) {
      room.players[0].isHost = true;
    }
    
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
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
}