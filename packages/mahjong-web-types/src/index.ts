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
  chatMessages: ChatMessage[]; // チャットメッセージ履歴
}

export interface AuthenticateData {
  displayName: string;
  userId?: string; // 再接続時のセッショントークン
}

export interface JoinRoomData {
  roomId: string;
}

export interface ChatMessage {
  id: string;          // メッセージID
  playerId: string;    // 送信者のuserID
  playerName: string;  // 送信者の表示名
  message: string;     // メッセージ内容
  timestamp: number;   // 送信時刻
}

export interface SendMessageData {
  message: string;
}