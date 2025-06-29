'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CalendarDays, Bus, Clock, Repeat, SquareCheckBig } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import toast from 'react-hot-toast';

dayjs.locale('ar');

export default function CreateGoRidePage() {
    const [date, setDate] = useState('');
    const [students, setStudents] = useState([]);
    const [selected, setSelected] = useState([]);
    const [buses, setBuses] = useState([]);
    const [busId, setBusId] = useState('');
    const [time, setTime] = useState('07:30');
    const [repeat, setRepeat] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchBuses();
    }, []);

    const fetchBuses = async () => {
        const { data } = await supabase.from('buses').select('*');
        if (data) setBuses(data);
    };

    const fetchStudents = async () => {
        if (!date) return;

        // 1. جلب الطلبات المقبولة في هذا التاريخ
        const { data: requests } = await supabase
            .from('ride_requests')
            .select(`
      id, student_id, date,
      profiles (
        full_name, gender,
        universities(name),
        locations(name, fare)
      ),
      ride_request_timings(go_time)
    `)
            .eq('date', date)
            .eq('status', 'approved');

        if (!requests) return;

        // 2. جلب جميع ride_students
        const { data: allAssigned } = await supabase
            .from('ride_students')
            .select('student_id, ride_id');

        // 3. جلب الرحلات من نوع "go" في نفس التاريخ
        const { data: rides } = await supabase
            .from('rides')
            .select('id')
            .eq('date', date)
            .eq('route_type', 'go');

        const rideIdsForDate = new Set(rides?.map(r => r.id));
        const assigned = allAssigned?.filter(rs => rideIdsForDate.has(rs.ride_id));
        const assignedIds = new Set(assigned.map((s) => s.student_id));

        // 4. فلترة الطلاب غير المرتبطين برحلة go في نفس اليوم
        const filtered = requests.filter((r) => !assignedIds.has(r.student_id));

        // 5. ترتيب حسب الجامعة > الجنس > المنطقة > الوقت
        const sorted = filtered.sort((a, b) => {
            const uA = a.profiles.universities?.name || '';
            const uB = b.profiles.universities?.name || '';
            const gA = a.profiles.gender || '';
            const gB = b.profiles.gender || '';
            const lA = a.profiles.locations?.name || '';
            const lB = b.profiles.locations?.name || '';
            const tA = a.ride_request_timings?.go_time || '00:00';
            const tB = b.ride_request_timings?.go_time || '00:00';

            if (uA !== uB) return uA.localeCompare(uB);
            if (gA !== gB) return gA.localeCompare(gB);
            if (lA !== lB) return lA.localeCompare(lB);
            return tA.localeCompare(tB);
        });

        // 6. إزالة التكرار والإبقاء على من يملك go_time إن وجد
        const uniqueMap = new Map();

        for (const req of sorted) {
            const existing = uniqueMap.get(req.student_id);
            if (!existing || (!existing.ride_request_timings?.go_time && req.ride_request_timings?.go_time)) {
                uniqueMap.set(req.student_id, req);
            }
        }

        setStudents(Array.from(uniqueMap.values()));
    };




    const toggleStudent = (student_id) => {
        setSelected((prev) =>
            prev.includes(student_id)
                ? prev.filter((id) => id !== student_id)
                : [...prev, student_id]
        );
    };

    // const handleCreateRide = async () => {
    //     if (!date || !busId || !time || selected.length === 0) {
    //         toast.error('❌ يرجى تعبئة جميع الحقول واختيار الطلاب');
    //         return;
    //     }
    //     const {
    //         data: { user },
    //     } = await supabase.auth.getUser();

    //     setLoading(true);

    //     try {
    //         for (let i = 0; i < repeat; i++) {
    //             const rideDate = dayjs(date).add(i * 7, 'day').format('YYYY-MM-DD');

    //             const { data: ride } = await supabase
    //                 .from('rides')
    //                 .insert({
    //                     date: rideDate,
    //                     time,
    //                     bus_id: busId,
    //                     route_type: 'go',
    //                 })
    //                 .select()
    //                 .single();

    //             for (const student_id of selected) {
    //                 const studentData = students.find((s) => s.student_id === student_id);

    //                 const fare = studentData.profiles.locations.fare;

    //                 await supabase.from('ride_students').insert({ ride_id: ride.id, student_id });

    //                 await supabase.from('wallet_transactions').insert({
    //                     student_id,
    //                     amount: -fare,
    //                     description: 'أجرة رحلة ذهاب',
    //                     created_by: user.id,
    //                 });

    //                 // 2. جلب الرصيد الحالي
    //                 const { data: wallet } = await supabase
    //                     .from('wallets')
    //                     .select('balance')
    //                     .eq('student_id', student_id)
    //                     .single();

    //                 const currentBalance = wallet?.balance || 0;

    //                 // 3. تحديث الرصيد (حتى لو سالب)
    //                 await supabase
    //                     .from('wallets')
    //                     .update({ balance: currentBalance - fare })
    //                     .eq('student_id', student_id);
    //             }

    //         }

    //         toast.success('✅ تم إنشاء الرحلة بنجاح');
    //         setSelected([]);
    //     } catch (err) {
    //         console.error(err);
    //         toast.error('❌ حدث خطأ أثناء إنشاء الرحلة');
    //     } finally {
    //         setLoading(false);
    //     }
    // };
    const handleCreateRide = async () => {
        if (!date || !busId || !time || selected.length === 0) {
            toast.error('❌ يرجى تعبئة جميع الحقول واختيار الطلاب');
            return;
        }

        const {
            data: { user },
        } = await supabase.auth.getUser();

        setLoading(true);

        try {
            for (let i = 0; i < repeat; i++) {
                const rideDate = dayjs(date).add(i * 7, 'day').format('YYYY-MM-DD');

                const { data: ride } = await supabase
                    .from('rides')
                    .insert({
                        date: rideDate,
                        time,
                        bus_id: busId,
                        route_type: 'go',
                    })
                    .select()
                    .single();

                for (const student_id of selected) {
                    const studentData = students.find((s) => s.student_id === student_id);
                    const fare = studentData.profiles.locations.fare;

                    await supabase.from('ride_students').insert({ ride_id: ride.id, student_id });

                    await supabase.from('wallet_transactions').insert({
                        student_id,
                        amount: -fare,
                        description: 'أجرة رحلة ذهاب',
                        created_by: user.id,
                    });

                    const { data: wallet } = await supabase
                        .from('wallets')
                        .select('balance')
                        .eq('student_id', student_id)
                        .single();

                    const currentBalance = wallet?.balance || 0;

                    await supabase
                        .from('wallets')
                        .update({ balance: currentBalance - fare })
                        .eq('student_id', student_id);

                    // ✅ حذف الطلب بعد التوزيع
                    await supabase
                        .from('ride_requests')
                        .delete()
                        .eq('student_id', student_id)
                        .eq('date', rideDate);
                }
            }

            toast.success('✅ تم إنشاء الرحلة بنجاح');
            setSelected([]);
            fetchStudents(); // إعادة تحميل الطلبات بعد التوزيع
        } catch (err) {
            console.error(err);
            toast.error('❌ حدث خطأ أثناء إنشاء الرحلة');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 space-y-6 text-right" dir="rtl">
            <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
                <SquareCheckBig size={22} /> إنشاء رحلة ذهاب
            </h1>

            <div className="grid sm:grid-cols-4 gap-4">
                <div>
                    <label className="font-semibold text-blue-700 flex items-center gap-1"><CalendarDays size={16} /> التاريخ</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full border rounded p-2"
                    />
                </div>
                <div>
                    <label className="font-semibold text-blue-700 flex items-center gap-1"><Bus size={16} /> الباص</label>
                    <select
                        className="w-full border rounded p-2"
                        value={busId}
                        onChange={(e) => setBusId(e.target.value)}
                    >
                        <option value="">اختر باص</option>
                        {buses.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="font-semibold text-blue-700 flex items-center gap-1"><Clock size={16} /> الساعة</label>
                    <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full border rounded p-2"
                    />
                </div>
                <div>
                    <label className="font-semibold text-blue-700 flex items-center gap-1"><Repeat size={16} /> التكرار</label>
                    <select
                        className="w-full border rounded p-2"
                        value={repeat}
                        onChange={(e) => setRepeat(Number(e.target.value))}
                    >
                        {[1, 2, 3, 4].map((r) => (
                            <option key={r} value={r}>{r} أسبوع</option>
                        ))}
                    </select>
                </div>
            </div>

            <button
                onClick={fetchStudents}
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
            >
                عرض الطلبات في هذا اليوم
            </button>

            {/* جدول الطلاب */}
            {students.length > 0 && (
                <div className="overflow-x-auto border rounded mt-4">
                    <table className="min-w-full text-sm text-right">
                        <thead className="bg-blue-100 text-blue-800">
                            <tr>
                                <th className="p-2">الطالب</th>
                                <th className="p-2 hidden sm:table-cell">الجامعة</th>
                                <th className="p-2 hidden sm:table-cell">المنطقة</th>
                                <th className="p-2 hidden sm:table-cell">الجنس</th>
                                <th className="p-2">ساعة الذهاب</th>
                                <th className="p-2">اختيار</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((s) => (
                                <tr key={`${s.student_id}-${s.id}`} className="border-b hover:bg-blue-50">
                                    <td className="p-2 font-medium">{s.profiles.full_name}</td>
                                    <td className="p-2 hidden sm:table-cell">{s.profiles.universities?.name}</td>
                                    <td className="p-2 hidden sm:table-cell">{s.profiles.locations?.name}</td>
                                    <td className="p-2 hidden sm:table-cell">{s.profiles.gender === 'male' ? 'ذكر' : 'أنثى'}</td>
                                    <td className="p-2 text-xs">
                                        {s.ride_request_timings?.go_time || <span className="text-gray-400">غير محدد</span>}
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(s.student_id)}
                                            onChange={() => toggleStudent(s.student_id)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {students.length > 0 && (
                <button
                    onClick={handleCreateRide}
                    disabled={loading}
                    className="w-full sm:w-auto mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                    {loading ? 'جاري الإنشاء...' : 'إنشاء الرحلة'}
                </button>
            )}
        </div>
    );
}
