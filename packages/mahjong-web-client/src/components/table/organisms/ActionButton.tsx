import { Group, Rect, Text } from "react-konva";
import { useState } from "react";
import { getActionButtonPoint } from "../../../utils/table-points.js";
import { ACTION_BUTTON_HEIGHT, ACTION_BUTTON_WIDTH } from "../../../utils/table-constants.js";

interface Props {
  text: string;
  index: number;
  value: string;
  onClick?: (value: string) => void;
  scale?: number;
}

export const ActionButton = ({
  text,
  index,
  value,
  onClick = () => {},
  scale = 1,
}: Props) => {
  const [isHovered, setIsHovered] = useState(false);
  const { x, y } = getActionButtonPoint(index);

  const backColor = isHovered ? "orange" : "black";
  const frontColor = isHovered ? "black" : "white";
  
  const scaledWidth = ACTION_BUTTON_WIDTH * scale;
  const scaledHeight = ACTION_BUTTON_HEIGHT * scale;
  const scaledFontSize = 14 * scale;

  const handleClick = () => {
    onClick(value);
  };

  return (
    <Group
      x={x * scale}
      y={y * scale}
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
