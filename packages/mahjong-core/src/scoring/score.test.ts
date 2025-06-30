import { describe, it, expect } from 'vitest'
import {
  createHandScoreOf,
  HandScore,
  limitTypeOf,
  handLimitTypeOf,
  PointTypes,
  LimitTypes
} from './score'
import { Winds, Sides } from '../tiles'

describe('score functions', () => {
  describe('limitTypeOf', () => {
    it('should return empty limit for 30 point 4 doubles', () => {
      const limitType = limitTypeOf(30, 4)
      expect(limitType).toEqual(LimitTypes.EMPTY)
    })

    it('should return mangan for 40 point 4 doubles', () => {
      const limitType = limitTypeOf(40, 4)
      expect(limitType).toEqual(LimitTypes.LIMIT)
    })

    it('should return haneman for 30 point 6 doubles', () => {
      const limitType = limitTypeOf(30, 6)
      expect(limitType).toEqual(LimitTypes.ONE_HALF_LIMIT)
    })
  })

  describe('handLimitTypeOf', () => {
    it('should return yakuman for multiplier 1', () => {
      const limitType = handLimitTypeOf(1)
      expect(limitType.name).toBe('役満')
    })

    it('should return double yakuman for multiplier 2', () => {
      const limitType = handLimitTypeOf(2)
      expect(limitType.name).toBe('二倍役満')
    })

    it('should return triple yakuman for multiplier 3', () => {
      const limitType = handLimitTypeOf(3)
      expect(limitType.name).toBe('三倍役満')
    })

    it('should return quadruple yakuman for multiplier 4', () => {
      const limitType = handLimitTypeOf(4)
      expect(limitType.name).toBe('四倍役満')
    })
  })

  describe('HandScore class', () => {
    it('should create HandScore instance with required properties', () => {
      const pointTypes = [PointTypes.BASE]
      const handTypes = [{
        name: 'リーチ',
        isLimit: false,
        doubles: 1,
        limitType: LimitTypes.EMPTY
      }]
      const score = createHandScoreOf(pointTypes, handTypes, Winds.EAST, Sides.SELF)
      
      expect(score).toBeInstanceOf(HandScore)
      expect(score.limit).toBeDefined()
    })
  })
})