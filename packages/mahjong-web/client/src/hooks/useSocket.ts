import type { Room, ChatMessage, TurnAction, CallAction } from '../types';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ userId: string; displayName: string } | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [pendingAction, setPendingAction] = useState<{
    type: 'turn' | 'call';
    choices: TurnAction[] | CallAction[];
    message: string;
  } | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('authenticated', (data: { userId: string; displayName: string }) => {
      setCurrentUser(data);
    });

    newSocket.on('room-created', (data: { roomId: string }) => {
      console.log('Room created:', data.roomId);
      // Automatically join the created room
      newSocket.emit('join-room', { roomId: data.roomId });
    });

    newSocket.on('room-joined', (data: { room: Room }) => {
      setCurrentRoom(data.room);
      setError(null);
    });

    newSocket.on('room-update', (data: { room: Room }) => {
      setCurrentRoom(data.room);
    });

    newSocket.on('all-players-ready', () => {
      console.log('All players are ready!');
    });

    newSocket.on('game-started', (data: { room: Room }) => {
      console.log('Game started!', data.room);
      setCurrentRoom(data.room);
      setChatMessages(data.room.chatMessages || []);
    });

    newSocket.on('room-left', () => {
      setCurrentRoom(null);
      setError(null);
    });

    newSocket.on('join-error', (data: { message: string }) => {
      setError(data.message);
    });

    newSocket.on('chat-message', (data: { message: ChatMessage }) => {
      setChatMessages(prev => [...prev, data.message]);
    });

    // Game event handlers
    newSocket.on('game-event', (data: { type: string; message: string; eventData: any }) => {
      console.log('Game event received:', data);
      // Add game events as special chat messages
      const gameMessage: ChatMessage = {
        id: `game-${Date.now()}-${Math.random()}`,
        playerId: 'system',
        playerName: 'ゲーム',
        message: data.message,
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, gameMessage]);
    });

    newSocket.on('action-request', (data: { type: 'turn' | 'call'; choices: TurnAction[] | CallAction[]; message: string }) => {
      console.log('Action request received:', data);
      setPendingAction(data);
      
      // Also add action request as a chat message
      const actionMessage: ChatMessage = {
        id: `action-${Date.now()}-${Math.random()}`,
        playerId: 'system',
        playerName: 'システム',
        message: data.message,
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, actionMessage]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const authenticate = (displayName: string) => {
    if (socket) {
      socket.emit('authenticate', { displayName });
    }
  };

  const createRoom = () => {
    if (socket) {
      socket.emit('create-room');
    }
  };

  const joinRoom = (roomId: string) => {
    if (socket) {
      socket.emit('join-room', { roomId });
    }
  };

  const toggleReady = () => {
    if (socket) {
      socket.emit('toggle-ready');
    }
  };

  const startGame = () => {
    if (socket) {
      socket.emit('start-game');
    }
  };

  const leaveRoom = () => {
    if (socket) {
      socket.emit('leave-room');
    }
  };

  const sendMessage = (message: string) => {
    if (socket && message.trim()) {
      socket.emit('send-message', { message: message.trim() });
    }
  };

  const sendGameAction = (action: TurnAction | CallAction) => {
    if (socket) {
      socket.emit('game-action', { action });
      setPendingAction(null); // Clear pending action after sending
    }
  };

  return {
    socket,
    isConnected,
    currentUser,
    currentRoom,
    error,
    chatMessages,
    pendingAction,
    authenticate,
    createRoom,
    joinRoom,
    toggleReady,
    startGame,
    leaveRoom,
    sendMessage,
    sendGameAction,
    setError
  };
};