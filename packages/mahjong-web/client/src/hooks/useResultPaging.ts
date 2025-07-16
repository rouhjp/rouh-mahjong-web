import { useState } from 'react';
import { FinishType, GameResult, PaymentResult, RiverWinningResult, WinningResult } from '@mahjong/core';

export enum ResultType {
  DRAW = 'draw',
  WINNING = 'winning',
  RIVER_WINNING = 'river-winning',
  PAYMENT = 'payment',
  GAME = 'game',
}

type ResultPhase = { type: ResultType, index: number };

export const useResultPaging = (
  confirming: boolean,
  onRoundFinishConfirmed?: () => void,
  onGameFinishConfirmed?: () => void,
  drawFinishType?: FinishType,
  winningResults?: WinningResult[],
  riverWinningResults?: RiverWinningResult[],
  paymentResults?: PaymentResult[],
  gameResults?: GameResult[]
) => {
  const phases: ResultPhase[] = [
    ...(drawFinishType ? [{ type: ResultType.DRAW, index: 0 }] : []),
    ...(winningResults ? winningResults.map((_, index) => ({ type: ResultType.WINNING, index })) : []),
    ...(riverWinningResults ? riverWinningResults.map((_, index) => ({ type: ResultType.RIVER_WINNING, index })) : []),
    ...(paymentResults ? [{ type: ResultType.PAYMENT, index: 0 }] : []),
  ];
  const hasResult = phases.length > 0 || !!gameResults;
  const [pageIndex, setPageIndex] = useState<number>(0);
  const isLastPage = pageIndex === phases.length - 1;
  const isGameResultPage = gameResults && pageIndex === 0;
  const currentPhase = isGameResultPage ? { type: ResultType.GAME, index: 0 } : phases[pageIndex];

  const handleResultClick = () => {
    if (!hasResult) return;
    if (isGameResultPage) {
      onGameFinishConfirmed && onGameFinishConfirmed();
      return;
    }
    if (isLastPage) {
      if (confirming) {
        onRoundFinishConfirmed && onRoundFinishConfirmed();
        setPageIndex(_ => 0);
      }
    } else {
      setPageIndex((prev) => prev + 1);
    }
  }

  return {
    hasResult,
    resultType: currentPhase?.type,
    resultIndex: currentPhase?.index,
    handleResultClick,
  }
};
