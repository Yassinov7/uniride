'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import dayjs from 'dayjs';
import { useLoadingStore } from '@/store/loadingStore';


export default function WalletTransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const { setLoading } = useLoadingStore();

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
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

            if (error) {
                toast.error('فشل في تحميل العمليات');
            } else {
                setTransactions(data);
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="space-y-6 mb-60">
            <h1 className="text-xl font-bold text-blue-600">سجل العمليات المالية</h1>

            {transactions.length === 0 ? (
                <p className="text-gray-500">لا توجد عمليات مسجلة.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-3 py-2">التاريخ</th>
                                <th className="border px-3 py-2">الطالب</th>
                                <th className="border px-3 py-2">المبلغ (ل.س)</th>
                                <th className="hidden sm:table-cell border px-3 py-2">الوصف</th>
                                <th className="border px-3 py-2">تمت بواسطة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((t) => (
                                <tr key={t.id} className="text-center">
                                    <td className="border px-3 py-2 text-gray-700">
                                        {dayjs(t.created_at).format('YYYY-MM-DD HH:mm')}
                                    </td>
                                    <td className="border px-3 py-2 font-bold text-blue-700">
                                        {t.profiles?.full_name || '—'}
                                    </td>
                                    <td
                                        className={`border px-3 py-2 font-semibold ${t.amount < 0 ? 'text-red-600' : 'text-green-600'
                                            }`}
                                    >
                                        {t.amount}
                                    </td>
                                    <td className="hidden sm:table-cell border px-3 py-2 text-gray-700">
                                        {t.description || '—'}
                                    </td>
                                    <td className="border px-3 py-2 text-gray-600">
                                        {t.admin?.full_name || 'تلقائي'}
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
