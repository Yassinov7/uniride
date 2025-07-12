'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useWalletStore } from '@/store/walletStore';
import { useUserStore } from '@/store/userStore';
import { RotateCcw, CalendarDays } from 'lucide-react';
import dayjs from 'dayjs';

export default function StudentWalletHistoryPage() {
    const { transactions, setTransactions } = useWalletStore();
    const { user } = useUserStore();
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [filtered, setFiltered] = useState([]);

    useEffect(() => {
        if (!user?.id || transactions.length > 0) return;
        fetchTransactions();
    }, [user]);

    useEffect(() => {
        applyFilters();
    }, [transactions, startDate, endDate]);

    const fetchTransactions = async () => {
        if (!user?.id) return;
        setLoading(true);

        const { data, error } = await supabase
            .from('wallet_transactions')
            .select('amount, description, created_at')
            .eq('student_id', user.id)
            .order('created_at', { ascending: false });

        if (!error) setTransactions(data || []);
        setLoading(false);
    };

    const applyFilters = () => {
        let result = transactions;
        if (startDate) {
            result = result.filter((t) => dayjs(t.created_at).isAfter(dayjs(startDate).startOf('day')));
        }
        if (endDate) {
            result = result.filter((t) => dayjs(t.created_at).isBefore(dayjs(endDate).endOf('day')));
        }
        setFiltered(result);
    };

    return (
        <div className="max-w-3xl mx-auto mt-10 bg-white rounded-lg shadow p-6 mb-60 space-y-6">
            {/* العنوان وزر التحديث */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-xl font-bold text-blue-600">سجل المعاملات</h1>
                <button
                    onClick={fetchTransactions}
                    disabled={loading}
                    className="flex items-center gap-2 text-sm px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition disabled:opacity-50"
                >
                    <RotateCcw size={16} /> تحديث
                </button>
            </div>

            {/* فلاتر التاريخ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <label className="text-sm text-gray-700 flex items-center gap-1 mb-1">
                        <CalendarDays size={16} /> من تاريخ
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="p-2 border rounded"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm text-gray-700 flex items-center gap-1 mb-1">
                        <CalendarDays size={16} /> إلى تاريخ
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="p-2 border rounded"
                    />
                </div>
            </div>

            {/* الجدول */}
            {filtered.length === 0 ? (
                <p className="text-center text-gray-600">لا يوجد أي معاملات في الفترة المحددة.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border text-center">
                        <thead className="bg-gray-100 text-gray-600">
                            <tr>
                                <th className="border px-3 py-2 whitespace-nowrap">التاريخ</th>
                                <th className="border px-3 py-2 whitespace-nowrap">المبلغ</th>
                                <th className="border px-3 py-2 whitespace-nowrap">الوصف</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((t, i) => (
                                <tr key={i}>
                                    <td className="border px-3 py-2 whitespace-nowrap">
                                        {dayjs(t.created_at).format('YYYY-MM-DD HH:mm')}
                                    </td>
                                    <td
                                        className={`border px-3 py-2 font-semibold whitespace-nowrap ${t.amount < 0 ? 'text-orange-600' : 'text-green-600'
                                            }`}
                                    >
                                        {t.amount > 0 ? `+${t.amount}` : t.amount} ل.س
                                    </td>
                                    <td className="border px-3 py-2 text-gray-700 max-w-[180px] truncate">
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