import { describe, it, expect } from 'vitest'
import { 
  Wind, 
  Winds, 
  Side, 
  Sides, 
  getSideByDice, 
  getSideByDiceSum, 
  windToTile, 
  tileToWind 
} from './wind'
import { Tiles } from './tile'

describe('Wind class', () => {
  describe('constructor and properties', () => {
    it('should create wind with correct properties', () => {
      expect(Winds.EAST.code).toBe('E')
      expect(Winds.EAST.name).toBe('東')
      expect(Winds.EAST.ordinal).toBe(0)

      expect(Winds.SOUTH.code).toBe('S')
      expect(Winds.SOUTH.name).toBe('南')
      expect(Winds.SOUTH.ordinal).toBe(1)

      expect(Winds.WEST.code).toBe('W')
      expect(Winds.WEST.name).toBe('西')
      expect(Winds.WEST.ordinal).toBe(2)

      expect(Winds.NORTH.code).toBe('N')
      expect(Winds.NORTH.name).toBe('北')
      expect(Winds.NORTH.ordinal).toBe(3)
    })
  })

  describe('next', () => {
    it('should return next wind in sequence', () => {
      expect(Winds.EAST.next()).toBe(Winds.SOUTH)
      expect(Winds.SOUTH.next()).toBe(Winds.WEST)
      expect(Winds.WEST.next()).toBe(Winds.NORTH)
      expect(Winds.NORTH.next()).toBe(Winds.EAST)
    })
  })

  describe('shift', () => {
    it('should shift wind by specified amount', () => {
      expect(Winds.EAST.shift(0)).toBe(Winds.EAST)
      expect(Winds.EAST.shift(1)).toBe(Winds.SOUTH)
      expect(Winds.EAST.shift(2)).toBe(Winds.WEST)
      expect(Winds.EAST.shift(3)).toBe(Winds.NORTH)
      expect(Winds.EAST.shift(4)).toBe(Winds.EAST)
      expect(Winds.EAST.shift(5)).toBe(Winds.SOUTH)
    })

    it('should handle large shift values correctly', () => {
      expect(Winds.SOUTH.shift(7)).toBe(Winds.EAST)
      expect(Winds.SOUTH.shift(8)).toBe(Winds.SOUTH)
    })

  })

  describe('from', () => {
    it('should return correct side relative to reference wind', () => {
      // 東を基準とした場合
      expect(Winds.EAST.from(Winds.EAST)).toBe(Sides.SELF)
      expect(Winds.SOUTH.from(Winds.EAST)).toBe(Sides.RIGHT)
      expect(Winds.WEST.from(Winds.EAST)).toBe(Sides.ACROSS)
      expect(Winds.NORTH.from(Winds.EAST)).toBe(Sides.LEFT)

      // 南を基準とした場合
      expect(Winds.SOUTH.from(Winds.SOUTH)).toBe(Sides.SELF)
      expect(Winds.WEST.from(Winds.SOUTH)).toBe(Sides.RIGHT)
      expect(Winds.NORTH.from(Winds.SOUTH)).toBe(Sides.ACROSS)
      expect(Winds.EAST.from(Winds.SOUTH)).toBe(Sides.LEFT)
    })
  })

  describe('others', () => {
    it('should return other three winds in order', () => {
      const eastOthers = Winds.EAST.others()
      expect(eastOthers).toEqual([Winds.SOUTH, Winds.WEST, Winds.NORTH])

      const southOthers = Winds.SOUTH.others()
      expect(southOthers).toEqual([Winds.WEST, Winds.NORTH, Winds.EAST])

      const westOthers = Winds.WEST.others()
      expect(westOthers).toEqual([Winds.NORTH, Winds.EAST, Winds.SOUTH])

      const northOthers = Winds.NORTH.others()
      expect(northOthers).toEqual([Winds.EAST, Winds.SOUTH, Winds.WEST])
    })
  })
})

