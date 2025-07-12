import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useRideRequestStore = create(
    persist(
        (set) => ({
            requests: [],
            loadingreq: false,
            timingGroup: null,
            timingData: [],

            setRequests: (data) => set({ requests: data }),
            setLoadingreq: (value) => set({ loadingreq: value }),
            setTimingGroup: (groupId) => set({ timingGroup: groupId }),
            setTimingData: (data) => set({ timingData: data }),
        }),
        {
            name: 'ride-requests',
        }
    )
);
