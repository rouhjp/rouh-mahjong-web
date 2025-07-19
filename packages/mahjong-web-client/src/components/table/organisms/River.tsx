import { memo } from "react";
import { FaceUpTile } from "../atoms/FaceUpTile.js";
import { getRiverTilePoint } from "../../../utils/table-points.js";
import { Direction, oppositeOf, rightOf } from "../../../types/table.js";
import { Tile } from "@mahjong/core";

interface Props {
  side: Direction;
  tiles: Tile[];
  tiltIndex?: number;
  highlightLast?: boolean;
}

/**
 * 河を描画するコンポーネント
 * @param side 河の方向
 * @param tiles 河の牌
 * @param tiltIndex リーチ宣言牌の位置
 */
export const River = memo(function River({
  side,
  tiles,
  tiltIndex = -1,
  highlightLast = false,
}: Props){
  // konva には z-index がないため、対面と下家の河は逆順で描画する
  const needReverse = side === "top" || side === "right";
  const adjustedTiles = needReverse ? tiles.slice().reverse() : tiles;
  return <>
    {adjustedTiles.map((tile, index) => {
      const adjustedIndex = needReverse ? adjustedTiles.length - 1 - index : index;
      const point = getRiverTilePoint(side, adjustedIndex, tiltIndex);
      const facing = (tiltIndex === adjustedIndex) ? rightOf(side) : oppositeOf(side);
      const highlight = highlightLast && adjustedIndex === tiles.length - 1;
      return <FaceUpTile key={adjustedIndex} point={point} tile={tile} facing={facing} highlight={highlight} />
    })}
  </>
});
