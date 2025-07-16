import { memo } from "react";
import type { Tile } from "@mahjong/core";
import { Direction, oppositeOf } from "../../../types/table";
import { Group } from "react-konva";
import { getHandTilePoint } from "../../../utils/table-points";
import { FaceUpTile } from "../atoms/FaceUpTile";

interface Props {
  side: Direction;
  tiles?: Tile[];
  drawnTile?: Tile;
  scale?: number;
}

/**
 * 倒された手牌を描画するコンポーネント
 * @param side プレイヤーの方向
 * @param tiles 手牌
 * @param drawnTile ツモ牌
 */
export const FaceUpHand = memo(function FaceUpHand({
  side,
  tiles,
  drawnTile,
  scale = 1,
}: Props) {
  const safeTiles = tiles || [];
  const needReverse = side === "right";
  const adjustedTiles = needReverse ? safeTiles.slice().reverse() : safeTiles;
  return (
    <Group>
      {needReverse && drawnTile &&
        <FaceUpTile point={getHandTilePoint(side, safeTiles.length, true)} tile={drawnTile} facing={oppositeOf(side)} scale={scale} />
      }
      {adjustedTiles.map((tile, index) => {
        const adjustedIndex = needReverse ? adjustedTiles.length - 1 - index : index;
        const point = getHandTilePoint(side, adjustedIndex, false);
        return (
          <FaceUpTile
            key={adjustedIndex}
            point={point}
            tile={tile}
            facing={oppositeOf(side)}
            scale={scale}
          />
        );
      })}
      {!needReverse && drawnTile && 
        <FaceUpTile point={getHandTilePoint(side, safeTiles.length, true)} tile={drawnTile} facing={oppositeOf(side)} scale={scale} />
      }
    </Group>
  );
});

