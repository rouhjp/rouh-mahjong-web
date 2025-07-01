// Re-export mahjong types
export * from '@mahjong/core';

// Explicitly re-export from @mahjong/game to avoid naming conflicts
export type { 
  Player, 
  Room, 
  AuthenticateData, 
  JoinRoomData,
  ChatMessage,
  SendMessageData
} from '@mahjong/game';

