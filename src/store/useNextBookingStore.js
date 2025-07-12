import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useNextBookingStore = create(
  persist(
    (set) => ({
      booking: null,
      allBookings: [],
      confirmed: false,
      loaded: false,

      setBooking: (booking) => set({ booking }),
      setAllBookings: (allBookings) => set({ allBookings }),
      setConfirmed: (confirmed) => set({ confirmed }),
      setLoaded: (loaded) => set({ loaded }),
    }),
    {
      name: 'next-booking',
    }
  )
);
