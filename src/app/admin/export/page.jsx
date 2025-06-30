'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import { Download, CalendarDays, ListTree } from 'lucide-react';
import * as XLSX from 'xlsx'; // <-- إضافة هنا

dayjs.locale('ar');

export default function ExportRidesPage() {
    const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [routeType, setRouteType] = useState('go');
    const [rides, setRides] = useState([]);

    useEffect(() => {
        fetchRides();
    }, [date, routeType]);

    const fetchRides = async () => {
        const { data: ridesData } = await supabase
            .from('rides')
            .select('id, date, time, route_type, buses(name)')
            .eq('date', date)
            .eq('route_type', routeType);

        const ridesWithStudents = await Promise.all(
            (ridesData || []).map(async (ride) => {
                const { data: students } = await supabase
                    .from('ride_students')
                    .select('profiles(full_name)')
                    .eq('ride_id', ride.id);

                return {
                    ...ride,
                    ride_students: students || [],
                };
            })
        );

        setRides(ridesWithStudents);
    };


    // const exportExcel = (ride) => {
    //     const students = ride.ride_students.map(s => s.profiles?.full_name || '').join('، ');
    //     const data = [{
    //         'نوع الرحلة': ride.route_type === 'go' ? 'ذهاب' : 'عودة',
    //         'التاريخ': ride.date,
    //         'الساعة': ride.time,
    //         'اسم الباص': ride.buses?.name || '',
    //         'أسماء الطلاب': students,
    //     }];

    //     const worksheet = XLSX.utils.json_to_sheet(data);
    //     const workbook = XLSX.utils.book_new();
    //     XLSX.utils.book_append_sheet(workbook, worksheet, 'الرحلة');

    //     XLSX.writeFile(workbook, `ride-${ride.route_type}-${ride.date}.xlsx`);
    // };
    // const exportExcel = (ride) => {
    //     console.log('ride_students:', ride.ride_students);

    //     const studentNames = ride.ride_students.map((s) => [s.profiles?.full_name || '']);

    //     // معلومات الرحلة في صف مستقل
    //     const rideInfoRow = [
    //         `نوع الرحلة: ${ride.route_type === 'go' ? 'ذهاب' : 'عودة'}`,
    //         `التاريخ: ${ride.date}`,
    //         `الساعة: ${ride.time}`,
    //         `اسم الباص: ${ride.buses?.name || ''}`
    //     ];

    //     // تركيب الورقة: كل اسم في صف مستقل، ثم صف الرحلة
    //     const sheetData = [
    //         ['أسماء الطلاب'],
    //         ...studentNames,
    //         [],
    //         rideInfoRow
    //     ];

    //     const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    //     const workbook = XLSX.utils.book_new();
    //     XLSX.utils.book_append_sheet(workbook, worksheet, 'الرحلة');
    //     XLSX.writeFile(workbook, `ride-${ride.route_type}-${ride.date}.xlsx`);
    // };
    const exportExcel = (ride) => {
    const rideInfoRow = [
        `نوع الرحلة: ${ride.route_type === 'go' ? 'ذهاب' : 'عودة'}`,
        `التاريخ: ${ride.date}`,
        `الساعة: ${ride.time}`,
        `اسم الباص: ${ride.buses?.name || ''}`
    ];

    const studentNames = ride.ride_students
        .filter(s => s?.profiles?.full_name)
        .map((s) => [s.profiles.full_name]);

    const sheetData = [
        rideInfoRow,
        [],
        ['أسماء الطلاب'],
        ...studentNames
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'الرحلة');
    XLSX.writeFile(workbook, `ride-${ride.route_type}-${ride.date}.xlsx`);
};

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6 text-right" dir="rtl">
            <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
                <ListTree size={22} /> تصدير قوائم الرحلات
            </h1>

            <div className="grid sm:grid-cols-3 gap-4">
                <div>
                    <label className="text-sm font-medium text-blue-700 flex items-center gap-1"><CalendarDays size={16} /> التاريخ</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full border rounded p-2"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-blue-700">نوع الرحلة</label>
                    <select
                        value={routeType}
                        onChange={(e) => setRouteType(e.target.value)}
                        className="w-full border rounded p-2"
                    >
                        <option value="go">ذهاب</option>
                        <option value="return">عودة</option>
                    </select>
                </div>
            </div>

            {rides.length === 0 ? (
                <p className="text-center text-gray-500 mt-6">لا توجد رحلات في هذا اليوم</p>
            ) : (
                <div className="space-y-4 mt-4">
                    {rides.map((ride) => (
                        <div key={ride.id} className="border rounded p-4 shadow-sm space-y-2">
                            <div className="text-sm text-gray-700">التاريخ: {ride.date}</div>
                            <div className="text-sm text-gray-700">الساعة: {ride.time}</div>
                            <div className="text-sm text-gray-700">الباص: {ride.buses?.name}</div>
                            <div className="text-sm text-gray-700">الطلاب: {ride.ride_students.map(s => s.profiles?.full_name).join('، ')}</div>

                            <button
                                onClick={() => exportExcel(ride)}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                            >
                                <Download size={16} /> تصدير Excel
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
