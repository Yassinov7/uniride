'use client';

import { LogOut, Bus } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'next/navigation';
import { metadata } from './../app/layout';

export default function StudentHeader() {
  const { user, logout } = useUserStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <Bus size={24} className="text-white" />
        <h2 className="font-bold text-lg">UniRide</h2>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm hidden sm:inline">مرحباً، {user?.name || user?.email}</span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-white hover:text-orange-300 transition"
        >
          <LogOut size={18} />
          <span className="text-sm">خروج</span>
        </button>
      </div>
    </header>
  );
}
