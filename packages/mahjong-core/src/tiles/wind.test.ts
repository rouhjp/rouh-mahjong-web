import { describe, it, expect } from 'vitest'
import { 
  Winds,
  Sides,
  WindInfo,
  SideInfo,
  nextWind,
  shiftWind,
  getRelativeSide,
  getOtherWinds,
  getSideTarget,
  getOtherSides,
  getSideByDice,
  getSideByDiceSum,
  windToTile,
  tileToWind
} from './wind'
import { Tiles } from './tile'

describe('Wind constants and info', () => {
  describe('Wind constants', () => {
    it('should have correct wind constants', () => {
      expect(Winds.EAST).toBe('EAST')
      expect(Winds.SOUTH).toBe('SOUTH')
      expect(Winds.WEST).toBe('WEST')
      expect(Winds.NORTH).toBe('NORTH')
    })
  })

  describe('WindInfo', () => {
    it('should have correct wind properties', () => {
      expect(WindInfo.EAST.code).toBe('E')
      expect(WindInfo.EAST.name).toBe('東')
      expect(WindInfo.EAST.ordinal).toBe(0)

      expect(WindInfo.SOUTH.code).toBe('S')
      expect(WindInfo.SOUTH.name).toBe('南')
      expect(WindInfo.SOUTH.ordinal).toBe(1)

      expect(WindInfo.WEST.code).toBe('W')
      expect(WindInfo.WEST.name).toBe('西')
      expect(WindInfo.WEST.ordinal).toBe(2)

      expect(WindInfo.NORTH.code).toBe('N')
      expect(WindInfo.NORTH.name).toBe('北')
      expect(WindInfo.NORTH.ordinal).toBe(3)
    })
  })
})

describe('Side constants and info', () => {
  describe('Side constants', () => {
    it('should have correct side constants', () => {
      expect(Sides.SELF).toBe('SELF')
      expect(Sides.RIGHT).toBe('RIGHT')
      expect(Sides.ACROSS).toBe('ACROSS')
      expect(Sides.LEFT).toBe('LEFT')
    })
  })

  describe('SideInfo', () => {
    it('should have correct side properties', () => {
      expect(SideInfo.SELF.code).toBe('SELF')
      expect(SideInfo.SELF.name).toBe('自家')
      expect(SideInfo.SELF.ordinal).toBe(0)

      expect(SideInfo.RIGHT.code).toBe('RIGHT')
      expect(SideInfo.RIGHT.name).toBe('下家')
      expect(SideInfo.RIGHT.ordinal).toBe(1)

      expect(SideInfo.ACROSS.code).toBe('ACROSS')
      expect(SideInfo.ACROSS.name).toBe('対面')
      expect(SideInfo.ACROSS.ordinal).toBe(2)

      expect(SideInfo.LEFT.code).toBe('LEFT')
      expect(SideInfo.LEFT.name).toBe('上家')
      expect(SideInfo.LEFT.ordinal).toBe(3)
    })
  })
})

describe('nextWind', () => {
  it('should return next wind in sequence', () => {
    expect(nextWind(Winds.EAST)).toBe(Winds.SOUTH)
    expect(nextWind(Winds.SOUTH)).toBe(Winds.WEST)
    expect(nextWind(Winds.WEST)).toBe(Winds.NORTH)
    expect(nextWind(Winds.NORTH)).toBe(Winds.EAST)
  })
})

describe('shiftWind', () => {
  it('should shift wind by specified amount', () => {
    expect(shiftWind(Winds.EAST, 0)).toBe(Winds.EAST)
    expect(shiftWind(Winds.EAST, 1)).toBe(Winds.SOUTH)
    expect(shiftWind(Winds.EAST, 2)).toBe(Winds.WEST)
    expect(shiftWind(Winds.EAST, 3)).toBe(Winds.NORTH)
    expect(shiftWind(Winds.EAST, 4)).toBe(Winds.EAST)
    expect(shiftWind(Winds.EAST, 5)).toBe(Winds.SOUTH)
  })

  it('should handle large shift values correctly', () => {
    expect(shiftWind(Winds.SOUTH, 7)).toBe(Winds.EAST)
    expect(shiftWind(Winds.SOUTH, 8)).toBe(Winds.SOUTH)
  })

  it('should throw error for negative shift values', () => {
    expect(() => shiftWind(Winds.EAST, -1)).toThrow('Shift value must be non-negative: -1')
  })
})

