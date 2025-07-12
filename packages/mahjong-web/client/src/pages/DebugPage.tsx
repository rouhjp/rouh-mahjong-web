import { useState } from 'react';
import { Table } from '../components/table';
import { useTileImages } from '../components/table/hooks/useTileImages';
import { Tiles, type WinningResult, type RiverWinningResult, type PaymentResult, type GameResult, Winds, Sides } from '@mahjong/core';
import type { RoundInfo, TableData } from '../components/table';

const testTableData: TableData = {
  bottom: {
    seat: undefined,
    riverTiles: [
      Tiles.M1, Tiles.P2, Tiles.S3, Tiles.WE, Tiles.M4, Tiles.P5,
      Tiles.S6, Tiles.WS, Tiles.M7, Tiles.P8, Tiles.S9, Tiles.WW
    ],
    readyIndex: 7,
    readyBarExists: true,
    handSize: 13,
    hasDrawnTile: true,
    isHandOpen: true,
    handTiles: [
      Tiles.M1, Tiles.M2, Tiles.M3, Tiles.P4, Tiles.P5, Tiles.P6,
      Tiles.S7, Tiles.S8, Tiles.S9, Tiles.WE, Tiles.WE, Tiles.WS, Tiles.WS
    ],
    openMelds: [
      {
        tiles: [Tiles.M9, Tiles.M9, Tiles.M9],
        tiltIndex: 2,
        addedTile: undefined
      }
    ]
  },
  right: {
    seat: undefined,
    riverTiles: [
      Tiles.P1, Tiles.S2, Tiles.M3, Tiles.WN, Tiles.P4, Tiles.S5,
      Tiles.M6, Tiles.DR, Tiles.P7, Tiles.S8, Tiles.M9, Tiles.DG,
      Tiles.P1, Tiles.S2
    ],
    readyBarExists: false,
    handSize: 13,
    hasDrawnTile: false,
    isHandOpen: true,
    openMelds: [
      {
        tiles: [Tiles.P2, Tiles.P3, Tiles.P4],
        tiltIndex: 2,
        addedTile: undefined
      },
      {
        tiles: [Tiles.S5, Tiles.S5, Tiles.S5, Tiles.S5],
        tiltIndex: 3,
        addedTile: undefined
      }
    ]
  },
  top: {
    seat: undefined,
    riverTiles: [
      Tiles.S1, Tiles.M2, Tiles.P3, Tiles.DW, Tiles.S4, Tiles.M5,
      Tiles.P6, Tiles.WE, Tiles.S7, Tiles.M8, Tiles.P9, Tiles.WS,
      Tiles.S1, Tiles.M2, Tiles.P3, Tiles.DW, Tiles.S4, Tiles.M5
    ],
    readyBarExists: false,
    handSize: 13,
    hasDrawnTile: false,
    isHandOpen: false,
    openMelds: []
  },
  left: {
    seat: undefined,
    riverTiles: [
      Tiles.M1, Tiles.P1, Tiles.S1, Tiles.WE, Tiles.M2, Tiles.P2,
      Tiles.S2, Tiles.WS, Tiles.M3, Tiles.P3
    ],
    readyIndex: 3,
    readyBarExists: true,
    handSize: 13,
    hasDrawnTile: true,
    isHandOpen: false,
    openMelds: []
  },
  wall: {
    top: Array(2).fill(Array(17).fill("back")),
    right: Array(2).fill(Array(17).fill("back")),
    bottom: Array(2).fill(Array(17).fill("back")),
    left: Array(2).fill(Array(17).fill("back"))
  }
};

