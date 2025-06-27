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
    <header className="w-full flex items-center justify-between bg-white border-b p-4 shadow-sm relative">
      {/* زر القائمة - يظهر فقط على الجوال */}
      <button
        onClick={onMenuClick}
        className="md:hidden text-blue-600 absolute right-4 top-1/2 -translate-y-1/2"
      >
        <Menu size={26} />
      </button>

      {/* شعار UniRide */}
      <div className="flex items-center gap-2 mx-auto md:mx-0">
        <Image
          src="/favicon_io/android-chrome-512x512.png"
          alt="UniRide"
          width={48}
          height={48}
        />
        <span className="text-xl font-bold text-blue-600">UniRide</span>
      </div>

      {/* التاريخ */}
      <div className="text-sm text-gray-700 font-medium block">
        {today}
      </div>
    </header>
  );
}
