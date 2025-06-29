'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CalendarDays, Clock, ArrowRightLeft, CheckCircle } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import toast from 'react-hot-toast';

dayjs.locale('ar');

export default function UpcomingGoRide() {
    const [ride, setRide] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUpcomingRide();
    }, []);

    const fetchUpcomingRide = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        const { data } = await supabase
            .from('ride_students')
            .select(`
        ride:ride_id (
          id, date, time, route_type
        )
      `)
            .eq('student_id', user.id);

        if (!data) return setLoading(false);

        const upcoming = data
            .map((r) => r.ride)
            .filter((r) => r.route_type === 'go' && dayjs(`${r.date} ${r.time}`).isAfter(dayjs()))
            .sort((a, b) => dayjs(`${a.date} ${a.time}`).diff(dayjs(`${b.date} ${b.time}`)));

        setRide(upcoming[0]);
        setLoading(false);
    };

    const handleFinishDay = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        const { error } = await supabase.from('return_candidates').insert({
            student_id: user.id,
            date: ride.date,
        });

        if (error) {
            toast.error('❌ حدث خطأ أثناء إنهاء الدوام');
        } else {
            toast.success('✅ تم تسجيل انتهاء الدوام بنجاح');
            setRide(null); // إخفاء الزر بعد الإضافة
        }
    };

    const isToday = ride && dayjs(ride.date).isSame(dayjs(), 'day');
    const after8am = dayjs().isAfter(dayjs().hour(8).minute(0));

    return (
        <div className="max-w-xl mx-auto p-4 text-right space-y-6" dir="rtl">
            <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
                <ArrowRightLeft size={22} /> الحجز القادم (ذهاب)
            </h1>

            {loading ? (
                <p>جاري التحميل...</p>
            ) : ride ? (
                <div className="border rounded p-4 bg-blue-50 space-y-2">
                    <p className="flex items-center gap-2 text-blue-700">
                        <CalendarDays size={16} /> {dayjs(ride.date).format('dddd، D MMMM YYYY')}
                    </p>
                    <p className="flex items-center gap-2 text-blue-700">
                        <Clock size={16} /> {ride.time}
                    </p>

                    {isToday && after8am && (
                        <button
                            onClick={handleFinishDay}
                            className="mt-4 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 flex items-center gap-2"
                        >
                            <CheckCircle size={18} /> أنهيت دوامي
                        </button>
                    )}
                </div>
            ) : (
                <p className="text-gray-500">لا يوجد حجز قادم.</p>
            )}
        </div>
    );
}
