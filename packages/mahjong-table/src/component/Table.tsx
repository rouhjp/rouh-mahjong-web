import { memo } from 'react'
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

interface Props {
  table: TableData;
  choices: string[];
}

export interface TableData {
  bottom: SideTableData;
  right: SideTableData;
  top: SideTableData;
  left: SideTableData;
  wall: WallData;
}

export interface WallData {
  top: Slot[];
  right: Slot[];
  bottom: Slot[];
  left: Slot[];
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
  choices,
}: Props) {
  const { bottom, right, top, left, wall } = table;

  return <>
    <Stage width={TABLE_WIDTH} height={TABLE_HEIGHT}>
      <Layer>
        <Rect fill={"white"} width={TABLE_WIDTH} height={TABLE_HEIGHT} />

        <FaceUpMelds side="right" melds={right.openMelds} />
        <FaceUpMelds side="bottom" melds={bottom.openMelds} />
        <FaceUpMelds side="top" melds={top.openMelds} />
        <FaceUpMelds side="left" melds={left.openMelds} />
        
        <River side="top" tiles={top.riverTiles} tiltIndex={top.readyIndex} />
        <River side="left" tiles={left.riverTiles} tiltIndex={left.readyIndex} />
        <River side="right" tiles={right.riverTiles} tiltIndex={right.readyIndex} />
        <River side="bottom" tiles={bottom.riverTiles} tiltIndex={bottom.readyIndex} />
        
        <Wall side="top" slots={wall.top} />
        <Wall side="left" slots={wall.left} />
        <Wall side="right" slots={wall.right} />
        <Wall side="bottom" slots={wall.bottom} />

        {bottom.isHandOpen ?
          <FaceUpHand side="bottom" tiles={bottom.handTiles!} drawnTile={bottom.drawnTile} />:
          <StandingFrontHand tiles={bottom.handTiles!} drawnTile={bottom.drawnTile} />
        }

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

        {choices.map((choice, index)=> 
          <ActionButton key={index} text={choice} point={{ x: 60 + index * 100, y: 500}} onClick={() => console.log(choice)} />
        )}
      </Layer>
    </Stage>
  </>
});
