import { Group, Rect, Text } from "react-konva";
import { Point } from "../../functions/points";
import { useState } from "react";

interface Props {
  text: string;
  value: string;
  point: Point;
  onClick?: (value: string) => void;
  scale?: number;
}

const BUTTON_WIDTH = 100;
const BUTTON_HEIGHT = 20;

export const ActionButton = ({
  text,
  value,
  point,
  onClick = () => {},
  scale = 1,
}: Props) => {
  const [isHovered, setIsHovered] = useState(false);
  const { x, y } = point;

  const backColor = isHovered ? "orange" : "black";
  const frontColor = isHovered ? "black" : "white";
  
  const scaledWidth = BUTTON_WIDTH * scale;
  const scaledHeight = BUTTON_HEIGHT * scale;
  const scaledFontSize = 14 * scale;

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
        width={scaledWidth}
        height={scaledHeight}
        stroke={"black"}
        strokeWidth={1 * scale}
      />
      <Rect
        width={scaledWidth}
        height={scaledHeight}
        fill={backColor}
      />
      <Text
        y={1 * scale}
        text={text}
        width={scaledWidth}
        height={scaledHeight}
        align="center"
        verticalAlign="middle"
        fill={frontColor}
        fontSize={scaledFontSize}
      />
    </Group>
  )
};
