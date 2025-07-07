import { memo } from "react";
import { Direction, oppositeOf, Tile } from "../../type";
import { FaceUpTile } from "../atoms/FaceUpTile";
import { getRiverTilePoint } from "../../functions/points";

interface Props {
  side: Direction;
  tiles: Tile[];
  tiltIndex?: number;
}

export const River = memo(function River({
  side,
  tiles,
  tiltIndex = -1,
}: Props){
  // konva には z-index がないため、対面と下家の河は逆順で描画する
  const needReverse = side === "top" || side === "right";
  const adjustedTiles = needReverse ? tiles.slice().reverse() : tiles;
  return <>
    {adjustedTiles.map((tile, index) => {
      const adjustedIndex = needReverse ? adjustedTiles.length - 1 - index : index;
      const point = getRiverTilePoint(side, adjustedIndex, tiltIndex);
      return <FaceUpTile key={adjustedIndex} point={point} tile={tile} facing={oppositeOf(side)} />
    })}
  </>
});
