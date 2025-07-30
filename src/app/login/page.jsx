'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Phone, MessageCircleDashed } from 'lucide-react';
import toast from 'react-hot-toast';


export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // const handleLogin = async () => {
    //     setLoading(true);
    //     const { error } = await supabase.auth.signInWithPassword({ email, password });

    //     if (error) {
    //         toast.error(error.message);
    //     } else {
    //         router.replace('/student');
    //     }

    //     setLoading(false);
    // };
    const handleLogin = async () => {
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            toast.error(error.message);
            setLoading(false);
            return;
        }

        const userId = data?.user?.id;
        if (!userId) {
            toast.error('تعذر الحصول على معلومات الحساب.');
            setLoading(false);
            return;
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

        if (profileError || !profile) {
            toast.error('حدث خطأ أثناء تحميل البيانات.');
            setLoading(false);
            return;
        }

        // ✅ التوجيه بناءً على الدور
        if (profile.role === 'admin') {
            router.replace('/admin');
        } else if (profile.role === 'student') {
            router.replace('/student');
        } else {
            router.replace('/unauthorized');
        }

        setLoading(false);
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 p-4">
            <div className="bg-white bg-opacity-90 rounded-xl shadow-xl w-full max-w-md p-8 space-y-6">

                {/* شعار أو عنوان الموقع */}
                <div className="flex justify-center">
                    <h1 className="text-3xl font-bold text-blue-600">UniRide</h1>
                </div>

                {/* العنوان */}
                <h2 className="text-xl font-bold text-center text-blue-700">تسجيل الدخول</h2>

                {/* النموذج */}
                <input
                    type="email"
                    placeholder="البريد الإلكتروني"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="كلمة المرور"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 font-semibold transition"
                >
                    {loading ? 'جاري الدخول...' : 'دخول'}
                </button>

                <div className="flex justify-between text-sm">
                    {/* <Link href="/register" className="text-orange-500 hover:underline">
                        إنشاء حساب جديد
                    </Link> */}
                    <Link href="/" className="text-gray-500 hover:underline">
                        العودة للرئيسية
                    </Link>
                </div>

                {/* بطاقة التواصل */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-5 py-4 mt-6 shadow text-right space-y-3">
                    <div>
                        <h2 className="font-bold text-blue-800 text-lg mb-1">📞 تواصل مع المشرف</h2>
                        <p className="text-sm text-gray-600">
                            هل تحتاج مساعدة في تسجيل الدخول؟ تواصل معنا الآن بكل سهولة.
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
                            href={`https://wa.me/963984872471?text=${encodeURIComponent("مرحبًا، أواجه مشكلة في تسجيل الدخول إلى UniRide.")}`}
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