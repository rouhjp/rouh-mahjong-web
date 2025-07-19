import { describe, it, expect } from 'vitest'
import { 
  TileTypeInfo,
  TileInfo,
  Tiles,
  TILE_SEQUENCE,
  isHonor,
  isTerminal,
  isOrphan,
  isDragon,
  isWind,
  isPrisedRed,
  hasPrevious,
  hasNext,
  getPreviousTile,
  getNextTile,
  getIndicatedTile,
  getSimplifiedTile,
  equalsIgnoreRed,
  isSameType,
  isNextOf,
  isPreviousOf,
  compareTiles,
  sorted,
  isTripleTiles,
  isQuadTiles,
  isStraightTiles,
  ORPHAN_TILES
} from './tile.js'

describe('Tile constants and info', () => {
  describe('TileTypeInfo', () => {
    it('should have correct tile type information', () => {
      expect(TileTypeInfo.MAN.code).toBe('MAN')
      expect(TileTypeInfo.MAN.count).toBe(9)
      
      expect(TileTypeInfo.PIN.code).toBe('PIN')
      expect(TileTypeInfo.PIN.count).toBe(9)
      
      expect(TileTypeInfo.SOU.code).toBe('SOU')
      expect(TileTypeInfo.SOU.count).toBe(9)
      
      expect(TileTypeInfo.WIND.code).toBe('WIND')
      expect(TileTypeInfo.WIND.count).toBe(4)
      
      expect(TileTypeInfo.DRAGON.code).toBe('DRAGON')
      expect(TileTypeInfo.DRAGON.count).toBe(3)
    })
  })

  describe('TileInfo', () => {
    it('should have correct tile properties', () => {
      expect(TileInfo.M1.code).toBe('M1')
      expect(TileInfo.M1.tileType).toBe('MAN')
      expect(TileInfo.M1.suitNumber).toBe(1)
      expect(TileInfo.M1.tileNumber).toBe(0)
      expect(TileInfo.M1.red).toBe(false)

      expect(TileInfo.M5R.code).toBe('M5R')
      expect(TileInfo.M5R.tileType).toBe('MAN')
      expect(TileInfo.M5R.suitNumber).toBe(5)
      expect(TileInfo.M5R.tileNumber).toBe(4)
      expect(TileInfo.M5R.red).toBe(true)
    })
  })

  describe('Tiles constants', () => {
    it('should have correct tile constants', () => {
      expect(Tiles.M1).toBe('M1')
      expect(Tiles.M5R).toBe('M5R')
      expect(Tiles.WE).toBe('WE')
      expect(Tiles.DW).toBe('DW')
    })
  })
})

describe('isHonor', () => {
  it('should return true for wind and dragon tiles', () => {
    expect(isHonor(Tiles.WE)).toBe(true)
    expect(isHonor(Tiles.WS)).toBe(true)
    expect(isHonor(Tiles.WW)).toBe(true)
    expect(isHonor(Tiles.WN)).toBe(true)
    expect(isHonor(Tiles.DW)).toBe(true)
    expect(isHonor(Tiles.DG)).toBe(true)
    expect(isHonor(Tiles.DR)).toBe(true)
  })

  it('should return false for number tiles', () => {
    expect(isHonor(Tiles.M1)).toBe(false)
    expect(isHonor(Tiles.M5)).toBe(false)
    expect(isHonor(Tiles.M9)).toBe(false)
    expect(isHonor(Tiles.P1)).toBe(false)
    expect(isHonor(Tiles.P5R)).toBe(false)
    expect(isHonor(Tiles.S9)).toBe(false)
  })
})

