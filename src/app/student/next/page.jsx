'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, BusFront, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useNextBookingStore } from '@/store/useNextBookingStore';

export default function NextBookingPage() {
    const [refreshing, setRefreshing] = useState(false);
    const { user } = useUserStore();
    const {
        booking,
        allBookings,
        confirmed,
        setBooking,
        setAllBookings,
        setConfirmed,
        loaded,
        setLoaded,
    } = useNextBookingStore();

    const router = useRouter();

    useEffect(() => {
        if (!user?.id || loaded) return;
        fetchBooking();
    }, [user?.id, loaded]);


    const fetchBooking = async () => {
        setRefreshing(true);
        try {
            const studentId = user.id;

            const { data, error } = await supabase
                .from('ride_students')
                .select(`ride_id(id, date, time, route_type)`)
                .eq('student_id', studentId);

            if (error) return toast.error('فشل تحميل البيانات');

            const rides = data
                .filter((r) => r.ride_id?.date && r.ride_id?.time)
                .map((r) => ({
                    ...r,
                    rideDateTime: dayjs(`${r.ride_id.date}T${r.ride_id.time}`),
                }));

            const now = dayjs();
            const today = now.startOf('day');

            const futureRides = rides
                .filter((r) => {
                    const rideDate = r.rideDateTime.startOf('day');
                    if (rideDate.isSame(today)) {
                        return now.hour() < 18;
                    }
                    return rideDate.isAfter(today);
                })
                .sort((a, b) => a.rideDateTime - b.rideDateTime);

            const next = futureRides.find((r) => r.ride_id.route_type === 'go') || null;

            setBooking(next);
            setAllBookings(futureRides);
            setLoaded(true); // 🧠 إشارة بعدم الجلب مرة أخرى
            checkIfAlreadyConfirmed(studentId);
        } finally {
            setRefreshing(false);
        }
    };

    const checkIfAlreadyConfirmed = async (studentId) => {
        const today = dayjs().format('YYYY-MM-DD');

        const { data, error } = await supabase
            .from('return_candidates')
            .select('id')
            .eq('student_id', studentId)
            .eq('date', today);

        if (!error && data?.length > 0) {
            setConfirmed(true);
        }
    };

    const handleConfirm = async () => {
        const today = dayjs().format('YYYY-MM-DD');
        const studentId = user.id;

        const { data: existing, error: checkError } = await supabase
            .from('return_candidates')
            .select('id')
            .eq('student_id', studentId)
            .eq('date', today);

        if (checkError) {
            toast.error('حدث خطأ أثناء التحقق');
            return;
        }

        if (existing?.length > 0) {
            toast.success('تم تسجيل انتهاء الدوام مسبقًا');
            setConfirmed(true);
            return;
        }

        const { error } = await supabase
            .from('return_candidates')
            .insert({ student_id: studentId, date: today });

        if (error) {
            toast.error('حدث خطأ أثناء التأكيد');
        } else {
            toast.success('تم تسجيل انتهاء الدوام ✅');
            setConfirmed(true);
        }
    };

    const now = dayjs();
    const isToday = booking && dayjs(booking.ride_id.date).isSame(now, 'day');
    const isGo = booking?.ride_id.route_type === 'go';
    const showButton = isToday && isGo && now.hour() >= 8 && now.hour() < 18 && !confirmed;

    return (
        <div className="max-w-3xl mx-auto mb-60 mt-10 bg-white shadow rounded-lg p-6 space-y-6" dir="rtl">
            <div className="flex justify-between">
                <h1 className="text-xl font-bold text-blue-600 text-center">الحجز القادم</h1>
                <button
                    onClick={async () => {
                        setRefreshing(true);

                        // 🧼 إفراغ القيم القديمة
                        setBooking(null);
                        setAllBookings([]);
                        setConfirmed(false);
                        setLoaded(false); // 🧠 يسمح بإعادة الجلب

                        const toastId = toast.loading('جاري تحديث البيانات...');

                        try {
                            await fetchBooking();
                            toast.success('تم تحديث البيانات بنجاح');
                        } catch {
                            toast.error('حدث خطأ أثناء التحديث');
                        } finally {
                            toast.dismiss(toastId);
                            setRefreshing(false);
                        }
                    }}
                    disabled={refreshing}
                    className={`text-sm flex items-center gap-1 px-3 py-1 rounded ${refreshing
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'جاري التحديث...' : 'تحديث'}
                </button>
            </div>

            {booking ? (
                <div className="space-y-3 text-center">
                    <div className="flex justify-center gap-2 items-center text-gray-700">
                        <Calendar size={20} className="text-orange-500" />
                        {dayjs(booking.ride_id.date).format('dddd YYYY-MM-DD')}
                    </div>
                    <div className="flex justify-center gap-2 items-center text-gray-700">
                        <Clock size={20} className="text-orange-500" />
                        {dayjs(`${booking.ride_id.date}T${booking.ride_id.time}`).format('hh:mm A')}
                    </div>
                    <div className="flex justify-center gap-2 items-center text-gray-700">
                        <BusFront size={20} className="text-orange-500" />
                        {booking.ride_id.route_type === 'go' ? 'ذهاب' : 'عودة'}
                    </div>

                    {showButton && (
                        <button
                            onClick={handleConfirm}
                            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                        >
                            أنهيت دوامي ✅
                        </button>
                    )}

                    {confirmed && (
                        <div className="space-y-4">
                            <div className="flex justify-center gap-2 items-center text-green-600 font-semibold">
                                <CheckCircle size={20} />
                                تم تأكيد انتهاء الدوام (بانتظار رحلة العودة)
                            </div>
                            <button
                                onClick={() => router.push('/student/return')}
                                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                            >
                                <ArrowRight size={18} />
                                الانتقال إلى رحلة العودة
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-center text-gray-500">لا يوجد حجز قادم حالياً.</p>
            )}

            {/* جدول الرحلات القادمة */}
            <div className="mt-8">
                <h2 className="text-lg font-semibold mb-4 text-gray-700">الرحلات القادمة</h2>
                <div className="overflow-x-auto rounded shadow border">
                    <table className="min-w-full text-sm text-center">
                        <thead className="bg-gray-100 text-gray-600">
                            <tr>
                                <th className="px-4 py-2">التاريخ</th>
                                <th className="px-4 py-2">الوقت</th>
                                <th className="px-4 py-2">النوع</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allBookings.map((b, i) => (
                                <tr key={i} className="border-t">
                                    <td className="px-4 py-2">
                                        {dayjs(b.ride_id.date).format('dddd YYYY-MM-DD')}
                                    </td>
                                    <td className="px-4 py-2">
                                        {dayjs(`${b.ride_id.date}T${b.ride_id.time}`).format('hh:mm A')}
                                    </td>
                                    <td className="px-4 py-2">
                                        {b.ride_id.route_type === 'go' ? 'ذهاب' : 'عودة'}
                                    </td>
                                </tr>
                            ))}
                            {allBookings.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="text-gray-500 py-4">
                                        لا توجد رحلات حالياً.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
