'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Pencil, Mail, UserCircle, University, MapPin, Lock, Phone } from 'lucide-react';
import Modal from '@/components/Modal';
import { useLoadingStore } from '@/store/loadingStore';

export default function StudentProfilePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoadings] = useState(true);
    const { setLoading } = useLoadingStore();
    const [editOpen, setEditOpen] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);

    const [universities, setUniversities] = useState([]);
    const [locations, setLocations] = useState([]);

    const [form, setForm] = useState({
        full_name: '',
        gender: '',
        university_id: null,
        location_id: null,
        phone: '',
    });

    useEffect(() => {
        fetchProfile();
        fetchOptions();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const { data: userData } = await supabase.auth.getUser();
            const userId = userData?.user?.id;

            if (!userId) {
                toast.error('تعذر التعرف على المستخدم');
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, gender, university_id, location_id,phone, universities(name), locations(name)')
                .eq('id', userId)
                .single();

            if (error) {
                toast.error('فشل تحميل البيانات');
            } else {
                setProfile(data);
                setForm({
                    full_name: data.full_name || '',
                    gender: data.gender || '',
                    university_id: data.university_id || null,
                    location_id: data.location_id || null,
                    phone: data.phone || '',
                });
            }
        } finally {
            setLoadings(false);
            setLoading(false);
        }

    };

    const fetchOptions = async () => {
        const [{ data: uni }, { data: loc }] = await Promise.all([
            supabase.from('universities').select('id, name'),
            supabase.from('locations').select('id, name'),
        ]);

        setUniversities(uni || []);
        setLocations(loc || []);
    };

    const handleUpdate = async () => {
        const { error } = await supabase
            .from('profiles')
            .update(form)
            .eq('id', profile.id);

        if (error) {
            toast.error('فشل تحديث البيانات');
        } else {
            toast.success('تم تحديث البيانات');
            setEditOpen(false);
            fetchProfile();
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        const newPassword = e.target.new_password.value;

        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (error) {
            toast.error('فشل تغيير كلمة المرور');
        } else {
            toast.success('تم تغيير كلمة المرور');
            setPasswordOpen(false);
        }
    };

    const getAvatar = () => {
        if (profile.gender === 'male') return '/avatars/male.jpg';
        if (profile.gender === 'female') return '/avatars/female.jpg';
        return '/avatars/notsetgender.svg';
    };

    if (loading) return <p className="text-center mt-10 text-gray-500">جارٍ تحميل البيانات...</p>;

    return (
        <div className="max-w-2xl mx-auto mt-10 bg-white p-6 shadow rounded space-y-6">
            <h1 className="text-xl font-bold text-blue-700 text-center">الملف الشخصي</h1>
            <div className="flex justify-center">
                <img
                    src={getAvatar()}
                    alt="الصورة الرمزية"
                    className="w-24 h-24 rounded-full border-4 border-orange-400 shadow-md"
                />
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-700">
                    <UserCircle className="text-primary" />
                    <span className="font-semibold">الاسم الكامل:</span>
                    <span>{profile.full_name || <span className="text-red-500">غير مُدخل</span>}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="text-primary" />
                    <span className="font-semibold">رقم الهاتف:</span>
                    <span>{profile.phone || <span className="text-red-500">غير مُدخل</span>}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="text-primary" />
                    <span className="font-semibold">الصفة:</span>
                    <span>{profile.gender === 'male' ? 'طالب' : profile.gender === 'female' ? 'طالبة' : <span className="text-red-500">غير مُدخل</span>}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                    <University className="text-primary" />
                    <span className="font-semibold">الجامعة:</span>
                    <span>{profile.universities?.name || <span className="text-red-500">غير مُحددة</span>}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                    <MapPin className="text-primary" />
                    <span className="font-semibold">المنطقة:</span>
                    <span>{profile.locations?.name || <span className="text-red-500">غير مُحددة</span>}</span>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-center mt-6">
                <button
                    onClick={() => setEditOpen(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded flex items-center gap-2 justify-center"
                >
                    <Pencil size={18} />
                    تعديل البيانات
                </button>

                <button
                    onClick={() => setPasswordOpen(true)}
                    className="bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded flex items-center gap-2 justify-center"
                >
                    <Lock size={18} />
                    تغيير كلمة المرور
                </button>
            </div>

            {/* تعديل البيانات */}
            {editOpen && (
                <Modal title="تعديل الملف الشخصي" onClose={() => setEditOpen(false)}>
                    <div className="space-y-4">
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2"
                            placeholder="الاسم الكامل"
                            value={form.full_name}
                            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                        />

                        <input
                            type="tel"
                            className="w-full border rounded px-3 py-2"
                            placeholder="رقم الهاتف (مثال: 0998877665)"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />

                        <select
                            className="w-full border rounded px-3 py-2"
                            value={form.gender}
                            onChange={(e) => setForm({ ...form, gender: e.target.value })}
                        >
                            <option disabled value="">اختر الصفة</option>
                            <option value="male">طالب</option>
                            <option value="female">طالبة</option>
                        </select>


                        <select
                            className="w-full border rounded px-3 py-2"
                            value={form.university_id || ''}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    university_id: e.target.value || null,
                                })
                            }
                        >
                            <option disabled value="">اختر الجامعة</option>
                            {universities.map((u) => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                        <select
                            className="w-full border rounded px-3 py-2"
                            value={form.location_id !== null ? String(form.location_id) : ''}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    location_id: e.target.value ? Number(e.target.value) : null,
                                })
                            }
                        >
                            <option disabled value="">اختر المنطقة</option>
                            {locations.map((l) => (
                                <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleUpdate}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                        >
                            حفظ التعديلات
                        </button>
                    </div>
                </Modal>
            )}

            {/* تغيير كلمة المرور */}
            {passwordOpen && (
                <Modal title="تغيير كلمة المرور" onClose={() => setPasswordOpen(false)}>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <input
                            type="password"
                            name="new_password"
                            required
                            minLength={6}
                            placeholder="كلمة المرور الجديدة"
                            className="w-full border rounded px-3 py-2"
                        />
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                        >
                            تغيير
                        </button>
                    </form>
                </Modal>
            )}
        </div>
    );
}