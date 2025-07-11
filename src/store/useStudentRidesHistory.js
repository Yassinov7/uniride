// useStudentRidesHistory.js
import { create } from 'zustand';

export const useStudentRidesHistoryStore = create((set) => ({
    rides: [],
    setRides: (rides) => set({ rides }),
}));
