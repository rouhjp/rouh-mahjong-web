import { useState, useCallback } from 'react';
import { useDeclaration } from './useDeclaration.js';
import { Declaration, TableData, toDirection, SideTableData, WallData, MeldData, Direction, Slot } from '../types/table.js';
import { DiscardGuide, GameEvent, Side, sideOf } from '@mahjong/core';

interface UseTableDataReturn {
  tableData: TableData;
  handleGameEvent: (event: GameEvent) => void;
  resetTable: () => void;
  declarations: Declaration[];
  setDiscardGuides: (guides: DiscardGuide[] | null) => void;
}

// Side → Direction マッピング
const sideToDirection = (side: Side): Direction => {
  switch (side) {
    case 'SELF': return 'bottom';
    case 'RIGHT': return 'right'; 
    case 'ACROSS': return 'top';
    case 'LEFT': return 'left';
    default: return 'bottom';
  }
};

// 初期状態のTableDataを作成
const createInitialTableData = (): TableData => {
  const emptySideData: SideTableData = {
    seat: undefined,
    riverTiles: [],
    readyBarExists: false,
    handSize: 0,
    hasDrawnTile: false,
    isHandOpen: false,
    handTiles: [],
    openMelds: [],
  };

  const emptyWallData: WallData = {
    top: Array.from({ length: 17 }, () => ["back", "back"] as Slot[]),
    right: Array.from({ length: 17 }, () => ["back", "back"] as Slot[]),
    bottom: Array.from({ length: 17 }, () => ["back", "back"] as Slot[]),
    left: Array.from({ length: 17 }, () => ["back", "back"] as Slot[])
  };

  return {
    bottom: { ...emptySideData },
    right: { ...emptySideData },
    top: { ...emptySideData },
    left: { ...emptySideData },
    wall: emptyWallData,
    roundInfo: undefined,
    handStatus: undefined,
    winningResults: undefined,
    riverWinningResults: undefined,
    paymentResults: undefined,
    drawFinishType: undefined,
    gameResults: undefined,
    discardGuides: undefined,
  };
};

