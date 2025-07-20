import { useState } from 'react';

interface Props {
  onAuthenticate: (displayName: string) => void;
}

export const AuthScreen = ({ onAuthenticate }: Props) => {
  const [displayName, setDisplayName] = useState('');

  const handleAuthenticate = () => {
    if (displayName.trim()) {
      onAuthenticate(displayName.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && displayName.trim()) {
      e.preventDefault();
      handleAuthenticate();
    }
  };

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
              onChange={(e) => setDisplayName((e.target as HTMLInputElement).value)}
              onKeyDown={handleKeyDown}
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
};