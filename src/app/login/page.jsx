'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { useLoadingStore } from '@/store/loadingStore';


export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { isLoading, setLoading } = useLoadingStore();

    const handleLogin = async () => {
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) {
                toast.error(error.message);
            } else {
                router.push('/auth-redirect');
            }
        } catch (err) {
            toast.error('حدث خطأ أثناء تسجيل الدخول');
            console.error(err);
        } finally {
            setLoading(false);
        }
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
                    disabled={isLoading}
                    className="bg-blue-600 text-white rounded w-full p-2 mb-4"
                >
                    {isLoading ? 'جاري التسجيل...' : 'تسجيل الدخول'}
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
