'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

export default function BalancePage() {
    // رصيد وهمي مؤقتًا
    const balance = 8500; // ليرة مثلاً
    const remainingTrips = 5;

    return (
        <ProtectedRoute>
            <div className="space-y-6 max-w-md mx-auto">
                <h1 className="text-2xl font-bold text-blue-700 text-center">رصيدي</h1>

                <div className="bg-white rounded-xl shadow-md border p-6 text-center">
                    <p className="text-gray-600 text-sm">الرصيد الحالي</p>
                    <div className="text-4xl font-bold text-green-600 mt-2">
                        {balance.toLocaleString()} ل.س
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border p-4 flex items-center justify-between">
                    <span className="text-gray-700 font-medium">عدد الرحلات المتبقية:</span>
                    <span className="text-blue-700 font-bold">{remainingTrips}</span>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-4 rounded-md text-sm">
                    عند نفاد الرصيد لن تتمكن من حجز الرحلات. الرجاء التواصل مع المشرف لتعبئة الرصيد.
                </div>
            </div>
        </ProtectedRoute>
    );
}
