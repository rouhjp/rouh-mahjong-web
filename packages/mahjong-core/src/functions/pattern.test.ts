import { describe, it, expect } from 'vitest'
import { 
  isReadyPattern,
  isCompletePattern,
  winningTileCandidatesOf,
} from './pattern'
import { Tiles } from '../tiles'

const {
  M1, M2, M3, M4, M5, M5R, M6, M7, M8, M9,
  P1, P2, P3, P4, P5, P5R, P6, P7, P8, P9,
  S1, S2, S3, S4, S5, S5R, S6, S7, S8, S9,
  WE, WS, WW, WN, DW, DG, DR
} = Tiles

describe('pattern functions', () => {
  describe('isReadyPattern', () => {
    it('should return result for standard ready hand', () => {
      const handTiles = [M1, M2, M3, M4, M5, M6, M7, M8, M9, P1, P2, P3, S1]
      const result = isReadyPattern(handTiles)
      expect(result).toBe(true)
    })

    it('should return false for clearly invalid pattern', () => {
      const handTiles = [M1, M5, M9, P2, P6, S3, S7, WE, WS, WW, DW, DG, DR]
      const result = isReadyPattern(handTiles)
      expect(result).toBe(false)
    })
  })

  describe('isCompletePattern', () => {
    it('should return result for standard completed hand', () => {
      const handTiles = [M1, M2, M3, M4, M5, M6, M7, M8, M9, P1, P2, P3, S1]
      const result = isCompletePattern(handTiles, S1)
      expect(result).toBe(true)
    })

    it('should return false for clearly invalid pattern', () => {
      const handTiles = [M1, M5, M9, P2, P6, S3, S7, WE, WS, WW, DW, DG, DR]
      const result = isCompletePattern(handTiles, M1)
      expect(result).toBe(false)
    })
  })

  describe('winningTileCandidatesOf', () => {
    it('should return winning candidates for standard ready hand', () => {
      const handTiles = [M1, M2, M3, M4, M5, M6, M7, M8, M9, P1, P2, P3, S3]
      const candidates = winningTileCandidatesOf(handTiles)
      expect(candidates).toEqual([S2, S3, S4])
    })

    it('should return winning candidates for standard ready hand', () => {
      const handTiles = [M1, M2, M3, M4, M5, M6, M7, M8, M9, P1, P2, P3, DW]
      const candidates = winningTileCandidatesOf(handTiles)
      expect(candidates).toEqual([DW])
    })

    it('should exclude exhausted tiles (4 already used)', () => {
      const handTiles = [M1, M1, M1, M1, M2, M3, P7, P8, P9, S3, S3, S3, S3]
      const candidates = winningTileCandidatesOf(handTiles)
      expect(candidates).toEqual([S2, S4])
    })
  })
})