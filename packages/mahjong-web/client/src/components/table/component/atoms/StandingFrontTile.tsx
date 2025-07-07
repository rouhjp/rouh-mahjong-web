import { memo } from "react";
import { Group, Rect, Image } from "react-konva";
import type { Tile } from "@mahjong/core";
import { useTileImages } from "../../hooks/useTileImages";
import { TILE_DEPTH, TILE_HEIGHT, TILE_WIDTH } from "../../functions/constants";
import { Point } from "../../functions/points";

interface Props {
  point: Point;
  tile: Tile;
}

export const StandingFrontTile = memo(function StandingFrontTile({
  point: { x, y },
  tile,
}: Props) {
  const images = useTileImages();
  const totalWidth = TILE_WIDTH;
  const totalHeight = TILE_HEIGHT + TILE_DEPTH;
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
        y={0} 
        width={TILE_WIDTH}
        height={TILE_DEPTH / 2}
        fill="gray"
      />
      <Rect
        x={0}
        y={TILE_DEPTH / 2}
        width={TILE_WIDTH}
        height={TILE_DEPTH / 2}
        fill="white"
      />
      <Image
        x={0}
        y={TILE_DEPTH}
        image={images.get(tile)}
        width={TILE_WIDTH}
        height={TILE_HEIGHT}
        stroke={"black"}
        strokeWidth={1}
      />
    </Group>
  );
});
