import { useState, useCallback, useEffect, useRef } from 'react';
import { Direction } from '../type';

interface Declaration {
  id: string;
  text: string;
  direction: Direction;
  timestamp: number;
}

// 表示する秒数
const DISPLAY_DURATION = 2000; // 2秒

export const useDeclaration = () => {
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const timersRef = useRef<Set<NodeJS.Timeout>>(new Set());

  const addDeclaration = useCallback((text: string, direction: Direction) => {
    const declaration: Declaration = {
      id: `${Date.now()}-${Math.random()}`,
      text,
      direction,
      timestamp: Date.now()
    };
    
    setDeclarations(prev => [...prev, declaration]);
    
    // 数秒後に自動削除
    const timer = setTimeout(() => {
      setDeclarations(prev => prev.filter(d => d.id !== declaration.id));
      timersRef.current.delete(timer);
    }, DISPLAY_DURATION);

    timersRef.current.add(timer);
  }, []);

  // コンポーネントアンマウント時にタイマーをクリーンアップ
  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  return {
    declarations,
    addDeclaration
  };
};
