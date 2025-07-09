'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';


export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            toast.error(error.message);
        } else {
            router.push('/auth-redirect');
        }

        setLoading(false);
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Toaster position="top-center" />
            <div className="p-8 bg-white rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-4 text-blue-600">تسجيل الدخول</h1>

                <input
                    type="email"
                    placeholder="البريد الإلكتروني"
                    className="w-full border rounded p-2 mb-4"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="كلمة المرور"
                    className="w-full border rounded p-2 mb-4"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="bg-blue-600 text-white rounded w-full p-2 mb-4"
                >
                    {loading ? 'جاري الدخول...' : 'دخول'}
                </button>

                <div className="flex justify-between text-sm">
                    <Link href="/register" className="text-orange-500 underline">
                        إنشاء حساب جديد
                    </Link>
                    <Link href="/" className="text-gray-500 underline">
                        العودة للرئيسية
                    </Link>
                </div>
            </div>
        </div>
    );
}
