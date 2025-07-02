'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 text-center p-6">
            <div className="text-red-500 mb-4 animate-pulse">
                <AlertTriangle size={72} />
            </div>
            <h1 className="text-xl font-bold text-red-800 mb-2">الصفحة غير موجودة</h1>
            <p className="text-gray-600 mb-4">
                عذرًا، لم نتمكن من العثور على الصفحة التي تبحث عنها.
            </p>
            <button
                onClick={() => router.push('/auth-redirect')}
                className="mt-2 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-700 transition"
            >
                العودة إلى UniRide
            </button>
        </div>
    );
}
