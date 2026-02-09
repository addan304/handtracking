/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useRef } from 'react';

const HandContext = createContext(null);

export const HandProvider = ({ children }) => {
  const handState = useRef({
    isOpen: false,
    openness: 0, // 0 to 1 (0 = closed, 1 = open)
    position: { x: 0, y: 0, z: 0 },
    isDetected: false,
    handCount: 0
  });

  return (
    <HandContext.Provider value={handState}>
      {children}
    </HandContext.Provider>
  );
};

export const useHand = () => {
  const context = useContext(HandContext);
  if (!context) {
    throw new Error('useHand must be used within a HandProvider');
  }
  return context;
};

