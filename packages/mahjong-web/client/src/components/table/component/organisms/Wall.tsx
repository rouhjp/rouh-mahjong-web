import { memo } from "react";
import { Direction, isTile, oppositeOf, Slot } from "../../type";
import { FaceUpTile } from "../atoms/FaceUpTile";
import { FaceDownTile } from "../atoms/FaceDownTile";
import { getWallTilePoint } from "../../functions/points";

interface Props {
  side: Direction;
  slots: Slot[];
}

export const Wall = memo(function Wall({
  side,
  slots,
}: Props){
  const needReverse = side === "top" || side === "right";
  const adjustedSlots = needReverse ? slots.slice().reverse() : slots;

  return <>
    {adjustedSlots.map((slot, index) => {
      const adjustedIndex = needReverse ? adjustedSlots.length - 1 - index : index;
      // konva には z-index がないため、上段はスキップして下段から描画
      if (adjustedIndex % 2 === 1 || slot === null) {
        return null;
      }
      const point = getWallTilePoint(side, adjustedIndex);
      if (slot === "back") {
        return <FaceDownTile key={adjustedIndex} point={point} facing={side} />
      }
      if (isTile(slot)) {
        return <FaceUpTile key={adjustedIndex} point={point} tile={slot} facing={oppositeOf(side)} />
      }
    })}
    {adjustedSlots.map((slot, index) => {
      const adjustedIndex = needReverse ? adjustedSlots.length - 1 - index : index;
      if (adjustedIndex % 2 === 0 || slot === null) {
        // 上段を描画
        return null;
      }
      const point = getWallTilePoint(side, adjustedIndex);
      if (slot === "back") {
        return <FaceDownTile key={adjustedIndex} point={point} facing={side} />
      }
      if (isTile(slot)) {
        return <FaceUpTile key={adjustedIndex} point={point} tile={slot} facing={oppositeOf(side)} />
      }
    })}
  </>
});
