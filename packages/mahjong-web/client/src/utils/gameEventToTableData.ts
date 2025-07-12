import { Sides, type GameEvent, type Side } from '@mahjong/core';
import type { TableData, SideTableData, WallData, Meld, Direction, Slot } from '../components/table';

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
export const createInitialTableData = (): TableData => {
  const emptySideData: SideTableData = {
    seat: undefined,
    riverTiles: [],
    readyBarExists: false,
    handSize: 0,
    hasDrawnTile: false,
    isHandOpen: false,
    handTiles: [],
    openMelds: []
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
    result: undefined,
    resultProgression: undefined,
  };
};

// GameEventを受け取ってTableDataを更新する
export const updateTableDataWithEvent = (currentData: TableData, event: GameEvent): TableData => {
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
      // Clear any existing result progression
      initialData.resultProgression = undefined;
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
        const wallDirection = sideToDirection(wallIndex.side);
        const wallCol = wallIndex.row;
        const wallFloor = wallIndex.level;
        if (newData.wall[wallDirection] && newData.wall[wallDirection][wallCol] && newData.wall[wallDirection][wallCol][wallFloor]) {
          newData.wall[wallDirection][wallCol][wallFloor] = null;
        }
      }
      break;
    }

    case 'tile-drawn': {
      // 他家の手牌サイズ更新（ツモ時）
      const direction = sideToDirection(event.side);
      newData[direction].hasDrawnTile = true;
      
      // 山から牌を取得（消去）
      const wallDirection = sideToDirection(event.wallIndex.side);
      const wallCol = event.wallIndex.row;
      const wallFloor = event.wallIndex.level;
      if (newData.wall[wallDirection] && newData.wall[wallDirection][wallCol] && newData.wall[wallDirection][wallCol][wallFloor]) {
        newData.wall[wallDirection][wallCol][wallFloor] = null;
      }
      break;
    }

    case 'hand-revealed': {
      // 手牌公開（和了時など）
      const revealDirection = sideToDirection(event.side);
      newData[revealDirection].handTiles = [...event.handTiles];
      newData[revealDirection].drawnTile = event.completingTile;
      newData[revealDirection].isHandOpen = true;
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
      break;
    }

    case 'concealed-quad-added': {
      // 暗槓追加
      const meldDirection = sideToDirection(event.side);
      const newMeld: Meld = {
        tiles: [...event.quadTiles],
      };
      newData[meldDirection].openMelds = [...newData[meldDirection].openMelds, newMeld];
      newData[meldDirection].handSize = newData[meldDirection].handSize - 4; // 暗槓で手牌が4枚減る
      break;
    }

    case 'call-meld-added': {
      // チー・ポン・大明槓追加
      const meldDirection = sideToDirection(event.side);
      let tiltIndex: number | undefined = undefined;
      if (event.from === 'LEFT') tiltIndex = 0;
      if (event.from === 'ACROSS') tiltIndex = 1;
      if (event.from === 'RIGHT') tiltIndex = event.meldTiles.length - 1;
      const newMeld: Meld = {
        tiles: [...event.meldTiles],
        tiltIndex: tiltIndex
      }
      newData[meldDirection].openMelds = [...newData[meldDirection].openMelds, newMeld];
      newData[meldDirection].handSize = newData[meldDirection].handSize - event.meldTiles.length; // チー・ポン・大明槓で手牌が減る
      break;
    }

    case 'quad-tile-added': {
      // 加槓
      const direction = sideToDirection(event.side);
      if (newData[direction].openMelds[event.meldIndex]) {
        newData[direction].openMelds[event.meldIndex].addedTile = event.addedTile;
      }
      break;
    }

    case 'indicator-revealed': {
      // ドラ表示牌公開
      const direction = sideToDirection(event.wallIndex.side);
      const col = Math.floor(event.wallIndex.row / 2);
      const floor = event.wallIndex.level;
      if (newData.wall[direction] && newData.wall[direction][col] && newData.wall[direction][col][floor]) {
        newData.wall[direction][col][floor] = event.indicator;
      }
      break;
    }

    case 'seat-updated': {
      // 座席情報更新（立直時など）
      newData.top.seat = event.seats.find(seat => seat.side === Sides.ACROSS);
      newData.right.seat = event.seats.find(seat => seat.side === Sides.RIGHT);
      newData.bottom.seat = event.seats.find(seat => seat.side === Sides.SELF);
      newData.left.seat = event.seats.find(seat => seat.side === Sides.LEFT);
      break;
    }

    case 'round-aborted': {
      newData.result = event.drawType;
      break;
    }

    case 'river-winning-result-notified': {
      if (event.winningResults && event.winningResults.length > 0) {
        // 複数ある場合は最初の1つを表示
        newData.result = event.winningResults[0];
      }
      break;
    }

    case 'payment-result-notified': {
      if (event.paymentResults && event.paymentResults.length > 0) {
        if (newData.resultProgression) {
          // Add PaymentResult to existing progression
          newData.resultProgression.paymentResult = event.paymentResults;
        } else {
          // Legacy behavior - PaymentResult配列全体を表示
          newData.result = event.paymentResults;
        }
      }
      break;
    }

    case 'hand-status-updated': {
      // プレイヤーの和了可能牌情報の更新
      // 現在のTableDataには対応フィールドがないため、空実装
      break;
    }

    case 'dice-rolled': {
      // サイコロの結果
      // TableDataには対応フィールドがないため、空実装
      break;
    }

    case 'winning-result-notified': {
      if (event.winningResults && event.winningResults.length > 0) {
        if (event.winningResults.length === 1) {
          // Single result - use legacy system for backward compatibility
          newData.result = event.winningResults[0];
        } else {
          // Multiple results - use progression system
          newData.resultProgression = {
            winningResults: event.winningResults,
            paymentResult: undefined, // Will be set by payment-result-notified
            currentIndex: 0,
            phase: 'winning'
          };
        }
      }
      break;
    }

    case 'exhaustive-draw-result-notified': {
      // 流局時の聴牌情報
      // 現在のTableDataには対応フィールドがないため、空実装
      break;
    }

    case 'game-result-notified': {
      // ゲーム終了結果
      if (event.gameResults && event.gameResults.length > 0) {
        newData.result = event.gameResults;
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
