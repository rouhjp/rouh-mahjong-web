import { memo } from "react";
import { Group, Rect } from "react-konva";
import { TILE_DEPTH, TILE_HEIGHT, TILE_WIDTH } from "../../../utils/table-constants";
import { Point } from "../../../utils/table-points";

interface Props {
  point: Point;
  side: "left" | "right";
}

export const StandingSideTile = memo(function StandingSideTile({
  point: { x, y },
  side,
}: Props) {
  const totalWidth = TILE_DEPTH;
  const totalHeight = TILE_HEIGHT + TILE_WIDTH;
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
        x={TILE_DEPTH / 2}
        y={0}
        width={TILE_DEPTH / 2}
        height={TILE_WIDTH}
        fill={side==="left" ? "gray" : "white"}
      />
      <Rect
        x={0}
        y={0}
        width={TILE_DEPTH / 2}
        height={TILE_WIDTH}
        fill={side==="left" ? "white" : "gray"}
      />
      <Rect
        x={0}
        y={TILE_WIDTH}
        width={TILE_DEPTH}
        height={TILE_HEIGHT}
        stroke={"black"}
        strokeWidth={1}
      />
      <Rect
        x={TILE_DEPTH / 2}
        y={TILE_WIDTH}
        width={TILE_DEPTH / 2}
        height={TILE_HEIGHT}
        fill={side==="left" ? "gray" : "white"}
      />
      <Rect
        x={0}
        y={TILE_WIDTH}
        width={TILE_DEPTH / 2}
        height={TILE_HEIGHT}
        fill={side==="left" ? "white" : "gray"}
      />
    </Group>
  );
});

