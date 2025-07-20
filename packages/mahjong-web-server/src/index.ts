import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { RoomManager } from './managers/RoomManager.js';
import { GameManager } from './managers/GameManager.js';
import { WebPlayer, AuthenticateData, JoinRoomData, SendMessageData, ChatMessage } from '@mahjong/web-types';
import type { TurnAction, CallAction } from '@mahjong/core';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.CORS_ORIGIN?.split(',') ?? false
        : ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ["GET", "POST"],
    credentials: true,
  }
});

const roomManager = new RoomManager();
const gameManager = new GameManager(io);
const connectedUsers = new Map<string, { userId: string; displayName: string }>(); // socketId -> user info
const userSessions = new Map<string, { socketId: string; displayName: string }>(); // userId -> session info

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('authenticate', (data: AuthenticateData) => {
    const { displayName, userId: providedUserId } = data;
    
    // 再接続の場合
    if (providedUserId && userSessions.has(providedUserId)) {
      const existingSession = userSessions.get(providedUserId)!;
      const oldSocketId = existingSession.socketId;
      
      // 既存の接続を切断
      const oldSocket = io.sockets.sockets.get(oldSocketId);
      if (oldSocket) {
        oldSocket.disconnect(true);
        connectedUsers.delete(oldSocketId);
      }
      
      // 新しいsocketで再接続
      connectedUsers.set(socket.id, { userId: providedUserId, displayName });
      userSessions.set(providedUserId, { socketId: socket.id, displayName });
      
      // ルームとゲームの状態を更新
      let room = roomManager.getRoomByUserId(providedUserId);
      let reconnectedPlayer: any = null;
      
      // 通常のルームにいない場合、切断状態のプレイヤーをチェック
      if (!room) {
        const disconnectedRoomId = roomManager.findDisconnectedPlayerRoom(providedUserId);
        if (disconnectedRoomId) {
          reconnectedPlayer = roomManager.reconnectPlayer(disconnectedRoomId, providedUserId, socket.id);
          room = roomManager.getRoom(disconnectedRoomId);
          
          if (reconnectedPlayer && room) {
            // 再接続通知をルームに送信
            socket.to(disconnectedRoomId).emit('player-reconnected', { 
              userId: providedUserId, 
              displayName: displayName 
            });
            console.log(`Player ${displayName} reconnected from disconnected state in room ${disconnectedRoomId}`);
          }
        }
      }
      
      if (room) {
        // 通常の再接続処理
        if (!reconnectedPlayer) {
          roomManager.updatePlayerSocketId(room.roomId, providedUserId, socket.id);
        }
        
        if (room.gameStarted) {
          gameManager.updatePlayerSocket(providedUserId, socket);
        }
        
        // 現在の状態を送信
        socket.emit('room-joined', room);
        if (room.gameStarted) {
          // ゲーム中の場合、game-startedイベントでルーム情報を送信
          socket.emit('game-started', { room });
          console.log(`Sent game-started event for reconnected user ${providedUserId} in room ${room.roomId}`);
        }
        
        // ルーム更新通知
        socket.to(room.roomId).emit('room-update', { room });
      }
      
      socket.emit('authenticated', { userId: providedUserId, displayName });
      console.log(`User reconnected: ${displayName} (${providedUserId})`);
    } else if (providedUserId) {
      // 無効なuserIdが提供された場合
      console.log(`Invalid userId provided for reconnection: ${providedUserId}, creating new session`);
      const userId = uuidv4();
      
      connectedUsers.set(socket.id, { userId, displayName });
      userSessions.set(userId, { socketId: socket.id, displayName });
      
      socket.emit('authenticated', { userId, displayName });
      console.log(`User authenticated with new session: ${displayName} (${userId})`);
    } else {
      // 新規接続の場合
      const userId = uuidv4();
      
      connectedUsers.set(socket.id, { userId, displayName });
      userSessions.set(userId, { socketId: socket.id, displayName });
      
      socket.emit('authenticated', { userId, displayName });
      console.log(`User authenticated: ${displayName} (${userId})`);
    }
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

    const player: WebPlayer = {
      userId: userInfo.userId,
      displayName: userInfo.displayName,
      socketId: socket.id,
      isReady: false,
      isHost: false,
      isBot: false
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

  socket.on('start-game', async () => {
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

    // Start the actual mahjong game
    try {
      await gameManager.startGame(room.roomId, room.players, connectedUsers);
    } catch (error) {
      console.error(`Failed to start game in room ${room.roomId}:`, error);
      socket.emit('join-error', { 
        message: `ゲーム開始に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}` 
      });
    }
  });

  socket.on('send-message', (data: SendMessageData) => {
    const userInfo = connectedUsers.get(socket.id);
    if (!userInfo) return;

    const room = roomManager.getRoomBySocketId(socket.id);
    if (!room || !room.gameStarted) return;

    const chatMessage: ChatMessage = {
      id: uuidv4(),
      playerId: userInfo.userId,
      playerName: userInfo.displayName,
      message: data.message,
      timestamp: Date.now()
    };

    roomManager.addChatMessage(room.roomId, chatMessage);
    io.to(room.roomId).emit('chat-message', { message: chatMessage });
    console.log(`Chat message in room ${room.roomId}: ${userInfo.displayName}: ${data.message}`);
  });

  // Game action handlers
  socket.on('game-action', (data: { action: TurnAction | CallAction }) => {
    console.log(`Game action received from ${socket.id}:`, data.action);
    // This will be handled by WebSocketPlayer class
  });

  socket.on('add-bot', () => {
    const userInfo = connectedUsers.get(socket.id);
    if (!userInfo) {
      socket.emit('join-error', { message: 'ユーザー認証が必要です' });
      return;
    }

    const room = roomManager.getRoomBySocketId(socket.id);
    if (!room) {
      socket.emit('join-error', { message: 'ルームが見つかりません' });
      return;
    }

    const player = room.players.find(p => p.userId === userInfo.userId);
    if (!player || !player.isHost) {
      socket.emit('join-error', { message: 'ホストのみがボットを追加できます' });
      return;
    }

    if (room.players.length >= 4) {
      socket.emit('join-error', { message: 'ルームが満員です' });
      return;
    }

    if (room.gameStarted) {
      socket.emit('join-error', { message: 'ゲーム開始後はボットを追加できません' });
      return;
    }

    // Create bot player
    const botNames = ['NPCボット1', 'NPCボット2', 'NPCボット3', 'NPCボット4'];
    const usedNames = room.players.map(p => p.displayName);
    const availableName = botNames.find(name => !usedNames.includes(name)) || `NPCボット${room.players.length + 1}`;

    const botPlayer: WebPlayer = {
      userId: uuidv4(),
      displayName: availableName,
      socketId: `bot-${uuidv4()}`, // Unique socket ID for bot
      isReady: true, // Bots are always ready
      isHost: false,
      isBot: true
    };

    const success = roomManager.addPlayerToRoom(room.roomId, botPlayer);
    if (!success) {
      socket.emit('join-error', { message: 'ボットの追加に失敗しました' });
      return;
    }

    // Notify all players in the room
    io.to(room.roomId).emit('room-update', { room });
    console.log(`Bot ${botPlayer.displayName} added to room ${room.roomId}`);
  });

  socket.on('remove-bot', (data: { userId: string }) => {
    const userInfo = connectedUsers.get(socket.id);
    if (!userInfo) {
      socket.emit('join-error', { message: 'ユーザー認証が必要です' });
      return;
    }

    const room = roomManager.getRoomBySocketId(socket.id);
    if (!room) {
      socket.emit('join-error', { message: 'ルームが見つかりません' });
      return;
    }

    const player = room.players.find(p => p.userId === userInfo.userId);
    if (!player || !player.isHost) {
      socket.emit('join-error', { message: 'ホストのみがボットを削除できます' });
      return;
    }

    if (room.gameStarted) {
      socket.emit('join-error', { message: 'ゲーム開始後はボットを削除できません' });
      return;
    }

    // Find the target bot
    const targetBot = room.players.find(p => p.userId === data.userId);
    if (!targetBot) {
      socket.emit('join-error', { message: '指定されたボットが見つかりません' });
      return;
    }

    if (!targetBot.isBot) {
      socket.emit('join-error', { message: '指定されたプレイヤーはボットではありません' });
      return;
    }

    // Remove the bot from the room
    const success = roomManager.removePlayerFromRoom(room.roomId, data.userId);
    if (!success) {
      socket.emit('join-error', { message: 'ボットの削除に失敗しました' });
      return;
    }

    // Notify all players in the room
    io.to(room.roomId).emit('room-update', { room });
    console.log(`Bot ${targetBot.displayName} removed from room ${room.roomId}`);
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
    
    // Notify remaining players in the room (only if room still exists)
    if (roomManager.hasRealPlayers(room.roomId)) {
      socket.to(room.roomId).emit('room-update', { room });
    }
    
    console.log(`User ${userInfo.displayName} left room ${room.roomId}`);
  });

  socket.on('reset-room-after-game', () => {
    const userInfo = connectedUsers.get(socket.id);
    if (!userInfo) return;

    const room = roomManager.getRoomBySocketId(socket.id);
    if (!room) return;

    const success = roomManager.resetRoomAfterGame(room.roomId);
    if (success) {
      // Get updated room and notify all players
      const updatedRoom = roomManager.getRoom(room.roomId);
      if (updatedRoom) {
        io.to(room.roomId).emit('room-update', { room: updatedRoom });
        console.log(`Room ${room.roomId} reset after game completion`);
      }
    }
  });

  socket.on('disconnect', () => {
    const userInfo = connectedUsers.get(socket.id);
    if (userInfo) {
      const room = roomManager.getRoomBySocketId(socket.id);
      if (room) {
        // ゲーム中の場合は切断状態にマーク、そうでなければ削除
        if (gameManager.isGameActive(room.roomId)) {
          // ゲーム中は切断状態にマーク（5分後に自動削除）
          const marked = roomManager.markPlayerAsDisconnected(room.roomId, userInfo.userId);
          if (marked) {
            gameManager.handlePlayerDisconnect(room.roomId, socket.id);
            // 切断通知をルームに送信
            socket.to(room.roomId).emit('player-disconnected', { 
              userId: userInfo.userId, 
              displayName: userInfo.displayName,
              reconnectTimeoutMs: 5 * 60 * 1000 
            });
            console.log(`User ${userInfo.displayName} marked as disconnected in room ${room.roomId} (game active)`);
          }
        } else {
          // ゲーム中でない場合は従来通り削除
          roomManager.removePlayerFromRoom(room.roomId, userInfo.userId);
          console.log(`User ${userInfo.displayName} removed from room ${room.roomId} (game not active)`);
        }
        
        // ルームが存在し、実プレイヤーがいる場合は更新通知
        const updatedRoom = roomManager.getRoom(room.roomId);
        if (updatedRoom && roomManager.hasActiveOrDisconnectedRealPlayers(room.roomId)) {
          socket.to(room.roomId).emit('room-update', { room: updatedRoom });
        }
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