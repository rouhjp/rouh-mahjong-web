import _ from "lodash";

/**
 * リストから指定されたサイズの全ての組み合わせを生成します。
 * @param list 対象のリスト
 * @param size 組み合わせのサイズ
 * @returns 組み合わせのリスト
 */
export function combinations<E>(list: E[], size: number): E[][] {
  if (size === 0) return [[]];
  if (list.length < size) return [];
  if (list.length === size) return [list];
  const result: E[][] = [];
  for (let i = 0; i <= list.length - size; i++) {
    const head = list[i];
    const tailCombinations = combinations(list.slice(i + 1), size - 1);
    for (const tail of tailCombinations) {
      result.push([head, ...tail]);
    }
  }
  return result;
}

/**
 * リストが指定された全ての要素を包含しているかチェックします。
 * @param list チェック対象のリスト
 * @param elements 必要な要素のリスト
 * @returns 判定結果
 * 
 * @example
 * containsEach([1, 2, 2, 3], [2, 2]) // true
 * containsEach([1, 2, 3], [2, 2])    // false
 * containsEach([], [])               // true
 */
export function containsEach<E>(list: E[], elements: E[]): boolean {
  if (elements.length === 0) return true;
  if (list.length === 0) return false;
  
  // 深い等価性をサポートするため、利用可能なアイテムのリストを作成
  const availableItems = [...list];
  
  for (const element of elements) {
    const index = availableItems.findIndex(item => _.isEqual(item, element));
    if (index === -1) return false;
    availableItems.splice(index, 1); // 使用済みアイテムを削除
  }
  
  return true;
}

/**
 * リストから指定された要素を指定回数分除去します。
 * @param list 対象のリスト
 * @param elements 除去する要素のリスト
 * @returns 要素を除去した新しいリスト
 * 
 * @example
 * removeEach([1, 1, 1, 2, 3], [1, 1]) // [1, 2, 3]
 * removeEach([1, 2, 3], [2])          // [1, 3]
 * removeEach([1, 2, 3], [4])          // [1, 2, 3]
 */
export function removeEach<E>(list: E[], elements: E[]): E[] {
  const result = [...list];
  for (const element of elements) {
    const index = result.findIndex(item => _.isEqual(item, element));
    if (index !== -1) {
      result.splice(index, 1);
    }
  }
  return result;
}
