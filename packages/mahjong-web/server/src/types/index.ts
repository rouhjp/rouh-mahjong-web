// Re-export mahjong types
export * from '@mahjong/core';

// Explicitly re-export from @mahjong/game to avoid naming conflicts
export type { 
  Player, 
  Room, 
  AuthenticateData, 
  JoinRoomData,
  PlayerPosition,
  PlayerHand
} from '@mahjong/game';

// Re-export Meld from @mahjong/game with alias to resolve conflict
export type { Meld as GameMeld } from '@mahjong/game';