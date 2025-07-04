'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Menu } from 'lucide-react';

export default function CommonHeader({ onMenuClick }) {
  const [today, setToday] = useState('');

  useEffect(() => {
    const now = new Date();

    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];

    const dayName = days[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();

    setToday(`${dayName} ${day} ${month} ${year}`);
  }, []);

  return (
    <header className="w-full flex items-center justify-between bg-white border-b p-4 shadow-sm" dir="rtl">
      {/* شعار UniRide */}
      <div className="flex items-center gap-2 shrink-0">
        <Image
          src="/android-chrome-512x512.png"
          alt="UniRide"
          width={48}
          height={48}
          className="rounded-full"
        />
        <span className="text-xl sm:text-xl font-bold text-blue-700">UniRide</span>
      </div>

      {/* التاريخ + زر القائمة */}
      <div className="flex items-center text-sm text-gray-700 font-medium">
        <span className="inline text-orange-500">{today}</span>
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded hover:bg-gray-100 transition"
          aria-label="القائمة"
        >
          <Menu size={26} className="text-blue-700"/>
        </button>
      </div>
    </header>

  );
}
