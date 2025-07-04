import { describe, it, expect } from 'vitest'
import { 
  TileTypes,
  Tiles,
  sorted,
  isTripleTiles,
  isQuadTiles,
  isStraightTiles,
  ORPHAN_TILES
} from './tile'

describe('Tile class', () => {
  describe('constructor and properties', () => {
    it('should create tile with correct properties', () => {
      expect(Tiles.M1.code).toBe('M1')
      expect(Tiles.M1.tileType).toBe(TileTypes.MAN)
      expect(Tiles.M1.suitNumber).toBe(1)
      expect(Tiles.M1.tileNumber).toBe(0)
      expect(Tiles.M1.isPrisedRed()).toBe(false)

      expect(Tiles.M5R.code).toBe('M5R')
      expect(Tiles.M5R.tileType).toBe(TileTypes.MAN)
      expect(Tiles.M5R.suitNumber).toBe(5)
      expect(Tiles.M5R.tileNumber).toBe(4)
      expect(Tiles.M5R.isPrisedRed()).toBe(true)
    })
  })

  describe('isHonor', () => {
    it('should return true for wind and dragon tiles', () => {
      expect(Tiles.WE.isHonor()).toBe(true)
      expect(Tiles.WS.isHonor()).toBe(true)
      expect(Tiles.WW.isHonor()).toBe(true)
      expect(Tiles.WN.isHonor()).toBe(true)
      expect(Tiles.DW.isHonor()).toBe(true)
      expect(Tiles.DG.isHonor()).toBe(true)
      expect(Tiles.DR.isHonor()).toBe(true)
    })

    it('should return false for number tiles', () => {
      expect(Tiles.M1.isHonor()).toBe(false)
      expect(Tiles.M5.isHonor()).toBe(false)
      expect(Tiles.M9.isHonor()).toBe(false)
      expect(Tiles.P1.isHonor()).toBe(false)
      expect(Tiles.P5R.isHonor()).toBe(false)
      expect(Tiles.S9.isHonor()).toBe(false)
    })
  })

  describe('isTerminal', () => {
    it('should return true for 1 and 9 tiles', () => {
      expect(Tiles.M1.isTerminal()).toBe(true)
      expect(Tiles.M9.isTerminal()).toBe(true)
      expect(Tiles.P1.isTerminal()).toBe(true)
      expect(Tiles.P9.isTerminal()).toBe(true)
      expect(Tiles.S1.isTerminal()).toBe(true)
      expect(Tiles.S9.isTerminal()).toBe(true)
    })

    it('should return false for middle number tiles', () => {
      expect(Tiles.M2.isTerminal()).toBe(false)
      expect(Tiles.M5.isTerminal()).toBe(false)
      expect(Tiles.M8.isTerminal()).toBe(false)
      expect(Tiles.P3.isTerminal()).toBe(false)
      expect(Tiles.S7.isTerminal()).toBe(false)
    })

    it('should return false for honor tiles', () => {
      // Honor tiles are never terminals (terminals are only 1,9 number tiles)
      expect(Tiles.WE.isTerminal()).toBe(false)
      expect(Tiles.WS.isTerminal()).toBe(false)
      expect(Tiles.WW.isTerminal()).toBe(false)
      expect(Tiles.WN.isTerminal()).toBe(false)
      expect(Tiles.DW.isTerminal()).toBe(false)
      expect(Tiles.DG.isTerminal()).toBe(false)
      expect(Tiles.DR.isTerminal()).toBe(false)
    })
  })

  describe('isOrphan', () => {
    it('should return true for terminals and honors', () => {
      expect(Tiles.M1.isOrphan()).toBe(true)
      expect(Tiles.M9.isOrphan()).toBe(true)
      expect(Tiles.P1.isOrphan()).toBe(true)
      expect(Tiles.P9.isOrphan()).toBe(true)
      expect(Tiles.S1.isOrphan()).toBe(true)
      expect(Tiles.S9.isOrphan()).toBe(true)
      expect(Tiles.WE.isOrphan()).toBe(true)
      expect(Tiles.WS.isOrphan()).toBe(true)
      expect(Tiles.WW.isOrphan()).toBe(true)
      expect(Tiles.WN.isOrphan()).toBe(true)
      expect(Tiles.DW.isOrphan()).toBe(true)
      expect(Tiles.DG.isOrphan()).toBe(true)
      expect(Tiles.DR.isOrphan()).toBe(true)
    })

    it('should return false for middle number tiles', () => {
      expect(Tiles.M2.isOrphan()).toBe(false)
      expect(Tiles.M3.isOrphan()).toBe(false)
      expect(Tiles.M4.isOrphan()).toBe(false)
      expect(Tiles.M5.isOrphan()).toBe(false)
      expect(Tiles.M6.isOrphan()).toBe(false)
      expect(Tiles.M7.isOrphan()).toBe(false)
      expect(Tiles.M8.isOrphan()).toBe(false)
    })
  })

  describe('isDragon', () => {
    it('should return true for dragon tiles', () => {
      expect(Tiles.DW.isDragon()).toBe(true)
      expect(Tiles.DG.isDragon()).toBe(true)
      expect(Tiles.DR.isDragon()).toBe(true)
    })

    it('should return false for non-dragon tiles', () => {
      expect(Tiles.M1.isDragon()).toBe(false)
      expect(Tiles.WE.isDragon()).toBe(false)
      expect(Tiles.P5.isDragon()).toBe(false)
    })
  })

  describe('isWind', () => {
    it('should return true for wind tiles', () => {
      expect(Tiles.WE.isWind()).toBe(true)
      expect(Tiles.WS.isWind()).toBe(true)
      expect(Tiles.WW.isWind()).toBe(true)
      expect(Tiles.WN.isWind()).toBe(true)
    })

    it('should return false for non-wind tiles', () => {
      expect(Tiles.M1.isWind()).toBe(false)
      expect(Tiles.DW.isWind()).toBe(false)
      expect(Tiles.P5.isWind()).toBe(false)
    })
  })

  describe('isPrisedRed', () => {
    it('should return true for red dora tiles', () => {
      expect(Tiles.M5R.isPrisedRed()).toBe(true)
      expect(Tiles.P5R.isPrisedRed()).toBe(true)
      expect(Tiles.S5R.isPrisedRed()).toBe(true)
    })

    it('should return false for regular tiles', () => {
      expect(Tiles.M5.isPrisedRed()).toBe(false)
      expect(Tiles.P5.isPrisedRed()).toBe(false)
      expect(Tiles.S5.isPrisedRed()).toBe(false)
      expect(Tiles.M1.isPrisedRed()).toBe(false)
      expect(Tiles.WE.isPrisedRed()).toBe(false)
    })
  })

  describe('hasPrevious', () => {
    it('should return true for tiles 2-9', () => {
      expect(Tiles.M2.hasPrevious()).toBe(true)
      expect(Tiles.M5.hasPrevious()).toBe(true)
      expect(Tiles.M9.hasPrevious()).toBe(true)
      expect(Tiles.P2.hasPrevious()).toBe(true)
      expect(Tiles.S9.hasPrevious()).toBe(true)
    })

    it('should return false for tiles 1', () => {
      expect(Tiles.M1.hasPrevious()).toBe(false)
      expect(Tiles.P1.hasPrevious()).toBe(false)
      expect(Tiles.S1.hasPrevious()).toBe(false)
    })

    it('should return false for honor tiles', () => {
      // Honor tiles cannot form sequences, so they never have previous
      expect(Tiles.WE.hasPrevious()).toBe(false)
      expect(Tiles.WS.hasPrevious()).toBe(false)
      expect(Tiles.WW.hasPrevious()).toBe(false)
      expect(Tiles.WN.hasPrevious()).toBe(false)
      expect(Tiles.DW.hasPrevious()).toBe(false)
      expect(Tiles.DG.hasPrevious()).toBe(false)
      expect(Tiles.DR.hasPrevious()).toBe(false)
    })
  })

  describe('hasNext', () => {
    it('should return true for tiles 1-8', () => {
      expect(Tiles.M1.hasNext()).toBe(true)
      expect(Tiles.M5.hasNext()).toBe(true)
      expect(Tiles.M8.hasNext()).toBe(true)
      expect(Tiles.P1.hasNext()).toBe(true)
      expect(Tiles.S8.hasNext()).toBe(true)
    })

    it('should return false for tiles 9', () => {
      expect(Tiles.M9.hasNext()).toBe(false)
      expect(Tiles.P9.hasNext()).toBe(false)
      expect(Tiles.S9.hasNext()).toBe(false)
    })

    it('should return false for honor tiles', () => {
      // Honor tiles cannot form sequences, so they never have next
      expect(Tiles.WE.hasNext()).toBe(false)
      expect(Tiles.WS.hasNext()).toBe(false)
      expect(Tiles.WW.hasNext()).toBe(false)
      expect(Tiles.WN.hasNext()).toBe(false)
      expect(Tiles.DW.hasNext()).toBe(false)
      expect(Tiles.DG.hasNext()).toBe(false)
      expect(Tiles.DR.hasNext()).toBe(false)
    })
  })

  describe('tile sequence methods', () => {
    it('should have working next/previous for basic cases', () => {
      expect(Tiles.M1.next()).toBe(Tiles.M2)
      expect(Tiles.M2.previous()).toBe(Tiles.M1)
    })

    it('should handle indicates method', () => {
      expect(Tiles.M1.indicates()).toBe(Tiles.M2)
      expect(Tiles.M2.indicates()).toBe(Tiles.M3)
      expect(Tiles.M5R.indicates()).toBe(Tiles.M6)
    })

    it('should handle simplify method', () => {
      expect(Tiles.M5R.simplify()).toBe(Tiles.M5)
      expect(Tiles.M1.simplify()).toBe(Tiles.M1)
      expect(Tiles.WE.simplify()).toBe(Tiles.WE)
    })
  })

  describe('equalsIgnoreRed', () => {
    it('should return true for same tiles', () => {
      expect(Tiles.M1.equalsIgnoreRed(Tiles.M1)).toBe(true)
      expect(Tiles.WE.equalsIgnoreRed(Tiles.WE)).toBe(true)
    })

    it('should return true for red and non-red versions of same tile', () => {
      expect(Tiles.M5.equalsIgnoreRed(Tiles.M5R)).toBe(true)
      expect(Tiles.M5R.equalsIgnoreRed(Tiles.M5)).toBe(true)
      expect(Tiles.P5.equalsIgnoreRed(Tiles.P5R)).toBe(true)
      expect(Tiles.S5R.equalsIgnoreRed(Tiles.S5)).toBe(true)
    })

    it('should return false for different tiles', () => {
      expect(Tiles.M1.equalsIgnoreRed(Tiles.M2)).toBe(false)
      expect(Tiles.M5.equalsIgnoreRed(Tiles.P5)).toBe(false)
      expect(Tiles.WE.equalsIgnoreRed(Tiles.WS)).toBe(false)
    })
  })

  describe('isSameType', () => {
    it('should return true for tiles of same type', () => {
      expect(Tiles.M1.isSameType(Tiles.M9)).toBe(true)
      expect(Tiles.P2.isSameType(Tiles.P8)).toBe(true)
      expect(Tiles.S3.isSameType(Tiles.S7)).toBe(true)
      expect(Tiles.WE.isSameType(Tiles.WN)).toBe(true)
      expect(Tiles.DW.isSameType(Tiles.DR)).toBe(true)
    })

    it('should return false for tiles of different types', () => {
      expect(Tiles.M1.isSameType(Tiles.P1)).toBe(false)
      expect(Tiles.P5.isSameType(Tiles.S5)).toBe(false)
      expect(Tiles.M9.isSameType(Tiles.WE)).toBe(false)
      expect(Tiles.WE.isSameType(Tiles.DW)).toBe(false)
    })
  })

  describe('compareTo', () => {
    it('should return correct comparison result', () => {
      expect(Tiles.M1.compareTo(Tiles.M2)).toBeLessThan(0)
      expect(Tiles.M2.compareTo(Tiles.M1)).toBeGreaterThan(0)
      expect(Tiles.M1.compareTo(Tiles.M1)).toBe(0)
    })

    it('should sort red dora after regular tiles of same number', () => {
      expect(Tiles.M5.compareTo(Tiles.M5R)).toBeLessThan(0)
      expect(Tiles.M5R.compareTo(Tiles.M5)).toBeGreaterThan(0)
      expect(Tiles.P5.compareTo(Tiles.P5R)).toBeLessThan(0)
      expect(Tiles.S5R.compareTo(Tiles.S5)).toBeGreaterThan(0)
    })

    it('should allow proper sorting with red dora', () => {
      const tiles = [Tiles.M5R, Tiles.M3, Tiles.M5, Tiles.M1, Tiles.M2]
      const sortedTiles = tiles.sort((a, b) => a.compareTo(b))
      expect(sortedTiles).toEqual([Tiles.M1, Tiles.M2, Tiles.M3, Tiles.M5, Tiles.M5R])
    })

    it('should handle mixed tiles with red dora', () => {
      const tiles = [Tiles.P5R, Tiles.M5, Tiles.S5R, Tiles.P5, Tiles.M5R, Tiles.S5]
      const sortedTiles = tiles.sort((a, b) => a.compareTo(b))
      expect(sortedTiles).toEqual([Tiles.M5, Tiles.M5R, Tiles.P5, Tiles.P5R, Tiles.S5, Tiles.S5R])
    })
  })
})

