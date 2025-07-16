import { Group, Rect, Text } from 'react-konva';
import { getDeclarationTextPoint } from "../../../../utils/table-points";
import { Direction } from '../../../../types/table';

interface Props {
  text: string;
  direction: Direction;
  scale: number;
}

export const DeclarationText = ({ text, direction, scale }: Props) => {
  const { x, y } = getDeclarationTextPoint(direction);
  
  // ボックスサイズ
  const fontSize = 18 * scale;
  const padding = 8 * scale;
  const textWidth = fontSize * 3;
  const boxWidth = textWidth + padding * 2;
  const boxHeight = fontSize + padding * 2;

  return (
    <Group x={x * scale - boxWidth / 2} y={y * scale - boxHeight / 2}>
      {/* 黒い四角枠 */}
      <Rect
        x={0}
        y={0}
        width={boxWidth}
        height={boxHeight}
        fill="rgba(255, 255, 255, 0.9)"
        stroke="black"
        strokeWidth={1 * scale}
      />
      
      {/* テキスト */}
      <Text
        text={text}
        x={padding}
        y={padding}
        width={textWidth}
        height={fontSize}
        fontSize={fontSize}
        fontStyle="bold"
        fill="#000000ff"
        align="center"
        verticalAlign="middle"
      />
    </Group>
  );
};