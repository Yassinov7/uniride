'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Bus,
    Wallet,
    User,
    Clock,
} from 'lucide-react';
import StudentHeader from '@/components/StudentHeader';

const navItems = [
    { href: '/student/rides', label: 'الرحلات', icon: Bus },
    { href: '/student/balance', label: 'الرصيد', icon: Wallet },
    { href: '/student/profile', label: 'الملف', icon: User },
    { href: '/student/history', label: 'السجل', icon: Clock },
];

export default function StudentLayout({ children }) {
    const pathname = usePathname();

    return (
        <main >
            <StudentHeader />
            <div className="flex min-h-screen bg-gray-50">
                {/* Sidebar for desktop */}
                <aside className="hidden md:flex md:flex-col w-60 bg-white border-r shadow-sm">
                    <div className="text-center text-blue-700 font-bold text-2xl py-6 border-b">UniRide</div>
                    <nav className="flex flex-col gap-1 p-4">
                        {navItems.map(({ href, label, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-3 px-4 py-2 rounded text-sm font-medium transition ${pathname === href
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <Icon size={20} />
                                {label}
                            </Link>
                        ))}
                    </nav>
                </aside>

                {/* Main content */}
                <main className="flex-grow px-4 py-6 mb-20 md:mb-0">{children}</main>

                {/* Bottom nav for mobile */}
                <nav className="fixed bottom-0 inset-x-0 bg-white border-t shadow-inner flex justify-around md:hidden z-50">
                    {navItems.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`flex flex-col items-center justify-center text-xs py-2 px-1 ${pathname === href
                                    ? 'text-blue-700'
                                    : 'text-gray-600 hover:text-blue-600'
                                }`}
                        >
                            <Icon size={20} />
                            <span className="mt-1">{label}</span>
                        </Link>
                    ))}
                </nav>
            </div>
        </main>
    );
}
