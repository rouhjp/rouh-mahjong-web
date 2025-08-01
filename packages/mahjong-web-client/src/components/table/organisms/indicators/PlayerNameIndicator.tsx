import { memo } from "react";
import { Text } from "react-konva";
import type { SeatStatus } from "@mahjong/core";
import { Direction, getAngle, oppositeOf } from "../../../../types/table.js";
import { getPlayerNameIndicatorPoint } from "../../../../utils/table-points.js";

export interface PlayerNameIndicatorProps {
  direction: Direction;
  seat?: SeatStatus;
  scale?: number;
}

export const PlayerNameIndicator = memo(function PlayerNameIndicator({
  direction,
  seat,
  scale = 1,
}: PlayerNameIndicatorProps) {
  if (!seat) {
    return null;
  }

  const fontSize = 12 * scale;
  const playerName = seat.name;
  const point = getPlayerNameIndicatorPoint(direction);
  const angle = getAngle(oppositeOf(direction));
  
  return (
    <Text
      x={point.x}
      y={point.y}
      text={playerName}
      fontSize={fontSize}
      rotation={angle}
      offsetX={fontSize * playerName.length / 4}
      offsetY={fontSize / 2}
      fill="black"
      fontFamily="Arial, sans-serif"
    />
  );
});