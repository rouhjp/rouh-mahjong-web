// Web application specific types for Socket.io communication and room management

export interface WebPlayer {
  userId: string;      // UUID（内部管理用）
  displayName: string; // 表示名（同名OK）
  socketId: string;    // Socket接続ID
  isReady: boolean;    // 準備状態
  isHost: boolean;     // ホスト権限
  isBot: boolean;      // NPCボット判定
}

export interface Room {
  roomId: string;      // 6桁数字ID
  players: WebPlayer[];   // プレイヤー配列（最大4人）
  maxPlayers: number;  // 最大人数（固定4）
  createdAt: number;   // 作成時刻
  gameStarted: boolean; // ゲーム開始フラグ
}

export interface AuthenticateData {
  displayName: string;
  userId?: string; // 再接続時のセッショントークン
}

export interface JoinRoomData {
  roomId: string;
}


