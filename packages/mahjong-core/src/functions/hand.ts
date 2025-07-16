import _ from "lodash";
import { isStraightTiles, isTripleTiles, ORPHAN_TILES, sorted, Tile, Tiles, TileInfo, equalsIgnoreRed, getSimplifiedTile, isOrphan, hasNext, getNextTile, hasPrevious, getPreviousTile, compareTiles, isHonor, isNextOf } from "../tiles";
import { isObviouslyNotCompleted, winningTileCandidatesOf } from "./pattern";
import { combinations, containsEach, removeEach } from "./utils";

/**
 * 打牌することで立直宣言可能な牌のリストを取得します。
 * @param handTiles 手牌
 * @param drawnTile 自摸牌
 * @returns 立直宣言可能な牌のリスト
 */
export function readyTilesOf(handTiles: Tile[], drawnTile: Tile): Tile[] {
  const allTiles = [...handTiles, drawnTile];
  return _.uniq(allTiles).filter(tile => isHandReady(removeEach(allTiles, [tile])));
}

/**
 * 聴牌かどうか判定します。
 * @param handTiles 手牌
 * @returns 判定結果
 */
export function isHandReady(handTiles: Tile[]): boolean {
  if(winningTileOfSevenPairs(handTiles).length > 0) return true;
  if(winningTileOfThirteenOrphans(handTiles).length > 0) return true;
  return winningTileCandidatesOf(handTiles).some(tile => isCompleted(handTiles, tile));
}

/**
 * 手牌に対する和了牌のセットを取得します。
 * なければ空のリストを返します。
 * 赤ドラ牌はリストに含まれません。
 * @param handTiles 手牌
 * @returns 和了牌のリスト
 */
export function winningTilesOf(handTiles: Tile[]): Tile[] {
  const winningTiles: Tile[] = [];
  winningTiles.push(...winningTileOfSevenPairs(handTiles));
  winningTiles.push(...winningTileOfThirteenOrphans(handTiles));
  winningTiles.push(...winningTileCandidatesOf(handTiles)
    .filter(tile => !winningTiles.some(t => equalsIgnoreRed(t, tile)))
    .filter(tile => isCompletedMeldHand(handTiles, tile)));
  return winningTiles;
}

function winningTileOfSevenPairs(handTiles: Tile[]): Tile[] {
  if (handTiles.length !== 13) return [];
  const groups: Tile[][] = Object.values(_.groupBy(handTiles, tile => TileInfo[tile].tileNumber));
  const pairs = groups.filter(group => group.length === 2);
  const singles = groups.filter(group => group.length === 1);
  if (pairs.length === 6 && singles.length === 1) {
    return [getSimplifiedTile(singles[0][0])];
  }
  return [];
}

function winningTileOfThirteenOrphans(handTiles: Tile[]): Tile[] {
  if (handTiles.length !== 13) return [];
  return ORPHAN_TILES.filter(tile => isThirteenOrphansComplated(handTiles, tile));
}

/**
 * 九種九牌形かどうか判定します。
 * @param handTiles 手牌
 * @param drawnTile 自摸牌
 * @returns 判定結果
 */
export function isNineTiles(handTiles: Tile[], drawnTile: Tile): boolean {
  return _.uniqBy([...handTiles, drawnTile].filter(tile => isOrphan(tile)), tile => TileInfo[tile].tileNumber).length >= 9;
}

/**
 * 和了形かどうか判定します。
 * @param handTiles 手牌
 * @param winningTile 和了牌
 * @returns 判定結果
 */
export function isCompleted(handTiles: Tile[], winningTile: Tile): boolean {
  if (isThirteenOrphansComplated(handTiles, winningTile)) return true;
  if (isSevenPairsCompleted(handTiles, winningTile)) return true;
  if (isObviouslyNotCompleted(handTiles, winningTile)) return false;
  return isCompletedMeldHand(handTiles, winningTile);
}

function isCompletedMeldHand(handTiles: Tile[], winningTile: Tile): boolean {
  const allTiles = sorted([...handTiles, winningTile]);
  const headCandidates = headCandidatesOf(allTiles);
  for (const headCandidate of headCandidates) {
    if (arrangeBody(removeEach(allTiles, headCandidate))) {
      return true;
    }
  }
  return false;
}

/**
 * 国士無双和了形かどうか判定します。
 * @param handTiles 手牌
 * @param winningTile 和了牌
 * @returns 判定結果
 */
export function isThirteenOrphansComplated(handTiles: Tile[], winningTile: Tile): boolean {
  if (handTiles.length !== 13) return false;
  const tiles = _.uniqBy([...handTiles, winningTile], tile => TileInfo[tile].tileNumber);
  return tiles.length === 13 && tiles.every(tile => isOrphan(tile));
}

