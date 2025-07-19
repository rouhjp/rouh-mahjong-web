import { memo, useRef, useEffect, useState, Fragment } from "react";
import { Group, Rect, Text } from "react-konva";
import { getScaledRiverResultSize, getScaledSize, getScaledTileSize, TILE_WIDTH } from "../../../../utils/table-constants.js";
import { getRiverResultCenterPoint } from "../../../../utils/table-points.js";
import { FaceUpTile } from "../../atoms/FaceUpTile.js";
import { FaceDownTile } from "../../atoms/FaceDownTile.js";
import { RiverWinningResult } from "@mahjong/core";
import Konva from "konva";

interface Props {
  result?: RiverWinningResult;
  scale?: number;
}

/**
 * 流し満貫の結果を描画するコンポーネント
 * @param result 流し満貫の結果データ
 * @param scale 描画スケール
 */
export const RiverWinningResultView = memo(function RiverWinningResultView({ result, scale = 1 }: Props) {
  // 実際のテキスト幅を管理するstate
  const scoreTextRef = useRef<Konva.Text>(null);
  const [actualTextWidth, setActualTextWidth] = useState(0);

  // テキストの実際の幅を測定
  useEffect(() => {
    if (scoreTextRef.current && result) {
      const measuredWidth = scoreTextRef.current.width();
      setActualTextWidth(measuredWidth);
    }
  }, [result, scale]);

  if (!result) {
    return null;
  }

  const resultSize = getScaledRiverResultSize(scale);
  const centerPoint = getRiverResultCenterPoint(scale);
  const scaledTileSize = getScaledTileSize(scale);
  const scaledMargin = getScaledSize(TILE_WIDTH/2, scale);
  
  // 牌間隔（スケール済み）
  const tileSpacing = scaledTileSize.width * scale;
  
  // 手牌の総幅を計算（流し満貫には和了牌がない）
  const totalHandWidth = result.handTiles.length * tileSpacing;
  
  // 手牌の開始X位置（中央配置）
  const handStartX = (resultSize.width - totalHandWidth) / 2;
  
  // 手牌のY位置
  const handY = 25 * scale;
  
  // ドラ表示のY位置（手牌の下）
  const indicatorsY = handY + scaledTileSize.height + scaledTileSize.depth + 20 * scale;
  
  // ドラ表示の幅を計算（upperIndicators 5枚 + scaledMargin + lowerIndicators 5枚）
  const indicatorsTotalWidth = 5 * tileSpacing + scaledMargin + 5 * tileSpacing;
  
  // ドラ表示の開始X位置（中央配置）
  const indicatorsStartX = (resultSize.width - indicatorsTotalWidth) / 2;
  
  // 役表示のY位置（ドラ表示の下）
  const handTypesY = indicatorsY + scaledTileSize.height + scaledTileSize.depth + 20 * scale;
  
  // 役表示のレイアウト計算
  const handTypeRowWidth = 160 * scale; // 120 + 40
  const handTypesStartX = (resultSize.width - handTypeRowWidth) / 2;
  
  // 点数表示のY位置（役の下）
  const scoreY = handTypesY + 80 * scale + 10 * scale;
  
  // 点数表示テキストの幅（初期値は推定値、実測値で更新される）
  const estimatedTextWidth = result.scoreExpression.length * 20 * scale * 0.8;
  const scoreTextWidth = actualTextWidth > 0 ? actualTextWidth : estimatedTextWidth;
  const scoreUnderlineWidth = scoreTextWidth + 20 * scale; // 少しパディングを追加


  return (
    <Group x={centerPoint.x} y={centerPoint.y}>
      <Rect
        x={0}
        y={0}
        width={resultSize.width}
        height={resultSize.height}
        fill="rgba(255, 255, 255, 0.9)"
        stroke="black"
        strokeWidth={2}
      />
      
      {/* 手牌の表示 */}
      {result.handTiles.map((tile, index) => {
        const point = {
          x: handStartX + index * tileSpacing,
          y: handY
        };
        return (
          <FaceUpTile
            key={index}
            point={point}
            tile={tile}
            facing="top"
          />
        );
      })}
      
      {/* upperIndicators の表示（5枚固定） */}
      {Array.from({ length: 5 }, (_, index) => {
        const tile = result.upperIndicators[index];
        const point = {
          x: indicatorsStartX + index * tileSpacing,
          y: indicatorsY
        };
        
        return tile ? (
          <FaceUpTile
            key={`upper-${index}`}
            point={point}
            tile={tile}
            facing="top"
          />
        ) : (
          <FaceDownTile
            key={`upper-${index}`}
            point={point}
            facing="top"
          />
        );
      })}
      
      {/* lowerIndicators の表示（5枚固定、常に裏向き） */}
      {Array.from({ length: 5 }, (_, index) => {
        const point = {
          x: indicatorsStartX + 5 * tileSpacing + scaledMargin + index * tileSpacing,
          y: indicatorsY
        };
        
        return (
          <FaceDownTile
            key={`lower-${index}`}
            point={point}
            facing="top"
          />
        );
      })}
      
      {/* 役名表示（ResultViewの役表示と同じスタイル） */}
      <Fragment key={`handtype-0`}>
        {/* 下線 */}
        <Rect
          x={handTypesStartX}
          y={handTypesY + 14 * scale}
          width={handTypeRowWidth}
          height={1}
          fill="black"
        />
        {/* 役名表示 */}
        <Text
          x={handTypesStartX}
          y={handTypesY}
          text={result.name}
          fontSize={12 * scale}
          fill="black"
          align="left"
          width={120 * scale}
        />
        {/* 翻数表示は空（満貫なので翻数表示なし） */}
      </Fragment>
      
      {/* scoreExpression の表示（中央揃え、下線付き、大きめフォント） */}
      <Text
        ref={scoreTextRef}
        x={resultSize.width / 2 - scoreTextWidth / 2}
        y={scoreY}
        text={result.scoreExpression}
        fontSize={20 * scale}
        fill="black"
        align="left"
        fontStyle="bold"
      />
      {/* scoreExpression の下線 */}
      <Rect
        x={resultSize.width / 2 - scoreUnderlineWidth / 2}
        y={scoreY + 24 * scale}
        width={scoreUnderlineWidth}
        height={2}
        fill="black"
      />
    </Group>
  );
});