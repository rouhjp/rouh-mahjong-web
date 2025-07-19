import { memo } from "react";
import { Text } from "react-konva";
import type { SeatStatus } from "@mahjong/core";
import { Direction, getAngle, oppositeOf } from "../../../../types/table.js";
import { getScoreIndicatorPoint } from "../../../../utils/table-points.js";

export interface ScoreIndicatorProps {
  direction: Direction;
  seat?: SeatStatus;
  scale?: number;
}

export const ScoreIndicator = memo(function ScoreIndicator({
  direction,
  seat,
  scale = 1,
}: ScoreIndicatorProps) {
  if (!seat) {
    return null;
  }

  const fontSize = 11 * scale;
  const scoreText = seat.score.toLocaleString();
  const point = getScoreIndicatorPoint(direction);
  const angle = getAngle(oppositeOf(direction));
  
  // 負の点数は赤色、それ以外は黒色
  const textColor = seat.score < 0 ? "red" : "black";
  
  return (
    <Text
      x={point.x * scale}
      y={point.y * scale}
      text={scoreText}
      fontSize={fontSize}
      rotation={angle}
      offsetX={fontSize * scoreText.length / 4}
      offsetY={fontSize / 2}
      fill={textColor}
      fontFamily="Arial, sans-serif"
      fontStyle="bold"
    />
  );
});