export function DebugPage() {
  const [showJson, setShowJson] = useState(false);
  const [tableScale, setTableScale] = useState(1);
  const [showRoundFinished, setShowRoundFinished] = useState(false);
  const [currentResultType, setCurrentResultType] = useState<'winning' | 'river-winning' | 'payment' | 'draw' | 'draw-nine' | 'draw-quads' | 'draw-winds' | 'draw-ready' | 'draw-ron' | 'game' | 'multi'>('winning');
  
  // 麻雀牌画像を読み込む
  const tileImages = useTileImages();

  // 複合状態のデータを使用
  const currentData = testTableData;

  // サンプル結果データ（第1結果）
  const sampleResult: WinningResult = {
    wind: Winds.EAST,
    handTiles: [Tiles.DW],
    winningTile: Tiles.DW,
    openMelds: [
      {
        tiles: [Tiles.WE, Tiles.WE, Tiles.WE, Tiles.WE],
        from: Sides.LEFT,
        added: false,
        concealed: false
      },
      {
        tiles: [Tiles.WS, Tiles.WS, Tiles.WS, Tiles.WS],
        from: Sides.LEFT,
        added: false,
        concealed: false
      },
      {
        tiles: [Tiles.WW, Tiles.WW, Tiles.WW, Tiles.WW],
        from: Sides.LEFT,
        added: false,
        concealed: false
      },
      {
        tiles: [Tiles.WN, Tiles.WN, Tiles.WN, Tiles.WN],
        from: Sides.LEFT,
        added: false,
        concealed: false
      },
    ],
    upperIndicators: [Tiles.M5],
    lowerIndicators: [Tiles.M6],
    handTypes: [
      { name: "立直", doubles: 1 },
      { name: "一発", doubles: 1 },
      { name: "門前清自摸和", doubles: 1 },
      { name: "海底撈月", doubles: 1 },
      { name: "場風 東", doubles: 1 },
      { name: "翻牌 白", doubles: 1 },
      { name: "翻牌 發", doubles: 1 },
      { name: "小三元", doubles: 1 },
      { name: "三暗刻", doubles: 1 },
      { name: "三槓子", doubles: 1 },
      { name: "純全帯么九", doubles: 1 },
      { name: "混一色", doubles: 1 },
      { name: "ドラ", doubles: 1 },
      { name: "赤ドラ", doubles: 1 },
      { name: "裏ドラ", doubles: 1 },
    ],
    scoreExpression: "40符5翻 満貫 8000点",
    tsumo: true
  };

  // サンプル結果データ（第2結果）
  const sampleResult2: WinningResult = {
    wind: Winds.SOUTH,
    handTiles: [
      Tiles.M1, Tiles.M1, Tiles.M2, Tiles.M3, Tiles.M4, Tiles.M5, Tiles.M6, Tiles.M7, Tiles.M8, Tiles.M9, Tiles.M9
    ],
    winningTile: Tiles.M9,
    openMelds: [],
    upperIndicators: [Tiles.P2],
    lowerIndicators: [Tiles.P3],
    handTypes: [
      { name: "純正九蓮宝燈", doubles: 13 },
      { name: "門前清自摸和", doubles: 1 },
      { name: "ドラ", doubles: 1 }
    ],
    scoreExpression: "役満 32000点",
    tsumo: true
  };

  // サンプル支払い結果データ
  const samplePayment: PaymentResult[] = [
    {
      side: Sides.SELF,
      wind: Winds.EAST,
      name: "プレイヤー1",
      scoreBefore: 25000,
      scoreAfter: 33000,
      scoreApplied: 8000,
      rankBefore: 2,
      rankAfter: 1
    },
    {
      side: Sides.RIGHT,
      wind: Winds.SOUTH,
      name: "プレイヤー2",
      scoreBefore: 30000,
      scoreAfter: 27000,
      scoreApplied: -3000,
      rankBefore: 1,
      rankAfter: 2
    },
    {
      side: Sides.ACROSS,
      wind: Winds.WEST,
      name: "プレイヤー3",
      scoreBefore: 22000,
      scoreAfter: 19000,
      scoreApplied: -3000,
      rankBefore: 3,
      rankAfter: 4
    },
    {
      side: Sides.LEFT,
      wind: Winds.NORTH,
      name: "プレイヤー4",
      scoreBefore: 18000,
      scoreAfter: 16000,
      scoreApplied: -2000,
      rankBefore: 4,
      rankAfter: 3
    }
  ];

  // サンプル流し満貫データ
  const sampleRiverWinning: RiverWinningResult = {
    wind: Winds.EAST,
    name: "流し満貫",
    scoreExpression: "満貫 8000点",
    handTiles: [
      Tiles.M1, Tiles.M2, Tiles.M3, Tiles.M4, Tiles.M5, Tiles.M6, Tiles.M7, Tiles.M8, Tiles.M9,
      Tiles.P1, Tiles.P2, Tiles.P3, Tiles.P4
    ],
    upperIndicators: [Tiles.S5, Tiles.M9, Tiles.P3]
  };

  // サンプルゲーム結果データ
  const sampleGameResult: GameResult[] = [
    {
      rank: 1,
      name: "プレイヤー1",
      score: 35000,
      resultPoint: 15
    },
    {
      rank: 2,
      name: "プレイヤー2",
      score: 28000,
      resultPoint: 5
    },
    {
      rank: 3,
      name: "プレイヤー3",
      score: 22000,
      resultPoint: -5
    },
    {
      rank: 4,
      name: "プレイヤー4",
      score: 15000,
      resultPoint: -15
    }
  ];

  // 各種結果イベントサンプル
  const resultEvents = {
    winning: {
      type: 'round-finished' as const,
      finishType: 'tsumo' as const,
      winningResults: [sampleResult]
    },
    'river-winning': {
      type: 'round-finished' as const,
      finishType: 'river-winning' as const,
      riverWinningResults: [sampleRiverWinning]
    },
    payment: {
      type: 'round-finished' as const,
      finishType: 'exhauted' as const,
      paymentResults: samplePayment
    },
    draw: {
      type: 'round-finished' as const,
      finishType: 'exhauted' as const
    },
    'draw-nine': {
      type: 'round-finished' as const,
      finishType: 'nine-orphans' as const
    },
    'draw-quads': {
      type: 'round-finished' as const,
      finishType: 'four-quads' as const
    },
    'draw-winds': {
      type: 'round-finished' as const,
      finishType: 'four-winds' as const
    },
    'draw-ready': {
      type: 'round-finished' as const,
      finishType: 'four-players-ready' as const
    },
    'draw-ron': {
      type: 'round-finished' as const,
      finishType: 'three-players-ron' as const
    },
    game: {
      type: 'game-finished' as const,
      gameResults: sampleGameResult
    },
    multi: {
      type: 'round-finished' as const,
      finishType: 'tsumo' as const,
      winningResults: [sampleResult, sampleResult2],
      riverWinningResults: [sampleRiverWinning],
      paymentResults: samplePayment
    }
  };

  // サンプル局情報データ
  const sampleRoundInfo: RoundInfo = {
    roundWind: Winds.EAST,
    roundCount: 3,
    continueCount: 2,
    depositCount: 1,
    last: false
  };

  // サンプル座席情報データ
  const sampleSeats = {
    bottom: {
      side: Sides.SELF,
      seatWind: Winds.EAST,
      name: "プレイヤー1",
      score: 25000,
      rank: 1,
      ready: false
    },
    right: {
      side: Sides.RIGHT,
      seatWind: Winds.SOUTH,
      name: "プレイヤー2",
      score: 24000,
      rank: 2,
      ready: true
    },
    top: {
      side: Sides.ACROSS,
      seatWind: Winds.WEST,
      name: "プレイヤー3",
      score: 26000,
      rank: 3,
      ready: false
    },
    left: {
      side: Sides.LEFT,
      seatWind: Winds.NORTH,
      name: "プレイヤー4",
      score: 25000,
      rank: 4,
      ready: false
    }
  };

  // 結果表示ベースのテーブルデータ
  const tableDataWithResult = {
    ...currentData,
    ...(showRoundFinished && resultEvents[currentResultType].type === 'round-finished'
      ? { roundFinishedEvent: resultEvents[currentResultType] }
      : showRoundFinished && resultEvents[currentResultType].type === 'game-finished'
      ? { gameResults: resultEvents[currentResultType].gameResults }
      : {}),
    roundInfo: sampleRoundInfo,
    // 各方向にseat情報を追加
    bottom: { ...currentData.bottom, seat: sampleSeats.bottom },
    right: { ...currentData.right, seat: sampleSeats.right },
    top: { ...currentData.top, seat: sampleSeats.top },
    left: { ...currentData.left, seat: sampleSeats.left }
  };

  const handleTileClick = (tile: any) => {
    console.log('Tile clicked:', tile);
  };

  const handleActionClick = (action: string) => {
    console.log('Action clicked:', action);
  };

  const resultTypeOptions = [
    { type: 'winning' as const, label: '和了結果' },
    { type: 'river-winning' as const, label: '流し満貫' },
    { type: 'payment' as const, label: '支払い結果' },
    { type: 'draw' as const, label: '流局' },
    { type: 'draw-nine' as const, label: '九種九牌' },
    { type: 'draw-quads' as const, label: '四槓散了' },
    { type: 'draw-winds' as const, label: '四風連打' },
    { type: 'draw-ready' as const, label: '四家立直' },
    { type: 'draw-ron' as const, label: '三家和' },
    { type: 'game' as const, label: 'ゲーム結果' },
    { type: 'multi' as const, label: '複数結果進行' }
  ];

  const handleAcknowledge = () => {
    console.log('Acknowledge clicked - result progression complete');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">麻雀テーブル デバッグページ</h1>
          </div>
          
          {/* 制御パネル */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">スケール:</label>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={tableScale}
                onChange={(e) => setTableScale(Number(e.target.value))}
                className="w-32"
              />
              <span className="text-sm text-gray-600">{tableScale.toFixed(1)}x</span>
            </div>
            
            <button
              onClick={() => setShowJson(!showJson)}
              className={`px-4 py-2 rounded transition-colors ${
                showJson
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {showJson ? 'JSON非表示' : 'JSON表示'}
            </button>
            
            <button
              onClick={() => setShowRoundFinished(!showRoundFinished)}
              className={`px-4 py-2 rounded transition-colors ${
                showRoundFinished
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {showRoundFinished ? '結果表示OFF' : '結果表示ON'}
            </button>
            
            {showRoundFinished && (
              <select
                value={currentResultType}
                onChange={(e) => setCurrentResultType(e.target.value as typeof currentResultType)}
                className="px-3 py-2 border border-gray-300 rounded text-sm"
              >
                {resultTypeOptions.map((option) => (
                  <option key={option.type} value={option.type}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
            
            <div className="text-sm text-gray-600">
              現在のデータ: <span className="font-semibold">複合状態</span>
              {showRoundFinished && <span className="text-blue-600 ml-2">(RoundFinished: {resultTypeOptions.find(o => o.type === currentResultType)?.label})</span>}
            </div>
          </div>
        </div>

        {/* テーブル表示 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">テーブル表示</h2>
          <div className="mb-4">
            <div className="text-sm text-gray-600">
              画像読み込み状況: {tileImages.size} / 36 個
            </div>
          </div>
          <div 
            className="flex justify-center"
            style={{ transform: `scale(${tableScale})`, transformOrigin: 'top center' }}
          >
            {tileImages.size > 0 ? (
              <Table
                table={tableDataWithResult}
                actions={[]}
                onTileClick={handleTileClick}
                onActionClick={handleActionClick}
                onAcknowledge={handleAcknowledge}
              />
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-2">麻雀牌画像を読み込み中...</div>
                <div className="text-sm text-gray-400">
                  画像が読み込まれない場合は、/public/tiles/ フォルダに麻雀牌画像があることを確認してください
                </div>
              </div>
            )}
          </div>
        </div>

        {/* JSON表示 */}
        {showJson && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">JSON データ</h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(tableDataWithResult, null, 2)}
            </pre>
          </div>
        )}

        {/* 使用方法 */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">使用方法</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• 複合状態のテーブル（立直・鳴き・河などが組み合わさった状態）を表示します</p>
            <p>• スケールスライダーでテーブルのサイズを調整できます</p>
            <p>• JSON表示ボタンで現在のデータ構造を確認できます</p>
            <p>• 結果表示ONボタンでRoundFinishedイベントベースの結果表示をテストできます</p>
            <p>• 局情報（例: 東三局 2本場 供託1）がテーブル中央に表示されます</p>
            <p>• 風インジケータ（東西南北）がテーブルの四隅に回転表示されます（立直時は赤、親時は青太字）</p>
            <p>• RoundFinished表示で新しい統一イベントベースの複数結果表示を体験できます（WinningResult→RiverWinningResult→PaymentResult）</p>
            <p>• 牌をクリックすると console.log でクリック情報が表示されます</p>
            <p>• アクションボタンをクリックすると console.log でアクション情報が表示されます</p>
          </div>
        </div>
      </div>
    </div>
  );
}