import { useState, useRef, useEffect } from 'react';
import { useSocket } from './hooks/useSocket';
import type { TurnAction, CallAction } from './types';
import { TileInfo } from './types';
import { Table } from './components/table';
import { getActionChoices } from './utils/gameEventToTableData';

function App() {
  const [displayName, setDisplayName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'table' | 'chat'>('table');
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    isConnected,
    currentUser,
    currentRoom,
    error,
    chatMessages,
    pendingAction,
    tableData,
    authenticate,
    createRoom,
    joinRoom,
    toggleReady,
    startGame,
    leaveRoom,
    sendMessage,
    sendGameAction,
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


  const handleGameAction = (actionIndex: number) => {
    if (pendingAction && pendingAction.choices[actionIndex]) {
      sendGameAction(pendingAction.choices[actionIndex]);
    }
  };

  const handleTableAction = (actionText: string) => {
    if (pendingAction) {
      const actionIndex = getActionChoices(pendingAction).indexOf(actionText);
      if (actionIndex !== -1) {
        handleGameAction(actionIndex);
      }
    }
  };

  const handleTileClick = (tile: any) => {
    if (pendingAction) {
      // Discardアクションを探す
      const discardActions = pendingAction.choices.filter((choice: any) => choice.type === 'Discard');
      const matchingAction = discardActions.find((action: any) => action.tile === tile);
      
      if (matchingAction) {
        sendGameAction(matchingAction);
      }
    }
  };

  const getActionLabel = (action: TurnAction | CallAction): string => {
    switch (action.type) {
      case 'Tsumo':
        return 'ツモ';
      case 'NineTiles':
        return '九種九牌';
      case 'AddQuad':
        return `加カン(${TileInfo[action.tile].code})`;
      case 'SelfQuad':
        return `暗カン(${TileInfo[action.tile].code})`;
      case 'Discard':
        return `切る(${TileInfo[action.tile].code})${action.ready ? ' リーチ' : ''}`;
      case 'Ron':
        return 'ロン';
      case 'Chi':
        return `チー(${action.baseTiles.map(t => TileInfo[t].code).join('')})`;
      case 'Pon':
        return `ポン(${action.baseTiles.map(t => TileInfo[t].code).join('')})`;
      case 'Kan':
        return 'カン';
      case 'Pass':
        return 'パス';
      default:
        return 'アクション';
    }
  };

  const scrollToBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  useEffect(() => {
    if (chatMessages.length > 0) {
      scrollToBottom();
    }
  }, [chatMessages]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">麻雀オンライン</h1>
          <p className="text-gray-600">サーバーに接続中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">麻雀オンライン</h1>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              プレイヤー名を入力してください
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="プレイヤー名"
                maxLength={20}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button 
                onClick={handleAuthenticate} 
                disabled={!displayName.trim()}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                ゲーム開始
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">麻雀オンライン</h1>
            <p className="text-lg text-gray-600">ようこそ、{currentUser.displayName}さん！</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                新しいルームを作成
              </h3>
              <button 
                onClick={handleCreateRoom}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-medium hover:bg-green-700 transition-colors"
              >
                ルーム作成
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                既存のルームに参加
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="ルームID（6桁）"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button 
                  onClick={handleJoinRoom} 
                  disabled={!roomId.trim()}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  ルーム参加
                </button>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <p className="text-red-700">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentPlayer = currentRoom.players.find(p => p.userId === currentUser.userId);
  const allPlayersReady = currentRoom.players.length === 4 && currentRoom.players.every(p => p.isReady);
  const isHost = currentPlayer?.isHost || false;

  // ゲーム開始後はチャット画面を表示
  if (currentRoom.gameStarted) {
    return (
      <div className="h-screen bg-gray-50 p-4 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold text-gray-900">
              麻雀オンライン - ルーム {currentRoom.roomId}
            </h1>
            <button 
              onClick={handleLeaveRoom} 
              className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              ルーム退出
            </button>
          </div>
          
          {/* プレイヤー情報エリア */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              プレイヤー ({currentRoom.players.length}/4)
            </h2>
            <div className="grid grid-cols-4 gap-3">
              {currentRoom.players.map((player, index) => (
                <div 
                  key={player.userId} 
                  className={`flex flex-col p-3 rounded-lg border-2 ${
                    player.isHost 
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <span className="font-medium text-gray-800 text-sm">
                    座席{index + 1}: {player.displayName} {player.isHost ? '(ホスト)' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* タブナビゲーション */}
          <div className="bg-white rounded-lg shadow-md mb-4 flex-shrink-0">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('table')}
                className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                  activeTab === 'table'
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                麻雀テーブル
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                  activeTab === 'chat'
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                チャット
              </button>
            </div>
          </div>

          {/* メインコンテンツエリア */}
          <div className="bg-white rounded-lg shadow-md p-4 flex-1 flex flex-col min-h-0">
            {activeTab === 'table' ? (
              /* 麻雀テーブル */
              <div className="flex-1 flex justify-center items-center overflow-hidden">
                <Table 
                  table={tableData} 
                  choices={getActionChoices(pendingAction)} 
                  onActionClick={handleTableAction}
                  onTileClick={handleTileClick}
                  pendingAction={pendingAction}
                />
              </div>
            ) : (
              /* チャットエリア */
              <div className="flex-1 flex flex-col min-h-0">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">チャット</h2>
                
                {/* メッセージ表示エリア */}
                <div className="flex-1 overflow-y-auto mb-4 border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-0">
                  <div className="space-y-3">
                    {chatMessages.map((message) => {
                      const isSystemMessage = message.playerId === 'system';
                      return (
                        <div key={message.id} className="flex flex-col">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-sm font-medium ${
                              isSystemMessage ? 'text-blue-700' : 'text-gray-700'
                            }`}>
                              {message.playerName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className={`rounded-lg p-3 shadow-sm ${
                            isSystemMessage 
                              ? 'bg-blue-50 border border-blue-200' 
                              : 'bg-white'
                          }`}>
                            <p className={`${
                              isSystemMessage ? 'text-blue-800' : 'text-gray-800'
                            }`}>
                              {message.message}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatMessagesEndRef} />
                  </div>
                </div>

                {/* ゲームアクション選択エリア */}
                {pendingAction && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="text-sm font-medium text-yellow-800 mb-2">アクション選択</h3>
                    <div className="flex flex-wrap gap-2">
                      {pendingAction.choices.map((choice, index) => {
                        const actionLabel = getActionLabel(choice);
                        return (
                          <button
                            key={index}
                            onClick={() => handleGameAction(index)}
                            className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors"
                          >
                            {actionLabel}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <div className="flex justify-between items-center">
                <p className="text-red-700">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">
            麻雀オンライン - ルーム {currentRoom.roomId}
          </h1>
          <button 
            onClick={handleLeaveRoom} 
            className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            ルーム退出
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            プレイヤー ({currentRoom.players.length}/4)
          </h2>
          <div className="space-y-3">
            {currentRoom.players.map((player, index) => (
              <div 
                key={player.userId} 
                className={`flex justify-between items-center p-4 rounded-lg border-2 ${
                  player.isHost && player.isReady 
                    ? 'border-cyan-500 bg-cyan-50' 
                    : player.isHost 
                    ? 'border-blue-500 bg-blue-50'
                    : player.isReady 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 bg-white'
                }`}
              >
                <span className="font-medium text-gray-800">
                  座席{index + 1}: {player.displayName} {player.isHost ? '(ホスト)' : ''}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  player.isReady 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {player.isReady ? '準備完了' : '準備中'}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <button 
            onClick={handleToggleReady}
            className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
              currentPlayer?.isReady 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            {currentPlayer?.isReady ? '準備解除' : '準備完了'}
          </button>
          
          {allPlayersReady && isHost && !currentRoom.gameStarted && (
            <button 
              onClick={handleStartGame} 
              className="w-full bg-red-600 text-white py-3 px-4 rounded-md font-medium hover:bg-red-700 transition-colors"
            >
              ゲーム開始
            </button>
          )}
          
          {allPlayersReady && !isHost && !currentRoom.gameStarted && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 text-center">
                全員準備完了！ホストがゲームを開始するのを待っています...
              </p>
            </div>
          )}
          
          {currentRoom.gameStarted && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-700 text-center font-bold">
                ゲーム開始！チャットでコミュニケーションを取りましょう
              </p>
            </div>
          )}
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <div className="flex justify-between items-center">
              <p className="text-red-700">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
