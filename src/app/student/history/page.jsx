'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Bus, Clock, CalendarDays, RefreshCw } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import { useLoadingStore } from '@/store/loadingStore';
import { useUserStore } from '@/store/userStore';
import { useStudentRidesHistoryStore } from '@/store/useStudentRidesHistory';
dayjs.locale('ar');

export default function StudentRidesPage() {

    const { setLoading } = useLoadingStore();
    const { user } = useUserStore();
    const { rides, setRides } = useStudentRidesHistoryStore();
    useEffect(() => {
        if (rides.length > 0) return;
        fetchRides();
    }, []);

    const fetchRides = async () => {
        if (!user || !user.id) return; // تأكيد إضافي
        setLoading(true);
        try {
            const { data } = await supabase
                .from('ride_students')
                .select(`
                ride:ride_id (
                    date,
                    time,
                    route_type,
                    buses(name)
                )
            `)
                .eq('student_id', user.id);

            if (!data) return;

            const sorted = data
                .map((r) => ({
                    ...r.ride,
                    datetime: dayjs(`${r.ride.date} ${r.ride.time}`),
                }))
                .sort((a, b) => b.datetime - a.datetime);

            setRides(sorted);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="max-w-4xl mx-auto p-4 mb-60 space-y-6 text-right" dir="rtl">
            <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
                <RefreshCw size={20} /> سجل رحلاتي
            </h1>

            {rides.length === 0 ? (
                <p className="text-center text-gray-600 mt-6">لا يوجد رحلات حتى الآن.</p>
            ) : (
                <div className="overflow-x-auto border rounded">
                    <table className="min-w-full text-sm text-right">
                        <thead className="bg-blue-100 text-blue-800">
                            <tr>
                                <th className="p-2">التاريخ</th>
                                <th className="p-2 hidden sm:table-cell">الساعة</th>
                                <th className="p-2 hidden sm:table-cell">نوع الرحلة</th>
                                <th className="p-2">الباص</th>
                                <th className="p-2">الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rides.map((ride, idx) => {
                                const now = dayjs();
                                const rideDateTime = ride.datetime;
                                const status = rideDateTime.isAfter(now) ? 'قادمة' : 'منتهية';

                                return (
                                    <tr key={idx} className="border-b hover:bg-blue-50">
                                        <td className="p-2 font-medium">
                                            {dayjs(ride.date).format('dddd - YYYY/MM/DD')}
                                        </td>
                                        <td className="p-2 hidden sm:table-cell">{ride.time}</td>
                                        <td className="p-2 hidden sm:table-cell">
                                            {ride.route_type === 'go' ? 'ذهاب' : 'عودة'}
                                        </td>
                                        <td className="p-2">{ride.buses?.name || '—'}</td>
                                        <td className="p-2">
                                            <span
                                                className={
                                                    status === 'قادمة'
                                                        ? 'text-green-600 font-semibold'
                                                        : 'text-gray-500'
                                                }
                                            >
                                                {status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
