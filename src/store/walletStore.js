import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWalletStore = create(
    persist(
        (set) => ({
            balance: null,
            transactions: [],
            loaded: false,

            setBalance: (value) => set({ balance: value }),
            setTransactions: (tx) => set({ transactions: tx }),
            setLoaded: (value) => set({ loaded: value }),

            clearWallet: () => set({ balance: null, transactions: [], loaded: false }),
        }),
        {
            name: 'wallet-storage', // اسم المفتاح داخل localStorage
        }
    )
);
