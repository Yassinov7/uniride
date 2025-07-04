'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Bus, Clock, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';

dayjs.locale('ar');

export default function CreateReturnRidePage() {
    const [date, setDate] = useState('');
    const [students, setStudents] = useState([]);
    const [selected, setSelected] = useState([]);
    const [buses, setBuses] = useState([]);
    const [busId, setBusId] = useState('');
    const [time, setTime] = useState('13:30');
    const [loading, setLoading] = useState(false);

    // تعيين تاريخ اليوم تلقائيًا
    useEffect(() => {
        const today = dayjs().format('YYYY-MM-DD');
        setDate(today);
    }, []);

    // جلب الباصات مرة واحدة
    // useEffect(() => {
    //     const fetchBuses = async () => {
    //         const { data } = await supabase.from('buses').select('*');
    //         if (data) setBuses(data);
    //     };
    //     fetchBuses();
    // }, []);
    useEffect(() => {
        const fetchBuses = async () => {
            const { data: allBuses } = await supabase.from('buses').select('*');
            if (!allBuses || !date) return;

            const { data: usedRides } = await supabase
                .from('rides')
                .select('bus_id')
                .eq('date', date)
                .eq('route_type', 'return');

            const unavailableIds = new Set(usedRides?.map(r => r.bus_id) || []);

            const busesWithStatus = allBuses.map((b) => ({
                ...b,
                isUnavailable: unavailableIds.has(b.id),
            }));

            setBuses(busesWithStatus);
        };

        fetchBuses();
    }, [date]);

    // جلب الطلاب بمجرد تعيين التاريخ
    useEffect(() => {
        if (date) fetchCandidates();
    }, [date]);

    const fetchCandidates = async () => {
        const { data } = await supabase
            .from('return_candidates')
            .select(`
        student_id,
        profiles (
          full_name,
          gender,
          universities(name),
          locations(name)
        )
      `)
            .eq('date', date)
            .eq('assigned', false);

        setStudents(data || []);
    };

    const toggleStudent = (student_id) => {
        setSelected((prev) =>
            prev.includes(student_id)
                ? prev.filter((id) => id !== student_id)
                : [...prev, student_id]
        );
    };

    const handleCreateReturnRide = async () => {
        if (!date || !busId || !time || selected.length === 0) {
            toast.error('❌ يرجى تعبئة جميع الحقول واختيار الطلاب');
            return;
        }

        setLoading(true);
        try {
            const { data: ride } = await supabase
                .from('rides')
                .insert({
                    date,
                    time,
                    bus_id: busId,
                    route_type: 'return',
                })
                .select()
                .single();

            await supabase.from('ride_students').insert(
                selected.map((student_id) => ({
                    ride_id: ride.id,
                    student_id,
                }))
            );

            await supabase
                .from('return_candidates')
                .update({ assigned: true })
                .in('student_id', selected)
                .eq('date', date);


            toast.success('✅ تم إنشاء رحلة العودة بنجاح');
            setSelected([]);
            fetchCandidates();
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
                <Share2 size={22} /> توزيع طلاب رحلة العودة - {dayjs(date).format('dddd - YYYY/MM/DD')}
            </h1>

            <div className="grid sm:grid-cols-3 gap-4">
                <div>
                    <label className="text-blue-700 font-semibold flex items-center gap-1"><Bus size={16} /> الباص</label>
                    {/* <select
                        className="w-full border rounded p-2"
                        value={busId}
                        onChange={(e) => setBusId(e.target.value)}
                    >
                        <option value="">اختر باص</option>
                        {buses.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select> */}
                    <select
                        className="w-full border rounded p-2"
                        value={busId}
                        onChange={(e) => setBusId(e.target.value)}
                    >
                        <option value="">اختر باص</option>
                        {buses.map((b) => (
                            <option
                                key={b.id}
                                value={b.isUnavailable ? '' : b.id}
                                disabled={b.isUnavailable}
                                className={b.isUnavailable ? 'line-through text-gray-400' : ''}
                            >
                                {b.name} {b.isUnavailable ? ' (غير متاح)' : ''}
                            </option>
                        ))}
                    </select>

                </div>
                <div>
                    <label className="text-blue-700 font-semibold flex items-center gap-1"><Clock size={16} /> الساعة</label>
                    <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full border rounded p-2"
                    />
                </div>
            </div>

            {students.length > 0 ? (
                <div className="overflow-x-auto border rounded mt-4">
                    <table className="min-w-full text-sm text-right">
                        <thead className="bg-blue-100 text-blue-800">
                            <tr>
                                <th className="p-2">الطالب</th>
                                <th className="p-2 hidden sm:table-cell">الجامعة</th>
                                <th className="p-2 hidden sm:table-cell">المنطقة</th>
                                <th className="p-2 hidden sm:table-cell">الجنس</th>
                                <th className="p-2">اختيار</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((s) => (
                                <tr key={s.student_id} className="border-b hover:bg-blue-50">
                                    <td className="p-2 font-medium">{s.profiles.full_name}</td>
                                    <td className="p-2 hidden sm:table-cell">{s.profiles.universities?.name}</td>
                                    <td className="p-2 hidden sm:table-cell">{s.profiles.locations?.name}</td>
                                    <td className="p-2 hidden sm:table-cell">{s.profiles.gender === 'male' ? 'ذكر' : 'أنثى'}</td>
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
            ) : (
                <p className="text-center text-gray-600 mt-6">لا يوجد طلاب لإنشاء رحلة عودة اليوم</p>
            )}

            {students.length > 0 && (
                <button
                    onClick={handleCreateReturnRide}
                    disabled={loading}
                    className="w-full sm:w-auto mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                    {loading ? 'جاري الإنشاء...' : 'إنشاء رحلة العودة'}
                </button>
            )}
        </div>
    );
}
