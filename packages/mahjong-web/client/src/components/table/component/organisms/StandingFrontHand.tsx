import { memo } from "react";
import type { Tile } from "@mahjong/core";
import { Group } from "react-konva";
import { StandingFrontTile } from "../atoms/StandingFrontTile";
import { getHandTilePoint } from "../../functions/points";

interface Props {
  tiles: Tile[];
  drawnTile?: Tile;
  onTileClick?: (index: number) => void;
  clickableTileIndices?: number[];
  scale?: number;
}

/**
 * 自家の手牌を描画するコンポーネント
 * @param tiles 手牌
 * @param drawnTile ツモ牌
 * @param onTileClick 牌がクリックされたときの処理
 * @param clickableTileIndices クリック可能な牌の位置(指定された場合、それ以外の牌を薄く表示する)
 */
export const StandingFrontHand = memo(function StandingFrontHand({
  tiles,
  drawnTile,
  onTileClick = () => {},
  clickableTileIndices = [],
  scale = 1,
}: Props) {
  return (
    <Group>
      {tiles.map((tile, index) => {
        const point = getHandTilePoint("bottom", index, false);
        const isClickable = clickableTileIndices.includes(index);
        const isDimmed = clickableTileIndices.length > 0 && !isClickable;
        return (
          <StandingFrontTile
            key={index}
            point={point}
            tile={tile}
            onClick={() => onTileClick(index)}
            isClickable={isClickable}
            isDimmed={isDimmed}
            scale={scale}
          />
        );
      })}
      {drawnTile && (()=> {
        const index = tiles.length;
        const point = getHandTilePoint("bottom", tiles.length, true);
        const isClickable = clickableTileIndices.includes(index);
        const isDimmed = clickableTileIndices.length > 0 && !isClickable;
        return (
          <StandingFrontTile
            key={tiles.length}
            point={point}
            tile={drawnTile}
            onClick={() => onTileClick(index)}
            isClickable={isClickable}
            isDimmed={isDimmed}
            scale={scale}
          />
        );
      })()}
    </Group>
  );
});

