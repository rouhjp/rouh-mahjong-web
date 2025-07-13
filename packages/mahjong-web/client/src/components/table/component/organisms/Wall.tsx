import { memo } from "react";
import { Direction, isTile, oppositeOf, Slot } from "../../type";
import { FaceUpTile } from "../atoms/FaceUpTile";
import { FaceDownTile } from "../atoms/FaceDownTile";
import { getWallTilePoint } from "../../functions/points";

interface Props {
  side: Direction;
  slots: Slot[][];
}

export const Wall = memo(function Wall({
  side,
  slots,
}: Props){
  const needReverse = side === "top" || side === "right";
  const adjustedSlots = needReverse ? slots.slice().reverse() : slots;

  return <>
    {/* 下段（level = 1）から描画 */}
    {adjustedSlots.map((row, rowIndex) => {
      const adjustedCol = needReverse ? adjustedSlots.length - 1 - rowIndex : rowIndex;
      const slot = row[1]; // 下段
      if (slot === null) {
        return null;
      }
      const point = getWallTilePoint(side, adjustedCol, 0);
      if (slot === "back") {
        return <FaceDownTile key={`${adjustedCol}-0`} point={point} facing={side} />
      }
      if (isTile(slot)) {
        return <FaceUpTile key={`${adjustedCol}-0`} point={point} tile={slot} facing={oppositeOf(side)} />
      }
    })}
    {/* 上段（level = 0）を描画 */}
    {adjustedSlots.map((row, rowIndex) => {
      const adjustedCol = needReverse ? adjustedSlots.length - 1 - rowIndex : rowIndex;
      const slot = row[0]; // 上段
      if (slot === null) {
        return null;
      }
      const point = getWallTilePoint(side, adjustedCol, 1);
      if (slot === "back") {
        return <FaceDownTile key={`${adjustedCol}-1`} point={point} facing={side} />
      }
      if (isTile(slot)) {
        return <FaceUpTile key={`${adjustedCol}-1`} point={point} tile={slot} facing={oppositeOf(side)} />
      }
    })}
  </>
});
