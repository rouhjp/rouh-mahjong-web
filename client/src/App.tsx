import { useState } from 'react';
import { useSocket } from './hooks/useSocket';
import './App.css';

function App() {
  const [displayName, setDisplayName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const {
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
  } = useSocket();

  const handleAuthenticate = () => {
    if (displayName.trim()) {
      authenticate(displayName.trim());
      setIsAuthenticated(true);
    }
  };

  const handleCreateRoom = () => {
    createRoom();
  };

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      joinRoom(roomId.trim());
    }
  };

  const handleToggleReady = () => {
    toggleReady();
  };

  const handleStartGame = () => {
    startGame();
  };

  const handleLeaveRoom = () => {
    leaveRoom();
  };

  if (!isConnected) {
    return (
      <div className="app">
        <h1>麻雀オンライン</h1>
        <p>サーバーに接続中...</p>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="app">
        <h1>麻雀オンライン</h1>
        <div className="auth-form">
          <h2>プレイヤー名を入力してください</h2>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="プレイヤー名"
            maxLength={20}
          />
          <button onClick={handleAuthenticate} disabled={!displayName.trim()}>
            ゲーム開始
          </button>
        </div>
      </div>
    );
  }

  if (!currentRoom) {
    return (
      <div className="app">
        <h1>麻雀オンライン</h1>
        <p>ようこそ、{currentUser.displayName}さん！</p>
        
        <div className="room-actions">
          <div className="create-room">
            <h3>新しいルームを作成</h3>
            <button onClick={handleCreateRoom}>ルーム作成</button>
          </div>
          
          <div className="join-room">
            <h3>既存のルームに参加</h3>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="ルームID（6桁）"
              maxLength={6}
            />
            <button onClick={handleJoinRoom} disabled={!roomId.trim()}>
              ルーム参加
            </button>
          </div>
        </div>
        
        {error && (
          <div className="error">
            <p>{error}</p>
            <button onClick={() => setError(null)}>閉じる</button>
          </div>
        )}
      </div>
    );
  }

  const currentPlayer = currentRoom.players.find(p => p.userId === currentUser.userId);
  const allPlayersReady = currentRoom.players.length === 4 && currentRoom.players.every(p => p.isReady);
  const isHost = currentPlayer?.isHost || false;

  return (
    <div className="app">
      <div className="room-header">
        <h1>麻雀オンライン - ルーム {currentRoom.roomId}</h1>
        <button onClick={handleLeaveRoom} className="leave-room-btn">
          ルーム退出
        </button>
      </div>
      
      <div className="room-info">
        <h2>プレイヤー ({currentRoom.players.length}/4)</h2>
        <div className="players-list">
          {currentRoom.players.map((player, index) => (
            <div key={player.userId} className={`player ${player.isReady ? 'ready' : ''} ${player.isHost ? 'host' : ''}`}>
              <span>座席{index + 1}: {player.displayName} {player.isHost ? '(ホスト)' : ''}</span>
              <span>{player.isReady ? '準備完了' : '準備中'}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="game-controls">
        <button 
          onClick={handleToggleReady}
          className={currentPlayer?.isReady ? 'ready' : ''}
        >
          {currentPlayer?.isReady ? '準備解除' : '準備完了'}
        </button>
        
        {allPlayersReady && isHost && !currentRoom.gameStarted && (
          <button onClick={handleStartGame} className="start-game-btn">
            ゲーム開始
          </button>
        )}
        
        {allPlayersReady && !isHost && !currentRoom.gameStarted && (
          <div className="game-start">
            <p>全員準備完了！ホストがゲームを開始するのを待っています...</p>
          </div>
        )}
        
        {currentRoom.gameStarted && (
          <div className="game-started">
            <p>ゲーム開始！</p>
          </div>
        )}
      </div>
      
      {error && (
        <div className="error">
          <p>{error}</p>
          <button onClick={() => setError(null)}>閉じる</button>
        </div>
      )}
    </div>
  );
}

export default App;
