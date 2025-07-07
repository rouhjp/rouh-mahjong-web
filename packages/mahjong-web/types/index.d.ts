export interface WebPlayer {
    userId: string;
    displayName: string;
    socketId: string;
    isReady: boolean;
    isHost: boolean;
}
export interface Room {
    roomId: string;
    players: WebPlayer[];
    maxPlayers: number;
    createdAt: number;
    gameStarted: boolean;
    chatMessages: ChatMessage[];
}
export interface AuthenticateData {
    displayName: string;
}
export interface JoinRoomData {
    roomId: string;
}
export interface ChatMessage {
    id: string;
    playerId: string;
    playerName: string;
    message: string;
    timestamp: number;
}
export interface SendMessageData {
    message: string;
}
//# sourceMappingURL=index.d.ts.map