/**
 * 七対子和了形かどうか判定します。
 * @param handTiles 手牌
 * @param winningTile 和了牌
 * @returns 判定結果
 */
export function isSevenPairsCompleted(handTiles: Tile[], winningTile: Tile): boolean {
  if (handTiles.length !== 13) return false;
  return Object.values(_.groupBy([...handTiles, winningTile], tile => TileInfo[tile].tileNumber))
    .every(group => group.length === 2);
}

function headCandidatesOf(allTiles: Tile[]): Tile[][] {
  return Object.values(_.groupBy(allTiles, tile => TileInfo[tile].tileNumber))
    .filter(group => group.length >= 2)
    .map(group => group.slice(0, 2));
}

/**
 * 手牌を並べ替え、取りうる雀頭と面子のリストに変換します。
 * 赤ドラ牌の位置の違いによる並べ替えパターンは考慮しません。
 * @param handTiles 手牌
 * @param winningTile 和了牌
 * @returns 並べ替え後の手牌のリスト
 */
export function arrange(handTiles: Tile[], winningTile: Tile): Tile[][][] {
  const hands: Tile[][][] = [];
  const allTiles = sorted([...handTiles, winningTile]);
  const headCandidates = headCandidatesOf(allTiles);
  for (const headCandidate of headCandidates) {
    const body = removeEach(allTiles, headCandidate)
    for (const arrangedBody of arrangeBodyAll(body)) {
      hands.push([headCandidate, ...arrangedBody]);
    }
  }
  return hands;
}

function arrangeBody(bodyTiles: Tile[]): Tile[][] | null {
  if (bodyTiles.length === 0) return [];
  const checkingTiles = sorted(bodyTiles);
  const melds: Tile[][] = [];
  while (checkingTiles.length > 0) {
    if (checkingTiles.length % 3 !== 0) {
      throw new Error(`invalid size of checkingTiles: ${checkingTiles.length}`);
    }
    while (checkingTiles.length >= 3) {
      if (equalsIgnoreRed(checkingTiles[0], checkingTiles[2])) {
        // 刻子
        melds.push(checkingTiles.splice(0, 3));
      } else {
        // 順子
        const firstReference = checkingTiles[0];
        if (!hasNext(firstReference)) return null;
        const secondReference = getNextTile(firstReference);
        const secondIndex = checkingTiles.findIndex(tile => equalsIgnoreRed(tile, secondReference));
        if (secondIndex === -1) return null;
        if (!hasNext(secondReference)) return null;
        const thirdReference = getNextTile(secondReference);
        const thirdIndex = checkingTiles.findIndex(tile => equalsIgnoreRed(tile, thirdReference));
        if (thirdIndex === -1) return null;
        const third = checkingTiles.splice(thirdIndex, 1)[0];
        const second = checkingTiles.splice(secondIndex, 1)[0];
        const first = checkingTiles.splice(0, 1)[0];
        melds.push([first, second, third]);
      }
    }
  }
  return melds;
}

function arrangeBodyAll(bodyTiles: Tile[]): Tile[][][] {
  const arranged = arrangeBody(bodyTiles);
  if (!arranged) return [];
  if (arranged.length >= 3) {
    const rearrangedBodies: Tile[][][] = [arranged];
    for (const melds of combinations(arranged, 3)) {
      // 三連刻を順子に変換
      const remaining: Tile[][] = removeEach(arranged, melds);
      const rearrangedBody: Tile[][] = _.zip(...melds) as Tile[][];
      if (isStraightTiles(rearrangedBody[0]) && isStraightTiles(rearrangedBody[2])) {
        rearrangedBodies.push(sortedTilesOf([...remaining, ...rearrangedBody]));
      }
    }
    return rearrangedBodies;
  }
  return [arranged];
}

function sortedTilesOf(tiles: Tile[][]) {
  return [...tiles].sort((a, b) => {
    const maxLength = Math.max(a.length, b.length);
    for (let i = 0; i < maxLength; i++) {
      if (i >= a.length) return -1;
      if (i >= b.length) return 1;
      const result = compareTiles(a[i], b[i]);
      if (result !== 0) return result;
    }
    return 0;
  });
}

function colorVariationsOf(tile: Tile) {
  if (tile === Tiles.M5 || tile === Tiles.M5R) {
    return [Tiles.M5, Tiles.M5R];
  }
  if (tile === Tiles.P5 || tile === Tiles.P5R) {
    return [Tiles.P5, Tiles.P5R];
  }
  if (tile === Tiles.S5 || tile === Tiles.S5R) {
    return [Tiles.S5, Tiles.S5R];
  }
  return [tile];
}

function colorVariationsOfBase(base: Tile[]): Tile[][] {
  const variations: Tile[][] = [];
  const firstVariations = colorVariationsOf(base[0]);
  const secondVariations = colorVariationsOf(base[1]);
  for (const first of firstVariations) {
    for (const second of secondVariations) {
      variations.push(sorted([first, second]));
    }
  }
  return _.uniqWith(variations, _.isEqual);
}

