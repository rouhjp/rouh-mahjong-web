import { memo, useState } from "react";
import { Group, Rect, Image } from "react-konva";
import type { Tile } from "@mahjong/core";
import { useTileImages } from "../../hooks/useTileImages";
import { TILE_DEPTH, TILE_HEIGHT, TILE_WIDTH } from "../../functions/constants";
import { Point } from "../../functions/points";

interface Props {
  point: Point;
  tile: Tile;
  onClick?: () => void;
  isClickable?: boolean;
}

export const StandingFrontTile = memo(function StandingFrontTile({
  point: { x, y },
  tile,
  onClick,
  isClickable = false,
}: Props) {
  const images = useTileImages();
  const [isHovered, setIsHovered] = useState(false);
  const totalWidth = TILE_WIDTH;
  const totalHeight = TILE_HEIGHT + TILE_DEPTH;
  
  const handleClick = () => {
    if (isClickable && onClick) {
      onClick();
    }
  };

  const handleMouseEnter = () => {
    if (isClickable) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <Group 
      x={x} 
      y={y}
      onClick={handleClick}
      onTap={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: isClickable ? 'pointer' : 'default' }}
    >
      <Rect
        x={0}
        y={0}
        width={totalWidth}
        height={totalHeight}
        stroke={isClickable && isHovered ? "blue" : "black"}
        strokeWidth={isClickable && isHovered ? 2 : 1}
        fill={isClickable && isHovered ? "rgba(0, 100, 255, 0.1)" : "transparent"}
      />
      <Rect
        x={0}
        y={0} 
        width={TILE_WIDTH}
        height={TILE_DEPTH / 2}
        fill="gray"
      />
      <Rect
        x={0}
        y={TILE_DEPTH / 2}
        width={TILE_WIDTH}
        height={TILE_DEPTH / 2}
        fill="white"
      />
      <Image
        x={0}
        y={TILE_DEPTH}
        image={images.get(tile)}
        width={TILE_WIDTH}
        height={TILE_HEIGHT}
        stroke={"black"}
        strokeWidth={1}
      />
    </Group>
  );
});
