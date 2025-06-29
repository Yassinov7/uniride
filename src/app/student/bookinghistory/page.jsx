'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

export default function BookingHistoryPage() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        const { data: userData } = await supabase.auth.getUser();
        const studentId = userData?.user?.id;

        if (!studentId) {
            toast.error('لم يتم التعرف على المستخدم');
            return;
        }

        const { data, error } = await supabase
            .from('bookings')
            .select(`
                id, note,
                ride_id (
                    date, time, route_type
                )
            `)
            .eq('student_id', studentId)
            .order('ride_id.date', { ascending: false });

        if (error) {
            console.error(error);
            toast.error('فشل تحميل السجل');
        } else {
            const filtered = data.filter(b => b.ride_id?.date && b.ride_id?.time);
            setHistory(filtered);
        }

        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto mt-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-xl font-bold text-blue-600 text-center mb-6">سجل الرحلات</h1>

            {loading ? (
                <p className="text-center text-gray-500">جاري التحميل...</p>
            ) : history.length === 0 ? (
                <p className="text-center text-gray-500">لا يوجد سجل للرحلات حتى الآن.</p>
            ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow border">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr>
                                <th scope="col" className="px-4 py-3 whitespace-nowrap">التاريخ</th>
                                <th scope="col" className="px-4 py-3 whitespace-nowrap">الوقت</th>
                                <th scope="col" className="px-4 py-3 whitespace-nowrap">النوع</th>
                                {/* <th scope="col" className="px-4 py-3 whitespace-nowrap">ملاحظات</th> */}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100 text-center">
                            {history.map(b => (
                                <tr key={b.id}>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {dayjs(b.ride_id.date).format('YYYY-MM-DD')}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {dayjs(`${b.ride_id.date}T${b.ride_id.time}`).format('hh:mm A')}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {b.ride_id.route_type === 'go' ? 'ذهاب' : 'عودة'}
                                    </td>
                                    {/* <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                                        {b.note || '-'}
                                    </td> */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
