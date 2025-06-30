import { describe, it, expect } from 'vitest'
import { combinations, containsEach, removeEach } from './utils'
import { Tiles } from '../tiles/tile'

const {
  M1, M2, M3, M4, M5, M5R, M6, M7, M8, M9,
  P1, P2, P3, P4, P5, P5R, P6, P7, P8, P9,
  S1, S2, S3, S4, S5, S5R, S6, S7, S8, S9,
  WE, WS, WW, WN, DW, DG, DR
} = Tiles


describe('combinations', () => {
  it('should return empty array for size 0', () => {
    expect(combinations([M1, M2, M3], 0)).toEqual([[]])
  })

  it('should return empty array for empty list', () => {
    expect(combinations([], 1)).toEqual([])
  })

  it('should return empty array when size is larger than list', () => {
    expect(combinations([M1, M2], 3)).toEqual([])
  })

  it('should return entire list when size equals list length', () => {
    expect(combinations([M1, M2, M3], 3)).toEqual([[M1, M2, M3]])
  })

  it('should return single element combinations for size 1', () => {
    expect(combinations([M1, M2, M3], 1)).toEqual([[M1], [M2], [M3]])
  })

  it('should generate correct 2-element combinations', () => {
    expect(combinations([M1, M2, M3], 2)).toEqual([
      [M1, M2],
      [M1, M3],
      [M2, M3]
    ])
  })

  it('should generate correct 3-meld combinations from arranged body', () => {
    const body = [[M1, M1, M1], [M1, M2, M3], [M2, M2, M2], [M3, M3, M3]]
    const result = combinations(body, 3)
    expect(result).toEqual([
      [[M1, M1, M1], [M1, M2, M3], [M2, M2, M2]],
      [[M1, M1, M1], [M1, M2, M3], [M3, M3, M3]],
      [[M1, M1, M1], [M2, M2, M2], [M3, M3, M3]],
      [[M1, M2, M3], [M2, M2, M2], [M3, M3, M3]]
    ])
  })
})

describe('containsEach', () => {
  it('should return true for empty required elements', () => {
    expect(containsEach([M1, M2, M3], [])).toBe(true)
    expect(containsEach([], [])).toBe(true)
  })

  it('should return false when list is empty but elements are required', () => {
    expect(containsEach([], [M1])).toBe(false)
  })

  it('should check single element containment', () => {
    expect(containsEach([M1, M2, M3], [M2])).toBe(true)
    expect(containsEach([M1, M2, M3], [P1])).toBe(false)
  })

  it('should check multiple same elements containment', () => {
    expect(containsEach([M1, M1, M1, M2], [M1, M1])).toBe(true)
    expect(containsEach([M1, M2, M3], [M1, M1])).toBe(false)
  })

  it('should check tile array containment', () => {
    expect(containsEach([[M1, M1, M1], [M1, M1, M1], [M2, M2, M2]], [[M1, M1, M1], [M1, M1, M1]])).toBe(true)
    expect(containsEach([[M1, M1, M1], [M2, M2, M2], [M2, M2, M2]], [[M1, M1, M1], [M1, M1, M1]])).toBe(false)
  })
})

describe('removeEach', () => {
  it('should return empty array when removing from empty list', () => {
    expect(removeEach([], [M1])).toEqual([])
  })

  it('should return original list when removing empty array', () => {
    expect(removeEach([M1, M2, M3], [])).toEqual([M1, M2, M3])
  })

  it('should remove single element from list', () => {
    expect(removeEach([M1, M2, M3], [M2])).toEqual([M1, M3])
  })

  it('should keep original list when removing non-existent element', () => {
    expect(removeEach([M1, M2, M3], [P1])).toEqual([M1, M2, M3])
  })

  it('should remove multiple duplicate elements', () => {
    expect(removeEach([M1, M2, M2, M3], [M2, M2])).toEqual([M1, M3])
  })

  it('should work with 2D tile arrays', () => {
    const body = [[M1, M2, M3], [M1, M2, M3], [M4, M5, M6], [M4, M5, M6]]
    const result = removeEach(body, [[M1, M2, M3], [M4, M5, M6]])
    expect(result).toEqual([[M1, M2, M3], [M4, M5, M6]])
  })
})