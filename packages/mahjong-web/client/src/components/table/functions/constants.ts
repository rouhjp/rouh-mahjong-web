
export const TABLE_WIDTH = 580;
export const TABLE_HEIGHT = 580;

export const TILE_WIDTH = 20;
export const TILE_HEIGHT = 30;
export const TILE_DEPTH = 10;

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


