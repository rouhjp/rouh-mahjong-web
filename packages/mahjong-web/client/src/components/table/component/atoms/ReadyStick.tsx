import { memo } from "react";
import { Group, Image, Rect } from "react-konva";
import { Direction, getAngle } from "../../type";
import { Point } from "../../functions/points";
import { useReadyStickImage } from "../../hooks/useTileImages";

interface Props {
  point: Point;
  facing: Direction;
}

export const ReadyStick = memo(function ReadyStick({
  point: { x, y },
  facing,
}: Props) {
  const image = useReadyStickImage();

  if (!image) {
    return null;
  }

  const angle = getAngle(facing);
  const width = 60;  // 立直棒の幅
  const height = 8;  // 立直棒の高さ

  return (
    <Group
      x={x}
      y={y}
      rotation={angle}
      offsetX={width / 2}
      offsetY={height / 2}
    >
      <Image
        image={image}
        width={width}
        height={height}
      />
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        stroke="black"
        strokeWidth={1}
        fill="transparent"
      />
    </Group>
  );
});