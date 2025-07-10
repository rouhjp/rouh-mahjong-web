import { memo, useRef } from 'react'
import { Layer, Rect, Stage } from 'react-konva';
import { TABLE_HEIGHT, TABLE_WIDTH } from '../functions/constants';
import type { Tile } from '@mahjong/core';
import { Meld, Slot } from '../type';
import { River } from './organisms/River';
import { Wall } from './organisms/Wall';
import { ActionButton } from './ActionButton';
import { FaceUpMelds } from './organisms/FaceUpMelds';
import { StandingFrontHand } from './organisms/StandingFrontHand';
import { FaceUpHand } from './organisms/FaceUpHand';
import { StandingSideHand } from './organisms/StandingSideHand';
import { ReadyStick } from './atoms/ReadyStick';
import { useResponsiveStage } from '../hooks/useResponsiveStage';
import { getReadyStickPoint } from '../functions/points';

export interface Props {
  table: TableData;
  actions: { text: string, value: string }[];
  onActionClick?: (value: string) => void;
  onTileClick?: (index: number) => void;
  clickableTileIndices?: number[];
}

export interface TableData {
  bottom: SideTableData;
  right: SideTableData;
  top: SideTableData;
  left: SideTableData;
  wall: WallData;
}

export interface WallData {
  top: Slot[][];
  right: Slot[][];
  bottom: Slot[][];
  left: Slot[][];
}

export interface SideTableData {
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
}: Props) {
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
            <FaceUpHand side="left" tiles={left.handTiles!} drawnTile={left.drawnTile} />:
            <StandingSideHand side="left" handSize={left.handSize} hasDrawnTile={left.hasDrawnTile} />
          }

          {right.isHandOpen ?
            <FaceUpHand side="right" tiles={right.handTiles!} drawnTile={right.drawnTile} />:
            <StandingSideHand side="right" handSize={right.handSize} hasDrawnTile={right.hasDrawnTile} />
          }

          {top.isHandOpen ?
            <FaceUpHand side="top" tiles={top.handTiles!} drawnTile={top.drawnTile} />:
            <StandingSideHand side="top" handSize={top.handSize} hasDrawnTile={top.hasDrawnTile} />
          }
        </Layer>

        {/* Interactive Layer */}
        <Layer>
          {bottom.isHandOpen ?
            <FaceUpHand side="bottom" tiles={bottom.handTiles!} drawnTile={bottom.drawnTile} />:
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
        </Layer>
      </Stage>
    </div>
  )
});
