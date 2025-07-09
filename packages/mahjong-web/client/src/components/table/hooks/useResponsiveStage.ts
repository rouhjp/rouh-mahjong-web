import { useEffect, useRef, useState } from 'react';

export interface ResponsiveStageProps {
  width: number;
  height: number;
  scale: number;
}

export const useResponsiveStage = (
  virtualWidth: number,
  virtualHeight: number,
  containerRef: React.RefObject<HTMLDivElement | null>
): ResponsiveStageProps => {
  const [stageProps, setStageProps] = useState<ResponsiveStageProps>({
    width: virtualWidth,
    height: virtualHeight,
    scale: 1
  });
  
  const resizeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Calculate scale to fit within container while maintaining aspect ratio
      const scaleX = containerWidth / virtualWidth;
      const scaleY = containerHeight / virtualHeight;
      const scale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond original size

      // Calculate actual stage size
      const actualWidth = virtualWidth * scale;
      const actualHeight = virtualHeight * scale;

      setStageProps({
        width: actualWidth,
        height: actualHeight,
        scale
      });
    };

    const handleResize = () => {
      // Debounce resize events for better performance
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(updateSize, 100);
    };

    // Use ResizeObserver for better performance
    const resizeObserver = new ResizeObserver(handleResize);
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
      updateSize(); // Initial size calculation
    }

    // Fallback to window resize for older browsers
    window.addEventListener('resize', handleResize);

    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [virtualWidth, virtualHeight, containerRef]);

  return stageProps;
};