describe('utility functions', () => {
  describe('sorted', () => {
    it('should sort tiles correctly', () => {
      const tiles = [Tiles.M3, Tiles.M1, Tiles.M5, Tiles.M2]
      const sortedTiles = sorted(tiles)
      expect(sortedTiles).toEqual([Tiles.M1, Tiles.M2, Tiles.M3, Tiles.M5])
    })

    it('should handle mixed tile types', () => {
      const tiles = [Tiles.WE, Tiles.M1, Tiles.P1, Tiles.S1]
      const sortedTiles = sorted(tiles)
      expect(sortedTiles[0]).toBe(Tiles.M1)
      expect(sortedTiles[1]).toBe(Tiles.P1)
      expect(sortedTiles[2]).toBe(Tiles.S1)
      expect(sortedTiles[3]).toBe(Tiles.WE)
    })

    it('should not modify original array', () => {
      const originalTiles = [Tiles.M3, Tiles.M1, Tiles.M2]
      const originalCopy = [...originalTiles]
      sorted(originalTiles)
      expect(originalTiles).toEqual(originalCopy)
    })
  })

  describe('isTripleTiles', () => {
    it('should return true for valid triples', () => {
      expect(isTripleTiles([Tiles.M1, Tiles.M1, Tiles.M1])).toBe(true)
      expect(isTripleTiles([Tiles.WE, Tiles.WE, Tiles.WE])).toBe(true)
      expect(isTripleTiles([Tiles.DW, Tiles.DW, Tiles.DW])).toBe(true)
    })

    it('should return true for triples with red dora', () => {
      expect(isTripleTiles([Tiles.M5, Tiles.M5, Tiles.M5R])).toBe(true)
      expect(isTripleTiles([Tiles.P5R, Tiles.P5, Tiles.P5])).toBe(true)
      expect(isTripleTiles([Tiles.S5R, Tiles.S5R, Tiles.S5])).toBe(true)
    })

    it('should return false for wrong length', () => {
      expect(isTripleTiles([Tiles.M1, Tiles.M1])).toBe(false)
      expect(isTripleTiles([Tiles.M1, Tiles.M1, Tiles.M1, Tiles.M1])).toBe(false)
      expect(isTripleTiles([])).toBe(false)
    })

    it('should return false for different tiles', () => {
      expect(isTripleTiles([Tiles.M1, Tiles.M2, Tiles.M3])).toBe(false)
      expect(isTripleTiles([Tiles.M1, Tiles.M1, Tiles.M2])).toBe(false)
      expect(isTripleTiles([Tiles.M5, Tiles.P5, Tiles.S5])).toBe(false)
    })
  })

  describe('isQuadTiles', () => {
    it('should return true for valid quads', () => {
      expect(isQuadTiles([Tiles.M1, Tiles.M1, Tiles.M1, Tiles.M1])).toBe(true)
      expect(isQuadTiles([Tiles.WE, Tiles.WE, Tiles.WE, Tiles.WE])).toBe(true)
      expect(isQuadTiles([Tiles.DW, Tiles.DW, Tiles.DW, Tiles.DW])).toBe(true)
    })

    it('should return true for quads with red dora', () => {
      expect(isQuadTiles([Tiles.M5, Tiles.M5, Tiles.M5, Tiles.M5R])).toBe(true)
      expect(isQuadTiles([Tiles.P5R, Tiles.P5, Tiles.P5, Tiles.P5])).toBe(true)
    })

    it('should return false for wrong length', () => {
      expect(isQuadTiles([Tiles.M1, Tiles.M1, Tiles.M1])).toBe(false)
      expect(isQuadTiles([Tiles.M1, Tiles.M1, Tiles.M1, Tiles.M1, Tiles.M1])).toBe(false)
      expect(isQuadTiles([])).toBe(false)
    })

    it('should return false for different tiles', () => {
      expect(isQuadTiles([Tiles.M1, Tiles.M2, Tiles.M3, Tiles.M4])).toBe(false)
      expect(isQuadTiles([Tiles.M1, Tiles.M1, Tiles.M1, Tiles.M2])).toBe(false)
    })
  })

  describe('isStraightTiles', () => {
    it('should return true for valid straights', () => {
      expect(isStraightTiles([Tiles.M1, Tiles.M2, Tiles.M3])).toBe(true)
      expect(isStraightTiles([Tiles.M7, Tiles.M8, Tiles.M9])).toBe(true)
      expect(isStraightTiles([Tiles.P2, Tiles.P3, Tiles.P4])).toBe(true)
      expect(isStraightTiles([Tiles.S6, Tiles.S7, Tiles.S8])).toBe(true)
    })

    it('should return true for straights with red dora', () => {
      expect(isStraightTiles([Tiles.M4, Tiles.M5R, Tiles.M6])).toBe(true)
      expect(isStraightTiles([Tiles.P3, Tiles.P4, Tiles.P5R])).toBe(true)
      expect(isStraightTiles([Tiles.S5R, Tiles.S6, Tiles.S7])).toBe(true)
    })

    it('should handle unordered input', () => {
      expect(isStraightTiles([Tiles.M3, Tiles.M1, Tiles.M2])).toBe(true)
      expect(isStraightTiles([Tiles.P5, Tiles.P3, Tiles.P4])).toBe(true)
      expect(isStraightTiles([Tiles.S8, Tiles.S6, Tiles.S7])).toBe(true)
    })

    it('should return false for wrong length', () => {
      expect(isStraightTiles([Tiles.M1, Tiles.M2])).toBe(false)
      expect(isStraightTiles([Tiles.M1, Tiles.M2, Tiles.M3, Tiles.M4])).toBe(false)
      expect(isStraightTiles([])).toBe(false)
    })

    it('should return false for honor tiles', () => {
      expect(isStraightTiles([Tiles.WE, Tiles.WS, Tiles.WW])).toBe(false)
      expect(isStraightTiles([Tiles.DW, Tiles.DG, Tiles.DR])).toBe(false)
      expect(isStraightTiles([Tiles.M1, Tiles.M2, Tiles.WE])).toBe(false)
    })

    it('should return false for different suit types', () => {
      expect(isStraightTiles([Tiles.M1, Tiles.P2, Tiles.S3])).toBe(false)
      expect(isStraightTiles([Tiles.M1, Tiles.M2, Tiles.P3])).toBe(false)
      expect(isStraightTiles([Tiles.P7, Tiles.S8, Tiles.M9])).toBe(false)
    })

    it('should return false for non-consecutive tiles', () => {
      expect(isStraightTiles([Tiles.M1, Tiles.M3, Tiles.M5])).toBe(false)
      expect(isStraightTiles([Tiles.M1, Tiles.M2, Tiles.M4])).toBe(false)
      expect(isStraightTiles([Tiles.P2, Tiles.P4, Tiles.P6])).toBe(false)
    })

    it('should return false for same tiles', () => {
      expect(isStraightTiles([Tiles.M1, Tiles.M1, Tiles.M1])).toBe(false)
      expect(isStraightTiles([Tiles.P5, Tiles.P5, Tiles.P5])).toBe(false)
    })
  })
})

describe('constants', () => {
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

    it('should not contain middle number tiles', () => {
      const middleTiles = [
        Tiles.M2, Tiles.M3, Tiles.M4, Tiles.M5, Tiles.M6, Tiles.M7, Tiles.M8,
        Tiles.P2, Tiles.P3, Tiles.P4, Tiles.P5, Tiles.P6, Tiles.P7, Tiles.P8,
        Tiles.S2, Tiles.S3, Tiles.S4, Tiles.S5, Tiles.S6, Tiles.S7, Tiles.S8
      ]
      
      middleTiles.forEach(tile => {
        expect(ORPHAN_TILES).not.toContain(tile)
      })
    })
  })
})