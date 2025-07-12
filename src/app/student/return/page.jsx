'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { Calendar, Clock, BusFront, RotateCcw } from 'lucide-react';
import { useUserStore } from '@/store/userStore';

export default function ReturnRidePage() {
    const [booking, setBooking] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const { user } = useUserStore();

    useEffect(() => {
        if (!user?.id || loaded) return;
        fetchReturnRide();
    }, [user, loaded]);

    const fetchReturnRide = async () => {
        setRefreshing(true);
        try {
            const studentId = user?.id;
            if (!studentId) {
                toast.error('لم يتم التعرف على المستخدم');
                return;
            }

            const { data, error } = await supabase
                .from('ride_students')
                .select('ride_id(id, date, time, route_type)')
                .eq('student_id', studentId);

            if (error) {
                toast.error('فشل تحميل البيانات');
                return;
            }

            const now = dayjs();

            const returnRides = (data || [])
                .filter(r => r.ride_id?.route_type === 'return')
                .map(r => ({
                    ...r,
                    rideDateTime: dayjs(`${r.ride_id.date}T${r.ride_id.time}`),
                }))
                .filter(r => r.rideDateTime.isAfter(now.startOf('day')))
                .sort((a, b) => a.rideDateTime - b.rideDateTime);

            setBooking(returnRides[0] || null);
            setLoaded(true);
        } finally {
            setRefreshing(false)
        }
    };

    return (
        <div className="max-w-lg mx-auto mt-10 mb-60 bg-white shadow rounded-lg p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold text-blue-600">رحلة العودة القادمة</h1>
                <button
                    onClick={() => {
                        setLoaded(false);
                        fetchReturnRide();
                    }}
                    className="flex items-center gap-1 text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition duration-200"
                >
                    <RotateCcw size={16} className={refreshing ? 'animate-spin' : ''} />
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
                        عودة
                    </div>
                </div>
            ) : (
                <p className="text-center text-gray-500">لا يوجد رحلة عودة محددة بعد. يرجى الانتظار...</p>
            )}
        </div>
    );
}
