// src/store/AdminPublicStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

export const useAdminPublicStore = create(
    persist(
        (set, get) => ({
            buses: [],
            locations: [],
            universities: [],
            loading: false,

            fetchBuses: async () => {
                set({ loading: true });
                const { data, error } = await supabase.from('buses').select('*').order('created_at', { ascending: false });
                if (!error) set({ buses: data });
                set({ loading: false });
            },

            fetchLocations: async () => {
                set({ loading: true });
                const { data, error } = await supabase.from('locations').select('*').order('created_at', { ascending: false });
                if (!error) set({ locations: data });
                set({ loading: false });
            },

            fetchUniversities: async () => {
                set({ loading: true });
                const { data, error } = await supabase.from('universities').select('*').order('id', { ascending: true });
                if (!error) set({ universities: data });
                set({ loading: false });
            },
        }),
        {
            name: 'public-store', // key in localStorage
            getStorage: () => localStorage,
            partialize: (state) => ({
                buses: state.buses,
                locations: state.locations,
                universities: state.universities,
            }),
        }
    )
);
