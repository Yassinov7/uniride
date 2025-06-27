'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { name: form.name },
      },
    });

    if (error) return setError(error.message);

    router.push('/login');
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleRegister}
        className="bg-white p-6 md:p-8 rounded-xl shadow-md w-full max-w-md space-y-5 border border-gray-200"
      >
        <h2 className="text-2xl font-bold text-blue-700 text-center">إنشاء حساب جديد</h2>

        <input
          name="name"
          type="text"
          placeholder="الاسم الكامل"
          value={form.name}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        />

        <input
          name="email"
          type="email"
          placeholder="البريد الإلكتروني"
          value={form.email}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        />

        <input
          name="password"
          type="password"
          placeholder="كلمة المرور"
          value={form.password}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        />

        {error && <p className="text-red-600 text-sm text-center">{error}</p>}

        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded font-semibold transition"
        >
          تسجيل
        </button>

        <p className="text-sm text-center text-gray-600">
          لديك حساب؟{' '}
          <a href="/login" className="text-blue-700 hover:underline">
            تسجيل الدخول
          </a>
        </p>
      </form>
    </main>
  );
}
