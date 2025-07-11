import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Table } from '../components/table';
import { debugTableDataSets, type DebugTableDataKey } from '../utils/debugTableData';
import { useTileImages } from '../components/table/hooks/useTileImages';
import { Tiles, type WinningResult, Winds, Sides } from '@mahjong/core';

export function DebugPage() {
  const [currentDataKey, setCurrentDataKey] = useState<DebugTableDataKey>('initial');
  const [showJson, setShowJson] = useState(false);
  const [tableScale, setTableScale] = useState(1);
  const [showResult, setShowResult] = useState(false);
  
  // 麻雀牌画像を読み込む
  const tileImages = useTileImages();

  const currentData = debugTableDataSets[currentDataKey];

  // サンプル結果データ
  const sampleResult: WinningResult = {
    wind: Winds.EAST,
    handTiles: [
      Tiles.DW
    ],
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

  // ResultViewを表示する場合のテーブルデータ
  const tableDataWithResult = showResult ? { ...currentData, result: sampleResult } : currentData;

  const dataOptions: Array<{ key: DebugTableDataKey; label: string; description: string }> = [
    { key: 'initial', label: '初期状態', description: '空のテーブル' },
    { key: 'withHandTiles', label: '手牌あり', description: '自分の手牌とツモ牌が表示' },
    { key: 'withRiverTiles', label: '河牌あり', description: '全員の河に牌がある状態' },
    { key: 'withReady', label: '立直あり', description: '立直棒が表示されている状態' },
    { key: 'withMelds', label: '鳴きあり', description: 'ポン・チー・カンがある状態' },
    { key: 'complex', label: '複合状態', description: '立直・鳴き・河などが組み合わさった状態' }
  ];

  const handleTileClick = (tile: any) => {
    console.log('Tile clicked:', tile);
  };

  const handleActionClick = (action: string) => {
    console.log('Action clicked:', action);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">麻雀テーブル デバッグページ</h1>
            <Link 
              to="/" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
            >
              メインアプリに戻る
            </Link>
          </div>
          
          {/* データ選択 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {dataOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => setCurrentDataKey(option.key)}
                className={`p-4 rounded-lg border-2 transition-colors text-left ${
                  currentDataKey === option.key
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
              >
                <div className="font-semibold">{option.label}</div>
                <div className="text-sm text-gray-600">{option.description}</div>
              </button>
            ))}
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
              onClick={() => setShowResult(!showResult)}
              className={`px-4 py-2 rounded transition-colors ${
                showResult
                  ? 'bg-purple-500 hover:bg-purple-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {showResult ? '結果非表示' : '結果表示'}
            </button>
            
            <div className="text-sm text-gray-600">
              現在のデータ: <span className="font-semibold">{currentDataKey}</span>
            </div>
          </div>
        </div>

        {/* テーブル表示 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">テーブル表示</h2>
          <div className="mb-4">
            <div className="text-sm text-gray-600">
              画像読み込み状況: {tileImages.size} / {Object.keys(debugTableDataSets).length > 0 ? '36' : '0'} 個
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

        {/* 結果データ表示 */}
        {showResult && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">結果データ (サンプル)</h2>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-700 mb-2"><strong>自風:</strong> 東</p>
              <p className="text-sm text-gray-700 mb-2"><strong>手牌:</strong> 一萬×3, 二萬, 三萬, 四萬, 五萬, 六萬, 七萬, 八萬, 九萬×3</p>
              <p className="text-sm text-gray-700 mb-2"><strong>和了牌:</strong> 二萬</p>
              <p className="text-sm text-gray-700 mb-2"><strong>副露:</strong> 一筒×3 (左家から)</p>
              <p className="text-sm text-gray-700 mb-2"><strong>役:</strong> 断ヤオ九(1翻), 立直(1翻)</p>
              <p className="text-sm text-gray-700"><strong>点数:</strong> 2000点</p>
            </div>
          </div>
        )}

        {/* 使用方法 */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">使用方法</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• 上のボタンで異なるテーブル状態を切り替えてテストできます</p>
            <p>• スケールスライダーでテーブルのサイズを調整できます</p>
            <p>• JSON表示ボタンで現在のデータ構造を確認できます</p>
            <p>• 結果表示ボタンでResultView（46:34サイズの白い矩形）を表示できます</p>
            <p>• 牌をクリックすると console.log でクリック情報が表示されます</p>
            <p>• アクションボタンをクリックすると console.log でアクション情報が表示されます</p>
          </div>
        </div>
      </div>
    </div>
  );
}