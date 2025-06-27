'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

// بيانات وهمية مؤقتًا
const dummyHistory = [
  {
    id: 1,
    type: 'booking',
    direction: 'ذهاب',
    date: '2025-06-25',
    status: 'تم الحجز',
  },
  {
    id: 2,
    type: 'return',
    direction: 'عودة',
    date: '2025-06-24',
    status: 'تم التأكيد',
  },
  {
    id: 3,
    type: 'cancel',
    direction: 'ذهاب',
    date: '2025-06-23',
    status: 'تم الإلغاء',
  },
  {
    id: 4,
    type: 'balance',
    amount: +10000,
    date: '2025-06-22',
    status: 'إضافة رصيد',
  },
  {
    id: 5,
    type: 'balance',
    amount: -1500,
    date: '2025-06-21',
    status: 'خصم رصيد لرحلة',
  },
];

export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-blue-700 text-center">سجل الحركات</h1>

        <div className="space-y-3">
          {dummyHistory.map((entry) => (
            <div
              key={entry.id}
              className="bg-white border rounded-xl shadow-sm p-4 flex justify-between items-center text-sm"
            >
              <div>
                <p className="font-medium text-gray-700">{entry.status}</p>
                {entry.type === 'balance' ? (
                  <p className="text-gray-500">
                    المبلغ: {Math.abs(entry.amount).toLocaleString()} ل.س
                  </p>
                ) : (
                  <p className="text-gray-500">الرحلة: {entry.direction}</p>
                )}
              </div>
              <div className="text-gray-400 text-xs">{entry.date}</div>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
