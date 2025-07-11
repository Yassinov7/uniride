// src/store/useNextBookingStore.js
import { create } from 'zustand';

export const useNextBookingStore = create((set) => ({
  booking: null,
  allBookings: [],
  confirmed: false,
  loaded: false, // لتفادي الجلب المتكرر

  setBooking: (booking) => set({ booking }),
  setAllBookings: (allBookings) => set({ allBookings }),
  setConfirmed: (confirmed) => set({ confirmed }),
  setLoaded: (loaded) => set({ loaded }),
}));
