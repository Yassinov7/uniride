'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Phone, MessageCircleDashed } from 'lucide-react';

export default function Register() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        setLoading(true);

        try {
            const { error } = await supabase.auth.signUp({ email, password });

            if (error) {
                toast.error(error.message);
            } else {
                toast.success('تم إنشاء الحساب بنجاح، تحقق من بريدك الإلكتروني!');
                router.replace('/login');
            }
        } catch (err) {
            toast.error('حدث خطأ أثناء إنشاء الحساب');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 p-4">
            <div className="bg-white bg-opacity-90 rounded-xl shadow-xl w-full max-w-md p-8 space-y-6">

                {/* عنوان الصفحة */}
                <div className="flex justify-center">
                    <h1 className="text-3xl font-bold text-orange-500">UniRide</h1>
                </div>

                <h2 className="text-xl font-bold text-center text-orange-600">إنشاء حساب جديد</h2>

                {/* حقول الإدخال */}
                <input
                    type="email"
                    placeholder="البريد الإلكتروني"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="كلمة المرور"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {/* زر التسجيل */}
                <button
                    onClick={handleRegister}
                    disabled={loading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg p-3 font-semibold transition"
                >
                    {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
                </button>

                {/* روابط إضافية */}
                <div className="flex justify-between text-sm">
                    <Link href="/login" className="text-blue-500 hover:underline">
                        لديك حساب؟ تسجيل دخول
                    </Link>
                    <Link href="/" className="text-gray-500 hover:underline">
                        العودة للرئيسية
                    </Link>
                </div>

                {/* بطاقة التواصل */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-5 py-4 mt-6 shadow text-right space-y-3">
                    <div>
                        <h2 className="font-bold text-blue-800 text-lg mb-1">📞 تواصل مع المشرف</h2>
                        <p className="text-sm text-gray-600">
                            هل تواجه صعوبة في إنشاء الحساب؟ تواصل معنا مباشرة.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <a
                            href="tel:+963984872471"
                            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
                        >
                            <Phone size={18} /> الاتصال
                        </a>
                        <a
                            href={`https://wa.me/963984872471?text=${encodeURIComponent("مرحبًا، أواجه مشكلة في إنشاء حساب في UniRide.")}`}
                            target="_blank"
                            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition"
                        >
                            <MessageCircleDashed size={18} /> واتساب
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
