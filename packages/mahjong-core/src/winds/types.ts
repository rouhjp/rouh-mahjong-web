// 風位・方向関連の型定義

// 絶対風位（東西南北）
export const Winds = {
  EAST: { code: 'E', name: '東', order: 0 },
  SOUTH: { code: 'S', name: '南', order: 1 },
  WEST: { code: 'W', name: '西', order: 2 },
  NORTH: { code: 'N', name: '北', order: 3 }
} as const;

export type Wind = typeof Winds[keyof typeof Winds];

// 相対方向（自家から見た位置）
export const Sides = {
  SELF: { code: 'SELF', name: '自家', offset: 0 },      // 自分
  RIGHT: { code: 'RIGHT', name: '下家', offset: 1 },    // 右隣（下家）
  ACROSS: { code: 'ACROSS', name: '対面', offset: 2 },  // 対面
  LEFT: { code: 'LEFT', name: '上家', offset: 3 }       // 左隣（上家）
} as const;

export type Side = typeof Sides[keyof typeof Sides];

// 風位の順序配列（東→南→西→北）
export const WIND_ORDER: Wind[] = [
  Winds.EAST,
  Winds.SOUTH, 
  Winds.WEST,
  Winds.NORTH
] as const;

// 相対方向の順序配列（自家→下家→対面→上家）
export const SIDE_ORDER: Side[] = [
  Sides.SELF,
  Sides.RIGHT,
  Sides.ACROSS,
  Sides.LEFT
] as const;