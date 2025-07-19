import { memo, useState } from "react";
import { Group, Rect, Text } from "react-konva";
import { StandingFrontTile } from "../atoms/StandingFrontTile.js";
import { WinningTilesBubble } from "../atoms/WinningTilesBubble.js";
import { getHandTilePoint } from "../../../utils/table-points.js";
import { DiscardGuide, Tile } from "@mahjong/core";
import { TILE_WIDTH, TILE_HEIGHT, TILE_DEPTH } from "../../../utils/table-constants.js";

interface Props {
  tiles: Tile[];
  drawnTile?: Tile;
  onTileClick?: (index: number) => void;
  clickableTileIndices?: number[];
  scale?: number;
  guides?: DiscardGuide[];
  readySelected?: boolean;
  disqualified?: boolean;
}

/**
 * 自家の手牌を描画するコンポーネント
 * @param tiles 手牌
 * @param drawnTile ツモ牌
 * @param onTileClick 牌がクリックされたときの処理
 * @param clickableTileIndices クリック可能な牌の位置(指定された場合、それ以外の牌を薄く表示する)
 */
export const StandingFrontHand = memo(function StandingFrontHand({
  tiles,
  drawnTile,
  onTileClick = () => {},
  clickableTileIndices = [],
  scale = 1,
  guides = [],
  readySelected = false,
  disqualified = false
}: Props) {
  const [hoveredTileIndex, setHoveredTileIndex] = useState<number | null>(null);
  const hoverOffset = 5;

  const handleMouseEnter = (index: number) => {
    setHoveredTileIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredTileIndex(null);
  };

  // 全タイル（手牌 + ツモ牌）を統一的に処理
  const allTiles = [...tiles, ...(drawnTile ? [drawnTile] : [])];
  
  return (
    <Group>
      {/* 全てのタイルを描画 */}
      {tiles.map((tile, index) => {
        const point = getHandTilePoint("bottom", index, false);
        const adjustedPoint = hoveredTileIndex === index ? { x: point.x, y: point.y - hoverOffset } : point;
        const isClickable = clickableTileIndices.includes(index);
        const isDimmed = clickableTileIndices.length > 0 && !isClickable;
        
        return (
          <StandingFrontTile
            key={`tile-${index}`}
            point={adjustedPoint}
            tile={tile}
            isDimmed={isDimmed}
            scale={scale}
          />
        );
      })}
      
      {/* ツモ牌を描画 */}
      {drawnTile && (() => {
        const index = tiles.length;
        const point = getHandTilePoint("bottom", tiles.length, true);
        const adjustedPoint = hoveredTileIndex === index ? { x: point.x, y: point.y - hoverOffset } : point;
        const isClickable = clickableTileIndices.includes(index);
        const isDimmed = clickableTileIndices.length > 0 && !isClickable;
        
        return (
          <StandingFrontTile
            key={`drawn-tile`}
            point={adjustedPoint}
            tile={drawnTile}
            isDimmed={isDimmed}
            scale={scale}
          />
        );
      })()}

      {/* 全ての当たり判定エリアを最初に描画 */}
      {allTiles.map((_, index) => {
        const isDrawnTile = index === tiles.length;
        const point = getHandTilePoint("bottom", index, isDrawnTile);
        const scaledTileWidth = TILE_WIDTH * scale;
        const scaledTileHeight = TILE_HEIGHT * scale;
        const scaledTileDepth = TILE_DEPTH * scale;
        const totalTileHeight = scaledTileHeight + scaledTileDepth;
        
        return (
          <Rect
            key={`hover-area-${index}`}
            x={point.x}
            y={point.y - hoverOffset}
            width={scaledTileWidth}
            height={totalTileHeight + hoverOffset}
            fill="transparent"
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            onClick={() => onTileClick(index)}
          />
        );
      })}
      
      {/* バブルを最後に描画 */}
      {hoveredTileIndex !== null && (() => {
        const isDrawnTile = hoveredTileIndex === tiles.length;
        const targetTile = isDrawnTile ? drawnTile! : tiles[hoveredTileIndex];
        const winnings = guides.find(guide => guide.discardingTile === targetTile)?.winnings || [];
        const disqualified = guides.find(guide => guide.discardingTile === targetTile)?.disqualified || false;
        const point = getHandTilePoint("bottom", hoveredTileIndex, isDrawnTile);
        
        return (
          <WinningTilesBubble
            key="bubble"
            winnings={winnings}
            disqualified={disqualified}
            point={{ x: point.x, y: point.y }}
            scale={scale * 0.8}
            darkenIfNoScore={!readySelected}
          />
        );
      })()}
      
      {disqualified && (() => {
        const x = getHandTilePoint("bottom", tiles.length + 1, true).x + 5;
        const y = 570;
        const fontSize = 8 * scale;
        return (
          <Text
            x={x}
            y={y}
            text={"フリテン"}
            fontSize={fontSize}
            fill="black"
            fontFamily="Arial, sans-serif"
          />
        );
      })()}
    </Group>
  );
});

