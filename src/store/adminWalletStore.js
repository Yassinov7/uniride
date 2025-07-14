// src/store/adminWalletStore.js
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export const useAdminWalletStore = create((set) => ({
  students: [],
  transactions: [],
  loading: false,

  fetchStudents: async () => {
    set({ loading: true });
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .order('full_name');

      if (error || !profiles) return;

      const studentsOnly = profiles.filter((p) => p.role !== 'admin');

      const { data: wallets } = await supabase.from('wallets').select('*');

      const result = studentsOnly.map((student) => {
        const wallet = wallets?.find((w) => w.student_id === student.id);
        return {
          ...student,
          balance: wallet?.balance ?? 0,
        };
      });

      set({ students: result });
    } finally {
      set({ loading: false });
    }
  },

  fetchTransactions: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select(`
          id,
          amount,
          description,
          created_at,
          profiles:student_id (full_name),
          admin:created_by (full_name)
        `)
        .order('created_at', { ascending: false });

      if (!error) {
        set({ transactions: data });
      }
    } finally {
      set({ loading: false });
    }
  },
}));
