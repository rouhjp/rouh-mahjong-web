import { useState } from 'react';
import { ErrorDisplay } from '../common/ErrorDisplay.js';

interface Props {
  currentUser: { userId: string; displayName: string };
  error: string | null;
  onCreateRoom: () => void;
  onJoinRoom: (roomId: string) => void;
  onClearError: () => void;
}

export const LobbyScreen = ({ 
  currentUser, 
  error, 
  onCreateRoom, 
  onJoinRoom, 
  onClearError 
}: Props) => {
  const [roomId, setRoomId] = useState('');

  const handleCreateRoom = () => {
    onCreateRoom();
  };

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      onJoinRoom(roomId.trim());
    }
  };

  const handleRoomIdKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && roomId.trim()) {
      e.preventDefault();
      handleJoinRoom();
    }
  };

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
                onChange={(e) => setRoomId((e.target as HTMLInputElement).value)}
                onKeyDown={handleRoomIdKeyDown}
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
        
        <ErrorDisplay error={error} onClose={onClearError} />
      </div>
    </div>
  );
};