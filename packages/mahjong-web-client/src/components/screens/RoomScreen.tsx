import { useState } from 'react';
import type { Room } from '../../types/index.js';
import { ErrorDisplay } from '../common/ErrorDisplay.js';

interface Props {
  currentUser: { userId: string; displayName: string };
  currentRoom: Room;
  error: string | null;
  onToggleReady: () => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  onAddBot: () => void;
  onRemoveBot: (userId: string) => void;
  onClearError: () => void;
}

export const RoomScreen = ({
  currentUser,
  currentRoom,
  error,
  onToggleReady,
  onStartGame,
  onLeaveRoom,
  onAddBot,
  onRemoveBot,
  onClearError
}: Props) => {
  const [copyFeedback, setCopyFeedback] = useState('');

  const currentPlayer = currentRoom.players.find(p => p.userId === currentUser.userId);
  const allPlayersReady = currentRoom.players.length === 4 && currentRoom.players.every(p => p.isReady);
  const isHost = currentPlayer?.isHost || false;

  // Create seat array for consistent display
  const seats = Array.from({ length: 4 }, (_, index) => {
    const player = currentRoom.players[index] || null;
    return { seatNumber: index + 1, player };
  });

  const handleCopyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(currentRoom.roomId);
      setCopyFeedback('コピーしました！');
      setTimeout(() => setCopyFeedback(''), 2000);
    } catch {
      // フォールバック：古いブラウザ対応
      const textArea = document.createElement('textarea');
      textArea.value = currentRoom.roomId;
      textArea.style.position = 'absolute';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopyFeedback('コピーしました！');
      setTimeout(() => setCopyFeedback(''), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">
              麻雀オンライン - ルーム {currentRoom.roomId}
            </h1>
            <div className="relative">
              <button
                onClick={handleCopyRoomId}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-md text-sm font-medium transition-colors border border-blue-300"
                title="ルームIDをコピー"
              >
                📋 コピー
              </button>
              {copyFeedback && (
                <div className="absolute top-full left-0 mt-1 bg-green-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                  {copyFeedback}
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={onLeaveRoom} 
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
            {seats.map((seat) => (
              <div 
                key={seat.seatNumber} 
                className={`flex justify-between items-center p-4 rounded-lg border-2 ${
                  seat.player 
                    ? seat.player.isHost && seat.player.isReady 
                      ? 'border-cyan-500 bg-cyan-50' 
                      : seat.player.isHost 
                      ? 'border-blue-500 bg-blue-50'
                      : seat.player.isReady 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-300 bg-white'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium text-gray-800">
                    座席{seat.seatNumber}: {
                      seat.player 
                        ? `${seat.player.displayName} ${seat.player.isHost ? '(ホスト)' : ''} ${seat.player.isBot ? '(NPC)' : ''}`
                        : '空席'
                    }
                  </span>
                  <div className="flex items-center gap-2">
                    {seat.player && (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        seat.player.isReady 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {seat.player.isReady ? '準備完了' : '準備中'}
                      </span>
                    )}
                    {!seat.player && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-500">
                        空席
                      </span>
                    )}
                    {seat.player && seat.player.isBot && isHost && !currentRoom.gameStarted && (
                      <button
                        onClick={() => onRemoveBot(seat.player!.userId)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium hover:bg-red-600 transition-colors"
                      >
                        削除
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <button 
            onClick={onToggleReady}
            className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
              currentPlayer?.isReady 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            {currentPlayer?.isReady ? '準備解除' : '準備完了'}
          </button>
          
          {currentRoom.players.length < 4 && isHost && !currentRoom.gameStarted && (
            <button 
              onClick={onAddBot}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-md font-medium hover:bg-purple-700 transition-colors"
            >
              NPCボット追加
            </button>
          )}
          
          {allPlayersReady && isHost && !currentRoom.gameStarted && (
            <button 
              onClick={onStartGame} 
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
                ゲーム開始！
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <ErrorDisplay error={error} onClose={onClearError} />
        </div>
      </div>
    </div>
  );
};