import { memo, useRef } from 'react'
import { Layer, Rect, Stage } from 'react-konva';
import { TABLE_HEIGHT, TABLE_WIDTH, FRONT_HAND_SCALE } from '../../utils/table-constants.js';
import { River } from './organisms/River.js';
import { Wall } from './organisms/Wall.js';
import { FaceUpMelds } from './organisms/FaceUpMelds.js';
import { StandingFrontHand } from './organisms/StandingFrontHand.js';
import { FaceUpHand } from './organisms/FaceUpHand.js';
import { StandingSideHand } from './organisms/StandingSideHand.js';
import { ReadyStick } from './atoms/ReadyStick.js';
import { RoundInfoView } from './organisms/indicators/RoundInfoView.js';
import { useResponsiveStage } from '../../hooks/useResponsiveStage.js';
import { getReadyStickPoint } from '../../utils/table-points.js';
import { WindIndicator } from './organisms/indicators/WindIndicator.js';
import { PlayerNameIndicator } from './organisms/indicators/PlayerNameIndicator.js';
import { ScoreIndicator } from './organisms/indicators/ScoreIndicator.js';
import { useActionInput } from '../../hooks/useActionInput.js';
import { ResultViewContainer } from './organisms/results/ResultViewContainer.js';
import { DeclarationText } from './organisms/indicators/DeclarationText.js';
import { ActionButton } from './organisms/ActionButton.js';
import { Declaration, TableData } from '../../types/table.js';
import { CallAction, Sides, TurnAction } from '@mahjong/core';

interface Props {
  table: TableData;
  turnActionChoices: TurnAction[] | null;
  callActionChoices: CallAction[] | null;
  selectTurnAction: (action: TurnAction) => void;
  selectCallAction: (action: CallAction) => void;
  onAcknowledge?: () => void;
  showAcknowledgeButton?: boolean;
  onGameResultClick?: () => void;
  declarations?: Declaration[];
}

export const Table = memo(function Table({
  table,
  turnActionChoices,
  callActionChoices,
  selectTurnAction,
  selectCallAction,
  onAcknowledge,
  showAcknowledgeButton,
  onGameResultClick,
  declarations = []
}: Props) {
  const {
    handleTileClick,
    handleActionClick,
    selectableActions,
    selectableTileIndices,
    readySelected
  } = useActionInput(
    table.bottom.handTiles || [],
    table.bottom.drawnTile || null,
    turnActionChoices,
    callActionChoices,
    selectTurnAction,
    selectCallAction
  );

  const { bottom, right, top, left, wall } = table;
  const containerRef = useRef<HTMLDivElement>(null);
  const stageProps = useResponsiveStage(TABLE_WIDTH, TABLE_HEIGHT, containerRef);
  const highlightTarget = (callActionChoices && table.callTarget) || null;

  return (
    <div ref={containerRef} className="w-full h-full flex justify-center items-center min-h-0">
      <Stage 
        width={stageProps.width} 
        height={stageProps.height}
        scaleX={stageProps.scale}
        scaleY={stageProps.scale}
      >
        <Layer listening={false}>
          <Rect fill={"white"} width={TABLE_WIDTH} height={TABLE_HEIGHT} />
          
          <FaceUpMelds
            side="top"
            melds={top.openMelds}
            highlightLastSelfQuad={highlightTarget?.side === Sides.ACROSS && highlightTarget.type === "add-quad"}
            highlightAddQuadIndex={highlightTarget?.side === Sides.ACROSS && highlightTarget.type === "self-quad" ? highlightTarget.meldIndex : undefined}
          />
          <FaceUpMelds
            side="right"
            melds={right.openMelds}
            highlightLastSelfQuad={highlightTarget?.side === Sides.RIGHT && highlightTarget.type === "add-quad"}
            highlightAddQuadIndex={highlightTarget?.side === Sides.RIGHT && highlightTarget.type === "self-quad" ? highlightTarget.meldIndex : undefined}
          />
          <FaceUpMelds
            side="left"
            melds={left.openMelds}
            highlightLastSelfQuad={highlightTarget?.side === Sides.LEFT && highlightTarget.type === "add-quad"}
            highlightAddQuadIndex={highlightTarget?.side === Sides.LEFT && highlightTarget.type === "self-quad" ? highlightTarget.meldIndex : undefined}
          />
          <FaceUpMelds side="bottom" melds={bottom.openMelds} />

          <Wall side="top" slots={wall.top} />
          <Wall side="left" slots={wall.left} />
          <Wall side="right" slots={wall.right} />
          <Wall side="bottom" slots={wall.bottom} />
          
          {/* 立直棒の描画 */}
          {top.readyBarExists && <ReadyStick point={getReadyStickPoint("top")} facing="top" />}
          {right.readyBarExists && <ReadyStick point={getReadyStickPoint("right")} facing="right" />}
          {bottom.readyBarExists && <ReadyStick point={getReadyStickPoint("bottom")} facing="bottom" />}
          {left.readyBarExists && <ReadyStick point={getReadyStickPoint("left")} facing="left" />}
          
          <River side="top"
            tiles={top.riverTiles}
            tiltIndex={top.readyIndex}
            highlightLast={highlightTarget?.type === "river" && highlightTarget?.side === Sides.ACROSS}
          />
          <River side="left"
            tiles={left.riverTiles}
            tiltIndex={left.readyIndex}
            highlightLast={highlightTarget?.type === "river" && highlightTarget?.side === Sides.LEFT}
          />
          <River
            side="right"
            tiles={right.riverTiles}
            tiltIndex={right.readyIndex}
            highlightLast={highlightTarget?.type === "river" && highlightTarget?.side === Sides.RIGHT}
          />
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
        </Layer>

        {/* Interactive Layer */}
        <Layer>
          {bottom.isHandOpen ?
            <FaceUpHand side="bottom" tiles={bottom.handTiles} drawnTile={bottom.drawnTile} scale={FRONT_HAND_SCALE} />:
            <StandingFrontHand 
              tiles={bottom.handTiles!} 
              drawnTile={bottom.drawnTile} 
              onTileClick={handleTileClick}
              clickableTileIndices={selectableTileIndices}
              scale={FRONT_HAND_SCALE}
              guides={table.discardGuides || []}
              readySelected={readySelected}
              disqualified={table.handStatus?.disqualified}
            />
          }

          {selectableActions && selectableActions.map((action, index)=> 
            <ActionButton 
              key={index} 
              text={action.text} 
              index={index}
              value={action.value}
              onClick={handleActionClick}
              scale={stageProps.scale}
            />
          )}

          {/* 宣言表示 */}
          {declarations.map(declaration => (
            <DeclarationText
              key={declaration.id}
              text={declaration.text}
              direction={declaration.direction}
              scale={stageProps.scale}
            />
          ))}
          
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
