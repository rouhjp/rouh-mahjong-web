import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { RoomManager } from './managers/RoomManager';
import { Player, AuthenticateData, JoinRoomData } from './types';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"]
  }
});

const roomManager = new RoomManager();
const connectedUsers = new Map<string, { userId: string; displayName: string }>(); // socketId -> user info

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('authenticate', (data: AuthenticateData) => {
    const { displayName } = data;
    const userId = uuidv4();
    
    connectedUsers.set(socket.id, { userId, displayName });
    
    socket.emit('authenticated', { userId, displayName });
    console.log(`User authenticated: ${displayName} (${userId})`);
  });

  socket.on('create-room', () => {
    const userInfo = connectedUsers.get(socket.id);
    if (!userInfo) {
      socket.emit('join-error', { message: 'ユーザー認証が必要です' });
      return;
    }

    const room = roomManager.createRoom();
    socket.emit('room-created', { roomId: room.roomId });
    console.log(`Room created: ${room.roomId}`);
  });

  socket.on('join-room', (data: JoinRoomData) => {
    const { roomId } = data;
    const userInfo = connectedUsers.get(socket.id);
    
    if (!userInfo) {
      socket.emit('join-error', { message: 'ユーザー認証が必要です' });
      return;
    }

    const room = roomManager.getRoom(roomId);
    if (!room) {
      socket.emit('join-error', { message: 'ルームが見つかりません' });
      return;
    }

    if (room.players.length >= room.maxPlayers) {
      socket.emit('join-error', { message: 'ルームが満員です' });
      return;
    }

    const player: Player = {
      userId: userInfo.userId,
      displayName: userInfo.displayName,
      socketId: socket.id,
      isReady: false,
      isHost: false
    };

    const success = roomManager.addPlayerToRoom(roomId, player);
    if (!success) {
      socket.emit('join-error', { message: 'ルームへの参加に失敗しました' });
      return;
    }

    socket.join(roomId);
    socket.emit('room-joined', { room });
    
    // Notify all players in the room
    io.to(roomId).emit('room-update', { room });
    console.log(`User ${userInfo.displayName} joined room ${roomId}`);
  });

  socket.on('toggle-ready', () => {
    const userInfo = connectedUsers.get(socket.id);
    if (!userInfo) return;

    const room = roomManager.getRoomBySocketId(socket.id);
    if (!room) return;

    const player = room.players.find(p => p.userId === userInfo.userId);
    if (!player) return;

    const newReadyState = !player.isReady;
    roomManager.updatePlayerReady(room.roomId, userInfo.userId, newReadyState);
    
    io.to(room.roomId).emit('room-update', { room });
    console.log(`Player ${player.displayName} ready state: ${newReadyState}`);

    if (roomManager.areAllPlayersReady(room.roomId)) {
      io.to(room.roomId).emit('all-players-ready');
      console.log(`All players ready in room ${room.roomId}`);
    }
  });

  socket.on('start-game', () => {
    const userInfo = connectedUsers.get(socket.id);
    if (!userInfo) return;

    const room = roomManager.getRoomBySocketId(socket.id);
    if (!room) return;

    const player = room.players.find(p => p.userId === userInfo.userId);
    if (!player || !player.isHost) {
      socket.emit('join-error', { message: 'ホストのみがゲームを開始できます' });
      return;
    }

    if (room.players.length !== 4) {
      socket.emit('join-error', { message: '4人揃ってからゲームを開始してください' });
      return;
    }

    if (!roomManager.areAllPlayersReady(room.roomId)) {
      socket.emit('join-error', { message: '全員の準備が完了してからゲームを開始してください' });
      return;
    }

    room.gameStarted = true;
    io.to(room.roomId).emit('game-started', { room });
    console.log(`Game started in room ${room.roomId}`);
  });

  socket.on('leave-room', () => {
    const userInfo = connectedUsers.get(socket.id);
    if (!userInfo) return;

    const room = roomManager.getRoomBySocketId(socket.id);
    if (!room) return;

    roomManager.removePlayerFromRoom(room.roomId, userInfo.userId);
    socket.leave(room.roomId);
    
    // Notify the user that they left
    socket.emit('room-left');
    
    // Notify remaining players in the room
    socket.to(room.roomId).emit('room-update', { room });
    console.log(`User ${userInfo.displayName} left room ${room.roomId}`);
  });

  socket.on('disconnect', () => {
    const userInfo = connectedUsers.get(socket.id);
    if (userInfo) {
      const room = roomManager.getRoomBySocketId(socket.id);
      if (room) {
        roomManager.removePlayerFromRoom(room.roomId, userInfo.userId);
        socket.to(room.roomId).emit('room-update', { room });
        console.log(`User ${userInfo.displayName} left room ${room.roomId}`);
      }
      connectedUsers.delete(socket.id);
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});