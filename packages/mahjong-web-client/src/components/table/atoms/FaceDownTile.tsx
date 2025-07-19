import { memo } from "react";
import { Group, Rect } from "react-konva";
import { Direction, isSideways } from "../../../types/table.js";
import { TILE_DEPTH, TILE_HEIGHT, TILE_WIDTH } from "../../../utils/table-constants.js";
import { Point } from "../../../utils/table-points.js";

interface Props {
  point: Point;
  facing: Direction;
}

export const FaceDownTile = memo(function FaceDwonTile({
  point: { x, y },
  facing,
}: Props) {
  const rotatedWidth = isSideways(facing) ? TILE_HEIGHT : TILE_WIDTH;
  const rotatedHeight = isSideways(facing) ? TILE_WIDTH : TILE_HEIGHT;
  const totalWidth = rotatedWidth;
  const totalHeight = rotatedHeight + TILE_DEPTH;
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
        y={rotatedHeight}
        width={rotatedWidth}
        height={TILE_DEPTH / 2}
        fill="gray"
      />
      <Rect
        x={0}
        y={rotatedHeight + TILE_DEPTH / 2} 
        width={rotatedWidth}
        height={TILE_DEPTH / 2}
        fill="white"
      />
      <Rect
        x={0}
        y={0}
        width={rotatedWidth}
        height={rotatedHeight}
        stroke={"black"}
        strokeWidth={1}
      />
      <Rect
        x={0}
        y={0}
        width={rotatedWidth}
        height={rotatedHeight}
        fill="gray"
      />
    </Group>
  );
});