describe('isTerminal', () => {
  it('should return true for 1 and 9 tiles', () => {
    expect(isTerminal(Tiles.M1)).toBe(true)
    expect(isTerminal(Tiles.M9)).toBe(true)
    expect(isTerminal(Tiles.P1)).toBe(true)
    expect(isTerminal(Tiles.P9)).toBe(true)
    expect(isTerminal(Tiles.S1)).toBe(true)
    expect(isTerminal(Tiles.S9)).toBe(true)
  })

  it('should return false for middle number tiles', () => {
    expect(isTerminal(Tiles.M2)).toBe(false)
    expect(isTerminal(Tiles.M5)).toBe(false)
    expect(isTerminal(Tiles.M8)).toBe(false)
    expect(isTerminal(Tiles.P3)).toBe(false)
    expect(isTerminal(Tiles.S7)).toBe(false)
  })

  it('should return false for honor tiles', () => {
    // Honor tiles are never terminals (terminals are only 1,9 number tiles)
    expect(isTerminal(Tiles.WE)).toBe(false)
    expect(isTerminal(Tiles.WS)).toBe(false)
    expect(isTerminal(Tiles.WW)).toBe(false)
    expect(isTerminal(Tiles.WN)).toBe(false)
    expect(isTerminal(Tiles.DW)).toBe(false)
    expect(isTerminal(Tiles.DG)).toBe(false)
    expect(isTerminal(Tiles.DR)).toBe(false)
  })
})

describe('isOrphan', () => {
  it('should return true for terminals and honors', () => {
    expect(isOrphan(Tiles.M1)).toBe(true)
    expect(isOrphan(Tiles.M9)).toBe(true)
    expect(isOrphan(Tiles.P1)).toBe(true)
    expect(isOrphan(Tiles.P9)).toBe(true)
    expect(isOrphan(Tiles.S1)).toBe(true)
    expect(isOrphan(Tiles.S9)).toBe(true)
    expect(isOrphan(Tiles.WE)).toBe(true)
    expect(isOrphan(Tiles.WS)).toBe(true)
    expect(isOrphan(Tiles.WW)).toBe(true)
    expect(isOrphan(Tiles.WN)).toBe(true)
    expect(isOrphan(Tiles.DW)).toBe(true)
    expect(isOrphan(Tiles.DG)).toBe(true)
    expect(isOrphan(Tiles.DR)).toBe(true)
  })

  it('should return false for middle number tiles', () => {
    expect(isOrphan(Tiles.M2)).toBe(false)
    expect(isOrphan(Tiles.M3)).toBe(false)
    expect(isOrphan(Tiles.M4)).toBe(false)
    expect(isOrphan(Tiles.M5)).toBe(false)
    expect(isOrphan(Tiles.M6)).toBe(false)
    expect(isOrphan(Tiles.M7)).toBe(false)
    expect(isOrphan(Tiles.M8)).toBe(false)
  })
})

describe('isDragon', () => {
  it('should return true for dragon tiles', () => {
    expect(isDragon(Tiles.DW)).toBe(true)
    expect(isDragon(Tiles.DG)).toBe(true)
    expect(isDragon(Tiles.DR)).toBe(true)
  })

  it('should return false for non-dragon tiles', () => {
    expect(isDragon(Tiles.M1)).toBe(false)
    expect(isDragon(Tiles.P5)).toBe(false)
    expect(isDragon(Tiles.S9)).toBe(false)
    expect(isDragon(Tiles.WE)).toBe(false)
  })
})

describe('isWind', () => {
  it('should return true for wind tiles', () => {
    expect(isWind(Tiles.WE)).toBe(true)
    expect(isWind(Tiles.WS)).toBe(true)
    expect(isWind(Tiles.WW)).toBe(true)
    expect(isWind(Tiles.WN)).toBe(true)
  })

  it('should return false for non-wind tiles', () => {
    expect(isWind(Tiles.M1)).toBe(false)
    expect(isWind(Tiles.P5)).toBe(false)
    expect(isWind(Tiles.S9)).toBe(false)
    expect(isWind(Tiles.DW)).toBe(false)
  })
})

