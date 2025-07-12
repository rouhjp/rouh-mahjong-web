import { useState, useCallback } from 'react';
import type { GameEvent, WinningResult, AbortiveDrawType, RiverWinningResult } from '@mahjong/core';
import type { TableData } from '../components/table';
import { createInitialTableData, updateTableDataWithEvent } from '../utils/gameEventToTableData';

interface UseTableDataReturn {
  tableData: TableData;
  handleGameEvent: (event: GameEvent) => void;
  resetTable: () => void;
  setResult: (result: WinningResult | AbortiveDrawType | RiverWinningResult | undefined) => void;
}

export const useTableData = (): UseTableDataReturn => {
  const [tableData, setTableData] = useState<TableData>(createInitialTableData());

  const handleGameEvent = useCallback((event: GameEvent) => {
    setTableData(prev => updateTableDataWithEvent(prev, event));
  }, []);

  const resetTable = useCallback(() => {
    setTableData(createInitialTableData());
  }, []);

  const setResult = useCallback((result: WinningResult | AbortiveDrawType | RiverWinningResult | undefined) => {
    setTableData(prev => ({ ...prev, result }));
  }, []);

  return {
    tableData,
    handleGameEvent,
    resetTable,
    setResult
  };
};