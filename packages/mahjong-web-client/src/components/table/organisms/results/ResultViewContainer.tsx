import { Group, Rect } from 'react-konva';
import { TABLE_HEIGHT, TABLE_WIDTH } from '../../../../utils/table-constants.js';
import { WinningResultView } from './WinningResultView.js';
import { RiverWinningResultView } from './RiverWinningResultView.js';
import { PaymentResultView } from './PaymentResultView.js';
import { DrawView } from './DrawView.js';
import { GameResultView } from './GameResultView.js';
import { ResultType, useResultPaging } from '../../../../hooks/useResultPaging.js';
import { FinishType, GameResult, PaymentResult, RiverWinningResult, WinningResult } from '@mahjong/core';

interface Props {
  scale: number;
  confirming?: boolean;
  onRoundFinishConfirmed?: () => void;
  onGameFinishConfirmed?: () => void;
  drawFinishType?: FinishType,
  winningResults?: WinningResult[],
  riverWinningResults?: RiverWinningResult[],
  paymentResults?: PaymentResult[],
  gameResults?: GameResult[]
}

export const ResultViewContainer = ({
  scale,
  confirming = false,
  onRoundFinishConfirmed,
  onGameFinishConfirmed,
  drawFinishType,
  winningResults,
  riverWinningResults,
  paymentResults,
  gameResults,
}: Props) => {
  const { hasResult, resultType, resultIndex, handleResultClick } = useResultPaging(
    confirming,
    onRoundFinishConfirmed,
    onGameFinishConfirmed,
    drawFinishType,
    winningResults,
    riverWinningResults,
    paymentResults,
    gameResults,
  )

  if (!hasResult) {
    return null;
  }

  return (
    <Group>
      {resultType === ResultType.DRAW &&
        <DrawView 
          finishType={drawFinishType} 
          scale={scale} 
        />
      }
      {resultType === ResultType.WINNING && 
        <WinningResultView 
          result={winningResults![resultIndex]} 
          scale={scale} 
        />
      }
      {resultType === ResultType.RIVER_WINNING && 
        <RiverWinningResultView 
          result={riverWinningResults![resultIndex]} 
          scale={scale} 
        />
      }
      {resultType === ResultType.PAYMENT && 
        <PaymentResultView 
          results={paymentResults!} 
          scale={scale} 
        />
      }
      {resultType === ResultType.GAME && 
        <GameResultView 
          results={gameResults!} 
          scale={scale} 
        />
      }
      <Rect
        x={0}
        y={0}
        width={TABLE_WIDTH}
        height={TABLE_HEIGHT}
        fill="transparent"
        onClick={handleResultClick}
      />
    </Group>
  )
};