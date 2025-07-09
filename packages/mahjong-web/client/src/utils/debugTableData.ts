import type { TableData } from '../components/table/component/Table';
import type { Tile } from '@mahjong/core';

// テーブルテスト用のサンプルデータ

// 初期状態（空のテーブル）
export const initialTableData: TableData = {
  bottom: {
    riverTiles: [],
    readyBarExists: false,
    handSize: 13,
    hasDrawnTile: false,
    isHandOpen: false,
    handTiles: [],
    openMelds: []
  },
  right: {
    riverTiles: [],
    readyBarExists: false,
    handSize: 13,
    hasDrawnTile: false,
    isHandOpen: false,
    handTiles: [],
    openMelds: []
  },
  top: {
    riverTiles: [],
    readyBarExists: false,
    handSize: 13,
    hasDrawnTile: false,
    isHandOpen: false,
    handTiles: [],
    openMelds: []
  },
  left: {
    riverTiles: [],
    readyBarExists: false,
    handSize: 13,
    hasDrawnTile: false,
    isHandOpen: false,
    handTiles: [],
    openMelds: []
  },
  wall: {
    top: Array.from({ length: 17 }, () => ["back", "back"]),
    right: Array.from({ length: 17 }, () => ["back", "back"]),
    bottom: Array.from({ length: 17 }, () => ["back", "back"]),
    left: Array.from({ length: 17 }, () => ["back", "back"])
  }
};

// サンプル牌データ
const sampleTiles: Tile[] = [
  "M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9",
  "P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", 
  "S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9",
  "WE", "WS", "WW", "WN", "DW", "DG", "DR"
];

// 手牌がある状態
export const withHandTilesData: TableData = {
  ...initialTableData,
  bottom: {
    ...initialTableData.bottom,
    handTiles: [
      "M1", "M2", "M3", "P1", "P2", "P3", "S1", "S2", "S3",
      "WE", "WS", "WW", "WN"
    ],
    drawnTile: "DR",
    hasDrawnTile: true,
    isHandOpen: true
  }
};

// 河に牌がある状態
export const withRiverTilesData: TableData = {
  ...initialTableData,
  bottom: {
    ...initialTableData.bottom,
    riverTiles: ["M1", "P5", "S9", "WE", "DW"],
    handTiles: ["M2", "M3", "P1", "P2", "P3", "S1", "S2", "S3", "WS", "WW", "WN", "DR", "DG"]
  },
  right: {
    ...initialTableData.right,
    riverTiles: ["P1", "S3", "WW", "M7"],
    handSize: 13
  },
  top: {
    ...initialTableData.top,
    riverTiles: ["S1", "WE", "M5", "P8", "DW"],
    handSize: 13
  },
  left: {
    ...initialTableData.left,
    riverTiles: ["M9", "P2", "WN"],
    handSize: 13
  }
};

// 立直がある状態
export const withReadyData: TableData = {
  ...withRiverTilesData,
  bottom: {
    ...withRiverTilesData.bottom,
    readyBarExists: true,
    readyIndex: 4 // 最後の牌（DW）が立直牌
  },
  right: {
    ...withRiverTilesData.right,
    readyBarExists: true,
    readyIndex: 3 // 最後の牌（M7）が立直牌
  }
};

// 鳴きがある状態
export const withMeldsData: TableData = {
  ...initialTableData,
  bottom: {
    ...initialTableData.bottom,
    handTiles: ["M4", "M5", "M6", "P7", "P8", "S1", "S2", "WE", "WS", "WW"],
    openMelds: [
      {
        tiles: ["M1", "M1", "M1"], // ポン
        tiltIndex: 2 // 右家から鳴いた
      },
      {
        tiles: ["P1", "P2", "P3"], // チー
        tiltIndex: 0 // 左家から鳴いた
      }
    ],
    riverTiles: ["S9", "DW"],
    handSize: 10
  },
  right: {
    ...initialTableData.right,
    openMelds: [
      {
        tiles: ["WE", "WE", "WE", "WE"], // 大明槓
        tiltIndex: 1 // 対面から鳴いた
      }
    ],
    handSize: 10,
    riverTiles: ["M3", "P4"]
  },
  top: {
    ...initialTableData.top,
    openMelds: [
      {
        tiles: ["S5", "S6", "S7"], // チー
        tiltIndex: 0
      },
      {
        tiles: ["DW", "DW", "DW"], // ポン
        tiltIndex: 1,
        addedTile: "DW" // 加槓された牌
      }
    ],
    handSize: 7,
    riverTiles: ["M8", "P9", "S2"]
  }
};

