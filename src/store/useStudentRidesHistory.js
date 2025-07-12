import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStudentRidesHistoryStore = create(
    persist(
        (set) => ({
            rides: [],
            setRides: (rides) => set({ rides }),
        }),
        {
            name: 'student-rides-history',
        }
    )
);
