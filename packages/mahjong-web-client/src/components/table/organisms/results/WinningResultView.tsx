import { memo, useRef, useEffect, useState, Fragment } from "react";
import { Group, Rect, Text } from "react-konva";
import { getScaledResultSize, getScaledSize, getScaledTileSize, TILE_WIDTH } from "../../../../utils/table-constants.js";
import { getResultCenterPoint } from "../../../../utils/table-points.js";
import { FaceUpTile } from "../../atoms/FaceUpTile.js";
import { FaceDownTile } from "../../atoms/FaceDownTile.js";
import { WinningResult } from "@mahjong/core";
import Konva from "konva";

interface Props {
  result?: WinningResult;
  scale?: number;
}

/**
 * 和了結果を描画するコンポーネント
 * @param result 和了結果データ
 * @param scale 描画スケール
 */
export const WinningResultView = memo(function ResultView({ result, scale = 1 }: Props) {
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

  const resultSize = getScaledResultSize(scale);
  const centerPoint = getResultCenterPoint(scale);
  const scaledTileSize = getScaledTileSize(scale);
  const scaledMargin = getScaledSize(TILE_WIDTH/2, scale);
  
  // 牌間隔（スケール済み）
  const tileSpacing = scaledTileSize.width * scale;
  
  // 副露面子の総幅を計算
  const meldsWidth = result.openMelds.reduce((total, meld) => {
    return total + meld.tiles.length * tileSpacing + scaledMargin;
  }, 0);
  const reversedOpenMelds = [...result.openMelds].reverse();
  
  // 手牌 + 和了牌 + 副露の総幅を計算
  const totalHandWidth = result.handTiles.length * tileSpacing;
  const winningTileWidth = scaledTileSize.width + scaledMargin;
  const totalWidth = totalHandWidth + winningTileWidth + meldsWidth;
  
  // 手牌の開始X位置（中央配置）
  const handStartX = (resultSize.width - totalWidth) / 2;
  
  // 手牌のY位置
  const handY = 25 * scale;
  
  // ドラ表示のY位置（手牌の下）
  const indicatorsY = handY + scaledTileSize.height + scaledTileSize.depth + 20 * scale;
  
  // ドラ表示全体の幅を計算（upperIndicators 5枚 + scaledMargin + lowerIndicators 5枚）
  const indicatorsTotalWidth = 5 * tileSpacing + scaledMargin + 5 * tileSpacing;
  
  // ドラ表示の開始X位置（中央配置）
  const indicatorsStartX = (resultSize.width - indicatorsTotalWidth) / 2;
  
  // 役表示のY位置（ドラ表示の下）
  const handTypesY = indicatorsY + scaledTileSize.height + scaledTileSize.depth + 20 * scale;
  
  // 役表示のレイアウト計算（最大8列、超えた場合は2列）
  const maxRowsPerColumn = 8;
  const handTypeRowWidth = 160 * scale; // 120 + 40
  const columnSpacing = 20 * scale;
  const needsTwoColumns = result.handTypes.length > maxRowsPerColumn;
  const totalHandTypesWidth = needsTwoColumns 
    ? handTypeRowWidth * 2 + columnSpacing 
    : handTypeRowWidth;
  const handTypesStartX = (resultSize.width - totalHandTypesWidth) / 2;
  
  // 点数表示のY位置（役の下、常に8行分の位置）
  const scoreY = handTypesY + maxRowsPerColumn * 18 * scale + 10 * scale;
  
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
      
      {/* 和了牌の表示 */}
      <FaceUpTile
        point={{
          x: handStartX + totalHandWidth + scaledMargin,
          y: handY
        }}
        tile={result.winningTile}
        facing="top"
      />
      
      {/* ツモ/ロン表示 */}
      <Text
        x={handStartX + totalHandWidth + scaledMargin - 5*scale}
        y={handY - 15 * scale}
        text={result.tsumo ? "ツモ" : "ロン"}
        fontSize={12 * scale}
        fill="black"
        align="center"
        width={30 * scale}
      />
      
      {/* 副露面子の表示 */}
      {reversedOpenMelds.map((meld, meldIndex) => {
        // 現在の面子の開始X位置を計算
        const meldStartX = handStartX + totalHandWidth + winningTileWidth + 
          reversedOpenMelds.slice(0, meldIndex).reduce((total, prevMeld) => {
            return total + prevMeld.tiles.length * tileSpacing + scaledMargin;
          }, 0) + scaledMargin;
        
        return meld.tiles.map((tile, tileIndex) => {
          const point = {
            x: meldStartX + tileIndex * tileSpacing,
            y: handY
          };
          
          // 暗槓の場合、0番目と3番目を裏向きで表示
          const shouldBeFaceDown = meld.concealed && (tileIndex === 0 || tileIndex === 3);
          
          return shouldBeFaceDown ? (
            <FaceDownTile
              key={`meld-${meldIndex}-tile-${tileIndex}`}
              point={point}
              facing="top"
            />
          ) : (
            <FaceUpTile
              key={`meld-${meldIndex}-tile-${tileIndex}`}
              point={point}
              tile={tile}
              facing="top"
            />
          );
        });
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
      
      {/* lowerIndicators の表示（5枚固定） */}
      {Array.from({ length: 5 }, (_, index) => {
        const tile = result.lowerIndicators[index];
        const point = {
          x: indicatorsStartX + 5 * tileSpacing + scaledMargin + index * tileSpacing,
          y: indicatorsY
        };
        
        return tile ? (
          <FaceUpTile
            key={`lower-${index}`}
            point={point}
            tile={tile}
            facing="top"
          />
        ) : (
          <FaceDownTile
            key={`lower-${index}`}
            point={point}
            facing="top"
          />
        );
      })}
      
      {/* handTypes の表示（最大8列、超えた場合は2列） */}
      {result.handTypes.map((handType, index) => {
        const columnIndex = Math.floor(index / maxRowsPerColumn);
        const rowIndex = index % maxRowsPerColumn;
        const xOffset = columnIndex * (handTypeRowWidth + columnSpacing);
        const yPosition = handTypesY + rowIndex * 18 * scale;
        const xPosition = handTypesStartX + xOffset;
        
        return (
          <Fragment key={`handtype-${index}`}>
            {/* 下線 */}
            <Rect
              x={xPosition}
              y={yPosition + 14 * scale}
              width={handTypeRowWidth}
              height={1}
              fill="black"
            />
            {/* 役名表示 */}
            <Text
              x={xPosition}
              y={yPosition}
              text={handType.name}
              fontSize={12 * scale}
              fill="black"
              align="left"
              width={120 * scale}
            />
            {/* 翻数表示 */}
            <Text
              x={xPosition + 120 * scale}
              y={yPosition}
              text={handType.doubles ? `${handType.doubles}翻` : ''}
              fontSize={12 * scale}
              fill="black"
              align="left"
              width={40 * scale}
            />
          </Fragment>
        );
      })}
      
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