import { Fragment, memo } from "react";
import { Direction, isAddQuad, isSelfQuad, leftOf, Meld, oppositeOf, rightOf } from "../../type";
import { FaceDownTile } from "../atoms/FaceDownTile";
import { getMeldTilePoint } from "../../functions/points";
import { FaceUpTile } from "../atoms/FaceUpTile";
import { Group } from "react-konva";
import { TILE_DEPTH, TILE_HEIGHT, TILE_WIDTH } from "../../functions/constants";

interface Props {
  side: Direction;
  melds: Meld[];
  highlightLastSelfQuad?: boolean;
  highlightAddQuadIndex?: number;
}

/**
 * 手牌の面子を描画するコンポーネント
 * @param side プレイヤーの方向
 * @param melds 面子の配列
 */
export const FaceUpMelds = memo(function FaceUpMelds({
  side,
  melds,
  highlightLastSelfQuad: highlightLast = false,
  highlightAddQuadIndex: highlightIndex = -1,
}: Props) {
  const needReverse = side === "top" || side === "right";
  const gap = TILE_DEPTH;
  let totalMeldOffset = 0;
  return (
    <Group>
      {melds.map((meld, meldIndex) => {
        const adjustedTiles = needReverse ? meld.tiles.slice().reverse() : meld.tiles;
        if (isSelfQuad(meld)) {
          totalMeldOffset += TILE_WIDTH * 4;
          const meldOffset = totalMeldOffset + gap * meldIndex;
          return (
            <Fragment key={meldIndex}>
              {adjustedTiles.map((tile, tileIndex) => {
                const adjustedIndex = needReverse ? adjustedTiles.length - 1 - tileIndex : tileIndex;
                const point = getMeldTilePoint(side, meldOffset, adjustedIndex*TILE_WIDTH, false, false);
                const isHighlightTile = highlightLast && meldIndex === melds.length - 1 && adjustedIndex === 1;
                if (adjustedIndex === 0 || adjustedIndex === 3) {
                  return <FaceDownTile key={adjustedIndex} point={point} facing={oppositeOf(side)} />
                } else {
                  return <FaceUpTile key={adjustedIndex} point={point} tile={tile} facing={oppositeOf(side)} highlight={isHighlightTile} />
                }
              })}
            </Fragment>
          )
        } else if (isAddQuad(meld)) {
          totalMeldOffset += TILE_WIDTH * 2 + TILE_HEIGHT;
          const meldOffset = totalMeldOffset + gap * meldIndex;
          return (
            <Fragment key={meldIndex}>
              {adjustedTiles.map((tile, tileIndex) => {
                const adjustedIndex = needReverse ? adjustedTiles.length - 1 - tileIndex : tileIndex;
                if (adjustedIndex === meld.tiltIndex) {
                  const tileOffset = meld.tiltIndex! * TILE_WIDTH;
                  const upperPoint = getMeldTilePoint(side, meldOffset, tileOffset, true, true);
                  const lowerPoint = getMeldTilePoint(side, meldOffset, tileOffset, true, false);
                  const tiltFacing = meld.tiltIndex === 0 ? rightOf(side) : leftOf(side);
                  const isHighlightTile = highlightIndex >= 0 && meldIndex === highlightIndex;
                  return (
                    <Fragment key={adjustedIndex}>
                      {!needReverse &&
                        <>
                          <FaceUpTile point={upperPoint} tile={meld.addedTile!} facing={tiltFacing} highlight={isHighlightTile} />
                          <FaceUpTile point={lowerPoint} tile={tile} facing={tiltFacing} />
                        </>
                      }
                      {needReverse &&
                        <>
                          <FaceUpTile point={lowerPoint} tile={tile} facing={tiltFacing} />
                          <FaceUpTile point={upperPoint} tile={meld.addedTile!} facing={tiltFacing} highlight={isHighlightTile} />
                        </>
                      }
                    </Fragment>
                  );
                } else {
                  const tileOffset = adjustedIndex <= meld.tiltIndex! ? adjustedIndex * TILE_WIDTH : (adjustedIndex - 1) * TILE_WIDTH + TILE_HEIGHT;
                  const point = getMeldTilePoint(side, meldOffset, tileOffset, false, false);
                  return <FaceUpTile key={adjustedIndex} point={point} tile={tile} facing={oppositeOf(side)} />
                }
              })}
            </Fragment>
          )
        } else {
          totalMeldOffset += (meld.tiles.length - 1) * TILE_WIDTH + TILE_HEIGHT;
          const meldOffset = totalMeldOffset + gap * meldIndex;
          return (
            <Fragment key={meldIndex}>
              {adjustedTiles.map((tile, tileIndex) => {
                const adjustedIndex = needReverse ? adjustedTiles.length - 1 - tileIndex : tileIndex;
                const tileOffset = adjustedIndex <= meld.tiltIndex! ? adjustedIndex * TILE_WIDTH : (adjustedIndex - 1) * TILE_WIDTH + TILE_HEIGHT;
                const point = getMeldTilePoint(side, meldOffset, tileOffset, adjustedIndex === meld.tiltIndex, false);
                if (adjustedIndex === meld.tiltIndex!) {
                  const tiltFacing = meld.tiltIndex === 0 ? rightOf(side) : leftOf(side);
                  return <FaceUpTile key={adjustedIndex} point={point} tile={tile} facing={tiltFacing} />
                } else {
                  return <FaceUpTile key={adjustedIndex} point={point} tile={tile} facing={oppositeOf(side)} />
                }
              })}
            </Fragment>
          );
        }
      })}
    </Group>
  );
});
