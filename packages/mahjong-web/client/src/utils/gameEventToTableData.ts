import type { GameEvent, Side } from '@mahjong/core';
import type { TableData, SideTableData, WallData, Meld, Direction, Slot } from '../components/table';

// Side → Direction マッピング
const sideToDirection = (side: Side): Direction => {
  switch (side) {
    case 'SELF': return 'bottom';
    case 'RIGHT': return 'left'; 
    case 'ACROSS': return 'top';
    case 'LEFT': return 'right';
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
    case 'HandUpdated':
      // 自分の手牌更新
      newData.bottom.handTiles = [...event.handTiles];
      newData.bottom.drawnTile = event.drawnTile;
      newData.bottom.hasDrawnTile = !!event.drawnTile;
      newData.bottom.handSize = event.handTiles.length;
      break;

    case 'OtherHandUpdated':
      // 他家の手牌サイズ更新
      const direction = sideToDirection(event.side);
      newData[direction].handSize = event.size;
      newData[direction].hasDrawnTile = event.hasDrawnTile;
      break;

    case 'HandRevealed':
      // 手牌公開（和了時など）
      const revealDirection = sideToDirection(event.side);
      newData[revealDirection].handTiles = [...event.handTiles];
      newData[revealDirection].drawnTile = event.drawnTile;
      newData[revealDirection].isHandOpen = true;
      break;

    case 'RiverTileAdded':
      // 河に牌追加
      const riverDirection = sideToDirection(event.side);
      newData[riverDirection].riverTiles = [...newData[riverDirection].riverTiles, event.tile];
      if (event.tilt) {
        newData[riverDirection].readyIndex = newData[riverDirection].riverTiles.length - 1;
        newData[riverDirection].readyBarExists = true;
      }
      break;

    case 'RiverTileTaken':
      // 河から牌を取る（鳴き時）
      const takenDirection = sideToDirection(event.side);
      newData[takenDirection].riverTiles.pop(); // 最後の牌を削除
      break;

    case 'MeldAdded':
      // 鳴き追加
      const meldDirection = sideToDirection(event.side);
      const newMeld: Meld = {
        tiles: [...event.tiles]
      };
      newData[meldDirection].openMelds = [...newData[meldDirection].openMelds, newMeld];
      break;

    case 'MeldTileAdded':
      // 鳴きに牌追加（加カン）
      const addDirection = sideToDirection(event.side);
      if (newData[addDirection].openMelds[event.meldIndex]) {
        newData[addDirection].openMelds[event.meldIndex].addedTile = event.tile;
      }
      break;

    case 'WallTileTaken':
      // 山から牌を取る
      const wallDirection = sideToDirection(event.side);
      const wallSide = wallDirection;
      if (newData.wall[wallSide] && newData.wall[wallSide][event.rowIndex]) {
        newData.wall[wallSide][event.rowIndex] = null;
      }
      break;

    case 'WallTileRevealed':
      // 山の牌を公開（ドラ表示など）
      const revealWallDirection = sideToDirection(event.side);
      const revealWallSide = revealWallDirection;
      if (newData.wall[revealWallSide] && newData.wall[revealWallSide][event.rowIndex]) {
        newData.wall[revealWallSide][event.rowIndex] = event.tile;
      }
      break;

    case 'ReadyStickAdded':
      // リーチ棒追加
      const readyDirection = sideToDirection(event.side);
      newData[readyDirection].readyBarExists = true;
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