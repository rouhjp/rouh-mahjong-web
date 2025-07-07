// Re-export mahjong types
export * from '@mahjong/core';

// Re-export web-specific types
export * from '../../../types';

// Re-export WebPlayer as Player for client compatibility
export type { WebPlayer as Player } from '../../../types';