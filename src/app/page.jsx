import Link from 'next/link';
import { Bus, UserCheck, LogIn } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 p-4">
      <div className="bg-white bg-opacity-80 shadow-lg rounded-xl p-10 max-w-2xl text-center">
        <div className="mb-6 flex justify-center">
          <Bus size={60} className="text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          مرحبًا بك في <span className="text-blue-600">UniRide</span>
        </h1>
        <p className="text-gray-600 mb-8">
          نظام إلكتروني متكامل يُنظّم رحلات النقل الجامعي بين الطلاب والمشرفين بسهولة، يوفّر للطالب حجزًا سلسًا ومريحًا، وللمشرف تحكّمًا كاملًا وإدارةً دقيقة.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <button className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
              <LogIn size={35} />
              تسجيل دخول
            </button>
          </Link>
          <Link href="/register">
            <button className="flex items-center gap-2 px-5 py-2 bg-orange-500 text-white rounded-lg shadow hover:bg-orange-600 transition">
              <UserCheck size={35} />
              إنشاء حساب
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
