import { describe, it, expect } from 'vitest'
import { 
  isHandReady,
  winningTilesOf,
  isCompleted,
  isThirteenOrphansComplated,
  isSevenPairsCompleted,
  isNineTiles,
  selectableStraightBasesOf,
  selectableTripleBasesOf,
  selectableQuadBasesOf,
  readyQuadTilesOf,
  waitingTilesOf,
  arrange,
  readyTilesOf
} from './hand'
import { Tiles } from '../tiles'

const {
  M1, M2, M3, M4, M5, M5R, M6, M7, M8, M9,
  P1, P2, P3, P4, P5, P5R, P6, P7, P8, P9,
  S1, S2, S3, S4, S5, S5R, S6, S7, S8, S9,
  WE, WS, WW, WN, DW, DG, DR
} = Tiles

describe('hand functions', () => {
  describe('readyTilesOf', () => {
    it('should return ready tiles for seven pairs ready hand', () => {
      const handTiles = [M1, M1, M9, M9, P2, P2, P8, P8, S3, S3, WE, WE, DR]
      expect(readyTilesOf(handTiles, DG)).toEqual([DR, DG])
    })
    it('should return ready tiles for seven pairs completed hand', () => {
      const handTiles = [M1, M1, M9, M9, P2, P2, P8, P8, S3, S3, WE, WE, DR]
      expect(readyTilesOf(handTiles, DR)).toEqual([M1, M9, P2, P8, S3, WE, DR])
    })
    it('should return ready tiles for thirteen orphans ready hand', () => {
      const handTiles = [M1, M4, M9, P1, P9, S1, S9, WE, WS, WW, WN, DW, DG]
      expect(readyTilesOf(handTiles, DR)).toEqual([M4])
    })
    it('should return ready tiles for thirteen orphans completed hand', () => {
      const handTiles = [M1, M1, M9, P1, P9, S1, S9, WE, WS, WW, WN, DW, DG]
      expect(readyTilesOf(handTiles, DR)).toEqual([M1, M9, P1, P9, S1, S9, WE, WS, WW, WN, DW, DG, DR])
    })
    it('should return ready tiles for meld hand', () => {
      const handTiles = [M1, M1, M1, P2, P2, P2, P5, P7, P8, S3, S3, S3, DR]
      expect(readyTilesOf(handTiles, DR)).toEqual([P5, P8])
    })
  })

  describe('isHandReady', () => {
    it('should return true for seven pairs ready hand', () => {
      const handTiles = [M1, M1, M9, M9, P2, P2, P8, P8, S3, S3, WE, WE, DR]
      expect(isHandReady(handTiles)).toBe(true)
    })

    it('should return true for thirteen orphans ready hand (13-way wait)', () => {
      const handTiles = [M1, M9, P1, P9, S1, S9, WE, WS, WW, WN, DW, DG, DR]
      expect(isHandReady(handTiles)).toBe(true)
    })

    it('should return true for thirteen orphans ready hand (single wait)', () => {
      const handTiles = [M1, M1, M9, P1, P9, S1, S9, WE, WS, WW, WN, DW, DG]
      expect(isHandReady(handTiles)).toBe(true)
    })

    it('should return true for standard ready hand (straight run pattern)', () => {
      const handTiles = [M1, M2, M3, M4, M5, M6, M7, M8, M9, P1, P2, P3, S1]
      expect(isHandReady(handTiles)).toBe(true)
    })

    it('should return true for standard ready hand (mixed pattern)', () => {
      const handTiles = [M1, M2, M3, M4, M5, M6, P7, P8, P9, S2, S3, S4, WE]
      expect(isHandReady(handTiles)).toBe(true)
    })

    it('should return true for nobetan wait hand', () => {
      const handTiles = [M1, M2, M3, M4, M5, M6, M7, M8, M9, P1, P2, P3, P4]
      expect(isHandReady(handTiles)).toBe(true)
    })

    it('should return true for chuuren poutou (nine gates) ready hand', () => {
      const handTiles = [M1, M1, M1, M2, M3, M4, M5, M6, M7, M8, M9, M9, M9]
      expect(isHandReady(handTiles)).toBe(true)
    })

    it('should return false for not ready hand', () => {
      const handTiles = [M1, M5, M9, P2, P6, S3, S7, WE, WS, WW, DW, DG, DR]
      expect(isHandReady(handTiles)).toBe(false)
    })
  })

  describe('winningTilesOf', () => {
    it('should return winning tiles for seven pairs', () => {
      const handTiles = [M1, M1, M9, M9, P2, P2, P8, P8, S3, S3, WE, WE, DR]
      const winningTiles = winningTilesOf(handTiles)
      expect(winningTiles).toContain(DR)
    })

    it('should return winning tiles for thirteen orphans (13-way wait)', () => {
      const handTiles = [M1, M9, P1, P9, S1, S9, WE, WS, WW, WN, DW, DG, DR]
      const winningTiles = winningTilesOf(handTiles)
      expect(winningTiles).toContain(M1)
      expect(winningTiles).toContain(M9)
      expect(winningTiles).toContain(P1)
    })

    it('should return winning tiles for thirteen orphans (single wait)', () => {
      const handTiles = [M1, M1, M9, P1, P9, S1, S9, WE, WS, WW, WN, DW, DG]
      const winningTiles = winningTilesOf(handTiles)
      expect(winningTiles).toContain(DR)
    })

    it('should return winning tiles for nobetan wait (P1 and P4)', () => {
      const handTiles = [M1, M2, M3, M4, M5, M6, M7, M8, M9, P1, P2, P3, P4]
      const winningTiles = winningTilesOf(handTiles)
      expect(winningTiles).toEqual([P1, P4])
    })

    it('should return winning tiles for ryanmen wait (M6 and M9)', () => {
      const handTiles = [M1, M1, M1, P2, P3, P4, S7, S8, S9, WE, WE, M7, M8]
      const winningTiles = winningTilesOf(handTiles)
      expect(winningTiles).toEqual([M6, M9])
    })

    it('should return winning tiles for kanchan wait (M6)', () => {
      const handTiles = [M1, M2, M3, P7, P8, P9, S2, S2, S2, WN, WN, M5, M7]
      const winningTiles = winningTilesOf(handTiles)
      expect(winningTiles).toEqual([M6])
    })

    it('should return winning tiles for penchan wait (M3)', () => {
      const handTiles = [M4, M5, M6, P3, P4, P5, S8, S8, S8, DR, DR, M1, M2]
      const winningTiles = winningTilesOf(handTiles)
      expect(winningTiles).toEqual([M3])
    })

    it('should return winning tiles for tanki wait (DG)', () => {
      const handTiles = [M2, M3, M4, P6, P7, P8, S3, S3, S3, WW, WW, WW, DG]
      const winningTiles = winningTilesOf(handTiles)
      expect(winningTiles).toEqual([DG])
    })

    it('should return winning tiles for shanpon wait (M5 and WE)', () => {
      const handTiles = [M1, M2, M3, P7, P8, P9, S4, S5, S6, M5, M5, WE, WE]
      const winningTiles = winningTilesOf(handTiles)
      expect(winningTiles).toEqual([M5, WE])
    })

    it('should return winning tiles for chuuren poutou (nine gates) - all M1-M9', () => {
      const handTiles = [M1, M1, M1, M2, M3, M4, M5, M6, M7, M8, M9, M9, M9]
      const winningTiles = winningTilesOf(handTiles)
      expect(winningTiles).toEqual([M1, M2, M3, M4, M5, M6, M7, M8, M9])
    })

  })

  describe('isCompleted', () => {
    it('should return true for completed seven pairs', () => {
      const handTiles = [M1, M1, M9, M9, P2, P2, P8, P8, S3, S3, WE, WE, DR]
      expect(isCompleted(handTiles, DR)).toBe(true)
    })

    it('should return true for completed thirteen orphans (13-way wait)', () => {
      const handTiles = [M1, M9, P1, P9, S1, S9, WE, WS, WW, WN, DW, DG, DR]
      expect(isCompleted(handTiles, M1)).toBe(true)
    })

    it('should return true for completed thirteen orphans (single wait)', () => {
      const handTiles = [M1, M1, M9, P1, P9, S1, S9, WE, WS, WW, WN, DW, DG]
      expect(isCompleted(handTiles, DR)).toBe(true)
    })

    it('should return false for incomplete hand', () => {
      const handTiles = [M1, M2, M3, M4, M5, M6, M7, M8, M9, P1, P2, P3, P4]
      expect(isCompleted(handTiles, P5)).toBe(false)
    })
  })

  describe('isThirteenOrphansComplated', () => {
    it('should return true for completed thirteen orphans (13-way wait)', () => {
      const handTiles = [M1, M9, P1, P9, S1, S9, WE, WS, WW, WN, DW, DG, DR]
      expect(isThirteenOrphansComplated(handTiles, M1)).toBe(true)
    })

    it('should return true for completed thirteen orphans (single wait)', () => {
      const handTiles = [M1, M1, M9, P1, P9, S1, S9, WE, WS, WW, WN, DW, DG]
      expect(isThirteenOrphansComplated(handTiles, DR)).toBe(true)
    })

    it('should return false when not all orphan tiles', () => {
      const handTiles = [M1, M2, P1, P9, S1, S9, WE, WS, WW, WN, DW, DG, DR]
      expect(isThirteenOrphansComplated(handTiles, M1)).toBe(false)
    })

    it('should return false for incomplete orphan types', () => {
      const handTiles = [M1, M1, M9, P1, P9, S1, S9, WE, WS, WW, WN, DW, DG]
      expect(isThirteenOrphansComplated(handTiles, M1)).toBe(false)
    })
  })

  describe('isSevenPairsCompleted', () => {
    it('should return true for completed seven pairs', () => {
      const handTiles = [M1, M1, M9, M9, P2, P2, P8, P8, S3, S3, WE, WE, DR]
      expect(isSevenPairsCompleted(handTiles, DR)).toBe(true)
    })

    it('should return true for completed seven pairs with red dora', () => {
      const handTiles = [M1, M1, M5, M9, M9, P2, P2, S3, S3, WE, WE, DR, DR]
      expect(isSevenPairsCompleted(handTiles, M5R)).toBe(true)
    })

    it('should return false when not all pairs', () => {
      const handTiles = [M1, M1, M9, M9, P2, P2, P8, P8, S3, S3, WE, WE, DR]
      expect(isSevenPairsCompleted(handTiles, WS)).toBe(false)
    })

    it('should return false for quad pattern (not seven pairs)', () => {
      const handTiles = [M1, M1, M1, M3, M3, M4, M4, M5, M5, M6, M6, M7, M7]
      expect(isSevenPairsCompleted(handTiles, M1)).toBe(false)
    })
  })

  describe('isNineTiles', () => {
    it('should return true when 9 or more orphan tiles', () => {
      const handTiles = [M1, M9, P1, P9, S1, S9, WE, WS, WW, WN, DW, DG, M2]
      expect(isNineTiles(handTiles, DR)).toBe(true)
    })

    it('should return false when less than 9 orphan tiles', () => {
      const handTiles = [M1, M2, M3, M4, M5, M6, M7, M8, P1, P2, P3, P4, P5]
      expect(isNineTiles(handTiles, P6)).toBe(false)
    })

    it('should return false when 8 orphan types with duplicate (9 orphan tiles)', () => {
      const handTiles = [M1, M1, M9, P1, P9, S1, S9, WE, M2, M3, M4, M5, M6]
      expect(isNineTiles(handTiles, WE)).toBe(false)
    })
  })

  describe('selectableStraightBasesOf', () => {
    it('should return selectable straight bases for chii', () => {
      const handTiles = [M1, M2, M4, M5]
      const bases = selectableStraightBasesOf(handTiles, M3)
      expect(bases).toEqual([
        [M1, M2],
        [M2, M4],
        [M4, M5]
      ])
    })

    it('should return selectable straight bases with red dora', () => {
      const handTiles = [M1, M2, M4, M5R]
      const bases = selectableStraightBasesOf(handTiles, M3)
      expect(bases).toEqual([
        [M1, M2],
        [M2, M4],
        [M4, M5R]
      ])
    })

    it('should return selectable straight bases with multiple M5 variants', () => {
      const handTiles = [M2, M3, M5, M5R, M6]
      const bases = selectableStraightBasesOf(handTiles, M4)
      expect(bases).toEqual([
        [M2, M3],
        [M3, M5],
        [M3, M5R],
        [M5, M6],
        [M5R, M6]
      ])
    })

    it('should return empty array when no bases available', () => {
      const handTiles = [M1, M2, M7, M8]
      const bases = selectableStraightBasesOf(handTiles, M5)
      expect(bases).toHaveLength(0)
    })

    it('should not return bases for honor tiles', () => {
      const handTiles = [WE, WS, WW, WN]
      const bases = selectableStraightBasesOf(handTiles, WE)
      expect(bases).toHaveLength(0)
    })
  })

  describe('selectableTripleBasesOf', () => {
    it('should return selectable triple bases for pon', () => {
      const handTiles = [M1, M1, M2, M3]
      const bases = selectableTripleBasesOf(handTiles, M1)
      expect(bases).toEqual([[M1, M1]])
    })

    it('should return selectable triple bases with red dora', () => {
      const handTiles = [M5, M5R, M2, M3]
      const bases = selectableTripleBasesOf(handTiles, M5)
      expect(bases).toEqual([[M5, M5R]])
    })

    it('should return multiple triple bases when multiple M5 variants', () => {
      const handTiles = [M5, M5, M5R, M2]
      const bases = selectableTripleBasesOf(handTiles, M5)
      expect(bases).toEqual([
        [M5, M5],
        [M5, M5R]
      ])
    })

    it('should return empty array when no pair available', () => {
      const handTiles = [M1, M2, M3, M4]
      const bases = selectableTripleBasesOf(handTiles, M1)
      expect(bases).toEqual([])
    })
  })

  describe('selectableQuadBasesOf', () => {
    it('should return selectable quad bases for kan', () => {
      const handTiles = [M1, M1, M1, M2]
      const bases = selectableQuadBasesOf(handTiles, M1)
      expect(bases).toEqual([[M1, M1, M1]])
    })

    it('should return selectable quad bases with red dora', () => {
      const handTiles = [M5, M5, M5R, M2]
      const bases = selectableQuadBasesOf(handTiles, M5)
      expect(bases).toEqual([[M5, M5, M5R]])
    })

    it('should return empty array when no triple available', () => {
      const handTiles = [M1, M1, M2, M3]
      const bases = selectableQuadBasesOf(handTiles, M1)
      expect(bases).toEqual([])
    })
  })

  describe('readyQuadTilesOf', () => {
    it('should return empty array when no triples available', () => {
      const handTiles = [M1, M2, M3, M4, M5, M6, P7, P8, P9, S1, S2, S3, WE]
      const quadTiles = readyQuadTilesOf(handTiles)
      expect(quadTiles).toEqual([])
    })

    it('should handle hands with triples', () => {
      const handTiles = [M1, M1, M1, M2, M3, M4, P5, P5, P5R, S1, S2, S3, WE]
      const quadTiles = readyQuadTilesOf(handTiles)
      expect(quadTiles).toEqual([M1, P5])
    })

    it('should not allow kan for tiles that were already 4 in hand before draw', () => {
      const handTiles = [M1, M1, M1, M1, M2, M3, P7, P8, P9, S5, S5, WE, WE]
      const quadTiles = readyQuadTilesOf(handTiles)
      expect(quadTiles).toEqual([])
    })

    it('should not allow kan that changes arrangement pattern', () => {
      const handTiles = [M1, M1, M1, M2, M2, M2, M3, M3, M3, S5, S5, S5, WE]
      const quadTiles = readyQuadTilesOf(handTiles)
      expect(quadTiles).toEqual([S5])
    })
  })

  describe('arrange', () => {
    it('should arrange simple completed hand', () => {
      const handTiles = [M1, M1, M1, M2, M3, M4, P7, P8, P9, S5, S5, WE, WE]
      const arrangements = arrange(handTiles, WE)
      expect(arrangements).toEqual([
        [[S5, S5], [M1, M1, M1], [M2, M3, M4], [P7, P8, P9], [WE, WE, WE]]
      ])
    })

    it('should arrange ryanpeikou (two identical sequences) with red dora', () => {
      const handTiles = [M2, M2, M3, M3, M4, M4, M5, M5R, M6, M6, M7, M7, M8]
      const arrangements = arrange(handTiles, M8)
      expect(arrangements).toEqual([
        [[M2, M2], [M3, M4, M5], [M3, M4, M5R], [M6, M7, M8], [M6, M7, M8]],
        [[M5, M5R], [M2, M3, M4], [M2, M3, M4], [M6, M7, M8], [M6, M7, M8]],
        [[M8, M8], [M2, M3, M4], [M2, M3, M4], [M5, M6, M7], [M5R, M6, M7]]
      ])
    })

    it('should arrange sanrenkoo (three consecutive triplets)', () => {
      const handTiles = [M1, M1, M1, M2, M2, M2, M3, M3, M3, P7, P8, P9, WE]
      const arrangements = arrange(handTiles, WE)
      expect(arrangements).toEqual([
        [[WE, WE], [M1, M1, M1], [M2, M2, M2], [M3, M3, M3], [P7, P8, P9]],
        [[WE, WE], [M1, M2, M3], [M1, M2, M3], [M1, M2, M3], [P7, P8, P9]],
      ])
    })

    it('should arrange yonrenkoo (four consecutive triplets)', () => {
      const handTiles = [M1, M1, M1, M2, M2, M2, M3, M3, M3, M4, M4, M4, S5]
      const arrangements = arrange(handTiles, S5)
      expect(arrangements).toEqual([
        [[S5, S5], [M1, M1, M1], [M2, M2, M2], [M3, M3, M3], [M4, M4, M4]],
        [[S5, S5], [M1, M2, M3], [M1, M2, M3], [M1, M2, M3], [M4, M4, M4]],
        [[S5, S5], [M1, M1, M1], [M2, M3, M4], [M2, M3, M4], [M2, M3, M4]]
      ])
    })
  })

  describe('waitingTilesOf', () => {
    it('should return waiting tiles for pair', () => {
      const base = [M1, M1]
      const waitingTiles = waitingTilesOf(base)
      expect(waitingTiles).toEqual([M1])
    })

    it('should return waiting tiles for straight base (ryanmen)', () => {
      const base = [M2, M3]
      const waitingTiles = waitingTilesOf(base)
      expect(waitingTiles).toEqual([M1, M4])
    })

    it('should return waiting tiles for straight base (penchan)', () => {
      const base = [M1, M2]
      const waitingTiles = waitingTilesOf(base)
      expect(waitingTiles).toEqual([M3])
    })

    it('should return waiting tiles for straight base (kanchan)', () => {
      const base = [M1, M3]
      const waitingTiles = waitingTilesOf(base)
      expect(waitingTiles).toEqual([M2])
    })

    it('should return waiting tiles for pair with red dora', () => {
      const base = [M5, M5R]
      const waitingTiles = waitingTilesOf(base)
      expect(waitingTiles).toEqual([M5])
    })

    it('should return waiting tiles for ryanmen with red dora', () => {
      const base = [M4, M5R]
      const waitingTiles = waitingTilesOf(base)
      expect(waitingTiles).toEqual([M3, M6])
    })

    it('should return waiting tiles for kanchan with red dora', () => {
      const base = [P4, P6]
      const waitingTiles = waitingTilesOf(base)
      expect(waitingTiles).toEqual([P5])
    })

    it('should return waiting tiles for penchan with red dora position', () => {
      const base = [S4, S5R]
      const waitingTiles = waitingTilesOf(base)
      expect(waitingTiles).toEqual([S3, S6])
    })
  })
})