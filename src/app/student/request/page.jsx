'use client';

import { useState, useEffect } from 'react';
import { useRef } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';

import { BookAlert, DollarSign, Clock4, RotateCcw } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useRideRequestStore } from '@/store/rideRequestStore';

dayjs.locale('ar');

const weekdays = ['الجمعة', 'السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];

const getStartFriday = (dateStr) => {
    const input = dayjs(dateStr);
    const dayOfWeek = input.day(); // 0: الأحد .. 6: السبت
    const daysToSubtract = (dayOfWeek + 2) % 7;
    return input.subtract(daysToSubtract, 'day');
};

export default function RideRequestPage() {
    const {
        requests,
        setRequests,
        loadingreq,
        setLoadingreq,
        timingGroup,
        timingData,
        setTimingGroup,
        setTimingData,
    } = useRideRequestStore();

    const [startDate, setStartDate] = useState('');
    const [selectedDays, setSelectedDays] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [savingTimings, setSavingTimings] = useState(false);
    const { user } = useUserStore();

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
        return Object.values(grouped).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    };

    const timingRef = useRef(null);

    useEffect(() => {
        if (timingGroup && timingRef.current) {
            // التمرير بسلاسة
            timingRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [timingGroup]);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoadingreq(true);
        try {
            const { data } = await supabase
                .from('ride_requests')
                .select('*')
                .order('created_at', { ascending: false });
            const grouped = groupByGroupId(data || []);
            setRequests(grouped);
        } finally {
            setLoadingreq(false);
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

    // const handleSubmit = async () => {
    //     if (!startDate || selectedDays.length === 0) {
    //         toast.error('يرجى تحديد تاريخ وأيام الأسبوع');
    //         return;
    //     }

    //     setSubmitting(true);
    //     const studentId = user?.id;

    //     if (!studentId) {
    //         toast.error('فشل جلب معلومات الحساب');
    //         setSubmitting(false);
    //         return;
    //     }

    //     const start = getStartFriday(startDate);
    //     const dates = selectedDays.map((i) => start.add(i, 'day').format('YYYY-MM-DD'));
    //     const group_id = crypto.randomUUID();

    //     const inserts = dates.map((date) => ({ student_id: studentId, date, group_id }));
    //     const { error } = await supabase.from('ride_requests').insert(inserts);

    //     setSubmitting(false);

    //     if (error) toast.error('حدث خطأ أثناء الحجز');
    //     else {
    //         toast.success('تم إرسال الطلب بنجاح');
    //         setSelectedDays([]);
    //         setStartDate('');
    //         fetchRequests();
    //     }
    // };
    const handleSubmit = async () => {
        if (!startDate || selectedDays.length === 0) {
            toast.error('يرجى تحديد تاريخ وأيام الأسبوع');
            return;
        }

        // ✅ تحقق من أن التاريخ المحدد لا يسبق الغد
        const selectedDate = dayjs(startDate);
        const tomorrow = dayjs().add(1, 'day').startOf('day');

        if (selectedDate.isBefore(tomorrow)) {
            toast.error('لا يمكن الحجز بتاريخ قبل الغد');
            return;
        }

        setSubmitting(true);
        const studentId = user?.id;

        if (!studentId) {
            toast.error('فشل جلب معلومات الحساب');
            setSubmitting(false);
            return;
        }

        const start = getStartFriday(startDate);
        const dates = selectedDays.map((i) => start.add(i, 'day').format('YYYY-MM-DD'));
        const group_id = crypto.randomUUID();

        const inserts = dates.map((date) => ({ student_id: studentId, date, group_id }));
        const { error } = await supabase.from('ride_requests').insert(inserts);

        setSubmitting(false);

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
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold text-blue-600">طلب حجز أسبوعي</h1>
                <button
                    onClick={fetchRequests}
                    disabled={loadingreq}
                    className="flex items-center gap-1 text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition duration-200"
                >   <RotateCcw size={16} className={loadingreq ? 'animate-spin' : ''} />
                    {loadingreq ? 'جاري التحديث...' : 'تحديث'}
                </button>
            </div>

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
            <div className="bg-white p-4 rounded-xl shadow space-y-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    📅 اختر تاريخًا ضمن الأسبوع (من الجمعة إلى الخميس)
                </label>
                <input
                    type="date"
                    value={startDate}
                    min={dayjs().add(1, 'day').format('YYYY-MM-DD')} // هذا يمنع التواريخ قبل الغد
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />


                {startDate && (
                    <>
                        <p className="font-medium text-sm mt-2 text-gray-700">📌 اختر الأيام المطلوبة:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                            {weekdays.map((name, i) => {
                                const base = getStartFriday(startDate);
                                const date = base.add(i, 'day');
                                const selected = selectedDays.includes(i);
                                return (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => handleToggleDay(i)}
                                        className={`border rounded-lg p-3 text-sm text-center transition duration-200 ${selected
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-300'
                                            }`}
                                    >
                                        <div className="font-bold">{name}</div>
                                        <div className="text-xs mt-1">{date.format('YYYY-MM-DD')}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition duration-200"
                >
                    {submitting ? '⏳ جاري الإرسال...' : '🚀 إرسال الطلب'}
                </button>
            </div>


            {/* عرض الطلبات */}
            <div className="mt-10 space-y-6">
                {requests.length === 0 ? (
                    <div className="text-center text-gray-500 py-6 border rounded bg-white">
                        لا يوجد طلبات حالياً
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {requests.map((group) => (
                            <div
                                key={group.group_id}
                                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-2"
                            >
                                <div className="text-sm text-gray-600 font-medium flex items-center gap-2">
                                    🗓️ التواريخ المطلوبة:
                                </div>
                                <div className="text-sm text-gray-800 leading-relaxed">
                                    {group.dates
                                        .map((date) => {
                                            const d = dayjs(date);
                                            return `${d.format('dddd')} - ${d.format('YYYY/MM/DD')}`;
                                        })
                                        .join('، ')}
                                </div>

                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-2">
                                    <div className="text-sm font-medium">
                                        {group.status === 'approved' ? (
                                            <span className="inline-flex items-center gap-2 text-orange-600 font-semibold">
                                                ✅ مقبول
                                                <button
                                                    onClick={() => handleOpenTimingDialog(group.group_id)}
                                                    className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded transition"
                                                >
                                                    تحديد توقيت الذهاب والعودة
                                                </button>
                                            </span>
                                        ) : group.status === 'rejected' ? (
                                            <span className="text-red-500 font-semibold">❌ مرفوض</span>
                                        ) : (
                                            <span className="text-gray-500 font-semibold">⏳ قيد الانتظار</span>
                                        )}
                                    </div>

                                    <div className="text-xs text-gray-400 sm:text-right">
                                        📤 أُرسل في: {dayjs(group.created_at).format('YYYY-MM-DD HH:mm')}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Dialog التوقيت */}
                {timingGroup && (
                    <div
                        ref={timingRef}
                        className="bg-white border border-blue-200 rounded-lg p-4 shadow space-y-4">
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
