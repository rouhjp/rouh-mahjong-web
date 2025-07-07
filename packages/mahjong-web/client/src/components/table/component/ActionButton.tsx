import { Group, Rect, Text } from "react-konva";
import { Point } from "../functions/points";
import { useState } from "react";

interface Props {
  text: string;
  point: Point;
  onClick?: () => void;
}

const BUTTON_WIDTH = 100;
const BUTTON_HEIGHT = 20;

export const ActionButton = ({
  text,
  point,
  onClick = () => {},
}: Props) => {
  const [isHovered, setIsHovered] = useState(false);
  const { x, y } = point;

  const backColor = isHovered ? "orange" : "black";
  const frontColor = isHovered ? "black" : "white";

  return (
    <Group
      x={x}
      y={y}
      onClick={onClick}
      onTap={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Rect
        width={BUTTON_WIDTH}
        height={BUTTON_HEIGHT}
        stroke={"black"}
        strokeWidth={1}
      />
      <Rect
        width={BUTTON_WIDTH}
        height={BUTTON_HEIGHT}
        fill={backColor}
      />
      <Text
        y={1}
        text={text}
        width={BUTTON_WIDTH}
        height={BUTTON_HEIGHT}
        align="center"
        verticalAlign="middle"
        fill={frontColor}
        fontSize={14}
      />
    </Group>
  )
};
