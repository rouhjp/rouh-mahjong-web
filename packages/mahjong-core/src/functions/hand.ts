import _ from "lodash";
import { isStraightTiles, ORPHAN_TILES, sorted, Tile, Tiles } from "../tiles";
import { isCompletePattern, isReadyPattern, winningTileCandidatesOf } from "./pattern";
import { combinations, containsEach } from "./utils";

/**
 * 聴牌かどうか判定します。
 * @param handTiles 手牌
 * @returns 判定結果
 */
export function isHandReady(handTiles: Tile[]): boolean {
  if(winningTileOfSevenPairs(handTiles).length > 0) return true;
  if(winningTileOfThirteenOrphans(handTiles).length > 0) return true;
  if(!isReadyPattern(handTiles)) return false;
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
  if (isReadyPattern(handTiles)) {
    winningTiles.push(...winningTileCandidatesOf(handTiles).filter(tile => isCompleted(handTiles, tile)));
  }
  return winningTiles;
}

function winningTileOfSevenPairs(handTiles: Tile[]): Tile[] {
  if (handTiles.length !== 13) return [];
  const groups: Tile[][] = Object.values(_.groupBy(handTiles, tile => tile.tileNumber));
  const pairs = groups.filter(group => group.length === 2);
  const singles = groups.filter(group => group.length === 1);
  if (pairs.length === 6 && singles.length === 1) {
    return [singles[0][0].simplify()];
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
  return _.uniqBy([...handTiles, drawnTile].filter(tile => tile.isOrphan()), tile => tile.tileNumber).length >= 9;
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
  if (!isCompletePattern(handTiles, winningTile)) return false;
  const allTiles = sorted([...handTiles, winningTile]);
  const headCandidates = headCandidatesOf(allTiles);
  for (const headCandidate of headCandidates) {
    if (arrangeBody(_.difference(allTiles, headCandidate))) {
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
  const tiles = _.uniqBy([...handTiles, winningTile], tile => tile.tileNumber);
  return tiles.length === 13 && tiles.every(tile => tile.isOrphan());
}

/**
 * 七対子和了形かどうか判定します。
 * @param handTiles 手牌
 * @param winningTile 和了牌
 * @returns 判定結果
 */
export function isSevenPairsCompleted(handTiles: Tile[], winningTile: Tile): boolean {
  if (handTiles.length !== 13) return false;
  return Object.values(_.groupBy([...handTiles, winningTile], tile => tile.tileNumber))
    .every(group => group.length === 2);
}

function headCandidatesOf(allTiles: Tile[]): Tile[][] {
  return Object.values(_.groupBy(allTiles, tile => tile.tileNumber))
    .filter(group => group.length >= 2)
    .map(group => group.slice(0, 2));
}

function arrange(handTiles: Tile[], winningTile: Tile): Tile[][][] {
  const hands: Tile[][][] = [];
  const allTiles = sorted([...handTiles, winningTile]);
  const headCandidates = headCandidatesOf(allTiles);
  for (const headCandidate of headCandidates) {
    const body = _.difference(allTiles, headCandidate)
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
      if (checkingTiles[0].equalsIgnoreRed(checkingTiles[2])) {
        // 刻子
        melds.push(checkingTiles.splice(0, 3));
      } else {
        // 順子
        const firstReference = checkingTiles[0];
        if (!firstReference.hasNext()) return null;
        const secondReference = firstReference.next();
        const secondIndex = checkingTiles.findIndex(tile => tile.equalsIgnoreRed(secondReference));
        if (secondIndex === -1) return null;
        if (!secondReference.hasNext()) return null;
        const thirdReference = secondReference.next();
        const thirdIndex = checkingTiles.findIndex(tile => tile.equalsIgnoreRed(thirdReference));
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
      const remaining: Tile[][] = _.difference(arranged, melds);
      const rearrangedBody: Tile[][] = _.zip(...melds) as Tile[][];
      if (isStraightTiles(rearrangedBody[0])) {
        rearrangedBodies.push(sortedMeldTilesOf([...remaining, ...rearrangedBody]));
      }
    }
    return rearrangedBodies;
  }
  return [arranged];
}

function sortedMeldTilesOf(melds: Tile[][]) {
  return [...melds].sort((a, b) => {
    for (let i = 0; i<3; i++) {
      const result = a[i].compareTo(b[i]);
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
      variations.push([first, second]);
    }
  }
  return variations;
}

function straightBasesOf(tile: Tile): Tile[][] {
  if (tile.isHonor()) {
    return [];
  }
  const bases: Tile[][] = [];
  if (tile.hasNext()) {
    const second = tile.next();
    if (second.hasNext()) {
      const third = second.next();
      bases.push([second, third]);
    }
  }
  if (tile.hasPrevious()) {
    const second = tile.previous();
    if (second.hasPrevious()) {
      const first = second.previous();
      bases.push([first, second]);
    }
  }
  if (tile.hasPrevious() && tile.hasNext()) {
    const first = tile.previous();
    const third = tile.next();
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
  return straightBases.filter(base => containsEach(handTiles, base));
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
  const quadBase: Tile[] = handTiles.filter(tile => tile.equalsIgnoreRed(discardedTile));
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
  if (Object.values(_.groupBy(handTiles, tile => tile.tileNumber)).every(group => group.length !== 3)) return [];
  // 立直後は、すべての並べ替えパターンで確定している刻子に対してのみカン可能
  const arrangedHands: Tile[][][] = winningTileCandidatesOf(handTiles).flatMap(candidate => arrange(handTiles, candidate));
  const triplesAppeared: Tile[][] = _.uniqWith(arrangedHands.flatMap(h => h).filter(meld => meld[0].equalsIgnoreRed(meld[2])), _.isEqual);
  const triplesAppearedEveryHands: Tile[][] = triplesAppeared.filter(meld => arrangedHands.every(h => h.some(m => _.isEqual(m, meld))));
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
  if (upper.equalsIgnoreRed(lower)) {
    return [lower.simplify()];
  }
  //両面塔子 辺張塔子
  if (upper.isNextOf(lower)) {
    const waitingTiles: Tile[] = [];
    if (lower.hasPrevious()) waitingTiles.push(lower.previous());
    if (upper.hasNext()) waitingTiles.push(upper.next());
    return waitingTiles;
  }
  // 嵌張塔子
  if (upper.hasPrevious() && lower.hasNext()) {
    const middleTile = upper.previous();
    if (middleTile.equalsIgnoreRed(lower.next())) {
      return [middleTile];
    }
  }
  return [];
}
