'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PlusCircle, Pencil, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLoadingStore } from '@/store/loadingStore';

export default function LocationsPage() {
    const [locations, setLocations] = useState([]);
    const { setLoading } = useLoadingStore();
    const [showForm, setShowForm] = useState(false);
    const [editingLocation, setEditingLocation] = useState(null);
    const [form, setForm] = useState({ name: '', fare: '' });

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('locations')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLocations(data);
        } catch (err) {
            console.error(err);
            toast.error('حدث خطأ أثناء جلب المناطق');
        } finally {
            setLoading(false);
        }
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        const { name, fare } = form;
        if (!name || !fare || isNaN(fare)) {
            toast.error('يرجى تعبئة جميع الحقول بشكل صحيح');
            return;
        }

        setLoading(true);

        try {
            if (editingLocation) {
                const { error } = await supabase
                    .from('locations')
                    .update({ name, fare: Number(fare) })
                    .eq('id', editingLocation.id);

                if (error) throw error;
                toast.success('تم التعديل بنجاح');
            } else {
                const { error } = await supabase
                    .from('locations')
                    .insert({ name, fare: Number(fare) });

                if (error) throw error;
                toast.success('تمت الإضافة بنجاح');
            }

            setForm({ name: '', fare: '' });
            setEditingLocation(null);
            setShowForm(false);
            await fetchLocations();
        } catch (err) {
            console.error(err);
            toast.error('حدث خطأ أثناء حفظ البيانات');
        } finally {
            setLoading(false);
        }
    };



    const handleDelete = async (id) => {
        setLoading(true);
        try {
            const { error } = await supabase.from('locations').delete().eq('id', id);
            if (error) throw error;
            toast.success('تم الحذف');
            await fetchLocations();
        } catch (err) {
            console.error(err);
            toast.error('فشل الحذف');
        } finally {
            setLoading(false);
        }
    };



    const startEdit = (location) => {
        setForm({ name: location.name, fare: location.fare });
        setEditingLocation(location);
        setShowForm(true);
    };

    return (
        <div className="space-y-6 mb-30">
            <h1 className="text-xl font-bold text-blue-600">إدارة المناطق السكنية</h1>

            <div className="flex justify-end">
                <button
                    onClick={() => {
                        setShowForm(true);
                        setEditingLocation(null);
                        setForm({ name: '', fare: '' });
                    }}
                    className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition"
                >
                    <PlusCircle size={18} />
                    إضافة منطقة
                </button>
            </div>

            {locations.length === 0 ? (
                <p className="text-gray-500">لا توجد مناطق بعد.</p>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {locations.map((location) => (
                        <div key={location.id} className="bg-white p-4 rounded shadow flex flex-col justify-between">
                            <div>
                                <p className="text-lg font-bold text-blue-700">{location.name}</p>
                                <p className="text-gray-700">الأجرة: {location.fare} ل.س</p>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => startEdit(location)}
                                    className="flex-1 bg-blue-600 text-white py-1 rounded hover:bg-blue-700 text-sm flex items-center justify-center gap-1"
                                >
                                    <Pencil size={16} />
                                    تعديل
                                </button>
                                <button
                                    onClick={() => handleDelete(location.id)}
                                    className="flex-1 bg-red-600 text-white py-1 rounded hover:bg-red-700 text-sm flex items-center justify-center gap-1"
                                >
                                    <Trash2 size={16} />
                                    حذف
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow w-full max-w-md relative">
                        <button
                            onClick={() => {
                                setShowForm(false);
                                setEditingLocation(null);
                            }}
                            className="absolute top-3 left-3 text-gray-500 hover:text-red-500"
                        >
                            <X size={22} />
                        </button>

                        <h2 className="text-lg font-bold mb-4 text-blue-600">
                            {editingLocation ? 'تعديل المنطقة' : 'إضافة منطقة'}
                        </h2>

                        <div className="space-y-4">
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="اسم المنطقة"
                                className="w-full border p-2 rounded"
                            />
                            <input
                                type="number"
                                name="fare"
                                value={form.fare}
                                onChange={handleChange}
                                placeholder="الأجرة (ل.س)"
                                min={0}
                                className="w-full border p-2 rounded"
                            />

                            <button
                                onClick={handleSubmit}
                                className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600"
                            >
                                {editingLocation ? 'حفظ التعديلات' : 'إضافة'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
