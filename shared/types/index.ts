// Core game entities
export interface Player {
  userId: string;
  displayName: string;
  socketId: string;
  isReady: boolean;
  isHost: boolean;
}

export interface Room {
  roomId: string;
  players: Player[];
  maxPlayers: number;
  createdAt: number;
  gameStarted: boolean;
}

// Socket.io event data types
export interface AuthenticateData {
  displayName: string;
}

export interface CreateRoomResponse {
  roomId: string;
}

export interface JoinRoomData {
  roomId: string;
}

export interface RoomUpdateData {
  room: Room;
}

// Re-export mahjong types
export * from './mahjong';