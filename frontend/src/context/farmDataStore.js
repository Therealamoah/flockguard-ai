import { createContext, useContext } from 'react';

export const FarmDataContext = createContext(null);

export function useFarmData() {
  const ctx = useContext(FarmDataContext);
  if (!ctx) throw new Error('useFarmData must be used within a FarmDataProvider');
  return ctx;
}
