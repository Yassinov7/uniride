'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import dayjs from 'dayjs';
import { useLoadingStore } from '@/store/loadingStore';

export default function StudentWalletHistoryPage() {
    const [transactions, setTransactions] = useState([]);
    const { setLoading } = useLoadingStore();

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const user = await supabase.auth.getUser();
            const { data, error } = await supabase
                .from('wallet_transactions')
                .select('amount, description, created_at')
                .eq('student_id', user.data.user?.id)
                .order('created_at', { ascending: false });

            if (!error) setTransactions(data || []);
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 bg-white rounded-lg shadow p-6 mb-60 space-y-6">
            <h1 className="text-xl font-bold text-blue-600 text-center">سجل المعاملات</h1>

            {transactions.length === 0 ? (
                <p className="text-center text-gray-600">لا يوجد أي معاملات حتى الآن.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border">
                        <thead className="bg-gray-100">
                            <tr className="text-center">
                                <th className="border px-3 py-2">التاريخ</th>
                                <th className="border px-3 py-2">المبلغ</th>
                                <th className="border px-3 py-2 hidden sm:table-cell">الوصف</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((t, i) => (
                                <tr key={i} className="text-center">
                                    <td className="border px-3 py-2">
                                        {dayjs(t.created_at).format('YYYY-MM-DD HH:mm')}
                                    </td>
                                    <td
                                        className={`border px-3 py-2 font-semibold ${t.amount < 0 ? 'text-orange-600' : 'text-green-500'
                                            }`}
                                    >
                                        {t.amount > 0 ? `+${t.amount}` : t.amount} ل.س
                                    </td>
                                    <td className="border px-3 py-2 hidden sm:table-cell text-gray-700">
                                        {t.description || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
