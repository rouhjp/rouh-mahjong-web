import { useState, useCallback } from 'react';
import type { GameEvent } from '@mahjong/core';
import { toDirection, type TableData } from '../components/table';
import { createInitialTableData, updateTableDataWithEvent } from '../utils/gameEventToTableData';
import { useDeclaration } from './useDeclaration';
import { Declaration } from '../components/table/Table';

interface UseTableDataReturn {
  tableData: TableData;
  handleGameEvent: (event: GameEvent) => void;
  resetTable: () => void;
  declarations: Declaration[];
}

export const useTableData = (): UseTableDataReturn => {
  const [tableData, setTableData] = useState<TableData>(createInitialTableData());
  const { declarations, addDeclaration } = useDeclaration();

  const handleGameEvent = useCallback((event: GameEvent) => {
    // Declration アニメーション追加
    if (event.type === 'call-meld-added') {
      const direction = toDirection(event.side);
      if (event.declaration === 'chi') {
        addDeclaration("チー", direction);
      } else if (event.declaration === 'pon') {
        addDeclaration("ポン", direction);
      } else if (event.declaration === 'kan') {
        addDeclaration("カン", direction);
      }
    }
    if (event.type === 'round-finished') {
      const directions = event.revealedHands?.map(hand => toDirection(hand.side)) || [];
      for (const direction of directions) {
        if (event.finishType === 'ron') {
          addDeclaration("ロン", direction);
        } else if (event.finishType === 'tsumo') {
          addDeclaration("ツモ", direction);
        }
      }
    }
    if (event.type === 'tile-discarded') {
      const direction = toDirection(event.side);
      if (event.readyDeclared) {
        addDeclaration("リーチ", direction);
      }
    }
    setTableData(prev => updateTableDataWithEvent(prev, event));
  }, [addDeclaration]);

  const resetTable = useCallback(() => {
    setTableData(createInitialTableData());
  }, []);

  return {
    tableData,
    handleGameEvent,
    resetTable,
    declarations
  };
};