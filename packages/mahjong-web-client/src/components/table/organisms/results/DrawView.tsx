import { memo } from "react";
import { Group, Rect, Text } from "react-konva";
import { getScaledDrawResultSize } from "../../../../utils/table-constants";
import { getDrawResultCenterPoint } from "../../../../utils/table-points";
import type { FinishType } from '@mahjong/core';

/**
 * FinishTypeを日本語テキストに変換する
 */
function getFinishTypeDisplayText(finishType: FinishType): string {
  switch (finishType) {
    case 'tsumo':
      return 'ツモ';
    case 'ron':
      return 'ロン';
    case 'river-winning':
      return '流し満貫';
    case 'exhauted':
      return '流局';
    case 'nine-orphans':
      return '九種九牌';
    case 'four-quads':
      return '四槓散了';
    case 'four-winds':
      return '四風連打';
    case 'four-players-ready':
      return '四家立直';
    case 'three-players-ron':
      return '三家和';
    default:
      return finishType;
  }
}

interface Props {
  drawType?: string;
  finishType?: FinishType;
  scale?: number;
}

/**
 * 流局結果を表示するコンポーネント
 * @param drawType 流局タイプ（例: "流局"）
 * @param finishType 和了タイプ（例: "tsumo", "ron"など
 * @param scale 描画スケール
 */
export const DrawView = memo(function DrawView({ drawType, finishType, scale = 1 }: Props) {
  // drawTypeまたはfinishTypeのどちらかから表示テキストを決定
  const displayText = drawType || (finishType ? getFinishTypeDisplayText(finishType) : null);
  
  if (!displayText) {
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
        text={displayText}
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