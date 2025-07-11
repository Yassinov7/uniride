// src/store/userStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'user-store', // اسم التخزين في localStorage
      getStorage: () => localStorage, // يمكنك تغييره إلى sessionStorage إن أردت
    }
  )
);
