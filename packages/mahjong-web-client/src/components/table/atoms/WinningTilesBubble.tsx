import { memo } from "react";
import { Group, Rect, Text, Line } from "react-konva";
import { Point } from "../../../utils/table-points.js";
import { Tile } from "@mahjong/core";
import { TILE_WIDTH, TILE_HEIGHT, TILE_DEPTH, TABLE_WIDTH } from "../../../utils/table-constants.js";
import { StandingFrontTile } from "./StandingFrontTile.js";

interface Props {
  winnings: { tile: Tile, noScore: boolean }[];
  disqualified: boolean;
  point: Point;
  scale?: number;
  darkenIfNoScore?: boolean;
}

/**
 * 和了牌一覧をふきだし形式で表示するコンポーネント
 */
export const WinningTilesBubble = memo(function WinningTilesBubble({
  winnings,
  disqualified,
  point: { x, y },
  scale = 1,
  darkenIfNoScore = true,
}: Props) {
  if (winnings.length === 0) {
    return null;
  }
  
  // DiscardGuideから和了牌とdisqualifiedを抽出

  // 3Dタイルのサイズ計算
  const scaledTileWidth = TILE_WIDTH * scale;
  const scaledTileHeight = TILE_HEIGHT * scale;
  const scaledTileDepth = TILE_DEPTH * scale;
  const totalTileHeight = scaledTileHeight + scaledTileDepth;
  
  // テキストのサイズ計算
  const textHeight = disqualified ? 10 * scale : 0;
  const textPadding = disqualified ? 4 * scale : 0;
  const textWidth = disqualified ? 65 * scale : 0;
  
  const padding = 8 * scale;
  const bubbleWidth = Math.max(winnings.length * scaledTileWidth + padding * 2, textWidth + textPadding * 2);
  const bubbleHeight = textHeight + totalTileHeight + padding * 2;
  const arrowSize = 6 * scale;
  
  // ふきだしの基本位置計算（手牌の上部中央）
  let adjustedBubbleX = x + scaledTileWidth/2 - bubbleWidth / 2;
  let adjustedBubbleY = y - bubbleHeight - arrowSize - (5 * scale);
  
  // テーブル境界内に収まるよう調整
  adjustedBubbleX = Math.max(0, Math.min(TABLE_WIDTH - bubbleWidth, adjustedBubbleX));
  adjustedBubbleY = Math.max(0, adjustedBubbleY);
  
  // 矢印のX位置を調整（元の手牌位置を基準、だだしバブル境界内に制限）
  const arrowX = x + scaledTileWidth/2;
  
  const bubbleX = adjustedBubbleX;
  const bubbleY = adjustedBubbleY;
  const tileXOffset = bubbleX + (bubbleWidth - winnings.length * scaledTileWidth) / 2;
  const tileYOffset = bubbleY + textHeight + padding;

  return (
    <Group>
      {/* ふきだし背景 */}
      <Rect
        x={bubbleX}
        y={bubbleY}
        width={bubbleWidth}
        height={bubbleHeight}
        fill="white"
        stroke="black"
        strokeWidth={1}
        cornerRadius={4 * scale}
        shadowColor="black"
        shadowBlur={4 * scale}
        shadowOffset={{ x: 2 * scale, y: 2 * scale }}
        shadowOpacity={0.3}
      />
      
      {/* 下向きの三角形矢印 */}
      <Line
        points={[
          arrowX, bubbleY + bubbleHeight + arrowSize - 1,
          arrowX - arrowSize, bubbleY + bubbleHeight - 1,
          arrowX + arrowSize, bubbleY + bubbleHeight - 1
        ]}
        closed={true}
        fill="white"
        stroke="black"
        strokeWidth={1}
      />
      
      {/* 三角形の上部線を隐すための白い線 */}
      <Line
        points={[
          arrowX - arrowSize, bubbleY + bubbleHeight - 1,
          arrowX + arrowSize, bubbleY + bubbleHeight - 1
        ]}
        stroke="white"
        strokeWidth={2}
      />

      {/* タイトルテキスト */}
      {disqualified &&
        <Text
          x={bubbleX + textPadding}
          y={bubbleY + textPadding}
          text="⚠️フリテン"
          fontSize={12 * scale}
          fontFamily="Arial, sans-serif"
          fill="black"
          align="center"
          width={textWidth}
        />
      }
      
      {winnings.map((winning, index) => (
        <StandingFrontTile
          key={`${winning.tile}-${index}`}
          point={{ x: tileXOffset + index * scaledTileWidth, y: tileYOffset }}
          tile={winning.tile}
          isDimmed={darkenIfNoScore && winning.noScore}
          scale={scale}
        />
      ))}
    </Group>
  );
});