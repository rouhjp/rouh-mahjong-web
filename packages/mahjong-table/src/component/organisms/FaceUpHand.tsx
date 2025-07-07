import { memo } from "react";
import { Direction, oppositeOf, Tile } from "../../type";
import { Group } from "react-konva";
import { getHandTilePoint } from "../../functions/points";
import { FaceUpTile } from "../atoms/FaceUpTile";

interface Props {
  side: Direction;
  tiles: Tile[];
  drawnTile?: Tile;
}

export const FaceUpHand = memo(function FaceUpHand({
  side,
  tiles,
  drawnTile,
}: Props) {
  const needReverse = side === "right";
  const adjustedTiles = needReverse ? tiles.slice().reverse() : tiles;
  return (
    <Group>
      {needReverse && drawnTile &&
        <FaceUpTile point={getHandTilePoint(side, tiles.length, true)} tile={drawnTile} facing={oppositeOf(side)} />
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
          />
        );
      })}
      {!needReverse && drawnTile && 
        <FaceUpTile point={getHandTilePoint(side, tiles.length, true)} tile={drawnTile} facing={oppositeOf(side)} />
      }
    </Group>
  );
});

