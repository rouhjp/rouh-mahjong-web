
export const TABLE_WIDTH = 580;
export const TABLE_HEIGHT = 580;

export const TILE_WIDTH = 20;
export const TILE_HEIGHT = 30;
export const TILE_DEPTH = 10;

export const RESULT_WIDTH = 460;
export const RESULT_HEIGHT = 340;

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


