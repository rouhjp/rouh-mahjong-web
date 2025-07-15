import { memo } from "react";
import { Text } from "react-konva";
import type { SeatStatus } from "@mahjong/core";
import { WindInfo } from "@mahjong/core";
import { Direction, getAngle, oppositeOf } from "../../../type";
import { getWindIndicatorPoint } from "../../../functions/points";

export interface WindIndicatorProps {
  direction: Direction;
  seat?: SeatStatus;
  scale?: number;
}

export const WindIndicator = memo(function WindIndicator({
  direction,
  seat,
  scale = 1,
}: WindIndicatorProps) {
  if (!seat) {
    return null;
  }

  const fontSize = 16 * scale;
  const windCharacter = WindInfo[seat.seatWind].name;
  const point = getWindIndicatorPoint(direction);
  const angle = getAngle(oppositeOf(direction));
  
  return (
    <Text
      x={point.x * scale}
      y={point.y * scale}
      text={windCharacter}
      fontSize={fontSize}
      rotation={angle}
      offsetX={fontSize / 2}
      offsetY={fontSize / 2}
    />
  );
});