describe('getRelativeSide', () => {
  it('should return correct side relative to reference wind', () => {
    // 東を基準とした場合
    expect(getRelativeSide(Winds.EAST, Winds.EAST)).toBe(Sides.SELF)
    expect(getRelativeSide(Winds.SOUTH, Winds.EAST)).toBe(Sides.RIGHT)
    expect(getRelativeSide(Winds.WEST, Winds.EAST)).toBe(Sides.ACROSS)
    expect(getRelativeSide(Winds.NORTH, Winds.EAST)).toBe(Sides.LEFT)

    // 南を基準とした場合
    expect(getRelativeSide(Winds.SOUTH, Winds.SOUTH)).toBe(Sides.SELF)
    expect(getRelativeSide(Winds.WEST, Winds.SOUTH)).toBe(Sides.RIGHT)
    expect(getRelativeSide(Winds.NORTH, Winds.SOUTH)).toBe(Sides.ACROSS)
    expect(getRelativeSide(Winds.EAST, Winds.SOUTH)).toBe(Sides.LEFT)
  })
})

describe('getOtherWinds', () => {
  it('should return other three winds in order', () => {
    const eastOthers = getOtherWinds(Winds.EAST)
    expect(eastOthers).toEqual([Winds.SOUTH, Winds.WEST, Winds.NORTH])

    const southOthers = getOtherWinds(Winds.SOUTH)
    expect(southOthers).toEqual([Winds.WEST, Winds.NORTH, Winds.EAST])

    const westOthers = getOtherWinds(Winds.WEST)
    expect(westOthers).toEqual([Winds.NORTH, Winds.EAST, Winds.SOUTH])

    const northOthers = getOtherWinds(Winds.NORTH)
    expect(northOthers).toEqual([Winds.EAST, Winds.SOUTH, Winds.WEST])
  })
})

describe('getSideTarget', () => {
  it('should return wind at specified side of target wind', () => {
    // 東を基準とした場合
    expect(getSideTarget(Sides.SELF, Winds.EAST)).toBe(Winds.EAST)
    expect(getSideTarget(Sides.RIGHT, Winds.EAST)).toBe(Winds.SOUTH)
    expect(getSideTarget(Sides.ACROSS, Winds.EAST)).toBe(Winds.WEST)
    expect(getSideTarget(Sides.LEFT, Winds.EAST)).toBe(Winds.NORTH)

    // 南を基準とした場合
    expect(getSideTarget(Sides.SELF, Winds.SOUTH)).toBe(Winds.SOUTH)
    expect(getSideTarget(Sides.RIGHT, Winds.SOUTH)).toBe(Winds.WEST)
    expect(getSideTarget(Sides.ACROSS, Winds.SOUTH)).toBe(Winds.NORTH)
    expect(getSideTarget(Sides.LEFT, Winds.SOUTH)).toBe(Winds.EAST)
  })
})

describe('getOtherSides', () => {
  it('should return other three sides in order', () => {
    const selfOthers = getOtherSides(Sides.SELF)
    expect(selfOthers).toEqual([Sides.RIGHT, Sides.ACROSS, Sides.LEFT])

    const rightOthers = getOtherSides(Sides.RIGHT)
    expect(rightOthers).toEqual([Sides.ACROSS, Sides.LEFT, Sides.SELF])

    const acrossOthers = getOtherSides(Sides.ACROSS)
    expect(acrossOthers).toEqual([Sides.LEFT, Sides.SELF, Sides.RIGHT])

    const leftOthers = getOtherSides(Sides.LEFT)
    expect(leftOthers).toEqual([Sides.SELF, Sides.RIGHT, Sides.ACROSS])
  })
})

