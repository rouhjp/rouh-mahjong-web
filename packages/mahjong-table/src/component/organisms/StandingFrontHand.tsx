import { memo } from "react";
import { Tile } from "../../type";
import { Group } from "react-konva";
import { StandingFrontTile } from "../atoms/StandingFrontTile";
import { getHandTilePoint } from "../../functions/points";

interface Props {
  tiles: Tile[];
  drawnTile?: Tile;
}

export const StandingFrontHand = memo(function StandingFrontHand({
  tiles,
  drawnTile,
}: Props) {
  return (
    <Group>
      {tiles.map((tile, index) => {
        const point = getHandTilePoint("bottom", index, false);
        return (
          <StandingFrontTile
            key={index}
            point={point}
            tile={tile}
          />
        );
      })}
      {drawnTile && (()=> {
        const point = getHandTilePoint("bottom", tiles.length, true);
        return (
          <StandingFrontTile
            key={tiles.length}
            point={point}
            tile={drawnTile}
          />
        );
      })()}
    </Group>
  );
});

