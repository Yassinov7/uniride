'use client';

import { ShieldOff } from 'lucide-react';
import Link from 'next/link';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-center px-6" dir="rtl">
            <div className="text-red-500 mb-4">
                <ShieldOff size={64} />
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">غير مصرح لك بالدخول</h1>
            <p className="text-gray-700 mb-6">
                لا تملك صلاحية الوصول إلى هذه الصفحة. يرجى التأكد من حسابك أو الرجوع للصفحة الرئيسية.
            </p>
            <Link
                href="/auth-redirect"
                className="inline-block bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
            >
                العودة للصفحة الرئيسية
            </Link>
        </div>
    );
}
