'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const days = [
    { value: 'saturday', label: 'السبت' },
    { value: 'sunday', label: 'الأحد' },
    { value: 'monday', label: 'الإثنين' },
    { value: 'tuesday', label: 'الثلاثاء' },
    { value: 'wednesday', label: 'الأربعاء' },
    { value: 'thursday', label: 'الخميس' },
    { value: 'friday', label: 'الجمعة' },
];

export default function RideRequestPage() {
    const [form, setForm] = useState({
        preferred_day: '',
        go_time: '',
        expected_return_time: '',
        start_date: '',
    });

    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        const { data, error } = await supabase
            .from('ride_requests')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error) setRequests(data || []);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const handleSubmit = async () => {
        const { preferred_day, go_time, expected_return_time, start_date } = form;
        if (!preferred_day || !go_time || !expected_return_time || !start_date) {
            toast.error('يرجى ملء جميع الحقول');
            return;
        }

        setLoading(true);

        const { data: userData, error: authError } = await supabase.auth.getUser();
        const studentId = userData?.user?.id;

        if (!studentId || authError) {
            toast.error('حدث خطأ أثناء جلب بيانات الحساب');
            setLoading(false);
            return;
        }

        const { error } = await supabase.from('ride_requests').insert({
            student_id: studentId,
            preferred_day,
            go_time,
            expected_return_time,
            start_date,
        });

        setLoading(false);

        if (error) {
            toast.error('فشل إرسال الطلب');
        } else {
            toast.success('تم إرسال الطلب بنجاح');
            setForm({ preferred_day: '', go_time: '', expected_return_time: '', start_date: '' });
            fetchRequests();
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-bold text-blue-600">طلب حجز رحلة</h1>
            <div className="space-y-3 text-sm text-gray-800 bg-yellow-50 border border-yellow-200 rounded p-4">
                <div className="flex gap-2 items-start">
                    <span className="text-yellow-600 text-lg">🗓️</span>
                    <div>
                        <p className="font-bold">ملاحظة: الحجز لمدة ٤ أسابيع</p>
                        <p>
                            سيتم إنشاء الحجز لأربعة أسابيع متتالية بدءًا من التاريخ الذي تختاره.<br />
                            <span className="text-gray-600 text-xs">
                                مثال: إذا اخترت &quot;السبت 2025-07-06&quot;، سيتم الحجز لنفس اليوم في 4 أسابيع قادمة.
                            </span>
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 items-start">
                    <span className="text-green-600 text-lg">💰</span>
                    <div>
                        <p className="font-bold">تنبيه: الرصيد شرط للحجز</p>
                        <p>
                            يجب أن يكون لديك رصيد كافٍ في حسابك لكي يتم اعتماد الحجز من قبل المشرف.
                        </p>
                    </div>
                </div>
            </div>

            {/* نموذج الطلب */}
            <div className="bg-white shadow rounded p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">اليوم</label>
                        <select
                            name="preferred_day"
                            value={form.preferred_day}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                        >
                            <option value="">اختر اليوم</option>
                            {days.map((d) => (
                                <option key={d.value} value={d.value}>
                                    {d.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">تاريخ البدء</label>
                        <input
                            type="date"
                            name="start_date"
                            value={form.start_date}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">وقت الذهاب</label>
                        <input
                            type="time"
                            name="go_time"
                            value={form.go_time}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">وقت العودة المتوقع</label>
                        <input
                            type="time"
                            name="expected_return_time"
                            value={form.expected_return_time}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'جاري الإرسال...' : 'إرسال الطلب'}
                </button>
            </div>

            {/* عرض الطلبات السابقة */}
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm border mt-6">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-3 py-2">اليوم</th>
                            <th className="border px-3 py-2">الذهاب</th>
                            <th className="border px-3 py-2">العودة</th>
                            <th className="border px-3 py-2 hidden sm:table-cell">التاريخ</th>
                            <th className="border px-3 py-2">الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((r) => (
                            <tr key={r.id} className="text-center">
                                <td className="border px-3 py-2">{days.find(d => d.value === r.preferred_day)?.label}</td>
                                <td className="border px-3 py-2">{r.go_time}</td>
                                <td className="border px-3 py-2">{r.expected_return_time}</td>
                                <td className="border px-3 py-2 hidden sm:table-cell">
                                    {dayjs(r.start_date).format('YYYY-MM-DD')}
                                </td>
                                <td className="border px-3 py-2">
                                    {r.status === 'approved'
                                        ? '✅ مقبول'
                                        : r.status === 'rejected'
                                            ? '❌ مرفوض'
                                            : '⏳ قيد الانتظار'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
