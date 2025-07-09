import type { GameEvent, Side } from '@mahjong/core';
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
    wall: emptyWallData
  };
};

// GameEventを受け取ってTableDataを更新する
export const updateTableDataWithEvent = (currentData: TableData, event: GameEvent): TableData => {
  const newData = JSON.parse(JSON.stringify(currentData)) as TableData;

  switch (event.type) {
    case 'round-started':
      // 局開始時に全表示をリセット
      return createInitialTableData();

    case 'hand-updated':
      // 自分の手牌更新
      newData.bottom.handTiles = [...event.handTiles];
      newData.bottom.drawnTile = event.drawnTile;
      newData.bottom.hasDrawnTile = !!event.drawnTile;
      newData.bottom.handSize = event.handTiles.length;
      break;
    
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

    case 'tile-discarded':
      // 河に牌追加
      const riverDirection = sideToDirection(event.side);
      newData[riverDirection].riverTiles = [...newData[riverDirection].riverTiles, event.discardedTile];
      newData[riverDirection].hasDrawnTile = false;
      if (event.readyTilt) {
        newData[riverDirection].readyIndex = newData[riverDirection].riverTiles.length - 1;
        newData[riverDirection].readyBarExists = true;
      }
      break;

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
      const meldTiles = event.meldTiles;
      let tiltIndex: number | undefined = undefined;
      if (event.from === 'LEFT') tiltIndex = 0;
      if (event.from === 'ACROSS') tiltIndex = 1;
      if (event.from === 'RIGHT') tiltIndex = meldTiles.length - 1;
      const newMeld: Meld = {
        tiles: [...meldTiles],
        tiltIndex: tiltIndex
      }
      newData[meldDirection].openMelds = [...newData[meldDirection].openMelds, newMeld];
      newData[meldDirection].handSize = newData[meldDirection].handSize - meldTiles.length; // チー・ポン・大明槓で手牌が減る
      break;
    }

    case 'quad-tile-added': {
      // 加槓
      const addDirection = sideToDirection(event.side);
      if (newData[addDirection].openMelds[event.meldIndex]) {
        newData[addDirection].openMelds[event.meldIndex].addedTile = event.addedTile;
      }
      break;
    }

    case 'indicator-revealed':
      // ドラ表示牌公開
      const indicatorDirection = sideToDirection(event.wallIndex.side);
      const indicatorSide = indicatorDirection;
      const col = Math.floor(event.wallIndex.row / 2);
      const floor = event.wallIndex.level;
      if (newData.wall[indicatorSide] && newData.wall[indicatorSide][col] && newData.wall[indicatorSide][col][floor]) {
        newData.wall[indicatorSide][col][floor] = event.indicator;
      }
      break;

    case 'seat-updated':
      // 座席情報更新（立直時など）
      event.seats.forEach(seat => {
        const seatDirection = sideToDirection(seat.side);
        if (seat.ready) {
          newData[seatDirection].readyBarExists = true;
        }
      });
      break;

    default:
      // その他のイベントは無視
      break;
  }

  return newData;
};

// アクション選択肢を文字列配列に変換（Discardアクションは除外）
export const getActionChoices = (pendingAction: any): string[] => {
  if (!pendingAction) return [];
  
  return pendingAction.choices
    .filter((choice: any) => choice.type !== 'Discard') // Discardアクションを除外
    .map((choice: any) => {
      switch (choice.type) {
        case 'Tsumo': return 'ツモ';
        case 'NineTiles': return '九種九牌';
        case 'AddQuad': return `加カン`;
        case 'SelfQuad': return `暗カン`;
        case 'Ron': return 'ロン';
        case 'Chi': return 'チー';
        case 'Pon': return 'ポン';
        case 'Kan': return 'カン';
        case 'Pass': return 'パス';
        default: return 'アクション';
      }
    });
};