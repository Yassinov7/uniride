'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Pencil, X } from 'lucide-react';
import { useLoadingStore } from '@/store/loadingStore';
import { useAdminWalletStore } from '@/store/adminWalletStore';
import { useUserStore } from '@/store/userStore';


export default function AdminWalletsPage() {
    const { students, fetchStudents } = useAdminWalletStore();
    const { setLoading } = useLoadingStore();
    const [editingStudent, setEditingStudent] = useState(null);
    const [balanceFilter, setBalanceFilter] = useState('');
    const [form, setForm] = useState({ amount: '', description: '', saving: false });
    const { user } = useUserStore();
    const [searchQuery, setSearchQuery] = useState('');


    useEffect(() => {
        if (students.length === 0) fetchStudents();
    }, []);



    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (form.saving) return;

        const { amount, description } = form;
        const student = editingStudent;

        if (!amount || isNaN(amount)) {
            toast.error('يرجى إدخال مبلغ صالح');
            return;
        }

        setForm((prev) => ({ ...prev, saving: true }));

        try {
            const numericAmount = parseFloat(amount);

            const { data: current } = await supabase
                .from('wallets')
                .select('*')
                .eq('student_id', student.id)
                .single();

            const newBalance = (current?.balance ?? 0) + numericAmount;

            const { error: walletError } = await supabase.from('wallets').upsert({
                student_id: student.id,
                balance: newBalance,
            });

            if (walletError) {
                toast.error('فشل تحديث الرصيد');
                return;
            }


            await supabase.from('wallet_transactions').insert({
                student_id: student.id,
                amount: numericAmount,
                description,
                created_by: user?.id || null,
            });

            toast.success(numericAmount > 0 ? 'تمت الإضافة بنجاح ✅' : 'تم الخصم بنجاح ✅');
            setEditingStudent(null);
            setForm({ amount: '', description: '', saving: false });
            await fetchStudents();
        } catch (error) {
            console.error('خطأ أثناء تعديل الرصيد:', error);
            toast.error('حدث خطأ غير متوقع');
        } finally {
            setForm((prev) => ({ ...prev, saving: false }));
        }
    };


    return (
        <div className="space-y-6 mb-60 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-xl font-bold text-blue-700">إدارة أرصدة الطلاب</h1>



            </div>
            <div dir='ltr' className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <button
                    onClick={async () => {
                        setLoading(true);
                        const toastId = toast.loading('جاري تحديث محفظات الطلاب...');
                        await fetchStudents();
                        toast.dismiss(toastId);
                        toast.success('تم تحديث البيانات بنجاح');
                        setLoading(false);
                    }
                    }
                    className="bg-blue-100 text-blue-700 px-4 py-2 rounded text-sm hover:bg-blue-200 transition"
                >
                    تحديث البيانات
                </button>

                <div className="flex gap-2 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="ابحث باسم الطالب..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-64 border rounded px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        value={balanceFilter}
                        onChange={(e) => setBalanceFilter(e.target.value)}
                        className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">كل الأرصدة</option>
                        <option value="positive">أرصدة موجبة</option>
                        <option value="negative">أرصدة سالبة</option>
                    </select>
                </div>
            </div>
            {/* الملخص المالي */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-sm">
                {/* مجموع الرصيد السالب */}
                <div className="bg-red-50 text-red-700 p-4 rounded shadow-sm text-center">
                    <div className="font-bold text-lg">
                        {students
                            .filter((s) => s.balance < 0)
                            .reduce((sum, s) => sum + s.balance, 0)
                            .toLocaleString()} ل.س
                    </div>
                    <div>إجمالي الأرصدة السالبة</div>
                </div>

                {/* مجموع الرصيد الموجب */}
                <div className="bg-green-50 text-green-700 p-4 rounded shadow-sm text-center">
                    <div className="font-bold text-lg">
                        {students
                            .filter((s) => s.balance >= 0)
                            .reduce((sum, s) => sum + s.balance, 0)
                            .toLocaleString()} ل.س
                    </div>
                    <div>إجمالي الأرصدة الموجبة</div>
                </div>

                {/* صافي الرصيد */}
                <div className="bg-blue-50 text-blue-700 p-4 rounded shadow-sm text-center">
                    <div className="font-bold text-lg">
                        {students
                            .reduce((sum, s) => sum + s.balance, 0)
                            .toLocaleString()} ل.س
                    </div>
                    <div>صافي الرصيد الكلي</div>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border shadow-sm">
                <table className="min-w-full text-sm text-center bg-white">
                    <thead className="bg-blue-50 text-blue-800 text-sm">
                        <tr>
                            <th className="p-3 border">الطالب</th>
                            <th className="p-3 border">الرصيد (ل.س)</th>
                            <th className="p-3 border">الإجراء</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students
                            .filter((s) =>
                                s.full_name?.toLowerCase().includes(searchQuery.trim().toLowerCase())
                            )
                            .filter((s) =>
                                balanceFilter === 'positive' ? s.balance >= 0 :
                                    balanceFilter === 'negative' ? s.balance < 0 :
                                        true
                            )
                            .map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="border px-4 py-2 font-bold text-blue-700">{student.full_name}</td>
                                    <td
                                        className={`border px-4 py-2 font-semibold ${student.balance < 0 ? 'text-red-600' : 'text-green-600'
                                            }`}
                                    >
                                        {student.balance}
                                    </td>
                                    <td className="border px-4 py-2">
                                        <button
                                            onClick={() => {
                                                setEditingStudent(student);
                                                setForm({ amount: '', description: '', saving: false });
                                            }}
                                            className="bg-orange-500 text-white px-4 py-1.5 rounded hover:bg-orange-600 text-sm flex items-center justify-center gap-1"
                                        >
                                            <Pencil size={16} />
                                            تعديل
                                        </button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            {/* تعديل الرصيد - Modal */}
            {
                editingStudent && (
                    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md relative">
                            <button
                                onClick={() => setEditingStudent(null)}
                                className="absolute top-3 left-3 text-gray-500 hover:text-red-500"
                            >
                                <X size={22} />
                            </button>

                            <h2 className="text-lg font-bold mb-4 text-blue-700">
                                تعديل رصيد <span className="text-black">{editingStudent.full_name}</span>
                            </h2>

                            <div className="space-y-4">
                                {/* نوع العملية */}
                                <input
                                    type="number"
                                    name="amount"
                                    value={form.amount}
                                    onChange={handleFormChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="المبلغ"
                                />
                                <input
                                    type="text"
                                    name="description"
                                    value={form.description}
                                    onChange={handleFormChange}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="وصف العملية (اختياري)"
                                />
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        className={`flex-1 py-2 rounded border font-semibold ${form.amount >= 0 ? 'bg-blue-600 text-white' : 'hover:bg-blue-100'
                                            }`}
                                        onClick={() =>
                                            setForm((f) => ({ ...f, amount: Math.abs(f.amount || 0) }))
                                        }
                                    >
                                        إضافة
                                    </button>
                                    <button
                                        type="button"
                                        className={`flex-1 py-2 rounded border font-semibold ${form.amount < 0 ? 'bg-orange-600 text-white' : 'hover:bg-orange-100'
                                            }`}
                                        onClick={() =>
                                            setForm((f) => ({ ...f, amount: -Math.abs(f.amount || 0) }))
                                        }
                                    >
                                        خصم
                                    </button>
                                </div>



                                <button
                                    onClick={handleSubmit}
                                    disabled={form.saving}
                                    className={`w-full py-2 rounded text-white font-semibold transition ${form.amount < 0
                                        ? 'bg-orange-600 hover:bg-orange-700'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                        } disabled:opacity-50`}
                                >
                                    {form.saving ? 'جارٍ التنفيذ...' : 'تنفيذ العملية'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >

    );
}
