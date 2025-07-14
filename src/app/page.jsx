'use client';
import Link from 'next/link';
import { Bus, UserCheck, LogIn, Phone, MessageCircleDashed } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 p-4">
      <div className="bg-white bg-opacity-80 shadow-lg rounded-xl p-10 max-w-2xl w-full text-center space-y-8">
        {/* شعار وتقديم */}
        <div className="flex justify-center">
          <Bus size={60} className="text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">
          مرحبًا بك في <span className="text-blue-600">UniRide</span>
        </h1>
        <p className="text-gray-600 leading-relaxed">
          نظام إلكتروني متكامل يُنظّم رحلات النقل الجامعي بين الطلاب والمشرفين بسهولة، يوفّر للطالب حجزًا سلسًا ومريحًا، وللمشرف تحكّمًا كاملًا وإدارةً دقيقة.
        </p>

        {/* أزرار الدخول */}
        <div className="flex gap-4 justify-center flex-col sm:flex-row">
          <Link href="/login">
            <button className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition text-base">
              <LogIn size={24} />
              تسجيل دخول
            </button>
          </Link>
          <Link href="/register">
            <button className="flex items-center gap-2 px-5 py-2 bg-orange-500 text-white rounded-lg shadow hover:bg-orange-600 transition text-base">
              <UserCheck size={24} />
              إنشاء حساب
            </button>
          </Link>
        </div>

        {/* بطاقة التواصل */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-6 py-5 shadow flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-right">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-blue-800">📞 تواصل مع المشرف</h2>
            <p className="text-sm text-gray-600">هل تحتاج مساعدة؟ تواصل معنا الآن بكل سهولة.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <a
              href="tel:+963984872471"
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition w-full sm:w-auto"
            >
              <Phone size={18} /> الاتصال
            </a>
            <a
              href={`https://wa.me/963984872471?text=${encodeURIComponent("مرحبًا، أود الاستفسار عن UniRide.")}`}
              target="_blank"
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition w-full sm:w-auto"
            >
              <MessageCircleDashed size={18} /> واتساب
            </a>
          </div>
        </div>
      </div>
    </main>

  );
}
