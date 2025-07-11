import { memo } from "react";
import { Group, Rect } from "react-konva";
import type { WinningResult } from "@mahjong/core";
import { getScaledResultSize, getScaledSize, getScaledTileSize, TILE_WIDTH } from "../../functions/constants";
import { getResultCenterPoint } from "../../functions/points";
import { FaceUpTile } from "../atoms/FaceUpTile";
import { FaceDownTile } from "../atoms/FaceDownTile";

interface Props {
  result?: WinningResult;
  scale?: number;
}

export const ResultView = memo(function ResultView({ result, scale = 1 }: Props) {
  if (!result) {
    return null;
  }

  const resultSize = getScaledResultSize(scale);
  const centerPoint = getResultCenterPoint(scale);
  const scaledTileSize = getScaledTileSize(scale);
  const scaledMargin = getScaledSize(TILE_WIDTH/2, scale);
  
  // 牌間隔（スケール済み）
  const tileSpacing = scaledTileSize.width + 2 * scale;
  
  // 副露面子の総幅を計算
  const meldsWidth = result.openMelds.reduce((total, meld) => {
    return total + meld.tiles.length * tileSpacing + scaledMargin;
  }, 0);
  
  // 手牌 + 和了牌 + 副露の総幅を計算
  const totalHandWidth = result.handTiles.length * tileSpacing;
  const winningTileWidth = scaledTileSize.width + scaledMargin;
  const totalWidth = totalHandWidth + winningTileWidth + meldsWidth;
  
  // 手牌の開始X位置（中央配置）
  const handStartX = (resultSize.width - totalWidth) / 2;
  
  // 手牌のY位置
  const handY = 50 * scale;

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
      
      {/* 副露面子の表示 */}
      {result.openMelds.map((meld, meldIndex) => {
        // 現在の面子の開始X位置を計算
        const meldStartX = handStartX + totalHandWidth + winningTileWidth + 
          result.openMelds.slice(0, meldIndex).reduce((total, prevMeld) => {
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
    </Group>
  );
});