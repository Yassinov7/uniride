'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { Calendar, Clock, BusFront } from 'lucide-react';
import { useLoadingStore } from '@/store/loadingStore';

export default function ReturnRidePage() {
    const [booking, setBooking] = useState(null);
    const { setLoading } = useLoadingStore();
 
    useEffect(() => {
        fetchReturnRide();
    }, []);

    const fetchReturnRide = async () => {
        setLoading(true); // 🌀 إظهار الـ spinner

        try {
            const { data: userData } = await supabase.auth.getUser();
            const studentId = userData?.user?.id;

            if (!studentId) {
                toast.error('لم يتم التعرف على المستخدم');
                return;
            }

            const { data, error } = await supabase
                .from('ride_students')
                .select(`
                ride_id (
                    id,
                    date,
                    time,
                    route_type
                )
            `)
                .eq('student_id', studentId);

            if (error) {
                toast.error('فشل تحميل البيانات');
                return;
            }

            const now = dayjs();

            const returnRides = data
                .filter(r => r.ride_id?.route_type === 'return')
                .map(r => ({
                    ...r,
                    rideDateTime: dayjs(`${r.ride_id.date}T${r.ride_id.time}`)
                }))
                .filter(r => r.rideDateTime.isAfter(now.startOf('day')))
                .sort((a, b) => a.rideDateTime - b.rideDateTime);

            setBooking(returnRides[0] || null);
        } finally {
            setLoading(false); // ✅ إخفاء الـ spinner
        }
    };


    return (
        <div className="max-w-lg mx-auto mt-10 bg-white shadow rounded-lg p-6 space-y-4">
            <h1 className="text-xl font-bold text-blue-600 text-center">رحلة العودة القادمة</h1>

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
                        عودة
                    </div>
                </div>
            ) : (
                <p className="text-center text-gray-500">لا يوجد رحلة عودة محددة بعد. يرجى الانتظار...</p>
            )}
        </div>
    );
}
