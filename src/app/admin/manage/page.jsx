'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import 'dayjs/locale/ar';
import {
    Download, CalendarDays, Route, ListTree, X, PlusSquare, UserPlus, Plus,
    Clock10Icon, BusFront, Users, User, Trash2, Repeat, XCircle, MoveRight
} from 'lucide-react';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { useLoadingStore } from '@/store/loadingStore';


dayjs.locale('ar');

export default function RidesManagement() {
    const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [routeType, setRouteType] = useState('go');
    const [rides, setRides] = useState([]);
    const [selectedRide, setSelectedRide] = useState(null); // ← حالة الـ Modal
    const [studentToMove, setStudentToMove] = useState(null);
    const [availableRides, setAvailableRides] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [availableStudents, setAvailableStudents] = useState([]);
    const { setLoading } = useLoadingStore();


    useEffect(() => {
        fetchRides();
    }, [date, routeType]);

    const handleRemoveStudent = async (student) => {
        const result = await Swal.fire({
            title: 'تأكيد الحذف',
            html: `
      <p>هل تريد حذف <strong>${student.profiles?.full_name}</strong> من الرحلة؟</p>
      <div style="margin-top: 10px; text-align: right;">
        <input type="checkbox" id="refundCheckbox" />
        <label for="refundCheckbox">استرجاع الرصيد تلقائيًا للطالب</label>
      </div>
    `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'نعم، احذف',
            cancelButtonText: 'إلغاء',
            preConfirm: () => {
                const checkbox = document.getElementById('refundCheckbox');
                return checkbox?.checked;
            }
        });

        if (!result.isConfirmed) return;
        setLoading(true); // ← فقط بعد التأكيد
        const shouldRefund = result.value;

        try {
            // حذف الطالب
            const { error: removeError } = await supabase
                .from('ride_students')
                .delete()
                .eq('ride_id', selectedRide.id)
                .eq('student_id', student.student_id);

            if (removeError) {
                toast.error('❌ فشل في إزالة الطالب من الرحلة');
                return;
            }

            // تحديث حالة الطالب حسب نوع الرحلة
            if (selectedRide.route_type === 'go') {
                await supabase
                    .from('ride_requests')
                    .update({ status: 'approved' })
                    .eq('student_id', student.student_id)
                    .eq('date', selectedRide.date);
            } else {
                await supabase
                    .from('return_candidates')
                    .update({ assigned: false })
                    .eq('student_id', student.student_id)
                    .eq('date', selectedRide.date);
            }

            // استرداد الرصيد
            if (shouldRefund) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('location_id')
                    .eq('id', student.student_id)
                    .single();

                const { data: location } = await supabase
                    .from('locations')
                    .select('fare')
                    .eq('id', profile?.location_id)
                    .single();

                const fare = +location?.fare || 0;

                const { data: wallet } = await supabase
                    .from('wallets')
                    .select('balance')
                    .eq('student_id', student.student_id)
                    .single();

                if (wallet) {
                    await supabase
                        .from('wallets')
                        .update({ balance: wallet.balance + fare })
                        .eq('student_id', student.student_id);
                }

                await supabase.from('wallet_transactions').insert({
                    student_id: student.student_id,
                    amount: fare,
                    description: 'استرداد رصيد بعد الحذف من الرحلة',
                    created_by: user?.id,
                });
            }

            toast.success('✅ تم الحذف' + (shouldRefund ? ' مع استرداد الرصيد' : ''));
            fetchRides();
            setSelectedRide(null);
        } catch (err) {
            console.error(err);
            toast.error('❌ فشل غير متوقع أثناء الحذف');
        } finally {
            setLoading(false);
        }
    };
    const fetchAddableStudents = async () => {
        if (!selectedRide) return;

        const existingIds = selectedRide.ride_students.map(s => s.student_id);

        const getUniqueStudents = (data) => {
            const map = new Map();
            for (const s of data || []) {
                if (!map.has(s.student_id)) {
                    map.set(s.student_id, s);
                }
            }
            return Array.from(map.values()).filter(s => !existingIds.includes(s.student_id));
        };

        if (selectedRide.route_type === 'go') {
            const { data } = await supabase
                .from('ride_requests')
                .select('student_id, profiles(full_name)')
                .eq('date', selectedRide.date)
                .eq('status', 'approved');

            setAvailableStudents(getUniqueStudents(data));
        } else if (selectedRide.route_type === 'return') {
            const { data } = await supabase
                .from('return_candidates')
                .select('student_id, profiles(full_name)')
                .eq('date', selectedRide.date)
                .eq('assigned', false);

            setAvailableStudents(getUniqueStudents(data));
        }
    };


    const fetchAvailableRides = async () => {
        const { data: availableRides } = await supabase
            .from('rides')
            .select('id, time, date, buses(name)')
            .eq('date', selectedRide.date)
            .eq('route_type', selectedRide.route_type)
            .neq('id', selectedRide.id); // نستثني الرحلة الحالية

        setAvailableRides(availableRides || []);
    };

    const handleTransferStudent = async (toRideId) => {
        setLoading(true);
        // 1. إزالة الطالب من الرحلة الحالية
        await supabase
            .from('ride_students')
            .delete()
            .eq('ride_id', selectedRide.id)
            .eq('student_id', studentToMove.student_id);

        // 2. إضافته إلى الرحلة الجديدة
        await supabase
            .from('ride_students')
            .insert({ ride_id: toRideId, student_id: studentToMove.student_id });


        setLoading(false);
        toast.success('✅ تم نقل الطالب بنجاح');
        fetchRides();
        setSelectedRide(null);
        setStudentToMove(null); // ← يغلق نافذة النقل بعد نجاح النقل
    };

    const fetchRides = async () => {
        setLoading(true);

        const { data: ridesData } = await supabase
            .from('rides')
            .select('id, date, time, route_type, buses(name)')
            .eq('date', date)
            .eq('route_type', routeType);

        const ridesWithStudents = await Promise.all(
            (ridesData || []).map(async (ride) => {
                const { data: students } = await supabase
                    .from('ride_students')
                    .select('student_id, profiles(full_name)')
                    .eq('ride_id', ride.id);

                return {
                    ...ride,
                    ride_students: students || [],
                };
            })
        );

        setRides(ridesWithStudents);
        setLoading(false);
    };


    const handleAddStudentToRide = async (studentId) => {
        setLoading(true);
        try {
            await supabase.from('ride_students').insert({
                ride_id: selectedRide.id,
                student_id: studentId,
            });

            if (selectedRide.route_type === 'go') {
                await supabase
                    .from('ride_requests')
                    .update({ status: 'assigned' })
                    .eq('student_id', studentId)
                    .eq('date', selectedRide.date);
            } else {
                await supabase
                    .from('return_candidates')
                    .update({ assigned: true })
                    .eq('student_id', studentId)
                    .eq('date', selectedRide.date);
            }

            toast.success('✅ تم إضافة الطالب');
            fetchRides();
            setShowAddModal(false);
        } catch (err) {
            console.error(err);
            toast.error('❌ حدث خطأ أثناء الإضافة');
        } finally {
            setLoading(false);
        }
    };


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
                <ListTree size={22} /> إدارة قوائم الرحلات
            </h1>

            <div className="grid sm:grid-cols-3 gap-4 bg-white p-5 rounded-xl shadow border border-orange-500">
                <div>
                    <label className="text-sm font-medium text-blue-700 flex items-center gap-2 mb-1">
                        <CalendarDays size={18} /> التاريخ
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full border border-blue-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-blue-700 flex items-center gap-2 mb-1">
                        <Route size={18} /> نوع الرحلة
                    </label>
                    <select
                        value={routeType}
                        onChange={(e) => setRouteType(e.target.value)}
                        className="w-full border border-blue-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
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
                        <div
                            key={ride.id}
                            onClick={() => setSelectedRide(ride)}
                            className="bg-white border border-orange-400 rounded-xl p-4 shadow hover:bg-orange-50 cursor-pointer transition space-y-2"
                        >
                            <div className="flex items-center gap-2 text-sm text-blue-700">
                                <CalendarDays size={16} /> <span>التاريخ: {ride.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-blue-700">
                                <Clock10Icon size={16} /> <span>الساعة: {ride.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-blue-700">
                                <BusFront size={16} /> <span>الباص: {ride.buses?.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-blue-700">
                                <Users size={16} /> <span>عدد الطلاب: {ride.ride_students.length}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}


            {selectedRide && (
                <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
                    <div className="bg-white rounded-xl w-full max-w-lg p-6 relative text-right border-2 border-orange-300 shadow-lg">

                        {/* زر الإغلاق */}
                        <button
                            className="absolute top-3 left-3 text-gray-400 hover:text-red-500 transition"
                            onClick={() => setSelectedRide(null)}
                        >
                            <X size={22} />
                        </button>

                        {/* العنوان */}
                        <h2 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
                            <Route size={20} /> تفاصيل الرحلة
                        </h2>

                        {/* المعلومات الأساسية */}
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-gray-700 mb-4">
                            <p className="flex items-center gap-2">
                                <CalendarDays size={16} className="text-orange-500" /> التاريخ: {selectedRide.date}
                            </p>
                            <p className="flex items-center gap-2">
                                <Clock10Icon size={16} className="text-orange-500" /> الساعة: {selectedRide.time}
                            </p>
                            <p className="flex items-center gap-2">
                                <BusFront size={16} className="text-orange-500" /> الباص: {selectedRide.buses?.name}
                            </p>
                            <p className="flex items-center gap-2">
                                <Route size={16} className="text-orange-500" /> نوع الرحلة: {selectedRide.route_type === 'go' ? 'ذهاب' : 'عودة'}
                            </p>
                            <p className="flex items-center gap-2 col-span-2">
                                <Users size={16} className="text-orange-500" /> عدد الطلاب: {selectedRide.ride_students.length}
                            </p>
                        </div>

                        {/* قائمة الطلاب */}
                        <div className="mt-4">
                            <strong className="block mb-2 text-blue-700">الطلاب:</strong>
                            <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700 max-h-72 overflow-y-auto pr-1">
                                {selectedRide.ride_students.map((s, idx) => {
                                    const isFemale = s.profiles?.gender === 'female';
                                    return (
                                        <li key={idx} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded shadow-sm">
                                            <span className="flex items-center gap-2 text-gray-800 font-medium">
                                                <User size={16} className={isFemale ? 'text-pink-500' : 'text-blue-600'} />
                                                {s.profiles?.full_name}
                                            </span>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={async () => {
                                                        setStudentToMove(s);
                                                        await fetchAvailableRides();
                                                    }}
                                                    className="flex items-center gap-1 bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1 rounded text-xs font-medium transition"
                                                >
                                                    <Repeat size={14} /> نقل
                                                </button>

                                                <button
                                                    onClick={() => handleRemoveStudent(s)}
                                                    className="flex items-center gap-1 bg-red-100 text-red-700 hover:bg-red-200 px-2 py-1 rounded text-xs font-medium transition"
                                                >
                                                    <Trash2 size={14} /> حذف
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ol>
                        </div>


                        {/* الأزرار */}
                        <div className="mt-6 flex flex-col sm:flex-row sm:justify-between gap-3">
                            <button
                                onClick={() => {
                                    setShowAddModal(true);
                                    fetchAddableStudents();
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2 justify-center"
                            >
                                <PlusSquare size={16} /> إضافة طالب
                            </button>
                            <button
                                onClick={() => exportExcel(selectedRide)}
                                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 flex items-center gap-2 justify-center"
                            >
                                <Download size={16} /> تصدير Excel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {studentToMove && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-5 text-right shadow-xl">
                        <h2 className="text-lg font-bold text-blue-700 flex items-center gap-2">
                            <MoveRight size={20} /> اختر الرحلة الجديدة لـ {studentToMove.profiles?.full_name}
                        </h2>

                        <ul className="space-y-3 max-h-72 overflow-y-auto">
                            {availableRides.length === 0 ? (
                                <p className="text-sm text-gray-500">لا توجد رحلات متاحة لهذا التاريخ</p>
                            ) : (
                                availableRides.map((ride) => (
                                    <li key={ride.id} className="flex justify-between items-center bg-gray-50 border rounded px-3 py-2">
                                        <span className="text-sm font-medium text-gray-800">
                                            {ride.time} - {ride.buses?.name}
                                        </span>
                                        <button
                                            onClick={() => handleTransferStudent(ride.id)}
                                            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition"
                                        >
                                            <MoveRight size={14} /> نقل إلى هنا
                                        </button>
                                    </li>
                                ))
                            )}
                        </ul>

                        <button
                            onClick={() => setStudentToMove(null)}
                            className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition"
                        >
                            <XCircle size={16} /> إلغاء
                        </button>
                    </div>
                </div>
            )}

            {showAddModal && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-5 text-right shadow-xl">
                        <h2 className="text-lg font-bold text-blue-700 flex items-center gap-2">
                            <UserPlus size={20} /> اختر الطالب لإضافته
                        </h2>

                        <ul className="space-y-3 max-h-72 overflow-y-auto">
                            {availableStudents.length === 0 ? (
                                <p className="text-sm text-gray-500">لا يوجد طلاب متاحين للإضافة</p>
                            ) : (
                                availableStudents.map((student) => (
                                    <li
                                        key={student.student_id}
                                        className="flex justify-between items-center bg-gray-50 border rounded px-3 py-2"
                                    >
                                        <span className="text-sm font-medium text-gray-800">
                                            {student.profiles?.full_name}
                                        </span>
                                        <button
                                            onClick={() => handleAddStudentToRide(student.student_id)}
                                            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition"
                                        >
                                            <Plus size={14} /> إضافة
                                        </button>
                                    </li>
                                ))
                            )}
                        </ul>

                        <button
                            onClick={() => setShowAddModal(false)}
                            className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition"
                        >
                            <XCircle size={16} /> إلغاء
                        </button>
                    </div>
                </div>
            )}


        </div>
    );
}
