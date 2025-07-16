import { CallAction, Tile, TurnAction } from "@mahjong/core";
import _ from "lodash";
import { useState } from "react";

export const useActionInput = (
  handTiles: Tile[],
  drawnTile: Tile | null,
  turnActionChoices: TurnAction[] | null,
  callActionChoices: CallAction[] | null,
  selectTurnAction: (action: TurnAction) => void,
  selectCallAction: (action: CallAction) => void,
) => {
  const actionChoices = turnActionChoices || callActionChoices || null;
  const [currentActionType, setCurrentActionType] = useState<string | null>(null);
  const [currentSelectedTileIndex, setCurrentSelectedTileIndex] = useState<number | null>(null);
  const selectableActions: { text: string, value: string }[] = [];
  const selectableTileIndices: number[] = [];

  if (actionChoices !== null) {
    if (currentActionType === null) {
      // 打牌以外の選択肢をアクションボタンで表示する
      selectableActions.push(
        ...actionChoices.filter(action => action.type !== "Discard")
          .map(action => ({ text: getText(action), value: action.type }))
      );
    } else {
      // キャンセルボタンで打牌に戻る
      selectableActions.push({ text: "キャンセル", value: "cancel" });
    }
  }

  if (callActionChoices !== null) {
    if (currentActionType !== null) {
      // チーもしくはポンのみ
      const filteredActions = callActionChoices
        .filter(action => action.type === "Chi" || action.type === "Pon")
        .filter(action => action.type === currentActionType);
      if (currentSelectedTileIndex !== null) {
        // 1枚すでに選択中の場合
        const selectedTile = handTiles[currentSelectedTileIndex];
        const otherSelectableTiles: Tile[] = filteredActions
          .filter(action => action.baseTiles.includes(selectedTile))
          .map(action => action.baseTiles[0] === selectedTile ? action.baseTiles[1] : action.baseTiles[0]);
        selectableTileIndices.push(
          ...Array.from({ length: handTiles.length }, (_, i) => i)
            .filter(i => i !== currentSelectedTileIndex)
            .filter(i => otherSelectableTiles.includes(handTiles[i]))
        )
      } else {
        const selectableTiles: Tile[] = filteredActions
          .flatMap(action => action.baseTiles);
        selectableTileIndices.push(
          ...Array.from({ length: handTiles.length }, (_, i) => i)
            .filter(i => selectableTiles.includes(handTiles[i]))
        );
      }
    }
  }

  if (turnActionChoices !== null) {
    if (currentActionType !== null) {
      // カン・立直
      if (currentActionType === "Ready") {
        // 立直
        const filteredActions = turnActionChoices
          .filter(action => action.type === "Ready")
          .filter(action => !action.discardDrawn);
        const seletableTiles = filteredActions.map(action => action.tile);
        selectableTileIndices.push(
          ...Array.from({ length: handTiles.length }, (_, i) => i)
            .filter(i => seletableTiles.includes(handTiles[i]))
        );
        if (turnActionChoices.some(action => action.type === "Ready" && action.discardDrawn)) {
          selectableTileIndices.push(handTiles.length);
        }
      } else {
        // カン
        const filteredActions = turnActionChoices
          .filter(action => action.type === "Kan");
        const selectableTiles = filteredActions.map(action => action.tile);
        selectableTileIndices.push(
          ...Array.from({ length: handTiles.length }, (_, i) => i)
            .filter(i => selectableTiles.includes(handTiles[i]))
        );
        if (drawnTile && selectableTiles.includes(drawnTile)) {
          selectableTileIndices.push(handTiles.length);
        }
      }
    } else {
      // 打牌
      const filteredActions = turnActionChoices
        ? turnActionChoices
            .filter(action => action.type === "Discard")
            .filter(action => !action.discardDrawn)
        : [];
      const selectableTiles = filteredActions.map(action => action.tile);
      selectableTileIndices.push(
        ...Array.from({ length: handTiles.length }, (_, i) => i)
          .filter(i => selectableTiles.includes(handTiles[i]))
      );
      if (turnActionChoices?.some(action => action.type === "Discard" && action.discardDrawn)) {
        selectableTileIndices.push(handTiles.length);
      }
    }
  }

  const resetCurrentSelection = () => {
    setCurrentActionType(() => null);
    setCurrentSelectedTileIndex(() => null);
  } 

  const handleTileClick = (index: number) => {
    if (turnActionChoices !== null) {
      if (currentActionType === null || currentActionType === "Ready") {
        // 打牌・立直
        const actionType = currentActionType || "Discard";
        const drawn = index === handTiles.length;
        const result = drawn?
          turnActionChoices.find(action => action.type === actionType && action.discardDrawn && action.tile === drawnTile) :
          turnActionChoices.find(action => action.type === actionType && !action.discardDrawn && action.tile === handTiles[index]);
        resetCurrentSelection();
        selectTurnAction(result!);
      } else {
        // カン
        const tile = index === handTiles.length ? drawnTile : handTiles[index];
        const result = turnActionChoices
          .find(action => action.type === "Kan" && action.tile === tile);
        resetCurrentSelection();
        selectTurnAction(result!);
      }
    }
    if (callActionChoices !== null) {
      // チー・ポン
      if (currentActionType !== null) {
        if (currentSelectedTileIndex === null) {
          const tile = handTiles[index];
          const filteredActions = callActionChoices
            .filter(action => action.type === "Chi" || action.type === "Pon")
            .filter(action => action.type === currentActionType)
            .filter(action => action.baseTiles.includes(tile));
          if (filteredActions.length === 1) {
            resetCurrentSelection();
            selectCallAction(filteredActions[0]);
          } else if (filteredActions.length > 1) {
            // 一度で絞りきれない場合は選択中の牌を保持して更に1枚選択させる
            setCurrentSelectedTileIndex(() => index);
          }
        } else {
          const tiles = [handTiles[currentSelectedTileIndex], handTiles[index]];
          const filteredActions = callActionChoices
            .filter(action => action.type === "Chi" || action.type === "Pon")
            .filter(action => action.type === currentActionType)
            .filter(action => action.baseTiles[0] === tiles[0] && action.baseTiles[1] === tiles[1] ||
                              action.baseTiles[0] === tiles[1] && action.baseTiles[1] === tiles[0]);
          if (filteredActions.length === 1) {
            resetCurrentSelection();
            selectCallAction(filteredActions[0]);
          }
        }
      }
    }
  }

  const handleActionClick = (clickedValue: string) => {
    if (clickedValue === "cancel") {
      // キャンセルボタンが押された場合は打牌に戻る
      resetCurrentSelection();
      return;
    }

    if (turnActionChoices !== null) {
      const filteredActions = turnActionChoices.filter(action => action.type === clickedValue);
      if (filteredActions.length === 1 && clickedValue !== "Ready") {
        resetCurrentSelection();
        selectTurnAction(filteredActions[0]);
        return;
      } else if (filteredActions.length > 1 || clickedValue === "Ready") {
        setCurrentActionType(() => clickedValue);
        setCurrentSelectedTileIndex(() => null);
        return;
      }
    }

    if (callActionChoices !== null) {
      const filteredActions = callActionChoices.filter(action => action.type === clickedValue);
      if (filteredActions.length === 1) {
        resetCurrentSelection();
        selectCallAction(filteredActions[0]);
        return;
      } else if (filteredActions.length > 1) {
        setCurrentActionType(() => clickedValue);
        setCurrentSelectedTileIndex(() => null);
        return;
      }
    }
  }

  return {
    handleTileClick,
    handleActionClick,
    selectableActions: _.uniqBy(selectableActions, action => action.value),
    selectableTileIndices,
  }
}

function getText(action: TurnAction | CallAction): string {
  switch (action.type) {
    case "Tsumo": return "ツモ";
    case "NineTiles": return "九種九牌";
    case "Ready": return "リーチ";
    case "Ron": return "ロン";
    case "Chi": return "チー";
    case "Pon": return "ポン";
    case "Kan": return "カン";
    case "Pass": return "パス";
  }
  return "";
}
