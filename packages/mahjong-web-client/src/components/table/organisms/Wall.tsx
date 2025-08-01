import { memo } from "react";
import { Direction, oppositeOf, Slot } from "../../../types/table.js";
import { FaceUpTile } from "../atoms/FaceUpTile.js";
import { FaceDownTile } from "../atoms/FaceDownTile.js";
import { getWallTilePoint } from "../../../utils/table-points.js";

interface Props {
  side: Direction;
  slots: Slot[][];
}

/**
 * 麻雀卓の一方向の山牌を描画するコンポーネント
 * @param side 山の方向
 * @param slots 山牌の構成牌の２次元配列(左から何番目、上から何番目)
 */
export const Wall = memo(function Wall({
  side,
  slots,
}: Props){
  const needReverse = side === "top" || side === "left";
  const adjustedSlots = needReverse ? slots.slice().reverse() : slots;

  return <>
    {/* 下段（level = 1）から描画 */}
    {adjustedSlots.map((row, rowIndex) => {
      const adjustedCol = needReverse ? adjustedSlots.length - 1 - rowIndex : rowIndex;
      const slot: Slot = row[1]; // 下段
      if (slot === null) {
        return null;
      }
      const point = getWallTilePoint(side, adjustedCol, 0);
      if (slot === "back") {
        return <FaceDownTile key={`${adjustedCol}-0`} point={point} facing={side} />
      }
      return <FaceUpTile key={`${adjustedCol}-0`} point={point} tile={slot} facing={oppositeOf(side)} />
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
      return <FaceUpTile key={`${adjustedCol}-1`} point={point} tile={slot} facing={oppositeOf(side)} />
    })}
  </>
});
