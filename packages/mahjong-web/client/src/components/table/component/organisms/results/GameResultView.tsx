import { memo } from "react";
import { Group, Rect, Text } from "react-konva";
import type { GameResult } from "@mahjong/core";
import { getScaledGameResultSize } from "../../../functions/constants";
import { getGameResultCenterPoint } from "../../../functions/points";

interface Props {
  results?: GameResult[];
  scale?: number;
}

/**
 * 対局結果を描画するコンポーネント
 * @param results 対局結果の配列
 * @param scale 描画スケール
 */
export const GameResultView = memo(function GameResultView({ results, scale = 1 }: Props) {
  if (!results || results.length === 0) {
    return null;
  }

  const resultSize = getScaledGameResultSize(scale);
  const centerPoint = getGameResultCenterPoint(scale);
  
  const titleFontSize = 18 * scale;
  const fontSize = 14 * scale;
  const nameWidth = 120 * scale;
  const scoreWidth = 80 * scale;
  const pointWidth = 70 * scale;
  
  // 順位順にソート
  const sortedResults = [...results].sort((a, b) => a.rank - b.rank);
  
  // 結果ポイントの表示
  const getResultPointText = (resultPoint: number) => {
    if (resultPoint > 0) {
      return `+${resultPoint}pt`;
    } else if (resultPoint < 0) {
      return `${resultPoint}pt`;
    } else {
      return `±0pt`;
    }
  };
  
  const getResultPointColor = (resultPoint: number) => {
    if (resultPoint > 0) return '#22c55e'; // green
    if (resultPoint < 0) return '#ef4444'; // red
    return '#6b7280'; // gray
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#ffd700'; // gold
      case 2: return '#c0c0c0'; // silver
      case 3: return '#cd7f32'; // bronze
      default: return '#6b7280'; // gray
    }
  };

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
      
      {/* タイトル */}
      <Text
        x={0}
        y={15 * scale}
        text="ゲーム結果"
        fontSize={titleFontSize}
        fill="black"
        fontStyle="bold"
        align="center"
        width={resultSize.width}
      />
      
      {/* ヘッダー */}
      <Text
        x={20 * scale}
        y={45 * scale}
        text="順位"
        fontSize={fontSize}
        fill="black"
        fontStyle="bold"
        width={40 * scale}
        align="center"
      />
      <Text
        x={70 * scale}
        y={45 * scale}
        text="プレイヤー"
        fontSize={fontSize}
        fill="black"
        fontStyle="bold"
        width={nameWidth}
      />
      <Text
        x={70 * scale + nameWidth}
        y={45 * scale}
        text="点数"
        fontSize={fontSize}
        fill="black"
        fontStyle="bold"
        width={scoreWidth}
        align="center"
      />
      <Text
        x={70 * scale + nameWidth + scoreWidth}
        y={45 * scale}
        text="結果"
        fontSize={fontSize}
        fill="black"
        fontStyle="bold"
        width={pointWidth}
        align="center"
      />
      
      {/* 各プレイヤーの結果 */}
      {sortedResults.map((result, index) => {
        const y = (70 + index * 50) * scale;
        
        return (
          <Group key={result.rank}>
            {/* 順位 */}
            <Text
              x={20 * scale}
              y={y}
              text={`${result.rank}`}
              fontSize={fontSize}
              fill={getRankColor(result.rank)}
              fontStyle="bold"
              width={40 * scale}
              align="center"
            />
            
            {/* プレイヤー名 */}
            <Text
              x={70 * scale}
              y={y}
              text={result.name}
              fontSize={fontSize}
              fill="black"
              width={nameWidth}
            />
            
            {/* 点数 */}
            <Text
              x={70 * scale + nameWidth}
              y={y}
              text={`${result.score}`}
              fontSize={fontSize}
              fill="black"
              width={scoreWidth}
              align="center"
            />
            
            {/* 結果ポイント */}
            <Text
              x={70 * scale + nameWidth + scoreWidth}
              y={y}
              text={getResultPointText(result.resultPoint)}
              fontSize={fontSize}
              fill={getResultPointColor(result.resultPoint)}
              fontStyle="bold"
              width={pointWidth}
              align="center"
            />
            
            {/* 区切り線（最後以外） */}
            {index < sortedResults.length - 1 && (
              <Rect
                x={20 * scale}
                y={y + 25 * scale}
                width={resultSize.width - 40 * scale}
                height={1}
                fill="rgba(0, 0, 0, 0.1)"
              />
            )}
          </Group>
        );
      })}
    </Group>
  );
});