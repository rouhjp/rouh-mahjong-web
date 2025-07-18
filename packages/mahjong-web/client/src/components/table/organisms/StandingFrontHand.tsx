import { Fragment, memo, useState } from "react";
import { Group } from "react-konva";
import { StandingFrontTile } from "../atoms/StandingFrontTile";
import { WinningTilesBubble } from "../atoms/WinningTilesBubble";
import { getHandTilePoint } from "../../../utils/table-points";
import { DiscardGuide, Tile } from "@mahjong/core";

interface Props {
  tiles: Tile[];
  drawnTile?: Tile;
  onTileClick?: (index: number) => void;
  clickableTileIndices?: number[];
  scale?: number;
  guides?: DiscardGuide[];
  readySelected?: boolean;
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
  guides = [],
  readySelected = false,
}: Props) {
  const [hoveredTileIndex, setHoveredTileIndex] = useState<number | null>(null);

  return (
    <Group>
      {tiles.map((tile, index) => {
        const point = getHandTilePoint("bottom", index, false);
        const isClickable = clickableTileIndices.includes(index);
        const isDimmed = clickableTileIndices.length > 0 && !isClickable;
        const winnings = guides.find(guide => guide.discardingTile === tile)?.winnings || [];
        const disqualified = guides.find(guide => guide.discardingTile === tile)?.disqualified || false;

        return (
          <Fragment key={index}>
            <StandingFrontTile
              point={point}
              tile={tile}
              onClick={() => onTileClick(index)}
              onMouseEnter={() => setHoveredTileIndex(index)}
              onMouseLeave={() => setHoveredTileIndex(null)}
              isClickable={isClickable}
              isDimmed={isDimmed}
              isHovered={hoveredTileIndex === index}
              scale={scale}
            />
            {hoveredTileIndex === index &&
              <WinningTilesBubble
                winnings={winnings}
                disqualified={disqualified}
                point={{ x: point.x, y: point.y }}
                scale={scale * 0.8}
                darkenIfNoScore={!readySelected}
              />
            }
          </Fragment>
        );
      })}
      {drawnTile && (()=> {
        const index = tiles.length;
        const point = getHandTilePoint("bottom", tiles.length, true);
        const isClickable = clickableTileIndices.includes(index);
        const isDimmed = clickableTileIndices.length > 0 && !isClickable;
        const winnings = guides.find(guide => guide.discardingTile === drawnTile)?.winnings || [];
        const disqualified = guides.find(guide => guide.discardingTile === drawnTile)?.disqualified || false;

        return (
          <Fragment>
            <StandingFrontTile
              key={tiles.length}
              point={point}
              tile={drawnTile}
              onClick={() => onTileClick(index)}
              onMouseEnter={() => setHoveredTileIndex(index)}
              onMouseLeave={() => setHoveredTileIndex(null)}
              isClickable={isClickable}
              isDimmed={isDimmed}
              isHovered={hoveredTileIndex === index}
              scale={scale}
            />
            {hoveredTileIndex === index &&
              <WinningTilesBubble
                winnings={winnings}
                disqualified={disqualified}
                point={{ x: point.x, y: point.y }}
                scale={scale * 0.8}
                darkenIfNoScore={!readySelected}
              />
            }
          </Fragment>
        );
      })()}
    </Group>
  );
});

