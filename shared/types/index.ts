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

// Game-related types (for future expansion)
export interface GameState {
  currentPlayer: number;
  round: number;
  turn: number;
  // Add more game state properties as needed
}

export interface MahjongTile {
  id: string;
  type: 'man' | 'pin' | 'sou' | 'honor';
  value: number;
  // Add more tile properties as needed
}