import { Group, Rect, Text } from "react-konva";
import { Point } from "../functions/points";
import { useState } from "react";

interface Props {
  text: string;
  value: string;
  point: Point;
  onClick?: (value: string) => void;
}

const BUTTON_WIDTH = 100;
const BUTTON_HEIGHT = 20;

export const ActionButton = ({
  text,
  value,
  point,
  onClick = () => {},
}: Props) => {
  const [isHovered, setIsHovered] = useState(false);
  const { x, y } = point;

  const backColor = isHovered ? "orange" : "black";
  const frontColor = isHovered ? "black" : "white";

  const handleClick = () => {
    onClick(value);
  };

  return (
    <Group
      x={x}
      y={y}
      onClick={handleClick}
      onTap={handleClick}
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
