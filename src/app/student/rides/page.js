'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

export default function RidesPage() {
  return (
    <ProtectedRoute>
      <div className="p-4">
        <h1 className="text-xl font-bold text-blue-700">صفحة الرحلات</h1>
        <p>رح نعرض هون الرحلات المتاحة أو المحجوزة.</p>
      </div>
    </ProtectedRoute>
  );
}
