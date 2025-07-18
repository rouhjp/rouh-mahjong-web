import { memo } from "react";
import { Group, Rect, Image } from "react-konva";
import type { Tile } from "@mahjong/core";
import { useTileImages } from "../../../hooks/useTileImages";
import { TILE_DEPTH, TILE_HEIGHT, TILE_WIDTH } from "../../../utils/table-constants";
import { Point } from "../../../utils/table-points";

interface Props {
  point: Point;
  tile: Tile;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isClickable?: boolean;
  isDimmed?: boolean;
  isHovered?: boolean;
  scale?: number;
}

export const StandingFrontTile = memo(function StandingFrontTile({
  point: { x, y },
  tile,
  onClick,
  onMouseEnter,
  onMouseLeave,
  isClickable = false,
  isDimmed = false,
  isHovered = false,
  scale = 1,
}: Props) {
  const images = useTileImages();
  const scaledTileWidth = TILE_WIDTH * scale;
  const scaledTileHeight = TILE_HEIGHT * scale;
  const scaledTileDepth = TILE_DEPTH * scale;
  const totalWidth = scaledTileWidth;
  const totalHeight = scaledTileHeight + scaledTileDepth;
  
  const handleClick = () => {
    if (isClickable && onClick) {
      onClick();
    }
  };


  return (
    <Group 
      x={x} 
      y={y}
      onClick={handleClick}
      onTap={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor: isClickable ? 'pointer' : 'default' }}
    >
      <Rect
        x={0}
        y={0}
        width={totalWidth}
        height={totalHeight}
        stroke={isClickable && isHovered ? "blue" : "black"}
        strokeWidth={isClickable && isHovered ? 2 : 1}
        fill={isClickable && isHovered ? "rgba(0, 100, 255, 0.1)" : "transparent"}
      />
      <Rect
        x={0}
        y={0} 
        width={scaledTileWidth}
        height={scaledTileDepth / 2}
        fill="gray"
      />
      <Rect
        x={0}
        y={scaledTileDepth / 2}
        width={scaledTileWidth}
        height={scaledTileDepth / 2}
        fill="white"
      />
      <Image
        x={0}
        y={scaledTileDepth}
        image={images.get(tile)}
        width={scaledTileWidth}
        height={scaledTileHeight}
        stroke={"black"}
        strokeWidth={scale}
      />
      {isDimmed && (
        <Rect
          x={0}
          y={0}
          width={totalWidth}
          height={totalHeight}
          fill="rgba(0, 0, 0, 0.6)"
        />
      )}
      
    </Group>
  );
});
