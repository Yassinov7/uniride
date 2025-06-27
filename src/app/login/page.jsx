'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';

export default function LoginPage() {
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return setError(error.message);

    setUser(data.user);
    router.push('/student/rides');
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 md:p-8 rounded-xl shadow-md w-full max-w-md space-y-5 border border-gray-200"
      >
        <h2 className="text-2xl font-bold text-blue-700 text-center">تسجيل الدخول</h2>

        <input
          type="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        />

        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        />

        {error && <p className="text-red-600 text-sm text-center">{error}</p>}

        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded font-semibold transition"
        >
          دخول
        </button>

        <p className="text-sm text-center text-gray-600">
          ليس لديك حساب؟{' '}
          <a href="/register" className="text-blue-700 hover:underline">
            إنشاء حساب
          </a>
        </p>
      </form>
    </main>
  );
}
