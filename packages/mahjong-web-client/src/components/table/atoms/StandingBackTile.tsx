import { memo } from "react";
import { Group, Rect } from "react-konva";
import { TILE_DEPTH, TILE_HEIGHT, TILE_WIDTH } from "../../../utils/table-constants.js";
import { Point } from "../../../utils/table-points.js";

interface Props {
  point: Point;
}

export const StandingBackTile = memo(function StandingBackTile({
  point: { x, y },
}: Props) {
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
        fill="white"
      />
      <Rect
        x={0}
        y={TILE_DEPTH / 2}
        width={TILE_WIDTH}
        height={TILE_DEPTH / 2}
        fill="gray"
      />
      <Rect
        x={0}
        y={TILE_DEPTH}
        width={TILE_WIDTH}
        height={TILE_HEIGHT}
        stroke={"black"}
        strokeWidth={1}
      />
      <Rect
        x={0}
        y={TILE_DEPTH}
        width={TILE_WIDTH}
        height={TILE_HEIGHT}
        fill="gray"
      />
    </Group>
  );
});