describe('isPrisedRed', () => {
  it('should return true for red dora tiles', () => {
    expect(isPrisedRed(Tiles.M5R)).toBe(true)
    expect(isPrisedRed(Tiles.P5R)).toBe(true)
    expect(isPrisedRed(Tiles.S5R)).toBe(true)
  })

  it('should return false for normal tiles', () => {
    expect(isPrisedRed(Tiles.M5)).toBe(false)
    expect(isPrisedRed(Tiles.P5)).toBe(false)
    expect(isPrisedRed(Tiles.S5)).toBe(false)
    expect(isPrisedRed(Tiles.M1)).toBe(false)
    expect(isPrisedRed(Tiles.WE)).toBe(false)
  })
})

describe('hasPrevious', () => {
  it('should return true for tiles 2-9', () => {
    expect(hasPrevious(Tiles.M2)).toBe(true)
    expect(hasPrevious(Tiles.M5)).toBe(true)
    expect(hasPrevious(Tiles.M9)).toBe(true)
    expect(hasPrevious(Tiles.P2)).toBe(true)
    expect(hasPrevious(Tiles.S9)).toBe(true)
  })

  it('should return false for tile 1', () => {
    expect(hasPrevious(Tiles.M1)).toBe(false)
    expect(hasPrevious(Tiles.P1)).toBe(false)
    expect(hasPrevious(Tiles.S1)).toBe(false)
  })

  it('should return false for honor tiles', () => {
    expect(hasPrevious(Tiles.WE)).toBe(false)
    expect(hasPrevious(Tiles.WS)).toBe(false)
    expect(hasPrevious(Tiles.DW)).toBe(false)
    expect(hasPrevious(Tiles.DR)).toBe(false)
  })
})

describe('hasNext', () => {
  it('should return true for tiles 1-8', () => {
    expect(hasNext(Tiles.M1)).toBe(true)
    expect(hasNext(Tiles.M5)).toBe(true)
    expect(hasNext(Tiles.M8)).toBe(true)
    expect(hasNext(Tiles.P1)).toBe(true)
    expect(hasNext(Tiles.S8)).toBe(true)
  })

  it('should return false for tile 9', () => {
    expect(hasNext(Tiles.M9)).toBe(false)
    expect(hasNext(Tiles.P9)).toBe(false)
    expect(hasNext(Tiles.S9)).toBe(false)
  })

  it('should return false for honor tiles', () => {
    expect(hasNext(Tiles.WE)).toBe(false)
    expect(hasNext(Tiles.WS)).toBe(false)
    expect(hasNext(Tiles.DW)).toBe(false)
    expect(hasNext(Tiles.DR)).toBe(false)
  })
})

describe('getPreviousTile', () => {
  it('should return previous tile for valid tiles', () => {
    expect(getPreviousTile(Tiles.M2)).toBe(Tiles.M1)
    expect(getPreviousTile(Tiles.M5)).toBe(Tiles.M4)
    expect(getPreviousTile(Tiles.M9)).toBe(Tiles.M8)
    expect(getPreviousTile(Tiles.P3)).toBe(Tiles.P2)
    expect(getPreviousTile(Tiles.S7)).toBe(Tiles.S6)
  })

  it('should throw error for tiles without previous', () => {
    expect(() => getPreviousTile(Tiles.M1)).toThrow('Previous tile of M1 does not exist')
    expect(() => getPreviousTile(Tiles.P1)).toThrow('Previous tile of P1 does not exist')
    expect(() => getPreviousTile(Tiles.WE)).toThrow('Previous tile of WE does not exist')
  })
})

describe('getNextTile', () => {
  it('should return next tile for valid tiles', () => {
    expect(getNextTile(Tiles.M1)).toBe(Tiles.M2)
    expect(getNextTile(Tiles.M5)).toBe(Tiles.M6)
    expect(getNextTile(Tiles.M8)).toBe(Tiles.M9)
    expect(getNextTile(Tiles.P3)).toBe(Tiles.P4)
    expect(getNextTile(Tiles.S7)).toBe(Tiles.S8)
  })

  it('should throw error for tiles without next', () => {
    expect(() => getNextTile(Tiles.M9)).toThrow('Next tile of M9 does not exist')
    expect(() => getNextTile(Tiles.P9)).toThrow('Next tile of P9 does not exist')
    expect(() => getNextTile(Tiles.WE)).toThrow('Next tile of WE does not exist')
  })
})

