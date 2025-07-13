import { memo, useRef, useState, useEffect } from 'react'
import { Group, Layer, Rect, Stage } from 'react-konva';
import { TABLE_HEIGHT, TABLE_WIDTH } from '../functions/constants';
import type { Tile, WinningResult, PaymentResult, Wind, GameResult, SeatStatus, RoundFinished } from '@mahjong/core';
import { Meld, Slot } from '../type';
import { River } from './organisms/River';
import { Wall } from './organisms/Wall';
import { ActionButton } from './ActionButton';
import { FaceUpMelds } from './organisms/FaceUpMelds';
import { StandingFrontHand } from './organisms/StandingFrontHand';
import { FaceUpHand } from './organisms/FaceUpHand';
import { StandingSideHand } from './organisms/StandingSideHand';
import { ReadyStick } from './atoms/ReadyStick';
import { ResultView } from './organisms/ResultView';
import { RiverWinningResultView } from './organisms/RiverWinningResultView';
import { PaymentResultView } from './organisms/PaymentResultView';
import { RoundInfoView } from './organisms/RoundInfoView';
import { GameResultView } from './organisms/GameResultView';
import { useResponsiveStage } from '../hooks/useResponsiveStage';
import { getReadyStickPoint } from '../functions/points';
import { WindIndicator } from './atoms/WindIndicator';
import { PlayerNameIndicator } from './atoms/PlayerNameIndicator';
import { ScoreIndicator } from './atoms/ScoreIndicator';
import { DrawView } from './organisms/DrawView';

export interface Props {
  table: TableData;
  actions: { text: string, value: string }[];
  onActionClick?: (value: string) => void;
  onTileClick?: (index: number) => void;
  clickableTileIndices?: number[];
  onAcknowledge?: () => void;
  showAcknowledgeButton?: boolean;
}

export interface RoundInfo {
  roundWind: Wind;
  roundCount: number;
  continueCount: number;
  depositCount: number;
  last: boolean;
}

export interface ResultProgression {
  winningResults: WinningResult[];
  paymentResult?: PaymentResult[];
  currentIndex: number;
  phase: 'winning' | 'payment' | 'complete';
}

export interface RoundFinishedProgression {
  roundFinishedEvent: RoundFinished;
  currentIndex: number;
  phase: 'winning' | 'river-winning' | 'payment' | 'draw' | 'complete';
}


export interface TableData {
  bottom: SideTableData;
  right: SideTableData;
  top: SideTableData;
  left: SideTableData;
  wall: WallData;
  roundInfo?: RoundInfo;
  roundFinishedEvent?: RoundFinished;
  gameResults?: GameResult[];
}

export interface WallData {
  top: Slot[][];
  right: Slot[][];
  bottom: Slot[][];
  left: Slot[][];
}

export interface SideTableData {
  seat?: SeatStatus;
  riverTiles: Tile[];
  readyIndex?: number;
  readyBarExists: boolean;
  
  handSize: number;
  hasDrawnTile: boolean;
  isHandOpen: boolean;
  handTiles?: Tile[];
  drawnTile?: Tile;

  openMelds: Meld[];
}

