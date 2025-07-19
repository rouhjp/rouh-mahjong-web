import { memo } from "react";
import { Group, Rect, Image } from "react-konva";
import type { Tile } from "@mahjong/core";
import { useTileImages } from "../../../hooks/useTileImages.js";
import { TILE_DEPTH, TILE_HEIGHT, TILE_WIDTH } from "../../../utils/table-constants.js";
import { Point } from "../../../utils/table-points.js";

interface Props {
  point: Point;
  tile: Tile;
  onClick?: () => void;
  isDimmed?: boolean;
  scale?: number;
}

export const StandingFrontTile = memo(function StandingFrontTile({
  point: { x, y },
  tile,
  onClick,
  isDimmed = false,
  scale = 1,
}: Props) {
  const images = useTileImages();
  const scaledTileWidth = TILE_WIDTH * scale;
  const scaledTileHeight = TILE_HEIGHT * scale;
  const scaledTileDepth = TILE_DEPTH * scale;
  const totalWidth = scaledTileWidth;
  const totalHeight = scaledTileHeight + scaledTileDepth;

  return (
    <Group 
      x={x} 
      y={y}
      onClick={onClick}
      onTap={onClick}
    >
      <Rect
        x={0}
        y={0}
        width={totalWidth}
        height={totalHeight}
        stroke={"black"}
        strokeWidth={1}
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
