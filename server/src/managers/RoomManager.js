"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
class RoomManager {
    constructor() {
        this.rooms = new Map();
    }
    generateRoomId() {
        let roomId;
        do {
            roomId = Math.floor(100000 + Math.random() * 900000).toString();
        } while (this.rooms.has(roomId));
        return roomId;
    }
    createRoom() {
        const roomId = this.generateRoomId();
        const room = {
            roomId,
            players: [],
            maxPlayers: 4,
            createdAt: Date.now(),
            gameStarted: false
        };
        this.rooms.set(roomId, room);
        return room;
    }
    getRoom(roomId) {
        return this.rooms.get(roomId);
    }
    addPlayerToRoom(roomId, player) {
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
    removePlayerFromRoom(roomId, userId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return false;
        const initialLength = room.players.length;
        const removedPlayer = room.players.find(p => p.userId === userId);
        room.players = room.players.filter(p => p.userId !== userId);
        // If host left and there are still players, make the first remaining player the new host
        if ((removedPlayer === null || removedPlayer === void 0 ? void 0 : removedPlayer.isHost) && room.players.length > 0) {
            room.players[0].isHost = true;
        }
        if (room.players.length === 0) {
            this.rooms.delete(roomId);
        }
        return room.players.length < initialLength;
    }
    updatePlayerReady(roomId, userId, isReady) {
        const room = this.rooms.get(roomId);
        if (!room)
            return false;
        const player = room.players.find(p => p.userId === userId);
        if (!player)
            return false;
        player.isReady = isReady;
        return true;
    }
    areAllPlayersReady(roomId) {
        const room = this.rooms.get(roomId);
        if (!room || room.players.length < 4)
            return false;
        return room.players.every(p => p.isReady);
    }
    getRoomBySocketId(socketId) {
        for (const room of this.rooms.values()) {
            if (room.players.some(p => p.socketId === socketId)) {
                return room;
            }
        }
        return undefined;
    }
    updatePlayerSocketId(userId, newSocketId) {
        for (const room of this.rooms.values()) {
            const player = room.players.find(p => p.userId === userId);
            if (player) {
                player.socketId = newSocketId;
                return true;
            }
        }
        return false;
    }
}
exports.RoomManager = RoomManager;
