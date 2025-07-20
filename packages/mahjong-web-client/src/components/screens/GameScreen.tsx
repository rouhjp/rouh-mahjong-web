import { useState } from 'react';
import type { TurnAction, CallAction } from '@mahjong/core';
import type { Room } from '../../types/index.js';
import type { TableData } from '../../types/table.js';
import { Table } from '../table/Table.js';
import { ErrorDisplay } from '../common/ErrorDisplay.js';

interface Props {
  currentRoom: Room;
  tableData: TableData;
  pendingTurnActions: TurnAction[] | null;
  pendingCallActions: CallAction[] | null;
  showAcknowledgeButton: boolean;
  declarations: any[];
  error: string | null;
  onSelectTurnAction: (action: TurnAction) => void;
  onSelectCallAction: (action: CallAction) => void;
  onAcknowledge: () => void;
  onGameResultClick: () => void;
  onLeaveRoom: () => void;
  onClearError: () => void;
}

export const GameScreen = ({
  currentRoom,
  tableData,
  pendingTurnActions,
  pendingCallActions,
  showAcknowledgeButton,
  declarations,
  error,
  onSelectTurnAction,
  onSelectCallAction,
  onAcknowledge,
  onGameResultClick,
  onLeaveRoom,
  onClearError
}: Props) => {
  const [copyFeedback, setCopyFeedback] = useState('');

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
    <div className="h-screen bg-gray-50 overflow-hidden">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 px-4 pt-4">
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

        {/* 麻雀テーブル */}
        <div className="bg-white rounded-lg shadow-md flex justify-center items-center overflow-hidden p-2 mx-4 mb-4">
          <Table 
            table={tableData}
            turnActionChoices={pendingTurnActions}
            callActionChoices={pendingCallActions}
            selectTurnAction={onSelectTurnAction}
            selectCallAction={onSelectCallAction}
            onAcknowledge={onAcknowledge}
            showAcknowledgeButton={showAcknowledgeButton}
            onGameResultClick={onGameResultClick}
            declarations={declarations}
          />
        </div>
        
        <div className="mx-4">
          <ErrorDisplay error={error} onClose={onClearError} />
        </div>
      </div>
    </div>
  );
};