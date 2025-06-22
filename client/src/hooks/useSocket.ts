import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Room } from '../types';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ userId: string; displayName: string } | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    });

    newSocket.on('room-left', () => {
      setCurrentRoom(null);
      setError(null);
    });

    newSocket.on('join-error', (data: { message: string }) => {
      setError(data.message);
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

  return {
    socket,
    isConnected,
    currentUser,
    currentRoom,
    error,
    authenticate,
    createRoom,
    joinRoom,
    toggleReady,
    startGame,
    leaveRoom,
    setError
  };
};