describe('Side class', () => {
  describe('constructor and properties', () => {
    it('should create side with correct properties', () => {
      expect(Sides.SELF.code).toBe('SELF')
      expect(Sides.SELF.name).toBe('自家')
      expect(Sides.SELF.ordinal).toBe(0)

      expect(Sides.RIGHT.code).toBe('RIGHT')
      expect(Sides.RIGHT.name).toBe('下家')
      expect(Sides.RIGHT.ordinal).toBe(1)

      expect(Sides.ACROSS.code).toBe('ACROSS')
      expect(Sides.ACROSS.name).toBe('対面')
      expect(Sides.ACROSS.ordinal).toBe(2)

      expect(Sides.LEFT.code).toBe('LEFT')
      expect(Sides.LEFT.name).toBe('上家')
      expect(Sides.LEFT.ordinal).toBe(3)
    })
  })

  describe('of', () => {
    it('should return wind at specified side of target wind', () => {
      // 東を基準とした場合
      expect(Sides.SELF.of(Winds.EAST)).toBe(Winds.EAST)
      expect(Sides.RIGHT.of(Winds.EAST)).toBe(Winds.SOUTH)
      expect(Sides.ACROSS.of(Winds.EAST)).toBe(Winds.WEST)
      expect(Sides.LEFT.of(Winds.EAST)).toBe(Winds.NORTH)

      // 南を基準とした場合
      expect(Sides.SELF.of(Winds.SOUTH)).toBe(Winds.SOUTH)
      expect(Sides.RIGHT.of(Winds.SOUTH)).toBe(Winds.WEST)
      expect(Sides.ACROSS.of(Winds.SOUTH)).toBe(Winds.NORTH)
      expect(Sides.LEFT.of(Winds.SOUTH)).toBe(Winds.EAST)
    })
  })

  describe('others', () => {
    it('should return other three sides in order', () => {
      const selfOthers = Sides.SELF.others()
      expect(selfOthers).toEqual([Sides.RIGHT, Sides.ACROSS, Sides.LEFT])

      const rightOthers = Sides.RIGHT.others()
      expect(rightOthers).toEqual([Sides.ACROSS, Sides.LEFT, Sides.SELF])

      const acrossOthers = Sides.ACROSS.others()
      expect(acrossOthers).toEqual([Sides.LEFT, Sides.SELF, Sides.RIGHT])

      const leftOthers = Sides.LEFT.others()
      expect(leftOthers).toEqual([Sides.SELF, Sides.RIGHT, Sides.ACROSS])
    })
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
      it(`should return ${expected.code} for dice ${d1}, ${d2} (sum: ${d1 + d2})`, () => {
        expect(getSideByDice(d1, d2)).toBe(expected)
      })
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
      it(`should return ${expected.code} for sum ${sum}`, () => {
        expect(getSideByDiceSum(sum)).toBe(expected)
      })
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

})

describe('Wind and Side integration', () => {
  it('should work correctly between Wind.from and Side.of', () => {
    // 東家視点で南家の位置を確認
    const southFromEast = Winds.SOUTH.from(Winds.EAST) // SOUTH は EAST から見て RIGHT
    expect(southFromEast).toBe(Sides.RIGHT)
    
    // 逆に、東家の RIGHT にいる風を確認
    const rightOfEast = Sides.RIGHT.of(Winds.EAST)
    expect(rightOfEast).toBe(Winds.SOUTH)
  })

  it('should maintain consistency in wind sequence', () => {
    // 各風の次の風が、shift(1)と同じであることを確認
    expect(Winds.EAST.next()).toBe(Winds.EAST.shift(1))
    expect(Winds.SOUTH.next()).toBe(Winds.SOUTH.shift(1))
    expect(Winds.WEST.next()).toBe(Winds.WEST.shift(1))
    expect(Winds.NORTH.next()).toBe(Winds.NORTH.shift(1))
  })

  it('should handle cyclic nature correctly', () => {
    // 4回シフトすると元に戻る
    expect(Winds.EAST.shift(4)).toBe(Winds.EAST)
    expect(Winds.SOUTH.shift(4)).toBe(Winds.SOUTH)
    expect(Winds.WEST.shift(4)).toBe(Winds.WEST)
    expect(Winds.NORTH.shift(4)).toBe(Winds.NORTH)
  })
})