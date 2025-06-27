'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { PlusCircle, X } from 'lucide-react';

const allDays = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

export default function UniversitiesPage() {
    const [universities, setUniversities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    // add form
    const [name, setName] = useState('');
    const [days, setDays] = useState([]);

    // edit modal
    const [editingUniv, setEditingUniv] = useState(null);
    const [editName, setEditName] = useState('');
    const [editDays, setEditDays] = useState([]);

    const fetchUniversities = async () => {
        const { data, error } = await supabase
            .from('universities')
            .select('*')
            .order('id', { ascending: true });

        if (!error) {
            setUniversities(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUniversities();
    }, []);

    const handleAdd = async () => {
        if (!name || days.length === 0) {
            toast.error('يرجى إدخال اسم الجامعة واختيار أيام الدوام');
            return;
        }

        const { error } = await supabase.from('universities').insert({
            name,
            working_days: days,
        });

        if (error) {
            toast.error('فشل في الإضافة');
        } else {
            toast.success('تمت الإضافة بنجاح');
            setName('');
            setDays([]);
            fetchUniversities();
        }
    };

    const handleDelete = async (id) => {
        const { error } = await supabase.from('universities').delete().eq('id', id);
        if (error) {
            toast.error('فشل في الحذف');
        } else {
            toast.success('تم الحذف بنجاح');
            fetchUniversities();
        }
    };


    const toggleDay = (day, setter, state) => {
        setter(state.includes(day) ? state.filter((d) => d !== day) : [...state, day]);
    };

    const openEditModal = (univ) => {
        setEditingUniv(univ);
        setEditName(univ.name);
        setEditDays(univ.working_days || []);
    };

    const handleUpdate = async () => {
        if (!editName || editDays.length === 0) {
            toast.error('يرجى تعبئة جميع الحقول');
            return;
        }

        const { error } = await supabase
            .from('universities')
            .update({ name: editName, working_days: editDays })
            .eq('id', editingUniv.id);

        if (error) {
            toast.error('فشل التحديث');
        } else {
            toast.success('تم التحديث بنجاح');
            setEditingUniv(null);
            fetchUniversities();
        }
    };

    return (
        <div>
            <h1 className="text-xl font-bold text-blue-600 mb-4">الجامعات</h1>

            {/* Form */}
            <div className="bg-white p-4 rounded shadow mb-6 space-y-4">
                <div>
                    <label className="block mb-1 font-medium">اسم الجامعة:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border rounded p-2 w-full"
                        placeholder="مثال: جامعة قاسيون"
                    />
                </div>

                <div>
                    <label className="block mb-1 font-medium">أيام الدوام:</label>
                    <div className="flex flex-wrap gap-4">
                        {allDays.map((day) => (
                            <label key={day} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={days.includes(day)}
                                    onChange={() => toggleDay(day, setDays, days)}
                                    className="accent-orange-500"
                                />
                                <span>{day}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleAdd}
                    className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition flex items-center gap-2"
                >
                    <PlusCircle size={18} />
                    إضافة جامعة
                </button>
            </div>

            {loading ? (
                <p>جاري التحميل...</p>
            ) : universities.length === 0 ? (
                <p className="text-gray-500">لا توجد جامعات مسجلة حاليًا.</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {universities.map((univ) => (
                        <div
                            key={univ.id}
                            className="bg-white p-4 rounded shadow hover:shadow-md transition flex flex-col justify-between"
                        >
                            <div>
                                <h3 className="text-lg font-bold text-blue-700 mb-2">{univ.name}</h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    <span className="font-medium text-gray-800">أيام الدوام:</span><br />
                                    {univ.working_days?.join('، ') || '—'}
                                </p>
                            </div>

                            <div className="flex gap-3 mt-auto pt-2 border-t">
                                <button
                                    onClick={() => openEditModal(univ)}
                                    className="flex-1 bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition text-sm"
                                >
                                    تعديل
                                </button>
                                <button
                                    onClick={() => setConfirmDeleteId(univ.id)}
                                    className="flex-1 bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 transition text-sm"
                                >
                                    حذف
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {editingUniv && (
                <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
                    <div className="bg-white rounded shadow p-6 w-full max-w-md relative">
                        <button
                            onClick={() => setEditingUniv(null)}
                            className="absolute top-3 left-3 text-gray-500 hover:text-red-500"
                        >
                            <X size={22} />
                        </button>

                        <h2 className="text-lg font-bold mb-4 text-blue-600">تعديل الجامعة</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block mb-1">الاسم:</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="border rounded p-2 w-full"
                                />
                            </div>

                            <div>
                                <label className="block mb-1">أيام الدوام:</label>
                                <div className="flex flex-wrap gap-4">
                                    {allDays.map((day) => (
                                        <label key={day} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={editDays.includes(day)}
                                                onChange={() => toggleDay(day, setEditDays, editDays)}
                                                className="accent-orange-500"
                                            />
                                            <span>{day}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleUpdate}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                حفظ التعديلات
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {confirmDeleteId && (
                <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
                    <div className="bg-white rounded shadow p-6 w-full max-w-sm text-center">
                        <h2 className="text-lg font-bold text-red-600 mb-4">تأكيد الحذف</h2>
                        <p className="text-gray-700 mb-6">هل أنت متأكد من حذف هذه الجامعة؟ لا يمكن التراجع.</p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => {
                                    handleDelete(confirmDeleteId);
                                    setConfirmDeleteId(null);
                                }}
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                            >
                                نعم، احذف
                            </button>
                            <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )
            }
        </div>

    );
}
