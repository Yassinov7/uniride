// src/store/profileStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

export const useProfileStore = create(
    persist(
        (set) => ({
            universities: [],
            locations: [],
            loading: false,

            fetchOptions: async () => {
                set({ loading: true });
                const [{ data: universities }, { data: locations }] = await Promise.all([
                    supabase.from('universities').select('id, name'),
                    supabase.from('locations').select('id, name'),
                ]);
                set({
                    universities: universities || [],
                    locations: locations || [],
                    loading: false,
                });
            },
        }),
        {
            name: 'profile-store', // اسم المفتاح في localStorage
        }
    )
);
