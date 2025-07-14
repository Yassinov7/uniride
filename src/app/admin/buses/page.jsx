'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLoadingStore } from '@/store/loadingStore';
import { useAdminPublicStore } from '@/store/adminPublicStore';
import { supabase } from '@/lib/supabase';

export default function BusesPage() {
    const { setLoading } = useLoadingStore();
    const { buses, fetchBuses } = useAdminPublicStore();

    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [name, setName] = useState('');
    const [capacity, setCapacity] = useState('');
    const [driverName, setDriverName] = useState('');
    const [editingBus, setEditingBus] = useState(null);

    useEffect(() => {
        if (buses.length === 0) fetchBuses();
    }, []);

    const handleAdd = async () => {
        if (!name || !capacity) {
            toast.error('يرجى إدخال الاسم والسعة');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.from('buses').insert({
                name,
                capacity: Number(capacity),
                driver_name: driverName || null,
            });

            if (error) throw error;

            toast.success('تمت الإضافة');
            setName('');
            setCapacity('');
            setDriverName('');
            await fetchBuses();
        } catch (err) {
            toast.error('فشل في الإضافة');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            const { error } = await supabase.from('buses').delete().eq('id', id);
            if (error) throw error;
            toast.success('تم الحذف');
            await fetchBuses();
        } catch (err) {
            console.error(err);
            toast.error('فشل الحذف');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingBus.name || !editingBus.capacity) {
            toast.error('يرجى تعبئة جميع الحقول');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('buses')
                .update({
                    name: editingBus.name,
                    capacity: Number(editingBus.capacity),
                    driver_name: editingBus.driver_name || null,
                })
                .eq('id', editingBus.id);

            if (error) throw error;

            toast.success('تم التحديث');
            setEditingBus(null);
            await fetchBuses();
        } catch (err) {
            console.error(err);
            toast.error('فشل التحديث');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-60 space-y-6">
            <h1 className="text-xl font-bold text-blue-600 mb-4">الباصات</h1>

            {/* زر التحديث */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={async () => {
                        const toastId = toast.loading('جاري التحديث...');
                        await fetchBuses();
                        toast.dismiss(toastId);
                        toast.success('تم تحديث قائمة الباصات');
                    }}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 text-sm"
                >
                    تحديث البيانات
                </button>
            </div>


            {/* Form */}
            <div className="bg-white p-4 rounded shadow mb-6 space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                    <input
                        type="text"
                        placeholder="اسم الباص"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border p-2 rounded"
                    />
                    <input
                        type="number"
                        placeholder="السعة"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        className="border p-2 rounded"
                    />
                    <input
                        type="text"
                        placeholder="اسم السائق (اختياري)"
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        className="border p-2 rounded"
                    />
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition flex items-center gap-2"
                >
                    <PlusCircle size={18} />
                    إضافة باص
                </button>
            </div>

            {/* Cards */}
            {buses.length === 0 ? (
                <p className="text-gray-500">لا توجد باصات مسجلة.</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {buses.map((bus) => (
                        <div key={bus.id} className="bg-white p-4 rounded shadow flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-blue-700">{bus.name}</h3>
                                <p className="text-sm text-gray-600">السعة: {bus.capacity}</p>
                                {bus.driver_name && (
                                    <p className="text-sm text-gray-600">السائق: {bus.driver_name}</p>
                                )}
                            </div>

                            <div className="flex gap-3 mt-4 pt-2 border-t">
                                <button
                                    onClick={() => setEditingBus(bus)}
                                    className="flex-1 bg-blue-600 text-white py-1.5 rounded hover:bg-blue-700 text-sm"
                                >
                                    تعديل
                                </button>
                                <button
                                    onClick={() => setConfirmDeleteId(bus.id)}
                                    className="flex-1 bg-red-600 text-white py-1.5 rounded hover:bg-red-700 text-sm"
                                >
                                    حذف
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {editingBus && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded shadow p-6 w-full max-w-md relative">
                        <button
                            onClick={() => setEditingBus(null)}
                            className="absolute top-3 left-3 text-gray-500 hover:text-red-500"
                        >
                            <X size={22} />
                        </button>
                        <h2 className="text-lg font-bold mb-4 text-blue-600">تعديل الباص</h2>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="اسم الباص"
                                value={editingBus.name}
                                onChange={(e) =>
                                    setEditingBus({ ...editingBus, name: e.target.value })
                                }
                                className="border p-2 rounded w-full"
                            />
                            <input
                                type="number"
                                placeholder="السعة"
                                value={editingBus.capacity}
                                onChange={(e) =>
                                    setEditingBus({ ...editingBus, capacity: e.target.value })
                                }
                                className="border p-2 rounded w-full"
                            />
                            <input
                                type="text"
                                placeholder="اسم السائق"
                                value={editingBus.driver_name || ''}
                                onChange={(e) =>
                                    setEditingBus({ ...editingBus, driver_name: e.target.value })
                                }
                                className="border p-2 rounded w-full"
                            />
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

            {/* Delete Confirmation */}
            {confirmDeleteId && (
                <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
                    <div className="bg-white rounded shadow p-6 w-full max-w-sm text-center">
                        <h2 className="text-lg font-bold text-red-600 mb-4">تأكيد الحذف</h2>
                        <p className="text-gray-700 mb-6">هل أنت متأكد من حذف هذا الباص؟</p>
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
            )}
        </div>
    );
}
