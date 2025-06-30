import { describe, it, expect } from 'vitest'
import { LimitTypes } from './score'
import { Side, Sides, Tile, Tiles, Wind, Winds } from '../tiles'
import { WinningOption, WinningOptions, WinningSituation } from './situation'
import { createCallQuad, createCallStraight, createCallTriple, createSelfQuad } from './meld'
import { calculate, Hand } from './calculator'

const { EAST, SOUTH, WEST, NORTH } = Winds
const { SELF, RIGHT, ACROSS, LEFT } = Sides

const {
  M1, M2, M3, M4, M5, M5R, M6, M7, M8, M9,
  P1, P2, P3, P4, P5, P5R, P6, P7, P8, P9,
  S1, S2, S3, S4, S5, S5R, S6, S7, S8, S9,
  WE, WS, WW, WN, DW, DG, DR
} = Tiles

describe('calculator functions', () => {
  describe ('期待通り役判定が行われる', () => {
    it('天和', () => {
      const hand: Hand = {
        handTiles: [M1, M2, M3, P1, P2, P3, S1, S2, S3, WE, WS, WW, WN],
        winningTile: M1,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder()
        .withSeatWind(EAST)
        .withSupplierSide(SELF)
        .withOptions([WinningOptions.FIRST_AROUND_TSUMO]).build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['天和']);
      expect(result.limit).toEqual(LimitTypes.HAND_LIMIT);
    })

    it('天和七対子', () => {
      const hand: Hand = {
        handTiles: [M1, M2, M2, M9, M9, P2, P2, S7, S7, DW, DW, WE, WE],
        winningTile: M1,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder()
        .withSeatWind(EAST)
        .withSupplierSide(SELF)
        .withOptions([WinningOptions.FIRST_AROUND_TSUMO]).build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['天和']);
      expect(result.limit).toEqual(LimitTypes.HAND_LIMIT);
    })

    it('天和国士無双(必ず13面待ち扱いとなる)', () => {
      const hand: Hand = {
        handTiles: [M1, M1, P1, P9, S1, S9, WE, WS, WW, WN, DW, DG, DR],
        winningTile: M9,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder()
        .withSeatWind(EAST)
        .withSupplierSide(SELF)
        .withOptions([WinningOptions.FIRST_AROUND_TSUMO]).build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['天和', '国士無双十三面']);
      expect(result.limit).toEqual(LimitTypes.TRIPLE_HAND_LIMIT);
    })

    it('天和九蓮宝燈(必ず純正扱いとなる)', () => {
      const hand: Hand = {
        handTiles: [M1, M1, M2, M3, M4, M5, M5, M6, M7, M8, M9, M9, M9],
        winningTile: M1,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder()
        .withSeatWind(EAST)
        .withSupplierSide(SELF)
        .withOptions([WinningOptions.FIRST_AROUND_TSUMO]).build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['天和', '純正九蓮宝燈']);
      expect(result.limit).toEqual(LimitTypes.TRIPLE_HAND_LIMIT);
    })

    it('天和四暗刻(必ず単騎待ち扱いとなる)', () => {
      const hand: Hand = {
        handTiles: [M1, M1, M1, M3, M3, M7, M7, P1, P1, P1, S1, S1, S1],
        winningTile: M7,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder()
        .withSeatWind(EAST)
        .withSupplierSide(SELF)
        .withOptions([WinningOptions.FIRST_AROUND_TSUMO]).build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['天和', '四暗刻単騎']);
      expect(result.limit).toEqual(LimitTypes.TRIPLE_HAND_LIMIT);
    })

    it('地和', () => {
      const hand: Hand = {
        handTiles: [M1, M2, M3, P1, P2, P3, S1, S2, S3, WE, WS, WW, WN],
        winningTile: M1,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder()
        .withSeatWind(WEST)
        .withSupplierSide(SELF)
        .withOptions([WinningOptions.FIRST_AROUND_TSUMO]).build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['地和']);
      expect(result.limit).toEqual(LimitTypes.HAND_LIMIT);
    })

    it('地和国士無双', () => {
      const hand: Hand = {
        handTiles: [M1, M1, P1, P9, S1, S9, WE, WS, WW, WN, DW, DG, DR],
        winningTile: M9,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder()
        .withSeatWind(WEST)
        .withSupplierSide(SELF)
        .withOptions([WinningOptions.FIRST_AROUND_TSUMO]).build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['地和', '国士無双']);
      expect(result.limit).toEqual(LimitTypes.DOUBLE_HAND_LIMIT);
    })

    it('八連荘', () => {
      const hand: Hand = {
        handTiles: [M1, M2, M3, M4, M4, P2, P2, S7, S8, S9, DR, DR, DR],
        winningTile: M4,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder()
        .withSeatWind(EAST)
        .withOptions([WinningOptions.EIGHT_CONSEQUTIVE_WIN]).build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['八連荘']);
      expect(result.limit).toEqual(LimitTypes.HAND_LIMIT);
    })

    it('国士無双', () => {
      const hand: Hand = {
        handTiles: [M1, M1, P1, P9, S1, S9, WE, WS, WW, WN, DW, DG, DR],
        winningTile: M9,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['国士無双']);
      expect(result.limit).toEqual(LimitTypes.HAND_LIMIT);
    })

    it('国士無双十三面', () => {
      const hand: Hand = {
        handTiles: [M1, M9, P1, P9, S1, S9, WE, WS, WW, WN, DW, DG, DR],
        winningTile: M9,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['国士無双十三面']);
      expect(result.limit).toEqual(LimitTypes.DOUBLE_HAND_LIMIT);
    })

    it('九蓮宝燈', () => {
      const hand: Hand = {
        handTiles: [M1, M1, M1, M2, M3, M5, M5, M6, M7, M8, M9, M9, M9],
        winningTile: M4,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['九蓮宝燈']);
      expect(result.limit).toEqual(LimitTypes.HAND_LIMIT);
    })
    
    it('純正九蓮宝燈', () => {
      const hand: Hand = {
        handTiles: [M1, M1, M1, M2, M3, M4, M5, M6, M7, M8, M9, M9, M9],
        winningTile: M4,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['純正九蓮宝燈']);
      expect(result.limit).toEqual(LimitTypes.DOUBLE_HAND_LIMIT);
    })

    it('四槓子', () => {
      const hand: Hand = {
        handTiles: [M4],
        winningTile: M4,
        openMelds: [
          createCallQuad([M1, M1, M1], M1, LEFT),
          createSelfQuad([M2, M2, M2, M2]),
          createCallQuad([M3, M3, M3], M3, RIGHT),
          createCallQuad([M5, M5, M5], M5, ACROSS),
        ],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['四槓子']);
      expect(result.limit).toEqual(LimitTypes.DOUBLE_HAND_LIMIT);
    })

    it('大三元', () => {
      const hand: Hand = {
        handTiles: [M2, M3, M4, S7, DR, DR, DR],
        winningTile: S7,
        openMelds: [
          createCallTriple([DW, DW], DW, LEFT),
          createCallTriple([DG, DG], DG, RIGHT),
        ],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['大三元']);
      expect(result.limit).toEqual(LimitTypes.HAND_LIMIT);
    })

    it('小四喜', () => {
      const hand: Hand = {
        handTiles: [S2, S3, S4, WS, WS, WW, WW],
        winningTile: WS,
        openMelds: [
          createCallTriple([WE, WE], WE, LEFT),
          createCallTriple([WN, WN], WN, RIGHT),
        ],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['小四喜']);
      expect(result.limit).toEqual(LimitTypes.HAND_LIMIT);
    })

    it('大四喜', () => {
      const hand: Hand = {
        handTiles: [S2, S2, WS, WS, WS, WW, WW],
        winningTile: WW,
        openMelds: [
          createCallTriple([WE, WE], WE, LEFT),
          createCallTriple([WN, WN], WN, RIGHT),
        ],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['大四喜']);
      expect(result.limit).toEqual(LimitTypes.DOUBLE_HAND_LIMIT);
    })

    it('字一色', () => {
      const hand: Hand = {
        handTiles: [DW, DW, DW, DR, DR, WW, WW],
        winningTile: WW,
        openMelds: [
          createCallTriple([WE, WE], WE, LEFT),
          createCallTriple([WN, WN], WN, RIGHT),
        ],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['字一色']);
      expect(result.limit).toEqual(LimitTypes.HAND_LIMIT);
    })

    it('字一色七対子', () => {
      const hand: Hand = {
        handTiles: [DW, DW, DG, DG, DR, DR, WE, WE, WS, WS, WE, WN, WN],
        winningTile: WE,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['字一色']);
      expect(result.limit).toEqual(LimitTypes.HAND_LIMIT);
    })

    it('清老頭', () => {
      const hand: Hand = {
        handTiles: [M1, M1, M1, P1, P1, P9, P9, S1, S1, S1],
        winningTile: P9,
        openMelds: [createCallTriple([M9, M9], M9, LEFT)],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['清老頭']);
      expect(result.limit).toEqual(LimitTypes.HAND_LIMIT);
    })

    it('緑一色', () => {
      const hand: Hand = {
        handTiles: [S2, S3, S4, S8, S8, DG, DG],
        winningTile: S8,
        openMelds: [
          createCallStraight([S2, S4], S3),
          createCallTriple([S6, S6], S6, LEFT)
        ],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['緑一色']);
      expect(result.limit).toEqual(LimitTypes.HAND_LIMIT);
    })

    it('ツモ四暗刻', () => {
      const hand: Hand = {
        handTiles: [M3, M3, M3, M9, M9, P1, P1, P4, P4, P4, WW, WW, WW],
        winningTile: M9,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder()
        .withSupplierSide(SELF).build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['四暗刻']);
      expect(result.limit).toEqual(LimitTypes.HAND_LIMIT);
    })

    it('ロン四暗刻(不成立、三暗刻)', () => {
      const hand: Hand = {
        handTiles: [M3, M3, M3, M9, M9, P1, P1, P4, P4, P4, WW, WW, WW],
        winningTile: M9,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder()
        .withSupplierSide(LEFT).build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['対々和', '三暗刻']);
      expect(result.doubles).toEqual(4);
    })

    it('四暗刻単騎', () => {
      const hand: Hand = {
        handTiles: [M3, M3, M3, M9, P1, P1, P1, P4, P4, P4, WW, WW, WW],
        winningTile: M9,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder()
        .withSupplierSide(RIGHT).build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['四暗刻単騎']);
      expect(result.limit).toEqual(LimitTypes.DOUBLE_HAND_LIMIT);
    })

    it('天和大四喜字一色四暗刻単騎', () => {
      const hand: Hand = {
        handTiles: [DW, WE, WE, WE, WS, WS, WS, WW, WW, WW, WN, WN, WN],
        winningTile: DW,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder()
        .withSeatWind(EAST)
        .withSupplierSide(SELF)
        .withOptions([WinningOptions.FIRST_AROUND_TSUMO]).build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['天和', '大四喜', '字一色', '四暗刻単騎']);
      expect(result.limit).toEqual(LimitTypes.SEXTUPLE_HAND_LIMIT);
    })

    it('大四喜字一色四槓子四暗刻単騎', () => {
      const hand: Hand = {
        handTiles: [DW],
        winningTile: DW,
        openMelds: [
          createSelfQuad([WE, WE, WE, WE]),
          createSelfQuad([WS, WS, WS, WS]),
          createSelfQuad([WW, WW, WW, WW]),
          createSelfQuad([WN, WN, WN, WN]),
        ],
      }
      const situation = new WinningSituationBuilder()
        .withSupplierSide(RIGHT).build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['四槓子', '大四喜', '字一色', '四暗刻単騎']);
      expect(result.limit).toEqual(LimitTypes.SEPTUPLE_HAND_LIMIT);
    })

    it('八連荘大四喜字一色四槓子四暗刻単騎', () => {
      const hand: Hand = {
        handTiles: [DW],
        winningTile: DW,
        openMelds: [
          createSelfQuad([WE, WE, WE, WE]),
          createSelfQuad([WS, WS, WS, WS]),
          createSelfQuad([WW, WW, WW, WW]),
          createSelfQuad([WN, WN, WN, WN]),
        ],
      }
      const situation = new WinningSituationBuilder()
        .withSupplierSide(RIGHT)
        .withOptions([WinningOptions.EIGHT_CONSEQUTIVE_WIN]).build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['八連荘', '四槓子', '大四喜', '字一色', '四暗刻単騎']);
      expect(result.limit).toEqual(LimitTypes.OCTUPLE_HAND_LIMIT);
    })

    it('立直', () => {
      const hand = {
        handTiles: [M1, M2, M3, M5, M5, S2, S3, S4, S7, S8, S9, DW, DW],
        winningTile: M5,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder()
        .withOptions([WinningOptions.READY]).build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['立直']);
      expect(result.doubles).toEqual(1);
    })

    it('両立直', () => {
      const hand = {
        handTiles: [M1, M2, M3, M5, M5, S2, S3, S4, S7, S8, S9, DW, DW],
        winningTile: M5,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder()
        .withOptions([WinningOptions.FIRST_AROUND_READY]).build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['両立直']);
      expect(result.doubles).toEqual(2);
    })

    it('一発', () => {
      const hand = {
        handTiles: [M1, M2, M3, M5, M5, S2, S3, S4, S7, S8, S9, DW, DW],
        winningTile: M5,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder()
        .withOptions([WinningOptions.READY, WinningOptions.READY_AROUND_WIN]).build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['立直', '一発']);
      expect(result.doubles).toEqual(2);
    })

    it('門前清自摸和', () => {
      const hand = {
        handTiles: [M1, M2, M3, M5, M5, S2, S3, S4, S7, S7, WW, WW, WW],
        winningTile: M5,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder().withSupplierSide(SELF).build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['門前清自摸和']);
      expect(result.doubles).toEqual(1);
    })

    it('海底摸月', () => {
      const hand = {
        handTiles: [M1, M2, M3, M5, M5, S2, S3, S4, S7, S7, WW, WW, WW],
        winningTile: M5,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder()
        .withSupplierSide(SELF)
        .withOptions([WinningOptions.LAST_TILE_TSUMO]).build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['門前清自摸和', '海底摸月']);
      expect(result.doubles).toEqual(2);
    })

    it('河底撈魚', () => {
      const hand = {
        handTiles: [M1, M2, M3, M5, M5, S2, S3, S4, S7, S7, WW, WW, WW],
        winningTile: M5,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder()
        .withSupplierSide(ACROSS)
        .withOptions([WinningOptions.LAST_TILE_RON]).build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['河底撈魚']);
      expect(result.doubles).toEqual(1);
    })

    it('嶺上開花', () => {
      const hand = {
        handTiles: [M1, M2, M3, S2, S3, S4, S7, S7, DW, DW],
        winningTile: S7,
        openMelds: [createCallQuad([M4, M4, M4], M4, RIGHT)],
      }
      const situation = new WinningSituationBuilder()
        .withSupplierSide(SELF)
        .withOptions([WinningOptions.QUAD_TURN_TSUMO]).build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['嶺上開花']);
      expect(result.doubles).toEqual(1);
    })

    it('槍槓', () => {
      const hand = {
        handTiles: [M1, M2, M3, S2, S3, S4, S7, S7, DW, DW],
        winningTile: S7,
        openMelds: [createCallQuad([M4, M4, M4], M4, RIGHT)],
      }
      const situation = new WinningSituationBuilder()
        .withSupplierSide(ACROSS)
        .withOptions([WinningOptions.QUAD_TILE_RON]).build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['槍槓']);
      expect(result.doubles).toEqual(1);
    })

    it('断么九', () => {
      const hand = {
        handTiles: [M2, M3, M4, M5, M5, S2, S3, S4, S7, S7],
        winningTile: M5,
        openMelds: [createCallTriple([P3, P3], P3, ACROSS)],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['断么九']);
      expect(result.doubles).toEqual(1);
    })

    it('断么九七対子', () => {
      const hand = {
        handTiles: [M2, M2, M4, M4, M5, M5, P4, P4, S2, S2, S4, S4, S7],
        winningTile: S7,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['断么九', '七対子']);
      expect(result.doubles).toEqual(3);
    })

    it('門前混一色', () => {
      const hand = {
        handTiles: [M1, M1, M2, M3, M4, M5, M5, M5, M6, M7, M8, WN, WN],
        winningTile: WN,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['混一色']);
      expect(result.doubles).toEqual(3);
    })
    
    it('鳴き混一色', () => {
      const hand = {
        handTiles: [M2, M3, M4, M5, M5, M5, M6, M7, M8, DW],
        winningTile: DW,
        openMelds: [createCallTriple([M1, M1], M1, RIGHT)],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['混一色']);
      expect(result.doubles).toEqual(2);
    })

    it('混一色七対子', () => {
      const hand = {
        handTiles: [M1, M1, M2, M2, M4, M4, M5, M5, DW, DR, DR, WE, WE],
        winningTile: DW,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['混一色', '七対子']);
      expect(result.doubles).toEqual(5);
    })

    it('門前清一色', () => {
      const hand = {
        handTiles: [M1, M1, M2, M3, M4, M5, M5, M5, M6, M7, M8, M9, M9],
        winningTile: M9,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['清一色']);
      expect(result.doubles).toEqual(6);
    })

    it('鳴き清一色', () => {
      const hand = {
        handTiles: [M2, M3, M4, M5, M5, M5, M6, M7, M8, M9],
        winningTile: M9,
        openMelds: [createCallTriple([M1, M1], M1, RIGHT)],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['清一色']);
      expect(result.doubles).toEqual(5);
    })

    it('清一色七対子', () => {
      const hand = {
        handTiles: [M1, M1, M2, M2, M4, M4, M5, M5, M6, M6, M8, M9, M9],
        winningTile: M8,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['清一色', '七対子']);
      expect(result.doubles).toEqual(8);
    })

    it('三槓子', () => {
      const hand = {
        handTiles: [M7, M8, P2, P2],
        winningTile: M9,
        openMelds: [
          createCallQuad([M1, M1, M1], M1, LEFT),
          createCallQuad([S2, S2, S2], S2, RIGHT),
          createCallQuad([WN, WN, WN], WN, ACROSS),
        ],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['三槓子']);
      expect(result.doubles).toEqual(2);
    })

    it('小三元', () => {
      const hand = {
        handTiles: [S2, S3, S4, M5, M5, M5, DG, DG, DR, DR],
        winningTile: DG,
        openMelds: [createCallTriple([DW, DW], DW, ACROSS)],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['小三元', '翻牌 白', '翻牌 發']);
      expect(result.doubles).toEqual(4);
    })

    it('混老頭', () => {
      const hand = {
        handTiles: [M1, M1, M9, M9, S1, S1, S1, WW, WW, WW],
        winningTile: M1,
        openMelds: [
          createCallTriple([WN, WN], WN, LEFT)
        ],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['混老頭', '対々和']);
      expect(result.doubles).toEqual(4);
    })

    it('混老頭七対子', () => {
      const hand = {
        handTiles: [M1, M1, M9, M9, P1, P1, P9, P9, DW, DW, DR, WE, WE],
        winningTile: DR,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['混老頭', '七対子']);
      expect(result.doubles).toEqual(4);
    })

    it('翻牌 白', () => {
      const hand = {
        handTiles: [M1, M2, M3, M4, M5, M6, P2, P2, DW, DW],
        winningTile: DW,
        openMelds: [createCallTriple([S1, S1], S1, LEFT)],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['翻牌 白']);
      expect(result.doubles).toEqual(1);
    })

    it('翻牌 發', () => {
      const hand = {
        handTiles: [M1, M2, M3, M4, M5, M6, P2, P2, DG, DG],
        winningTile: DG,
        openMelds: [createCallTriple([S1, S1], S1, LEFT)],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['翻牌 發']);
      expect(result.doubles).toEqual(1);
    })

    it('翻牌 中', () => {
      const hand = {
        handTiles: [M1, M2, M3, M4, M5, M6, P2, P2, DR, DR],
        winningTile: DR,
        openMelds: [createCallTriple([S1, S1], S1, LEFT)],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['翻牌 中']);
      expect(result.doubles).toEqual(1);
    })

    it('自風牌 南', () => {
      const hand = {
        handTiles: [M1, M2, M3, M4, M5, M6, P2, P2, WS, WS],
        winningTile: WS,
        openMelds: [createCallTriple([S1, S1], S1, LEFT)],
      }
      const situation = new WinningSituationBuilder()
        .withRoundWind(EAST).withSeatWind(SOUTH).build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['自風牌']);
      expect(result.doubles).toEqual(1);
    })

    it('場風牌 東', () => {
      const hand = {
        handTiles: [M1, M2, M3, M4, M5, M6, P2, P2, WE, WE],
        winningTile: WE,
        openMelds: [createCallTriple([S1, S1], S1, LEFT)],
      }
      const situation = new WinningSituationBuilder()
        .withRoundWind(EAST).withSeatWind(SOUTH).build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['場風牌']);
      expect(result.doubles).toEqual(1);
    })

    it('連風牌 東', () => {
      const hand = {
        handTiles: [M1, M2, M3, M4, M5, M6, P2, P2, WE, WE],
        winningTile: WE,
        openMelds: [createCallTriple([S1, S1], S1, LEFT)],
      }
      const situation = new WinningSituationBuilder()
        .withRoundWind(EAST).withSeatWind(EAST).build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['自風牌', '場風牌']);
      expect(result.doubles).toEqual(2);
    })

    it('対々和', () => {
      const hand = {
        handTiles: [M1, M1, DR, DR],
        winningTile: M1,
        openMelds: [
          createCallTriple([S1, S1], S1, LEFT),
          createCallTriple([M2, M2], M2, RIGHT),
          createCallQuad([P3, P3, P3], P3, ACROSS),
        ],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['対々和']);
      expect(result.doubles).toEqual(2);
    })

    it('三暗刻', () => {
      const hand = {
        handTiles: [M1, M2, M3, P2, P2, P2, S7, S7, S7, WN],
        winningTile: WN,
        openMelds: [createSelfQuad([M4, M4, M4, M4])],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['三暗刻']);
      expect(result.doubles).toEqual(2);
    })

    it('ツモ三暗刻', () => {
      const hand = {
        handTiles: [M4, M4, M4, P2, P2, P2, S7, S7, WN, WN],
        winningTile: WN,
        openMelds: [createCallStraight([M1, M2], M3)],
      }
      const situation = new WinningSituationBuilder().withSupplierSide(SELF).build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['三暗刻']);
      expect(result.doubles).toEqual(2);
    })

    it('ロン三暗刻(不成立)', () => {
      const hand = {
        handTiles: [M1, M2, M3, M4, M4, M4, P2, P2, P2, S7, S7, WN, WN],
        winningTile: WN,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder().withSupplierSide(ACROSS).build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual([]);
      expect(result.doubles).toEqual(0);
    })

    it('平和', () => {
      const hand = {
        handTiles: [M2, M3, P1, P2, P3, S4, S5, S6, S6, S7, S8, WW, WW],
        winningTile: M1,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['平和']);
      expect(result.doubles).toEqual(1);
    })

    it('場風牌平和(不成立)', () => {
      const hand = {
        handTiles: [M2, M3, P1, P2, P3, S4, S5, S6, S6, S7, S8, WE, WE],
        winningTile: M1,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder().withRoundWind(EAST).build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual([]);
      expect(result.doubles).toEqual(0);
    })
   
    it('三元牌平和(不成立)', () => {
      const hand = {
        handTiles: [M2, M3, P1, P2, P3, S4, S5, S6, S6, S7, S8, DR, DR],
        winningTile: M1,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder().withRoundWind(EAST).build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual([]);
      expect(result.doubles).toEqual(0);
    })

    it('辺張平和(不成立)', () => {
      const hand = {
        handTiles: [M1, M2, P1, P2, P3, S4, S5, S6, S6, S7, S8, WW, WW],
        winningTile: M3,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual([]);
      expect(result.doubles).toEqual(0);
    })

    it('嵌張平和(不成立)', () => {
      const hand = {
        handTiles: [M2, M4, P1, P2, P3, S4, S5, S6, S6, S7, S8, WW, WW],
        winningTile: M3,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual([]);
      expect(result.doubles).toEqual(0);
    })

    it('門前混全帯么九', () => {
      const hand = {
        handTiles: [M1, M1, M1, M2, M3, S1, S2, S3, S7, S8, S9, WN, WN],
        winningTile: M1,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['混全帯么九']);
      expect(result.doubles).toEqual(2);
    })

    it('鳴き混全帯么九', () => {
      const hand = {
        handTiles: [M2, M3, S1, S2, S3, S7, S8, S9, WN, WN],
        winningTile: M1,
        openMelds: [createCallTriple([M1, M1], M1, RIGHT)],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['混全帯么九']);
      expect(result.doubles).toEqual(1);
    })

    it('門前純全帯么九', () => {
      const hand = {
        handTiles: [M1, M1, M1, M2, M3, P1, P1, S1, S2, S3, S7, S8, S9],
        winningTile: M1,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['純全帯么九']);
      expect(result.doubles).toEqual(3);
    })

    it('鳴き純全帯么九', () => {
      const hand = {
        handTiles: [M2, M3, P1, P1, S1, S2, S3, S7, S8, S9],
        winningTile: M1,
        openMelds: [createCallTriple([M1, M1], M1, RIGHT)],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['純全帯么九']);
      expect(result.doubles).toEqual(2);
    })

    it('門前一気通貫', () => {
      const hand = {
        handTiles: [M1, M2, M3, M4, M5, M6, M7, M8, M9, P4, P4, DR, DR],
        winningTile: P4,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['一気通貫']);
      expect(result.doubles).toEqual(2);
    })

    it('鳴き一気通貫', () => {
      const hand = {
        handTiles: [M4, M5, M6, M7, M8, M9, P4, P4, DR, DR],
        winningTile: P4,
        openMelds: [createCallStraight([M1, M2], M3)],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['一気通貫']);
      expect(result.doubles).toEqual(1);
    })

    it('門前三色同順', () => {
      const hand = {
        handTiles: [M2, M3, M4, P3, P4, S2, S3, S4, S9, S9, S9, WN, WN],
        winningTile: P2,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['三色同順']);
      expect(result.doubles).toEqual(2);
    })

    it('鳴き三色同順', () => {
      const hand = {
        handTiles: [P3, P4, S2, S3, S4, S9, S9, S9, WN, WN],
        winningTile: P2,
        openMelds: [createCallStraight([M2, M3], M4)],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['三色同順']);
      expect(result.doubles).toEqual(1);
    })

    it('三色同刻', () => {
      const hand = {
        handTiles: [M4, M4, M4, M7, M8, M9, P4, P4, P4, WN],
        winningTile: WN,
        openMelds: [createCallTriple([S4, S4], S4, LEFT)],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['三色同刻']);
      expect(result.doubles).toEqual(2);
    })
    
    it('一盃口', () => {
      const hand = {
        handTiles: [M2, M2, M3, M3, M4, S2, S3, S4, S9, S9, S9, WN, WN],
        winningTile: M4,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['一盃口']);
      expect(result.doubles).toEqual(1);
    })

    it('鳴き一盃口(不成立)', () => {
      const hand = {
        handTiles: [M2, M2, M3, M3, M4, S2, S3, S4, WN, WN],
        winningTile: M4,
        openMelds: [createCallTriple([S9, S9], S9, LEFT)],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual([]);
      expect(result.doubles).toEqual(0);
    })

    it('二盃口', () => {
      const hand = {
        handTiles: [M2, M2, M3, M4, M4, S7, S7, S8, S8, S9, S9, WN, WN],
        winningTile: M3,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['二盃口']);
      expect(result.doubles).toEqual(3);
    })

    it('七対子', () => {
      const hand = {
        handTiles: [M1, M1, M3, M3, P7, P9, P9, S2, S2, S4, S4, WN, WN],
        winningTile: P7,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['七対子']);
      expect(result.doubles).toEqual(2);
    })
    
    it('重複七対子(不成立)', () => {
      const hand = {
        handTiles: [M1, M1, M1, M1, P7, P9, P9, S2, S2, S4, S4, WN, WN],
        winningTile: P7,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder().build();
      expect(() => calculate(hand, situation)).toThrowError();
    })
  })

  describe('高点法が適用されている', () => {
    it('三暗刻より平和純全帯么九一盃口', () => {
      const hand = {
        handTiles: [M1, M1, M1, M2, M2, M2, M3, M3, M3, P1, P1, S7, S8],
        winningTile: S9,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['平和', '純全帯么九', '一盃口']);
      expect(result.doubles).toEqual(5);
    })

    it('平和一盃口より三暗刻', () => {
      const hand = {
        handTiles: [M1, M1, M1, M2, M2, M2, M3, M3, M3, P1, P1, S7, S8],
        winningTile: S6,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['三暗刻']);
      expect(result.doubles).toEqual(2);
    })

    it('純全帯么九一盃口より対々和三暗刻', () => {
      const hand = {
        handTiles: [M1, M1, M1, M2, M2, M2, M3, M3, M3, P1, P1, S9, S9],
        winningTile: S9,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['対々和', '三暗刻']);
      expect(result.doubles).toEqual(4);
    })

    it('喰い純全帯么九より対々和(刻子)', () => {
      const hand = {
        handTiles: [M1, M1, M2, M2, M2, M3, M3, M3, S9, S9],
        winningTile: M1,
        openMelds: [createCallTriple([P1, P1], P1, LEFT)],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['対々和']);
      expect(result.doubles).toEqual(2);
    })

    it('両面より嵌張優先', () => {
      const hand = {
        handTiles: [M1, M1, M7, M8, M9, P3, P4, P5, P5, P6, DR, DR, DR],
        winningTile: P4,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder().build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['翻牌 中']);
      expect(result.point).toEqual(40);
    })

    it('嵌張より平和優先', () => {
      const hand = {
        handTiles: [M1, M1, M7, M8, M9, P3, P4, P5, P5, P6, S1, S2, S3],
        winningTile: P4,
        openMelds: [],
      }
      const situation = new WinningSituationBuilder().withSupplierSide(RIGHT).build();
      const result = calculate(hand, situation);
      expect(result.handTypes.map(type => type.name)).toEqual(['平和']);
      expect(result.point).toEqual(30);
    })
  })
})

class WinningSituationBuilder {
  private roundWind: Wind = EAST
  private seatWind: Wind = SOUTH
  private supplierSide: Side = LEFT
  private upperIndicators: Tile[] = []
  private lowerIndicators: Tile[] = []
  private options: WinningOption[] = []

  withRoundWind(wind: Wind): WinningSituationBuilder {
    this.roundWind = wind
    return this
  }

  withSeatWind(wind: Wind): WinningSituationBuilder {
    this.seatWind = wind
    return this
  }

  withSupplierSide(side: Side): WinningSituationBuilder {
    this.supplierSide = side
    return this
  }

  withUpperIndicators(indicators: Tile[]): WinningSituationBuilder {
    this.upperIndicators = [...indicators]
    return this
  }

  withLowerIndicators(indicators: Tile[]): WinningSituationBuilder {
    this.lowerIndicators = [...indicators]
    return this
  }

  withOptions(options: WinningOption[]): WinningSituationBuilder {
    this.options = [...options]
    return this
  }

  build(): WinningSituation {
    return new WinningSituation(
      this.roundWind,
      this.seatWind,
      this.supplierSide,
      this.upperIndicators,
      this.lowerIndicators,
      this.options
    )
  }
}
