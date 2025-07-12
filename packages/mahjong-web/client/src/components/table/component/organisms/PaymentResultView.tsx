import { memo } from "react";
import { Group, Rect, Text } from "react-konva";
import type { PaymentResult } from "@mahjong/core";
import { getScaledPaymentResultSize } from "../../functions/constants";
import { getPaymentResultCenterPoint } from "../../functions/points";

interface Props {
  results?: PaymentResult[];
  scale?: number;
}

export const PaymentResultView = memo(function PaymentResultView({ results, scale = 1 }: Props) {
  if (!results || results.length === 0) {
    return null;
  }

  const resultSize = getScaledPaymentResultSize(scale);
  const centerPoint = getPaymentResultCenterPoint(scale);
  
  // エリアサイズとレイアウト計算
  const areaWidth = 150 * scale;
  const areaHeight = 60 * scale;
  const fontSize = 12 * scale;
  const windFontSize = 16 * scale;
  
  // 各エリアの位置計算
  const centerX = resultSize.width / 2;
  const topY = 20 * scale;
  const middleY = 90 * scale;
  const bottomY = 160 * scale;
  const leftX = 50 * scale;
  const rightX = resultSize.width - areaWidth - 50 * scale;
  
  // sideに基づいてデータを取得する関数
  const getPlayerData = (targetSide: string) => {
    return results.find(result => result.side === targetSide);
  };
  
  // 風牌の表示名を取得する関数
  const getWindName = (wind: string) => {
    switch (wind) {
      case 'EAST': return '東';
      case 'SOUTH': return '南';
      case 'WEST': return '西';
      case 'NORTH': return '北';
      default: return '';
    }
  };
  
  // プレイヤー情報表示コンポーネント
  const PlayerArea = ({ data, x, y }: { data?: PaymentResult; x: number; y: number }) => {
    if (!data) {
      return (
        <Group>
          <Rect
            x={x}
            y={y}
            width={areaWidth}
            height={areaHeight}
            fill="rgba(200, 200, 200, 0.3)"
            stroke="gray"
            strokeWidth={1}
          />
          <Text
            x={x + areaWidth / 2}
            y={y + areaHeight / 2 - fontSize / 2}
            text="データなし"
            fontSize={fontSize}
            fill="gray"
            align="center"
            width={areaWidth}
          />
        </Group>
      );
    }
    
    const windName = getWindName(data.wind);
    const changeColor = data.scoreApplied > 0 ? '#22c55e' : data.scoreApplied < 0 ? '#ef4444' : '#6b7280';
    const changeText = data.scoreApplied > 0 ? `+${data.scoreApplied}` : `${data.scoreApplied}`;
    const rankText = `${data.rankAfter}位`;
    
    return (
      <Group>
        <Rect
          x={x}
          y={y}
          width={areaWidth}
          height={areaHeight}
          fill="rgba(255, 255, 255, 0.9)"
          stroke="black"
          strokeWidth={1}
        />
        
        {/* 風牌 */}
        <Text
          x={x + 10 * scale}
          y={y + 5 * scale}
          text={windName}
          fontSize={windFontSize}
          fill="black"
          fontStyle="bold"
        />
        
        {/* プレイヤー名 */}
        <Text
          x={x + 35 * scale}
          y={y + 5 * scale}
          text={data.name}
          fontSize={fontSize}
          fill="black"
          fontStyle="bold"
        />
        
        {/* 点数変動 */}
        <Text
          x={x + 10 * scale}
          y={y + 25 * scale}
          text={`${data.scoreBefore} → ${data.scoreAfter}`}
          fontSize={fontSize}
          fill="black"
        />
        
        {/* 変動点数 */}
        <Text
          x={x + 10 * scale}
          y={y + 40 * scale}
          text={`(${changeText})`}
          fontSize={fontSize}
          fill={changeColor}
          fontStyle="bold"
        />
        
        {/* 順位 */}
        <Text
          x={x + 110 * scale}
          y={y + 25 * scale}
          text={rankText}
          fontSize={fontSize}
          fill="black"
        />
      </Group>
    );
  };

  return (
    <Group x={centerPoint.x} y={centerPoint.y}>
      <Rect
        x={0}
        y={0}
        width={resultSize.width}
        height={resultSize.height}
        fill="rgba(255, 255, 255, 0.9)"
        stroke="black"
        strokeWidth={2}
      />
      
      {/* ACROSS (対面) - 上部中央 */}
      <PlayerArea 
        data={getPlayerData('ACROSS')} 
        x={centerX - areaWidth / 2} 
        y={topY} 
      />
      
      {/* LEFT (左家) - 中段左 */}
      <PlayerArea 
        data={getPlayerData('LEFT')} 
        x={leftX} 
        y={middleY} 
      />
      
      {/* RIGHT (右家) - 中段右 */}
      <PlayerArea 
        data={getPlayerData('RIGHT')} 
        x={rightX} 
        y={middleY} 
      />
      
      {/* SELF (自家) - 下部中央 */}
      <PlayerArea 
        data={getPlayerData('SELF')} 
        x={centerX - areaWidth / 2} 
        y={bottomY} 
      />
    </Group>
  );
});