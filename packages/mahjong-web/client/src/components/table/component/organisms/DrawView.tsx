import { memo } from "react";
import { Group, Rect, Text } from "react-konva";
import type { AbortiveDrawType } from "@mahjong/core";
import { getScaledDrawResultSize } from "../../functions/constants";
import { getDrawResultCenterPoint } from "../../functions/points";

interface Props {
  drawType?: AbortiveDrawType;
  scale?: number;
}

export const DrawView = memo(function DrawView({ drawType, scale = 1 }: Props) {
  if (!drawType) {
    return null;
  }

  const resultSize = getScaledDrawResultSize(scale);
  const centerPoint = getDrawResultCenterPoint(scale);
  
  // メッセージテキストのフォントサイズ
  const fontSize = 24 * scale;
  
  return (
    <Group x={centerPoint.x} y={centerPoint.y}>
      {/* 背景 */}
      <Rect
        x={0}
        y={0}
        width={resultSize.width}
        height={resultSize.height}
        fill="rgba(255, 255, 255, 0.9)"
        stroke="black"
        strokeWidth={2}
      />
      
      {/* 流局タイプのみ表示 */}
      <Text
        text={drawType}
        x={0}
        y={resultSize.height / 2 - fontSize / 2}
        width={resultSize.width}
        fontSize={fontSize}
        fontFamily="Arial, sans-serif"
        fontStyle="bold"
        fill="black"
        align="center"
        verticalAlign="middle"
      />
    </Group>
  );
});