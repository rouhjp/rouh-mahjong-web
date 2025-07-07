import { memo } from "react";
import type { Tile } from "@mahjong/core";
import { Group } from "react-konva";
import { StandingFrontTile } from "../atoms/StandingFrontTile";
import { getHandTilePoint } from "../../functions/points";

interface Props {
  tiles: Tile[];
  drawnTile?: Tile;
  onTileClick?: (tile: Tile, isDrawn: boolean) => void;
  clickableTiles?: Tile[];
}

export const StandingFrontHand = memo(function StandingFrontHand({
  tiles,
  drawnTile,
  onTileClick,
  clickableTiles = [],
}: Props) {
  return (
    <Group>
      {tiles.map((tile, index) => {
        const point = getHandTilePoint("bottom", index, false);
        const isClickable = clickableTiles.includes(tile);
        return (
          <StandingFrontTile
            key={index}
            point={point}
            tile={tile}
            onClick={() => onTileClick?.(tile, false)}
            isClickable={isClickable}
          />
        );
      })}
      {drawnTile && (()=> {
        const point = getHandTilePoint("bottom", tiles.length, true);
        const isClickable = clickableTiles.includes(drawnTile);
        return (
          <StandingFrontTile
            key={tiles.length}
            point={point}
            tile={drawnTile}
            onClick={() => onTileClick?.(drawnTile, true)}
            isClickable={isClickable}
          />
        );
      })()}
    </Group>
  );
});

