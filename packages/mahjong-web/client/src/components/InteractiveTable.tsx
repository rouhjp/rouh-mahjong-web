import { memo } from 'react';
import { Table } from './table';
import type { TableData } from './table';
import type { TurnAction, CallAction } from '@mahjong/core';
import _ from 'lodash';
import { useActionInput } from './table/hooks/useActionInput';

interface Props {
  table: TableData;
  turnActionChoices: TurnAction[] | null;
  callActionChoices: CallAction[] | null;
  selectTurnAction: (action: TurnAction) => void;
  selectCallAction: (action: CallAction) => void;
  onAcknowledge?: () => void;
  showAcknowledgeButton?: boolean;
  onGameResultClick?: () => void;
}

export const InteractiveTable = memo(function InteractiveTable({
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

  return (
    <Table
      table={table}
      actions={selectableActions}
      onActionClick={handleActionClick}
      onTileClick={handleTileClick}
      clickableTileIndices={selectableTileIndices}
      onAcknowledge={onAcknowledge}
      showAcknowledgeButton={showAcknowledgeButton}
      onGameResultClick={onGameResultClick}
    />
  );
});