describe('getIndicatedTile', () => {
  it('should return correct dora tile for number tiles', () => {
    expect(getIndicatedTile(Tiles.M1)).toBe(Tiles.M2)
    expect(getIndicatedTile(Tiles.M8)).toBe(Tiles.M9)
    expect(getIndicatedTile(Tiles.M9)).toBe(Tiles.M1) // wraps around
    
    expect(getIndicatedTile(Tiles.P1)).toBe(Tiles.P2)
    expect(getIndicatedTile(Tiles.P9)).toBe(Tiles.P1)
    
    expect(getIndicatedTile(Tiles.S1)).toBe(Tiles.S2)
    expect(getIndicatedTile(Tiles.S9)).toBe(Tiles.S1)
  })

  it('should return correct dora tile for honor tiles', () => {
    // Wind tiles cycle through themselves
    expect(getIndicatedTile(Tiles.WE)).toBe(Tiles.WS)
    expect(getIndicatedTile(Tiles.WS)).toBe(Tiles.WW)
    expect(getIndicatedTile(Tiles.WW)).toBe(Tiles.WN)
    expect(getIndicatedTile(Tiles.WN)).toBe(Tiles.WE)
    
    // Dragon tiles cycle through themselves
    expect(getIndicatedTile(Tiles.DW)).toBe(Tiles.DG)
    expect(getIndicatedTile(Tiles.DG)).toBe(Tiles.DR)
    expect(getIndicatedTile(Tiles.DR)).toBe(Tiles.DW)
  })
})

describe('getSimplifiedTile', () => {
  it('should return base tile (removing red dora)', () => {
    expect(getSimplifiedTile(Tiles.M5R)).toBe(Tiles.M5)
    expect(getSimplifiedTile(Tiles.P5R)).toBe(Tiles.P5)
    expect(getSimplifiedTile(Tiles.S5R)).toBe(Tiles.S5)
  })

  it('should return same tile for non-red tiles', () => {
    expect(getSimplifiedTile(Tiles.M1)).toBe(Tiles.M1)
    expect(getSimplifiedTile(Tiles.M5)).toBe(Tiles.M5)
    expect(getSimplifiedTile(Tiles.WE)).toBe(Tiles.WE)
  })
})

describe('equalsIgnoreRed', () => {
  it('should return true for same tiles ignoring red dora', () => {
    expect(equalsIgnoreRed(Tiles.M5, Tiles.M5R)).toBe(true)
    expect(equalsIgnoreRed(Tiles.M5R, Tiles.M5)).toBe(true)
    expect(equalsIgnoreRed(Tiles.P5, Tiles.P5R)).toBe(true)
    expect(equalsIgnoreRed(Tiles.S5, Tiles.S5R)).toBe(true)
  })

  it('should return true for identical tiles', () => {
    expect(equalsIgnoreRed(Tiles.M1, Tiles.M1)).toBe(true)
    expect(equalsIgnoreRed(Tiles.M5R, Tiles.M5R)).toBe(true)
    expect(equalsIgnoreRed(Tiles.WE, Tiles.WE)).toBe(true)
  })

  it('should return false for different tiles', () => {
    expect(equalsIgnoreRed(Tiles.M1, Tiles.M2)).toBe(false)
    expect(equalsIgnoreRed(Tiles.M5, Tiles.P5)).toBe(false)
    expect(equalsIgnoreRed(Tiles.WE, Tiles.WS)).toBe(false)
  })
})

describe('isSameType', () => {
  it('should return true for same suit tiles', () => {
    expect(isSameType(Tiles.M1, Tiles.M9)).toBe(true)
    expect(isSameType(Tiles.P2, Tiles.P5R)).toBe(true)
    expect(isSameType(Tiles.S3, Tiles.S7)).toBe(true)
    expect(isSameType(Tiles.WE, Tiles.WN)).toBe(true)
    expect(isSameType(Tiles.DW, Tiles.DR)).toBe(true)
  })

  it('should return false for different suit tiles', () => {
    expect(isSameType(Tiles.M1, Tiles.P1)).toBe(false)
    expect(isSameType(Tiles.M5, Tiles.S5)).toBe(false)
    expect(isSameType(Tiles.WE, Tiles.DW)).toBe(false)
    expect(isSameType(Tiles.M1, Tiles.WE)).toBe(false)
  })
})