describe('getSideByDice', () => {
  describe('valid dice combinations', () => {
    // サイコロの目の合計に基づくテスト
    const testCases = [
      // 合計2: RIGHT
      { d1: 1, d2: 1, expected: Sides.RIGHT },
      // 合計3: ACROSS  
      { d1: 1, d2: 2, expected: Sides.ACROSS },
      { d1: 2, d2: 1, expected: Sides.ACROSS },
      // 合計4: LEFT
      { d1: 1, d2: 3, expected: Sides.LEFT },
      { d1: 2, d2: 2, expected: Sides.LEFT },
      { d1: 3, d2: 1, expected: Sides.LEFT },
      // 合計5: SELF
      { d1: 1, d2: 4, expected: Sides.SELF },
      { d1: 2, d2: 3, expected: Sides.SELF },
      { d1: 3, d2: 2, expected: Sides.SELF },
      { d1: 4, d2: 1, expected: Sides.SELF },
      // 合計6: RIGHT
      { d1: 1, d2: 5, expected: Sides.RIGHT },
      { d1: 2, d2: 4, expected: Sides.RIGHT },
      { d1: 3, d2: 3, expected: Sides.RIGHT },
      { d1: 4, d2: 2, expected: Sides.RIGHT },
      { d1: 5, d2: 1, expected: Sides.RIGHT },
      // 合計7: ACROSS
      { d1: 1, d2: 6, expected: Sides.ACROSS },
      { d1: 2, d2: 5, expected: Sides.ACROSS },
      { d1: 3, d2: 4, expected: Sides.ACROSS },
      { d1: 4, d2: 3, expected: Sides.ACROSS },
      { d1: 5, d2: 2, expected: Sides.ACROSS },
      { d1: 6, d2: 1, expected: Sides.ACROSS },
      // 合計8: LEFT
      { d1: 2, d2: 6, expected: Sides.LEFT },
      { d1: 3, d2: 5, expected: Sides.LEFT },
      { d1: 4, d2: 4, expected: Sides.LEFT },
      { d1: 5, d2: 3, expected: Sides.LEFT },
      { d1: 6, d2: 2, expected: Sides.LEFT },
      // 合計9: SELF
      { d1: 3, d2: 6, expected: Sides.SELF },
      { d1: 4, d2: 5, expected: Sides.SELF },
      { d1: 5, d2: 4, expected: Sides.SELF },
      { d1: 6, d2: 3, expected: Sides.SELF },
      // 合計10: RIGHT
      { d1: 4, d2: 6, expected: Sides.RIGHT },
      { d1: 5, d2: 5, expected: Sides.RIGHT },
      { d1: 6, d2: 4, expected: Sides.RIGHT },
      // 合計11: ACROSS
      { d1: 5, d2: 6, expected: Sides.ACROSS },
      { d1: 6, d2: 5, expected: Sides.ACROSS },
      // 合計12: LEFT
      { d1: 6, d2: 6, expected: Sides.LEFT }
    ]

    testCases.forEach(({ d1, d2, expected }) => {
      it(`should return ${expected} for dice ${d1}, ${d2} (sum: ${d1 + d2})`, () => {
        expect(getSideByDice(d1, d2)).toBe(expected)
      })
    })
  })

  describe('error cases', () => {
    it('should throw error for invalid dice values', () => {
      expect(() => getSideByDice(0, 1)).toThrow('Invalid dice value: 0, 1')
      expect(() => getSideByDice(1, 0)).toThrow('Invalid dice value: 1, 0')
      expect(() => getSideByDice(7, 1)).toThrow('Invalid dice value: 7, 1')
      expect(() => getSideByDice(1, 7)).toThrow('Invalid dice value: 1, 7')
    })
  })
})

