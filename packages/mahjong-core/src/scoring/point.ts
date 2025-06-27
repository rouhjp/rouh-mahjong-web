export interface PointType {
  name: string;   // 符の名前
  points: number; // 符の点数
}

export const PointTypes = {
  BASE: {
    name: '副底',
    points: 20
  },
  SEVEN_PAIR_BASE: {
    name: '七対子固定符',
    points: 25
  },
  HEAD_SUIT: {
    name: '雀頭(数牌)',
    points: 0
  },
  HEAD_OTHER_WIND: {
    name: '雀頭(客風牌)',
    points: 0
  },
  HEAD_DRAGON: {
    name: '雀頭(三元牌)',
    points: 2
  },
  HEAD_SEAT_WIND: {
    name: '雀頭(自風牌)',
    points: 2
  },
  HEAD_ROUND_WIND: {
    name: '雀頭(場風牌)',
    points: 2
  },
  DOUBLE_VALUABLE_HEAD: {
    name: '雀頭(連風牌)',
    points: 4
  },
  STRAIGHT: {
    name: '順子',
    points: 0
  },
  TRIPLE: {
    name: '明刻(中張牌)',
    points: 2
  },
  ORPHAN_TRIPLE: {
    name: '明刻(么九牌)',
    points: 4
  },
  CONCEALED_TRIPLE: {
    name: '暗刻(中張牌)',
    points: 4
  },
  ORPHAN_CONCEALED_TRIPLE: {
    name: '暗刻(么九牌)',
    points: 8
  },
  QUAD: {
    name: '明槓(中張牌)',
    points: 8
  },
  ORPHAN_QUAD: {
    name: '明槓(么九牌)',
    points: 16
  },
  CONCEALED_QUAD: {
    name: '暗槓(中張牌)',
    points: 16
  },
  ORPHAN_CONCEALED_QUAD: {
    name: '暗槓(么九牌)',
    points: 32
  },
  DOUBLE_SIDE_STRAIGHT_WAIT: {
    name: '待ち(両面)',
    points: 0
  },
  EITHER_HEAD_WAIT: {
    name: '待ち(双碰)',
    points: 0
  },
  SINGLE_HEAD_WAIT: {
    name: '待ち(単騎)',
    points: 2
  },
  MIDDLE_STRAIGHT_WAIT: {
    name: '待ち(嵌張)',
    points: 2
  },
  SINGLE_SIDE_STRAIGHT_WAIT: {
    name: '待ち(辺張)',
    points: 2
  },
  TSUMO: {
    name: '自摸符',
    points: 2
  },
  CONCEALED_RON: {
    name: '門前加符',
    points: 10
  },
  CALLED_NO_POINT: {
    name: '平和加符',
    points: 10
  }
} as const;
