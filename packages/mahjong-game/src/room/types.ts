// Room management types
export interface Player {
  userId: string;      // UUID（内部管理用）
  displayName: string; // 表示名（同名OK）
  socketId: string;    // Socket接続ID
  isReady: boolean;    // 準備状態
  isHost: boolean;     // ホスト権限
}

export interface Room {
  roomId: string;      // 6桁数字ID
  players: Player[];   // プレイヤー配列（最大4人）
  maxPlayers: number;  // 最大人数（固定4）
  createdAt: number;   // 作成時刻
  gameStarted: boolean; // ゲーム開始フラグ
}

export interface AuthenticateData {
  displayName: string;
}

export interface JoinRoomData {
  roomId: string;
}