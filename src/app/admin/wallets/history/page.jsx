'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useLoadingStore } from '@/store/loadingStore';
import toast from 'react-hot-toast';
import { useAdminWalletStore } from '@/store/adminWalletStore';


export default function WalletTransactionsPage() {
    const { transactions, fetchTransactions } = useAdminWalletStore();
    const [searchQuery, setSearchQuery] = useState('');
    const { setLoading } = useLoadingStore();

    useEffect(() => {
        fetchTransactions();
    }, []);



    return (
        <div className="space-y-6 mb-60 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-xl font-bold text-blue-700">سجل العمليات المالية</h1>
                <button
                    onClick={async () => {
                        setLoading(true);
                        const toastId = toast.loading('جاري تحديث الأرصدة...');
                        await fetchTransactions();
                        toast.dismiss(toastId);
                        toast.success('تم تحديث البيانات بنجاح');
                        setLoading(false);
                    }}
                    className="bg-blue-100 text-blue-700 px-4 py-2 rounded text-sm hover:bg-blue-200 transition"
                >
                    تحديث البيانات
                </button>
            </div>

            {/* حقل البحث */}
            <div className="max-w-md">
                <input
                    type="text"
                    placeholder="ابحث باسم الطالب أو الوصف..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border rounded px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {transactions.length === 0 ? (
                <p className="text-gray-500 mt-6">لا توجد عمليات مسجلة.</p>
            ) : (
                <div className="overflow-x-auto rounded-lg border shadow-sm mt-2">
                    <table className="min-w-full text-sm bg-white text-center">
                        <thead className="bg-blue-50 text-blue-800 text-sm">
                            <tr>
                                <th className="p-3 border">التاريخ</th>
                                <th className="p-3 border">الطالب</th>
                                <th className="p-3 border">المبلغ (ل.س)</th>
                                <th className="hidden sm:table-cell p-3 border">الوصف</th>
                                <th className="hidden sm:table-cell p-3 border">تمت بواسطة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions
                                .filter((t) =>
                                    t.profiles?.full_name?.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
                                    t.description?.toLowerCase().includes(searchQuery.trim().toLowerCase())
                                )
                                .map((t) => (
                                    <tr key={t.id} className="hover:bg-gray-50">
                                        <td className="border px-3 py-2 text-gray-700 whitespace-nowrap">
                                            {dayjs(t.created_at).format('YY-M-DD HH:mm')}
                                        </td>
                                        <td className="border px-3 py-2 font-bold text-blue-700 whitespace-nowrap">
                                            {t.profiles?.full_name || '—'}
                                        </td>
                                        <td
                                            className={`border px-3 py-2 font-semibold whitespace-nowrap ${t.amount < 0 ? 'text-red-600' : 'text-green-600'
                                                }`}
                                        >
                                            {t.amount}
                                        </td>
                                        <td className="hidden sm:table-cell border px-3 py-2 text-gray-700">
                                            {t.description || '—'}
                                        </td>
                                        <td className="hidden sm:table-cell border px-3 py-2 text-gray-600 whitespace-nowrap">
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
