'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function RidesPage() {
    // حالات وهمية مؤقتة (سيتم ربطها لاحقًا)
    const [hasBooked, setHasBooked] = useState(false);
    const [hasReturned, setHasReturned] = useState(false);

    return (
        <ProtectedRoute>
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-blue-700 text-center">رحلات اليوم</h1>

                {/* الذهاب */}
                <div className="bg-white rounded-xl shadow-sm border p-4 space-y-2">
                    <h2 className="text-lg font-semibold text-gray-800">رحلة الذهاب</h2>
                    <p className="text-sm text-gray-600">وقت الانطلاق: 7:30 صباحاً</p>
                    {hasBooked ? (
                        <div className="text-green-600 font-medium">✅ تم الحجز</div>
                    ) : (
                        <button
                            onClick={() => setHasBooked(true)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
                        >
                            احجز الذهاب
                        </button>
                    )}
                </div>

                {/* العودة */}
                <div className="bg-white rounded-xl shadow-sm border p-4 space-y-2">
                    <h2 className="text-lg font-semibold text-gray-800">رحلة العودة</h2>
                    <p className="text-sm text-gray-600">وقت التوفر: بدءاً من الساعة 12:00 ظهراً</p>
                    {hasReturned ? (
                        <div className="text-green-600 font-medium">✅ تم تأكيد الرجعة</div>
                    ) : (
                        <button
                            onClick={() => setHasReturned(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                        >
                            أنهيت دوامي – أطلب الرجعة
                        </button>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
