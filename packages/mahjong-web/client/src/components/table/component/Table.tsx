import { memo, useRef } from 'react'
import { Layer, Rect, Stage } from 'react-konva';
import { TABLE_HEIGHT, TABLE_WIDTH } from '../functions/constants';
import type { Tile, WinningResult, PaymentResult, Wind, GameResult, SeatStatus, RiverWinningResult, FinishType, CallAction, TurnAction } from '@mahjong/core';
import { Meld, Slot } from '../type';
import { River } from './organisms/River';
import { Wall } from './organisms/Wall';
import { ActionButton } from './atoms/ActionButton';
import { FaceUpMelds } from './organisms/FaceUpMelds';
import { StandingFrontHand } from './organisms/StandingFrontHand';
import { FaceUpHand } from './organisms/FaceUpHand';
import { StandingSideHand } from './organisms/StandingSideHand';
import { ReadyStick } from './atoms/ReadyStick';
import { RoundInfoView } from './organisms/indicators/RoundInfoView';
import { useResponsiveStage } from '../hooks/useResponsiveStage';
import { getReadyStickPoint } from '../functions/points';
import { WindIndicator } from './organisms/indicators/WindIndicator';
import { PlayerNameIndicator } from './organisms/indicators/PlayerNameIndicator';
import { ScoreIndicator } from './organisms/indicators/ScoreIndicator';
import { useActionInput } from '../hooks/useActionInput';
import { ResultViewContainer } from './organisms/results/ResultViewContainer';

export interface Props {
  table: TableData;
  turnActionChoices: TurnAction[] | null;
  callActionChoices: CallAction[] | null;
  selectTurnAction: (action: TurnAction) => void;
  selectCallAction: (action: CallAction) => void;
  onAcknowledge?: () => void;
  showAcknowledgeButton?: boolean;
  onGameResultClick?: () => void;
}

export interface RoundInfo {
  roundWind: Wind;
  roundCount: number;
  continueCount: number;
  depositCount: number;
  last: boolean;
}

export interface TableData {
  bottom: SideTableData;
  right: SideTableData;
  top: SideTableData;
  left: SideTableData;
  wall: WallData;
  roundInfo?: RoundInfo;
  winningResults?: WinningResult[];
  riverWinningResults?: RiverWinningResult[];
  paymentResults?: PaymentResult[];
  drawFinishType?: FinishType;
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
  turnActionChoices,
  callActionChoices,
  selectTurnAction,
  selectCallAction,
  onAcknowledge,
  showAcknowledgeButton,
  onGameResultClick
}: Props) {

  const {
    handleTileClick,
    handleActionClick,
    selectableActions,
    selectableTileIndices,
  } = useActionInput(
    table.bottom.handTiles || [],
    table.bottom.drawnTile || null,
    turnActionChoices,
    callActionChoices,
    selectTurnAction,
    selectCallAction
  );
  const actions = selectableActions || [];


  const { bottom, right, top, left, wall } = table;
  const containerRef = useRef<HTMLDivElement>(null);
  const stageProps = useResponsiveStage(TABLE_WIDTH, TABLE_HEIGHT, containerRef);

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
              onTileClick={handleTileClick}
              clickableTileIndices={selectableTileIndices}
            />
          }

          {selectableActions && selectableActions.map((action, index)=> 
            <ActionButton 
              key={index} 
              text={action.text} 
              value={action.value}
              point={{ x: (60 + index * 100) * stageProps.scale, y: 500 * stageProps.scale}} 
              onClick={handleActionClick}
              scale={stageProps.scale}
            />
          )}
          
          {/* 局情報表示 */}
          <RoundInfoView roundInfo={table.roundInfo} scale={stageProps.scale} />
          
          {/* 風インジケータ表示 */}
          <WindIndicator direction="top" seat={table.top.seat} scale={stageProps.scale} />
          <WindIndicator direction="right" seat={table.right.seat} scale={stageProps.scale} />
          <WindIndicator direction="bottom" seat={table.bottom.seat} scale={stageProps.scale} />
          <WindIndicator direction="left" seat={table.left.seat} scale={stageProps.scale} />
          
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
          <ResultViewContainer
            scale={stageProps.scale}
            confirming={showAcknowledgeButton}
            onRoundFinishConfirmed={onAcknowledge}
            onGameFinishConfirmed={onGameResultClick}
            drawFinishType={table.drawFinishType}
            winningResults={table.winningResults}
            riverWinningResults={table.riverWinningResults}
            paymentResults={table.paymentResults}
            gameResults={table.gameResults}
          />
        </Layer>
      </Stage>
    </div>
  )
});
