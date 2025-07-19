import { memo } from "react";
import { Group, Rect, Image } from "react-konva";
import { Direction, getAngle, isSideways } from "../../../types/table.js";
import { useTileImages } from "../../../hooks/useTileImages.js";
import { TILE_DEPTH, TILE_HEIGHT, TILE_WIDTH } from "../../../utils/table-constants.js";
import { Point } from "../../../utils/table-points.js";
import { Tile } from "@mahjong/core";

interface Props {
  point: Point;
  tile: Tile;
  facing: Direction;
  highlight?: boolean;
  scale?: number;
}

export const FaceUpTile = memo(function FaceUpTile({
  point: { x, y },
  tile,
  facing,
  highlight = false,
  scale = 1,
}: Props) {
  const images = useTileImages();
  const angle = getAngle(facing);
  const scaledTileWidth = TILE_WIDTH * scale;
  const scaledTileHeight = TILE_HEIGHT * scale;
  const scaledTileDepth = TILE_DEPTH * scale;
  const rotatedWidth = isSideways(facing) ? scaledTileHeight : scaledTileWidth;
  const rotatedHeight = isSideways(facing) ? scaledTileWidth : scaledTileHeight;
  const totalWidth = rotatedWidth;
  const totalHeight = rotatedHeight + scaledTileDepth;
  const adjustedX = (facing === "top" || facing === "left") ? 0 : rotatedWidth;
  const adjustedY = (facing === "top" || facing === "right") ? 0 : rotatedHeight;
  return (
    <Group x={x} y={y}>
      <Rect
        x={0}
        y={0}
        width={totalWidth}
        height={totalHeight}
        stroke="black"
        strokeWidth={scale}
      />
      <Rect
        x={0}
        y={rotatedHeight + scaledTileDepth / 2} 
        width={rotatedWidth}
        height={scaledTileDepth / 2}
        fill="gray"
      />
      <Rect
        x={0}
        y={rotatedHeight}
        width={rotatedWidth}
        height={scaledTileDepth / 2}
        fill="white"
      />
      <Image
        x={adjustedX}
        y={adjustedY}
        image={images.get(tile)}
        width={scaledTileWidth}
        height={scaledTileHeight}
        stroke={"black"}
        strokeWidth={scale}
        rotation={angle}
      />
      {highlight && (
        <Rect
          x={0}
          y={0}
          width={totalWidth}
          height={totalHeight}
          stroke="red"
          strokeWidth={3 * scale}
          fill=""
        />
      )}
    </Group>
  );
});
