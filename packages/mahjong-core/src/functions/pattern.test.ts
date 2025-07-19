import { describe, it, expect } from 'vitest'
import { 
  isObviouslyNotCompleted,
  winningTileCandidatesOf,
} from './pattern.js'
import { Tiles } from '../tiles/index.js'

const {
  M1, M2, M3, M4, M5, M6, M7, M8, M9,
  P1, P2, P3, P6, P7, P8, P9, S1, S3, S7, S9,
  WE, WS, WW, DW, DG, DR
} = Tiles

describe('pattern functions', () => {
  describe('isCompletePattern', () => {
    it('should return result for standard completed hand', () => {
      const handTiles = [M1, M2, M3, M4, M5, M6, M7, M8, M9, P1, P2, P3, S1]
      const result = isObviouslyNotCompleted(handTiles, S1)
      expect(result).toBe(false)
    })

    it('should return false for clearly invalid pattern', () => {
      const handTiles = [M1, M5, M9, P2, P6, S3, S7, WE, WS, WW, DW, DG, DR]
      const result = isObviouslyNotCompleted(handTiles, M1)
      expect(result).toBe(true)
    })
  })

  describe('winningTileCandidatesOf', () => {
    it('should return winning candidates for standard ready hand', () => {
      const handTiles = [M1, M2, M3, M4, M5, M6, M7, M8, M9, P1, P2, P3, S3]
      const candidates = winningTileCandidatesOf(handTiles)
      expect(candidates).toEqual([S3])
    })

    it('should return winning candidates for standard ready hand', () => {
      const handTiles = [M1, M2, M3, M4, M5, M6, M7, M8, M9, P1, P2, P3, DW]
      const candidates = winningTileCandidatesOf(handTiles)
      expect(candidates).toEqual([DW])
    })

    it('should exclude exhausted tiles (4 already used)', () => {
      const handTiles = [M1, M1, M1, M1, M2, M3, P7, P8, P9, S3, S3, S3, S9]
      const candidates = winningTileCandidatesOf(handTiles)
      expect(candidates).toEqual([S9])
    })

    it('should return winning candidates for chuuren poutou (nine gates) - all M1-M9', () => {
      const handTiles = [M1, M1, M1, M2, M3, M4, M5, M6, M7, M8, M9, M9, M9]
      const winningTiles = winningTileCandidatesOf(handTiles)
      expect(winningTiles).toEqual([M1, M2, M3, M4, M5, M6, M7, M8, M9])
    })
  })
})