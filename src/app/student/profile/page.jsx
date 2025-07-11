'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Pencil, Mail, UserCircle, University, MapPin, Lock, Phone } from 'lucide-react';
import Modal from '@/components/Modal';
import { useLoadingStore } from '@/store/loadingStore';
import { useProfileStore } from '@/store/profileStore';
import { useUserStore } from '@/store/userStore'; // ✅ استيراد userStore

export default function StudentProfilePage() {
    const { user } = useUserStore(); // ✅ المستخدم من الستور
    const { universities, locations, fetchOptions } = useProfileStore();
    const { isLoading, setLoading } = useLoadingStore();

    const [editOpen, setEditOpen] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);

    const [form, setForm] = useState({
        full_name: '',
        gender: '',
        university_id: null,
        location_id: null,
        phone: '',
    });

    useEffect(() => {
        if (user) {
            setForm({
                full_name: user.full_name || '',
                gender: user.gender || '',
                university_id: user.university_id || null,
                location_id: user.location_id || null,
                phone: user.phone || '',
            });
            setLoading(false);
        }

        fetchOptions();
    }, [user]);

    const handleUpdate = async () => {
        const { error } = await supabase
            .from('profiles')
            .update(form)
            .eq('id', user.id);

        if (error) {
            toast.error('فشل تحديث البيانات');
        } else {
            toast.success('تم تحديث البيانات');
            setEditOpen(false);
            location.reload(); // لإعادة تحميل user من AuthProvider
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
        if (user.gender === 'male') return '/avatars/male.jpg';
        if (user.gender === 'female') return '/avatars/female.jpg';
        return '/avatars/notsetgender.svg';
    };

    const getUniversityName = (id) =>
        universities.find((u) => u.id === id)?.name || 'غير مُحددة';

    const getLocationName = (id) =>
        locations.find((l) => l.id === id)?.name || 'غير مُحددة';

    if (isLoading || !user) return <p className="text-center mt-10 text-gray-500">جارٍ تحميل البيانات...</p>;


    return (
        <div className="max-w-2xl mb-60 mx-auto mt-10 bg-white p-6 shadow rounded space-y-6">
            <h1 className="text-xl font-bold text-blue-700 text-center">الملف الشخصي</h1>

            <div className="flex justify-center">
                <img
                    src={getAvatar()}
                    alt="الصورة الرمزية"
                    className="w-24 h-24 rounded-full border-4 border-orange-400 shadow-md"
                />
            </div>

            <div className="space-y-3 text-gray-700">
                <InfoRow icon={<UserCircle />} label="الاسم الكامل" value={user.full_name} />
                <InfoRow icon={<Phone />} label="رقم الهاتف" value={user.phone} />
                <InfoRow
                    icon={<Mail />}
                    label="الصفة"
                    value={
                        user.gender === 'male'
                            ? 'طالب'
                            : user.gender === 'female'
                                ? 'طالبة'
                                : null
                    }
                />
                <InfoRow icon={<University />} label="الجامعة" value={getUniversityName(user.university_id)} />
                <InfoRow icon={<MapPin />} label="المنطقة" value={getLocationName(user.location_id)} />
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

            {/* Modal التعديل */}
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
                            placeholder="رقم الهاتف"
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
                            onChange={(e) => setForm({ ...form, university_id: e.target.value || null })}
                        >
                            <option disabled value="">اختر الجامعة</option>
                            {universities.map((u) => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>

                        <select
                            className="w-full border rounded px-3 py-2"
                            value={form.location_id !== null ? String(form.location_id) : ''}
                            onChange={(e) => setForm({ ...form, location_id: e.target.value ? Number(e.target.value) : null })}
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

            {/* Modal تغيير كلمة المرور */}
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

// ✅ مكون فرعي لعرض كل صف بيانات
function InfoRow({ icon, label, value }) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-primary">{icon}</span>
            <span className="font-semibold">{label}:</span>
            <span>{value || <span className="text-red-500">غير مُدخل</span>}</span>
        </div>
    );
}
