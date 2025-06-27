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
  const availableCounts = new Map<E, number>();
  for (const item of list) {
    availableCounts.set(item, (availableCounts.get(item) || 0) + 1);
  }
  for (const element of elements) {
    const available = availableCounts.get(element) || 0;
    if (available === 0) return false;
    availableCounts.set(element, available - 1);
  }
  return true;
}
