import { Group } from "react-konva";
import { memo } from "react";
import { getHandTilePoint } from "../../functions/points";
import { StandingSideTile } from "../atoms/StaindingSideTile";
import { StandingBackTile } from "../atoms/StandingBackTile";

interface Props {
  side: "left" | "top" | "right";
  handSize: number;
  hasDrawnTile: boolean;
}

export const StandingSideHand = memo(function StandingSideHand({
  side,
  handSize,
  hasDrawnTile,
}: Props) {
  const needReverse = side === "right";
  return (
    <Group>
      {hasDrawnTile && needReverse &&
        <StandingSideTile point={getHandTilePoint(side, handSize, true)} side={side} />
      }
      {Array.from({ length: handSize }, (_, index) => {
        const adjustedIndex = needReverse ? handSize - 1 - index : index;
        const point = getHandTilePoint(side, adjustedIndex, false);
        if (side === "top") { 
          return <StandingBackTile key={adjustedIndex} point={point} />
        } else {
          return <StandingSideTile key={adjustedIndex} point={point} side={side} />
        }
      })}
      {hasDrawnTile && !needReverse && side === "top" &&
        <StandingBackTile point={getHandTilePoint(side, handSize, true)} />
      }
      {hasDrawnTile && !needReverse && side !== "top" &&
        <StandingSideTile point={getHandTilePoint(side, handSize, true)} side={side} />
      }
    </Group>
  );
});
