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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto min-h-screen flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-2 xs:mb-4 sm:mb-6 gap-2 sm:gap-4 px-2 xs:px-4 pt-2 xs:pt-4 flex-shrink-0">
          <div className="flex items-center gap-1 xs:gap-2 sm:gap-3 w-full sm:w-auto">
            <h1 className="text-lg xs:text-2xl sm:text-3xl font-bold text-gray-900 truncate">
              麻雀オンライン - ルーム {currentRoom.roomId}
            </h1>
            <div className="relative flex-shrink-0">
              <button
                onClick={handleCopyRoomId}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-1 xs:px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors border border-blue-300"
                title="ルームIDをコピー"
              >
                📋
                <span className="hidden xs:inline ml-1">コピー</span>
              </button>
              {copyFeedback && (
                <div className="absolute top-full left-0 mt-1 bg-green-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                  {copyFeedback}
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={onLeaveRoom} 
            className="bg-gray-600 text-white px-2 xs:px-3 sm:px-4 py-1 xs:py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-gray-700 transition-colors flex-shrink-0"
          >
            退出
          </button>
        </div>

        {/* 麻雀テーブル */}
        <div className="bg-white rounded-lg shadow-md flex justify-center items-center p-1 xs:p-2 mx-2 xs:mx-4 mb-2 xs:mb-4 flex-1 min-h-0">
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
        
        <div className="mx-2 xs:mx-4 flex-shrink-0">
          <ErrorDisplay error={error} onClose={onClearError} />
        </div>
      </div>
    </div>
  );
};