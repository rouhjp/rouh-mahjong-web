import { memo } from "react";
import { Group, Rect, Image } from "react-konva";
import type { Tile } from "@mahjong/core";
import { Direction, getAngle, isSideways } from "../../type";
import { useTileImages } from "../../hooks/useTileImages";
import { TILE_DEPTH, TILE_HEIGHT, TILE_WIDTH } from "../../functions/constants";
import { Point } from "../../functions/points";

interface Props {
  point: Point;
  tile: Tile;
  facing: Direction;
}

export const FaceUpTile = memo(function FaceUpTile({
  point: { x, y },
  tile,
  facing,
}: Props) {
  const images = useTileImages();
  const angle = getAngle(facing);
  const rotatedWidth = isSideways(facing) ? TILE_HEIGHT : TILE_WIDTH;
  const rotatedHeight = isSideways(facing) ? TILE_WIDTH : TILE_HEIGHT;
  const totalWidth = rotatedWidth;
  const totalHeight = rotatedHeight + TILE_DEPTH;
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
        strokeWidth={1}
      />
      <Rect
        x={0}
        y={rotatedHeight + TILE_DEPTH / 2} 
        width={rotatedWidth}
        height={TILE_DEPTH / 2}
        fill="gray"
      />
      <Rect
        x={0}
        y={rotatedHeight}
        width={rotatedWidth}
        height={TILE_DEPTH / 2}
        fill="white"
      />
      <Image
        x={adjustedX}
        y={adjustedY}
        image={images.get(tile)}
        width={TILE_WIDTH}
        height={TILE_HEIGHT}
        stroke={"black"}
        strokeWidth={1}
        rotation={angle}
      />
    </Group>
  );
});
