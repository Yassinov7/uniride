'use client';

import { useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ProfilePage() {
    const { user, logout } = useUserStore();
    const router = useRouter();

    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({
        fullName: 'محمد أحمد',
        gender: 'male',
        university: 'جامعة دمشق',
        phone: '0998765432',
        location: 'جرمانا',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        setEditMode(false);
        // سيتم الحفظ في Supabase لاحقًا
        console.log('بيانات جديدة:', form);
    };

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <ProtectedRoute>
            <div className="max-w-md mx-auto space-y-6">
                <h1 className="text-2xl font-bold text-blue-700 text-center">الملف الشخصي</h1>

                <div className="bg-white border rounded-xl shadow-md p-6 space-y-4">
                    {editMode ? (
                        <form onSubmit={handleSave} className="space-y-4">
                            <Input label="الاسم الكامل" name="fullName" value={form.fullName} onChange={handleChange} />
                            <Input label="الجامعة" name="university" value={form.university} onChange={handleChange} />
                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="block text-sm text-gray-700">الجنس</label>
                                    <select
                                        name="gender"
                                        value={form.gender}
                                        onChange={handleChange}
                                        className="w-full border rounded px-3 py-2 text-sm"
                                    >
                                        <option value="male">ذكر</option>
                                        <option value="female">أنثى</option>
                                    </select>
                                </div>
                                <Input label="رقم الهاتف" name="phone" value={form.phone} onChange={handleChange} half />
                            </div>
                            <Input label="مكان السكن" name="location" value={form.location} onChange={handleChange} />

                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded font-medium">
                                حفظ التعديلات
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-3 text-sm text-gray-700">
                            <Row label="الاسم الكامل" value={form.fullName} />
                            <Row label="الجامعة" value={form.university} />
                            <Row label="الجنس" value={form.gender === 'male' ? 'ذكر' : 'أنثى'} />
                            <Row label="رقم الهاتف" value={form.phone} />
                            <Row label="مكان السكن" value={form.location} />
                        </div>
                    )}

                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => setEditMode(!editMode)}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded"
                        >
                            {editMode ? 'إلغاء' : 'تعديل البيانات'}
                        </button>
                        <button
                            onClick={() => alert('لاحقاً: تغيير كلمة المرور')}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded"
                        >
                            تغيير كلمة المرور
                        </button>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded mt-4"
                    >
                        تسجيل الخروج
                    </button>
                </div>
            </div>
        </ProtectedRoute>
    );
}

function Row({ label, value }) {
    return (
        <div className="flex justify-between border-b pb-1">
            <span className="font-medium text-gray-600">{label}</span>
            <span>{value}</span>
        </div>
    );
}

function Input({ label, name, value, onChange, half }) {
    return (
        <div className={half ? 'w-1/2' : 'w-full'}>
            <label className="block text-sm text-gray-700 mb-1">{label}</label>
            <input
                name={name}
                value={value}
                onChange={onChange}
                className="w-full border rounded px-3 py-2 text-sm"
            />
        </div>
    );
}
