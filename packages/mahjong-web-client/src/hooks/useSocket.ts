import type { Room } from '../types/index.js';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useTableData } from './useTableData.js';
import { CallAction, GameEvent, TurnAction, DiscardGuide } from '@mahjong/core';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ userId: string; displayName: string } | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingTurnActions, setPendingTurnActions] = useState<TurnAction[] | null>(null);
  const [pendingCallActions, setPendingCallActions] = useState<CallAction[] | null>(null);
  const [showAcknowledgeButton, setShowAcknowledgeButton] = useState(false);
  
  // Integrate table data management
  const { tableData, handleGameEvent, resetTable, declarations, setDiscardGuides } = useTableData();

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      
      // 保存されたuserIdがあれば自動再認証を試行（手動認証がまだ行われていない場合のみ）
      const savedUserId = localStorage.getItem('mahjong-userId');
      const savedDisplayName = localStorage.getItem('mahjong-displayName');
      if (savedUserId && savedDisplayName && !currentUser) {
        console.log('Attempting reconnection with saved userId:', savedUserId);
        newSocket.emit('authenticate', { 
          displayName: savedDisplayName, 
          userId: savedUserId 
        });
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('authenticated', (data: { userId: string; displayName: string }) => {
      setCurrentUser(data);
      
      // userIdとdisplayNameをlocalStorageに保存
      localStorage.setItem('mahjong-userId', data.userId);
      localStorage.setItem('mahjong-displayName', data.displayName);
      console.log('Session saved:', data.userId);
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
      setCurrentRoom(prevRoom => {
        // If we transitioned from game started to not started, reset table
        if (prevRoom?.gameStarted && !data.room.gameStarted) {
          resetTable();
          console.log('Game ended, resetting table and returning to room');
        }
        return data.room;
      });
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

    newSocket.on('game-event', (data: { type: string; eventData: GameEvent | null }) => {
      if (data.eventData) {
        console.log(JSON.stringify(data.eventData, null, 2));
      }
      if (data.eventData !== null && data.eventData !== undefined) {
        handleGameEvent(data.eventData as GameEvent);
      }
    });

    newSocket.on('turn-action-request', (data: { choices: TurnAction[], guides?: DiscardGuide[] }) => {
      console.log('Turn action request received:', data);
      setPendingTurnActions(data.choices);
      setDiscardGuides(data.guides || null);
    });

    newSocket.on('call-action-request', (data: { choices: CallAction[] }) => {
      console.log('Call action request received:', data);
      setPendingCallActions(data.choices);
    });

    newSocket.on('acknowledge-request', () => {
      console.log('Acknowledge request received');
      setShowAcknowledgeButton(true);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [handleGameEvent, resetTable]);

  const authenticate = (displayName: string) => {
    if (socket) {
      const savedDisplayName = localStorage.getItem('mahjong-displayName');
      
      // 手動認証の場合、保存されたdisplayNameと異なる場合は新しいセッションを作成
      if (savedDisplayName && savedDisplayName !== displayName) {
        console.log(`Display name changed from ${savedDisplayName} to ${displayName}, creating new session`);
        socket.emit('authenticate', { 
          displayName,
          userId: undefined // 新しいセッションを強制
        });
      } else {
        // 同じdisplayNameなら保存されたuserIdを使用（再接続）
        const savedUserId = localStorage.getItem('mahjong-userId');
        socket.emit('authenticate', { 
          displayName,
          userId: savedUserId || undefined
        });
      }
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


  const sendGameAction = (action: TurnAction | CallAction) => {
    if (socket) {
      socket.emit('game-action', { action });
      // Clear pending actions after sending
      setPendingTurnActions(null);
      setPendingCallActions(null);
    }
  };

  const addBot = () => {
    if (socket) {
      socket.emit('add-bot');
    }
  };

  const removeBot = (userId: string) => {
    if (socket) {
      socket.emit('remove-bot', { userId });
    }
  };

  const sendAcknowledge = () => {
    if (socket) {
      socket.emit('game-acknowledge');
      setShowAcknowledgeButton(false);
    }
  };

  const resetRoomAfterGame = () => {
    if (socket) {
      socket.emit('reset-room-after-game');
    }
  };

  return {
    isConnected,
    currentUser,
    currentRoom,
    error,
    pendingTurnActions,
    pendingCallActions,
    showAcknowledgeButton,
    tableData,
    declarations,
    authenticate,
    createRoom,
    joinRoom,
    toggleReady,
    startGame,
    leaveRoom,
    sendGameAction,
    sendAcknowledge,
    addBot,
    removeBot,
    setError,
    resetRoomAfterGame
  };
};