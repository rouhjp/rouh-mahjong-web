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
    top: Array.from({ length: 34 }, () => "back"),
    right: Array.from({ length: 34 }, () => "back"),
    bottom: Array.from({ length: 34 }, () => "back"),
    left: Array.from({ length: 34 }, () => "back")
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
    riverTiles: ["M1", "P5", "S9", "WE", "DW"],
    readyBarExists: true,
    readyIndex: 4,
    handSize: 13,
    hasDrawnTile: true,
    isHandOpen: true,
    handTiles: ["M2", "M3", "P1", "P2", "P3", "S1", "S2", "S3", "WS", "WW", "WN", "DR", "DG"],
    drawnTile: "M4",
    openMelds: []
  },
  right: {
    riverTiles: ["P1", "S3", "WW", "M7"],
    readyBarExists: true,
    readyIndex: 3,
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
    riverTiles: ["S1", "WE", "M5", "P8"],
    readyBarExists: false,
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
    riverTiles: ["M9", "P2", "WN"],
    readyBarExists: false,
    handSize: 13,
    hasDrawnTile: true,
    isHandOpen: false,
    handTiles: [],
    openMelds: []
  },
  wall: {
    // 上の山: 右端から8枚ツモされている（26枚残り）
    top: Array.from({ length: 34 }, (_, i) => {
      if (i >= 26) return null; // 右端8枚がツモされて消えている
      if (i < 3) return sampleTiles[i]; // ドラ表示牌
      return "back";
    }),
    // 右の山: 右端から12枚ツモされている（22枚残り）
    right: Array.from({ length: 34 }, (_, i) => {
      if (i >= 22) return null; // 右端12枚がツモされて消えている
      if (i < 2) return sampleTiles[i + 5]; // ドラ表示牌
      return "back";
    }),
    // 下の山: 右端から6枚ツモされている（28枚残り）
    bottom: Array.from({ length: 34 }, (_, i) => {
      if (i >= 28) return null; // 右端6枚がツモされて消えている
      if (i < 4) return sampleTiles[i + 8]; // ドラ表示牌
      return "back";
    }),
    // 左の山: 右端から14枚ツモされている（20枚残り）
    left: Array.from({ length: 34 }, (_, i) => {
      if (i >= 20) return null; // 右端14枚がツモされて消えている
      if (i < 1) return sampleTiles[i + 15]; // ドラ表示牌
      return "back";
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