describe('isNextOf and isPreviousOf', () => {
  it('should correctly identify next tiles', () => {
    expect(isNextOf(Tiles.M2, Tiles.M1)).toBe(true)
    expect(isNextOf(Tiles.M3, Tiles.M2)).toBe(true)
    expect(isNextOf(Tiles.P6, Tiles.P5)).toBe(true)
    expect(isNextOf(Tiles.S9, Tiles.S8)).toBe(true)
    
    // Should ignore red dora
    expect(isNextOf(Tiles.M6, Tiles.M5R)).toBe(true)
  })

  it('should correctly identify previous tiles', () => {
    expect(isPreviousOf(Tiles.M1, Tiles.M2)).toBe(true)
    expect(isPreviousOf(Tiles.M2, Tiles.M3)).toBe(true)
    expect(isPreviousOf(Tiles.P5, Tiles.P6)).toBe(true)
    expect(isPreviousOf(Tiles.S8, Tiles.S9)).toBe(true)
    
    // Should ignore red dora
    expect(isPreviousOf(Tiles.M5R, Tiles.M6)).toBe(true)
  })

  it('should return false for non-adjacent tiles', () => {
    expect(isNextOf(Tiles.M3, Tiles.M1)).toBe(false)
    expect(isNextOf(Tiles.P1, Tiles.M9)).toBe(false)
    expect(isPreviousOf(Tiles.M1, Tiles.M3)).toBe(false)
    expect(isPreviousOf(Tiles.M9, Tiles.P1)).toBe(false)
  })
})

describe('compareTiles', () => {
  it('should sort tiles by tile number', () => {
    expect(compareTiles(Tiles.M1, Tiles.M2)).toBeLessThan(0)
    expect(compareTiles(Tiles.M2, Tiles.M1)).toBeGreaterThan(0)
    expect(compareTiles(Tiles.M1, Tiles.M1)).toBe(0)
  })

  it('should sort red dora after normal tiles of same number', () => {
    expect(compareTiles(Tiles.M5, Tiles.M5R)).toBeLessThan(0)
    expect(compareTiles(Tiles.M5R, Tiles.M5)).toBeGreaterThan(0)
  })
})

describe('sorted', () => {
  it('should sort tiles correctly', () => {
    const unsorted = [Tiles.M3, Tiles.M1, Tiles.M5R, Tiles.M5, Tiles.M2]
    const result = sorted(unsorted)
    expect(result).toEqual([Tiles.M1, Tiles.M2, Tiles.M3, Tiles.M5, Tiles.M5R])
  })

  it('should not modify original array', () => {
    const original = [Tiles.M3, Tiles.M1, Tiles.M2]
    const result = sorted(original)
    expect(original).toEqual([Tiles.M3, Tiles.M1, Tiles.M2]) // unchanged
    expect(result).toEqual([Tiles.M1, Tiles.M2, Tiles.M3]) // sorted
  })
})

describe('isTripleTiles', () => {
  it('should return true for valid triplets', () => {
    expect(isTripleTiles([Tiles.M1, Tiles.M1, Tiles.M1])).toBe(true)
    expect(isTripleTiles([Tiles.M5, Tiles.M5R, Tiles.M5])).toBe(true) // ignores red
    expect(isTripleTiles([Tiles.WE, Tiles.WE, Tiles.WE])).toBe(true)
  })

  it('should return false for invalid triplets', () => {
    expect(isTripleTiles([Tiles.M1, Tiles.M2, Tiles.M3])).toBe(false) // sequence
    expect(isTripleTiles([Tiles.M1, Tiles.M1, Tiles.M2])).toBe(false) // different tiles
    expect(isTripleTiles([Tiles.M1, Tiles.M1])).toBe(false) // wrong length
    expect(isTripleTiles([Tiles.M1, Tiles.M1, Tiles.M1, Tiles.M1])).toBe(false) // too long
  })
})