describe('getSideByDiceSum', () => {
  describe('valid sums', () => {
    const testCases = [
      { sum: 2, expected: Sides.RIGHT },
      { sum: 3, expected: Sides.ACROSS },
      { sum: 4, expected: Sides.LEFT },
      { sum: 5, expected: Sides.SELF },
      { sum: 6, expected: Sides.RIGHT },
      { sum: 7, expected: Sides.ACROSS },
      { sum: 8, expected: Sides.LEFT },
      { sum: 9, expected: Sides.SELF },
      { sum: 10, expected: Sides.RIGHT },
      { sum: 11, expected: Sides.ACROSS },
      { sum: 12, expected: Sides.LEFT }
    ]

    testCases.forEach(({ sum, expected }) => {
      it(`should return ${expected} for sum ${sum}`, () => {
        expect(getSideByDiceSum(sum)).toBe(expected)
      })
    })
  })

  describe('error cases', () => {
    it('should throw error for invalid dice sum', () => {
      expect(() => getSideByDiceSum(1)).toThrow('Invalid dice sum: 1')
      expect(() => getSideByDiceSum(13)).toThrow('Invalid dice sum: 13')
    })
  })
})

describe('windToTile', () => {
  it('should convert wind to corresponding tile', () => {
    expect(windToTile(Winds.EAST)).toBe(Tiles.WE)
    expect(windToTile(Winds.SOUTH)).toBe(Tiles.WS)
    expect(windToTile(Winds.WEST)).toBe(Tiles.WW)
    expect(windToTile(Winds.NORTH)).toBe(Tiles.WN)
  })
})

describe('tileToWind', () => {
  it('should convert wind tile to corresponding wind', () => {
    expect(tileToWind(Tiles.WE)).toBe(Winds.EAST)
    expect(tileToWind(Tiles.WS)).toBe(Winds.SOUTH)
    expect(tileToWind(Tiles.WW)).toBe(Winds.WEST)
    expect(tileToWind(Tiles.WN)).toBe(Winds.NORTH)
  })

  it('should throw error for non-wind tiles', () => {
    expect(() => tileToWind(Tiles.M1)).toThrow('Tile is not a wind tile: M1')
    expect(() => tileToWind(Tiles.DW)).toThrow('Tile is not a wind tile: DW')
  })
})

describe('Wind and Side integration', () => {
  it('should work correctly between getRelativeSide and getSideTarget', () => {
    // 東家視点で南家の位置を確認
    const southFromEast = getRelativeSide(Winds.SOUTH, Winds.EAST) // SOUTH は EAST から見て RIGHT
    expect(southFromEast).toBe(Sides.RIGHT)
    
    // 逆に、東家の RIGHT にいる風を確認
    const rightOfEast = getSideTarget(Sides.RIGHT, Winds.EAST)
    expect(rightOfEast).toBe(Winds.SOUTH)
  })

  it('should maintain consistency in wind sequence', () => {
    // 各風の次の風が、shiftWind(1)と同じであることを確認
    expect(nextWind(Winds.EAST)).toBe(shiftWind(Winds.EAST, 1))
    expect(nextWind(Winds.SOUTH)).toBe(shiftWind(Winds.SOUTH, 1))
    expect(nextWind(Winds.WEST)).toBe(shiftWind(Winds.WEST, 1))
    expect(nextWind(Winds.NORTH)).toBe(shiftWind(Winds.NORTH, 1))
  })

  it('should handle cyclic nature correctly', () => {
    // 4回シフトすると元に戻る
    expect(shiftWind(Winds.EAST, 4)).toBe(Winds.EAST)
    expect(shiftWind(Winds.SOUTH, 4)).toBe(Winds.SOUTH)
    expect(shiftWind(Winds.WEST, 4)).toBe(Winds.WEST)
    expect(shiftWind(Winds.NORTH, 4)).toBe(Winds.NORTH)
  })
})