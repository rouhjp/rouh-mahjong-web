export interface LimitType {
  name: string;         // 点数区分の名前
  baseScore: number;    // 基本点数
  isHandLimit: boolean; // 役満かどうか
}

export const LimitTypes = {
  EMPTY: { 
    name: '', 
    baseScore: 0, 
    isHandLimit: false 
  },
  LIMIT: { 
    name: '満貫', 
    baseScore: 2000, 
    isHandLimit: false 
  },
  ONE_HALF_LIMIT: { 
    name: '跳満', 
    baseScore: 3000, 
    isHandLimit: false 
  },
  DOUBLE_LIMIT: { 
    name: '倍満', 
    baseScore: 4000, 
    isHandLimit: false 
  },
  TRIPLE_LIMIT: { 
    name: '三倍満', 
    baseScore: 6000, 
    isHandLimit: false 
  },
  COUNT_HAND_LIMIT: { 
    name: '役満', 
    baseScore: 8000, 
    isHandLimit: false 
  },
  HAND_LIMIT: { 
    name: '役満', 
    baseScore: 8000, 
    isHandLimit: true 
  },
  DOUBLE_HAND_LIMIT: { 
    name: '二倍役満', 
    baseScore: 16000, 
    isHandLimit: true 
  },
  TRIPLE_HAND_LIMIT: { 
    name: '三倍役満', 
    baseScore: 24000, 
    isHandLimit: true 
  },
  QUADRUPLE_HAND_LIMIT: { 
    name: '四倍役満', 
    baseScore: 32000, 
    isHandLimit: true 
  },
  QUINTUPLE_HAND_LIMIT: { 
    name: '五倍役満', 
    baseScore: 40000, 
    isHandLimit: true 
  },
  SEXTUPLE_HAND_LIMIT: { 
    name: '六倍役満', 
    baseScore: 48000, 
    isHandLimit: true 
  },
  SEPTUPLE_HAND_LIMIT: { 
    name: '七倍役満', 
    baseScore: 56000, 
    isHandLimit: true 
  },
  OCTUPLE_HAND_LIMIT: { 
    name: '八倍役満', 
    baseScore: 64000, 
    isHandLimit: true 
  }
} as const;

// 符と翻数から点数区分を取得する関数
export function getLimitType(points: number, doubles: number): LimitType {
  if (doubles >= 13) return LimitTypes.COUNT_HAND_LIMIT;
  if (doubles >= 11) return LimitTypes.TRIPLE_LIMIT;
  if (doubles >= 8) return LimitTypes.DOUBLE_LIMIT;
  if (doubles >= 6) return LimitTypes.ONE_HALF_LIMIT;
  if (doubles === 5) return LimitTypes.LIMIT;
  if (doubles === 4 && points >= 40) return LimitTypes.LIMIT;
  if (doubles >= 3 && points >= 70) return LimitTypes.LIMIT;
  return LimitTypes.EMPTY;
}

// 役満倍数から点数区分を取得する関数
export function getHandLimitType(multiplier: number): LimitType {
  switch (multiplier) {
    case 1: return LimitTypes.HAND_LIMIT;
    case 2: return LimitTypes.DOUBLE_HAND_LIMIT;
    case 3: return LimitTypes.TRIPLE_HAND_LIMIT;
    case 4: return LimitTypes.QUADRUPLE_HAND_LIMIT;
    case 5: return LimitTypes.QUINTUPLE_HAND_LIMIT;
    case 6: return LimitTypes.SEXTUPLE_HAND_LIMIT;
    case 7: return LimitTypes.SEPTUPLE_HAND_LIMIT;
    case 8: return LimitTypes.OCTUPLE_HAND_LIMIT;
    default: throw new Error(`Invalid limit multiplier: ${multiplier}`);
  }
}
