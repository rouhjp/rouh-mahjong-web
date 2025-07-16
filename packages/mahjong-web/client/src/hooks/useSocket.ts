import type { Room, ChatMessage, TurnAction, CallAction, GameEvent } from '../types';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useTableData } from './useTableData';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ userId: string; displayName: string } | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [pendingTurnActions, setPendingTurnActions] = useState<TurnAction[] | null>(null);
  const [pendingCallActions, setPendingCallActions] = useState<CallAction[] | null>(null);
  const [showAcknowledgeButton, setShowAcknowledgeButton] = useState(false);
  
  // Integrate table data management
  const { tableData, handleGameEvent, resetTable, declarations } = useTableData();

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
    newSocket.on('game-event', (data: { type: string; eventData: GameEvent | null }) => {
      // Add game events as special chat messages with JSON display
      const gameMessage: ChatMessage = {
        id: `game-${Date.now()}-${Math.random()}`,
        playerId: 'system',
        playerName: 'システム',
        message: data.eventData ? JSON.stringify(data.eventData, null, 2) : 'No event data',
        timestamp: Date.now()
      };
      if (data.eventData) {
        console.log(JSON.stringify(data.eventData, null, 2));
      }
      setChatMessages(prev => [...prev, gameMessage]);
      
      // Handle game event directly
      if (data.eventData !== null && data.eventData !== undefined) {
        handleGameEvent(data.eventData as GameEvent);
      }
    });

    newSocket.on('turn-action-request', (choices: TurnAction[]) => {
      console.log('Turn action request received:', choices);
      setPendingTurnActions(choices);
      
      // Add action request as a chat message
      const actionMessage: ChatMessage = {
        id: `turn-action-${Date.now()}-${Math.random()}`,
        playerId: 'system',
        playerName: 'システム',
        message: `turn action select: ${JSON.stringify(choices, null, 2)}`,
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, actionMessage]);
    });

    newSocket.on('call-action-request', (choices: CallAction[]) => {
      console.log('Call action request received:', choices);
      setPendingCallActions(choices);
      
      // Add action request as a chat message
      const actionMessage: ChatMessage = {
        id: `call-action-${Date.now()}-${Math.random()}`,
        playerId: 'system',
        playerName: 'システム',
        message: `call action select: ${JSON.stringify(choices, null, 2)}`,
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, actionMessage]);
    });

    // Handle acknowledge request
    newSocket.on('acknowledge-request', () => {
      console.log('Acknowledge request received');
      setShowAcknowledgeButton(true);
      
      // Add acknowledge request as a chat message
      const acknowledgeMessage: ChatMessage = {
        id: `acknowledge-${Date.now()}-${Math.random()}`,
        playerId: 'system',
        playerName: 'システム',
        message: '局結果を確認してください - OKボタンを押してください',
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, acknowledgeMessage]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [handleGameEvent]);

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

  const sendAcknowledge = () => {
    if (socket) {
      socket.emit('game-acknowledge');
      setShowAcknowledgeButton(false);
      
      // Add acknowledge sent message
      const acknowledgeMessage: ChatMessage = {
        id: `acknowledge-sent-${Date.now()}-${Math.random()}`,
        playerId: 'system',
        playerName: 'システム',
        message: 'OK確認を送信しました',
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, acknowledgeMessage]);
    }
  };

  const resetRoomAfterGame = () => {
    if (socket) {
      socket.emit('reset-room-after-game');
    }
  };

  return {
    socket,
    isConnected,
    currentUser,
    currentRoom,
    error,
    chatMessages,
    pendingTurnActions,
    pendingCallActions,
    showAcknowledgeButton,
    tableData,
    resetTable,
    declarations,
    authenticate,
    createRoom,
    joinRoom,
    toggleReady,
    startGame,
    leaveRoom,
    sendMessage,
    sendGameAction,
    sendAcknowledge,
    addBot,
    setError,
    resetRoomAfterGame
  };
};