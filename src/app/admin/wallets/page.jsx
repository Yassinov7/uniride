'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Pencil, X } from 'lucide-react';
import { useLoadingStore } from '@/store/loadingStore';


export default function AdminWalletsPage() {
    const [students, setStudents] = useState([]);
    const {isLoading, setLoading } = useLoadingStore();
    const [editingStudent, setEditingStudent] = useState(null);
    const [form, setForm] = useState({ amount: '', description: '', saving: false });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('id, full_name, role')
                .order('full_name');

            if (error || !profiles) {
                toast.error('فشل تحميل قائمة الطلاب');
                return;
            }

            const studentsOnly = profiles.filter((p) => p.role !== 'admin');

            const { data: wallets } = await supabase.from('wallets').select('*');

            const result = studentsOnly.map((student) => {
                const wallet = wallets?.find((w) => w.student_id === student.id);
                return {
                    ...student,
                    balance: wallet?.balance ?? 0,
                };
            });

            setStudents(result);
        } finally {
            setLoading(false);
        }
    };

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

            const { data: user } = await supabase.auth.getUser();

            await supabase.from('wallet_transactions').insert({
                student_id: student.id,
                amount: numericAmount,
                description,
                created_by: user?.user?.id ?? null,
            });

            toast.success(numericAmount > 0 ? 'تمت الإضافة بنجاح ✅' : 'تم الخصم بنجاح ✅');
            setEditingStudent(null);
            setForm({ amount: '', description: '', saving: false });
            fetchData();
        } catch (error) {
            console.error('خطأ أثناء تعديل الرصيد:', error);
            toast.error('حدث خطأ غير متوقع');
        } finally {
            setForm((prev) => ({ ...prev, saving: false }));
        }
    };


    return (
        <div className="space-y-6 mb-60">
            <h1 className="text-xl font-bold text-blue-600">إدارة أرصدة الطلاب</h1>

            {isLoading ? (
                <p className="text-gray-600">جاري التحميل...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-4 py-2">الطالب</th>
                                <th className="border px-4 py-2">الرصيد (ل.س)</th>
                                <th className="border px-4 py-2">تعديل</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student.id} className="text-center">
                                    <td className="border px-4 py-2 font-bold text-blue-700">
                                        {student.full_name}
                                    </td>
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
                                            className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 text-sm flex items-center gap-1 mx-auto"
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
            )}

            {editingStudent && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded shadow w-full max-w-md relative">
                        <button
                            onClick={() => setEditingStudent(null)}
                            className="absolute top-3 left-3 text-gray-500 hover:text-red-500"
                        >
                            <X size={22} />
                        </button>
                        <h2 className="text-lg font-bold mb-4 text-blue-600">
                            تعديل رصيد {editingStudent.full_name}
                        </h2>

                        <div className="space-y-4">
                            {/* نوع العملية */}
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    className={`flex-1 py-2 rounded border ${form.amount >= 0 ? 'bg-blue-600 text-white' : ''
                                        }`}
                                    onClick={() =>
                                        setForm((f) => ({ ...f, amount: Math.abs(f.amount || 0) }))
                                    }
                                >
                                    إضافة
                                </button>
                                <button
                                    type="button"
                                    className={`flex-1 py-2 rounded border ${form.amount < 0 ? 'bg-orange-600 text-white' : ''
                                        }`}
                                    onClick={() =>
                                        setForm((f) => ({ ...f, amount: -Math.abs(f.amount || 0) }))
                                    }
                                >
                                    خصم
                                </button>
                            </div>

                            <input
                                type="number"
                                name="amount"
                                value={form.amount}
                                onChange={handleFormChange}
                                className="w-full border p-2 rounded"
                                placeholder="المبلغ"
                            />
                            <input
                                type="text"
                                name="description"
                                value={form.description}
                                onChange={handleFormChange}
                                className="w-full border p-2 rounded"
                                placeholder="وصف العملية (اختياري)"
                            />

                            <button
                                onClick={handleSubmit}
                                disabled={form.saving}
                                className={`w-full py-2 rounded text-white ${form.amount < 0
                                    ? 'bg-orange-600 hover:bg-orange-700'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                    } disabled:opacity-50`}
                            >
                                {form.saving ? 'جارٍ التنفيذ...' : 'تنفيذ العملية'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
