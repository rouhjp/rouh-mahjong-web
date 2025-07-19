import { memo } from "react";
import { Group, Text } from "react-konva";
import { WindInfo } from "@mahjong/core";
import { getScaledRoundInfoSize } from "../../../../utils/table-constants.js";
import { getRoundInfoCenterPoint } from "../../../../utils/table-points.js";
import { RoundInfo } from "../../../../types/table.js";

interface Props {
  roundInfo?: RoundInfo;
  scale?: number;
}

export const RoundInfoView = memo(function RoundInfoView({ roundInfo, scale = 1 }: Props) {
  if (!roundInfo) {
    return null;
  }

  const roundInfoSize = getScaledRoundInfoSize(scale);
  const centerPoint = getRoundInfoCenterPoint(scale);
  
  const fontSize = 14 * scale;
  const smallFontSize = 10 * scale;
  
  // 風の表示名を取得
  const windName = WindInfo[roundInfo.roundWind].name;
  
  // 局数を漢数字に変換
  const roundNumberKanji = ['', '一', '二', '三', '四'][roundInfo.roundCount] || roundInfo.roundCount.toString();
  
  // メインテキスト（例: "東三局"）
  const mainText = `${windName}${roundNumberKanji}局`;
  
  // サブテキスト（本場数と供託数）
  let subText = '';
  if (roundInfo.continueCount > 0 || roundInfo.depositCount > 0) {
    const parts: string[] = [];
    if (roundInfo.continueCount > 0) {
      parts.push(`${roundInfo.continueCount}本場`);
    }
    if (roundInfo.depositCount > 0) {
      parts.push(`供託${roundInfo.depositCount}`);
    }
    subText = parts.join(' ');
  }

  return (
    <Group x={centerPoint.x} y={centerPoint.y}>
      {/* メインテキスト */}
      <Text
        x={0}
        y={subText ? 15 * scale : roundInfoSize.height / 2 - fontSize / 2}
        text={mainText}
        fontSize={fontSize}
        fill="black"
        fontStyle="bold"
        align="center"
        width={roundInfoSize.width}
      />
      
      {/* サブテキスト */}
      {subText && (
        <Text
          x={0}
          y={35 * scale}
          text={subText}
          fontSize={smallFontSize}
          fill="gray"
          align="center"
          width={roundInfoSize.width}
        />
      )}
    </Group>
  );
});