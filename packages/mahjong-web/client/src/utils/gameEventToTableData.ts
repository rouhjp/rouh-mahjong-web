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
    handSize: 13,
    hasDrawnTile: false,
    isHandOpen: false,
    handTiles: [],
    openMelds: []
  };

  const emptyWallData: WallData = {
    top: Array.from({ length: 34 }, () => "back" as Slot),
    right: Array.from({ length: 34 }, () => "back" as Slot),
    bottom: Array.from({ length: 34 }, () => "back" as Slot),
    left: Array.from({ length: 34 }, () => "back" as Slot)
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
    case 'hand-updated':
      // 自分の手牌更新
      newData.bottom.handTiles = [...event.handTiles];
      newData.bottom.drawnTile = event.drawnTile;
      newData.bottom.hasDrawnTile = !!event.drawnTile;
      newData.bottom.handSize = event.handTiles.length;
      break;

    case 'tile-drawn':
      // 他家の手牌サイズ更新（ツモ時）
      const direction = sideToDirection(event.side);
      newData[direction].handSize = newData[direction].handSize + event.size;
      newData[direction].hasDrawnTile = true;
      break;

    case 'hand-revealed':
      // 手牌公開（和了時など）
      const revealDirection = sideToDirection(event.side);
      newData[revealDirection].handTiles = [...event.handTiles];
      newData[revealDirection].drawnTile = event.completingTile;
      newData[revealDirection].isHandOpen = true;
      break;

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
      if (newData.wall[indicatorSide] && newData.wall[indicatorSide][event.wallIndex.row]) {
        newData.wall[indicatorSide][event.wallIndex.row] = event.indicator;
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