
export const TABLE_WIDTH = 580;
export const TABLE_HEIGHT = 580;

export const TILE_WIDTH = 20;
export const TILE_HEIGHT = 30;
export const TILE_DEPTH = 10;

export const RESULT_WIDTH = 460;
export const RESULT_HEIGHT = 340;

export const DRAW_RESULT_WIDTH = 200;
export const DRAW_RESULT_HEIGHT = 80;

export const RIVER_RESULT_WIDTH = 460;
export const RIVER_RESULT_HEIGHT = 280;

export const PAYMENT_RESULT_WIDTH = 460;
export const PAYMENT_RESULT_HEIGHT = 240;

export const ROUND_INFO_WIDTH = 120;
export const ROUND_INFO_HEIGHT = 60;

export const GAME_RESULT_WIDTH = 350;
export const GAME_RESULT_HEIGHT = 300;

export const WIND_INDICATOR_SIZE = 20;

export const ACTION_BUTTON_WIDTH = 80;
export const ACTION_BUTTON_HEIGHT = 20;

// Responsive scaling utilities
export const getScaledSize = (originalSize: number, scale: number): number => {
  return originalSize * scale;
};

export const getScaledTileSize = (scale: number) => ({
  width: getScaledSize(TILE_WIDTH, scale),
  height: getScaledSize(TILE_HEIGHT, scale),
  depth: getScaledSize(TILE_DEPTH, scale),
});

export const getScaledTableSize = (scale: number) => ({
  width: getScaledSize(TABLE_WIDTH, scale),
  height: getScaledSize(TABLE_HEIGHT, scale),
});

export const getScaledResultSize = (scale: number) => ({
  width: getScaledSize(RESULT_WIDTH, scale),
  height: getScaledSize(RESULT_HEIGHT, scale),
});

export const getScaledDrawResultSize = (scale: number) => ({
  width: getScaledSize(DRAW_RESULT_WIDTH, scale),
  height: getScaledSize(DRAW_RESULT_HEIGHT, scale),
});

export const getScaledRiverResultSize = (scale: number) => ({
  width: getScaledSize(RIVER_RESULT_WIDTH, scale),
  height: getScaledSize(RIVER_RESULT_HEIGHT, scale),
});

export const getScaledPaymentResultSize = (scale: number) => ({
  width: getScaledSize(PAYMENT_RESULT_WIDTH, scale),
  height: getScaledSize(PAYMENT_RESULT_HEIGHT, scale),
});

export const getScaledRoundInfoSize = (scale: number) => ({
  width: getScaledSize(ROUND_INFO_WIDTH, scale),
  height: getScaledSize(ROUND_INFO_HEIGHT, scale),
});

export const getScaledGameResultSize = (scale: number) => ({
  width: getScaledSize(GAME_RESULT_WIDTH, scale),
  height: getScaledSize(GAME_RESULT_HEIGHT, scale),
});

export const getScaledWindIndicatorSize = (scale: number): number => {
  return getScaledSize(WIND_INDICATOR_SIZE, scale);
};