// 複合状態（立直 + 鳴き + 河）
export const complexTableData: TableData = {
  bottom: {
    // 1列目(5順目)で立直 - 河に8枚、5番目が立直牌、立直後3枚
    riverTiles: ["M1", "P5", "S9", "WE", "DW", "S4", "P7", "M6"],
    readyBarExists: true,
    readyIndex: 4, // 5番目（DW）が立直牌
    handSize: 13,
    hasDrawnTile: true,
    isHandOpen: true,
    handTiles: ["M2", "M3", "P1", "P2", "P3", "S1", "S2", "S3", "WS", "WW", "WN", "DR", "DG"],
    drawnTile: "M4",
    openMelds: []
  },
  right: {
    // 2列目(8順目)で立直 - 河に11枚、8番目が立直牌、立直後3枚
    riverTiles: ["P1", "S3", "WW", "M7", "DG", "S4", "P6", "M8", "S7", "P2", "M9"],
    readyBarExists: true,
    readyIndex: 7, // 8番目（M8）が立直牌
    handSize: 10,
    hasDrawnTile: false,
    isHandOpen: false,
    handTiles: [],
    openMelds: [
      {
        tiles: ["WE", "WE", "WE"],
        tiltIndex: 2
      }
    ]
  },
  top: {
    // 3列目(14順目)で立直 - 河に17枚、14番目が立直牌、立直後3枚
    riverTiles: ["S1", "WE", "M5", "P8", "DR", "S7", "P3", "M6", "WN", "S2", "P9", "M1", "DW", "S8", "P4", "M2", "S3"],
    readyBarExists: true,
    readyIndex: 13, // 14番目（S8）が立直牌
    handSize: 7,
    hasDrawnTile: false,
    isHandOpen: false,
    handTiles: [],
    openMelds: [
      {
        tiles: ["S5", "S6", "S7"],
        tiltIndex: 0
      },
      {
        tiles: ["DW", "DW", "DW"],
        addedTile: "DW"
      }
    ]
  },
  left: {
    // 4列目(22順目)で立直 - 河に24枚、22番目が立直牌、立直後3枚
    riverTiles: ["M9", "P2", "WN", "S3", "P7", "M4", "WS", "S6", "P4", "M8", "DR", "S1", "P1", "M2", "WW", "S9", "P8", "M7", "DG", "S5", "P6", "M3", "S4", "P5"],
    readyBarExists: true,
    readyIndex: 21, // 22番目（M3）が立直牌
    handSize: 13,
    hasDrawnTile: true,
    isHandOpen: false,
    handTiles: [],
    openMelds: []
  },
  wall: {
    // 上の山: 右端から4列ツモされている（13列残り）
    top: Array.from({ length: 17 }, (_, col) => {
      if (col >= 13) return [null, null]; // 右端4列がツモされて消えている
      if (col < 2) return [sampleTiles[col * 2], sampleTiles[col * 2 + 1]]; // ドラ表示牌
      return ["back", "back"];
    }),
    // 右の山: 右端から6列ツモされている（11列残り）
    right: Array.from({ length: 17 }, (_, col) => {
      if (col >= 11) return [null, null]; // 右端6列がツモされて消えている
      if (col < 1) return [sampleTiles[col * 2 + 5], sampleTiles[col * 2 + 6]]; // ドラ表示牌
      return ["back", "back"];
    }),
    // 下の山: 右端から3列ツモされている（14列残り）
    bottom: Array.from({ length: 17 }, (_, col) => {
      if (col >= 14) return [null, null]; // 右端3列がツモされて消えている
      if (col < 2) return [sampleTiles[col * 2 + 8], sampleTiles[col * 2 + 9]]; // ドラ表示牌
      return ["back", "back"];
    }),
    // 左の山: 右端から7列ツモされている（10列残り）
    left: Array.from({ length: 17 }, (_, col) => {
      if (col >= 10) return [null, null]; // 右端7列がツモされて消えている
      if (col < 1) return [sampleTiles[col * 2 + 15], sampleTiles[col * 2 + 16]]; // ドラ表示牌
      return ["back", "back"];
    })
  }
};

// 全てのテストケース
export const debugTableDataSets = {
  initial: initialTableData,
  withHandTiles: withHandTilesData,
  withRiverTiles: withRiverTilesData,
  withReady: withReadyData,
  withMelds: withMeldsData,
  complex: complexTableData
};

export type DebugTableDataKey = keyof typeof debugTableDataSets;