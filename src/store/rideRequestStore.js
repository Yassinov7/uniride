import { create } from 'zustand';

export const useRideRequestStore = create((set) => ({
    requests: [],
    loadingreq: false,
    timingGroup: null,
    timingData: [],
    setRequests: (data) => set({ requests: data }),
    setLoadingreq: (value) => set({ loadingreq: value }),
    setTimingGroup: (groupId) => set({ timingGroup: groupId }),
    setTimingData: (data) => set({ timingData: data }),
}));



