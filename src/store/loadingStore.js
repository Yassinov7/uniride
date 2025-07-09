import { create } from 'zustand';

export const useLoadingStore = create((set) => ({
  isLoading: false,
  setLoading: (val) => set({ isLoading: val }),
}));
