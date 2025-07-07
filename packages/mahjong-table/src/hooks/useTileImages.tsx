import { useEffect, useState, useRef } from "react";
import { Tile, TILE_VALUES } from "../type";

const imageCache = new Map<Tile, HTMLImageElement>();

export const useTileImages = () => {
  const [images, setImages] = useState<Map<Tile, HTMLImageElement>>(new Map(imageCache));
  const isLoaded = useRef(imageCache.size > 0);

  useEffect(() => {
    if (isLoaded.current) return;
    isLoaded.current = true;

    const imageMap = new Map<Tile, HTMLImageElement>();

    TILE_VALUES.forEach((tile) => {
      const img = new window.Image();
      img.src = `/tiles/${tile}.png`;
      img.onload = () => {
        imageMap.set(tile, img);
        imageCache.set(tile, img);
        if (imageMap.size === TILE_VALUES.length) {
          setImages(new Map(imageCache));
        }
      };
      img.onerror = (e) => {
        console.error(`Failed to load image: ${img.src}`, e);
      };
    });
  }, []);

  return images;
};