function straightBasesOf(tile: Tile): Tile[][] {
  if (isHonor(tile)) {
    return [];
  }
  const bases: Tile[][] = [];
  if (hasNext(tile)) {
    const second = getNextTile(tile);
    if (hasNext(second)) {
      const third = getNextTile(second);
      bases.push([second, third]);
    }
  }
  if (hasPrevious(tile)) {
    const second = getPreviousTile(tile);
    if (hasPrevious(second)) {
      const first = getPreviousTile(second);
      bases.push([first, second]);
    }
  }
  if (hasPrevious(tile) && hasNext(tile)) {
    const first = getPreviousTile(tile);
    const third = getNextTile(tile);
    bases.push([first, third]);
  }
  return bases;
}

/**
 * 打牌に対して、チー可能な手牌中の搭子を取得します。
 * なければ空のリストを返します。
 * @param handTiles 手牌
 * @param discardedTile 打牌
 * @returns チー可能な搭子のリスト
 */
export function selectableStraightBasesOf(handTiles: Tile[], discardedTile: Tile): Tile[][] {
  const straightBases: Tile[][] = straightBasesOf(discardedTile).flatMap(base => colorVariationsOfBase(base));
  return sortedTilesOf(straightBases.filter(base => containsEach(handTiles, base)));
}

/**
 * 打牌に対して、ポン可能な手牌中の対子を取得します。
 * なければ空のリストを返します。
 * @param handTiles 手牌
 * @param discardedTile 打牌
 * @returns ポン可能な対子のリスト
 */
export function selectableTripleBasesOf(handTiles: Tile[], discardedTile: Tile): Tile[][] {
  const tripleBases: Tile[][] = colorVariationsOfBase([discardedTile, discardedTile]);
  return tripleBases.filter(base => containsEach(handTiles, base));
}

/**
 * 打牌に対して、カン可能な手牌中の刻子を取得します。
 * なければ空のリストを返します。
 * @param handTiles 手牌
 * @param discardedTile 打牌
 * @returns カン可能な刻子のリスト
 */
export function selectableQuadBasesOf(handTiles: Tile[], discardedTile: Tile): Tile[][] {
  const quadBase: Tile[] = handTiles.filter(tile => equalsIgnoreRed(tile, discardedTile));
  return quadBase.length === 3 ? [quadBase] : [];
}

/**
 * 立直した手牌に対して、ツモ時にカン可能な牌のリストを取得します。
 * 赤ドラ牌はリストに含まれません。
 * @param handTiles 
 * @returns カン可能な牌のリスト
 */
export function readyQuadTilesOf(handTiles: Tile[]): Tile[] {
  // 手牌に3枚の牌がない場合は立直後カンの対象牌はない
  if (Object.values(_.groupBy(handTiles, tile => TileInfo[tile].tileNumber)).every(group => group.length !== 3)) return [];
  // 立直後は、すべての並べ替えパターンで確定している刻子に対してのみカン可能
  const arrangedHands: Tile[][][] = winningTileCandidatesOf(handTiles).flatMap(candidate => arrange(handTiles, candidate));
  const triplesAppeared = _.uniqWith(arrangedHands.flatMap(h => h).filter(meld => isTripleTiles(meld)), _.isEqual);
  const triplesAppearedEveryHands = triplesAppeared.filter(meld => arrangedHands.every(h => h.some(m => _.isEqual(m, meld))));
  return triplesAppearedEveryHands.map(meld => meld[0]);
}

/**
 * 与えられた搭子のすべての待ち牌のリストを取得します
 * 赤ドラ牌はリストに含まれません。
 * @param base 搭子
 * @returns 待ち牌のリスト
 */
export function waitingTilesOf(base: Tile[]): Tile[] {
  if (base.length !== 2) {
    throw new Error(`invalid size of base: ${base.length}`);
  }
  const sortedTiles = sorted(base);
  const lower = sortedTiles[0];
  const upper = sortedTiles[1];
  // 対子
  if (equalsIgnoreRed(upper, lower)) {
    return [getSimplifiedTile(lower)];
  }
  //両面塔子 辺張塔子
  if (isNextOf(upper, lower)) {
    const waitingTiles: Tile[] = [];
    if (hasPrevious(lower)) waitingTiles.push(getPreviousTile(lower));
    if (hasNext(upper)) waitingTiles.push(getNextTile(upper));
    return waitingTiles;
  }
  // 嵌張塔子
  if (hasPrevious(upper) && hasNext(lower)) {
    const middleTile = getPreviousTile(upper);
    if (equalsIgnoreRed(middleTile, getNextTile(lower))) {
      return [middleTile];
    }
  }
  return [];
}