// GameEventを受け取ってTableDataを更新する
const updateTableDataWithEvent = (currentData: TableData, event: GameEvent): TableData => {
  const newData = JSON.parse(JSON.stringify(currentData)) as TableData;

  switch (event.type) {
    case 'round-started': {
      // 局開始時に全表示をリセットし、局情報を保存
      const initialData = createInitialTableData();
      initialData.roundInfo = {
        roundWind: event.roundWind,
        roundCount: event.roundCount,
        continueCount: event.continueCount,
        depositCount: event.depositCount,
        last: event.last
      };
      // Clear any existing results
      initialData.handStatus = undefined;
      initialData.winningResults = undefined;
      initialData.riverWinningResults = undefined;
      initialData.paymentResults = undefined;
      initialData.drawFinishType = undefined;
      initialData.gameResults = undefined;
      return initialData;
    }

    case 'hand-updated': {
      // 自分の手牌更新
      newData.bottom.handTiles = [...event.handTiles];
      newData.bottom.drawnTile = event.drawnTile;
      newData.bottom.hasDrawnTile = !!event.drawnTile;
      newData.bottom.handSize = event.handTiles.length;
      break;
    }
    
    case 'tile-distributed': {
      const direction = sideToDirection(event.side);
      newData[direction].handSize = currentData[direction].handSize + event.size;

      for (const wallIndex of event.wallIndices) {
        // 山から牌を取得（消去）
        const dir = sideToDirection(wallIndex.side);
        const row = wallIndex.row;
        const level = wallIndex.level;
        if (newData.wall) {
          newData.wall[dir][row][level] = null;
        }
      }
      break;
    }

    case 'tile-drawn': {
      // 他家の手牌サイズ更新（ツモ時）
      const direction = sideToDirection(event.side);
      newData[direction].hasDrawnTile = true;
      
      // 山から牌を取得（消去）
      const wallIndex = event.wallIndex;
      const dir = sideToDirection(wallIndex.side);
      const row = wallIndex.row;
      const level = wallIndex.level;
      if (newData.wall) {
        newData.wall[dir][row][level] = null;
      }
      break;
    }

    case 'tile-discarded': {
      // 河に牌追加
      const riverDirection = sideToDirection(event.side);
      newData[riverDirection].riverTiles = [...newData[riverDirection].riverTiles, event.discardedTile];
      newData[riverDirection].hasDrawnTile = false;
      if (event.readyTilt) {
        newData[riverDirection].readyIndex = newData[riverDirection].riverTiles.length - 1;
        newData[riverDirection].readyBarExists = true;
      }
      newData.callTarget = { type: "river", side: event.side };
      break;
    }

    case 'concealed-quad-added': {
      // 暗槓追加
      const meldDirection = sideToDirection(event.side);
      const newMeld: MeldData = {
        tiles: [...event.quadTiles],
      };
      newData[meldDirection].openMelds = [...newData[meldDirection].openMelds, newMeld];
      newData[meldDirection].handSize = newData[meldDirection].handSize - 4; // 暗槓で手牌が4枚減る

      newData.callTarget = { type: "self-quad", side: event.side };
      break;
    }

    case 'call-meld-added': {
      // チー・ポン・大明槓追加
      const meldDirection = sideToDirection(event.side);
      let tiltIndex: number | undefined = undefined;
      if (event.from === 'LEFT') tiltIndex = 0;
      if (event.from === 'ACROSS') tiltIndex = 1;
      if (event.from === 'RIGHT') tiltIndex = event.meldTiles.length - 1;
      const newMeld: MeldData = {
        tiles: [...event.meldTiles],
        tiltIndex: tiltIndex
      }
      newData[meldDirection].openMelds = [...newData[meldDirection].openMelds, newMeld];
      newData[meldDirection].handSize = newData[meldDirection].handSize - event.meldTiles.length; // チー・ポン・大明槓で手牌が減る
      
      // 鳴き元の河から最後の牌を削除
      const fromDirection = sideToDirection(sideOf(event.side, event.from));
      if (newData[fromDirection].riverTiles.length > 0) {
        newData[fromDirection].riverTiles = newData[fromDirection].riverTiles.slice(0, -1);
      }
      break;
    }

    case 'quad-tile-added': {
      // 加槓
      const direction = sideToDirection(event.side);
      if (newData[direction].openMelds[event.meldIndex]) {
        newData[direction].openMelds[event.meldIndex].addedTile = event.addedTile;
      }
      newData.callTarget = { type: "add-quad", side: event.side, meldIndex: event.meldIndex };
      break;
    }

    case 'indicator-revealed': {
      // ドラ表示牌公開
      const wallIndex = event.wallIndex;
      const dir = sideToDirection(wallIndex.side);
      const row = wallIndex.row;
      const level = wallIndex.level;
      if (newData.wall) {
        newData.wall[dir][row][level] = event.indicator;
      }
      break;
    }

    case 'seat-updated': {
      // 座席情報更新（立直時など）
      event.seats.forEach((seat) => {
        const direction = sideToDirection(seat.side);
        newData[direction].seat = seat;
      });
      break;
    }

    case 'round-finished': {
      // 局終了時の統一イベント処理
      // RoundFinishedイベントを分解して各フィールドに設定
      newData.winningResults = event.winningResults;
      newData.riverWinningResults = event.riverWinningResults;
      newData.paymentResults = event.paymentResults;
      if (event.finishType !== "tsumo" && event.finishType !== "ron" && event.finishType !== "river-winning") {
        // 流局の場合のみ finishType を設定
        newData.drawFinishType = event.finishType;
      }
      
      // revealedHandsがある場合、手牌をface upに設定
      if (event.revealedHands) {
        event.revealedHands.forEach((revealedHand) => {
          const direction = sideToDirection(revealedHand.side);
          newData[direction].isHandOpen = true;
          newData[direction].handTiles = [...revealedHand.handTiles];
          newData[direction].drawnTile = revealedHand.drawnTile;
          newData[direction].hasDrawnTile = !!revealedHand.drawnTile;
        });
      }
      break;
    }

    case 'hand-status-updated': {
      // プレイヤーの和了可能牌情報の更新
      newData.handStatus = {
        winningTiles: [...event.winningTiles],
        disqualified: event.disqualified
      };
      break;
    }

    case 'dice-rolled': {
      // サイコロの結果
      // TableDataには対応フィールドがないため、空実装
      break;
    }

    case 'game-finished': {
      // ゲーム終了結果
      if (event.gameResults && event.gameResults.length > 0) {
        newData.gameResults = event.gameResults;
      }
      break;
    }

    default: {
      // 未知のイベントは無視
      break;
    }
  }

  return newData;
};

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

  const setDiscardGuides = useCallback((guides: DiscardGuide[] | null) => {
    setTableData(prev => ({
      ...prev,
      discardGuides: guides || undefined
    }));
  }, []);

  return {
    tableData,
    handleGameEvent,
    resetTable,
    declarations,
    setDiscardGuides
  };
};