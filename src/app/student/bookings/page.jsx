'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { Calendar, Clock, BusFront, CheckCircle } from 'lucide-react';

export default function NextBookingPage() {
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [allBookings, setAllBookings] = useState([]);

    useEffect(() => {
        fetchBooking();
    }, []);

    const fetchBooking = async () => {
        const { data: userData } = await supabase.auth.getUser();
        const studentId = userData?.user?.id;

        if (!studentId) {
            toast.error('لم يتم التعرف على المستخدم');
            return;
        }

        const { data, error } = await supabase
            .from('bookings')
            .select(`
        id, week, status, confirmed_return, note,
        ride_id (
          id, date, time, route_type
        )
      `)
            .eq('student_id', studentId);

        if (error) {
            toast.error('فشل تحميل الحجز');
            return;
        }

        const withDateTime = data.filter(r => r.ride_id?.date && r.ride_id?.time);
        const ridesWithDateTime = withDateTime.map(r => ({
            ...r,
            rideDateTime: dayjs(`${r.ride_id.date}T${r.ride_id.time}`),
        }));

        const now = dayjs();
        const after6PM = now.hour() >= 18;

        const filtered = ridesWithDateTime
            .filter(r => {
                if (after6PM) {
                    return r.rideDateTime.isAfter(now.add(1, 'day').startOf('day'));
                }
                return r.rideDateTime.isAfter(now);
            })
            .sort((a, b) => a.rideDateTime - b.rideDateTime);

        const next = filtered[0] || null;
        setBooking(next);
        setAllBookings(filtered); // يشمل الحجز القادم
        setLoading(false);
    };

    const handleConfirm = async () => {
        if (!booking?.id) return;

        const { error } = await supabase
            .from('bookings')
            .update({ confirmed_return: true })
            .eq('id', booking.id);

        if (error) {
            toast.error('حدث خطأ أثناء التحديث');
        } else {
            toast.success('تم تأكيد انتهاء الدوام');
            setBooking(prev => ({ ...prev, confirmed_return: true }));
        }
    };

    const now = dayjs();
    // const isToday = booking && dayjs(booking.ride_id.date).isSame(now, 'day');
    const after8AM = now.hour() >= 2;
    const showButton =
        booking &&
        booking.ride_id.route_type === 'go' &&
        // isToday &&
        after8AM &&
        !booking.confirmed_return;

    return (
        <div className="max-w-3xl mx-auto mt-10 bg-white shadow rounded-lg p-6 space-y-6">
            <h1 className="text-xl font-bold text-blue-600 text-center">الحجز القادم</h1>

            {loading ? (
                <p className="text-center text-gray-500">جاري التحميل...</p>
            ) : booking ? (
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

                    {booking.confirmed_return && (
                        <div className="flex justify-center gap-2 items-center text-green-600 font-semibold">
                            <CheckCircle size={20} />
                            تم تأكيد انتهاء الدوام
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-center text-gray-500">لا يوجد حجز قادم حالياً.</p>
            )}

            {/* جدول الحجوزات القادمة */}
            <div className="mt-8">
                <h2 className="text-lg font-semibold mb-4 text-gray-700">حجوزات الشهر القادم</h2>
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
                            {allBookings.map(b => (
                                <tr key={b.id} className="border-t">
                                    <td className="px-4 py-2">{dayjs(b.ride_id.date).format('dddd YYYY-MM-DD')}</td>
                                    <td className="px-4 py-2">
                                        {dayjs(`${b.ride_id.date}T${b.ride_id.time}`).format('hh:mm A')}
                                    </td>
                                    <td className="px-4 py-2">{b.ride_id.route_type === 'go' ? 'ذهاب' : 'عودة'}</td>
                                </tr>
                            ))}
                            {allBookings.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="text-gray-500 py-4">
                                        لا توجد حجوزات حالياً.
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