describe('isQuadTiles', () => {
  it('should return true for valid quads', () => {
    expect(isQuadTiles([Tiles.M1, Tiles.M1, Tiles.M1, Tiles.M1])).toBe(true)
    expect(isQuadTiles([Tiles.M5, Tiles.M5R, Tiles.M5, Tiles.M5])).toBe(true) // ignores red
    expect(isQuadTiles([Tiles.WE, Tiles.WE, Tiles.WE, Tiles.WE])).toBe(true)
  })

  it('should return false for invalid quads', () => {
    expect(isQuadTiles([Tiles.M1, Tiles.M1, Tiles.M1, Tiles.M2])).toBe(false) // different tiles
    expect(isQuadTiles([Tiles.M1, Tiles.M1, Tiles.M1])).toBe(false) // wrong length
    expect(isQuadTiles([Tiles.M1, Tiles.M1, Tiles.M1, Tiles.M1, Tiles.M1])).toBe(false) // too long
  })
})

describe('isStraightTiles', () => {
  it('should return true for valid sequences', () => {
    expect(isStraightTiles([Tiles.M1, Tiles.M2, Tiles.M3])).toBe(true)
    expect(isStraightTiles([Tiles.M7, Tiles.M8, Tiles.M9])).toBe(true)
    expect(isStraightTiles([Tiles.P2, Tiles.P3, Tiles.P4])).toBe(true)
    expect(isStraightTiles([Tiles.S5, Tiles.S6, Tiles.S7])).toBe(true)
    
    // Should work with unordered tiles
    expect(isStraightTiles([Tiles.M3, Tiles.M1, Tiles.M2])).toBe(true)
    
    // Should ignore red dora
    expect(isStraightTiles([Tiles.M4, Tiles.M5R, Tiles.M6])).toBe(true)
  })

  it('should return false for invalid sequences', () => {
    expect(isStraightTiles([Tiles.M1, Tiles.M1, Tiles.M1])).toBe(false) // triplet
    expect(isStraightTiles([Tiles.M1, Tiles.M3, Tiles.M5])).toBe(false) // not consecutive
    expect(isStraightTiles([Tiles.M1, Tiles.P2, Tiles.S3])).toBe(false) // different suits
    expect(isStraightTiles([Tiles.WE, Tiles.WS, Tiles.WW])).toBe(false) // honor tiles
    expect(isStraightTiles([Tiles.M1, Tiles.M2])).toBe(false) // wrong length
    expect(isStraightTiles([Tiles.M1, Tiles.M2, Tiles.M3, Tiles.M4])).toBe(false) // too long
  })
})

describe('ORPHAN_TILES', () => {
  it('should contain all terminal and honor tiles', () => {
    const expectedOrphans = [
      Tiles.M1, Tiles.M9, Tiles.P1, Tiles.P9, Tiles.S1, Tiles.S9,
      Tiles.WE, Tiles.WS, Tiles.WW, Tiles.WN,
      Tiles.DW, Tiles.DG, Tiles.DR
    ]
    
    expect(ORPHAN_TILES).toHaveLength(13)
    expectedOrphans.forEach(tile => {
      expect(ORPHAN_TILES).toContain(tile)
    })
  })
})

describe('TILE_SEQUENCE', () => {
  it('should contain all tiles in correct order', () => {
    expect(TILE_SEQUENCE).toHaveLength(34) // 9+9+9+4+3 = 34 unique tiles
    expect(TILE_SEQUENCE[0]).toBe(Tiles.M1)
    expect(TILE_SEQUENCE[8]).toBe(Tiles.M9)
    expect(TILE_SEQUENCE[9]).toBe(Tiles.P1)
    expect(TILE_SEQUENCE[33]).toBe(Tiles.DR)
  })
})