'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { BookAlert, DollarSign, Clock4 } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import { useLoadingStore } from '@/store/loadingStore';

dayjs.locale('ar');
const weekdays = ['الجمعة', 'السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
const getStartFriday = (dateStr) => {
    const input = dayjs(dateStr);
    const dayOfWeek = input.day(); // 0: الأحد .. 6: السبت
    const daysToSubtract = (dayOfWeek + 2) % 7; // لحساب الفرق إلى الجمعة
    return input.subtract(daysToSubtract, 'day');
};


export default function RideRequestPage() {
    const [startDate, setStartDate] = useState('');
    const [selectedDays, setSelectedDays] = useState([]);
    const [loading, setLoadings] = useState(false);
    const { setLoading } = useLoadingStore();
    const [requests, setRequests] = useState([]);
    const [timingGroup, setTimingGroup] = useState(null); // group_id
    const [timingData, setTimingData] = useState([]); // [{request_id, date, go_time, return_time}]
    const [savingTimings, setSavingTimings] = useState(false);
    const groupByGroupId = (requests) => {
        const grouped = {};
        for (const req of requests) {
            if (!grouped[req.group_id]) {
                grouped[req.group_id] = {
                    group_id: req.group_id,
                    status: req.status,
                    created_at: req.created_at,
                    dates: [],
                };
            }
            grouped[req.group_id].dates.push(req.date);
        }
        return Object.values(grouped);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try{
        const { data } = await supabase.from('ride_requests').select('*').order('created_at', { ascending: false });
        setRequests(groupByGroupId(data || []));
        }   finally{
            setLoading(false);
        }
    };

    const handleToggleDay = (index) => {
        setSelectedDays((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };

    const handleOpenTimingDialog = async (group_id) => {
        const { data, error } = await supabase
            .from('ride_requests')
            .select('id, date')
            .eq('group_id', group_id)
            .eq('status', 'approved');

        if (data && !error) {
            const initial = data.map((item) => ({
                request_id: item.id,
                date: item.date,
                go_time: '07:00',
                return_time: '14:00',
            }));
            setTimingData(initial);
            setTimingGroup(group_id);
        }
    };

    const handleSaveTimings = async () => {
        setSavingTimings(true);
        const inserts = timingData.map((t) => ({
            request_id: t.request_id,
            go_time: t.go_time,
            return_time: t.return_time,
        }));

        await supabase.from('ride_request_timings').upsert(inserts, { onConflict: 'request_id' });

        toast.success('تم حفظ التوقيتات بنجاح');
        setSavingTimings(false);
        setTimingGroup(null);
    };

    const handleSubmit = async () => {
        if (!startDate || selectedDays.length === 0) {
            toast.error('يرجى تحديد تاريخ وأيام الأسبوع');
            return;
        }

        setLoadings(true);
        const { data: userData, error: authError } = await supabase.auth.getUser();
        const studentId = userData?.user?.id;

        if (!studentId || authError) {
            toast.error('فشل جلب معلومات الحساب');
            setLoadings(false);
            return;
        }

        const start = getStartFriday(startDate);
        const dates = selectedDays.map((i) => start.add(i, 'day').format('YYYY-MM-DD'));
        const group_id = crypto.randomUUID();

        const inserts = dates.map((date) => ({ student_id: studentId, date, group_id }));
        const { error } = await supabase.from('ride_requests').insert(inserts);

        setLoadings(false);

        if (error) toast.error('حدث خطأ أثناء الحجز');
        else {
            toast.success('تم إرسال الطلب بنجاح');
            setSelectedDays([]);
            setStartDate('');
            fetchRequests();
        }
    };

    return (
        <div className="max-w-xl mb-60 mx-auto space-y-6">
            <h1 className="text-xl font-bold text-blue-600">طلب حجز أسبوعي</h1>

            {/* إشعارات */}
            <div className="space-y-3 text-sm text-gray-800 bg-yellow-50 border border-yellow-200 rounded p-4">
                <div className="flex gap-2 items-start">
                    <span className="text-yellow-600 text-lg"><BookAlert /></span>
                    <div>
                        <p className="font-bold">ملاحظة:</p>
                        <p>يمكنك تقديم طلب جماعي لأيام متعددة خلال أسبوع واحد فقط.</p>
                    </div>
                </div>
                <div className="flex gap-2 items-start">
                    <span className="text-green-600 text-lg"><DollarSign /></span>
                    <div>
                        <p className="font-bold">تنبيه:</p>
                        <p className="font-bold">يجب وجود رصيد كافٍ. سيتم الخصم بعد الموافقة والتوزيع.</p>
                    </div>
                </div>
            </div>

            {/* النموذج */}
            <div className="bg-white p-4 rounded shadow space-y-4">
                <label className="block text-sm font-medium">حدد أي يوم من الأسبوع (من الجمعة إلى الخميس)</label>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 border rounded"
                />

                {startDate && (
                    <>
                        <p className="font-medium text-sm mt-4">اختر الأيام المطلوبة من نفس الأسبوع:</p>
                        <div className="grid grid-cols-2 gap-2">
                            {weekdays.map((name, i) => {
                                const base = getStartFriday(startDate);
                                const date = base.add(i, 'day');
                                return (
                                    <label key={i} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedDays.includes(i)}
                                            onChange={() => handleToggleDay(i)}
                                        />
                                        {name} - {date.format('YYYY-MM-DD')}
                                    </label>
                                );
                            })}

                        </div>
                    </>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                    {loading ? 'جاري الإرسال...' : 'إرسال الطلب'}
                </button>
            </div>
            <div className="overflow-x-auto mt-8">
                <table className="min-w-full text-sm border rounded">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-3 py-2 whitespace-nowrap">التواريخ المطلوبة</th>
                            <th className="border px-3 py-2 whitespace-nowrap">الحالة</th>
                            <th className="border px-3 py-2 whitespace-nowrap">تم الإرسال في</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((group) => (
                            <tr key={group.group_id} className="text-center hover:bg-gray-50">
                                <td className="border px-3 py-2 text-right text-xs sm:text-sm">
                                    {group.dates
                                        .map(date => {
                                            const d = dayjs(date);
                                            return `${d.format('dddd')} - ${d.format('YYYY/MM/DD')}`;
                                        })
                                        .join('، ')}
                                </td>
                                <td className="border px-3 py-2">
                                    {group.status === 'approved'
                                        ? <button
                                            onClick={() => handleOpenTimingDialog(group.group_id)}
                                            className="mt-2 text-sm bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600"
                                        >
                                            تحديد توقيت الذهاب والعودة
                                        </button>
                                        : group.status === 'rejected'
                                            ? '❌ مرفوض'
                                            : '⏳ قيد الانتظار'}
                                </td>
                                <td className="border px-3 py-2 text-xs sm:text-sm">
                                    {dayjs(group.created_at).format('YYYY-MM-DD HH:mm')}
                                </td>
                            </tr>
                        ))}
                        {requests.length === 0 && (
                            <tr>
                                <td colSpan={3} className="text-gray-500 py-4 text-center">
                                    لا يوجد طلبات حالياً
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {timingGroup && (
                    <div className="mt-6 bg-white border border-blue-200 rounded-lg p-4 space-y-4 shadow">
                        <h2 className="text-base font-bold text-blue-600 flex items-center gap-2">
                            <Clock4 size={18} /> تحديد توقيت الذهاب والعودة
                        </h2>

                        {timingData.map((item, idx) => (
                            <div key={item.request_id} className="border-b py-3">
                                <p className="font-medium text-sm mb-2 text-blue-700">
                                    {dayjs(item.date).format('dddd - YYYY/MM/DD')}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700">وقت الذهاب</label>
                                        <input
                                            type="time"
                                            className="w-full border rounded p-2 text-sm"
                                            value={item.go_time}
                                            onChange={(e) =>
                                                setTimingData((prev) => {
                                                    const copy = [...prev];
                                                    copy[idx].go_time = e.target.value;
                                                    return copy;
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700">العودة المتوقعة</label>
                                        <input
                                            type="time"
                                            className="w-full border rounded p-2 text-sm"
                                            value={item.return_time}
                                            onChange={(e) =>
                                                setTimingData((prev) => {
                                                    const copy = [...prev];
                                                    copy[idx].return_time = e.target.value;
                                                    return copy;
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="flex flex-col sm:flex-row justify-between gap-2 mt-4">
                            <button
                                onClick={() => setTimingGroup(null)}
                                className="w-full sm:w-auto px-4 py-2 rounded border border-gray-400 text-gray-700 hover:bg-gray-100"
                            >
                                إغلاق
                            </button>
                            <button
                                onClick={handleSaveTimings}
                                disabled={savingTimings}
                                className="w-full sm:w-auto px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                            >
                                {savingTimings ? 'جارٍ الحفظ...' : 'حفظ التوقيتات'}
                            </button>
                        </div>
                    </div>
                )}

            </div>


        </div>

    );
}