export const Table = memo(function Table({
  table,
  actions,
  onActionClick = () => {},
  onTileClick = () => {},
  clickableTileIndices = [],
  onAcknowledge = () => {},
  showAcknowledgeButton = false,
}: Props) {
  const { bottom, right, top, left, wall } = table;
  const containerRef = useRef<HTMLDivElement>(null);
  const stageProps = useResponsiveStage(TABLE_WIDTH, TABLE_HEIGHT, containerRef);

  // State for result progression
  const [roundFinishedProgression, setRoundFinishedProgression] = useState<RoundFinishedProgression | null>(null);

  // isDrawFinishType function moved from utils to here temporarily
  function isDrawFinishType(finishType: string): boolean {
    return [
      'exhauted',
      'nine-orphans', 
      'four-quads',
      'four-winds',
      'four-players-ready',
      'three-players-ron'
    ].includes(finishType);
  }

  // Update RoundFinished progression when roundFinishedEvent changes
  useEffect(() => {
    if (table.roundFinishedEvent) {
      const event = table.roundFinishedEvent;
      
      // Determine the starting phase based on available results
      // 流局系の場合は最優先で表示
      let startingPhase: 'winning' | 'river-winning' | 'payment' | 'draw' | 'complete' = 'complete';
      
      if (isDrawFinishType(event.finishType)) {
        startingPhase = 'draw';
      } else if (event.winningResults && event.winningResults.length > 0) {
        startingPhase = 'winning';
      } else if (event.riverWinningResults && event.riverWinningResults.length > 0) {
        startingPhase = 'river-winning';
      } else if (event.paymentResults && event.paymentResults.length > 0) {
        startingPhase = 'payment';
      }
      
      if (startingPhase !== 'complete') {
        setRoundFinishedProgression({
          roundFinishedEvent: event,
          currentIndex: 0,
          phase: startingPhase
        });
      } else {
        setRoundFinishedProgression(null);
      }
    } else {
      setRoundFinishedProgression(null);
    }
  }, [table.roundFinishedEvent]);

  // Handle result click progression for RoundFinished events
  const handleRoundFinishedResultClick = () => {
    if (!roundFinishedProgression) return;

    const event = roundFinishedProgression.roundFinishedEvent;
    const currentPhase = roundFinishedProgression.phase;
    const currentIndex = roundFinishedProgression.currentIndex;

    if (currentPhase === 'winning' && event.winningResults) {
      if (currentIndex < event.winningResults.length - 1) {
        // Show next WinningResult
        setRoundFinishedProgression(prev => prev ? {
          ...prev,
          currentIndex: prev.currentIndex + 1
        } : null);
      } else {
        // Move to next phase
        if (event.riverWinningResults && event.riverWinningResults.length > 0) {
          setRoundFinishedProgression(prev => prev ? {
            ...prev,
            phase: 'river-winning',
            currentIndex: 0
          } : null);
        } else if (event.paymentResults && event.paymentResults.length > 0) {
          setRoundFinishedProgression(prev => prev ? {
            ...prev,
            phase: 'payment',
            currentIndex: 0
          } : null);
        } else {
          // Complete
          onAcknowledge();
          setRoundFinishedProgression(prev => prev ? {
            ...prev,
            phase: 'complete'
          } : null);
        }
      }
    } else if (currentPhase === 'river-winning' && event.riverWinningResults) {
      if (currentIndex < event.riverWinningResults.length - 1) {
        // Show next RiverWinningResult
        setRoundFinishedProgression(prev => prev ? {
          ...prev,
          currentIndex: prev.currentIndex + 1
        } : null);
      } else {
        // Move to payment phase or complete
        if (event.paymentResults && event.paymentResults.length > 0) {
          setRoundFinishedProgression(prev => prev ? {
            ...prev,
            phase: 'payment',
            currentIndex: 0
          } : null);
        } else {
          // Complete
          onAcknowledge();
          setRoundFinishedProgression(prev => prev ? {
            ...prev,
            phase: 'complete'
          } : null);
        }
      }
    } else if (currentPhase === 'payment') {
      // Call acknowledge and complete
      onAcknowledge();
      setRoundFinishedProgression(prev => prev ? {
        ...prev,
        phase: 'complete'
      } : null);
    } else if (currentPhase === 'draw') {
      // Move to next available phase after draw
      if (event.winningResults && event.winningResults.length > 0) {
        setRoundFinishedProgression(prev => prev ? {
          ...prev,
          phase: 'winning',
          currentIndex: 0
        } : null);
      } else if (event.riverWinningResults && event.riverWinningResults.length > 0) {
        setRoundFinishedProgression(prev => prev ? {
          ...prev,
          phase: 'river-winning',
          currentIndex: 0
        } : null);
      } else if (event.paymentResults && event.paymentResults.length > 0) {
        setRoundFinishedProgression(prev => prev ? {
          ...prev,
          phase: 'payment',
          currentIndex: 0
        } : null);
      } else {
        // Complete - no other results to show
        onAcknowledge();
        setRoundFinishedProgression(prev => prev ? {
          ...prev,
          phase: 'complete'
        } : null);
      }
    }
  };

  // Result click handler
  const handleResultClick = () => {
    if (roundFinishedProgression) {
      handleRoundFinishedResultClick();
    } else if (showAcknowledgeButton) {
      // Direct acknowledge for cases without RoundFinished event
      onAcknowledge();
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full flex justify-center items-center">
      <Stage 
        width={stageProps.width} 
        height={stageProps.height}
        scaleX={stageProps.scale}
        scaleY={stageProps.scale}
      >
        <Layer listening={false}>
          <Rect fill={"white"} width={TABLE_WIDTH} height={TABLE_HEIGHT} />
          
          <FaceUpMelds side="top" melds={top.openMelds} />
          <FaceUpMelds side="right" melds={right.openMelds} />
          <FaceUpMelds side="bottom" melds={bottom.openMelds} />
          <FaceUpMelds side="left" melds={left.openMelds} />

          <Wall side="top" slots={wall.top} />
          <Wall side="left" slots={wall.left} />
          <Wall side="right" slots={wall.right} />
          <Wall side="bottom" slots={wall.bottom} />
          
          {/* 立直棒の描画 */}
          {top.readyBarExists && <ReadyStick point={getReadyStickPoint("top")} facing="top" />}
          {right.readyBarExists && <ReadyStick point={getReadyStickPoint("right")} facing="right" />}
          {bottom.readyBarExists && <ReadyStick point={getReadyStickPoint("bottom")} facing="bottom" />}
          {left.readyBarExists && <ReadyStick point={getReadyStickPoint("left")} facing="left" />}
          
          <River side="top" tiles={top.riverTiles} tiltIndex={top.readyIndex} />
          <River side="left" tiles={left.riverTiles} tiltIndex={left.readyIndex} />
          <River side="right" tiles={right.riverTiles} tiltIndex={right.readyIndex} />
          <River side="bottom" tiles={bottom.riverTiles} tiltIndex={bottom.readyIndex} />

          {left.isHandOpen ?
            <FaceUpHand side="left" tiles={left.handTiles} drawnTile={left.drawnTile} />:
            <StandingSideHand side="left" handSize={left.handSize} hasDrawnTile={left.hasDrawnTile} />
          }

          {right.isHandOpen ?
            <FaceUpHand side="right" tiles={right.handTiles} drawnTile={right.drawnTile} />:
            <StandingSideHand side="right" handSize={right.handSize} hasDrawnTile={right.hasDrawnTile} />
          }

          {top.isHandOpen ?
            <FaceUpHand side="top" tiles={top.handTiles} drawnTile={top.drawnTile} />:
            <StandingSideHand side="top" handSize={top.handSize} hasDrawnTile={top.hasDrawnTile} />
          }
        </Layer>

        {/* Interactive Layer */}
        <Layer>
          {bottom.isHandOpen ?
            <FaceUpHand side="bottom" tiles={bottom.handTiles} drawnTile={bottom.drawnTile} />:
            <StandingFrontHand 
              tiles={bottom.handTiles!} 
              drawnTile={bottom.drawnTile} 
              onTileClick={onTileClick}
              clickableTileIndices={clickableTileIndices}
            />
          }

          {actions.map((action, index)=> 
            <ActionButton 
              key={index} 
              text={action.text} 
              value={action.value}
              point={{ x: 60 + index * 100, y: 500}} 
              onClick={onActionClick} 
            />
          )}
          
          {/* 局情報表示 */}
          <RoundInfoView roundInfo={table.roundInfo} scale={stageProps.scale} />
          
          {/* 風インジケータ表示 */}
          <WindIndicator direction="top" seat={table.top.seat} />
          <WindIndicator direction="right" seat={table.right.seat} />
          <WindIndicator direction="bottom" seat={table.bottom.seat} />
          <WindIndicator direction="left" seat={table.left.seat} />
          
          {/* プレイヤー名・点数表示 */}
          <PlayerNameIndicator direction="top" seat={table.top.seat} scale={stageProps.scale} />
          <PlayerNameIndicator direction="right" seat={table.right.seat} scale={stageProps.scale} />
          <PlayerNameIndicator direction="bottom" seat={table.bottom.seat} scale={stageProps.scale} />
          <PlayerNameIndicator direction="left" seat={table.left.seat} scale={stageProps.scale} />
          
          <ScoreIndicator direction="top" seat={table.top.seat} scale={stageProps.scale} />
          <ScoreIndicator direction="right" seat={table.right.seat} scale={stageProps.scale} />
          <ScoreIndicator direction="bottom" seat={table.bottom.seat} scale={stageProps.scale} />
          <ScoreIndicator direction="left" seat={table.left.seat} scale={stageProps.scale} />
          
          {/* 結果表示 */}
          {roundFinishedProgression && roundFinishedProgression.phase !== 'complete' ? (
            /* RoundFinished-based progressive result display */
            <Group>
              {roundFinishedProgression.phase === 'winning' && roundFinishedProgression.roundFinishedEvent.winningResults ? (
                <ResultView 
                  result={roundFinishedProgression.roundFinishedEvent.winningResults[roundFinishedProgression.currentIndex]} 
                  scale={stageProps.scale} 
                />
              ) : roundFinishedProgression.phase === 'river-winning' && roundFinishedProgression.roundFinishedEvent.riverWinningResults ? (
                <RiverWinningResultView 
                  result={roundFinishedProgression.roundFinishedEvent.riverWinningResults[roundFinishedProgression.currentIndex]} 
                  scale={stageProps.scale} 
                />
              ) : roundFinishedProgression.phase === 'payment' && roundFinishedProgression.roundFinishedEvent.paymentResults ? (
                <PaymentResultView 
                  results={roundFinishedProgression.roundFinishedEvent.paymentResults} 
                  scale={stageProps.scale} 
                />
              ) : roundFinishedProgression.phase === 'draw' ? (
                <DrawView 
                  finishType={roundFinishedProgression.roundFinishedEvent.finishType} 
                  scale={stageProps.scale} 
                />
              ) : null}
              
              {/* Clickable overlay for progression - positioned after views */}
              <Rect
                x={0}
                y={0}
                width={TABLE_WIDTH}
                height={TABLE_HEIGHT}
                fill="transparent"
                onClick={handleResultClick}
              />
            </Group>
          ) : table.gameResults ? (
            /* GameResult display */
            <Group>
              <GameResultView 
                results={table.gameResults} 
                scale={stageProps.scale} 
              />
              
              {/* Clickable overlay for acknowledge - positioned after view */}
              <Rect
                x={0}
                y={0}
                width={TABLE_WIDTH}
                height={TABLE_HEIGHT}
                fill="transparent"
                onClick={handleResultClick}
              />
            </Group>
          ) : showAcknowledgeButton ? (
            /* Direct acknowledge overlay */
            <Group>
              <Rect
                x={0}
                y={0}
                width={TABLE_WIDTH}
                height={TABLE_HEIGHT}
                fill="transparent"
                onClick={handleResultClick}
              />
            </Group>
          ) : null}
        </Layer>
      </Stage>
    </div>
  )
});
