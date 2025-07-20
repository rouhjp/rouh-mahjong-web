import { useSocket } from './hooks/useSocket.js';
import type { TurnAction, CallAction } from '@mahjong/core';
import { ConnectingScreen } from './components/screens/ConnectingScreen.js';
import { AuthScreen } from './components/screens/AuthScreen.js';
import { LobbyScreen } from './components/screens/LobbyScreen.js';
import { RoomScreen } from './components/screens/RoomScreen.js';
import { GameScreen } from './components/screens/GameScreen.js';

function App() {
  const {
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
  } = useSocket();

  const handleSelectTurnAction = (action: TurnAction) => {
    sendGameAction(action);
  };

  const handleSelectCallAction = (action: CallAction) => {
    sendGameAction(action);
  };

  const handleGameResultClick = () => {
    resetRoomAfterGame();
  };

  const handleClearError = () => {
    setError(null);
  };

  // 接続中画面
  if (!isConnected) {
    return <ConnectingScreen />;
  }

  // 認証画面
  if (!currentUser) {
    return <AuthScreen onAuthenticate={authenticate} />;
  }

  // ロビー画面
  if (!currentRoom) {
    return (
      <LobbyScreen
        currentUser={currentUser}
        error={error}
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
        onClearError={handleClearError}
      />
    );
  }

  // ゲーム画面
  if (currentRoom.gameStarted) {
    return (
      <GameScreen
        currentRoom={currentRoom}
        tableData={tableData}
        pendingTurnActions={pendingTurnActions}
        pendingCallActions={pendingCallActions}
        showAcknowledgeButton={showAcknowledgeButton}
        declarations={declarations}
        error={error}
        onSelectTurnAction={handleSelectTurnAction}
        onSelectCallAction={handleSelectCallAction}
        onAcknowledge={sendAcknowledge}
        onGameResultClick={handleGameResultClick}
        onLeaveRoom={leaveRoom}
        onClearError={handleClearError}
      />
    );
  }

  // ルーム画面
  return (
    <RoomScreen
      currentUser={currentUser}
      currentRoom={currentRoom}
      error={error}
      onToggleReady={toggleReady}
      onStartGame={startGame}
      onLeaveRoom={leaveRoom}
      onAddBot={addBot}
      onRemoveBot={removeBot}
      onClearError={handleClearError}
    />
  );
}

export default App;
